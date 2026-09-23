/**
 * Kiểm bản build tĩnh trên CHROME THẬT, qua giao thức CDP — gói WBS 4.x, đợt 3.
 *
 * ## Vì sao cần, khi đã có 1290 ca vitest
 *
 * jsdom không có bộ dựng hình. Nó dựng cây DOM và chạy được mọi thứ trong đó, nhưng **mọi phép đo
 * hình học đều trả 0**: `getBoundingClientRect()`, `getBBox()`, chiều rộng chữ. Nên ba lớp lỗi
 * dưới đây đi lọt qua toàn bộ bộ kiểm hiện có mà không ca nào đỏ:
 *
 *   1. **Nhãn tràn khung.** Nhãn chặng của thác nước là tiếng Việt đặt trong lề trái 96 đơn vị
 *      viewBox. "Tổng phải trả" vừa; một chặng dài hơn thì chữ chạy ra ngoài `viewBox` và bị cắt.
 *      Chỉ đo được khi có bộ dựng chữ thật.
 *   2. **Cột âm vẽ ngược chiều.** `Math.min/max` trong `WaterfallChart` đúng hay sai đều cho ra
 *      một `<rect>` hợp lệ; chỉ toạ độ thật mới phân biệt được.
 *   3. **Khối nạp trễ có hiện ra không.** `verify:static` chứng minh khối chuỗi VẮNG trong HTML
 *      tĩnh. Nửa còn lại — bật chế độ Nâng cao thì nó PHẢI hiện — không nơi nào kiểm: jsdom không
 *      chạy `next/dynamic` của bản build, còn `verify:static` chỉ đọc file.
 *
 * ## Không nằm trong `npm run check` và không nằm trong CI
 *
 * Cần một bản build sẵn ở `out/` và cần Chrome trên máy. Đây là cửa kiểm chạy tay trước khi phát
 * hành, cùng nhóm với `verify:static` — chạy `npm run build` rồi `npm run check:chrome`.
 *
 * ## An toàn với Chrome của người dùng
 *
 * Script **tự bật một Chrome riêng** với `--user-data-dir` trong thư mục tạm, và chỉ tắt đúng
 * tiến trình mình đã bật (đóng lịch sự bằng `Browser.close`, hết hạn thì `taskkill` theo PID).
 * Tuyệt đối không tìm-và-diệt theo tên tiến trình: người dùng đang mở Chrome của họ.
 *
 * Máy chủ tĩnh cũng là của riêng script, ở cổng hệ điều hành tự cấp — không đụng 3000 của
 * `next dev` cũng không đụng 4173 của `npm run preview`, nên service worker của bản build không
 * bao giờ ghi đè phạm vi của hai cổng kia.
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve, sep } from 'node:path';

const ROOT = 'out';

if (!existsSync(ROOT)) {
  console.error(`Không thấy thư mục ${ROOT}/ — chạy \`npm run build\` trước.`);
  process.exit(1);
}

/* ── Máy chủ tĩnh ────────────────────────────────────────────────────────── */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const BASE = resolve(ROOT);

/**
 * Công tắc "mất mạng" cho phép kiểm service worker ở cuối file. Bật lên thì máy chủ cắt socket của
 * mọi request — `fetch()` bên trong service worker ném lỗi y như lúc điện thoại chưa bắt được sóng.
 * Phải cắt ở ĐÂY chứ không dùng `Network.emulateNetworkConditions` của CDP: lệnh ấy chỉ chặn
 * request của trang, còn `fetch()` trong service worker vẫn đi tới máy chủ như thường (đã đo).
 */
let matMang = false;

const server = createServer((req, res) => {
  if (matMang) {
    req.socket.destroy();
    return;
  }

  const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  // `trailingSlash: true` nên mọi trang là <đường dẫn>/index.html.
  const rel = path.endsWith('/') ? `${path}index.html` : path;
  const file = resolve(join(BASE, normalize(rel)));

  // Chặn thoát ra ngoài out/ — script chạy tay nhưng vẫn không mở cửa đọc cả ổ đĩa.
  if (file !== BASE && !file.startsWith(BASE + sep)) {
    res.writeHead(403).end();
    return;
  }
  if (!existsSync(file)) {
    res.writeHead(404).end('404');
    return;
  }

  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});

await new Promise((done) => server.listen(0, '127.0.0.1', done));
const ORIGIN = `http://127.0.0.1:${String(server.address().port)}`;

/* ── Chrome ──────────────────────────────────────────────────────────────── */

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    `${process.env.ProgramFiles ?? ''}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env['ProgramFiles(x86)'] ?? ''}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env.LOCALAPPDATA ?? ''}\\Google\\Chrome\\Application\\chrome.exe`,
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  return candidates.find((path) => path !== undefined && path !== '' && existsSync(path));
}

const chromePath = findChrome();
if (chromePath === undefined) {
  console.error('Không tìm thấy Chrome. Đặt biến môi trường CHROME_PATH trỏ tới chrome.exe.');
  server.close();
  process.exit(1);
}

const profile = mkdtempSync(join(tmpdir(), 'ffb-chrome-'));

const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    // Cổng 0: Chrome tự chọn rồi ghi vào DevToolsActivePort — không phải đoán cổng trống.
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

/** Chỉ tắt đúng tiến trình mình bật. KHÔNG bao giờ diệt theo tên — Chrome của người dùng đang chạy. */
function killOwnChrome() {
  if (chrome.exitCode !== null) return;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    chrome.kill('SIGKILL');
  }
}

async function devtoolsPort() {
  const portFile = join(profile, 'DevToolsActivePort');
  for (let tries = 0; tries < 100; tries += 1) {
    if (existsSync(portFile)) {
      const [line] = readFileSync(portFile, 'utf8').split('\n');
      if (line !== undefined && line.trim() !== '') return Number(line.trim());
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Chrome không mở được cổng gỡ lỗi sau 10 giây.');
}

const port = await devtoolsPort();

/* ── Nối CDP ─────────────────────────────────────────────────────────────── */

const targets = await (await fetch(`http://127.0.0.1:${String(port)}/json/list`)).json();
const target =
  targets.find((t) => t.type === 'page') ??
  (await (await fetch(`http://127.0.0.1:${String(port)}/json/new?about:blank`)).json());

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((open, fail) => {
  ws.onopen = open;
  ws.onerror = fail;
});

let nextId = 0;
const pending = new Map();
/** Mọi thứ Chrome kêu ra console, gom lại để kiểm ở cuối mỗi trang. */
let noise = [];

ws.onmessage = (raw) => {
  const msg = JSON.parse(raw.data);
  if (msg.id !== undefined) {
    pending.get(msg.id)?.(msg);
    pending.delete(msg.id);
    return;
  }
  if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
    noise.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
  }
  if (msg.method === 'Log.entryAdded' && ['error', 'warning'].includes(msg.params.entry.level)) {
    noise.push(msg.params.entry.text);
  }
};

function send(method, params = {}) {
  const id = (nextId += 1);
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((done) => pending.set(id, done));
}

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.result?.exceptionDetails !== undefined) {
    throw new Error(JSON.stringify(res.result.exceptionDetails.exception?.description ?? ''));
  }
  return res.result?.result?.value;
}

await send('Runtime.enable');
await send('Page.enable');
await send('Log.enable');
// Khổ điện thoại nhỏ nhất sản phẩm hứa đỡ được (NFR-USA-01) — chỗ nhãn dễ tràn nhất.
await send('Emulation.setDeviceMetricsOverride', {
  width: 360,
  height: 780,
  deviceScaleFactor: 2,
  mobile: true,
});

async function open(path) {
  noise = [];
  await send('Page.navigate', { url: `${ORIGIN}${path}` });
  // Chờ React gắn xong: khối kết quả chỉ có sau hydrate.
  await waitFor("document.readyState === 'complete'");
  await new Promise((r) => setTimeout(r, 600));
}

async function waitFor(expression, timeoutMs = 8000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    if ((await evaluate(`Boolean(${expression})`)) === true) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Chờ quá ${String(timeoutMs)}ms: ${expression}`);
}

/* ── Ghi kết quả ─────────────────────────────────────────────────────────── */

const checks = [];
function check(name, pass, detail = '') {
  checks.push({ name, pass });
  console.log(`${pass ? 'OK  ' : 'HỎNG'} ${name}${detail === '' ? '' : ` — ${detail}`}`);
}

/**
 * Trả máy về trạng thái cũ. Chạy trong `finally` chứ không chạy ở cuối luồng thẳng: một phép kiểm
 * ném lỗi giữa chừng mà bỏ qua chỗ này là để lại một Chrome không ai tắt, và lần chạy sau lại thêm
 * một cái nữa.
 */
/**
 * Đọc hình thác nước đang hiện: khung, các cột, và các nhãn nằm trong LỀ TRÁI.
 *
 * Lọc `right <= 100` để chỉ lấy nhãn chặng: lề trái rộng 96 đơn vị, nên mọi thứ kết thúc trước
 * mốc 100 là nhãn chặng, còn nhãn vạch trục và tiêu đề trục nằm bên phải hoặc dưới đáy.
 *
 * PHẢI cuộn tới biểu đồ trước khi đo. Khối Biểu đồ mang `content-visibility: auto`, nên khi nó
 * còn nằm dưới nếp gấp thì trình duyệt KHÔNG dựng hình bên trong: `getBBox()` trả về toàn số 0 và
 * phép kiểm "nhãn chặng không tràn khung" xanh một cách vô nghĩa (x = 0 thì không bao giờ < 0).
 * Đúng lớp lỗi mà cả script này sinh ra để bắt, nên chỗ cuộn là bắt buộc chứ không phải tiện tay.
 */
function docThacNuoc() {
  return evaluate(`(async () => {
  const svg = [...document.querySelectorAll('svg')].find((s) => s.querySelectorAll('rect').length >= 3);
  if (!svg) return { found: false };

  svg.scrollIntoView({ block: 'center' });
  // Hai khung hình: một để trình duyệt bỏ cờ "bỏ qua dựng hình", một để dựng xong rồi mới đo.
  await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
  const box = svg.viewBox.baseVal;
  const labels = [...svg.querySelectorAll('text')]
    .map((t) => ({ text: t.textContent, x: t.getBBox().x, right: t.getBBox().x + t.getBBox().width }))
    .filter((l) => l.text && l.right <= 100);
  const rects = [...svg.querySelectorAll('rect')]
    // Bỏ vùng bắt sự kiện: nó cũng là <rect> nhưng phủ kín khung, nên để lẫn vào thì phép kiểm
    // "không cột nào bẹp" có thêm một cột rộng 320 luôn đạt, và số cột đếm ra thừa một.
    .filter((r) => r.getAttribute('data-testid') === null)
    .map((r) => ({
      x: r.x.baseVal.value,
      w: r.width.baseVal.value,
    }));
  return {
    found: true,
    viewBox: { w: box.width, h: box.height },
    labels,
    rects,
    text: [...svg.querySelectorAll('text')].map((t) => t.textContent),
  };
})()`);
}

async function cleanup() {
  try {
    await send('Browser.close');
  } catch {
    // Đóng lịch sự không được thì mới dùng tới taskkill.
  }
  ws.close();
  killOwnChrome();
  server.close();
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    // Hồ sơ tạm còn bị Chrome giữ vài trăm ms sau khi thoát; để lại cũng không sao.
  }
}

try {
  /* ── 0. Lưới ô nhập thẳng hàng ở khổ 360px ───────────────────────────────── */

  /*
   * Hai ô cùng một hàng phải có khung nhập ngang nhau, kể cả khi nhãn một bên dài gấp đôi bên kia.
   * Đo trên bản build trước khi vá: `pe` ở 360px có nhãn "Giá thị trường" cao 20px và "EPS — lợi
   * nhuận trên mỗi cổ phiếu" cao 39px, hai khung nhập lệch nhau đúng 20px.
   *
   * Chỉ Chrome thật trả lời được: jsdom không dựng bố cục nên không đo được chiều cao, và `subgrid`
   * — thứ đang giữ hàng thẳng — thì jsdom cũng không hiểu. Bản jsdom chỉ giữ được điều kiện CẦN
   * (ô lưới chính là điều khiển, không có div bọc), nằm ở `FormulaDetail.test.tsx`.
   */
  const LECH_HANG = `(() => {
  const luoi = [...document.querySelectorAll('[class*="fields"]')].find((el) => getComputedStyle(el).display === 'grid');
  if (!luoi) return null;

  const o = [...luoi.children].map((el) => {
    const khung = el.querySelector('input')?.closest('div');
    return {
      nhan: (el.querySelector('label')?.textContent ?? '?').trim().slice(0, 24),
      oTop: Math.round(el.getBoundingClientRect().top),
      khungTop: khung ? Math.round(khung.getBoundingClientRect().top) : null,
    };
  });

  const hang = new Map();
  for (const x of o) {
    if (x.khungTop === null) continue;
    const k = String(x.oTop);
    if (!hang.has(k)) hang.set(k, []);
    hang.get(k).push(x);
  }

  const lech = [];
  for (const [, nhom] of hang) {
    if (nhom.length < 2) continue;
    const tops = nhom.map((n) => n.khungTop);
    const d = Math.max(...tops) - Math.min(...tops);
    if (d > 1) lech.push(nhom.map((n) => n.nhan).join(' / ') + ' lệch ' + d + 'px');
  }
  return { soO: o.length, lech };
})()`;

  for (const [slug, viSao] of [
    ['pe', 'nhãn một dòng đứng cạnh nhãn hai dòng'],
    ['loi-nhuan-rong', 'lưới 2×2 của WF-08, nhãn đều một dòng'],
  ]) {
    await open(`/cong-thuc/${slug}/`);
    const hang = await evaluate(LECH_HANG);
    check(
      `${slug}: ô nhập cùng hàng thẳng nhau ở 360px — ${viSao}`,
      hang !== null && hang.lech.length === 0,
      hang === null
        ? 'không thấy lưới ô nhập'
        : (hang.lech[0] ?? `${String(hang.soO)} ô, không ô nào lệch`),
    );
  }

  /* ── 0a3. Bảng màu Tối không nháy qua Sáng khi tải lại ───────────────────── */

  /*
   * Chủ dự án báo: đang ở giao diện Tối mà tải lại toàn trang thì "nháy nhanh qua theme sáng rồi
   * mới chuyển sang theme tối".
   *
   * Đo được, và có HAI nguyên nhân rời nhau — cả hai đã vá:
   *
   *   1. `PreferencesProvider` khởi tạo `prefs` bằng `DEFAULT_PREFERENCES` (`theme: 'light'`) để
   *      lượt render đầu khớp HTML tĩnh, rồi effect ghi `data-theme` chạy ngay lượt mount với
   *      đúng giá trị mặc định ấy — đè lên chữ `'dark'` mà script chặn nháy trong `layout.tsx`
   *      vừa đặt. Vá bằng cửa `hydrated` ở cả hai effect ghi `<html>`.
   *   2. `color-scheme: dark` chỉ sống trong `globals.css`, tức một file NGOÀI; trước khi nó tải
   *      xong thì `<html>` không có `color-scheme` nào và trình duyệt vẽ canvas bằng TRẮNG mặc
   *      định. Vá bằng một luật `@media screen` đặt thẳng trong `<head>` của `layout.tsx`.
   *
   * Chỉ đo được ở đây, không đo được bằng vitest: đã thử một ca jsdom dùng `MutationObserver` ghi
   * lại mọi giá trị `data-theme` từng mang, và nó XANH cả khi gỡ bản vá — `render()` của
   * testing-library gói cả lượt mount trong một `act()` nên hai lượt commit của trình duyệt thật
   * bị nhập làm một, đúng chỗ cái nháy sống. Xem docblock `preferences-context.test.tsx`.
   *
   * Cách đo: cài quan sát viên TRƯỚC mọi script của trang bằng `Page.addScriptToEvaluateOnNewDocument`,
   * ghi lại từng lần `data-theme` đổi, rồi tải lại. Bản hỏng đi qua `'light'` ở giữa; bản đúng thì
   * mọi giá trị nó từng mang đều là `'dark'`.
   */

  const THEME_WATCHER = `
window.__themeLog = [];
(function () {
  function watch() {
    window.__themeLog.push(document.documentElement.getAttribute('data-theme'));
    new MutationObserver(function () {
      window.__themeLog.push(document.documentElement.getAttribute('data-theme'));
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  if (document.documentElement) watch();
  else
    new MutationObserver(function (r, o) {
      if (document.documentElement) {
        o.disconnect();
        watch();
      }
    }).observe(document, { childList: true, subtree: true });
})();`;

  // Ghi lựa chọn Tối vào kho, rồi tải lại với quan sát viên đã cài sẵn.
  await open('/cong-thuc/');
  await evaluate(`localStorage.setItem('ffb.prefs.v1', JSON.stringify({ theme: 'dark' }))`);
  const watcherId = await send('Page.addScriptToEvaluateOnNewDocument', { source: THEME_WATCHER });
  await open('/cong-thuc/');
  // Đợi qua cả lượt hydrate: nguyên nhân 1 chỉ lộ ra sau khi React gắn xong.
  await waitFor(`document.documentElement.dataset.theme === 'dark'`);
  await new Promise((r) => setTimeout(r, 800));

  const daQua = await evaluate('JSON.stringify(window.__themeLog)');
  const buoc = JSON.parse(daQua ?? '[]');
  // Giá trị đầu là `null` khi quan sát viên chạy trước cả script chặn nháy — đó là bình thường.
  const nhay = buoc.filter((value) => value !== null && value !== 'dark');
  check(
    'giao diện Tối: tải lại không nháy qua bảng Sáng',
    nhay.length === 0,
    nhay.length === 0
      ? `data-theme đi qua ${JSON.stringify(buoc)}`
      : `nháy qua ${JSON.stringify(nhay)} — chuỗi đầy đủ ${JSON.stringify(buoc)}`,
  );

  const colorScheme = await evaluate(`getComputedStyle(document.documentElement).colorScheme`);
  check(
    'giao diện Tối: color-scheme là dark, để canvas không trắng trước khi CSS tới',
    colorScheme === 'dark',
    `đọc được "${String(colorScheme)}"`,
  );

  // Trả máy về Sáng cho các phép kiểm sau, và gỡ quan sát viên.
  await send('Page.removeScriptToEvaluateOnNewDocument', {
    identifier: watcherId.result?.identifier ?? watcherId.identifier,
  });
  await evaluate(`localStorage.removeItem('ffb.prefs.v1')`);
  await open('/cong-thuc/');

  /* ── 0a2. Khối Công thức không có thanh cuộn dọc ẩn ──────────────────────── */

  /*
   * Chủ dự án chụp màn `ev-ebitda`: khung ký hiệu toán có hai nút mũi tên lên/xuống ở mép phải,
   * y hệt một thanh cuộn dọc kiểu Windows cũ, dù không có gì đáng để cuộn.
   *
   * Gốc lỗi nằm ở CSS, không phải ở KaTeX: `.formula` trong `FormulaDetail.module.css` chỉ khai
   * `overflow-x: auto` để cuộn NGANG cho công thức dài (NFR-USA-02), nhưng bỏ trống
   * `overflow-y`. Theo đúng đặc tả CSS, một trục khác `visible` mà trục kia bỏ mặc định thì trình
   * duyệt tự đổi trục còn lại thành `auto` — không phải `visible` như người viết tưởng. Khung này
   * không có chiều cao cố định nên chẳng bao giờ THẬT SỰ cần cuộn dọc, nhưng chỉ cần nội dung lệch
   * 1px so với khung do làm tròn subpixel (rất hay gặp ở Windows chia tỷ lệ 125%/150%) là thanh
   * cuộn dọc ấy vẫn hiện ra, kèm hai nút mũi tên của thanh cuộn kiểu cũ.
   *
   * Chỉ đo được ở đây. jsdom không tính style từ CSS Module — `getComputedStyle` trong ca vitest sẽ
   * luôn trả `overflowY: 'visible'` bất kể `FormulaDetail.module.css` viết gì, nên một ca kiểm ở đó
   * xanh mà không chứng minh được gì. Đo giá trị COMPUTED chứ không đo `scrollHeight`: kích thước
   * thật phụ thuộc font hệ điều hành và tỉ lệ màn hình của từng máy, còn `overflow-y` thì đúng hoặc
   * sai không phụ thuộc máy nào.
   *
   * `.katex` là mốc chắc chắn: KaTeX luôn bọc kết quả trong `<span class="katex">`, bất kể
   * `output: 'mathml'` hay không — cha trực tiếp của nó chính là `.formula`, và anh em kế tiếp của
   * `.formula` chính là `.expression` (xem cấu trúc JSX ở `FormulaDetail.tsx`). Không dò theo tên
   * lớp CSS Module vì tên ấy bị băm lúc build.
   */
  await open('/cong-thuc/ev-ebitda/');

  const cuonCongThuc = await evaluate(`(() => {
  const katex = document.querySelector('.katex');
  const formula = katex ? katex.parentElement : null;
  const expression = formula ? formula.nextElementSibling : null;
  if (!formula || !expression) return null;
  return {
    formulaY: getComputedStyle(formula).overflowY,
    expressionX: getComputedStyle(expression).overflowX,
  };
})()`);

  check(
    'khối Công thức khoá cuộn dọc — không còn thanh cuộn ẩn kèm nút mũi tên lên/xuống',
    cuonCongThuc !== null && cuonCongThuc.formulaY === 'hidden',
    cuonCongThuc === null
      ? 'không thấy khối Công thức'
      : `formula overflow-y: ${cuonCongThuc.formulaY}`,
  );

  /*
   * `.expression` (vế công thức dạng chữ) KHÔNG còn nằm trong phép kiểm trên, và đây là chỗ ghi
   * lại vì sao — nó từng bị kiểm cùng `.formula` cho tới 10/09/2026.
   *
   * Chủ dự án chụp XIRR bị cắt cụt kèm thanh cuộn ngang: _"tránh tạo ra scroll ngang khiến dự án
   * khó sử dụng"_. Đo được lúc ấy: 108/111 vế chữ dài quá khung. Bản sửa bỏ hẳn `white-space:
   * nowrap` + `overflow-x` của `.expression` để nó XUỐNG DÒNG. Không còn trục nào khác `visible`
   * thì cái bẫy "trình duyệt tự đổi trục kia thành auto" cũng không còn đường xảy ra, nên
   * `overflow-y: hidden` ở đó thành thừa — và giữ phép kiểm cũ là bắt CSS phải mang một dòng
   * không còn tác dụng gì.
   *
   * Đổi lại kiểm đúng thứ chủ dự án yêu cầu: vế chữ không được cuộn NGANG. `visible` là đạt;
   * `auto`/`scroll` nghĩa là ai đó vừa dựng lại `nowrap`.
   */
  check(
    'vế công thức dạng chữ xuống dòng, không cuộn ngang',
    cuonCongThuc !== null && cuonCongThuc.expressionX === 'visible',
    cuonCongThuc === null
      ? 'không thấy khối Công thức'
      : `expression overflow-x: ${cuonCongThuc.expressionX}`,
  );

  /*
   * ── Hình nhiều vế: mỗi vế một DÒNG (18/09/2026) ────────────────────────────────────────────
   *
   * Chủ dự án bác bản nối hai vế bằng dấu phẩy: *"cần xuống dòng giải thích công thức thứ 2 …
   * cần xử lý khoa học hơn"*. Việc xuống dòng do CSS lo (`.expressionLine { display: block }` và
   * lưới một cột của `.expression:not([data-lines='1'])`), mà jsdom không tính CSS Module — nên
   * đây là chỗ DUY NHẤT trả lời được "trên màn có xuống dòng thật không", và cũng là chỗ duy nhất
   * đo được thụt dòng treo.
   *
   * `DOC_VE_CHU` trả về khối của từng vế, cộng mép trái của TỪNG DÒNG CHỮ trong vế thứ nhất — vế ấy
   * dài 143 ký tự nên ở khổ 360 chắc chắn vắt dòng, và dòng thứ hai chính là phần vắt tiếp.
   *
   * Đo bằng `Range`, KHÔNG bằng `ve[0].getClientRects()`: `[data-eq]` mang `display: block` (và còn
   * là ô của lưới), mà một phần tử block chỉ sinh MỘT mảnh hộp, nên `getClientRects()` của nó luôn
   * trả đúng một hình chữ nhật dù bên trong chữ vắt mấy dòng — đo kiểu ấy thì phép kiểm không bao
   * giờ xanh được. `Range` phủ nội dung thì trả một hình chữ nhật cho mỗi DÒNG CHỮ. Phải gom theo
   * `top` rồi lấy mép trái nhỏ nhất: các `<span>` cụm chữ bên trong sinh thêm hình chữ nhật trên
   * cùng một dòng.
   */
  const DOC_VE_CHU = `(() => {
  const katex = document.querySelector('.katex');
  const p = katex ? katex.parentElement.nextElementSibling : null;
  if (!p) return null;
  const r = (el) => { const b = el.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right) }; };
  const ve = [...p.querySelectorAll('[data-eq]')];
  let hang = [];
  if (ve.length > 0) {
    const rg = document.createRange();
    rg.selectNodeContents(ve[0]);
    const theoDong = new Map();
    for (const b of rg.getClientRects()) {
      if (b.width === 0 && b.height === 0) continue;
      const key = Math.round(b.top);
      const cu = theoDong.get(key);
      const left = Math.round(b.left);
      theoDong.set(key, cu === undefined ? left : Math.min(cu, left));
    }
    hang = [...theoDong.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
  }
  return {
    soVe: ve.length,
    lines: p.getAttribute('data-lines'),
    canLe: getComputedStyle(p).textAlign,
    p: r(p),
    ve: ve.map(r),
    hang,
  };
})()`;

  const veMotKhoi = await evaluate(DOC_VE_CHU);
  check(
    'công thức một vế giữ nguyên: một khối chữ, vẫn canh giữa',
    veMotKhoi !== null &&
      veMotKhoi.soVe === 1 &&
      veMotKhoi.lines === '1' &&
      veMotKhoi.canLe === 'center',
    JSON.stringify(veMotKhoi === null ? null : { soVe: veMotKhoi.soVe, canLe: veMotKhoi.canLe }),
  );

  await open('/cong-thuc/ty-so-sortino/');
  const veHaiKhoi = await evaluate(DOC_VE_CHU);
  check(
    'Điện thoại 360 · hình hai vế thì chữ thành hai dòng, chung mép trái, không tràn thẻ',
    veHaiKhoi !== null &&
      veHaiKhoi.soVe === 2 &&
      veHaiKhoi.ve[1].top >= veHaiKhoi.ve[0].bottom - 1 &&
      Math.abs(veHaiKhoi.ve[0].left - veHaiKhoi.ve[1].left) <= 1 &&
      veHaiKhoi.ve.every((v) => v.left >= veHaiKhoi.p.left - 1 && v.right <= veHaiKhoi.p.right + 1),
    JSON.stringify(veHaiKhoi),
  );
  check(
    'Điện thoại 360 · dòng vắt tiếp thụt vào, nên nhìn ra đâu là chỗ mở vế mới',
    veHaiKhoi !== null && veHaiKhoi.hang.length >= 2 && veHaiKhoi.hang[1] > veHaiKhoi.hang[0],
    JSON.stringify(veHaiKhoi === null ? null : veHaiKhoi.hang),
  );

  /*
   * ── Bảng ký hiệu "A: là gì" (16/09/2026) — bên PHẢI hình ở khổ PC, DƯỚI dòng chữ ở khổ điện thoại ──
   *
   * Bố cục là grid hai cột từ 1024px; jsdom không dựng grid nên chỉ Chrome thật trả lời được "nó
   * có thật sự đứng bên phải không". Đo trên `chuoi-phien-giam-dai-nhat` — chính hình chủ dự án
   * chỉ vào. `<dl>` tìm theo aria-label vì tên lớp CSS Module bị băm.
   */
  const DOC_BANG_KY_HIEU = `(() => {
  const katex = document.querySelector('.katex');
  const formula = katex ? katex.parentElement : null;
  const expression = formula ? formula.nextElementSibling : null;
  const bang = document.querySelector('dl[aria-label="Ký hiệu trong công thức"]');
  if (!formula || !expression || !bang) return null;
  const r = (el) => { const b = el.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right) }; };
  return {
    formula: r(formula), expression: r(expression), bang: r(bang),
    soKyHieu: bang.querySelectorAll('dt').length,
    dtCoMath: [...bang.querySelectorAll('dt')].every((dt) => dt.querySelector('math') !== null),
    tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  };
})()`;

  await open('/cong-thuc/chuoi-phien-giam-dai-nhat/');
  const bangDt = await evaluate(DOC_BANG_KY_HIEU);
  check(
    'Điện thoại 360 · bảng ký hiệu nằm DƯỚI dòng chữ, đủ ký hiệu, mỗi ký hiệu là MathML, không tràn ngang',
    bangDt !== null &&
      bangDt.bang.top >= bangDt.expression.bottom &&
      bangDt.soKyHieu >= 3 &&
      bangDt.dtCoMath === true &&
      bangDt.tran === false,
    bangDt === null ? 'không thấy bảng ký hiệu' : JSON.stringify(bangDt),
  );

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await open('/cong-thuc/chuoi-phien-giam-dai-nhat/');
  const bangPc = await evaluate(DOC_BANG_KY_HIEU);
  /*
   * Hai nửa căn GIỮA theo chiều dọc, không còn cùng mép trên (17/09/2026): khi nửa trái neo mép trên,
   * chủ dự án báo công thức "ít không gian bên trên hơn bên dưới". Nửa trái chạy từ mép trên hình tới
   * mép dưới dòng chữ; tâm của nó phải trùng tâm bảng, lệch tối đa 2px vì làm tròn.
   */
  check(
    'PC 1440 · bảng ký hiệu đứng BÊN PHẢI hình công thức, hai nửa căn giữa theo chiều dọc',
    bangPc !== null &&
      bangPc.bang.left >= bangPc.formula.right &&
      Math.abs(
        (bangPc.formula.top + bangPc.expression.bottom) / 2 -
          (bangPc.bang.top + bangPc.bang.bottom) / 2,
      ) <= 2,
    bangPc === null ? 'không thấy bảng ký hiệu' : JSON.stringify(bangPc),
  );

  /*
   * ── Khung "cách tính" (17/09/2026) — rê chuột ở PC, chạm ở điện thoại ─────────────────────────
   *
   * jsdom gác hành vi (mở, đóng, ghim); chỉ Chrome thật trả lời được ba câu còn lại: khung có nằm
   * TRỌN trong màn không, ký hiệu có sáng lên thật ở cả ba chỗ không (CSS của MathML), và thẻ có xê
   * dịch khi khung mở không. Rê chuột bằng `Input.dispatchMouseEvent` — con trỏ thật, nên `pointerType`
   * là "mouse" như người dùng.
   */
  /*
   * Thẻ tìm theo chuỗi cha của `.katex` (hình → nửa trái → thẻ), không theo tên lớp CSS Module (bị
   * băm) và không theo cha của `<dl>`: từ khi có nút ẩn bảng ký hiệu, `<dl>` nằm trong một khối bọc.
   */
  const DOC_KHUNG = `(() => {
  const card = document.querySelector('.katex')?.parentElement?.parentElement?.parentElement ?? null;
  const bang = document.querySelector('dl[aria-label="Ký hiệu trong công thức"]');
  const nutAn = bang ? document.querySelector('button[aria-controls="' + bang.id + '"]') : null;
  const panel = document.querySelector('[role="group"][id^="cach-tinh-"]');
  const r = (el) => { const b = el.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right), width: Math.round(b.width), height: Math.round(b.height) }; };
  const active = card?.getAttribute('data-active');
  const sang = active == null ? [] : [...card.querySelectorAll('[data-sym="' + active + '"]')].filter((el) => getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)').map((el) => el.tagName.toLowerCase());
  return {
    card: card ? r(card) : null,
    panel: panel ? r(panel) : null,
    bangHien: bang ? getComputedStyle(bang).display !== 'none' : null,
    nutAnHien: nutAn ? getComputedStyle(nutAn).display !== 'none' : null,
    nutAn: nutAn && getComputedStyle(nutAn).display !== 'none' ? r(nutAn) : null,
    vw: window.innerWidth, vh: window.innerHeight,
    sang,
    tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  };
})()`;

  async function reChuot(x, y) {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  }

  await open('/cong-thuc/ty-so-sharpe/');
  const diemCham = await evaluate(`(() => {
  const el = document.querySelector('math [data-sym]');
  if (!el) return null;
  el.scrollIntoView({ block: 'center' });
  const b = el.getBoundingClientRect();
  return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) };
})()`);
  const truocKhiMo = await evaluate(DOC_KHUNG);
  if (diemCham !== null) await reChuot(diemCham.x, diemCham.y);
  await new Promise((r) => setTimeout(r, 400));
  const khiMo = await evaluate(DOC_KHUNG);

  check(
    'PC 1440 · rê chuột vào ký hiệu trong hình thì khung cách tính mở, nằm trọn trong màn',
    diemCham !== null &&
      khiMo.panel !== null &&
      khiMo.panel.left >= 0 &&
      khiMo.panel.right <= khiMo.vw &&
      khiMo.panel.top >= 0 &&
      khiMo.panel.bottom <= khiMo.vh,
    JSON.stringify({ diemCham, panel: khiMo.panel }),
  );
  check(
    'PC 1440 · ký hiệu đang mở sáng lên ở cả hình, dòng chữ và bảng ký hiệu',
    khiMo.sang.includes('span') && khiMo.sang.includes('button') && khiMo.sang.length >= 3,
    khiMo.sang.join(', '),
  );
  check(
    'PC 1440 · mở khung không làm thẻ Công thức xê dịch hay đổi kích thước',
    truocKhiMo.card !== null &&
      khiMo.card !== null &&
      truocKhiMo.card.width === khiMo.card.width &&
      truocKhiMo.card.height === khiMo.card.height &&
      truocKhiMo.card.top === khiMo.card.top,
    JSON.stringify({ truoc: truocKhiMo.card, sau: khiMo.card }),
  );

  await reChuot(5, 5);
  await new Promise((r) => setTimeout(r, 500));
  const khiRoi = await evaluate(DOC_KHUNG);
  check('PC 1440 · rời chuột thì khung tắt', khiRoi.panel === null);
  /*
   * Nút ẩn bảng ký hiệu chỉ dành cho khổ điện thoại (17/09/2026): ở PC bảng đứng cạnh hình, không đẩy
   * gì xuống, nên nút phải biến mất và bảng phải hiện.
   */
  check(
    'PC 1440 · không có nút ẩn bảng ký hiệu, bảng luôn hiện',
    khiRoi.nutAnHien === false && khiRoi.bangHien === true,
    JSON.stringify({ nutAnHien: khiRoi.nutAnHien, bangHien: khiRoi.bangHien }),
  );
  check(
    'trang ty-so-sharpe không kêu lỗi hay cảnh báo nào ra console',
    noise.length === 0,
    noise[0] ?? '',
  );

  /*
   * Ở PC thẻ là lưới hai cột `minmax(0, 3fr) minmax(0, 2fr)`, nên dòng chữ sống trong một cột HẸP
   * HƠN bề ngang màn. Đây là chỗ bắt được một cách dựng chỉ bẻ dòng theo bề ngang khung nhìn: hai
   * vế vẫn phải là hai khối xếp dọc, nằm trọn trong nửa trái, không đè lên bảng ký hiệu.
   */
  await open('/cong-thuc/ty-so-sortino/');
  const vePc = await evaluate(DOC_VE_CHU);
  check(
    'PC 1440 · hình hai vế: chữ vẫn hai khối xếp dọc, nằm gọn trong nửa trái của thẻ',
    vePc !== null &&
      vePc.soVe === 2 &&
      vePc.ve[1].top >= vePc.ve[0].bottom - 1 &&
      vePc.ve.every((v) => v.right <= vePc.p.right + 1),
    JSON.stringify(vePc),
  );

  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 780,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await open('/cong-thuc/ty-so-sharpe/');
  await evaluate(`(() => {
  const nut = document.querySelector('dl button[data-sym]');
  nut?.scrollIntoView({ block: 'center' });
  nut?.click();
})()`);
  await new Promise((r) => setTimeout(r, 300));
  const chamMo = await evaluate(DOC_KHUNG);
  check(
    'Điện thoại 360 · chạm dòng bảng ký hiệu thì khung mở, nằm trong 0–360, trang không tràn ngang',
    chamMo.panel !== null &&
      chamMo.panel.left >= 0 &&
      chamMo.panel.right <= 360 &&
      chamMo.tran === false,
    JSON.stringify(chamMo.panel),
  );

  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
  await new Promise((r) => setTimeout(r, 200));
  const sauEsc = await evaluate(DOC_KHUNG);

  await evaluate(`document.querySelector('dl button[data-sym]')?.click()`);
  await new Promise((r) => setTimeout(r, 200));
  await evaluate(
    `document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }))`,
  );
  await new Promise((r) => setTimeout(r, 200));
  const sauChamNgoai = await evaluate(DOC_KHUNG);
  check(
    'Điện thoại 360 · Esc đóng khung, chạm ra ngoài cũng đóng khung',
    sauEsc.panel === null && sauChamNgoai.panel === null,
    JSON.stringify({ sauEsc: sauEsc.panel, sauChamNgoai: sauChamNgoai.panel }),
  );

  /*
   * Nút ẩn bảng ký hiệu ở khổ điện thoại: nằm góc dưới bên PHẢI thẻ, bấm thì bảng ẩn thật (`display:
   * none` từ CSS, thứ jsdom không đo được) và thẻ ngắn lại, bấm lần nữa thì bảng về.
   */
  const truocAn = await evaluate(DOC_KHUNG);
  await evaluate(`(() => {
  const bang = document.querySelector('dl[aria-label="Ký hiệu trong công thức"]');
  document.querySelector('button[aria-controls="' + bang.id + '"]')?.click();
})()`);
  await new Promise((r) => setTimeout(r, 200));
  const sauAn = await evaluate(DOC_KHUNG);
  check(
    'Điện thoại 360 · nút ẩn bảng ký hiệu nằm góc dưới bên phải thẻ, bấm thì bảng ẩn và thẻ ngắn lại',
    truocAn.nutAn !== null &&
      truocAn.card !== null &&
      truocAn.nutAn.right >= truocAn.card.right - 24 &&
      truocAn.nutAn.bottom >= truocAn.card.bottom - 24 &&
      sauAn.bangHien === false &&
      sauAn.card !== null &&
      sauAn.card.height < truocAn.card.height,
    JSON.stringify({ nut: truocAn.nutAn, the: truocAn.card, bangHien: sauAn.bangHien }),
  );
  await evaluate(`(() => {
  const bang = document.querySelector('dl[aria-label="Ký hiệu trong công thức"]');
  document.querySelector('button[aria-controls="' + bang.id + '"]')?.click();
})()`);
  await new Promise((r) => setTimeout(r, 200));
  const sauHien = await evaluate(DOC_KHUNG);
  check('Điện thoại 360 · bấm lần nữa thì bảng ký hiệu hiện lại', sauHien.bangHien === true);

  /* ── 0b. Khối dưới nếp gấp thật sự được hoãn dựng hình ───────────────────── */

  /*
   * Năm khối dưới nếp gấp mang `content-visibility: auto` để trình duyệt bỏ qua phần dựng hình của
   * chúng ở lượt đầu. Đo A/B trên chính bản build này (Chrome thật, 360×780, CPU hãm ×4): bấm từ
   * Trang chủ sang màn chi tiết khoá luồng chính **491 ms**, còn **310 ms** sau khi bật — và tắt
   * lại bằng một dòng CSS đè thì con số quay về ~467 ms.
   *
   * Phép kiểm ở đây gác **thuộc tính tính toán**, không gác con số thời gian: thời gian thì máy nào
   * đo cũng khác, còn `contentVisibility` thì đúng hoặc sai. jsdom không làm được phần này — nó
   * không có bộ tính style từ CSS Module, nên bản jsdom trong `FormulaDetail.test.tsx` chỉ soi được
   * cái LỚP có gắn hay không, chứ không biết quy tắc CSS có thật sự tới được phần tử hay không.
   *
   * KHÔNG kiểm bằng chiều cao. Đã thử và nó sai: `content-visibility: auto` chỉ đẩy việc dựng hình
   * ra khỏi đường găng, rồi Chrome vẫn dựng nốt lúc rảnh — nên đo sau khi trang đã yên thì mọi khối
   * đều cao thật, và một phép kiểm "phải cao 0" sẽ xanh/đỏ tuỳ nhịp máy.
   */
  await open('/cong-thuc/pe/');

  const hoan = await evaluate(`(async () => {
  const khoi = [...document.querySelectorAll('section, table')].filter((el) => getComputedStyle(el).contentVisibility === 'auto');
  const soLieu = [...document.querySelectorAll('section')].find((s) => s.getAttribute('aria-labelledby') === 'khoi-so-lieu');

  const giaiThich = [...document.querySelectorAll('section')].find((s) => s.querySelectorAll('details').length >= 4);
  if (!giaiThich) return null;
  giaiThich.scrollIntoView({ block: 'center' });
  await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));

  return {
    hoan: khoi.map((el) => el.querySelector('h2')?.textContent ?? el.tagName),
    soLieuCv: soLieu ? getComputedStyle(soLieu).contentVisibility : null,
    caoMuc: [...giaiThich.querySelectorAll('details')].map((d) => Math.round(d.getBoundingClientRect().height)),
  };
})()`);

  check(
    'đúng năm khối dưới nếp gấp được hoãn dựng hình, khối Số liệu thì không',
    hoan !== null && hoan.hoan.length === 5 && hoan.soLieuCv === 'visible',
    hoan === null ? 'không thấy khối Giải thích' : `hoãn: ${hoan.hoan.join(' · ')}`,
  );

  check(
    'cuộn tới thì khối Giải thích dựng đủ bốn mục, không mất chữ',
    hoan !== null && hoan.caoMuc.length === 4 && hoan.caoMuc.every((h) => h > 0),
    hoan === null ? '' : `cao: ${hoan.caoMuc.join(' · ')}`,
  );

  /* ── 0c. Bản in vẫn đúng sau khi sheet Xuất chuyển sang dựng-khi-mở ──────── */

  /*
   * `@media print` trong `globals.css` ẩn TOÀN BỘ trang rồi bật lại đúng `.print-region`. Vùng in
   * ấy nằm trong `ExportSheet`, mà sheet nay chỉ dựng từ lần mở đầu tiên — nên luật ẩn phải kèm
   * điều kiện `:has(.print-region)`, và điều kiện ấy phải bọc `:where()` để không cộng độ ưu tiên.
   *
   * Cả hai chiều đều đã hỏng thật trong lúc làm gói này, nên cả hai đều phải có phép kiểm: thiếu
   * điều kiện thì Ctrl+P lúc chưa mở sheet in ra tờ trắng; thiếu `:where()` thì Ctrl+P lúc ĐÃ mở
   * sheet cũng in ra tờ trắng. Không cửa kiểm nào khác thấy được — jsdom không có `@media print`,
   * còn `verify:static` chỉ đọc file chứ không tính style.
   */
  await open('/cong-thuc/pe/');

  await send('Emulation.setEmulatedMedia', { media: 'print' });
  const inKhiChuaMo = await evaluate(
    `({ vungIn: Boolean(document.querySelector('.print-region')), tieuDe: getComputedStyle(document.querySelector('h1')).visibility })`,
  );
  check(
    'chưa mở sheet Xuất mà bấm in thì trang vẫn in ra được, không phải tờ trắng',
    inKhiChuaMo.vungIn === false && inKhiChuaMo.tieuDe === 'visible',
    `vùng in: ${String(inKhiChuaMo.vungIn)} · tiêu đề: ${inKhiChuaMo.tieuDe}`,
  );

  await send('Emulation.setEmulatedMedia', { media: 'screen' });
  /*
   * Nút mở sheet là `detail.download` — "Tải về". KHÔNG dò theo /Xuất/ nữa: nhãn nút đổi từ
   * '↓ Xuất' sang 'Tải về' ở commit d93d480 (mũi tên nay là icon thật), và chuỗi "Xuất" chỉ còn
   * nằm trên hai nút BÊN TRONG sheet ('Xuất PDF' / 'Xuất PNG') cùng tiêu đề sheet — tức phép dò cũ
   * không tìm thấy gì, `waitFor` dưới đây hết giờ và cả script chết đứng, bỏ luôn mọi phép kiểm
   * phía sau. Dò đúng nhãn nút mở, và báo lỗi ngay tại chỗ nếu không thấy.
   */
  const moSheetXuat = await evaluate(
    `(() => { const b = [...document.querySelectorAll('button')].find((x) => /Tải về/.test(x.textContent ?? '')); if (!b) return false; b.click(); return true; })()`,
  );
  check(
    'màn chi tiết có nút mở sheet Xuất',
    moSheetXuat === true,
    `tìm thấy nút: ${String(moSheetXuat)}`,
  );
  await waitFor("document.querySelector('.print-region')");
  await send('Emulation.setEmulatedMedia', { media: 'print' });
  const inKhiDaMo = await evaluate(
    `({ vungIn: getComputedStyle(document.querySelector('.print-region')).visibility, tieuDe: getComputedStyle(document.querySelector('h1')).visibility })`,
  );
  check(
    'mở sheet Xuất rồi in thì ra đúng thẻ kết quả, phần còn lại của trang bị ẩn',
    inKhiDaMo.vungIn === 'visible' && inKhiDaMo.tieuDe === 'hidden',
    `vùng in: ${inKhiDaMo.vungIn} · tiêu đề trang: ${inKhiDaMo.tieuDe}`,
  );

  /* ── 0d. Biểu đồ đi vào bản in, và đi kèm bảng màu SÁNG ──────────────────── */

  /*
   * Trước đợt này bản in ra một khung nét đứt kèm câu "biểu đồ sẽ được bổ sung ở bản sau", dù
   * màn hình ngay sau lưng đang vẽ hình. Nay `chart-snapshot.ts` chép hình ấy vào vùng in.
   *
   * Ba điều chỉ Chrome thật mới kiểm được, và cả ba đều là chỗ từng sai:
   *
   * 1. **Bản chép có tới nơi không.** Nó đi qua một `import()` trần rồi một lượt `replaceChildren`
   *    ngoài tầm React — jsdom chạy được phần ấy, nhưng không chứng minh được nó sống sót cùng
   *    `next/dynamic` thật của `FormulaChart`.
   * 2. **Màu.** Đây là lý do phải bật giao diện TỐI trước khi in. Mọi màu trong `chart.module.css`
   *    đi qua token, mà ở bảng tối `--color-ink` là `#e8edf6` — chữ trắng trên giấy trắng. Khối
   *    token chép lại ở `.print-region` là thứ chặn điều đó, và không cửa kiểm nào khác thấy nó:
   *    jsdom không áp CSS, `tokens.test.ts` chỉ đối chiếu được mã màu trong file nguồn.
   * 3. **Luật `:has()` ẩn câu dự phòng.** Cùng lý do — nó là CSS thuần.
   *
   * Hai bản hình đo ở HAI media khác nhau, và đó không phải tiện tay: hình TRÊN TRANG đo ở
   * `screen`, vì lời khẳng định về nó là lời khẳng định về màn hình; hình TRONG BẢN IN đo ở
   * `print`, vì đó mới là lúc luật in có hiệu lực. Đo cả hai ở `print` là điều đã làm lần đầu và
   * nó cho kết quả đánh lừa — Chrome ở chế độ in trả về bảng sáng cho cả hình trên trang, nên
   * phép so "trang vẫn tối" đỏ dù không có gì sai.
   */
  const MAU_CUA = `(goc) => {
    const ra = new Set();
    for (const el of goc.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      ra.add(cs.stroke);
      ra.add(cs.fill);
    }
    return [...ra];
  }`;

  await send('Emulation.setEmulatedMedia', { media: 'screen' });
  await evaluate(`(() => { document.documentElement.dataset.theme = 'dark'; return true; })()`);
  await waitFor("document.querySelector('.print-chart-plot > svg')");

  /*
   * Kéo hình vào tầm nhìn TRƯỚC khi đo, và đây là một cái bẫy đã mất công mới thấy: khối biểu đồ
   * nằm dưới nếp gấp và mang `content-visibility`, nên Chrome BỎ QUA việc tính lại style cho cả
   * cây con ấy. `getComputedStyle` lúc đó vẫn trả về `--color-border` mới (biến thừa kế từ `<html>`
   * nên nó tươi), nhưng `stroke` thì còn là giá trị đã giải cũ — hai con số mâu thuẫn nhau trên
   * cùng một node. Không kéo vào tầm nhìn thì phép đo này nói dối.
   */
  await evaluate(
    `(() => { document.querySelector('svg[data-chart-svg]')?.scrollIntoView(); return true; })()`,
  );
  await new Promise((r) => setTimeout(r, 400));

  const tren = await evaluate(`(() => {
  const el = document.querySelector('svg[data-chart-svg]');
  return { co: Boolean(el), mau: el ? (${MAU_CUA})(el) : [] };
})()`);

  await send('Emulation.setEmulatedMedia', { media: 'print' });

  const hinhIn = await evaluate(`(() => {
  const inRa = document.querySelector('.print-chart-plot > svg');
  const note = document.querySelector('.print-chart-note');

  return {
    co: Boolean(inRa),
    mau: inRa ? (${MAU_CUA})(inRa) : [],
    cauDuPhong: note ? getComputedStyle(note).display : null,
    tuongTac: inRa ? inRa.querySelectorAll('[data-testid$="-hover-capture"]').length : -1,
  };
})()`);

  /*
   * Mã màu của globals.css, dạng Chrome trả về. `--color-accent-vivid` là màu nét đường quét, nên
   * nó là thứ chắc chắn có mặt trong mọi biểu đồ đường; ba màu tối kia là mực, nét nhấn và chữ mờ.
   */
  const SANG_NET = 'rgb(59, 123, 240)'; // --color-accent-vivid bảng sáng (#3b7bf0)
  const TOI = [
    'rgb(91, 155, 255)', // --color-accent-vivid (#5b9bff)
    'rgb(232, 237, 246)', // --color-ink (#e8edf6)
    'rgb(147, 161, 184)', // --color-muted (#93a1b8)
    'rgb(49, 61, 82)', // --color-border (#313d52)
  ];

  check(
    'bản in mang được hình biểu đồ đang hiện trên trang',
    hinhIn.co === true,
    hinhIn.co === true ? 'có <svg> trong vùng in' : 'vùng in vẫn rỗng',
  );

  const dinhMauToi = TOI.filter((mau) => hinhIn.mau.includes(mau));
  check(
    'hình trong bản in dùng bảng SÁNG, dù màn hình đang ở giao diện tối',
    hinhIn.co === true && dinhMauToi.length === 0 && hinhIn.mau.includes(SANG_NET),
    dinhMauToi.length > 0
      ? `dính màu bảng tối: ${dinhMauToi.join(' · ')}`
      : `${String(hinhIn.mau.length)} màu · nét ${SANG_NET}: ${String(hinhIn.mau.includes(SANG_NET))}`,
  );

  check(
    'và hình TRÊN TRANG vẫn theo bảng tối — khối token của vùng in không rò ra ngoài',
    tren.co === true && TOI.some((mau) => tren.mau.includes(mau)),
    `màu trên trang: ${tren.mau.filter((m) => m !== 'none' && !m.startsWith('url')).join(' · ')}`,
  );

  check(
    'câu dự phòng tự ẩn khi khe đã có hình, và bản chép không mang theo vùng bắt sự kiện',
    hinhIn.cauDuPhong === 'none' && hinhIn.tuongTac === 0,
    `câu dự phòng: ${String(hinhIn.cauDuPhong)} · node tương tác còn lại: ${String(hinhIn.tuongTac)}`,
  );

  await send('Emulation.setEmulatedMedia', { media: 'screen' });

  /* ── 0e. Tấm PNG cũng mang hình, không chỉ bản in ────────────────────────── */

  /*
   * Đường PNG khác đường in ở chỗ khó nhất: ảnh nạp qua `<img>` là một tài liệu RIÊNG, không thấy
   * stylesheet của trang, nên `chartSvgUrl()` phải tự gói CSS vào trong file. Nếu bước ấy hỏng thì
   * `chartImage()` reject, `chartForCard()` nuốt lỗi, và tấm thẻ lặng lẽ quay về khung nét đứt như
   * cũ — người dùng không thấy lỗi nào, mà cũng không có biểu đồ. Đúng kiểu hỏng mà chỉ số đo bắt
   * được.
   *
   * Cách đo: rình `toBlob` để lấy CHIỀU CAO canvas, rồi xuất hai lần — một lần bật "Kèm biểu đồ",
   * một lần tắt. Có hình thật thì khung hình cao 420 (trần `CHART_MAX_HEIGHT`), hình hỏng thì rơi
   * về khung dự phòng cao 260, còn tắt hẳn thì 0. Ba mức cách nhau đủ xa để một ngưỡng phân biệt
   * được, và không cần giải mã một pixel nào.
   */
  await evaluate(`(() => {
  window.__caoThe = [];
  const goc = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob = function (...doiSo) {
    window.__caoThe.push(this.height);
    return goc.apply(this, doiSo);
  };
  return true;
})()`);

  /** Bấm một nút theo chữ trên nó, chỉ tìm trong (hoặc ngoài) lớp phủ sheet. */
  const bam = (chu, trongSheet = true) =>
    evaluate(`(() => {
  const nut = [...document.querySelectorAll('button')].filter((b) => ${
    trongSheet ? 'b.closest("dialog")' : '!b.closest("dialog")'
  }).find((b) => /${chu}/.test(b.textContent ?? ''));
  if (!nut) return false;
  nut.click();
  return true;
})()`);

  await bam('^PNG$|PNG');
  await bam('Xuất PNG');
  await waitFor('window.__caoThe.length >= 1');

  // Sheet tự đóng sau khi xuất xong — mở lại rồi tắt "Kèm biểu đồ" để có mốc so sánh.
  await bam('Xuất', false);
  await evaluate(`(() => {
  const congTac = [...document.querySelectorAll('[role="switch"]')][0];
  if (!congTac) return false;
  congTac.click();
  return true;
})()`);
  await bam('Xuất PNG');
  await waitFor('window.__caoThe.length >= 2');

  const caoThe = await evaluate('window.__caoThe');
  const chenh = (caoThe[0] ?? 0) - (caoThe[1] ?? 0);

  check(
    'tấm PNG nhúng được hình thật, không rơi về khung nét đứt',
    chenh > 380,
    `cao khi có hình ${String(caoThe[0])} · khi tắt ${String(caoThe[1])} · chênh ${String(chenh)} (khung dự phòng chỉ chênh ~292)`,
  );

  /* ── 1. Thác nước bóc tách trên màn 360px ────────────────────────────────── */

  await open('/cong-thuc/lich-tra-no/');
  await waitFor("document.querySelector('#chart-lich-tra-no-sweep')");

  /*
   * Đổi ô chọn trục bằng setter gốc của HTMLSelectElement rồi bắn `change`.
   * Gán thẳng `el.value` KHÔNG được: React theo dõi giá trị qua chính setter ấy, gán tắt thì nó coi
   * như không có gì đổi và `onChange` không chạy.
   */
  await evaluate(`(() => {
  const el = document.querySelector('#chart-lich-tra-no-sweep');
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  setter.call(el, '__breakdown');
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
})()`);

  await waitFor("document.querySelectorAll('svg rect').length >= 3");

  const waterfall = await docThacNuoc();

  check('thác nước dựng được trên Chrome thật', waterfall.found === true);

  const tran = (waterfall.labels ?? []).filter((label) => label.x < 0);
  check(
    'nhãn chặng KHÔNG tràn ra ngoài khung ở khổ 360px',
    tran.length === 0,
    tran.length === 0
      ? `${String((waterfall.labels ?? []).length)} nhãn, mép trái gần nhất ${String(
          Math.min(...(waterfall.labels ?? []).map((l) => l.x)).toFixed(1),
        )}`
      : `tràn: ${tran.map((l) => `"${l.text}" ở x=${l.x.toFixed(1)}`).join(', ')}`,
  );

  /*
   * Ngưỡng là `> 1`, KHÔNG phải `>= 1`, và đó là toàn bộ giá trị của phép kiểm này:
   * `WaterfallChart` kẹp sàn bề rộng bằng `Math.max(Math.abs(xTo - xFrom), 1)`, nên `>= 1` là
   * mệnh đề luôn đúng — một cột bẹp hoàn toàn (xFrom === xTo, do thang đo suy biến hay
   * cumulative tính sai) vẫn ra đúng 1 và vẫn báo OK. Đúng bằng sàn nghĩa là đã chạm sàn,
   * tức là bẹp. Bản trước của phép kiểm này viết `>= 1` và vì thế chưa bao giờ đỏ được.
   */
  check(
    'ba cột đều có bề rộng thật, không cột nào bẹp thành vạch',
    (waterfall.rects ?? []).length >= 3 && (waterfall.rects ?? []).every((r) => r.w > 1),
    `bề rộng: ${(waterfall.rects ?? []).map((r) => r.w.toFixed(0)).join(' · ')}`,
  );

  /*
   * Cột "Trừ gốc vay" mang delta ÂM nên phải chạy NGƯỢC: mép phải của nó trùng đỉnh cột trước, thân
   * kéo về bên trái. Vẽ xuôi thì mép trái mới trùng đỉnh cột trước — sai chiều mà hình vẫn "có vẻ ổn".
   */
  const [cot1, cot2] = waterfall.rects ?? [];
  check(
    'cột âm vẽ đúng chiều — thân kéo về bên trái đỉnh cột trước',
    cot1 !== undefined &&
      cot2 !== undefined &&
      Math.abs(cot2.x + cot2.w - (cot1.x + cot1.w)) < 1 &&
      cot2.x < cot1.x + cot1.w,
    cot1 === undefined || cot2 === undefined
      ? 'không đọc được hai cột đầu'
      : `cột 1 hết ở ${(cot1.x + cot1.w).toFixed(1)}, cột 2 chạy ${cot2.x.toFixed(1)}→${(
          cot2.x + cot2.w
        ).toFixed(1)}`,
  );

  check(
    'ba nhãn chặng đúng như Domain dựng',
    ['Tổng phải trả', 'Trừ gốc vay', 'Tổng lãi'].every((label) =>
      (waterfall.text ?? []).includes(label),
    ),
    (waterfall.text ?? []).filter((t) => /[A-Za-zÀ-ỹ]/.test(t ?? '')).join(' · '),
  );

  check(
    'trang bóc tách không kêu lỗi hay cảnh báo nào ra console',
    noise.length === 0,
    noise.slice(0, 2).join(' | '),
  );

  /* ── 1b. Không nhãn SỐ nào tràn ra ngoài viewBox ─────────────────────────── */

  /*
   * Phép kiểm nhãn chặng ngay trên chỉ nhìn MÉP TRÁI của cột nhãn chữ. Nhãn SỐ thì hỏng ở mép
   * phải, và hỏng thật: nhãn vạch cuối của thác nước đặt tại `plotRight = 308` với
   * `textAnchor="middle"`, nên `15.000` của `ev` chạy tới x = 322,6 trên khung 320 — mất đuôi,
   * im lặng, vì `<svg>` gốc mặc định `overflow: hidden`.
   *
   * Chỉ đo được ở đây. jsdom trả 0 cho `getBBox()` nên ca kiểm tương ứng bên `charts.test.tsx`
   * xanh vô nghĩa; còn `chart.test.ts` chỉ đếm được KÝ TỰ, mà ký tự không nói được chữ rơi vào
   * đâu trên khung.
   */
  /*
   * `hovers` là danh sách vị trí (tỉ lệ 0…1 theo bề ngang khung) cần RÊ CHUỘT tới trước khi đo.
   * Rỗng thì chỉ đo trạng thái tĩnh như trước.
   *
   * Có nó vì nhãn vạch dò chỉ tồn tại khi đang rê, mà nó lại là chữ DÀI NHẤT trên hình: hai chuỗi
   * đã kèm đơn vị ghép lại, canh `end` ở nửa phải, nên chuỗi dài thì phần ĐẦU chạy qua mép trái và
   * bị `<svg>` cắt — trên màn còn đúng một mẩu như `'ần'`, mà nhãn cụt đầu vẫn trông như nhãn.
   */
  const doTran = (hovers = []) => `(async () => {
  const nhip = () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
  const svg = [...document.querySelectorAll('figure svg')].find((s) => s.viewBox.baseVal.width >= 300);
  if (!svg) return { found: false };

  svg.scrollIntoView({ block: 'center' });
  await nhip();

  const w = svg.viewBox.baseVal.width;
  const h = svg.viewBox.baseVal.height;
  const dem = () => [...svg.querySelectorAll('text')]
    .filter((t) => (t.textContent ?? '').trim() !== '')
    .map((t) => {
      const b = t.getBBox();
      return {
        text: t.textContent,
        x: +b.x.toFixed(1),
        right: +(b.x + b.width).toFixed(1),
        top: +b.y.toFixed(1),
        bottom: +(b.y + b.height).toFixed(1),
      };
    });

  let labels = dem();
  for (const ti of ${JSON.stringify(hovers)}) {
    const bat = svg.querySelector('[data-testid$="-hover-capture"]');
    if (!bat) return { found: false };
    const khung = svg.getBoundingClientRect();
    bat.dispatchEvent(new PointerEvent('pointermove', {
      pointerType: 'mouse',
      clientX: khung.left + ti * khung.width,
      clientY: khung.top + khung.height / 2,
      bubbles: true,
    }));
    await nhip();
    labels = labels.concat(dem());
  }

  // Nửa đơn vị dung sai: bbox là số thực, chạm đúng mép không phải tràn.
  return {
    found: true,
    w,
    soNhan: labels.length,
    // Mép trái gần nhất — số dự phòng THẬT của lề trái, xem chú thích PAD ở LineChart.tsx.
    lanTrai: labels.length === 0 ? null : Math.min(...labels.map((l) => l.x)),
    // Mép trên gần nhất — số dự phòng của PAD.top, nơi tên trục Y đứng.
    lanTren: labels.length === 0 ? null : Math.min(...labels.map((l) => l.top)),
    tran: labels.filter((l) => l.x < -0.5 || l.right > w + 0.5 || l.top < -0.5 || l.bottom > h + 0.5),
  };
})()`;

  for (const [slug, viSao] of [
    ['ev', 'thác nước, nhãn vạch cuối sát mép phải'],
    ['lich-tra-no', 'đường quét đơn vị ₫ tới hàng tỷ'],
    ['diem-hoa-von', "đơn vị 'sản phẩm', không phải tiền"],
    ['lai-kep', 'nhãn trục X tới 8 chữ số'],
  ]) {
    await open(`/cong-thuc/${slug}/`);
    await waitFor("document.querySelector('figure svg')");
    const kq = await evaluate(doTran());

    check(
      `${slug}: không nhãn nào tràn khỏi viewBox (${viSao})`,
      kq?.found === true && kq.tran.length === 0,
      kq?.found !== true
        ? 'không thấy biểu đồ'
        : kq.tran.length === 0
          ? `${String(kq.soNhan)} nhãn, khung rộng ${String(kq.w)}, mép trái gần nhất ${String(kq.lanTrai)}, mép trên gần nhất ${String(kq.lanTren)}`
          : kq.tran.map((l) => `"${l.text}" x=${String(l.x)}..${String(l.right)}`).join(' | '),
    );
  }

  /*
   * Cùng phép đo, nhưng ĐANG RÊ CHUỘT — ba vị trí trải khắp bề ngang, đủ để đi qua cả ba nước của
   * `floatingLabel()`: bên ưu tiên còn chỗ, phải lật sang bên kia, và không bên nào đủ chỗ.
   *
   * `lai-kep` vì nó chạy tới 35 triệu ₫: nhãn vạch dò của nó không vừa nửa nào của khung, nên đây
   * là công thức duy nhất trong bốn cái trên thật sự ép được luật đặt nhãn.
   */
  await open('/cong-thuc/lai-kep/');
  await waitFor("document.querySelector('figure svg')");
  const keo = await evaluate(doTran([0.15, 0.5, 0.95]));

  check(
    'lai-kep: nhãn vạch dò không tràn khỏi viewBox ở bất kỳ chỗ nào đang rê',
    keo?.found === true && keo.tran.length === 0,
    keo?.found !== true
      ? 'không thấy biểu đồ hoặc vùng bắt sự kiện'
      : keo.tran.length === 0
        ? `${String(keo.soNhan)} nhãn qua 3 vị trí rê, mép trái gần nhất ${String(keo.lanTrai)}`
        : keo.tran.map((l) => `"${l.text}" x=${String(l.x)}..${String(l.right)}`).join(' | '),
  );

  /* ── 2. Hình nhiều chặng nhất, và nó là hình MẶC ĐỊNH ────────────────────── */

  /*
   * `fcff` khai `chartType: 'waterfall'` nên bóc tách hiện ngay khi mở màn — không phải bấm gì.
   * Đây cũng là công thức nhiều chặng nhất (bốn cộng một cột tổng), tức hình cao nhất: chỗ duy
   * nhất kiểm được rằng chiều cao chạy theo số chặng vẫn nằm gọn trong khổ 360px.
   */
  await open('/cong-thuc/fcff/');
  await waitFor("document.querySelectorAll('svg rect').length >= 5");

  const fcff = await docThacNuoc();

  check(
    'fcff bày thác nước NGAY khi mở màn, không phải bấm ô chọn',
    fcff.found === true && (fcff.rects ?? []).length >= 5,
    `${String((fcff.rects ?? []).length)} cột`,
  );

  const tranFcff = (fcff.labels ?? []).filter((label) => label.x < 0);
  check(
    'nhãn bốn chặng của fcff không tràn khung',
    tranFcff.length === 0,
    tranFcff.length === 0
      ? `mép trái gần nhất ${String(Math.min(...(fcff.labels ?? []).map((l) => l.x)).toFixed(1))}`
      : tranFcff.map((l) => `"${l.text}"`).join(', '),
  );

  /*
   * Hình cao theo số chặng: `viewBox` phải cao hơn hình ba chặng, và cả trang vẫn không tràn ngang.
   * Cao mà tràn thì người dùng phải cuộn ngang để đọc một biểu đồ — hỏng đúng lời hứa NFR-USA-01.
   */
  const tranNgang = await evaluate(
    'document.documentElement.scrollWidth > document.documentElement.clientWidth + 1',
  );
  check(
    'hình bốn chặng cao hơn hình ba chặng mà trang vẫn không tràn ngang',
    (fcff.viewBox?.h ?? 0) > (waterfall.viewBox?.h ?? 0) && tranNgang === false,
    `cao ${String(fcff.viewBox?.h ?? 0)} so với ${String(waterfall.viewBox?.h ?? 0)} đơn vị`,
  );

  /*
   * ── Rê chuột THẬT lên hình bóc tách ────────────────────────────────────────────────────────
   *
   * Chủ dự án báo "trỏ vào biểu đồ thì số liệu lúc hiện lúc không". Nguyên nhân và cách sửa nằm ở
   * docblock `WaterfallChart`; bốn ca vitest đã khoá từng nguyên nhân một. Nhưng vitest bắn sự
   * kiện THẲNG vào phần tử nó tự chọn — nó không hề dò xem con trỏ ở toạ độ ấy thật sự rơi trúng
   * node nào. Mà lỗi gốc chính là chuyện đó: nhãn giá trị vẽ đè lên đúng chỗ con trỏ đang đứng và
   * cướp mất sự kiện của cột. Chỉ Chrome thật, với phép dò trúng đích thật, mới trả lời được.
   *
   * Chọn điểm trong LỀ TRÁI (x = 20 < 96): ở đó không có cột nào, chỉ có tên chặng. Cơ chế cũ —
   * bắt sự kiện trên từng cột — không thể nào đạt ca này, nên nó phân biệt được hai bản.
   */
  async function toaDoTrenMan(viewX, viewY) {
    return evaluate(`(async () => {
    const svg = document.querySelector('svg[data-chart-svg]');
    if (!svg) return null;
    svg.scrollIntoView({ block: 'center' });
    await new Promise((d) => requestAnimationFrame(() => requestAnimationFrame(d)));
    const r = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    if (!r.width || !r.height || !vb.width || !vb.height) return null;
    // Cùng phép letterbox của \`preserveAspectRatio="xMidYMid meet"\`, chiều ngược lại.
    const scale = Math.min(r.width / vb.width, r.height / vb.height);
    return {
      x: r.left + (r.width - vb.width * scale) / 2 + ${String(viewX)} * scale,
      y: r.top + (r.height - vb.height * scale) / 2 + ${String(viewY)} * scale,
    };
  })()`);
  }

  const nhanGiaTri = () =>
    evaluate(
      `[...document.querySelectorAll('svg text')]
        .filter((t) => (t.getAttribute('class') ?? '').includes('barValueLabel'))
        .map((t) => t.textContent)`,
    );

  async function reChuotToi(viewX, viewY) {
    const at = await toaDoTrenMan(viewX, viewY);
    if (at === null) return;
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: at.x,
      y: at.y,
      button: 'none',
      buttons: 0,
    });
    await new Promise((r) => setTimeout(r, 120));
  }

  // Tâm hàng thứ hai: PAD.top 8 + ROW 26 + nửa ROW 13 = 47. x = 20 nằm hẳn trong lề trái.
  await reChuotToi(20, 47);
  const nhanKhiTro = await nhanGiaTri();

  check(
    'rê chuột lên hàng của thác nước thì hiện số — kể cả khi con trỏ ở lề trái, ngoài mọi cột',
    Array.isArray(nhanKhiTro) && nhanKhiTro.length === 1,
    `nhãn đang hiện: ${JSON.stringify(nhanKhiTro)}`,
  );

  /*
   * Giữ số cho tới khi RỜI HẲN, đúng lời yêu cầu. Điểm này nằm dưới đáy khung (y = viewBox.h + 40)
   * nên chắc chắn ngoài vùng bắt sự kiện.
   */
  await reChuotToi(20, (fcff.viewBox?.h ?? 0) + 40);
  const nhanKhiRoi = await nhanGiaTri();

  check(
    'rời con trỏ khỏi hình thì số tắt — không dính lại',
    Array.isArray(nhanKhiRoi) && nhanKhiRoi.length === 0,
    `nhãn còn lại: ${JSON.stringify(nhanKhiRoi)}`,
  );

  check('trang fcff không kêu lỗi hay cảnh báo nào ra console', noise.length === 0, noise[0] ?? '');

  /* ── 3. Khối chuỗi WF-04 — nửa còn lại của phép kiểm ở verify:static ─────── */

  await open('/cong-thuc/wacc/');

  const coBan = await evaluate("Boolean(document.querySelector('#khoi-chuoi'))");
  check('chế độ Cơ bản: khối chuỗi KHÔNG hiện — đúng như HTML tĩnh', coBan === false);

  await evaluate(
    `localStorage.setItem('ffb.prefs.v1', JSON.stringify({ mode: 'advanced' })), true`,
  );
  await open('/cong-thuc/wacc/');

  let chuoiHien = false;
  try {
    await waitFor("document.querySelector('#khoi-chuoi')", 8000);
    chuoiHien = true;
  } catch {
    chuoiHien = false;
  }

  check(
    'chế độ Nâng cao: khối chuỗi nạp trễ HIỆN RA sau hydrate',
    chuoiHien,
    chuoiHien ? 'chunk next/dynamic tải và gắn được' : 'chờ 8 giây không thấy #khoi-chuoi',
  );

  /*
   * Đo scrollWidth của TRANG, không phải của khối.
   *
   * Bản trước đọc `block.scrollWidth` — và nó mù. Khối chuỗi là hộp `overflow: visible` nên
   * `scrollWidth` của nó chỉ bằng bề rộng được cấp (328) dù con của nó vẽ tràn ra ngoài; phép
   * kiểm báo "vừa khung" trong khi trang thật cuộn ngang tới 495px vì năm thanh trượt của chuỗi
   * bị nhét vào ô lưới 143px. Cuộn ngang là chuyện của TRANG, nên phải hỏi trang.
   */
  /*
   * `khoiChuoi`, không phải `buoc`: tên ấy đã khai ở phép kiểm nháy giao diện phía trên (cùng
   * phạm vi hàm), và hai `const` trùng tên là lỗi CÚ PHÁP — cả script không chạy nổi dòng nào,
   * `npm run check:chrome` chết ngay lúc nạp. Lọt được vào repo vì prettier dùng Babel ở chế độ
   * bỏ qua lỗi khai báo trùng, còn `node --check` thì bắt. Lần sau đổi script này, chạy
   * `node --check scripts/chrome-check.mjs` trước khi tin vào prettier.
   */
  const khoiChuoi = await evaluate(`(() => {
  const block = document.querySelector('#khoi-chuoi')?.closest('section');
  if (!block) return null;
  const doc = document.documentElement;
  return {
    text: block.innerText.slice(0, 400),
    tran: doc.scrollWidth > doc.clientWidth + 1,
    rong: doc.scrollWidth,
  };
})()`);

  check(
    'khối chuỗi không đẩy trang tràn ngang ở khổ 360px',
    khoiChuoi !== null && khoiChuoi.tran === false,
    khoiChuoi === null ? 'không đọc được khối' : `trang rộng ${String(khoiChuoi.rong)}px`,
  );

  /*
   * Chuỗi dài nhất, và mở luôn bảng số liệu — hai thứ mà trang `wacc` ở trên không chạm tới.
   * `gia-tri-noi-tai-fcff` có bốn bước với tên dài nhất Registry có, còn bảng số liệu thì để
   * `white-space: nowrap` nên tiêu đề cột "Giá trị nội tại từ FCFF (DCF) (₫)" đẩy bảng rộng
   * 385px trong cột 344px. Cả hai chỉ lộ ra khi mở `<details>`, nên phải mở.
   */
  await open('/cong-thuc/gia-tri-noi-tai-fcff/');
  try {
    await waitFor("document.querySelector('#khoi-chuoi')", 8000);
  } catch {
    /* Ca dưới sẽ báo nếu khối không lên. */
  }

  const chuoiDai = await evaluate(`(() => {
  document.querySelectorAll('details').forEach((d) => { d.open = true; });
  const doc = document.documentElement;

  /*
   * Mỗi thanh trượt phải chiếm TRỌN một hàng của lưới ô nhập nó đang nằm trong.
   *
   * Đo quan hệ ô-với-lưới chứ không đo bề rộng trang: hai vá ở tầng component (SliderInput cho
   * xuống dòng, InlineNumber co lại) đã chặn được phần tràn, nên một thanh trượt bị nhét vào ô
   * 143px KHÔNG còn làm trang cuộn ngang nữa — nó chỉ xấu. Bất biến thật là ô rộng bằng lưới.
   */
  const hep = [];
  for (const s of document.querySelectorAll('input[type=range]')) {
    let o = s.parentElement;
    while (o && !(o.parentElement && getComputedStyle(o.parentElement).display === 'grid')) {
      o = o.parentElement;
    }
    if (!o || !o.parentElement) continue;
    const rongO = o.getBoundingClientRect().width;
    const rongLuoi = o.parentElement.getBoundingClientRect().width;
    if (rongO < rongLuoi - 1) {
      const nhan = s.closest('div')?.querySelector('label');
      hep.push((nhan ? nhan.textContent.trim().slice(0, 22) : '?') + ' ' + Math.round(rongO) + '/' + Math.round(rongLuoi));
    }
  }
  return { rong: doc.scrollWidth, khung: doc.clientWidth, soTruot: document.querySelectorAll('input[type=range]').length, hep };
})()`);

  check(
    'chuỗi dài nhất + bảng số liệu mở: trang vẫn không cuộn ngang',
    chuoiDai !== null && chuoiDai.rong <= chuoiDai.khung + 1,
    chuoiDai === null ? 'không đọc được trang' : `trang rộng ${String(chuoiDai.rong)}px`,
  );

  check(
    'mọi thanh trượt chiếm trọn một hàng lưới — kể cả trong thẻ bước của chuỗi',
    chuoiDai !== null && chuoiDai.hep.length === 0,
    chuoiDai === null
      ? 'không đọc được trang'
      : chuoiDai.hep.length === 0
        ? `${String(chuoiDai.soTruot)} thanh trượt, không cái nào bị bóp`
        : chuoiDai.hep.join(' · '),
  );

  check(
    'trang chế độ Nâng cao không kêu lỗi hay cảnh báo nào ra console',
    noise.length === 0,
    noise.slice(0, 2).join(' | '),
  );

  /* ── 4. Màn Công thức — `/` chuyển hướng, kệ cá nhân hoá theo lịch sử ────── */

  /*
   * Trang chủ riêng đã gộp vào màn Công thức (15/09/2026). Máy chủ riêng của script này không đọc
   * `_redirects`, nên cú chuyển ở đây là của `<meta http-equiv="refresh">` trong `src/app/page.tsx`
   * — đúng lớp dự phòng mà máy chạy thử dựa vào.
   */
  await open('/');
  let daChuyen = false;
  try {
    await waitFor(`location.pathname === '/cong-thuc/'`, 8000);
    daChuyen = true;
  } catch {
    daChuyen = false;
  }
  check('mở "/" thì tự chuyển về /cong-thuc/', daChuyen);

  /*
   * Chỗ DUY NHẤT trả lời được "có lệch hydration thật không".
   *
   * Kệ 16 ô (8 ô mang `hidden`) do server dựng, rồi một client component sắp lại theo `ffb.usage.v1`. Lượt render đầu ở
   * máy khách phải trùng khít HTML tĩnh, nếu không React vứt cả cây đi — và cảnh báo của nó chui ra
   * đúng cái console mà phép kiểm thứ ba dưới đây đang soi. jsdom không thay được: ở đó không có
   * lượt hydrate thật nào.
   */
  await evaluate(
    `localStorage.setItem('ffb.usage.v1', JSON.stringify([{ id: 'xirr', count: 9, at: Date.now() }])), true`,
  );
  await open('/cong-thuc/');

  const oDau = await evaluate(
    `document.querySelector('#cong-thuc-hang-ngay')?.closest('section')?.querySelector('li a')?.getAttribute('href') ?? null`,
  );
  check(
    'lịch sử đưa công thức hay mở lên ô đầu của kệ',
    oDau === '/cong-thuc/xirr/',
    `ô đầu trỏ ${String(oDau)}`,
  );

  /* Số ô đọc THẲNG từ `daily-shelf.ts` — docblock ở đó dặn giữ dạng mảng chuỗi nháy đơn. */
  const soGhim = [
    ...(/\bDAILY_SHELF_IDS = \[([\s\S]*?)\] as const/
      .exec(readFileSync('src/application/daily-shelf.ts', 'utf8'))?.[1]
      ?.matchAll(/'([a-z0-9-]+)'/g) ?? []),
  ].length;
  const soO = await evaluate(
    `document.querySelector('#cong-thuc-hang-ngay')?.closest('section')?.querySelectorAll('li').length ?? 0`,
  );
  check(
    'kệ vẫn đủ số ô sau khi sắp lại — không co giãn theo lịch sử',
    soGhim > 0 && soO === soGhim,
    `${String(soO)} ô, cần ${String(soGhim)}`,
  );

  check(
    'màn Công thức đã cá nhân hoá không kêu lỗi hay cảnh báo nào ra console — kể cả lệch hydration',
    noise.length === 0,
    noise.slice(0, 2).join(' | '),
  );

  // Dọn ngay: cụm EN dưới đây phải thấy đúng thứ tự ghim như một máy sạch.
  await evaluate(`localStorage.removeItem('ffb.usage.v1'), true`);

  /* ── 5. Luồng EN sau hydrate — lá <T> trong khối server truyền qua prop (đợt 8) ─ */

  /*
   * Rủi ro riêng của kiến trúc i18n: kệ "Công thức dùng hằng ngày" là node server truyền vào màn
   * client `FormulaListScreen` qua prop `shelf` — bản thân nó KHÔNG render lại khi context đổi. Chữ
   * trong đó đổi được chỉ vì từng lá `<T>` tự subscribe. jsdom kiểm được từng lá một; còn "cả trang
   * thật, hydrate từ HTML tĩnh tiếng Việt, đổi sang EN mà console sạch" thì chỉ Chrome thật trả lời
   * được — cảnh báo lệch hydration của React chui ra đúng ở console mà phép kiểm cuối đang soi.
   */
  await evaluate(`localStorage.setItem('ffb.prefs.v1', JSON.stringify({ locale: 'en' })), true`);
  await open('/cong-thuc/');

  let enServer = false;
  try {
    await waitFor(
      `[...document.querySelectorAll('h2')].some((h) => (h.textContent ?? '').includes('Everyday formulas'))`,
      8000,
    );
    enServer = true;
  } catch {
    enServer = false;
  }
  check(
    'chọn EN: tiêu đề nằm trong children server-render đổi sang tiếng Anh sau hydrate',
    enServer,
    enServer ? 'lá <T> sống sau hydrate' : 'chờ 8 giây vẫn tiếng Việt',
  );

  const enClient = await evaluate(
    `[...document.querySelectorAll('nav a span')].some((el) => el.textContent === 'Portfolio')`,
  );
  check('chọn EN: nhãn thanh điều hướng dưới (client) cũng đổi theo', enClient === true);

  const langAttr = await evaluate('document.documentElement.lang');
  check(
    "chọn EN: thuộc tính lang của <html> đổi thành 'en'",
    langAttr === 'en',
    `lang="${String(langAttr)}"`,
  );

  check(
    'màn Công thức ở chế độ EN không kêu lỗi hay cảnh báo nào ra console — kể cả lệch hydration',
    noise.length === 0,
    noise.slice(0, 2).join(' | '),
  );

  /* ── 6. Hàng chip nhóm ở khổ 360px (cả hai chế độ) ───────────────────────── */

  /*
   * Hàng chip thay lưới "Duyệt theo nhóm" của trang chủ cũ (15/09/2026). Nó CUỘN NGANG trong khung
   * riêng, nên ba điều chỉ Chrome thật đo được: hàng chip không kéo cả trang tràn ngang, hai nút
   * ‹ › ẩn ở khổ điện thoại, và nhánh con số đúng chế độ là nhánh HIỆN RA (jsdom không áp CSS nên
   * nó luôn thấy cả hai nhánh). Chip "Tài chính DN" là chip duy nhất chế độ Cơ bản giấu sạch — nhánh
   * hiện ra của nó phải là chữ, không phải số 0.
   */
  function docHangChip() {
    return evaluate(`(async () => {
    const khoi = document.getElementById('danh-sach-cong-thuc');
    if (!khoi) return null;
    khoi.scrollIntoView({ block: 'start' });
    await new Promise((d) => requestAnimationFrame(() => requestAnimationFrame(d)));
    const radios = [...khoi.querySelectorAll('input[name="nhom-cong-thuc"]')];
    const tcdn = radios.find((r) => r.value === 'corporate-finance')?.parentElement ?? null;
    const soHien = tcdn
      ? [...tcdn.querySelectorAll('span span')].filter((s) => getComputedStyle(s).display !== 'none' && s.getAttribute('aria-hidden') !== 'true').map((s) => s.textContent)
      : [];
    const nut = [...khoi.querySelectorAll('button[aria-hidden="true"]')];
    return {
      soRadio: radios.length,
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      nutHien: nut.filter((b) => getComputedStyle(b).display !== 'none').length,
      tcdn: soHien.join('|'),
    };
  })()`);
  }

  await evaluate(`localStorage.removeItem('ffb.prefs.v1'), true`);
  await open('/cong-thuc/');
  const chipCoBan = await docHangChip();

  check(
    'Điện thoại 360 · hàng chip nhóm đủ 13 lựa chọn, không kéo trang tràn ngang, nút ‹ › ẩn',
    chipCoBan !== null &&
      chipCoBan.soRadio === 13 &&
      chipCoBan.tran === false &&
      chipCoBan.nutHien === 0,
    JSON.stringify(chipCoBan),
  );

  check(
    'Điện thoại 360 · chế độ Cơ bản: chip "Tài chính DN" hiện chữ "chỉ ở Nâng cao", không hiện số 0',
    chipCoBan !== null && chipCoBan.tcdn === 'chỉ ở Nâng cao',
    `nhánh hiện ra: "${String(chipCoBan?.tcdn)}"`,
  );

  await evaluate(
    `localStorage.setItem('ffb.prefs.v1', JSON.stringify({ mode: 'advanced' })), true`,
  );
  await open('/cong-thuc/');
  const chipNangCao = await docHangChip();

  check(
    'Điện thoại 360 · chế độ Nâng cao: chip "Tài chính DN" quay về con số',
    chipNangCao !== null && /^\d+$/.test(chipNangCao.tcdn),
    `nhánh hiện ra: "${String(chipNangCao?.tcdn)}"`,
  );

  await evaluate(`localStorage.removeItem('ffb.prefs.v1'), true`);

  /* ── 7. Chuyển sang EN thì KHÔNG còn chữ tiếng Việt ngoài danh sách đã biết ── */

  /*
   * Chủ dự án báo "vài chỗ chưa chuyển sang tiếng Anh". Đo trên Chrome thật ở chế độ EN: quét mọi
   * text node và bốn thuộc tính chữ, bắt những chuỗi có dấu tiếng Việt. Không phép kiểm vitest nào
   * làm được việc này — nó cần cả trang thật, cả locale thật, và cả những khối nạp trễ.
   *
   * Ba nhóm ngoại lệ dưới đây là CÓ CHỦ ĐÍCH hoặc là nợ đã ghi sổ; mọi chuỗi khác là lỗi.
   */
  const MAN = [
    // '/' không còn trong danh sách: nó chỉ chuyển hướng về '/cong-thuc/' (15/09/2026).
    '/cong-thuc/',
    '/tim-kiem/',
    '/cong-thuc/pe/',
    '/cong-thuc/fcff/',
    '/cong-thuc/lich-tra-no/',
    '/danh-muc/',
    '/du-lieu/',
    '/cai-dat/',
  ];

  /**
   * NHÓM 1 — khoá i18n cố ý giữ một cụm tiếng Việt trong câu tiếng Anh.
   *
   * Nay chỉ còn một: `settings.units.scaleHint` gọi tên đơn vị tiền là "đồng". Cùng danh sách với
   * `CO_Y` ở `src/application/i18n/i18n.test.ts`, lý do ghi ở đó. Ghim theo mảnh chữ đặc trưng chứ
   * không theo cả câu — câu còn có thể sửa, mảnh chữ mới là thứ ngoại lệ nói về.
   *
   * Ba mảnh 'định giá' / 'Định giá' / 'dinh gia' đã bỏ khỏi đây: `search.placeholder` đổi ví dụ
   * sang "Sharpe", còn `search.hint` bỏ hẳn khoá. Ngoại lệ chết là ngoại lệ che mất lỗi thật.
   */
  const CO_Y = ['đồng'];

  /**
   * NHÓM 2 — số kèm đơn vị do Domain ghép sẵn. **Nợ đã ghi sổ, chưa xong.**
   *
   * `ChartPoint.label` / `valueLabel` (bảng số và vệt dò của biểu đồ) là chuỗi ĐƠN, dựng ở
   * `sweep.ts` / `breakdown.ts` / `history.ts` bằng `formatValueWithUnit(x, spec.resultUnit)` —
   * một chuỗi cho cả hai ngôn ngữ. Dịch được thì phải đổi bốn trường ấy thành `Bilingual`, kéo
   * theo `ChartFrame`, `LineChart`, `WaterfallChart` và bản chép đem xuất file. Đó là đợt riêng.
   *
   * Ghim theo KHUÔN chứ không theo chuỗi cụ thể: con số đổi theo từng công thức và từng ô nhập,
   * nên một danh sách chuỗi ở đây sẽ đỏ ngay lần ai đó sửa một giá trị mẫu.
   *
   * Khớp Ở BẤT KỲ ĐÂU trong chuỗi, không chỉ trọn chuỗi — và đó mới là chỗ phép kiểm này sắc.
   * Câu mô tả biểu đồ do `build.ts` dựng là câu TIẾNG ANH có nhúng `marked.valueLabel`: "At the
   * current value 46.000 ₫, the result is 15,21 lần." Bỏ các cụm số-kèm-đơn-vị ra rồi mới hỏi
   * phần còn lại có dấu tiếng Việt không, nên câu ấy đi qua, còn một câu THẬT SỰ chưa dịch thì
   * vẫn đỏ. Ghim trọn chuỗi thì cả câu ấy bị coi là lỗi và ngoại lệ phải nới rộng ra cả khối
   * biểu đồ — lúc đó phép kiểm không còn gác được gì bên trong khối.
   */
  const DON_VI_VN =
    '(lần|tỷ ₫|triệu CP|phiên|điểm|năm|tháng|ngày|kỳ|vòng|mã|HĐ|CP|sản phẩm|%\\/năm|%\\/phiên|%\\/kỳ|₫\\/CP\\/tháng|₫\\/CP|₫\\/tháng|₫\\/điểm)';
  const SO_KEM_DON_VI = new RegExp(`[+\\-−]?[\\d.,\\s—]+${DON_VI_VN}`, 'g');

  /**
   * NHÓM 3 — ký hiệu toán học. Cố ý, và không sửa được ở tầng này.
   *
   * KaTeX chạy LÚC BUILD trong server component (xem `latex-html.ts`), nên MathML của cả 111 trang
   * được nướng vào HTML tĩnh bằng đúng một ngôn ngữ. Dịch được thì phải dựng hai bản MathML cho
   * mỗi trang rồi chọn ở máy khách — đắt hơn hẳn thứ nó đổi lại, và đánh vào chính lý do gói 2.4.3
   * chọn build-time: máy khách tải 0 byte KaTeX.
   */
  /** Cùng bộ dấu tiếng Việt mà khối dò bên trong trang đang dùng. */
  const VN = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

  /*
   * Bóc hết phần ĐÃ BIẾT ra rồi mới hỏi phần còn lại có dấu tiếng Việt không. Làm ngược lại —
   * hỏi "chuỗi này có khớp ngoại lệ nào không" — thì một câu tiếng Anh nhúng đúng một cụm
   * số-kèm-đơn-vị sẽ trượt, và ngoại lệ buộc phải nới ra cả câu.
   */
  const daBiet = (c) => {
    if (c.loai === 'mathml') return true;
    let conLai = c.t.replace(SO_KEM_DON_VI, ' ');
    for (const manh of CO_Y) conLai = conLai.split(manh).join(' ');
    return !VN.test(conLai);
  };

  const conSot = [];

  await evaluate(
    `localStorage.setItem('ffb.prefs.v1', JSON.stringify({ locale: 'en', mode: 'advanced' })), true`,
  );

  for (const duongDan of MAN) {
    await open(duongDan);
    const con = await evaluate(`(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((d) => requestAnimationFrame(() => requestAnimationFrame(d)));
      window.scrollTo(0, 0);
      await new Promise((d) => setTimeout(d, 400));

      const VN = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
      const ra = [];
      const hien = (el) => {
        for (let n = el; n; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        }
        return true;
      };

      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) {
        const t = (w.currentNode.textContent ?? '').trim();
        const el = w.currentNode.parentElement;
        if (!t || !VN.test(t) || !el) continue;
        if (el.closest('.print-region')) continue;
        if (!hien(el)) continue;
        ra.push({ loai: el.closest('math') ? 'mathml' : 'chữ', tag: el.tagName.toLowerCase(), cls: (el.getAttribute('class') ?? '').slice(0, 34), t: t.slice(0, 300) });
      }

      for (const attr of ['aria-label', 'title', 'placeholder', 'alt']) {
        for (const el of document.querySelectorAll('[' + attr + ']')) {
          const t = (el.getAttribute(attr) ?? '').trim();
          if (!t || !VN.test(t) || !hien(el)) continue;
          ra.push({ loai: attr, tag: el.tagName.toLowerCase(), cls: (el.getAttribute('class') ?? '').slice(0, 34), t: t.slice(0, 300) });
        }
      }
      return ra;
    })()`);

    for (const c of con) {
      // Cắt CHỈ ĐỂ IN. Cắt trước khi đối chiếu thì "đồng" cụt thành "đồ" và ngoại lệ trượt.
      if (!daBiet(c)) conSot.push(`${duongDan} · <${c.tag}> "${c.t.slice(0, 70)}"`);
    }
  }

  check(
    'chế độ EN: không còn chữ tiếng Việt nào ngoài ba nhóm ngoại lệ đã ghi',
    conSot.length === 0,
    conSot.length === 0
      ? `quét ${String(MAN.length)} màn, mọi chuỗi còn lại đều nằm trong danh sách ngoại lệ`
      : conSot.slice(0, 4).join(' | '),
  );

  /*
   * ── Tên phép tính đã lưu cũng phải đổi theo ngôn ngữ ───────────────────────────────────────
   *
   * Chủ dự án gửi ảnh tab "Formulas" ở chế độ EN: dòng phụ đã là "Margin of safety" mà tên ngay
   * trên vẫn "Biên an toàn · 25/08/2026". `SavedCalc.name` là chuỗi ĐÃ GHÉP, cất vào localStorage
   * ở ngôn ngữ lúc bấm Lưu — `displayCalcName()` nhận ra tên nào vốn là gợi ý rồi dựng lại.
   *
   * Phép kiểm này gieo thẳng một bản lưu mang tên TIẾNG VIỆT vào kho, đúng như bản lưu cũ nằm sẵn
   * trên máy người dùng. Khối dò ở trên không thấy được ca này: máy Chrome của nó có kho rỗng.
   *
   * Không còn bước bấm sang tab "Công thức": cụm tab bỏ từ 14/09/2026, và danh sách phép tính đã
   * lưu quay lại ngày 15/09/2026 thành khối thứ hai nằm thẳng trên màn. Bước bấm cũ dò mọi nút có
   * chữ "Công thức" — giữ lại thì nó có thể bấm nhầm một nút khác trùng chữ.
   */
  await evaluate(`(() => {
    const savedAt = new Date(2026, 7, 25, 10, 0, 0).getTime();
    localStorage.setItem('ffb.saved.v1', JSON.stringify([{
      id: 'bien-an-toan-' + savedAt,
      formulaId: 'bien-an-toan',
      name: 'Biên an toàn · 25/08/2026',
      inputs: {},
      resultValue: -15.71,
      resultUnit: '%',
      savedAt,
      needsSeries: false,
    }]));
    return true;
  })()`);
  await open('/danh-muc/');

  const tenDaLuu = await evaluate(`(async () => {
    // Kho đọc trong effect — chờ khối dựng xong rồi mới đọc chữ.
    for (let i = 0; i < 30 && !document.getElementById('phep-tinh-da-luu'); i += 1) {
      await new Promise((d) => setTimeout(d, 100));
    }
    const khoi = document.getElementById('phep-tinh-da-luu');
    return khoi === null ? [] : [...khoi.querySelectorAll('p')].map((p) => p.textContent ?? '');
  })()`);

  const coTenEn = (tenDaLuu ?? []).some((line) => line.includes('Margin of safety · 25/08/2026'));
  const conTenVi = (tenDaLuu ?? []).some((line) => line.trim() === 'Biên an toàn · 25/08/2026');

  check(
    'tên phép tính đã lưu dựng lại theo ngôn ngữ — bản lưu cũ bằng tiếng Việt cũng đổi',
    coTenEn && !conTenVi,
    coTenEn ? 'hiện "Margin of safety · 25/08/2026"' : 'không thấy tên đã dịch trong danh sách',
  );

  await evaluate(`localStorage.removeItem('ffb.saved.v1'), true`);
  await evaluate(`localStorage.removeItem('ffb.prefs.v1'), true`);

  /*
   * ── Danh sách Nắm giữ ở khổ ĐIỆN THOẠI (22/09/2026) ──────────────────────
   *
   * Từ đợt này danh sách là một `<table>` tám cột, và dưới 1024px nó phải trở lại dòng gọn ba cột
   * của bản vẽ WF-06 bằng `display: block` + lưới. Đây đúng là loại luật chỉ trình duyệt mới trả
   * lời được: jsdom không áp `@media` của CSS Module, nên một ca vitest xanh bất kể file CSS viết
   * gì — và nếu luật ấy sai thì tám cột trải ngang một màn 360px.
   *
   * Trước mục này, `/danh-muc/` KHÔNG có một khẳng định tràn ngang nào ở khổ 360: khẳng định duy
   * nhất của màn nằm ở khổ 1440, chỗ form thêm mã.
   */
  /*
   * HPG cố ý KHÔNG có ngày mua. Ngày mua và beta đều tuỳ chọn, nên "mã không có ô số liệu nào"
   * là ca THƯỜNG của khối chi tiết, và nó có lỗi riêng (xem phép kiểm về vạch ngăn bên dưới).
   */
  await evaluate(`(() => {
    localStorage.setItem('ffb.portfolio.v1', JSON.stringify([
      { code: 'FPT', quantity: 100, costPrice: 60000, buyDate: '2026-01-02' },
      { code: 'HPG', quantity: 500, costPrice: 20000 },
    ]));
    return true;
  })()`);
  await open('/danh-muc/');
  await waitFor(
    `[...document.querySelectorAll('button')].some((b) => /^Chi tiết FPT/.test(b.getAttribute('aria-label') ?? ''))`,
  );

  const dmHep = await evaluate(`(() => {
    const bang = document.querySelector('main table');
    const dau = bang === null ? null : bang.querySelector('thead');
    const hang = bang === null ? null : bang.querySelector('tbody tr');
    const o = hang === null ? [] : [...hang.children];
    const khung = (el) => {
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top), left: Math.round(b.left), w: Math.round(b.width) };
    };
    return {
      thay: bang !== null && hang !== null,
      dauHien: dau === null ? null : getComputedStyle(dau).display,
      soO: o.length,
      // Ở khổ dòng gọn các ô xếp CHỒNG, nên số mép trên khác nhau phải > 1.
      soMepTren: new Set(o.map((el) => khung(el).top)).size,
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      rongBang: bang === null ? 0 : Math.round(bang.getBoundingClientRect().width),
    };
  })()`);

  check(
    '360 · danh sách Nắm giữ trở lại dòng gọn — hàng tiêu đề cột tắt hẳn',
    dmHep.thay === true && dmHep.dauHien === 'none',
    dmHep.thay !== true ? 'không thấy bảng' : `thead display: ${String(dmHep.dauHien)}`,
  );

  check(
    '360 · các ô của một mã xếp chồng chứ không trải thành tám cột',
    dmHep.soMepTren > 1,
    `${String(dmHep.soO)} ô · ${String(dmHep.soMepTren)} mức mép trên`,
  );

  check(
    '360 · màn Danh mục có mã không tràn ngang',
    dmHep.tran === false,
    `bảng rộng ${String(dmHep.rongBang)}px`,
  );

  /*
   * ── Bốn chỗ chủ dự án chụp ở khổ điện thoại (22/09/2026) ─────────────────
   *
   * _"ở giữa đang thừa quá nhiều không gian… màn mobile sai tùm lum"_. Cả bốn đều là lỗi hình
   * học chỉ trình duyệt mới thấy: jsdom không áp `@media` của CSS Module và trả 0 cho mọi phép
   * đo, nên 84 ca vitest của màn này xanh suốt trong lúc màn hỏng.
   */
  const dmMo = await evaluate(`(async () => {
    const nut = (ma) =>
      [...document.querySelectorAll('button')].find((b) =>
        new RegExp('^Chi tiết ' + ma).test(b.getAttribute('aria-label') ?? ''),
      );
    const rong = (el) => (el === null ? 0 : Math.round(el.getBoundingClientRect().width));
    const mepTren = (el) => (el === null ? 0 : Math.round(el.getBoundingClientRect().top));
    const doi = () => new Promise((r) => setTimeout(r, 150));

    const hang = nut('FPT').closest('tr');
    const lai = hang.querySelector('[class*="holdGainCell"]');
    const gia = hang.querySelector('[class*="holdPrice"]');
    const trong = hang.querySelector('[class*="holdWeightCell"]');
    const laiTren = mepTren(lai);
    const giaTren = mepTren(gia);

    nut('FPT').click();
    await doi();
    const rongChiTiet = rong(document.querySelector('[class*="holdDetailInner"]'));
    const rongBang = rong(document.querySelector('main table'));
    nut('FPT').click();
    await doi();

    nut('HPG').click();
    await doi();
    const khoiHpg = document.querySelector('[class*="holdDetailInner"]');
    const cumNut = khoiHpg === null ? null : khoiHpg.querySelector('[class*="actions"]');
    const soDl = khoiHpg === null ? -1 : khoiHpg.querySelectorAll('dl').length;
    const vienTren = cumNut === null ? '' : getComputedStyle(cumNut).borderTopWidth;
    nut('HPG').click();

    return { laiTren, giaTren, chuTrong: (trong.textContent ?? '').trim(), rongChiTiet, rongBang, soDl, vienTren };
  })()`);

  check(
    '360 · lãi/lỗ lên hàng hai, không bỏ trống nửa phải của dòng',
    dmMo.laiTren < dmMo.giaTren,
    `lãi/lỗ ở y=${String(dmMo.laiTren)}, thị giá ở y=${String(dmMo.giaTren)}`,
  );

  check(
    '360 · "tỷ trọng" tách khỏi con số bằng một dấu cách thật',
    /\d\s*%\s+\S/.test(dmMo.chuTrong),
    `ô tỷ trọng đọc ra "${String(dmMo.chuTrong)}"`,
  );

  check(
    '360 · khối chi tiết trải hết bề ngang thẻ, không co lại bằng cụm nút',
    dmMo.rongChiTiet >= dmMo.rongBang * 0.85,
    `khối rộng ${String(dmMo.rongChiTiet)}px / bảng ${String(dmMo.rongBang)}px`,
  );

  check(
    '360 · mã không có ngày mua: không dựng <dl> rỗng, không kẻ vạch ngăn trống',
    dmMo.soDl === 0 && dmMo.vienTren === '0px',
    `${String(dmMo.soDl)} <dl> · viền trên cụm nút ${String(dmMo.vienTren)}`,
  );

  /* ── Khổ BẢNG GỌN 560px — mốc thứ ba, thêm 22/09/2026 ────────────────────
   *
   * Giữa dòng gọn và bảng tám cột nay có một khổ nữa: bảng SÁU cột số, bỏ "Doanh nghiệp" và
   * "Giá trị". Nó ra đời vì dòng gọn là bố cục hai mép — mọi bề ngang thừa chảy hết vào khoảng
   * giữa, và ở 900px khoảng ấy rộng hơn 400px.
   *
   * Đo ở đúng 560 (mép dưới của khổ) chứ không ở giữa dải: chỗ chật nhất mới là chỗ chữ bị cắt.
   */
  await send('Emulation.setDeviceMetricsOverride', {
    width: 560,
    height: 900,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await open('/danh-muc/');
  await waitFor(
    `[...document.querySelectorAll('button')].some((b) => /^Chi tiết FPT/.test(b.getAttribute('aria-label') ?? ''))`,
  );

  const dmVua = await evaluate(`(() => {
    const bang = document.querySelector('main table');
    const dau = bang.querySelector('thead');
    const hang = bang.querySelector('tbody tr');
    const hien = (el) => getComputedStyle(el).display !== 'none';
    const oHien = [...hang.children].filter(hien);
    const tieuDe = [...bang.querySelectorAll('thead th')];
    return {
      dauHien: getComputedStyle(dau).display,
      soOHien: oHien.length,
      // Bảng thật thì mọi ô của một hàng chung một mép trên.
      soMepTren: new Set(oHien.map((el) => Math.round(el.getBoundingClientRect().top))).size,
      tenHien: hien(tieuDe[1]),
      giaTriHien: hien(tieuDe[5]),
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      // Ô nào có chữ rộng hơn lòng ô là ô đang cắt mất chữ số.
      cat: [...bang.querySelectorAll('td, th')].filter((el) => el.scrollWidth > el.clientWidth + 1)
        .length,
    };
  })()`);

  check(
    '560 · danh sách Nắm giữ thành bảng — mọi ô của một mã về cùng một hàng',
    dmVua.dauHien === 'table-header-group' && dmVua.soMepTren === 1,
    `thead ${String(dmVua.dauHien)} · ${String(dmVua.soMepTren)} mức mép trên`,
  );

  check(
    '560 · bảng bỏ đúng hai cột rộng nhất, còn bảy cột',
    dmVua.soOHien === 7 && dmVua.tenHien === false && dmVua.giaTriHien === false,
    `${String(dmVua.soOHien)} ô hiện · Doanh nghiệp ${String(dmVua.tenHien)} · Giá trị ${String(dmVua.giaTriHien)}`,
  );

  check(
    '560 · không tràn ngang và không ô nào cắt mất chữ số',
    dmVua.tran === false && dmVua.cat === 0,
    `${String(dmVua.cat)} ô bị cắt`,
  );

  /* ── 8. Khổ PC lớn: bố cục nhiều cột ─────────────────────────────────────
   *
   * Cửa gác duy nhất của dự án ở khổ PC. Mọi phép kiểm trên đây chạy ở 360×780, nên trước mục này
   * bố cục desktop KHÔNG được đo bằng máy lần nào — sửa gì cũng không đỏ, mà cũng không được che.
   *
   * Đo bằng toạ độ thật chứ không đọc CSS: "hai khối cùng một hàng lưới" là thứ chỉ trình duyệt
   * mới trả lời được, và cũng chính là thứ hỏng khi ai đó thêm một con mới cho `.detail` mà quên
   * khai cột (xem cảnh báo trong `FormulaDetail.module.css`).
   *
   * 1440 chứ không 1920: đây là bậc đệm 64px, tức khung 1312px — dưới trần 1600 nên phép so
   * `bề ngang = viewport − 2×đệm` kiểm được cả hai thứ cùng lúc.
   */
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  /**
   * Đọc vị trí các khối chính của màn chi tiết. Trả hình chữ nhật đã làm tròn, cộng số cột thật
   * của lưới ô nhập — `gridTemplateColumns` đã giải ra danh sách px nên đếm phần tử là ra số cột.
   */
  const DOC_CHI_TIET = `(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        top: Math.round(b.top),
        bottom: Math.round(b.bottom),
        left: Math.round(b.left),
        right: Math.round(b.right),
        width: Math.round(b.width),
      };
    };
    const soLieu = document.querySelector('section[aria-labelledby="khoi-so-lieu"]');
    const luoi = soLieu?.querySelector('[class*="fields"]') ?? null;
    const cot = luoi === null ? null : getComputedStyle(luoi).gridTemplateColumns.trim();
    const khung = soLieu === null ? null : getComputedStyle(soLieu);
    const khoiGiaiThich =
      [...document.querySelectorAll('h2')]
        .find((h) => /Giải thích/.test(h.textContent ?? ''))
        ?.closest('section') ?? null;
    const oChonTruc = document.querySelector('figure [class*="controls"] select');
    const nhomLoiVe = document.querySelector('figure [class*="controls"] [role="group"]');
    return {
      /* Bo góc hai điều khiển đứng cạnh nhau trên thẻ biểu đồ — phải bằng nhau. */
      boDieuKhien: {
        chon: oChonTruc === null ? null : getComputedStyle(oChonTruc).borderTopLeftRadius,
        nhom: nhomLoiVe === null ? null : getComputedStyle(nhomLoiVe).borderTopLeftRadius,
      },
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      main: r(document.querySelector('main')),
      congThuc: r(document.querySelector('.katex')?.closest('section') ?? null),
      soLieu: r(soLieu),
      ketQua: r(document.querySelector('section[aria-labelledby="khoi-ket-qua"]')),
      bieuDo: r(document.querySelector('figure')?.closest('section') ?? null),
      soCot: cot === null || cot === 'none' ? null : cot.split(/\\s+/).length,
      /* Khung của khối Số liệu: viền và bo góc — chỉ có ở khổ PC, xem FormulaDetail.module.css. */
      vienSoLieu: khung === null ? null : khung.borderTopWidth,
      boSoLieu: khung === null ? null : khung.borderTopLeftRadius,
      /* Bốn khối còn lại của khuôn hai chồng, và hai mốc của hàng điều khiển biểu đồ. */
      giaiThich: r(khoiGiaiThich),
      /* Bốn mục của khối Giải thích — để đo chúng xếp dọc hay lưới. */
      mucGiaiThich:
        khoiGiaiThich === null ? null : [...khoiGiaiThich.querySelectorAll('details')].map(r),
      bangBien: r(document.querySelector('[class*="aside"]')),
      /* Bảng biến: bề rộng cả bảng và của cột "Biến" (ô tiêu đề đầu). */
      cotBien: (() => {
        const bang = document.querySelector('[class*="aside"] table');
        const th = bang?.querySelector('thead th') ?? null;
        return bang === null || th === null
          ? null
          : {
              bang: Math.round(bang.getBoundingClientRect().width),
              bien: Math.round(th.getBoundingClientRect().width),
            };
      })(),
      chuThich: r(document.querySelector('figure figcaption')),
      dieuKhien: r(document.querySelector('figure [class*="controls"]')),
      /*
       * Thẻ Kết quả ở khổ PC xếp nhãn trái, con số phải (xem ResultBlock.module.css). Thẻ là cha
       * trực tiếp của nhãn — không dò [class*="block"] vì tên lớp ấy có ở nhiều chỗ khác trong màn.
       * Không dùng dấu backtick trong chú thích này: cả khối đang nằm trong một template literal.
       */
      ...(() => {
        const khoi = document.querySelector('section[aria-labelledby="khoi-ket-qua"]');
        const nhan = khoi?.querySelector('[class*="eyebrow"]') ?? null;
        return {
          theKetQua: r(nhan?.parentElement ?? null),
          nhanKetQua: r(nhan),
          soKetQua: r(khoi?.querySelector('[class*="figure"]') ?? null),
        };
      })(),
      /* Nhóm Đường/Cột: bo góc đã tính ra của khung và của nút đầu — phải cùng một số. */
      boDuongCot: (() => {
        const khung = document.querySelector('figure [class*="kindGroup"]');
        const nut = khung?.querySelector('button') ?? null;
        return khung === null || nut === null
          ? null
          : {
              khung: getComputedStyle(khung).borderTopLeftRadius,
              nut: getComputedStyle(nut).borderTopLeftRadius,
            };
      })(),
    };
  })()`;

  await open('/cong-thuc/pe/');
  const pcPe = await evaluate(DOC_CHI_TIET);

  check('PC 1440 · trang chi tiết không tràn ngang', pcPe.tran === false);

  /*
   * Hai vế, vì `main` KHÔNG phải là cột nội dung: `--gutter` nằm bên trong nó, và ở 1440 nó rộng
   * đúng viewport trừ thanh cuộn (1425), không phải 1440 − 2×64. Nên đo đệm bằng khoảng cách từ
   * mép `main` tới mép khối đầu tiên của cột trái, còn trần thì so thẳng.
   */
  check(
    'PC 1440 · đệm hai bên đúng 64 và khung không vượt trần 1600',
    pcPe.main !== null &&
      pcPe.congThuc !== null &&
      pcPe.congThuc.left - pcPe.main.left === 64 &&
      pcPe.main.width <= 1600,
    `đệm ${String((pcPe.congThuc?.left ?? 0) - (pcPe.main?.left ?? 0))}px · khung ${String(pcPe.main?.width)}px`,
  );

  /*
   * Khuôn PC (chủ dự án chốt theo ảnh mẫu từ trang tham chiếu, 09/09/2026): Công thức một mình
   * trên hàng riêng; dưới nó cột trái là Số liệu, cột phải là thẻ Kết quả rồi Biểu đồ ngay dưới,
   * hai cột cùng mép trên. Bốn phép kiểm dưới đây là bốn cạnh của khuôn ấy — thiếu một cạnh là
   * khuôn đã trôi mà không ai biết. Cạnh nào cũng đo bằng toạ độ, vì "Kết quả rơi lên cạnh Công
   * thức" (điều `dense` làm ngay khi Công thức thôi trải hết hàng) chỉ trình duyệt mới thấy.
   */
  check(
    'PC 1440 · Công thức một mình trên hàng riêng — thẻ Kết quả nằm DƯỚI nó, không cạnh nó',
    pcPe.congThuc !== null && pcPe.ketQua !== null && pcPe.ketQua.top >= pcPe.congThuc.bottom,
    `Công thức đáy=${String(pcPe.congThuc?.bottom)} · Kết quả top=${String(pcPe.ketQua?.top)}`,
  );

  check(
    'PC 1440 · khối Số liệu bên trái và thẻ Kết quả bên phải cùng mép trên',
    pcPe.soLieu !== null &&
      pcPe.ketQua !== null &&
      Math.abs(pcPe.soLieu.top - pcPe.ketQua.top) <= 1 &&
      pcPe.ketQua.left >= pcPe.soLieu.right,
    `mép trên ${String(pcPe.soLieu?.top)} / ${String(pcPe.ketQua?.top)}`,
  );

  /*
   * 32px: `row-gap` của lưới là `--space-5` (24px), cộng chỗ cho làm tròn. Rộng hơn thế là Biểu đồ
   * đã rơi xuống một hàng lưới khác chứ không còn xếp dọc trong cùng ô với Kết quả.
   */
  check(
    'PC 1440 · Biểu đồ ngay dưới thẻ Kết quả, cùng cột phải',
    pcPe.ketQua !== null &&
      pcPe.bieuDo !== null &&
      pcPe.bieuDo.left === pcPe.ketQua.left &&
      pcPe.bieuDo.top - pcPe.ketQua.bottom >= 0 &&
      pcPe.bieuDo.top - pcPe.ketQua.bottom <= 32,
    `Kết quả đáy=${String(pcPe.ketQua?.bottom)} · Biểu đồ top=${String(pcPe.bieuDo?.top)}`,
  );

  check(
    'PC 1440 · cột phải rộng ~65% — biểu đồ chiếm phần lớn bề ngang theo yêu cầu chủ dự án',
    pcPe.bieuDo !== null &&
      pcPe.soLieu !== null &&
      pcPe.bieuDo.width / (pcPe.bieuDo.width + pcPe.soLieu.width) >= 0.62,
    `Biểu đồ ${String(pcPe.bieuDo?.width)}px · Số liệu ${String(pcPe.soLieu?.width)}px`,
  );

  check(
    'PC 1440 · ô nhập MỘT cột — mỗi tham số một hàng như ô THAM SỐ của ảnh mẫu',
    pcPe.soCot === 1,
    `${String(pcPe.soCot)} cột`,
  );

  /*
   * Hai chồng độc lập: Giải thích dính ngay dưới Số liệu ở cột trái, Bảng biến + Ví dụ ở cuối cột
   * phải. Đây là phép kiểm bắt đúng lỗi chủ dự án chỉ ra — khoảng trống dưới Số liệu khi hai cột
   * còn chia hàng chung lưới. 32px = `row-gap` 20px cộng chỗ cho làm tròn.
   */
  check(
    'PC 1440 · Giải thích ngay dưới Số liệu, cùng cột trái — không có khoảng trống',
    pcPe.soLieu !== null &&
      pcPe.giaiThich !== null &&
      pcPe.giaiThich.left === pcPe.soLieu.left &&
      pcPe.giaiThich.top - pcPe.soLieu.bottom >= 0 &&
      pcPe.giaiThich.top - pcPe.soLieu.bottom <= 32,
    `Số liệu đáy=${String(pcPe.soLieu?.bottom)} · Giải thích top=${String(pcPe.giaiThich?.top)}`,
  );

  check(
    'PC 1440 · Bảng biến + Ví dụ ở cột phải, dưới biểu đồ',
    pcPe.bangBien !== null &&
      pcPe.ketQua !== null &&
      pcPe.bieuDo !== null &&
      pcPe.bangBien.left === pcPe.ketQua.left &&
      pcPe.bangBien.top >= pcPe.bieuDo.bottom,
    `Biểu đồ đáy=${String(pcPe.bieuDo?.bottom)} · Bảng biến top=${String(pcPe.bangBien?.top)}`,
  );

  /*
   * Hàng điều khiển biểu đồ (ô chọn trục + Đường/Cột) lên cùng hàng với tiêu đề hình và dạt về mép
   * phải thẻ — "nhỏ gọn như link mẫu". `pe` có hai biến quét nên có ô chọn. 24px: đệm thẻ 12px cộng
   * viền và làm tròn.
   */
  check(
    'PC 1440 · điều khiển biểu đồ cùng hàng với tiêu đề hình, dạt về mép phải thẻ',
    pcPe.chuThich !== null &&
      pcPe.dieuKhien !== null &&
      pcPe.bieuDo !== null &&
      Math.abs(pcPe.dieuKhien.top - pcPe.chuThich.top) <= 4 &&
      pcPe.dieuKhien.left > pcPe.chuThich.left &&
      pcPe.bieuDo.right - pcPe.dieuKhien.right <= 24,
    `tiêu đề top=${String(pcPe.chuThich?.top)} · điều khiển top=${String(pcPe.dieuKhien?.top)} · hở phải ${String((pcPe.bieuDo?.right ?? 0) - (pcPe.dieuKhien?.right ?? 0))}px`,
  );

  /*
   * Ô chọn trục và nhóm nút Đường/Cột đứng cạnh nhau nên bo cùng một số — chủ dự án: "điều chỉnh bo
   * bên trái bằng với bo bên phải" (10/09/2026). Đọc giá trị đã tính chứ không so CSS: hai con số
   * nằm ở hai file, và `radius.test.ts` chỉ ghim từng file một.
   */
  check(
    'PC 1440 · ô chọn trục và nhóm Đường/Cột bo cùng một số',
    pcPe.boDieuKhien.chon !== null &&
      pcPe.boDieuKhien.nhom !== null &&
      pcPe.boDieuKhien.chon === pcPe.boDieuKhien.nhom,
    `ô chọn ${String(pcPe.boDieuKhien.chon)} · nhóm nút ${String(pcPe.boDieuKhien.nhom)}`,
  );

  /*
   * Thẻ Kết quả ở khổ PC: nhãn "KẾT QUẢ · CẬP NHẬT TỨC THÌ" bám mép trái, con số bám mép phải, cùng
   * một hàng — chủ dự án 10/09/2026: "tối ưu không gian bên phải". 16px là đệm `--space-4` của thẻ.
   * Đo toạ độ chứ không đọc CSS, vì luật nằm trong media query 1280 và "cùng một hàng" là thứ chỉ
   * trình duyệt mới trả lời được; cùng lối với phép "điều khiển biểu đồ cùng hàng" ngay trên.
   */
  check(
    'PC 1440 · thẻ Kết quả: nhãn sát mép trái, con số sát mép phải, cùng một hàng',
    pcPe.theKetQua !== null &&
      pcPe.nhanKetQua !== null &&
      pcPe.soKetQua !== null &&
      Math.abs(pcPe.nhanKetQua.left - (pcPe.theKetQua.left + 16)) <= 1 &&
      Math.abs(pcPe.theKetQua.right - 16 - pcPe.soKetQua.right) <= 1 &&
      pcPe.soKetQua.left > pcPe.nhanKetQua.right &&
      pcPe.nhanKetQua.top < pcPe.soKetQua.bottom &&
      pcPe.soKetQua.top < pcPe.nhanKetQua.bottom,
    `thẻ ${String(pcPe.theKetQua?.left)}–${String(pcPe.theKetQua?.right)} · nhãn trái=${String(pcPe.nhanKetQua?.left)} · số phải=${String(pcPe.soKetQua?.right)} · nhãn top=${String(pcPe.nhanKetQua?.top)} · số top=${String(pcPe.soKetQua?.top)}`,
  );

  /*
   * Nhóm Đường/Cột bo 5px cả khung lẫn nút — chủ dự án 10/09/2026: "đồng bộ đều bằng 5". Đọc giá trị
   * đã tính ra vì nút khai `inherit`, tức con số thật chỉ có ở trình duyệt.
   */
  check(
    'PC 1440 · nhóm Đường/Cột bo 5px cả khung lẫn nút',
    pcPe.boDuongCot !== null && pcPe.boDuongCot.khung === '5px' && pcPe.boDuongCot.nut === '5px',
    `khung ${String(pcPe.boDuongCot?.khung)} · nút ${String(pcPe.boDuongCot?.nut)}`,
  );

  /*
   * Khối Số liệu đóng khung ở khổ PC — chủ dự án: "phần bên trái thì cần bo lại khi ở màn web".
   * Đo viền và bo góc đã tính ra, không đọc CSS: luật nằm trong media query, và chính media query
   * là thứ hay bị dời nhầm ra ngoài (khi ấy điện thoại cũng bị đóng khung — phép kiểm 1024 dưới
   * đây bắt vế đó).
   */
  check(
    'PC 1440 · khối Số liệu đóng khung: viền 1px, bo góc --radius-md',
    pcPe.vienSoLieu === '1px' && pcPe.boSoLieu === '10px',
    `viền ${String(pcPe.vienSoLieu)} · bo ${String(pcPe.boSoLieu)}`,
  );

  /*
   * Cột "Biến" của bảng biến giữ ~30% bảng ở khổ PC — chủ dự án chụp cảnh nó co còn ~130px và tên
   * biến vỡ hai dòng (xem `VariableTable.module.css`). 28% chứ không 30 vì tỉ lệ đo trên ô tiêu đề
   * còn lệch bởi `border-collapse` và làm tròn.
   */
  check(
    'PC 1440 · bảng biến: cột "Biến" giữ ít nhất 28% bề ngang bảng',
    pcPe.cotBien !== null && pcPe.cotBien.bien / pcPe.cotBien.bang >= 0.28,
    `Biến ${String(pcPe.cotBien?.bien)}px / bảng ${String(pcPe.cotBien?.bang)}px`,
  );

  /*
   * Bốn mục Giải thích xếp DỌC ở khổ PC — chủ dự án bỏ lưới 2×2 sau khi thấy ba thẻ gập trống hoác
   * cao bằng thẻ mở (xem docblock `ExplanationAccordion.module.css`). Đo: cùng mép trái, mục sau
   * bắt đầu dưới đáy mục trước.
   */
  check(
    'PC 1440 · bốn mục Giải thích là bốn hàng dọc, không phải lưới 2×2',
    pcPe.mucGiaiThich !== null &&
      pcPe.mucGiaiThich.length === 4 &&
      pcPe.mucGiaiThich.every(
        (muc, i, all) =>
          muc.left === all[0].left && (i === 0 || muc.top >= (all[i - 1]?.bottom ?? Infinity)),
      ),
    `top: ${String(pcPe.mucGiaiThich?.map((m) => m.top).join(' · '))}`,
  );

  /*
   * ── Màn Công thức: trang chủ + danh sách gộp làm một (bản vẽ 15/09/2026) ────────────────────
   *
   * Thay cụm kiểm "thanh tab 40% + hai ô lọc" của màn danh sách cũ — ba tab mảng và ô chọn nhóm đã
   * bỏ. Mỗi phép dưới đây ứng với một điểm của bản vẽ gộp màn mà chỉ bố cục thật mới đo được:
   * kệ 4 × 2, hàng tiêu đề danh sách mang "Mức độ" + "Sắp xếp" cùng hàng, hàng chip tràn thì nút
   * ‹ › làm việc, lưới thẻ ba cột, và "Xem tất cả" bày đủ kệ tại chỗ (4 × 4) rồi thu về được.
   */
  await open('/cong-thuc/');
  const pcDs = await evaluate(`(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        top: Math.round(b.top),
        bottom: Math.round(b.bottom),
        left: Math.round(b.left),
        right: Math.round(b.right),
        width: Math.round(b.width),
      };
    };
    const ke = document.querySelector('#cong-thuc-hang-ngay')?.closest('section') ?? null;
    // Chỉ ô đang hiện: ô mang thuộc tính hidden có khung 0 × 0 ở toạ độ 0, làm sai phép đếm cột.
    const oKe = ke === null ? [] : [...ke.querySelectorAll('li:not([hidden])')].map(r);
    const khoi = document.getElementById('danh-sach-cong-thuc');
    const tieuDe = khoi?.querySelector('h2') ?? null;
    const nhomMucDo = khoi?.querySelector('[role="group"]') ?? null;
    const chon = khoi?.querySelector('select') ?? null;
    const nhanChon = chon === null ? null : khoi.querySelector('label[for="' + chon.id + '"]');
    const theDs = khoi === null ? [] : [...khoi.querySelectorAll('ul li')].slice(0, 3).map(r);
    return {
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      oKe,
      tieuDe: r(tieuDe),
      mucDo: r(nhomMucDo),
      chon: r(chon),
      nhanChon: r(nhanChon),
      theDs,
    };
  })()`);

  check('PC 1440 · màn Công thức không tràn ngang', pcDs.tran === false);

  check(
    'PC 1440 · kệ "Công thức dùng hằng ngày" xếp 4 cột × 2 hàng',
    pcDs.oKe.length === 8 &&
      new Set(pcDs.oKe.map((o) => o.left)).size === 4 &&
      new Set(pcDs.oKe.map((o) => o.top)).size === 2,
    `${String(pcDs.oKe.length)} ô · ${String(new Set(pcDs.oKe.map((o) => o.left)).size)} cột · ${String(new Set(pcDs.oKe.map((o) => o.top)).size)} hàng`,
  );

  check(
    'PC 1440 · hàng tiêu đề danh sách: tiêu đề trái, "Mức độ" và "Sắp xếp" cùng hàng bên phải, nhãn đứng trái ô chọn',
    pcDs.tieuDe !== null &&
      pcDs.mucDo !== null &&
      pcDs.chon !== null &&
      pcDs.nhanChon !== null &&
      pcDs.mucDo.left > pcDs.tieuDe.right &&
      pcDs.chon.left > pcDs.mucDo.right &&
      Math.abs((pcDs.mucDo.top + pcDs.mucDo.bottom) / 2 - (pcDs.chon.top + pcDs.chon.bottom) / 2) <=
        8 &&
      pcDs.nhanChon.right <= pcDs.chon.left,
    `tiêu đề phải=${String(pcDs.tieuDe?.right)} · Mức độ trái=${String(pcDs.mucDo?.left)} · ô chọn trái=${String(pcDs.chon?.left)}`,
  );

  check(
    'PC 1440 · lưới thẻ danh sách ba cột',
    pcDs.theDs.length === 3 &&
      new Set(pcDs.theDs.map((t) => t.top)).size === 1 &&
      new Set(pcDs.theDs.map((t) => t.left)).size === 3,
    pcDs.theDs.map((t) => `${String(t.left)},${String(t.top)}`).join(' · '),
  );

  /* Hàng chip tràn ở 1440 (13 lựa chọn) — nút ‹ tắt ở đầu hàng, bấm › thì cuộn và ‹ bật. */
  const hangChip = await evaluate(`(async () => {
    const khoi = document.getElementById('danh-sach-cong-thuc');
    const [lui, toi] = [...(khoi?.querySelectorAll('button[aria-hidden="true"]') ?? [])];
    const khung = khoi?.querySelector('fieldset')?.parentElement ?? null;
    if (!lui || !toi || !khung) return null;
    const truoc = { tran: khung.scrollWidth > khung.clientWidth + 1, luiTat: lui.disabled, toiTat: toi.disabled };
    toi.click();
    await new Promise((d) => setTimeout(d, 800));
    return { ...truoc, cuon: Math.round(khung.scrollLeft), luiSau: lui.disabled };
  })()`);

  check(
    'PC 1440 · hàng chip nhóm: ‹ tắt ở đầu hàng, bấm › thì cuộn sang phải và ‹ bật',
    hangChip !== null &&
      (hangChip.tran === false ||
        (hangChip.luiTat === true &&
          hangChip.toiTat === false &&
          hangChip.cuon > 0 &&
          hangChip.luiSau === false)),
    JSON.stringify(hangChip),
  );

  /*
   * "Xem tất cả" bày đủ kệ NGAY TẠI CHỖ (chủ dự án chốt 15/09/2026): lưới 4 × 4, nút đổi thành "Thu
   * gọn" và giữ tiêu điểm, URL không đổi. Bấm lần nữa thì về lại 4 × 2. jsdom kiểm được thuộc tính
   * `hidden`; chỉ Chrome thật trả lời được "ô ẩn có thật sự không chiếm chỗ trong lưới không".
   */
  await open('/cong-thuc/');
  const xemTatCa = await evaluate(`(async () => {
    const ke = document.querySelector('#cong-thuc-hang-ngay')?.closest('section') ?? null;
    const nut = ke?.querySelector('button[aria-controls="cong-thuc-hang-ngay-luoi"]') ?? null;
    if (!ke || !nut) return null;
    const oHien = () =>
      [...ke.querySelectorAll('li')]
        .map((li) => li.getBoundingClientRect())
        .filter((b) => b.width > 0 && b.height > 0);
    const luoi = () => {
      const o = oHien();
      return {
        so: o.length,
        cot: new Set(o.map((b) => Math.round(b.left))).size,
        hang: new Set(o.map((b) => Math.round(b.top))).size,
      };
    };
    const truoc = { ...luoi(), mo: nut.getAttribute('aria-expanded') };
    const url = location.href;
    nut.focus();
    nut.click();
    await new Promise((d) => setTimeout(d, 300));
    const sau = {
      ...luoi(),
      mo: nut.getAttribute('aria-expanded'),
      chu: (nut.textContent ?? '').trim(),
      tieuDiem: document.activeElement === nut,
      urlGiuNguyen: location.href === url,
    };
    nut.click();
    await new Promise((d) => setTimeout(d, 300));
    return { truoc, sau, thuLai: luoi() };
  })()`);

  check(
    'PC 1440 · "Xem tất cả" bày đủ kệ tại chỗ (4 × 4), đổi thành "Thu gọn", bấm lần nữa về 4 × 2',
    xemTatCa !== null &&
      xemTatCa.truoc.so === 8 &&
      xemTatCa.truoc.mo === 'false' &&
      xemTatCa.sau.so === 16 &&
      xemTatCa.sau.cot === 4 &&
      xemTatCa.sau.hang === 4 &&
      xemTatCa.sau.mo === 'true' &&
      xemTatCa.sau.chu === 'Thu gọn' &&
      xemTatCa.sau.tieuDiem === true &&
      xemTatCa.sau.urlGiuNguyen === true &&
      xemTatCa.thuLai.so === 8 &&
      xemTatCa.thuLai.hang === 2,
    JSON.stringify(xemTatCa),
  );

  /*
   * Lịch trả nợ là công thức có ba thanh trượt và một thân riêng (bảng lịch dài) — đúng ca đã làm
   * khuôn trước hỏng: bảng nằm trong khối Kết quả kéo cả hàng lưới cao lên, đẩy Số liệu xuống tận
   * dưới bảng và bỏ cột trái trống rỗng. Phép kiểm này giữ cho thanh trượt đứng cạnh MÉP TRÊN của
   * cột phải, dù bảng có dài đến đâu. Trang `pe` không có thanh trượt nên đo ở đây.
   */
  await open('/cong-thuc/lich-tra-no/');
  const pcVay = await evaluate(DOC_CHI_TIET);

  check(
    'PC 1440 · lich-tra-no: thanh trượt (Số liệu) bên trái cùng mép trên với thẻ Kết quả bên phải',
    pcVay.soLieu !== null &&
      pcVay.ketQua !== null &&
      Math.abs(pcVay.soLieu.top - pcVay.ketQua.top) <= 1 &&
      pcVay.ketQua.left >= pcVay.soLieu.right,
    `mép trên ${String(pcVay.soLieu?.top)} / ${String(pcVay.ketQua?.top)}`,
  );

  check(
    'PC 1440 · lich-tra-no: thân riêng (bảng lịch) ở cột phải, phía trên biểu đồ',
    pcVay.ketQua !== null &&
      pcVay.bieuDo !== null &&
      pcVay.ketQua.left === pcVay.bieuDo.left &&
      pcVay.ketQua.top < pcVay.bieuDo.top,
    `Kết quả top=${String(pcVay.ketQua?.top)} · Biểu đồ top=${String(pcVay.bieuDo?.top)}`,
  );

  check('PC 1440 · lich-tra-no không tràn ngang', pcVay.tran === false);

  /*
   * ── Màn Tìm kiếm: bản vẽ riêng "Thư mục theo nhóm" (WF-09, phương án 05/10) ─────────────────
   *
   * Màn này có HAI dáng cho cùng một DOM, và CSS là thứ chọn: dưới 1024 là bản điện thoại đã
   * duyệt (sáu ô "Danh mục hot"), từ 1024 là thư mục thẻ nhóm. Cả hai khối cùng nằm trong DOM,
   * nên không phép kiểm jsdom nào phân biệt được chúng — chỉ trình duyệt thật mới trả lời.
   *
   * Gieo sẵn lịch sử tìm để hàng chip "Tìm gần đây" có gì mà hiện: bản vẽ xếp nó CÙNG HÀNG với ô
   * tìm, và một hàng rỗng thì phép so mép trên bên dưới thành vô nghĩa.
   */
  const DOC_TIM = `(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        top: Math.round(b.top),
        bottom: Math.round(b.bottom),
        left: Math.round(b.left),
        right: Math.round(b.right),
        width: Math.round(b.width),
      };
    };
    const hien = (el) =>
      el !== null && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0;
    const oTim = document.querySelector('input[type="search"]');
    const khoiRecent = document.querySelector('[class*="recent"]');
    const chips = khoiRecent?.querySelector('[class*="chips"]') ?? null;
    const tieuDeRecent = khoiRecent?.querySelector('h2') ?? null;
    const nutXoa = khoiRecent?.querySelector('button[aria-label]') ?? null;
    const luoi =
      [...document.querySelectorAll('ul')].find(
        (u) => u.className.includes('grid') && u.querySelector('section') !== null,
      ) ?? null;
    const hot =
      [...document.querySelectorAll('h2')]
        .find((h) => /Danh mục hot/.test(h.textContent ?? ''))
        ?.closest('section') ?? null;
    const the = luoi === null ? [] : [...luoi.querySelectorAll(':scope > li > section')];
    const dau = the[0] ?? null;
    return {
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      main: r(document.querySelector('main')),
      oTim: r(oTim === null ? null : oTim.closest('[class*="control"]')),
      khoiRecent: r(khoiRecent),
      chips: r(chips),
      chipsHien: hien(chips),
      /* Tiêu đề "TÌM GẦN ĐÂY" và nút xoá — bản vá 10/09: hai thứ này phải cùng một hàng. */
      tieuDeRecent: r(tieuDeRecent),
      nutXoa: r(nutXoa),
      thuMucHien: hien(luoi),
      hotHien: hien(hot),
      soThe: the.length,
      soCot: luoi === null ? null : getComputedStyle(luoi).gridTemplateColumns.trim().split(/\\s+/).length,
      /* Thẻ đóng khung chỉ ở khổ PC — dưới 1024 nó là danh sách trần như bản điện thoại. */
      vienThe: dau === null ? null : getComputedStyle(dau).borderTopWidth,
      /*
       * Số dòng công thức NHIỀU NHẤT trên một thẻ — bản vẽ vẽ bốn, và trần ấy là thứ giữ ba hàng
       * thẻ vừa hai màn. Đo bằng max chứ không đo thẻ đầu: nhóm "Thuế TNCN" chỉ có một công thức,
       * và thứ tự thẻ đi theo số đếm nên thẻ đầu đổi theo chế độ Cơ bản / Nâng cao.
       */
      soDongToiDa: the.length === 0 ? 0 : Math.max(...the.map((s) => s.querySelectorAll('li').length)),
    };
  })()`;

  await open('/tim-kiem/');
  await evaluate(
    `localStorage.setItem('ffb.recent.v1', JSON.stringify(['Giá hoà vốn thực','P/E','CAGR'])), true`,
  );
  await open('/tim-kiem/');
  const pcTim = await evaluate(DOC_TIM);

  check('PC 1440 · màn Tìm kiếm không tràn ngang', pcTim.tran === false);

  check(
    'PC 1440 · Tìm kiếm bày THƯ MỤC 12 nhóm, không phải sáu ô "Danh mục hot"',
    pcTim.thuMucHien === true && pcTim.hotHien === false && pcTim.soCot === 4 && pcTim.soThe >= 10,
    `thư mục ${String(pcTim.thuMucHien)} · hot ${String(pcTim.hotHien)} · ${String(pcTim.soThe)} thẻ / ${String(pcTim.soCot)} cột`,
  );

  check(
    'PC 1440 · Tìm kiếm: thẻ nhóm đóng khung và bày nhiều nhất bốn dòng công thức',
    pcTim.vienThe === '1px' && pcTim.soDongToiDa === 4,
    `viền ${String(pcTim.vienThe)} · nhiều nhất ${String(pcTim.soDongToiDa)} dòng`,
  );

  /* Ô tìm hãm còn ~40% hàng, khối "Tìm gần đây" đứng CẠNH nó chứ không xuống dòng — bản vẽ vẽ thế. */
  check(
    'PC 1440 · Tìm kiếm: ô tìm ~40% hàng, khối "Tìm gần đây" đứng cạnh bên phải',
    pcTim.oTim !== null &&
      pcTim.main !== null &&
      pcTim.chipsHien === true &&
      pcTim.chips !== null &&
      pcTim.oTim.width / (pcTim.main.width - 2 * (pcTim.oTim.left - pcTim.main.left)) <= 0.45 &&
      pcTim.chips.left >= pcTim.oTim.right,
    `ô tìm ${String(pcTim.oTim?.width)}px · chip trái=${String(pcTim.chips?.left)} · ô tìm phải=${String(pcTim.oTim?.right)}`,
  );

  /*
   * Nút xoá đứng CÙNG HÀNG với tiêu đề "TÌM GẦN ĐÂY" và dạt mép phải khối — chủ dự án chốt
   * 10/09/2026: _"đưa button xoá lên ngang hàng với Tìm Gần Đây nhưng phải căn phải"_.
   *
   * Đây là phép bắt được đúng lỗi vừa sửa: bản trước dồn tiêu đề + chip + nút thành một hàng flex,
   * nên khi chip vỡ thành hai hàng thì nút bị đẩy xuống hàng thứ ba. So tâm dọc với TIÊU ĐỀ (không
   * so với ô tìm) vì hai thứ này mới là cặp phải thẳng hàng nhau; và so mép phải với mép phải KHỐI,
   * thứ chỉ đúng khi khối giãn hết phần hàng còn lại.
   */
  check(
    'PC 1440 · Tìm kiếm: nút xoá cùng hàng với "TÌM GẦN ĐÂY" và dạt mép phải',
    pcTim.nutXoa !== null &&
      pcTim.tieuDeRecent !== null &&
      pcTim.khoiRecent !== null &&
      pcTim.chips !== null &&
      Math.abs(
        (pcTim.nutXoa.top + pcTim.nutXoa.bottom) / 2 -
          (pcTim.tieuDeRecent.top + pcTim.tieuDeRecent.bottom) / 2,
      ) <= 4 &&
      pcTim.khoiRecent.right - pcTim.nutXoa.right <= 1 &&
      pcTim.nutXoa.bottom <= pcTim.chips.top,
    `nút [${String(pcTim.nutXoa?.top)}–${String(pcTim.nutXoa?.bottom)}] phải=${String(pcTim.nutXoa?.right)} · tiêu đề [${String(pcTim.tieuDeRecent?.top)}–${String(pcTim.tieuDeRecent?.bottom)}] · khối phải=${String(pcTim.khoiRecent?.right)} · chip top=${String(pcTim.chips?.top)}`,
  );

  /*
   * Dải 1024–1279 cố ý giữ MỘT cột (chữ trục biểu đồ tụt xuống 8px nếu chia đôi ở đây — xem bảng
   * "BẬC MÀN" trong `globals.css`). Đo luôn để cái "cố ý" ấy không lặng lẽ trôi mất.
   */
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await open('/cong-thuc/pe/');
  const pc1024 = await evaluate(DOC_CHI_TIET);

  /*
   * So Số liệu với Kết quả chứ không với Công thức: từ khuôn "nhập trái · đáp án phải", Công thức
   * trải ngang trên cùng ở MỌI khổ, nên "Số liệu dưới Công thức" đúng cả ở 1280 và không phân
   * biệt được gì. Thứ đổi giữa hai bậc là Kết quả: cạnh Số liệu ở ≥1280, dưới Số liệu ở 1024.
   */
  check(
    'PC 1024 · vẫn một cột — thẻ Kết quả nằm DƯỚI khối Số liệu, không cạnh nó',
    pc1024.soLieu !== null && pc1024.ketQua !== null && pc1024.ketQua.top >= pc1024.soLieu.bottom,
    `Số liệu đáy=${String(pc1024.soLieu?.bottom)} · Kết quả top=${String(pc1024.ketQua?.top)}`,
  );

  check('PC 1024 · không tràn ngang', pc1024.tran === false);

  /* Khung của Số liệu đi cùng lưới hai cột — dưới 1280 khối vẫn trần như bản điện thoại đã duyệt. */
  check(
    'PC 1024 · khối Số liệu CHƯA đóng khung — khung chỉ bật cùng lưới hai cột',
    pc1024.vienSoLieu === '0px',
    `viền ${String(pc1024.vienSoLieu)}`,
  );

  /*
   * Màn Tìm kiếm đi NGƯỢC lại: nó đổi dáng ở 1024 chứ không 1280, vì thứ nó chờ là khung nới theo
   * viewport chứ không phải chỗ cho biểu đồ. Ba cột ở dải này — bốn cột thì thẻ chỉ còn ~220px và
   * tên "Phân tích kỹ thuật" cộng con số không vừa một dòng.
   */
  await open('/tim-kiem/');
  const tim1024 = await evaluate(DOC_TIM);

  check(
    'PC 1024 · Tìm kiếm đã là thư mục thẻ, lưới ba cột',
    tim1024.thuMucHien === true && tim1024.hotHien === false && tim1024.soCot === 3,
    `thư mục ${String(tim1024.thuMucHien)} · ${String(tim1024.soCot)} cột`,
  );

  check('PC 1024 · màn Tìm kiếm không tràn ngang', tim1024.tran === false);

  /*
   * ── 360: thứ tự MẮT THẤY ở điện thoại sau khi DOM đổi cho khuôn hai chồng ──────────────────
   *
   * Giải thích nay đứng TRƯỚC Kết quả trong DOM (xem docblock `.ask` ở `FormulaDetail.module.css`)
   * và chỉ `order` giữ nó ở dưới Biểu đồ khi nhìn. Mất luật `order` là điện thoại đọc thấy phần
   * giải thích chen giữa ô nhập và đáp án — mà không ca kiểm DOM nào bắt được, vì DOM vốn đã thế.
   */
  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 780,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await open('/cong-thuc/pe/');
  const dt360 = await evaluate(DOC_CHI_TIET);

  check(
    'Điện thoại 360 · thứ tự nhìn thấy giữ nguyên: Số liệu → Kết quả → Biểu đồ → Giải thích → Bảng biến',
    dt360.soLieu !== null &&
      dt360.ketQua !== null &&
      dt360.bieuDo !== null &&
      dt360.giaiThich !== null &&
      dt360.bangBien !== null &&
      dt360.ketQua.top >= dt360.soLieu.bottom &&
      dt360.bieuDo.top >= dt360.ketQua.bottom &&
      dt360.giaiThich.top >= dt360.bieuDo.bottom &&
      dt360.bangBien.top >= dt360.giaiThich.bottom,
    `top: Số liệu ${String(dt360.soLieu?.top)} · Kết quả ${String(dt360.ketQua?.top)} · Biểu đồ ${String(dt360.bieuDo?.top)} · Giải thích ${String(dt360.giaiThich?.top)} · Bảng biến ${String(dt360.bangBien?.top)}`,
  );

  /*
   * Vế kia của cặp hai dáng: ở điện thoại màn Tìm phải GIỮ NGUYÊN bản đã duyệt — sáu ô "Danh mục
   * hot", không phải thư mục thẻ. Thiếu phép này thì gỡ nhầm một dòng `display` là điện thoại
   * nhận trọn 12 thẻ nhóm mà không có gì báo.
   */
  await open('/tim-kiem/');
  const tim360 = await evaluate(DOC_TIM);

  check(
    'Điện thoại 360 · màn Tìm giữ bản đã duyệt — "Danh mục hot", KHÔNG phải thư mục thẻ',
    tim360.hotHien === true && tim360.thuMucHien === false && tim360.tran === false,
    `hot ${String(tim360.hotHien)} · thư mục ${String(tim360.thuMucHien)} · tràn ${String(tim360.tran)}`,
  );

  /*
   * ── Danh tính đầu thanh: ĐÚNG MỘT dạng HIỆN RA, và dạng nào là tuỳ khổ ────
   *
   * Chủ dự án chốt 10/09/2026: từ khổ có thanh điều hướng thì màn có tên quay về bày icon +
   * "Faculator"; dưới khổ ấy thì tên màn ở lại.
   *
   * Đây là chỗ DUY NHẤT đo được vế "hiện ra". Bất biến ấy trước nằm ở `AppHeader.test.tsx` dưới
   * dạng "chỉ MỘT thứ trong DOM", nhưng phép chọn nay là CSS (bắt buộc: thanh trên dựng sẵn vào
   * HTML tĩnh, đo `matchMedia` lúc render là lệch hydration) nên cả hai dạng CÙNG nằm trong DOM và
   * jsdom không phân biệt được. Xem docblock `HeaderIdentity`.
   *
   * `<h1>` phải có mặt ở CẢ HAI khổ: thân màn không dựng tiêu đề nào, nên nó là tiêu đề cấp một
   * duy nhất của trang. Ẩn khỏi mắt thì được, vắng mặt thì không.
   */
  const DOC_DANH_TINH = `(() => {
    const thanh = document.querySelector('header');
    if (thanh === null) return null;
    const h1 = thanh.querySelector('h1');
    const hieu = [...thanh.querySelectorAll('a')].find((a) => /Faculator/.test(a.textContent ?? ''));
    const hien = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1 && getComputedStyle(el).display !== 'none';
    };
    return {
      coH1: h1 !== null,
      chuH1: h1?.textContent ?? null,
      h1Hien: hien(h1),
      hieuHien: hien(hieu),
    };
  })()`;

  await open('/cong-thuc/');
  const dt360DanhTinh = await evaluate(DOC_DANH_TINH);

  check(
    'Điện thoại 360 · thanh trên bày TÊN MÀN, không bày tên sản phẩm',
    dt360DanhTinh !== null &&
      dt360DanhTinh.coH1 === true &&
      dt360DanhTinh.h1Hien === true &&
      dt360DanhTinh.hieuHien === false,
    dt360DanhTinh === null
      ? 'không thấy thanh trên'
      : `h1 "${String(dt360DanhTinh.chuH1)}" hiện ${String(dt360DanhTinh.h1Hien)} · Faculator hiện ${String(dt360DanhTinh.hieuHien)}`,
  );

  /* ── Đợt 2: Cài đặt và bảng chuỗi giá ─────────────────────────────────── */

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await open('/cai-dat/');
  const pcCaiDat = await evaluate(`(() => {
    const khoi = [...document.querySelectorAll('main section')].map((el) => {
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top), left: Math.round(b.left), right: Math.round(b.right) };
    });
    return {
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      so: khoi.length,
      dau: khoi[0] ?? null,
      thuBa: khoi[2] ?? null,
    };
  })()`);

  /*
   * Khối 1 ("Chế độ hiển thị") và khối đầu của cột phải là đỉnh của hai cột, nên chúng phải cùng
   * mép trên và khối kia phải nằm hẳn bên phải khối 1. Đây cũng là phép kiểm bắt được lỗi ngược
   * lại: nếu ai gỡ hai bọc `.col` để về lưới phẳng, khối thứ ba vẫn bên phải nhưng khối 2 sẽ bị
   * đẩy xuống đáy — thứ mà phép so mép trên này không thấy, nên đo thêm số khối cho chắc.
   *
   * Vẫn ĐÚNG BỐN khối kể cả khi bản kiểm kê chín kho đang ẩn sau cờ `HIEN_KHOI_DU_LIEU`
   * (14/09/2026): khối 3 lúc ấy rút xuống còn tiêu đề và một nút xoá sạch, nhưng nó KHÔNG biến
   * mất — nếu mất thì cột phải chỉ còn một khối và phép so mép trên dưới đây đo sang thứ khác.
   */
  check(
    'PC 1440 · Cài đặt xếp hai cột — khối Chế độ và khối Dữ liệu cùng mép trên',
    pcCaiDat.so === 4 &&
      pcCaiDat.dau !== null &&
      pcCaiDat.thuBa !== null &&
      Math.abs(pcCaiDat.dau.top - pcCaiDat.thuBa.top) <= 1 &&
      pcCaiDat.thuBa.left >= pcCaiDat.dau.right,
    `${String(pcCaiDat.so)} khối · mép trên ${String(pcCaiDat.dau?.top)} / ${String(pcCaiDat.thuBa?.top)}`,
  );

  check('PC 1440 · Cài đặt không tràn ngang', pcCaiDat.tran === false);

  /*
   * ── Thanh điều hướng đứng YÊN khi đổi màn ────────────────────────────────
   *
   * Chủ dự án gửi bốn ảnh thanh trên: _"mỗi lần click vào một tab thì giao diện lại bị lệch đi quá
   * xa"_. Đo được ở 1500px, tâm hàng nav: 765 / **682** / 772 / 765 — màn '/cong-thuc/' lệch 83px
   * vì hồi ấy nó là màn duy nhất có nút Cơ bản / Nâng cao ở thanh trên, mà cách xếp cũ căn nav giữa
   * PHẦN CÒN LẠI chứ không giữa thanh.
   *
   * Từ 15/09/2026 cụm nút ấy dời xuống thân màn Công thức, nên hai màn so dưới đây nay có cùng một
   * cụm phải — phép so vẫn giữ: nó gác chuyện nav thôi đứng giữa THANH, không riêng chuyện cụm nút.
   * Cả hai màn đủ dài để có thanh cuộn nên `clientWidth` bằng nhau, và không dính cú giãn 15px khi
   * trang ngắn bỏ thanh cuộn (chuyện riêng, đã chốt để lại — xem `globals.css`).
   *
   * Vế thứ hai gác một lỗi mà chính bản vá này suýt tạo ra: mục lưới mặc định `stretch`, nên thẻ
   * link "Faculator" phình từ 119px lên 497px và biến gần nửa thanh thành đích bấm vô hình về màn
   * Công thức. `justify-items: start` chặn điều đó; con số dưới đây là thứ giữ nó.
   */
  const DOC_NAV = `(() => {
    const nav = document.querySelector('header nav ul');
    const hieu = [...document.querySelectorAll('header a')].find((a) => /Faculator/.test(a.textContent ?? ''));
    if (nav === null) return null;
    const r = nav.getBoundingClientRect();
    return {
      tam: Math.round((r.left + r.right) / 2),
      rongHieu: hieu === undefined ? null : Math.round(hieu.getBoundingClientRect().width),
      clientWidth: document.documentElement.clientWidth,
    };
  })()`;

  await open('/cong-thuc/');
  const navCongThuc = await evaluate(DOC_NAV);
  /* Về lại '/cai-dat/' — phép kiểm danh tính ngay dưới đo trên chính màn ấy. */
  await open('/cai-dat/');
  const navCaiDat = await evaluate(DOC_NAV);

  check(
    'PC 1440 · hàng nav đứng yên khi đổi màn — căn giữa thanh, không giữa phần còn lại',
    navCongThuc !== null &&
      navCaiDat !== null &&
      navCongThuc.clientWidth === navCaiDat.clientWidth &&
      Math.abs(navCongThuc.tam - navCaiDat.tam) <= 1,
    navCongThuc === null || navCaiDat === null
      ? 'không thấy hàng nav'
      : `tâm: Công thức ${String(navCongThuc.tam)} · Cài đặt ${String(navCaiDat.tam)}`,
  );

  check(
    'PC 1440 · khối "Faculator" chỉ rộng bằng nội dung — không thành đích bấm vô hình',
    navCaiDat !== null && navCaiDat.rongHieu !== null && navCaiDat.rongHieu <= 220,
    `rộng ${String(navCaiDat?.rongHieu)}px`,
  );

  /* Vế PC của phép kiểm danh tính ở khổ 360 phía trên — cùng một bất biến, hai khổ. */
  const pcDanhTinh = await evaluate(DOC_DANH_TINH);

  check(
    'PC 1440 · màn Cài đặt bày TÊN SẢN PHẨM, tên màn ẩn khỏi mắt nhưng vẫn là <h1> của trang',
    pcDanhTinh !== null &&
      pcDanhTinh.coH1 === true &&
      pcDanhTinh.h1Hien === false &&
      pcDanhTinh.hieuHien === true,
    pcDanhTinh === null
      ? 'không thấy thanh trên'
      : `h1 "${String(pcDanhTinh.chuH1)}" hiện ${String(pcDanhTinh.h1Hien)} · Faculator hiện ${String(pcDanhTinh.hieuHien)}`,
  );

  /*
   * ── Form thêm mã của màn Danh mục xếp hai cột, hàng nút dạt phải ─────────
   *
   * Chủ dự án chụp form ở ~1500px: _"giao diện đang để thừa khá nhiều… chia các ô nhập trên thành
   * 2 cột chia đều. 2 button Thêm vào danh mục và Huỷ chuyển sang bên phải"_.
   *
   * Chỉ đo được ở đây, đúng lý do `ChainBody.test.tsx` đã ghi: luật nằm trong `@media` của một CSS
   * Module, mà jsdom không áp CSS Module nên một ca vitest sẽ xanh bất kể file CSS viết gì.
   *
   * Đo hai ô ĐẦU TIÊN chứ không đo ô Beta: Beta chỉ dựng ở chế độ Nâng cao (FR-09), còn hai ô đầu
   * ("Mã cổ phiếu", "Số cổ phiếu nắm giữ") có ở cả hai chế độ — nên phép kiểm không phụ thuộc vào
   * việc trang đang ở chế độ nào.
   */
  await open('/danh-muc/');
  await evaluate(
    `(() => { const b = [...document.querySelectorAll('button')].find((x) => /Thêm mã/.test(x.textContent ?? '')); if (b) b.click(); return Boolean(b); })()`,
  );
  await waitFor(
    `[...document.querySelectorAll('button')].some((b) => /Thêm vào danh mục/.test(b.textContent ?? ''))`,
  );

  /*
   * Từ 22/09/2026 form nằm trong một HỘP THOẠI nổi giữa màn, không còn chạy thẳng trong trang.
   * Nên đường dò đổi: hàng nút là `<footer>` của tấm (đã dạt phải sẵn bằng CSS của primitive), và
   * form là con duy nhất trong thân tấm. Bản trước lấy `nút.parentElement.parentElement`, mà nay
   * đường ấy dẫn tới `.panel` — tức "ô nhập" sẽ đếm được tiêu đề tấm và cả thân tấm.
   */
  const pcDanhMuc = await evaluate(`(() => {
    const hop = document.querySelector('dialog[open]');
    const than = hop === null ? null : hop.querySelector('[class*="body"]');
    const form = than === null ? null : than.firstElementChild;
    const hang = hop === null ? null : hop.querySelector('footer');
    if (form === null || hang === null) return { thay: false };

    const doKhung = (el) => {
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top), left: Math.round(b.left), right: Math.round(b.right) };
    };
    // Ô nhập = con trực tiếp của form, trừ câu lỗi chung.
    const o = [...form.children].filter((el) => !/formError/.test(String(el.className)));
    const nutTrongHang = [...hang.querySelectorAll('button')];
    const cuoi = nutTrongHang[nutTrongHang.length - 1];
    const hopKhung = hop.getBoundingClientRect();

    return {
      thay: true,
      soO: o.length,
      mot: o[0] === undefined ? null : doKhung(o[0]),
      hai: o[1] === undefined ? null : doKhung(o[1]),
      soNut: nutTrongHang.length,
      // Hở từ nút cuối tới mép phải hàng nút — dạt phải thì gần bằng 0.
      hoPhai:
        cuoi === undefined
          ? null
          : Math.round(hang.getBoundingClientRect().right - cuoi.getBoundingClientRect().right),
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      // Tấm nổi giữa màn: rộng đúng một nửa khổ 1440, và cách đều hai mép.
      rong: Math.round(hopKhung.width),
      leTrai: Math.round(hopKhung.left),
      lePhai: Math.round(window.innerWidth - hopKhung.right),
    };
  })()`);

  check(
    'PC 1440 · form thêm mã xếp hai cột — hai ô đầu cùng mép trên, ô thứ hai nằm hẳn bên phải',
    pcDanhMuc.thay === true &&
      pcDanhMuc.mot !== null &&
      pcDanhMuc.hai !== null &&
      Math.abs(pcDanhMuc.mot.top - pcDanhMuc.hai.top) <= 1 &&
      pcDanhMuc.hai.left >= pcDanhMuc.mot.right,
    pcDanhMuc.thay !== true
      ? 'không mở được form'
      : `${String(pcDanhMuc.soO)} ô · mép trên ${String(pcDanhMuc.mot?.top)} / ${String(pcDanhMuc.hai?.top)}`,
  );

  check(
    'PC 1440 · hàng nút của form thêm mã dạt về mép phải',
    pcDanhMuc.hoPhai !== null && pcDanhMuc.hoPhai <= 1,
    `${String(pcDanhMuc.soNut)} nút · hở phải ${String(pcDanhMuc.hoPhai)}px`,
  );

  check('PC 1440 · màn Danh mục mở form không tràn ngang', pcDanhMuc.tran === false);

  /*
   * Chủ dự án chốt hình dạng bằng số: _"bật popup mới lên giữa màn chiếm tầm 50% màn hình width
   * height"_. 50% của 1440 là 720, và tấm phải cách đều hai mép — canh giữa `<dialog>` bằng
   * `margin: auto` rất dễ hỏng lặng: thiếu `inset: 0` thì tấm dán mép trái và không ai kêu.
   */
  check(
    'PC 1440 · hộp thoại form rộng đúng nửa màn và nằm giữa',
    pcDanhMuc.rong === 720 && Math.abs(pcDanhMuc.leTrai - pcDanhMuc.lePhai) <= 1,
    `rộng ${String(pcDanhMuc.rong)}px · lề ${String(pcDanhMuc.leTrai)}/${String(pcDanhMuc.lePhai)}`,
  );

  /*
   * ── Hình dạng của hộp thoại và của các ô trong nó ────────────────────────
   *
   * Ba khẳng định này sinh ra từ ba lỗi chủ dự án chụp lại ngày 22/09/2026, và cả ba đều là loại
   * chỉ trình duyệt mới thấy:
   *
   *   1. Bốn góc tấm phải bo đều. Bản đầu khai `.panelCenter` TRƯỚC `.panel` trong cùng một file,
   *      hai bộ chọn cùng hạng độ ưu tiên nên cái sau thắng — và tấm nổi giữa màn thừa hưởng
   *      `border-radius: lg lg 0 0` của tấm dán đáy, tức hai góc dưới vuông.
   *   2. Sáu ô trong form phải CAO BẰNG NHAU. Hai ô mở sheet là `<button>` tự dựng, bản đầu tự
   *      đặt số đo nên chúng lệch với bốn ô nhập thật ở bốn chỗ cùng lúc.
   *   3. Hai cột phải thẳng hàng theo từng hàng. Đây là hệ quả của (2), nhưng đo riêng: ô cao
   *      bằng nhau mà khe nhãn khác nhau thì hàng vẫn so le.
   */
  const pcHopThoai = await evaluate(
    `(() => {
    const hop = document.querySelector('dialog[open]');
    const tam = hop === null ? null : hop.querySelector('[class*="panel"]');
    const than = hop === null ? null : hop.querySelector('[class*="body"]');
    const form = than === null ? null : than.firstElementChild;
    if (tam === null || form === null) return { thay: false };

    const s = getComputedStyle(tam);
    const goc = [
      s.borderTopLeftRadius,
      s.borderTopRightRadius,
      s.borderBottomRightRadius,
      s.borderBottomLeftRadius,
    ].map((v) => Math.round(parseFloat(v)));

    const o = [...form.children].filter((el) => !/formError/.test(String(el.className)));
    /*
     * Đo đúng cái hộp CÓ VIỀN của mỗi trường, không đo thứ nằm trong nó: ô nhập thật thì viền ở
     * `.control` còn ` <
      input >
      ` bên trong chỉ cao bằng dòng chữ, ô mở sheet thì viền ở chính
     * ` <
      button >
      `. Đo lẫn hai tầng là phép so luôn lệch, kể cả khi màn đúng.
     */
    const cao = o.map((el) => {
      const c = el.querySelector('[class*="control"], button');
      return c === null ? null : Math.round(c.getBoundingClientRect().height);
    });
    const mepTren = o.map((el) => Math.round(el.getBoundingClientRect().top));

    // Hai ô cùng một hàng của lưới hai cột: (0,1), (2,3), (4,5).
    const soLe = [];
    for (let i = 0; i + 1 < o.length; i += 2) {
      if (Math.abs((mepTren[i] ?? 0) - (mepTren[i + 1] ?? 0)) > 1) {
        soLe.push(String(i / 2 + 1));
      }
    }

    return { thay: true, goc, soO: o.length, cao, soLe };
  })()`,
  );

  check(
    'PC 1440 · bốn góc hộp thoại bo đều, không góc nào vuông',
    pcHopThoai.thay === true &&
      pcHopThoai.goc.every((v) => v >= 8) &&
      new Set(pcHopThoai.goc).size === 1,
    pcHopThoai.thay !== true ? 'không thấy tấm' : `bán kính bốn góc: ${pcHopThoai.goc.join('/')}px`,
  );

  check(
    'PC 1440 · sáu ô của form cao bằng nhau, kể cả hai ô mở sheet',
    pcHopThoai.thay === true &&
      pcHopThoai.cao.length > 0 &&
      pcHopThoai.cao.every((v) => v !== null) &&
      new Set(pcHopThoai.cao).size === 1,
    `${String(pcHopThoai.soO)} ô · chiều cao ${(pcHopThoai.cao ?? []).join('/')}px`,
  );

  check(
    'PC 1440 · hai cột của form thẳng hàng theo từng hàng',
    pcHopThoai.thay === true && pcHopThoai.soLe.length === 0,
    (pcHopThoai.soLe ?? []).length === 0 ? '' : `hàng so le: ${pcHopThoai.soLe.join(', ')}`,
  );

  /*
   * Sheet chọn mã mở TỪ TRONG hộp thoại cũng phải nổi giữa màn (22/09/2026).
   *
   * Một tấm dán đáy trượt lên đè lên một tấm đang nổi ở giữa thì hai lớp đọc ra như hai thứ không
   * liên quan, và cái ở dưới thì vẫn ở giữa màn. Đo bằng lề: tấm nổi giữa có lề trái bằng lề
   * phải VÀ có lề dưới; tấm dán đáy thì lề dưới bằng 0.
   */
  const pcSheetTren = await evaluate(
    `(async () => {
    // Ô đầu tiên của form là ô chọn mã, và nút của nó là ` <
      button >
      ` đầu tiên trong form.
    const than = document.querySelector('dialog[open] [class*="body"]');
    const form = than === null ? null : than.firstElementChild;
    const nut = form === null ? null : form.querySelector('button');
    if (nut === null) return { thay: false };
    nut.click();

    for (let i = 0; i < 40; i += 1) {
      if (document.querySelectorAll('dialog[open]').length > 1) break;
      await new Promise((d) => setTimeout(d, 50));
    }
    const mo = [...document.querySelectorAll('dialog[open]')];
    if (mo.length < 2) return { thay: false, soTam: mo.length };

    const tren = mo[mo.length - 1];
    const k = tren.getBoundingClientRect();
    const ket = {
      thay: true,
      leTrai: Math.round(k.left),
      lePhai: Math.round(window.innerWidth - k.right),
      leDuoi: Math.round(window.innerHeight - k.bottom),
    };

    // Đóng lại để phép đo sau nhìn thấy đúng hộp thoại form.
    const dong = [...tren.querySelectorAll('button')].find((b) => /Đóng|Quay lại/.test(b.textContent ?? ''));
    if (dong !== undefined) dong.click();
    await new Promise((d) => setTimeout(d, 100));
    return ket;
  })()`,
  );

  check(
    'PC 1440 · sheet chọn mã mở từ trong hộp thoại cũng nổi giữa màn, không dán đáy',
    pcSheetTren.thay === true &&
      Math.abs(pcSheetTren.leTrai - pcSheetTren.lePhai) <= 1 &&
      pcSheetTren.leDuoi > 0,
    pcSheetTren.thay !== true
      ? `không mở được sheet thứ hai (${String(pcSheetTren.soTam ?? 0)} tấm đang mở)`
      : `lề ${String(pcSheetTren.leTrai)}/${String(pcSheetTren.lePhai)} · đáy ${String(pcSheetTren.leDuoi)}px`,
  );

  /*
   * ── Bảng Nắm giữ ở khổ PC ────────────────────────────────────────────────
   *
   * Đóng hộp thoại trước, vì nó đang che chính cái bảng cần đo.
   *
   * Khẳng định thứ hai là chỗ dễ hỏng âm thầm nhất của cả đợt: nút mở hàng là một `<button>`
   * `position: absolute; inset: 0` neo vào `<tr>` bằng `position: relative`. Định vị tương đối
   * trên một hàng bảng ĐƯỢC PHÉP và cả ba engine dựng đúng, nhưng nếu nó hỏng thì nút vẫn tồn
   * tại, vẫn bấm được bằng bàn phím, chỉ là hộp của nó tụt về đâu đó — không ca vitest nào thấy,
   * vì jsdom không tính bố cục. Nên đo bằng toạ độ thật.
   *
   * Lời giải thay thế (bọc cả hàng vào một nút) thì KHÔNG được: `aria-label` nuốt toàn bộ nội
   * dung bên trong nút, nên mọi con số biến mất khỏi bản đọc màn hình. Đã hỏng hai lần, ghi ở
   * `PortfolioScreen.tsx`.
   */
  await evaluate(
    `(() => { const h = document.querySelector('dialog[open]'); if (h === null) return true; const n = [...h.querySelectorAll('button')].find((b) => /Huỷ/.test(b.textContent ?? '')); if (n) n.click(); return true; })()`,
  );
  await waitFor(`document.querySelector('dialog[open]') === null`);

  const pcBang = await evaluate(`(() => {
    const bang = document.querySelector('main table');
    const dau = bang === null ? null : bang.querySelector('thead');
    const hang = bang === null ? null : bang.querySelector('tbody tr');
    if (bang === null || dau === null || hang === null) return { thay: false };

    const o = [...hang.children];
    const hangKhung = hang.getBoundingClientRect();
    const nut = hang.querySelector('button');
    const nutKhung = nut === null ? null : nut.getBoundingClientRect();

    return {
      thay: true,
      dauHien: getComputedStyle(dau).display,
      soCot: dau.querySelectorAll('th').length,
      soO: o.length,
      // Xếp thành cột thì mọi ô cùng một mép trên.
      soMepTren: new Set(o.map((el) => Math.round(el.getBoundingClientRect().top))).size,
      lechNut:
        nutKhung === null
          ? null
          : Math.round(
              Math.abs(nutKhung.top - hangKhung.top) +
                Math.abs(nutKhung.left - hangKhung.left) +
                Math.abs(nutKhung.width - hangKhung.width) +
                Math.abs(nutKhung.height - hangKhung.height),
            ),
    };
  })()`);

  check(
    'PC 1440 · bảng Nắm giữ dựng đủ chín cột, mọi ô của một mã trên cùng một hàng',
    pcBang.thay === true &&
      pcBang.dauHien === 'table-header-group' &&
      pcBang.soCot === 9 &&
      pcBang.soO === 9 &&
      pcBang.soMepTren === 1,
    pcBang.thay !== true
      ? 'không thấy bảng'
      : `${String(pcBang.soCot)} tiêu đề · ${String(pcBang.soO)} ô · ${String(pcBang.soMepTren)} mức mép trên`,
  );

  check(
    'PC 1440 · nút mở hàng phủ trùng khít cả hàng, không tụt khỏi nó',
    pcBang.lechNut !== null && pcBang.lechNut <= 2,
    `lệch tổng cộng ${String(pcBang.lechNut)}px`,
  );

  /*
   * Tiêu đề cột và ô số của CÙNG một cột phải căn cùng một mép.
   *
   * Chủ dự án báo 22/09/2026: "SỐ LƯỢNG" dính mép trái trong khi "123" dính mép phải của đúng
   * cột ấy. Gốc là hai luật `text-align` rời nhau — một cho `<th>`, một cho `<td>` — và chỉ cần
   * một luật đổi là hai hàng nói khác nhau. Nay cả hai khoá vào vị trí cột, và phép kiểm này so
   * thẳng giá trị tính toán của hai bên nên nó đỏ ngay lúc ai đó tách chúng ra lần nữa.
   */
  const pcCanLe = await evaluate(`(() => {
    const th = [...document.querySelectorAll('main table thead th')];
    const td = [...document.querySelectorAll('main table tbody tr')[0].children];
    if (th.length !== td.length) return { thay: false, soTh: th.length, soTd: td.length };
    const lech = [];
    th.forEach((o, i) => {
      const a = getComputedStyle(o).textAlign;
      const b = getComputedStyle(td[i]).textAlign;
      if (a !== b) lech.push(String(i + 1) + ': ' + a + ' / ' + b);
    });
    return { thay: true, lech };
  })()`);

  check(
    'PC 1440 · tiêu đề cột và ô số căn cùng một mép ở cả chín cột',
    pcCanLe.thay === true && pcCanLe.lech.length === 0,
    pcCanLe.thay !== true
      ? `số ô lệch nhau: ${String(pcCanLe.soTh)} tiêu đề / ${String(pcCanLe.soTd)} ô`
      : `cột lệch: ${pcCanLe.lech.join(' · ') || 'không'}`,
  );

  /*
   * ── Mở một hàng thì bảng KHÔNG được nhảy chỗ ─────────────────────────────
   *
   * Đây là phép kiểm quan trọng nhất của đợt, vì nó gác đúng cái bẫy đã làm hỏng bản đầu: đặt
   * `display: flex` lên `<td>` của hàng mở ra khiến nó thôi là table-cell, trình duyệt bọc nó
   * vào một ô ẩn danh `colspan=1`, và ô ấy rơi vào CỘT MỘT — kéo cột "Mã" rộng bằng cả cụm nút,
   * đẩy bảy cột còn lại sang phải. Triệu chứng chỉ lộ ra ở hàng ĐANG MỞ, nên cả bảng nhảy chỗ
   * mỗi lần bấm. Không ca vitest nào thấy được: jsdom không tính bố cục.
   *
   * Đo ba thứ cùng lúc: mép trái của chín tiêu đề cột trước và sau khi mở, `colspan` còn nguyên
   * không, và ô ấy có thật sự rộng bằng cả bảng không.
   */
  const pcMoHang = await evaluate(`(async () => {
    const mepCot = () =>
      [...document.querySelectorAll('main table thead th')].map((el) =>
        Math.round(el.getBoundingClientRect().left),
      );

    const truoc = mepCot();
    const nut = [...document.querySelectorAll('main table tbody button')].find((b) =>
      /^Chi tiết /.test(b.getAttribute('aria-label') ?? ''),
    );
    if (nut === undefined) return { thay: false };
    nut.click();
    await new Promise((d) => requestAnimationFrame(() => requestAnimationFrame(() => d(null))));

    const sau = mepCot();
    const bang = document.querySelector('main table');
    const hangCT = document.querySelectorAll('main table tbody tr')[1];
    const oCT = hangCT === undefined ? null : hangCT.querySelector('td');
    const nutCT = hangCT === undefined ? [] : [...hangCT.querySelectorAll('button')];
    const cuoi = nutCT[nutCT.length - 1];
    const bangKhung = bang === null ? null : bang.getBoundingClientRect();

    return {
      thay: true,
      lechCot: Math.max(...truoc.map((x, i) => Math.abs(x - (sau[i] ?? x)))),
      colspan: oCT === null ? null : oCT.getAttribute('colspan'),
      // Ô trải hết bảng thì bề ngang của nó gần bằng bề ngang bảng.
      hutO:
        oCT === null || bangKhung === null
          ? null
          : Math.round(bangKhung.width - oCT.getBoundingClientRect().width),
      soNut: nutCT.length,
      hoPhaiNut:
        cuoi === undefined || bangKhung === null
          ? null
          : Math.round(bangKhung.right - cuoi.getBoundingClientRect().right),
    };
  })()`);

  check(
    'PC 1440 · mở một hàng thì chín cột đứng yên, không bị đẩy sang phải',
    pcMoHang.thay === true && pcMoHang.lechCot <= 1,
    pcMoHang.thay !== true
      ? 'không mở được hàng nào'
      : `cột lệch tối đa ${String(pcMoHang.lechCot)}px`,
  );

  check(
    'PC 1440 · ô của hàng mở ra giữ nguyên colspan và trải hết bề ngang bảng',
    pcMoHang.colspan === '9' && pcMoHang.hutO !== null && pcMoHang.hutO <= 2,
    `colspan ${String(pcMoHang.colspan)} · hụt ${String(pcMoHang.hutO)}px so với bảng`,
  );

  /*
   * Hai nút Sửa · Bỏ mã dạt hẳn phải, theo yêu cầu chủ dự án. Ngưỡng 48px là khoảng đệm của ô
   * cộng khoảng đệm của khối bên trong — nếu nút nằm bên trái thì con số này lên tới hàng trăm.
   */
  check(
    'PC 1440 · nút Sửa và Bỏ mã của hàng mở ra dạt về mép phải',
    pcMoHang.soNut === 2 && pcMoHang.hoPhaiNut !== null && pcMoHang.hoPhaiNut <= 48,
    `${String(pcMoHang.soNut)} nút · hở phải ${String(pcMoHang.hoPhaiNut)}px`,
  );

  await evaluate(`localStorage.removeItem('ffb.portfolio.v1'), true`);

  await open('/du-lieu/');
  const pcDuLieu = await evaluate(`(() => {
    const thanh = document.querySelector('main [class*="actions"]');
    const nut = thanh === null ? [] : [...thanh.querySelectorAll('button')];
    const cuoi = nut.length === 0 ? null : nut[nut.length - 1].getBoundingClientRect();
    const khung = thanh === null ? null : thanh.getBoundingClientRect();
    return {
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      soNut: nut.length,
      // Khoảng hở từ nút cuối tới mép phải của thanh — dạt phải thì nó phải gần bằng 0.
      hoPhai: cuoi === null || khung === null ? null : Math.round(khung.right - cuoi.right),
    };
  })()`);

  check(
    'PC 1440 · thanh công cụ bảng chuỗi giá dạt về mép phải',
    pcDuLieu.hoPhai !== null && pcDuLieu.hoPhai <= 1,
    `${String(pcDuLieu.soNut)} nút · hở phải ${String(pcDuLieu.hoPhai)}px`,
  );

  check('PC 1440 · bảng chuỗi giá không tràn ngang', pcDuLieu.tran === false);

  /*
   * ── Bảng chuỗi giá theo bản vẽ 10/09/2026: nến trên, bảng và cột kiểm dưới ──────────────────
   *
   * Ba nhóm phép, và cả ba đều CHỈ đo được ở đây:
   *
   *   1. Bố cục hai cột nằm trong `@media` của một CSS Module — jsdom không áp CSS Module, nên một
   *      ca vitest sẽ xanh bất kể file CSS viết gì (cùng lý do `ChainBody.test.tsx` đã ghi).
   *   2. Biểu đồ nến là SVG dựng từ `viewBox`; số cây nến thật chỉ đếm được trên DOM đã vẽ.
   *   3. Hai khổ khung vẽ (`compact` / `wide`) do `useChartSize()` chọn qua `matchMedia`, thứ mà
   *      jsdom không cài đặt — nên chỉ trình duyệt thật mới phân biệt được hai khổ.
   *
   * Gieo một chuỗi có HAI phiên hỏng, đúng cảnh bản vẽ: một phiên giá cao nhỏ hơn giá thấp, một
   * phiên thiếu giá đóng cửa. Cả hai phải BỊ BỎ khỏi hình mà vẫn được đếm ra ở hàng chú thích.
   */
  const GIEO_CHUOI = `(() => {
    const rows = [];
    for (let i = 0; i < 80; i += 1) {
      const d = new Date(2025, 0, 2 + i);
      const date =
        String(d.getFullYear()) +
        '-' +
        String(d.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(d.getDate()).padStart(2, '0');
      const open = 60000 + i * 120;
      const close = open + (i % 3 === 0 ? -240 : 260);
      rows.push({
        date,
        open,
        high: Math.max(open, close) + 200,
        low: Math.min(open, close) - 200,
        close,
        volume: 1000000 + i * 5000,
      });
    }
    rows[4].high = 100;
    rows[4].low = 90000;
    rows[9].close = null;
    localStorage.setItem('ffb.series.v1', JSON.stringify({ code: 'FPT', rows }));
    return rows.length;
  })()`;

  const DOC_CHUOI = `(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top), left: Math.round(b.left), right: Math.round(b.right), width: Math.round(b.width) };
    };
    const fig = document.querySelector('main figure');
    const svg = fig === null ? null : fig.querySelector('svg');
    const oNgay = [...document.querySelectorAll('input')].filter((i) =>
      /· Ngày$/.test(i.getAttribute('aria-label') ?? ''),
    );
    const bang = [...document.querySelectorAll('main section')].find(
      (s) => /Bảng số liệu/i.test(s.querySelector('h2')?.textContent ?? ''),
    ) ?? null;
    const luu = JSON.parse(localStorage.getItem('ffb.series.v1') ?? '{}').rows ?? [];
    return {
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      /* Khổ khung vẽ đang dùng — 360 là 'compact', 960 là 'wide'. */
      viewW: svg === null ? null : Number((svg.getAttribute('viewBox') ?? '0 0 0 0').split(' ')[2]),
      soNen: svg === null ? 0 : svg.querySelectorAll('rect[class*="body"]').length,
      soVetLoi: svg === null ? 0 : svg.querySelectorAll('rect[class*="badBand"]').length,
      soNutKhoang: fig === null ? 0 : fig.querySelectorAll('[role="group"] button').length,
      chuThich: fig === null ? '' : (fig.querySelector('figcaption')?.textContent ?? ''),
      bang: r(bang),
      kiem: r(document.querySelector('main aside')),
      ngayDau: oNgay[0]?.value ?? null,
      ngayCuoi: oNgay[oNgay.length - 1]?.value ?? null,
      soDong: oNgay.length,
      /* Mảng ĐÃ LƯU — vế đắt nhất: nó phải theo thời gian cũ → mới, ngược với thứ tự trên màn. */
      luuDau: luu[0]?.date ?? null,
      luuCuoi: luu[luu.length - 1]?.date ?? null,
    };
  })()`;

  await evaluate(GIEO_CHUOI);
  await open('/du-lieu/');
  const pcChuoi = await evaluate(DOC_CHUOI);

  check(
    'PC 1440 · bảng chuỗi giá có biểu đồ nến, và phiên LỖI thì không vẽ nhưng vẫn được đếm',
    pcChuoi.soNen === 78 && pcChuoi.soVetLoi === 2 && /2 phiên lỗi/.test(pcChuoi.chuThich),
    `${String(pcChuoi.soNen)} nến · ${String(pcChuoi.soVetLoi)} vệt lỗi · chú thích "${String(pcChuoi.chuThich).slice(-40)}"`,
  );

  check(
    'PC 1440 · biểu đồ nến dùng khổ khung rộng, và có đủ bốn nút chọn khoảng',
    pcChuoi.viewW === 960 && pcChuoi.soNutKhoang === 4,
    `viewBox rộng ${String(pcChuoi.viewW)} · ${String(pcChuoi.soNutKhoang)} nút`,
  );

  check(
    'PC 1440 · bảng số liệu bên trái, cột "Kiểm tra dữ liệu" bên phải, cùng mép trên',
    pcChuoi.bang !== null &&
      pcChuoi.kiem !== null &&
      pcChuoi.kiem.left >= pcChuoi.bang.right &&
      Math.abs(pcChuoi.kiem.top - pcChuoi.bang.top) <= 2,
    `bảng ${String(pcChuoi.bang?.left)}–${String(pcChuoi.bang?.right)} · cột kiểm ${String(pcChuoi.kiem?.left)} rộng ${String(pcChuoi.kiem?.width)}`,
  );

  /*
   * Vế NHÌN THẤY và vế ĐÃ LƯU đi ngược chiều nhau, và phải kiểm cả hai trong một phép.
   *
   * Lật mảng đã lưu là cách sai hiển nhiên nhất để làm ra bảng "mới nhất lên đầu", và nó hỏng thứ
   * không ai nhìn thấy: `closesOf()` đọc mảng ấy như một chuỗi thời gian, nên Beta, độ biến động
   * và VaR sẽ tính trên chuỗi chạy ngược mà không có gì trên màn nói là đã ngược.
   */
  check(
    'PC 1440 · bảng bày ngày MỚI NHẤT trước, còn mảng đã lưu vẫn theo thời gian cũ → mới',
    pcChuoi.soDong === 80 &&
      pcChuoi.ngayDau === '2025-03-22' &&
      pcChuoi.ngayCuoi === '2025-01-02' &&
      pcChuoi.luuDau === '2025-01-02' &&
      pcChuoi.luuCuoi === '2025-03-22',
    `màn ${String(pcChuoi.ngayDau)} → ${String(pcChuoi.ngayCuoi)} · lưu ${String(pcChuoi.luuDau)} → ${String(pcChuoi.luuCuoi)}`,
  );

  check('PC 1440 · bảng chuỗi giá có số liệu không tràn ngang', pcChuoi.tran === false);

  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 780,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await open('/du-lieu/');
  const dtChuoi = await evaluate(DOC_CHUOI);

  /*
   * Khổ điện thoại đổi sang `viewBox` HẸP. Chữ trong SVG đo bằng đơn vị viewBox nên nó phóng y hệt
   * hình: giữ khung 960 ở đây thì chữ trục hiện ra 3,2px — đo được trước khi tách hai khổ.
   */
  check(
    'Điện thoại 360 · biểu đồ nến đổi sang khổ khung hẹp để chữ trục còn đọc được',
    dtChuoi.viewW === 360 && dtChuoi.tran === false,
    `viewBox rộng ${String(dtChuoi.viewW)} · tràn ${String(dtChuoi.tran)}`,
  );

  check(
    'Điện thoại 360 · bảng và cột kiểm xếp DỌC, bảng trước',
    dtChuoi.bang !== null && dtChuoi.kiem !== null && dtChuoi.kiem.top > dtChuoi.bang.top,
    `bảng top=${String(dtChuoi.bang?.top)} · cột kiểm top=${String(dtChuoi.kiem?.top)}`,
  );

  await evaluate(`localStorage.removeItem('ffb.series.v1'), true`);

  /*
   * ── Service worker lúc MẤT MẠNG: trang vắng kho thì về khung /cong-thuc/ dưới ĐÚNG URL ───────
   *
   * Lỗi thật chủ dự án báo 16/09/2026: mở link hay app lúc điện thoại chưa có mạng thì "vào một màn
   * cũ rồi mới load lại vào màn Công thức". Đo ra: `sw.js` v4 trả HTML của khung `/cong-thuc/` cho
   * URL `/` — React ném lỗi hydration #418 vì HTML dựng cho một đường dẫn khác, header hiện logo thay
   * vì tên màn, thanh địa chỉ vẫn là `/`. Từ v5 service worker CHUYỂN HƯỚNG sang khung thay vì trả
   * khung dưới URL lạ. Chỉ Chrome thật kiểm được: cần một service worker đã cài, một kho đã có khung,
   * và một máy chủ thật sự cắt mạng.
   *
   * Bản build đăng ký service worker sau `load` ở mọi trang, nên tới đây nó đã cài từ lâu. Nhưng `/`
   * đã được ghé ở mục 4 — máy chủ này không đọc `_redirects` nên `/` trả 200 và bị cất vào kho, khác
   * bản triển khai (301, không bao giờ vào kho). Xoá mục ấy đi để đúng với thực tế.
   */
  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 780,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await open('/cong-thuc/');
  let swSanSang = false;
  for (let lan = 0; lan < 100 && !swSanSang; lan += 1) {
    swSanSang = await evaluate(`(async () => {
      if (!navigator.serviceWorker.controller) return false;
      if ((await caches.match(new Request('/cong-thuc/'))) === undefined) return false;
      for (const ten of await caches.keys()) await (await caches.open(ten)).delete(new Request('/'));
      return true;
    })()`);
    if (!swSanSang) await new Promise((r) => setTimeout(r, 200));
  }
  check('service worker đã cài và kho đã có khung /cong-thuc/', swSanSang);

  matMang = true;
  try {
    await open('/');
    // 79 là số thẻ danh sách ở chế độ Cơ bản (111 ở Nâng cao) — chỉ cần biết màn đã dựng đủ nội dung.
    const gocMatMang = await evaluate(`JSON.stringify({
      duongDan: location.pathname,
      h1: document.querySelector('h1')?.textContent ?? null,
      soThe: document.querySelectorAll('#danh-sach-cong-thuc ul li').length,
    })`);
    const goc = JSON.parse(gocMatMang);
    const loiReact = noise.filter((n) => /React error|hydrat/i.test(n));
    check(
      'mất mạng · mở "/" thì về /cong-thuc/ dưới đúng URL, đủ thẻ, không lỗi hydration',
      goc.duongDan === '/cong-thuc/' &&
        goc.h1 === 'Công thức' &&
        goc.soThe >= 79 &&
        loiReact.length === 0,
      `${String(goc.duongDan)} · h1 ${String(goc.h1)} · ${String(goc.soThe)} thẻ · ${loiReact[0] ?? 'console sạch lỗi React'}`,
    );

    // Một trang chưa từng ghé trong lượt chạy này — không có trong kho — cũng về khung, không về trang lỗi.
    await open('/cong-thuc/he-so-bien-thien/');
    const laMatMang = await evaluate(
      `location.pathname + '|' + (document.querySelector('h1')?.textContent ?? '')`,
    );
    check(
      'mất mạng · trang chưa có trong kho thì về khung /cong-thuc/ chứ không ra trang lỗi của trình duyệt',
      laMatMang === '/cong-thuc/|Công thức',
      laMatMang,
    );
  } finally {
    matMang = false;
  }

  /* ── Hết phép kiểm ─────────────────────────────────────────────────────── */
} finally {
  await cleanup();
}

const failed = checks.filter((c) => !c.pass);
console.log(`\n=== ${String(checks.length - failed.length)}/${String(checks.length)} đạt ===`);
process.exit(failed.length > 0 ? 1 : 0);
