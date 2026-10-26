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

  /* ── 0a1b. Chọn EN: tải lại không nháy qua chữ tiếng Việt ──────────────────── */

  /*
   * HTML tĩnh là tiếng Việt và chữ chỉ sang tiếng Anh sau hydrate, nên người đã chọn EN từng thấy
   * cả trang tiếng Việt mỗi lần tải cứng (đo 15/10/2026). Bản vá che `<body>` bằng
   * `data-locale-pending` từ script khởi động tới khi `PreferencesProvider` vẽ xong chữ Anh — xem
   * `layout.tsx`. Cùng giới hạn với ca theme ở trên: jsdom gộp hai lượt commit nên không thấy cái
   * nháy, chỉ trình duyệt thật đo được.
   *
   * Cách đo: quan sát viên cài TRƯỚC mọi script của trang ghi từng khung hình (rAF) ba điều — tấm
   * che còn không, `<body>` có đang hiện không, và chữ của thanh điều hướng còn dấu tiếng Việt không.
   * Bản hỏng có ít nhất một khung "đang hiện mà còn tiếng Việt"; bản đúng thì không có khung nào.
   */
  const LOCALE_WATCHER = `
window.__localeLog = [];
(function () {
  var VN = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  function tick() {
    var nav = document.querySelector('nav');
    if (document.body && nav) {
      window.__localeLog.push({
        che: document.documentElement.hasAttribute('data-locale-pending'),
        hien: getComputedStyle(document.body).visibility !== 'hidden',
        viet: VN.test(nav.textContent || ''),
      });
    }
    var cuoi = window.__localeLog[window.__localeLog.length - 1];
    if (window.__localeLog.length < 600 && !(cuoi && !cuoi.viet && !cuoi.che)) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();`;

  await evaluate(`localStorage.setItem('ffb.prefs.v1', JSON.stringify({ locale: 'en' })), true`);
  const localeWatcherId = await send('Page.addScriptToEvaluateOnNewDocument', {
    source: LOCALE_WATCHER,
  });
  await open('/cong-thuc/');
  await waitFor(`document.documentElement.lang === 'en'`);
  await new Promise((r) => setTimeout(r, 600));

  const khungNgonNgu = JSON.parse((await evaluate('JSON.stringify(window.__localeLog)')) ?? '[]');
  const lotTiengViet = khungNgonNgu.filter((k) => k.hien && k.viet);
  const daChe = khungNgonNgu.filter((k) => k.che).length;
  check(
    'chọn EN: tải lại không lộ ra khung hình tiếng Việt nào trước khi chữ sang tiếng Anh',
    khungNgonNgu.length > 0 && lotTiengViet.length === 0,
    `${String(khungNgonNgu.length)} khung đo, ${String(daChe)} khung còn che, ${String(lotTiengViet.length)} khung lộ tiếng Việt`,
  );

  const sauKhiGo = await evaluate(`(() => ({
    che: document.documentElement.hasAttribute('data-locale-pending'),
    hien: getComputedStyle(document.body).visibility,
  }))()`);
  check(
    'chọn EN: tấm che đã gỡ và trang hiện sau hydrate — không kẹt trắng',
    sauKhiGo?.che === false && sauKhiGo?.hien === 'visible',
    JSON.stringify(sauKhiGo),
  );

  await send('Page.removeScriptToEvaluateOnNewDocument', {
    identifier: localeWatcherId.result?.identifier ?? localeWatcherId.identifier,
  });
  await evaluate(`localStorage.removeItem('ffb.prefs.v1'), true`);
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
  /*
   * Lấy ký hiệu CÓ bước tính (có nút ở bảng), không lấy dấu đầu tiên trong hình: từ 26/10/2026 mọi
   * ký hiệu trong hình đều mang dấu, mà ký hiệu không có bước tính thì không có cụm chữ và nút để
   * sáng lên ở hai chỗ kia.
   */
  const diemCham = await evaluate(`(() => {
  const sym = document.querySelector('dl button[data-sym]')?.getAttribute('data-sym');
  const el = sym == null ? null : document.querySelector('math [data-sym="' + sym + '"]');
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
   * Ký hiệu KHÔNG có bước tính cũng mở khung (26/10/2026, chủ dự án: _"ký hiệu nào cũng cần giải
   * thích"_) — khung chỉ có dòng nghĩa, co theo chữ, vẫn nằm trọn trong màn. Trên Sharpe đó là `S`,
   * `√m` và `m`: lấy dấu đầu tiên trong hình mà bảng không có nút cho nó.
   */
  const diemTron = await evaluate(`(() => {
  const coNut = new Set([...document.querySelectorAll('dl button[data-sym]')].map((b) => b.getAttribute('data-sym')));
  const el = [...document.querySelectorAll('math [data-sym]')].find((e) => !coNut.has(e.getAttribute('data-sym')));
  if (!el) return null;
  el.scrollIntoView({ block: 'center' });
  const b = el.getBoundingClientRect();
  return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) };
})()`);
  if (diemTron !== null) await reChuot(diemTron.x, diemTron.y);
  await new Promise((r) => setTimeout(r, 400));
  const khiMoTron = await evaluate(DOC_KHUNG);
  const chiNghia = await evaluate(
    `document.querySelector('[role="group"][id^="cach-tinh-"]')?.hasAttribute('data-title-only') ?? null`,
  );
  check(
    'PC 1440 · rê vào ký hiệu không có bước tính thì khung chỉ-có-nghĩa mở, nằm trọn trong màn',
    diemTron !== null &&
      chiNghia === true &&
      khiMoTron.panel !== null &&
      khiMoTron.panel.left >= 0 &&
      khiMoTron.panel.right <= khiMoTron.vw &&
      khiMoTron.panel.top >= 0 &&
      khiMoTron.panel.bottom <= khiMoTron.vh,
    JSON.stringify({ diemTron, chiNghia, panel: khiMoTron.panel }),
  );
  await reChuot(5, 5);
  await new Promise((r) => setTimeout(r, 500));
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

  const giaiThich = [...document.querySelectorAll('section')].find((s) => s.querySelectorAll('details').length >= 2);
  if (!giaiThich) return null;
  giaiThich.scrollIntoView({ block: 'center' });
  await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));

  return {
    hoan: khoi.map((el) => el.querySelector('h2')?.textContent ?? el.tagName),
    soLieuCv: soLieu ? getComputedStyle(soLieu).contentVisibility : null,
    caoMuc: [...giaiThich.querySelectorAll('details')].map((d) => Math.round(d.getBoundingClientRect().height)),
  };
})()`);

  /*
   * BỐN khối, không phải năm: khối Ví dụ thực tế bỏ `deferred` ngày 29/09/2026 vì
   * `content-visibility: auto` kéo theo `contain: paint` và cắt mất khung "cách tính" bật ra từ
   * hình công thức — cùng lý do khối Bài tập đã bỏ trước đó (xem `FormulaDetail.tsx`). Còn lại
   * đúng bốn: Giải thích · Biểu đồ · Bảng biến · Nguồn tham khảo.
   */
  check(
    'đúng bốn khối dưới nếp gấp được hoãn dựng hình, khối Số liệu thì không',
    hoan !== null && hoan.hoan.length === 4 && hoan.soLieuCv === 'visible',
    hoan === null ? 'không thấy khối Giải thích' : `hoãn: ${hoan.hoan.join(' · ')}`,
  );

  /*
   * BA mục, không phải bốn: chỉ "Công thức này nói lên điều gì" rời đi (30/09/2026, nó in đúng
   * câu của khối Ý nghĩa ở đầu màn). Xem chú thích dài hơn ở phép kiểm "các mục Giải thích xếp
   * dọc" trong khối PC 1440.
   *
   * Con số này đã từng SAI và làm cả `check:chrome` đỏ: đợt 30/09 tắt cả `showMeaning` lẫn
   * `showHowToRead` nên lúc ấy đúng là 2, rồi "Cách đọc kết quả" được trả về khối này mà hai phép
   * kiểm Chrome không đổi theo — phía vitest thì có (`FormulaDetail.test.tsx:304`). Nguồn sự thật
   * là `SECTIONS` trong `ExplanationAccordion.tsx` trừ đi các cờ `show*` mà `FormulaDetail` thật
   * sự truyền: nay chỉ còn `showMeaning={false}`, tức 4 − 1 = 3.
   */
  check(
    'cuộn tới thì mọi mục của khối Giải thích dựng xong, không mất chữ',
    hoan !== null && hoan.caoMuc.length === 3 && hoan.caoMuc.every((h) => h > 0),
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
   * Hai nhóm ngoại lệ dưới đây (1 và 3) là CÓ CHỦ ĐÍCH; mọi chuỗi khác là lỗi. Nhóm 2 đã bỏ.
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
    // Thêm 15/10/2026 cùng đợt dịch kho hướng dẫn và trả nợ đơn vị trên biểu đồ.
    '/cong-thuc/fcfe/',
    '/huong-dan/cong-thuc/pe/',
    '/ve-chung-toi/',
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

  /*
   * NHÓM 2 — "số kèm đơn vị do Domain ghép sẵn" — ĐÃ BỎ 15/10/2026, nợ đã trả. Nhãn của biểu đồ
   * (vệt dò, dấu giá trị hiện tại, bảng số, câu mô tả) nay đổi đơn vị theo ngôn ngữ qua
   * `labelInEnglish()` (`src/core/format.ts`) và hook `useLabelText()`. Ngoại lệ này từng nuốt mọi
   * cụm "số + đơn vị Việt" ở BẤT KỲ đâu trên màn, nên giữ nó lại là che mất đúng loại lỗi vừa sửa.
   */

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
    let conLai = c.t;
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
    'chế độ EN: không còn chữ tiếng Việt nào ngoài hai nhóm ngoại lệ đã ghi',
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
   * Bước bấm sang tab "Công thức" (EN: "Formulas") QUAY LẠI ngày 10/10/2026 cùng cụm tab. Bản cũ dò
   * mọi nút có chữ "Công thức" rồi bấm — nên nó từng có thể bấm nhầm một nút khác trùng chữ. Nay chỉ
   * dò trong `[role="tab"]`, nơi chỉ có đúng hai nút — và từ chiều 12/10/2026 điều ấy thành BẮT BUỘC:
   * nhãn tab trùng chữ với mục "Formulas" trên thanh điều hướng.
   *
   * Từ 12/10/2026 danh sách là một BẢNG: tên nằm trong ô đầu của mỗi dòng (`<td>`), không còn là thẻ
   * `<p>`. Với một tên GỢI Ý ("Biên an toàn · 25/08/2026") ô ấy chỉ in tên công thức — mã và ngày đã có
   * cột riêng — nên điều cần thấy là tên công thức đã dịch, và KHÔNG còn chữ tiếng Việt nào.
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
  await waitFor(`document.querySelectorAll('[role="tab"]').length === 2`);
  await evaluate(`(() => {
    const nut = [...document.querySelectorAll('[role="tab"]')].find((b) =>
      (b.textContent ?? '').startsWith('Formulas'),
    );
    if (nut !== undefined) nut.click();
    return true;
  })()`);

  const tenDaLuu = await evaluate(`(async () => {
    // Kho đọc trong effect — chờ khối dựng xong rồi mới đọc chữ.
    for (let i = 0; i < 30 && !document.getElementById('phep-tinh-da-luu'); i += 1) {
      await new Promise((d) => setTimeout(d, 100));
    }
    const khoi = document.getElementById('phep-tinh-da-luu');
    return khoi === null
      ? []
      : [...khoi.querySelectorAll('tbody tr')].map((tr) => tr.firstElementChild?.textContent ?? '');
  })()`);

  const coTenEn = (tenDaLuu ?? []).some((line) => line.includes('Margin of safety'));
  const conTenVi = (tenDaLuu ?? []).some((line) => line.includes('Biên an toàn'));

  check(
    'tên phép tính đã lưu dựng lại theo ngôn ngữ — bản lưu cũ bằng tiếng Việt cũng đổi',
    coTenEn && !conTenVi,
    coTenEn ? 'ô công thức hiện "Margin of safety…"' : 'không thấy tên đã dịch trong bảng',
  );

  /*
   * ── Cụm tab dọc ở khổ 360 (10/10/2026, viết lại 12/10/2026) ──────────────────────────────────────────
   *
   * Đích của nút Lưu ở màn chi tiết là `/danh-muc/#phep-tinh-da-luu`. Bản khối-thứ-hai phải cuộn
   * tới neo và giữ nó bằng `ResizeObserver` vì thị giá về sau đẩy khối xuống 702/780px. Nay neo chỉ
   * cần MỞ ĐÚNG TAB, và tab Công thức có đúng khối ấy dưới thanh tab — nhưng "không còn gì để đẩy"
   * là một suy luận, nên số đo trên Chrome thật mới là thứ khoá nó.
   *
   * Điều hướng tới URL KHÁC trang hiện tại (đang là `?tab=cong-thuc` do lượt bấm ở trên ghi vào):
   * một lệnh navigate chỉ đổi hash là điều hướng cùng tài liệu, không tải lại, và React sẽ không
   * đọc lại neo — phép kiểm xanh giả.
   */
  await open('/danh-muc/#phep-tinh-da-luu');
  const neo = await evaluate(`(async () => {
    for (let i = 0; i < 30 && !document.getElementById('phep-tinh-da-luu'); i += 1) {
      await new Promise((d) => setTimeout(d, 100));
    }
    const khoi = document.getElementById('phep-tinh-da-luu');
    const chon = [...document.querySelectorAll('[role="tab"]')].find(
      (b) => b.getAttribute('aria-selected') === 'true',
    );
    const thanh = document.querySelector('[role="tablist"]');
    return {
      coKhoi: khoi !== null,
      tabChon: chon === undefined ? '' : (chon.textContent ?? ''),
      mepTren: khoi === null ? -1 : Math.round(khoi.getBoundingClientRect().top),
      cao: window.innerHeight,
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      thanhPhai: thanh === null ? -1 : Math.round(thanh.getBoundingClientRect().right),
      rong: window.innerWidth,
    };
  })()`);

  check(
    '360 · neo #phep-tinh-da-luu mở thẳng tab Công thức, khối nằm trong màn đầu',
    neo.coKhoi === true &&
      neo.tabChon.startsWith('Formulas') &&
      neo.mepTren >= 0 &&
      neo.mepTren < neo.cao,
    `tab "${String(neo.tabChon)}" · mép trên khối ${String(neo.mepTren)}/${String(neo.cao)}px`,
  );

  check(
    '360 · cụm tab nằm trọn trong màn, không làm trang tràn ngang',
    neo.tran === false && neo.thanhPhai > 0 && neo.thanhPhai <= neo.rong,
    `mép phải thanh tab ${String(neo.thanhPhai)}/${String(neo.rong)}px`,
  );

  const veMa = await evaluate(`(async () => {
    const nut = [...document.querySelectorAll('[role="tab"]')].find((b) =>
      (b.textContent ?? '').startsWith('Tickers'),
    );
    if (nut !== undefined) nut.click();
    await new Promise((d) => setTimeout(d, 300));
    return {
      hash: location.hash,
      conKhoi: document.getElementById('phep-tinh-da-luu') !== null,
    };
  })()`);

  check(
    'bấm tab Mã thì khối phép tính đã lưu biến đi và neo bị bỏ khỏi URL',
    veMa.conKhoi === false && veMa.hash === '',
    `hash "${String(veMa.hash)}" · khối ${veMa.conKhoi === true ? 'còn' : 'đã gỡ'}`,
  );

  await evaluate(`localStorage.removeItem('ffb.saved.v1'), true`);
  await evaluate(`localStorage.removeItem('ffb.prefs.v1'), true`);

  /*
   * ── Màn Danh mục ở khổ ĐIỆN THOẠI: bản vẽ của chủ dự án (14/10/2026) ─────────────────────────────
   *
   * Từ 22/09 đến 12/10 chỗ này đo ba hình dạng của bảng Nắm giữ; bản hai cột 12/10 bỏ cả ba và giao khổ
   * nhỏ "tính sau", nên nó chỉ còn hai điều kiện (không tràn ngang, "Thêm mới" bấm được) kèm lời hẹn:
   * khi có bản vẽ khổ nhỏ, viết lại bộ đo cho đúng bản vẽ ấy. Bản vẽ đã tới — đây là bộ đo viết lại.
   *
   * Dưới 1024px: thanh trên "Danh mục" + MỘT icon Tìm kiếm (không Sáng/Tối, VI; icon Làm mới giá của bản
   * vẽ đầu bị chủ dự án gạch cùng ngày), bấm thì ô tìm mở ngay trên thanh trên; hai tab
   * ngang; thẻ tóm tắt thu một hàng; bảng Mã năm cột, chạm dòng thì dòng chi tiết mở với Lãi/lỗ, Lãi/lỗ
   * %, Tỷ trọng và hai nút Sửa · Xoá; "Thêm mới" ghim đáy ngay trên thanh điều hướng. Mọi thứ ấy là CSS
   * trong `@media` của CSS Module (jsdom không áp), và cú chạm phải là chuột THẬT — `PortfolioScreen`
   * đọc `matchMedia` lúc bấm, nên một `click()` giả trong jsdom không nói gì về Chrome.
   *
   * Đo ở 360 (khổ hẹp nhất) và 560. HPG cố ý KHÔNG có ngày mua: dòng ấy in `_ _` ở ô cuối, cạnh mũi tên.
   */
  await evaluate(`(() => {
    localStorage.setItem('ffb.portfolio.v1', JSON.stringify([
      { code: 'FPT', quantity: 100, costPrice: 60000, buyDate: '2026-01-02' },
      { code: 'HPG', quantity: 500, costPrice: 20000 },
    ]));
    return true;
  })()`);

  const DOC_DANH_MUC_NHO = `(() => {
    const hop = (el) => (el === null || el === undefined ? null : el.getBoundingClientRect());
    const hien = (el) => el !== null && el !== undefined && getComputedStyle(el).display !== 'none' && hop(el).width > 0;
    const bang = document.querySelector('main table');
    const khung = bang === null ? null : bang.closest('[class*="tableWrap"]');
    const them = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').trim() === 'Thêm mới');
    const thanhDay = [...document.querySelectorAll('nav')].find((n) => hien(n) && hop(n).top > window.innerHeight / 2);
    const tabs = [...document.querySelectorAll('[role="tab"]')].map((t) => hop(t));
    const von = [...document.querySelectorAll('span')].find((s) => s.textContent === 'Vốn đã bỏ ra');
    const cot = bang === null ? [] : [...bang.querySelectorAll('thead th')].filter((th) => getComputedStyle(th).display !== 'none');
    const hThem = hop(them);
    const hKhung = hop(khung);
    return {
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      bangCuon: khung === null ? -1 : khung.scrollWidth - khung.clientWidth,
      cot: cot.map((th) => th.textContent),
      nutThanh: [...document.querySelectorAll('#header-screen-actions button')].filter(hien).map((b) => b.getAttribute('aria-label')),
      themeHien: hien(document.querySelector('button[aria-label^="Chuyển sang giao diện"]')),
      ngonNguHien: hien(document.querySelector('button[aria-label^="Chuyển sang tiếng"]')),
      tabNgang: tabs.length === 2 && Math.abs(tabs[0].top - tabs[1].top) < 1 && tabs[1].left > tabs[0].right - 1,
      // Chữ NHÌN THẤY trên tab (innerText bỏ phần display: none) — số đếm đã bỏ ở khổ này (14/10/2026).
      chuTab: [...document.querySelectorAll('[role="tab"]')].map((t) => t.innerText.trim()),
      vonHien: hien(von),
      keDuoiThe: (() => {
        const the = von === undefined ? null : von.closest('[class*="card"]');
        return the === null ? null : getComputedStyle(the).borderBottomWidth;
      })(),
      them: hThem === null ? null : {
        pos: getComputedStyle(them).position,
        top: Math.round(hThem.top),
        bottom: Math.round(hThem.bottom),
        left: Math.round(hThem.left),
        right: Math.round(hThem.right),
      },
      khung: hKhung === null ? null : { left: Math.round(hKhung.left), right: Math.round(hKhung.right) },
      dayTop: thanhDay === undefined ? -1 : Math.round(hop(thanhDay).top),
    };
  })()`;

  async function chamChuot(x, y) {
    for (const type of ['mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', {
        type,
        x: Math.round(x),
        y: Math.round(y),
        button: 'left',
        clickCount: 1,
      });
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  /** Tâm một ô của dòng mã — `o` là chỉ số ô. Cuộn dòng vào màn trước để toạ độ nằm trong vùng nhìn. */
  const tamO = (code, o) =>
    evaluate(`(() => {
      const nut = [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Sửa ${code}');
      const tr = nut.closest('tr');
      tr.scrollIntoView({ block: 'center' });
      const r = tr.children[${String(o)}].getBoundingClientRect();
      return { x: r.left + Math.min(12, r.width / 2), y: (r.top + r.bottom) / 2 };
    })()`);

  const DOC_DONG_MO_DM = `(() => {
    const dong = [...document.querySelectorAll('tr[id^="portfolio-ma-chi-tiet-"]')];
    return {
      ids: dong.map((d) => d.id),
      nhan: dong.length === 1 ? [...dong[0].querySelectorAll('dt')].map((d) => d.textContent) : [],
      nut: dong.length === 1 ? [...dong[0].querySelectorAll('button')].map((b) => b.textContent) : [],
      hien: dong.length === 1 && dong[0].getBoundingClientRect().height > 40,
      hopThoai: document.querySelectorAll('dialog[open]').length,
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  })()`;

  /*
   * Ô tìm trên thanh trên (14/10/2026): chủ dự án khoanh chỗ nó hiện ra — sau tên màn, tới mép phải, kính
   * lúp ở cuối. Đo hộp KHUNG (cha của icon), tên màn không bị cắt `…` (lỗi đã gặp: ô nhập đòi bề ngang
   * tự nhiên ~20 ký tự và co tên màn thành "Danh m…"), đúng một ô tìm hiện trên màn.
   */
  const DOC_O_TIM_DM = `(() => {
    const hop = (el) => { if (el === null) return null; const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; };
    const o = document.querySelector('header input[type="search"]');
    const nut = document.querySelector('#header-screen-actions button[aria-label="Tìm kiếm"]');
    const h1 = document.querySelector('header h1');
    const hNut = hop(nut);
    return {
      khung: o === null ? null : hop(nut.parentElement),
      thanh: hop(document.querySelector('header')),
      tieuDe: hop(h1),
      tieuDeCat: h1.scrollWidth > h1.clientWidth,
      soOHien: [...document.querySelectorAll('input[type="search"]')].filter((i) => i.getClientRects().length > 0).length,
      tieuDiem: o !== null && document.activeElement === o,
      moRong: nut.getAttribute('aria-expanded'),
      iconLaX: nut.querySelector('path')?.getAttribute('d') === 'M6 6l12 12M18 6 6 18',
      // Ô tìm mở thì icon Làm mới giá rời thanh trên, tới khi ô đóng (chủ dự án, 14/10/2026).
      coLamMoi: document.querySelector('#header-screen-actions button[aria-label="Làm mới giá"]') !== null,
      ngoai: (() => {
        const nhan = [...document.querySelectorAll('main span')].find((s) => s.textContent === 'Tổng giá trị');
        const r = nhan.getBoundingClientRect();
        return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 };
      })(),
      icon: { x: (hNut.left + hNut.right) / 2, y: (hNut.top + hNut.bottom) / 2 },
      chu: [...document.querySelectorAll('input[type="search"]')].map((i) => i.value).join('|'),
      dong: [...document.querySelectorAll('button')].map((b) => b.getAttribute('aria-label') ?? '').filter((n) => /^Sửa [A-Z0-9]+$/.test(n)).map((n) => n.slice(4)),
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  })()`;

  for (const [rong, cao] of [
    [360, 780],
    [560, 900],
  ]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: rong,
      height: cao,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await open('/danh-muc/');
    await waitFor(
      `[...document.querySelectorAll('button')].some((b) => b.getAttribute('aria-label') === 'Sửa FPT')`,
    );
    await waitFor(`document.querySelector('#header-screen-actions button') !== null`);

    const nho = await evaluate(DOC_DANH_MUC_NHO);
    check(
      `${String(rong)} · Danh mục: thanh trên có icon Tìm kiếm rồi Làm mới giá bên phải, không có Sáng/Tối và VI`,
      nho.nutThanh.join('|') === 'Tìm kiếm|Làm mới giá' &&
        nho.themeHien === false &&
        nho.ngonNguHien === false,
      `nút ${nho.nutThanh.join(', ')} · sáng/tối ${String(nho.themeHien)} · VI ${String(nho.ngonNguHien)}`,
    );

    // Chạm chuột thật vào icon Tìm kiếm rồi gõ: ô mở trên thanh trên và lọc bảng.
    const dongTim = await evaluate(DOC_O_TIM_DM);
    await chamChuot(dongTim.icon.x, dongTim.icon.y);
    await send('Input.insertText', { text: 'hpg' });
    await new Promise((r) => setTimeout(r, 300));
    const moTim = await evaluate(DOC_O_TIM_DM);
    check(
      `${String(rong)} · Danh mục: icon Tìm kiếm mở ô tìm NGAY TRÊN thanh trên — sau tên màn tới mép phải, tên không bị cắt, gõ thì lọc, icon Làm mới rời thanh`,
      dongTim.coLamMoi === true &&
        moTim.coLamMoi === false &&
        moTim.khung !== null &&
        moTim.khung.top >= moTim.thanh.top &&
        moTim.khung.bottom <= moTim.thanh.bottom &&
        moTim.khung.left > moTim.tieuDe.right &&
        moTim.khung.right <= rong - 8 &&
        moTim.khung.right - moTim.khung.left >= 120 &&
        moTim.tieuDeCat === false &&
        moTim.soOHien === 1 &&
        moTim.tieuDiem === true &&
        moTim.moRong === 'true' &&
        moTim.dong.join() === 'HPG' &&
        moTim.tran === false,
      `khung ${JSON.stringify(moTim.khung)} · tên ${JSON.stringify(moTim.tieuDe)} cắt ${String(moTim.tieuDeCat)} · ô hiện ${String(moTim.soOHien)} · dòng ${moTim.dong.join()}`,
    );

    /*
     * Ô có chữ: chạm ra ngoài (chữ "Tổng giá trị", không có việc gì gắn vào) KHÔNG đóng — bảng đang là kết quả tìm. Rồi chạm dấu X
     * cuối khung: ô đóng, chữ bị xoá, bảng đủ dòng. Chủ dự án từng mở ô rồi không đóng được (14/10/2026)
     * vì lúc ấy cuối khung là kính lúp; nay ô đang mở thì icon phải là dấu X.
     */
    await chamChuot(moTim.ngoai.x, moTim.ngoai.y);
    const ngoaiCoChu = await evaluate(DOC_O_TIM_DM);
    await chamChuot(ngoaiCoChu.icon.x, ngoaiCoChu.icon.y);
    const dongLai = await evaluate(DOC_O_TIM_DM);
    check(
      `${String(rong)} · Danh mục: ô đang mở có dấu X ở cuối khung; chạm X thì ô đóng, chữ bị xoá, bảng đủ dòng, icon Làm mới về lại`,
      moTim.iconLaX === true &&
        ngoaiCoChu.khung !== null &&
        ngoaiCoChu.coLamMoi === false &&
        dongLai.khung === null &&
        dongLai.coLamMoi === true &&
        dongLai.soOHien === 0 &&
        dongLai.moRong === 'false' &&
        dongLai.iconLaX === false &&
        dongLai.chu === '' &&
        dongLai.dong.join() === 'FPT,HPG',
      `X khi mở ${String(moTim.iconLaX)} · có chữ, chạm ngoài: khung ${JSON.stringify(ngoaiCoChu.khung)} · sau X: khung ${JSON.stringify(dongLai.khung)} · ô hiện ${String(dongLai.soOHien)} · chữ "${dongLai.chu}" · dòng ${dongLai.dong.join()}`,
    );

    // Ô còn trống: chạm ra ngoài là đóng, như mọi ô bật lên.
    await chamChuot(dongLai.icon.x, dongLai.icon.y);
    const moTrong = await evaluate(DOC_O_TIM_DM);
    await chamChuot(moTrong.ngoai.x, moTrong.ngoai.y);
    const ngoaiTrong = await evaluate(DOC_O_TIM_DM);
    check(
      `${String(rong)} · Danh mục: ô tìm trên thanh còn trống thì chạm ra ngoài là đóng`,
      moTrong.khung !== null &&
        moTrong.coLamMoi === false &&
        ngoaiTrong.khung === null &&
        ngoaiTrong.moRong === 'false' &&
        ngoaiTrong.coLamMoi === true,
      `mở ${JSON.stringify(moTrong.khung)} · sau chạm ngoài ${JSON.stringify(ngoaiTrong.khung)}`,
    );

    /*
     * Icon Làm mới giá trên thanh trên (14/10/2026): chủ dự án bấm làm mới và không thấy gì được tải lại,
     * rồi cho icon về bên phải icon Tìm kiếm và bỏ ngày phiên cùng nút "Làm mới" khỏi chân thẻ tab Mã ở
     * khổ này. Trang gọi Finbox thật nếu máy có mạng, không thì tra hỏng — đường nào cũng trả lời nhanh hơn
     * mắt kịp thấy, nên vẫn phải thấy bảng bận, vệt chờ trên các ô sống theo giá, icon xoay và khoá, và
     * trạng thái ấy đứng đủ `MIN_REFRESH_MS` (600ms) của `PortfolioScreen.tsx`.
     */
    const DOC_CHO_GIA = `(() => {
      const bang = document.querySelector('main table');
      const icon = document.querySelector('#header-screen-actions button[aria-label="Làm mới giá"]');
      const r = icon === null ? null : icon.getBoundingClientRect();
      return {
        ban: bang === null ? null : bang.getAttribute('aria-busy'),
        vet: [...document.querySelectorAll('main table [class*="khungCho"]')].filter((v) => v.getClientRects().length > 0).length,
        iconBan: icon === null ? null : icon.getAttribute('aria-busy'),
        iconKhoa: icon === null ? null : icon.disabled,
        icon: r === null ? null : { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 },
      };
    })()`;
    const truocLm = await evaluate(DOC_CHO_GIA);
    let choGia = null;
    let xongSau = -1;
    if (truocLm.icon !== null) {
      const t0 = Date.now();
      await chamChuot(truocLm.icon.x, truocLm.icon.y);
      choGia = await evaluate(DOC_CHO_GIA);
      for (let i = 0; i < 160 && xongSau < 0; i += 1) {
        const tt = await evaluate(DOC_CHO_GIA);
        if (tt.ban === 'false' && tt.iconBan === 'false') xongSau = Date.now() - t0;
        else await new Promise((r) => setTimeout(r, 50));
      }
    }
    check(
      `${String(rong)} · Danh mục: chạm icon Làm mới giá thì bảng bận, ô thị giá thành vệt chờ, icon xoay và khoá, đứng ≥ 0,55 giây rồi trở lại`,
      choGia !== null &&
        choGia.ban === 'true' &&
        choGia.vet >= 2 &&
        choGia.iconBan === 'true' &&
        choGia.iconKhoa === true &&
        xongSau >= 550 &&
        xongSau < 8000,
      `${JSON.stringify(choGia)} · xong sau ${String(xongSau)}ms`,
    );

    /*
     * Chân thẻ tab Mã ở khổ này: KHÔNG còn nút Làm mới / Thử lại, kể cả khi thẻ mở; lúc giá bình thường
     * (`role="status"`) cũng không còn ngày phiên. Giá cũ hoặc tra hỏng (`role="alert"`) thì dải vẫn hiện —
     * FR-06, giá cũ phải đứng cạnh tên phiên — nên vế ngày phiên chỉ đòi ẩn ở ca bình thường.
     */
    const TAM_MUI_TEN_THE = `(() => {
      const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === 'Chi tiết');
      if (b === undefined) return null;
      b.scrollIntoView({ block: 'center' });
      const r = b.getBoundingClientRect();
      return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2, mo: b.getAttribute('aria-expanded') };
    })()`;
    const muiTenLm = await evaluate(TAM_MUI_TEN_THE);
    if (muiTenLm !== null && muiTenLm.mo === 'false') await chamChuot(muiTenLm.x, muiTenLm.y);
    const chanThe = await evaluate(`(() => {
      const hien = (el) => el !== null && el.getClientRects().length > 0;
      const dai = document.querySelector('[role="status"], [role="alert"]');
      return {
        theMo: [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === 'Chi tiết')?.getAttribute('aria-expanded'),
        nutHien: [...document.querySelectorAll('button')].some((x) => /^(Làm mới|Thử lại)$/.test((x.textContent ?? '').trim()) && hien(x)),
        vaiDai: dai === null ? null : dai.getAttribute('role'),
        daiHien: hien(dai),
      };
    })()`);
    const muiTenDong = await evaluate(TAM_MUI_TEN_THE);
    if (muiTenDong !== null && muiTenDong.mo === 'true')
      await chamChuot(muiTenDong.x, muiTenDong.y);
    await evaluate('window.scrollTo(0, 0)');
    check(
      `${String(rong)} · Danh mục: thẻ tóm tắt đang mở mà chân thẻ không còn nút Làm mới, và không còn ngày phiên lúc giá bình thường`,
      chanThe.theMo === 'true' &&
        chanThe.nutHien === false &&
        (chanThe.vaiDai !== 'status' || chanThe.daiHien === false),
      JSON.stringify(chanThe),
    );
    check(
      `${String(rong)} · Danh mục: hai tab nằm ngang trên một hàng, chỉ có chữ, không số đếm`,
      nho.tabNgang === true &&
        nho.chuTab.length === 2 &&
        nho.chuTab.every((chu) => !/\d/.test(chu)),
      nho.chuTab.join(' | '),
    );
    check(
      `${String(rong)} · Danh mục: thẻ tóm tắt thu còn một hàng — "Vốn đã bỏ ra" ẩn tới khi bấm mũi tên`,
      nho.vonHien === false,
    );
    /*
     * Thẻ tóm tắt KHÔNG kẻ dưới (chủ dự án, 14/10/2026): kẻ ấy nằm sát ngay trên viền khung bảng, đọc thành
     * hai đường chồng nhau và chạy ra ngoài hai góc bo của khung. Thẻ của tab Công thức dùng chung lớp này.
     */
    check(
      `${String(rong)} · Danh mục: thẻ tóm tắt không kẻ dưới — viền khung bảng là đường duy nhất trên bảng`,
      nho.keDuoiThe === '0px',
      String(nho.keDuoiThe),
    );
    check(
      `${String(rong)} · Danh mục: bảng Mã năm cột, vừa khung, trang không tràn ngang`,
      nho.cot.join('|') === 'Mã|Số CP|Giá vốn|Thị giá|Ngày mua' &&
        nho.bangCuon <= 0 &&
        nho.tran === false,
      `${nho.cot.join(' | ')} · bảng cuộn ${String(nho.bangCuon)}px`,
    );
    check(
      `${String(rong)} · Danh mục: "Thêm mới" ghim đáy, gióng hai mép bảng, nằm trọn trên thanh điều hướng`,
      nho.them !== null &&
        nho.them.pos === 'fixed' &&
        nho.khung !== null &&
        Math.abs(nho.them.left - nho.khung.left) <= 1 &&
        Math.abs(nho.them.right - nho.khung.right) <= 1 &&
        nho.dayTop > 0 &&
        nho.them.bottom <= nho.dayTop,
      `nút ${JSON.stringify(nho.them)} · bảng ${JSON.stringify(nho.khung)} · thanh đáy ${String(nho.dayTop)}`,
    );

    /*
     * Một màu, một cỡ, một nét cho số liệu (chủ dự án 14/10/2026: "đồng bộ về 1 loại màu … kể cả ở bên
     * Mã cũng thế. ngoại trừ tên mã tên công thức thì vẫn để là size to hơn 1 px và in đậm"). Vế "to hơn
     * 1px" đảo ngày 19/10/2026 khi chủ dự án thấy tên phép tính quá to: tên của dòng nay CÙNG cỡ số liệu,
     * chỉ đậm hơn. Dòng FPT: mã cùng cỡ số liệu và đậm hơn; các số liệu cùng cỡ, cùng nét, và cùng MÀU với
     * mã. Ô "_ _" không tính — nó cố ý nhạt (FR-06), và script này không có Finbox nên Thị giá luôn là "_ _".
     */
    const chuMa = await evaluate(`(() => {
      const nut = [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Sửa FPT');
      const o = [...nut.closest('tr').children].filter((c) => getComputedStyle(c).display !== 'none');
      const la = (td) => {
        let el = td;
        while (el.children.length === 1 && el.firstElementChild.textContent === el.textContent) el = el.firstElementChild;
        return el;
      };
      const kieu = (el) => {
        const c = getComputedStyle(el);
        return { co: parseFloat(c.fontSize), net: Number(c.fontWeight), mau: c.color, chu: el.textContent.trim() };
      };
      return { ten: kieu(nut), so: o.slice(1).map((td) => kieu(la(td))).filter((k) => k.chu !== '_ _') };
    })()`);
    const soDau = chuMa.so[0];
    check(
      `${String(rong)} · Danh mục, bảng Mã: số liệu một cỡ, một nét, cùng màu với mã; mã cùng cỡ và đậm hơn`,
      soDau !== undefined &&
        chuMa.so.length >= 3 &&
        chuMa.so.every(
          (k) => k.co === soDau.co && k.net === soDau.net && k.mau === chuMa.ten.mau,
        ) &&
        chuMa.ten.co === soDau.co &&
        chuMa.ten.net > soDau.net,
      `mã ${String(chuMa.ten.co)}px nét ${String(chuMa.ten.net)} ${chuMa.ten.mau} · ${chuMa.so.map((k) => `${k.chu}: ${String(k.co)}px nét ${String(k.net)} ${k.mau}`).join(' | ')}`,
    );

    // Chạm chuột thật vào ô Giá vốn của FPT: dòng chi tiết mở, KHÔNG mở hộp thoại Sửa.
    const oFpt = await tamO('FPT', 2);
    await chamChuot(oFpt.x, oFpt.y);
    const mo = await evaluate(DOC_DONG_MO_DM);
    check(
      `${String(rong)} · Danh mục: chạm dòng FPT mở dòng chi tiết — ba số, hai nút Sửa · Xoá, không mở hộp thoại`,
      mo.ids.join() === 'portfolio-ma-chi-tiet-FPT' &&
        mo.nhan.join('|') === 'Lãi/lỗ|Lãi/lỗ %|Tỷ trọng' &&
        mo.nut.join('|') === 'Sửa|Xoá' &&
        mo.hien === true &&
        mo.hopThoai === 0 &&
        mo.tran === false,
      `${mo.ids.join()} · ${mo.nhan.join(', ')} · ${mo.nut.join(', ')} · hộp thoại ${String(mo.hopThoai)}`,
    );

    // Chạm vào chính MÃ của HPG: mã nhường cú chạm cho dòng, nên dòng HPG mở và dòng FPT đóng.
    const maHpg = await tamO('HPG', 0);
    await chamChuot(maHpg.x, maHpg.y);
    const doi = await evaluate(DOC_DONG_MO_DM);
    check(
      `${String(rong)} · Danh mục: chạm vào mã HPG thì chỉ dòng HPG mở — một dòng một lúc`,
      doi.ids.join() === 'portfolio-ma-chi-tiet-HPG' && doi.hopThoai === 0,
      doi.ids.join() || 'không dòng nào mở',
    );

    // Cuộn hết trang: ô miễn trừ cuối màn dừng TRÊN nút ghim đáy, không nằm dưới nó.
    const cuoi = await evaluate(`(async () => {
      window.scrollTo(0, document.documentElement.scrollHeight);
      await new Promise((d) => setTimeout(d, 200));
      const mien = document.querySelector('main [role="note"]');
      const them = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').trim() === 'Thêm mới');
      const r = { mien: Math.round(mien.getBoundingClientRect().bottom), them: Math.round(them.getBoundingClientRect().top) };
      window.scrollTo(0, 0);
      return r;
    })()`);
    check(
      `${String(rong)} · Danh mục: cuộn hết trang, ô miễn trừ dừng trên nút "Thêm mới"`,
      cuoi.mien <= cuoi.them,
      `đáy ô miễn trừ ${String(cuoi.mien)} · đỉnh nút ${String(cuoi.them)}`,
    );
  }

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
    /* Ô "Loại biểu đồ" — ô chọn thứ hai của hàng, thay nhóm nút Đường/Cột từ 21/10/2026. */
    const oChonLoai = document.querySelectorAll('figure [class*="controls"] select')[1] ?? null;
    return {
      /* Bo góc hai điều khiển đứng cạnh nhau trên thẻ biểu đồ — phải bằng nhau. */
      boDieuKhien: {
        chon: oChonTruc === null ? null : getComputedStyle(oChonTruc).borderTopLeftRadius,
        loai: oChonLoai === null ? null : getComputedStyle(oChonLoai).borderTopLeftRadius,
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
      /*
       * Dải thay số dưới đáy THẺ GỘP ('92.000 ÷ 6.050 = 15,21').
       *
       * Đo cả display, không chỉ hình hộp: luật gốc đặt display none để khổ điện thoại không thấy
       * dòng chữ mới này, và khối 1280 phải tự bật lại. Từ lúc dựng tới 02/10/2026 nó không bật —
       * phần tử nằm đúng chỗ, nội dung đúng, mà cả 48 công thức có mẫu đều không hiện dải nào. Hộp
       * của một phần tử ẩn là 0x0 ở toạ độ 0, nên chỉ đo toạ độ là đọc ra 'có nhưng lệch' chứ không
       * đọc ra 'không hiện'.
       *
       * Không dùng dấu backtick trong chú thích này: cả khối đang nằm trong một template literal.
       */
      thaySo: (() => {
        const el = document.querySelector('[class*="substitution"]');
        if (el === null) return null;
        return { hien: getComputedStyle(el).display, ...r(el) };
      })(),
      /*
       * Thẻ gộp: cụm 'tên công thức + con số' lệch bao nhiêu so với GIỮA lưới ô nhập (chiều dọc) và
       * so với giữa cột trái của thẻ (chiều ngang, đo riêng từng dòng của cụm).
       *
       * Cụm là con duy nhất của khối Kết quả không phải tiêu đề ẩn. Đo bằng số lẻ, không qua hàm r
       * ở trên: hàm ấy làm tròn từng cạnh, mà hai lần làm tròn cộng lại đã ăn hết ngưỡng 1px.
       * Không dùng dấu backtick trong chú thích này: cả khối đang nằm trong một template literal.
       */
      canGiua: (() => {
        const khoi = document.querySelector('section[aria-labelledby="khoi-ket-qua"]');
        const cum = khoi === null ? null : ([...khoi.children].find((e) => e.tagName !== 'H2') ?? null);
        if (khoi === null || cum === null || luoi === null) return null;
        const giuaDoc = (b) => b.top + b.height / 2;
        const giuaNgang = (b) => b.left + b.width / 2;
        const k = khoi.getBoundingClientRect();
        const dong = [...cum.children].filter((e) => getComputedStyle(e).display !== 'none');
        return {
          doc: Math.round((giuaDoc(cum.getBoundingClientRect()) - giuaDoc(luoi.getBoundingClientRect())) * 10) / 10,
          ngang: dong.map((e) => Math.round((giuaNgang(e.getBoundingClientRect()) - giuaNgang(k)) * 10) / 10),
        };
      })(),
    };
  })()`;

  /*
   * Khối đo này nói về KHUÔN HAI CỘT — Số liệu trái, Kết quả rồi Biểu đồ phải. Từ 01/10/2026 khuôn
   * ấy không còn là khuôn duy nhất: 65 công thức chuyển sang THẺ GỘP (Số liệu và Kết quả chung một
   * khung, xem `hasMergedCard()`), 46 công thức còn lại giữ nguyên khuôn hai cột.
   *
   * Nên nó đổi từ `pe` sang `bien-an-toan`: `pe` đã vào thẻ gộp, còn `bien-an-toan` nằm ngoài (nó nhận
   * số từ Mô hình Gordon qua chuỗi FR-15) mà vẫn là công thức hai ô số có đường quét — tức vẫn đúng ca mà từng cạnh
   * của khuôn này muốn đo. Thẻ gộp có khối đo riêng ngay sau khối này; đừng gộp hai khối làm một,
   * chúng gác hai khuôn khác nhau và cả hai đều đang sống.
   */
  await open('/cong-thuc/bien-an-toan/');
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
   * Ô chọn trục và ô "Loại biểu đồ" đứng cạnh nhau nên bo cùng một số, 5px — chủ dự án: "điều chỉnh bo
   * bên trái bằng với bo bên phải" (10/09/2026, khi bên phải còn là nhóm nút Đường/Cột), rồi "đồng bộ
   * đều bằng 5". Từ 21/10/2026 hai ô cùng lớp `.picker`; đọc giá trị đã tính để chắc lớp ấy thật sự
   * tới được cả hai ô.
   */
  check(
    'PC 1440 · ô chọn trục và ô Loại biểu đồ cùng bo 5px',
    pcPe.boDieuKhien.chon === '5px' && pcPe.boDieuKhien.loai === '5px',
    `ô chọn trục ${String(pcPe.boDieuKhien.chon)} · ô Loại biểu đồ ${String(pcPe.boDieuKhien.loai)}`,
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
   * Các mục Giải thích xếp DỌC ở khổ PC — chủ dự án bỏ lưới 2×2 sau khi thấy ba thẻ gập trống hoác
   * cao bằng thẻ mở (xem docblock `ExplanationAccordion.module.css`). Đo: cùng mép trái, mục sau
   * bắt đầu dưới đáy mục trước.
   *
   * BA mục, không phải bốn: chỉ "Công thức này nói lên điều gì" rời đi (30/09/2026 — cả 111 trang
   * đang in đúng đoạn ấy hai lần, bản ở khối Ý nghĩa đầu màn được giữ). FR-03 vẫn đủ bốn mục TRÊN
   * MÀN, chỉ là một mục đứng ở khối khác.
   *
   * "Cách đọc kết quả" từng cũng bị tắt trong cùng đợt ấy rồi được TRẢ LẠI khối này, nên con số
   * đúng đã đi 4 → 2 → 3. Hai phép kiểm Chrome (đây và phép "cuộn tới thì mọi mục…" ở khổ 360)
   * kẹt lại ở 2 và làm cả `check:chrome` đỏ; sửa phải sửa cả cặp. Nguồn sự thật là `SECTIONS`
   * trong `ExplanationAccordion.tsx` trừ các cờ `show*` mà `FormulaDetail` thật sự truyền — nay
   * chỉ còn `showMeaning={false}`.
   */
  check(
    'PC 1440 · các mục Giải thích xếp dọc, không phải lưới 2×2',
    pcPe.mucGiaiThich !== null &&
      pcPe.mucGiaiThich.length === 3 &&
      pcPe.mucGiaiThich.every(
        (muc, i, all) =>
          muc.left === all[0].left && (i === 0 || muc.top >= (all[i - 1]?.bottom ?? Infinity)),
      ),
    `${String(pcPe.mucGiaiThich?.length)} mục · top: ${String(pcPe.mucGiaiThich?.map((m) => m.top).join(' · '))}`,
  );

  /*
   * ── THẺ GỘP "Số liệu + Kết quả" ở khổ PC (01/10/2026) ──────────────────────────────────────
   *
   * Khuôn thứ hai của trang chi tiết, cho 65 công thức: con số kết quả bên TRÁI, hàng ô nhập bên
   * PHẢI, cả hai trong một khung; dưới đáy khung là dòng thay số; rồi Giải thích và Biểu đồ chia
   * hai cột như cũ.
   *
   * Đo bằng toạ độ chứ không đọc CSS, cùng lý do với khuôn hai cột ở trên: luật nằm trong media
   * query 1280, và "hai khối nằm trong cùng một khung" là thứ chỉ trình duyệt mới trả lời được.
   * `pe` chính là công thức mà khuôn này được dựng và soi đầu tiên.
   */
  await open('/cong-thuc/pe/');
  const pcGop = await evaluate(DOC_CHI_TIET);

  check('PC 1440 · trang thẻ gộp không tràn ngang', pcGop.tran === false);

  check(
    'PC 1440 · thẻ gộp: Kết quả bên TRÁI, hàng ô nhập bên PHẢI, cùng mép trên',
    pcGop.soLieu !== null &&
      pcGop.ketQua !== null &&
      Math.abs(pcGop.soLieu.top - pcGop.ketQua.top) <= 1 &&
      pcGop.soLieu.left >= pcGop.ketQua.right,
    `Kết quả ${String(pcGop.ketQua?.left)}–${String(pcGop.ketQua?.right)} · Số liệu ${String(pcGop.soLieu?.left)}–${String(pcGop.soLieu?.right)}`,
  );

  /*
   * Cụm "tên công thức + con số" đứng GIỮA, so với đúng hàng ô nhập bên phải (13/10/2026).
   *
   * Chủ dự án khoanh hàng ấy trên `ev-ebitda`: _"đang bị lệch. cần căn giữa. điều chỉnh tương tự với
   * toàn bộ công thức khác"_. Trước khi sửa, đo được con số ở 427–477px cạnh hàng ô 434–513px: cụm
   * bám mép trên thẻ, tên công thức đứng ngang nút "?" và để trống 36px dưới con số.
   *
   * Phép "cùng mép trên" ngay trên KHÔNG thấy lỗi ấy và cũng không thấy lần sửa: nó đo hộp của khối
   * Kết quả, mà hộp ấy cao trọn hàng lưới ở cả hai trạng thái. Thứ lệch là cụm chữ BÊN TRONG hộp.
   *
   * Hai chiều, hai luật ở hai file (`.merged .result` lo chiều dọc, `.block.flat` lo chiều ngang),
   * nên đo cả hai. Chiều ngang đo từng dòng của cụm: tên và con số rộng khác nhau, căn trái thì
   * chỉ một trong hai còn có thể tình cờ nằm giữa.
   */
  check(
    'PC 1440 · thẻ gộp: tên công thức và con số đứng giữa hàng ô nhập, cả chiều dọc lẫn chiều ngang',
    pcGop.canGiua !== null &&
      Math.abs(pcGop.canGiua.doc) <= 1 &&
      pcGop.canGiua.ngang.length === 2 &&
      pcGop.canGiua.ngang.every((lech) => Math.abs(lech) <= 1),
    `lệch dọc ${String(pcGop.canGiua?.doc)}px · lệch ngang từng dòng ${String(pcGop.canGiua?.ngang.join(' / '))}px`,
  );

  /*
   * Khung của khối Số liệu THÁO ra trong thẻ gộp — thẻ bao ngoài đã là khung. Còn viền ở đây là
   * khung lồng khung, đúng thứ bản thiết kế không vẽ.
   */
  check(
    'PC 1440 · thẻ gộp: khối Số liệu không còn khung riêng',
    pcGop.vienSoLieu === '0px',
    `viền ${String(pcGop.vienSoLieu)}`,
  );

  /* Hàng ô nhỏ xếp NHIỀU cột — ngược hẳn khuôn hai cột, nơi ô nhập mỗi tham số một hàng. */
  check(
    'PC 1440 · thẻ gộp: ô nhập xếp thành hàng ô nhỏ, không phải một cột',
    pcGop.soCot !== null && pcGop.soCot >= 2,
    `${String(pcGop.soCot)} cột`,
  );

  /*
   * Dải thay số: thứ bản thiết kế vẽ ở đáy thẻ, và nửa lý do khuôn gộp tồn tại.
   *
   * Khối đo này từng chỉ mô tả dải ấy trong docblock mà không đo nó, nên suốt từ lúc dựng tới
   * 02/10/2026 dải không hiện trên bất kỳ công thức nào trong 48 công thức có `spec.substitution`
   * mà 149 phép kiểm vẫn xanh. Ba điều kiện, mỗi điều kiện gác một cách hỏng khác nhau: còn hiện,
   * nằm DƯỚI cả hai cột, và trải hết bề ngang thẻ (nó nói về cả hai nửa trên, đứng trong một nửa
   * nào cũng sai nghĩa). `merged-card-css.test.ts` gác cùng chuyện này ở tầng file CSS.
   */
  check(
    'PC 1440 · thẻ gộp: dòng thay số hiện ở đáy thẻ, trải hết hai cột',
    pcGop.thaySo !== null &&
      pcGop.thaySo.hien !== 'none' &&
      pcGop.soLieu !== null &&
      pcGop.ketQua !== null &&
      pcGop.thaySo.top >= pcGop.soLieu.bottom &&
      pcGop.thaySo.left <= pcGop.ketQua.left + 1 &&
      pcGop.thaySo.right >= pcGop.soLieu.right - 1,
    `display=${String(pcGop.thaySo?.hien)} · dải ${String(pcGop.thaySo?.left)}–${String(pcGop.thaySo?.right)} top=${String(pcGop.thaySo?.top)} · Kết quả left=${String(pcGop.ketQua?.left)} · Số liệu right=${String(pcGop.soLieu?.right)} bottom=${String(pcGop.soLieu?.bottom)}`,
  );

  check(
    'PC 1440 · thẻ gộp: Giải thích nằm dưới cả thẻ, Biểu đồ cùng hàng với nó ở cột phải',
    pcGop.giaiThich !== null &&
      pcGop.soLieu !== null &&
      pcGop.bieuDo !== null &&
      pcGop.giaiThich.top >= pcGop.soLieu.bottom &&
      Math.abs(pcGop.giaiThich.top - pcGop.bieuDo.top) <= 1 &&
      pcGop.bieuDo.left >= pcGop.giaiThich.right,
    `Giải thích top=${String(pcGop.giaiThich?.top)} · Biểu đồ top=${String(pcGop.bieuDo?.top)}`,
  );

  /*
   * Khung "?" bật ra phải nằm TRỌN trong vùng vẽ được.
   *
   * Nút "?" của khối Số liệu đứng sát mép phải thẻ, nên khung bật ra từ nó là chỗ phép kẹp ngang
   * của `placePanel` thật sự phải làm việc. Nó từng hỏng: `viewportBounds()` lấy mép phải bằng
   * `window.innerWidth`, mà con số ấy TÍNH CẢ thanh cuộn dọc (15px trên Chrome Windows), nên khung
   * thò ra ngoài cửa sổ đúng 15 trừ lề 8 là 7px. Chủ dự án chụp được ngày 09/10/2026.
   *
   * So với `document.documentElement.clientWidth`, KHÔNG phải `window.innerWidth` — dùng
   * `innerWidth` ở đây là viết lại chính con số sai rồi tự khen mình đúng.
   *
   * `place-panel.test.ts` không thấy được lỗi này vì `placePanel()` kẹp đúng theo `bounds` nó
   * nhận; `use-panel-placement.test.ts` gác phần vá được trong jsdom. Phép kiểm này là chỗ duy
   * nhất đo khung THẬT trong một trình duyệt có thanh cuộn thật.
   */
  const khungGoiY = await evaluate(`(async () => {
    const nut = [...document.querySelectorAll('[class*="GuideHint_hint__"]')];
    if (nut.length === 0) return null;
    nut.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right);
    nut[0].click();
    await new Promise((xong) => setTimeout(xong, 400));
    const p = document.querySelector('[class*="GuideHintPanel_panel__"]');
    if (!p) return { moDuoc: false };
    const r = p.getBoundingClientRect();
    const veDuoc = document.documentElement.clientWidth;
    return {
      moDuoc: true,
      veDuoc,
      thanhCuon: window.innerWidth - veDuoc,
      trai: Math.round(r.left),
      phai: Math.round(r.right),
      thua: Math.round(r.right - veDuoc),
    };
  })()`);

  check(
    'PC 1440 · khung "?" nằm trọn trong vùng vẽ được, không chui dưới thanh cuộn',
    khungGoiY !== null &&
      khungGoiY.moDuoc === true &&
      khungGoiY.trai >= 0 &&
      khungGoiY.phai <= khungGoiY.veDuoc,
    JSON.stringify(khungGoiY),
  );

  /*
   * Khung "?" của khối Biểu đồ chỉ in hình ĐANG HIỆN, ở dạng đang chọn (13/10/2026).
   *
   * Bản đầu in mọi hình của công thức, mỗi hình hai dạng, kèm hai câu chỉ tới hai dòng điều khiển —
   * chủ dự án: *"ô hướng dẫn sử dụng đang rất dài, sửa logic như sau: sau khi lựa chọn một select
   * mới từ đường thì mới hiển thị xem biểu đồ dạng đường, tương tự khi click vào xem biểu đồ dạng
   * cột"*. Vitest đi được cả luồng trong jsdom nhưng KHÔNG đo được chiều cao: "rất dài" là một số
   * đo của trình duyệt thật. Nên ở đây đo đúng thứ đã bị chê — khung có phải cuộn trong chính nó
   * không — ở hai bước: mở ra (dạng Đường), rồi bấm nút Cột và mở lại.
   *
   * Ô chọn trục không đụng tới ở đây: đổi mục là việc của `FormulaDetail.test.tsx` và
   * `charts.test.tsx`, còn phép này chỉ cần chứng minh mối nối "khối Biểu đồ báo lên → khung đọc"
   * sống được qua ranh giới nạp trễ của một bản build thật.
   */
  const khungBieuDo = await evaluate(`(async () => {
    const cho = (ms) => new Promise((xong) => setTimeout(xong, ms));
    const dong = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const nut = () => document.querySelector('a[href$="#doc-bieu-do"]');
    const doc = () => {
      const p = document.querySelector('[class*="GuideHintPanel_panel__"]');
      if (!p) return null;
      return {
        hinh: [...p.querySelectorAll('h3')].map((el) => el.textContent),
        dang: [...p.querySelectorAll('dt')].map((el) => el.textContent),
        cao: Math.round(p.getBoundingClientRect().height),
        phaiCuon: p.scrollHeight > p.clientHeight + 1,
      };
    };

    dong();
    await cho(100);
    if (!nut()) return null;
    nut().scrollIntoView({ block: 'center' });
    await cho(300);
    nut().click();
    await cho(400);
    const duong = doc();

    dong();
    // Ô "Loại biểu đồ" là ô chọn thứ hai của hàng điều khiển (thay nhóm nút Đường/Cột, 21/10/2026).
    const oLoai = document.querySelectorAll('figure [class*="controls"] select')[1];
    if (!oLoai) return { duong, cot: null };
    oLoai.value = 'bar';
    oLoai.dispatchEvent(new Event('change', { bubbles: true }));
    await cho(300);
    nut().click();
    await cho(400);
    const cot = doc();
    dong();
    return { duong, cot };
  })()`);

  check(
    'PC 1440 · khung "?" của biểu đồ chỉ in hình đang hiện ở dạng đang chọn, và không phải cuộn',
    khungBieuDo !== null &&
      khungBieuDo.duong !== null &&
      khungBieuDo.cot !== null &&
      khungBieuDo.duong.hinh.join('|') === 'P/E theo Giá thị trường (P)' &&
      khungBieuDo.duong.dang.join('|') === 'Dạng Đường' &&
      khungBieuDo.duong.phaiCuon === false &&
      khungBieuDo.cot.hinh.join('|') === 'P/E theo Giá thị trường (P)' &&
      khungBieuDo.cot.dang.join('|') === 'Dạng Cột' &&
      khungBieuDo.cot.phaiCuon === false,
    JSON.stringify(khungBieuDo),
  );

  /*
   * Ô "Loại biểu đồ" (21/10/2026): những dạng chỉ trình duyệt thật đo được. Vành khuyên đọc chữ
   * bằng getBBox, mà jsdom không có phép đo ấy; vùng âm/dương cắt bằng clipPath, jsdom không vẽ.
   * Ở 360px còn một điều nữa: hai ô chọn phải chung một hàng (sàn 7,5rem của ô "Xem theo"), kể cả
   * khi ô "Loại biểu đồ" đang mang chữ của dạng Lãi/lỗ (tên cũ "Vùng âm/dương" là chữ dài nhất, nay ngắn hơn nên ca này chỉ còn là mức chắc chắn).
   * Không dùng dấu backtick trong chú thích này: cả khối đang nằm trong một template literal.
   */
  const DOI_DANG = `(async () => {
    const cho = (ms) => new Promise((r) => setTimeout(r, ms));
    const chon = (thu, giaTri) => {
      const s = document.querySelectorAll('figure [class*="controls"] select')[thu];
      if (!s || ![...s.options].some((o) => o.value === giaTri)) return false;
      s.value = giaTri;
      s.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    };
    return { chon, cho };
  })`;

  await open('/cong-thuc/wacc/');
  await waitFor("document.querySelector('figure svg')");
  const vanhKhuyenPc = await evaluate(`(async () => {
    const { chon, cho } = await ${DOI_DANG}();
    if (!chon(0, '__breakdown')) return { loi: 'không có mục Bóc tách' };
    await cho(300);
    if (!chon(1, 'donut')) return { loi: 'không có dạng Vành khuyên' };
    await cho(300);
    const svg = document.querySelector('figure svg[data-donut]');
    if (!svg) return { loi: 'không thấy hình vành khuyên' };
    const v = svg.viewBox.baseVal;
    const tran = [...svg.querySelectorAll('text')]
      .map((t) => t.getBBox())
      .filter((r) => r.x < -0.5 || r.x + r.width > v.width + 0.5 || r.y < -0.5 || r.y + r.height > v.height + 0.5);
    return {
      mui: svg.querySelectorAll('path').length,
      tran: tran.length,
      cao: Math.round(svg.getBoundingClientRect().height),
      chu: svg.textContent,
    };
  })()`);
  check(
    'PC 1440 · wacc: Vành khuyên vẽ hai múi, chú giải ghi "chiếm …", không chữ nào tràn khung',
    vanhKhuyenPc?.mui === 2 &&
      vanhKhuyenPc.tran === 0 &&
      /chiếm \d+,\d %/.test(vanhKhuyenPc.chu ?? ''),
    JSON.stringify(vanhKhuyenPc),
  );

  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 780,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await open('/cong-thuc/roi/');
  await waitFor("document.querySelector('figure svg')");
  const amDuong360 = await evaluate(`(async () => {
    const { chon, cho } = await ${DOI_DANG}();
    if (!chon(1, 'signArea')) return { loi: 'không có dạng Lãi/lỗ' };
    await cho(300);
    const o = [...document.querySelectorAll('figure [class*="controls"] select')].map((s) =>
      Math.round(s.getBoundingClientRect().top),
    );
    const vung = document.querySelector('figure [data-sign-area]');
    return {
      hangO: o,
      cat: vung === null ? [] : [...vung.querySelectorAll('path')].map((p) => p.getAttribute('clip-path')),
      coDuong: document.querySelector('figure path[data-points]') !== null,
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  })()`);
  check(
    '360 · roi: Lãi/lỗ cắt hai nửa theo mốc 0, đường vẫn vẽ, hai ô chọn chung một hàng, không cuộn ngang',
    amDuong360?.cat?.length === 2 &&
      amDuong360.coDuong === true &&
      amDuong360.hangO?.length === 2 &&
      amDuong360.hangO[0] === amDuong360.hangO[1] &&
      amDuong360.tran === false,
    JSON.stringify(amDuong360),
  );
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  /*
   * Dạng Nến (21/10/2026): nạp ví dụ minh hoạ của EMA (250 phiên FPT đủ bốn giá), chọn Nến, rồi đo
   * bằng getBBox — jsdom không có phép đo ấy — rằng cả lớp nến nằm trong khung hình, bấc chạm đúng
   * giá cao và thấp mà không tràn qua mép trên hay mép dưới vùng vẽ.
   */
  await open('/cong-thuc/ema-n-phien/');
  await waitFor(
    "[...document.querySelectorAll('button')].some((b) => /Xem ví dụ minh hoạ/.test(b.textContent ?? ''))",
  );
  const nenPc = await evaluate(`(async () => {
    const { chon, cho } = await ${DOI_DANG}();
    const nut = [...document.querySelectorAll('button')].find((b) => /Xem ví dụ minh hoạ/.test(b.textContent ?? ''));
    if (!nut) return { loi: 'không thấy nút Xem ví dụ minh hoạ' };
    /* Bấm lại mỗi giây: cú bấm trước khi hydrate xong thì không có trình xử lý nào nhận. */
    for (let i = 0; i < 40 && !document.querySelector('figure path[data-points]'); i += 1) {
      if (i % 10 === 0) nut.click();
      await cho(100);
    }
    if (!chon(1, 'candle')) return { loi: 'không có dạng Nến', dang: [...(document.querySelectorAll('figure [class*="controls"] select')[1]?.options ?? [])].map((o) => o.value) };
    await cho(300);
    const svg = document.querySelector('figure svg[data-chart-svg]');
    const g = svg?.querySelector('[data-candles]');
    if (!svg || !g) return { loi: 'không thấy lớp nến' };
    const v = svg.viewBox.baseVal;
    const b = g.getBBox();
    return {
      phien: g.getAttribute('data-candles'),
      trong: b.x >= -0.5 && b.y >= -0.5 && b.x + b.width <= v.width + 0.5 && b.y + b.height <= v.height + 0.5,
      coDuong: svg.querySelector('path[data-points]') !== null,
      chuGiai: [...document.querySelectorAll('figure [data-legend-candle]')].map((li) => li.textContent),
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  })()`);
  check(
    'PC 1440 · ema: Nến vẽ đủ 250 phiên trong khung, đường EMA vẫn vẽ, chú giải Phiên tăng / Phiên giảm',
    nenPc?.phien === '250' &&
      nenPc.trong === true &&
      nenPc.coDuong === true &&
      nenPc.chuGiai?.join('|') === 'Phiên tăng|Phiên giảm' &&
      nenPc.tran === false,
    JSON.stringify(nenPc),
  );

  /*
   * Mục "Phân phối lợi suất" (21/10/2026): nạp ví dụ minh hoạ của VaR, chọn mục, rồi đo bằng getBBox
   * rằng cột và hai nhãn vạch (bình quân, VaR) nằm trong khung; và nút "?" của khối Biểu đồ phải
   * BIẾN MẤT, vì hai mục theo chuỗi giá chưa có chữ hướng dẫn.
   */
  await open('/cong-thuc/var-lich-su/');
  await waitFor(
    "[...document.querySelectorAll('button')].some((b) => /Xem ví dụ minh hoạ/.test(b.textContent ?? ''))",
  );
  const phanPhoiPc = await evaluate(`(async () => {
    const { chon, cho } = await ${DOI_DANG}();
    const nut = [...document.querySelectorAll('button')].find((b) => /Xem ví dụ minh hoạ/.test(b.textContent ?? ''));
    if (!nut) return { loi: 'không thấy nút Xem ví dụ minh hoạ' };
    for (let i = 0; i < 40 && !document.querySelector('figure path[data-points]'); i += 1) {
      if (i % 10 === 0) nut.click();
      await cho(100);
    }
    const hintTruoc = [...document.querySelectorAll('a[href$="#doc-bieu-do"]')].length;
    if (!chon(0, '__distribution')) return { loi: 'không có mục Phân phối lợi suất' };
    await cho(300);
    const svg = document.querySelector('figure svg[data-histogram]');
    if (!svg) return { loi: 'không thấy histogram' };
    const v = svg.viewBox.baseVal;
    const trong = (r) => r.x >= -0.5 && r.y >= -0.5 && r.x + r.width <= v.width + 0.5 && r.y + r.height <= v.height + 0.5;
    const cot = [...svg.querySelectorAll('rect[data-bin-count]')];
    const vach = [...svg.querySelectorAll('[data-marker-value] text')];
    return {
      cot: cot.length,
      cotTrong: cot.every((c) => trong(c.getBBox())),
      vach: vach.map((t) => t.textContent),
      vachTrong: vach.every((t) => trong(t.getBBox())),
      hintTruoc,
      hintSau: [...document.querySelectorAll('a[href$="#doc-bieu-do"]')].length,
      coOLoai: document.querySelectorAll('figure [class*="controls"] select').length,
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  })()`);
  check(
    'PC 1440 · var-lich-su: Phân phối lợi suất vẽ cột trong khung, hai vạch có nhãn, nút "?" của khối ẩn, không ô Loại biểu đồ',
    (phanPhoiPc?.cot ?? 0) > 5 &&
      phanPhoiPc.cotTrong === true &&
      phanPhoiPc.vach?.length === 2 &&
      phanPhoiPc.vachTrong === true &&
      phanPhoiPc.hintTruoc === 1 &&
      phanPhoiPc.hintSau === 0 &&
      phanPhoiPc.coOLoai === 1 &&
      phanPhoiPc.tran === false,
    JSON.stringify(phanPhoiPc),
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
    // Chỉ ô đang hiện: ô mang thuộc tính hidden có khung 0 × 0 ở toạ độ 0, làm sai phép đếm cột. Đo
    // khung chứ không lọc theo [hidden]: ô "chỉ ba cột" không mang hidden mà bị CSS ẩn ở khổ này.
    const oKe =
      ke === null
        ? []
        : [...ke.querySelectorAll('li')].filter((li) => li.getClientRects().length > 0).map(r);
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

  /*
   * Nhãn nhóm của ba thẻ cùng hàng phải thẳng chân nhau.
   *
   * Lưới kéo ba thẻ cao bằng thẻ cao nhất, nên một tên dài đẩy huy hiệu cấp độ xuống dòng hai là
   * hai thẻ bên cạnh thừa chiều cao. Chủ dự án chụp đúng cảnh ấy ở hàng đầu (08/10/2026): nhãn của
   * XIRR chạm đáy, hai nhãn kia treo lơ lửng. Ba khai báo chữa nó nằm ở `FormulaCard.module.css`
   * và có cửa gác đọc-nguồn riêng (`formula-card-css.test.ts`); phép kiểm này là chỗ duy nhất đo
   * HÌNH HỌC thật, thứ jsdom không trả lời được.
   *
   * PHẢI cuộn từng dòng vào khung nhìn trước khi đo. `.item` mang `content-visibility: auto` kèm
   * `contain-intrinsic-size: auto 122px`, nên thẻ ngoài khung nhìn trả về đúng 122px giữ chỗ chứ
   * không phải chiều cao thật — đo mà không cuộn là đo cái khung rỗng, và phép kiểm sẽ vừa bỏ sót
   * lỗi thật vừa dựng ra lỗi giả. Cùng họ với bẫy `content-visibility` của biểu đồ đã ghi ở trên.
   */
  const chanNhan = await evaluate(`(async () => {
    const ul = document.querySelector('#danh-sach-cong-thuc ul');
    if (!ul) return null;
    const hang = new Map();
    for (const li of ul.querySelectorAll('li')) {
      const a = li.querySelector('a');
      if (!a) continue;
      li.scrollIntoView({ block: 'center' });
      await new Promise((xong) => requestAnimationFrame(() => requestAnimationFrame(xong)));
      const nhan = a.querySelector('[class*="FormulaCard_category__"]');
      if (!nhan) continue;
      const ho = Math.round(a.getBoundingClientRect().bottom - nhan.getBoundingClientRect().bottom);
      const khoa = li.offsetTop;
      if (!hang.has(khoa)) hang.set(khoa, []);
      hang.get(khoa).push(ho);
    }
    const lech = [...hang.values()].map((hs) => Math.max(...hs) - Math.min(...hs));
    return { soHang: lech.length, hangLech: lech.filter((l) => l > 1).length, lechToiDa: Math.max(0, ...lech) };
  })()`);

  check(
    'PC 1440 · nhãn nhóm của ba thẻ cùng hàng thẳng chân nhau',
    chanNhan !== null && chanNhan.soHang > 1 && chanNhan.hangLech === 0,
    JSON.stringify(chanNhan),
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
   * Vế kia của dải thay số, và lý do nó phải là một phép kiểm riêng chứ không gộp vào phép trên:
   * lời hứa của khuôn gộp là "chỉ màn web, màn điện thoại giữ nguyên từng pixel". Dải ấy là CHỮ
   * MỚI, nên ở 360 nó phải không tồn tại trên màn. `pe` dựng ra nó (`spec.substitution` có), nên
   * đây đúng là trang kiểm được: thấy một dải ở đây nghĩa là luật gốc `display: none` đã bị gỡ
   * hoặc bị một luật ngoài media query đè, và 47 công thức có mẫu còn lại cũng đang mọc thêm một
   * dòng ở khổ điện thoại. (46 công thức ngoài khuôn gộp không dựng phần tử này bao giờ — React
   * chỉ dựng nó khi `merged`, nên chúng không nằm trong rủi ro ấy.)
   */
  check(
    'Điện thoại 360 · dòng thay số KHÔNG hiện — khuôn gộp chỉ dành cho màn web',
    dt360.thaySo !== null && dt360.thaySo.hien === 'none',
    `display=${String(dt360.thaySo?.hien)}`,
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

  /*
   * Kệ "Công thức dùng hằng ngày" thu gọn phải ra hàng cuối ĐỦ ô ở mọi khổ lưới. Chủ dự án chụp
   * lưới ba cột có tám ô, hàng cuối hụt một chỗ (15/10/2026): ô thứ chín chỉ hiện ở ba cột, bằng
   * container query — thứ jsdom không chạy, nên chỉ Chrome thật trả lời được. 360 là hai cột, 560
   * là ba cột (lưới 528px, giữa hai mốc 466 và 624 của `FeaturedFormulas.module.css`).
   */
  const DOC_KE_THU_GON = `(() => {
    const ke = document.querySelector('#cong-thuc-hang-ngay')?.closest('section') ?? null;
    if (ke === null) return null;
    const o = [...ke.querySelectorAll('li')]
      .map((li) => li.getBoundingClientRect())
      .filter((b) => b.width > 0 && b.height > 0);
    return {
      so: o.length,
      cot: new Set(o.map((b) => Math.round(b.left))).size,
      hang: new Set(o.map((b) => Math.round(b.top))).size,
    };
  })()`;

  const ke360 = await evaluate(DOC_KE_THU_GON);
  check(
    'Điện thoại 360 · kệ thu gọn 8 ô, 2 cột × 4 hàng',
    ke360 !== null && ke360.so === 8 && ke360.cot === 2 && ke360.hang === 4,
    JSON.stringify(ke360),
  );

  await send('Emulation.setDeviceMetricsOverride', {
    width: 560,
    height: 900,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await open('/cong-thuc/');
  const ke560 = await evaluate(DOC_KE_THU_GON);
  check(
    '560 · kệ thu gọn 9 ô, 3 cột × 3 hàng — hàng cuối không hụt chỗ',
    ke560 !== null && ke560.so === 9 && ke560.cot === 3 && ke560.hang === 3,
    JSON.stringify(ke560),
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
   * Đo ĐỘ LỆCH của tâm nav so với tâm THANH (`clientWidth / 2`), không đo toạ độ trần: trang ngắn thì
   * bỏ thanh cuộn và cả thanh trên rộng thêm 15px — cú giãn ấy là chuyện riêng, đã chốt để lại (xem
   * `globals.css`). Bản trước so toạ độ trần và dựa vào tiền đề "cả hai màn đủ dài để có thanh cuộn";
   * 14/10/2026 màn Cài đặt ở 1440×900 cao vừa 900px (ô biểu phí thành chữ), tiền đề ấy gãy và phép so
   * đỏ 8px vì thanh cuộn chứ không vì nav. Độ lệch so với tâm thanh là đúng điều phép đo này gác.
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
      lechTam: Math.round((r.left + r.right) / 2 - document.documentElement.clientWidth / 2),
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
      Math.abs(navCongThuc.lechTam - navCaiDat.lechTam) <= 1 &&
      Math.abs(navCongThuc.lechTam) <= 1,
    navCongThuc === null || navCaiDat === null
      ? 'không thấy hàng nav'
      : `lệch khỏi tâm thanh: Công thức ${String(navCongThuc.lechTam)}px (rộng ${String(navCongThuc.clientWidth)}) · Cài đặt ${String(navCaiDat.lechTam)}px (rộng ${String(navCaiDat.clientWidth)})`,
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
    `(() => { const b = [...document.querySelectorAll('button')].find((x) => /Thêm mới/.test(x.textContent ?? '')); if (b) b.click(); return Boolean(b); })()`,
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
    // Đo đúng cái hộp CÓ VIỀN của mỗi trường, không đo thứ nằm trong nó: ô nhập thật thì viền ở
    // .control còn thẻ input bên trong chỉ cao bằng dòng chữ, ô mở sheet thì viền ở chính thẻ button.
    // Đo lẫn hai tầng là phép so luôn lệch, kể cả khi màn đúng. (Không dùng dấu backtick trong chú
    // thích này: nó nằm TRONG một chuỗi template, và một backtick sẽ cắt đứt chuỗi.)
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
    // Ô đầu tiên của form là ô chọn mã, và nút của nó là thẻ button đầu tiên trong form.
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
   * ── Bảng Nắm giữ và khung hai cột ở khổ PC (viết lại 12/10/2026) ─────────────────────────────
   *
   * Đóng hộp thoại trước, vì nó đang che chính cái bảng cần đo.
   *
   * Ba phép đo cũ ở đây đi cùng hàng mở rộng và nút phủ cả hàng nên đã bỏ: "nút mở hàng phủ trùng khít
   * cả hàng" (không còn nút phủ), "mở một hàng thì chín cột đứng yên" và "hàng mở giữ nguyên colspan"
   * (không còn hàng mở). Cái bẫy chúng gác — `display` khác `table-cell` trên một `<td>` khiến trình
   * duyệt bọc nó vào ô ẩn danh `colspan=1` — vẫn có thật, nhưng chỗ duy nhất từng dính nó đã biến mất;
   * ghi lại để ai dựng lại một hàng chi tiết sẽ đọc được và đo lại.
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
    const khung = bang.closest('[class*="tableWrap"]');
    // Chỉ nút ĐANG VẼ: mũi tên của khổ điện thoại (14/10/2026) nằm trong DOM nhưng display: none ở PC.
    const ve = (ds) => [...ds].filter((b) => b.getClientRects().length > 0);
    const nut = ve(hang.querySelectorAll('button'));
    const cuoi = nut[nut.length - 1];

    return {
      thay: true,
      dauHien: getComputedStyle(dau).display,
      soCot: dau.querySelectorAll('th').length,
      soO: o.length,
      // Xếp thành cột thì mọi ô cùng một mép trên.
      soMepTren: new Set(o.map((el) => Math.round(el.getBoundingClientRect().top))).size,
      soNut: nut.length,
      // Hai nút của hàng nay ở Ô ĐẦU (mã, rồi dấu X xoá); ô cuối là ngày mua nên không còn nút nào.
      soNutODau: ve(o[0].querySelectorAll('button')).length,
      soNutOCuoi: ve(o[o.length - 1].querySelectorAll('button')).length,
      // Hở từ nút cuối tới mép TRÁI bảng — đứng ngay sau mã thì vài chục pixel, dạt phải thì hàng trăm.
      hoTrai:
        cuoi === undefined
          ? null
          : Math.round(cuoi.getBoundingClientRect().right - bang.getBoundingClientRect().left),
      cuonNgang: khung !== null && khung.scrollWidth > khung.clientWidth + 1,
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  })()`);

  check(
    'PC 1440 · bảng Nắm giữ dựng đủ tám cột, mọi ô của một mã trên cùng một hàng',
    pcBang.thay === true &&
      pcBang.dauHien === 'table-header-group' &&
      pcBang.soCot === 8 &&
      pcBang.soO === 8 &&
      pcBang.soMepTren === 1,
    pcBang.thay !== true
      ? 'không thấy bảng'
      : `${String(pcBang.soCot)} tiêu đề · ${String(pcBang.soO)} ô · ${String(pcBang.soMepTren)} mức mép trên`,
  );

  check(
    'PC 1440 · bảng vừa khung của nó: không cuộn ngang, không tràn trang',
    pcBang.cuonNgang === false && pcBang.tran === false,
    `cuộn trong khung: ${String(pcBang.cuonNgang)} · tràn trang: ${String(pcBang.tran)}`,
  );

  /*
   * ĐẢO ngày 13/10/2026. Phép đo cũ ở đây là "mỗi hàng đúng hai nút biểu tượng (Sửa, Xoá), dạt về mép
   * phải": bút chì và thùng rác ở cuối hàng. Chủ dự án bỏ cả hai chỗ ấy — Sửa thành cú bấm cả dòng,
   * nút xoá (nay là dấu X) dời về ngay sau mã, và ô cuối thành ngày mua. Vẫn đúng hai nút trên một hàng (mã là nút,
   * để bàn phím mở được form), nhưng cả hai nay ở Ô ĐẦU và dạt về mép TRÁI bảng.
   *
   * Ngưỡng 120px: đệm ô 12 + mã ba chữ 24 + khe 4 + dấu X 28 = 68px; mã tám chữ là 108px. Hai nút
   * mà quay về cuối hàng thì con số này lên gần nghìn. Phần ẩn/hiện của dấu X có phép đo riêng ở
   * dưới, với danh mục gieo sẵn.
   */
  check(
    'PC 1440 · hai nút của hàng (mã, dấu X xoá) nằm ở ô ĐẦU, sát mép trái; ô cuối không còn nút',
    pcBang.soNut === 2 &&
      pcBang.soNutODau === 2 &&
      pcBang.soNutOCuoi === 0 &&
      pcBang.hoTrai !== null &&
      pcBang.hoTrai <= 120,
    `${String(pcBang.soNut)} nút · ô đầu ${String(pcBang.soNutODau)} · ô cuối ${String(pcBang.soNutOCuoi)} · nút cuối cách mép trái ${String(pcBang.hoTrai)}px`,
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
    'PC 1440 · tiêu đề cột và ô số căn cùng một mép ở cả tám cột',
    pcCanLe.thay === true && pcCanLe.lech.length === 0,
    pcCanLe.thay !== true
      ? `số ô lệch nhau: ${String(pcCanLe.soTh)} tiêu đề / ${String(pcCanLe.soTd)} ô`
      : `cột lệch: ${pcCanLe.lech.join(' · ') || 'không'}`,
  );

  /*
   * ── Khung hai cột: tab dọc và thẻ tóm tắt nằm BÊN TRÁI bảng ────────────────────────────────
   *
   * Hai thứ chỉ đo được bằng toạ độ thật, và cả hai đều hỏng lặng: `@media (min-width: 1024px)` của
   * CSS Module mà jsdom không áp (nên 110 ca vitest xanh dù lưới hai cột chưa bật), và tab dọc —
   * `flex-direction: column` nằm sau luật gốc của `.tabs`, mà thứ tự file là thứ duy nhất quyết định
   * ai thắng giữa hai lớp đơn (xem `TabBar.module.css`). Thua thì hai tab xếp ngang trong một khay.
   */
  const pcHaiCot = await evaluate(`(() => {
    const bang = document.querySelector('main table');
    const tabs = [...document.querySelectorAll('[role="tablist"] [role="tab"]')];
    const the = document.querySelector('[class*="card"]');
    const r = (el) => el.getBoundingClientRect();
    if (bang === null || tabs.length !== 2 || the === null) return { thay: false, soTab: tabs.length };
    const thanh = r(tabs[0].closest('[role="tablist"]'));
    return {
      thay: true,
      tabXepDoc: r(tabs[1]).top >= r(tabs[0]).bottom - 1 && Math.abs(r(tabs[1]).left - r(tabs[0]).left) <= 1,
      thanhTraiBang: Math.round(thanh.right) <= Math.round(r(bang).left),
      theTraiBang: Math.round(r(the).right) <= Math.round(r(bang).left),
      theDuoiTab: Math.round(r(the).top) >= Math.round(thanh.bottom),
      rongCotTrai: Math.round(thanh.width),
    };
  })()`);

  check(
    'PC 1440 · hai cột: tab xếp dọc, thẻ tóm tắt ngay dưới tab, cả hai nằm bên trái bảng',
    pcHaiCot.thay === true &&
      pcHaiCot.tabXepDoc === true &&
      pcHaiCot.thanhTraiBang === true &&
      pcHaiCot.theTraiBang === true &&
      pcHaiCot.theDuoiTab === true,
    pcHaiCot.thay !== true
      ? `không dựng được: ${String(pcHaiCot.soTab)} tab`
      : `cột trái rộng ${String(pcHaiCot.rongCotTrai)}px · tab dọc ${String(pcHaiCot.tabXepDoc)} · thẻ dưới tab ${String(pcHaiCot.theDuoiTab)}`,
  );

  /*
   * ── Thẻ tóm tắt: số dài không được đâm thủng thẻ (29/09/2026, chuyển sang thẻ mới 12/10/2026) ─
   *
   * Chủ dự án chụp ô "Vốn đã bỏ ra" hiện "866.777.778.513.713.70…" tràn sang ô bên cạnh: một con số
   * là một "từ" không có chỗ ngắt. Số trong các dòng của thẻ nay xuống dòng sau dấu chấm phân nhóm
   * (`coChoNgat`) — luật CSS mà jsdom không dựng, nên chỉ ở đây đo được.
   *
   * Dòng "Vốn đã bỏ ra" vì nó là con số duy nhất KHÔNG đọc thị giá: giá vốn khổng lồ cho 23 ký tự mà
   * không cần mạng. Số LỚN "Tổng giá trị" (co chữ bằng `cqi`) thì KHÔNG đo được ở đây — nó cần thị giá,
   * mà script này không có Finbox; ca vitest "số dài" giữ phần `--ky-tu` và `<wbr>` của nó.
   *
   * Đo CHỮ bằng Range chứ không đo hộp `<span>`: hộp giãn theo lưới nên luôn vừa thẻ, chữ thì không.
   * Đo ở 1440 (khổ đang đặt) và 360 (thẻ hẹp nhất), rồi trả khổ về như cũ. Chế độ Nâng cao để cả ba
   * dòng (vốn, beta, XIRR) cùng có mặt.
   */
  await evaluate(`(() => {
    localStorage.setItem('ffb.prefs.v1', JSON.stringify({ mode: 'advanced' }));
    localStorage.setItem('ffb.portfolio.v1', JSON.stringify([
      { code: 'FPT', quantity: 1000, costPrice: 866777778513713 },
    ]));
    return true;
  })()`);
  for (const [rong, cao, dsf, mobile] of [
    [1440, 900, 1, false],
    [360, 780, 2, true],
  ]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: rong,
      height: cao,
      deviceScaleFactor: dsf,
      mobile,
    });
    await open('/danh-muc/');
    await waitFor(`/866/.test(document.querySelector('[class*="card"]')?.textContent ?? '')`);
    /*
     * Dưới 1024px thẻ thu còn một hàng (bản vẽ 14/10/2026) và dòng "Vốn đã bỏ ra" `display: none`: một
     * chữ không được vẽ thì `getClientRects()` rỗng và phép đo dưới xanh mà không đo gì. Mở thẻ trước.
     */
    if (mobile) {
      await evaluate(`(() => {
        const nut = document.querySelector('[aria-controls^="portfolio-summary"]');
        if (nut !== null && nut.getAttribute('aria-expanded') !== 'true') nut.click();
        return true;
      })()`);
      await waitFor(
        `[...document.querySelectorAll('[class*="rowValue"]')].some((el) => el.getClientRects().length > 0)`,
      );
    }
    const oSo = await evaluate(`(() => {
      const the = document.querySelector('[class*="card"]');
      const so = [...the.querySelectorAll('[class*="rowValue"]')];
      const cs = getComputedStyle(the);
      const khung = the.getBoundingClientRect();
      const trai = khung.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth);
      const phai = khung.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
      const tran = so.flatMap((chu) => {
        const range = document.createRange();
        range.selectNodeContents(chu);
        const lo = Math.max(0, ...[...range.getClientRects()].flatMap((r) => [r.right - phai, trai - r.left]));
        return lo > 0.5 ? [chu.textContent + ' lố ' + Math.round(lo) + 'px'] : [];
      });
      return {
        daiNhat: Math.max(0, ...so.map((el) => el.textContent.length)),
        tran,
        trangTran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      };
    })()`);

    check(
      `${String(rong)} · thẻ tóm tắt Danh mục: số dài ${String(oSo.daiNhat)} ký tự vẫn nằm trong thẻ`,
      oSo.daiNhat >= 20 && oSo.tran.length === 0 && oSo.trangTran === false,
      oSo.tran.length === 0 ? `trang tràn ngang: ${String(oSo.trangTran)}` : oSo.tran.join(' · '),
    );
  }
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await evaluate(`localStorage.removeItem('ffb.prefs.v1'), true`);

  /*
   * ── Bảng Mã: mã chữ trơn, dấu X hiện khi rê chuột, cột cuối là ngày mua (13/10/2026) ────────
   *
   * Chủ dự án vẽ lại dòng của bảng trên ảnh chụp: bỏ cái chip quanh mã, bỏ hai nút biểu tượng cuối
   * dòng, nút xoá dời về ngay sau mã và chỉ hiện khi rê chuột, chỗ cũ của hai nút thành ngày mua.
   * Cùng ngày, sau khi xem bản đầu: nút xoá là dấu X ĐỎ, không nền, thay cho thùng rác.
   * Phần "đọc ra là nút gì" đã có ca vitest; ba thứ dưới đây thì chỉ đo được ở đây:
   *
   *   · Dấu X ẩn/hiện là luật `@media (hover: hover)` + `:hover` trong một CSS Module — jsdom
   *     không áp CSS Module và không có con trỏ. Rê bằng `Input.dispatchMouseEvent`, tức con trỏ
   *     thật: một `mouseover` giả không bật được `:hover`.
   *   · Dấu X đứng NGAY SAU mã, trong ô đầu — vị trí chủ dự án đánh dấu, đo bằng hộp.
   *   · Bảng không mọc thanh cuộn ngang. Cột ngày rộng cố định bằng pixel, bảy cột kia bằng phần
   *     trăm; tổng lố một điểm phần trăm là `.tableWrap` cuộn — ở 1024px bảng chỉ còn ~600px.
   *
   * Hai mã: một có ngày mua, một không — ô ngày của mã sau phải là "_ _", không bỏ trống.
   */
  await evaluate(`(() => {
    localStorage.setItem('ffb.portfolio.v1', JSON.stringify([
      { code: 'FPT', quantity: 100, costPrice: 60000, buyDate: '2026-01-02', beta: null },
      { code: 'HPG', quantity: 200, costPrice: 25000, buyDate: '', beta: null },
    ]));
    return true;
  })()`);
  /*
   * Ba kênh màu 0–255 của một màu đã tính. Chrome in màu thường là "rgb(179, 32, 47)", còn màu ra
   * từ `color-mix(in srgb, …)` là "color(srgb 0.46 0.11 0.18)" — dải 0–1, phải nhân lại.
   */
  const kenhMau = (mau) => {
    const so = (mau.match(/\d+(?:\.\d+)?/g) ?? []).slice(0, 3).map(Number);
    return mau.startsWith('color(') ? so.map((k) => k * 255) : so;
  };
  /* Đỏ: kênh đỏ trội hẳn hai kênh kia. Không so mã màu cứng — token đổi theo bảng màu. */
  const laMauDo = (mau) => {
    const [r, g, b] = kenhMau(mau);
    return (
      r !== undefined && g !== undefined && b !== undefined && r > 90 && r > g * 2 && r > b * 2
    );
  };
  /* Thẫm hơn hẳn (bảng sáng): tổng ba kênh tụt ít nhất 30 đơn vị, không phải chênh do làm tròn. */
  const damHon = (a, b) => {
    const tong = (mau) => kenhMau(mau).reduce((t, k) => t + k, 0);
    return kenhMau(a).length === 3 && kenhMau(b).length === 3 && tong(a) <= tong(b) - 30;
  };
  const khongNen = (nen) => nen === 'rgba(0, 0, 0, 0)' || nen === 'transparent';

  const DOC_BANG_MA = `(() => {
    const hop = (el) => {
      const b = el.getBoundingClientRect();
      return { left: Math.round(b.left), right: Math.round(b.right), top: Math.round(b.top), bottom: Math.round(b.bottom) };
    };
    const khung = document.querySelector('[class*="tableWrap"]');
    const dong = [...khung.querySelectorAll('tbody tr')].map((tr) => {
      const o = [...tr.children];
      const nut = [...o[0].querySelectorAll('button')];
      return {
        dong: hop(tr),
        oDau: hop(o[0]),
        ma: nut[0] === undefined ? null : { chu: nut[0].textContent, ten: nut[0].getAttribute('aria-label'), ...hop(nut[0]) },
        xoa: nut[1] === undefined ? null : {
          ten: nut[1].getAttribute('aria-label'),
          mo: getComputedStyle(nut[1]).opacity,
          mau: getComputedStyle(nut[1]).color,
          nen: getComputedStyle(nut[1]).backgroundColor,
          vien: getComputedStyle(nut[1]).borderTopWidth,
          net: nut[1].querySelector('path')?.getAttribute('d') ?? '',
          day: nut[1].querySelector('svg') === null ? '' : getComputedStyle(nut[1].querySelector('svg')).strokeWidth,
          ...hop(nut[1]),
        },
        coChip: o[0].querySelector('[class*="badge"]') !== null,
        nenMa: nut[0] === undefined ? '' : getComputedStyle(nut[0]).backgroundColor,
        // Chỉ nút đang vẽ — mũi tên khổ điện thoại display: none ở PC (14/10/2026).
        soNutCaDong: [...tr.querySelectorAll('button')].filter((b) => b.getClientRects().length > 0).length,
        ngay: o[o.length - 1].textContent,
        nutOCuoi: [...o[o.length - 1].querySelectorAll('button')].filter((b) => b.getClientRects().length > 0).length,
      };
    });
    return {
      cuonNgang: khung.scrollWidth - khung.clientWidth,
      tieuDeCuoi: [...khung.querySelectorAll('thead th')].at(-1)?.textContent ?? '',
      dong,
    };
  })()`;
  for (const rong of [1440, 1024]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: rong,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await open('/danh-muc/');
    await waitFor(
      `[...document.querySelectorAll('button')].some((b) => b.getAttribute('aria-label') === 'Sửa FPT')`,
    );
    const yen = await evaluate(DOC_BANG_MA);
    const d0 = yen.dong[0];
    // Rê vào GIỮA dòng đầu, không phải vào dấu X: cái hiện ra là do rê DÒNG.
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: Math.round((d0.dong.left + d0.dong.right) / 2),
      y: Math.round((d0.dong.top + d0.dong.bottom) / 2),
    });
    await new Promise((r) => setTimeout(r, 250));
    const re = await evaluate(DOC_BANG_MA);
    /*
     * Rồi rê vào CHÍNH dấu X (13/10/2026, lượt hai). Bản đầu là một thùng rác nổi nền đỏ nhạt khi
     * rê vào; chủ dự án: "hiển thị icon X chứ không phải là icon xóa … không cần border đỏ xung
     * quanh icon X chỉ cần icon ĐỎ X thôi". Màu và nền đọc ở đúng trạng thái đang rê, vì cái nền
     * ấy chỉ từng hiện ở `:hover`.
     */
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: Math.round(((d0.xoa?.left ?? 0) + (d0.xoa?.right ?? 0)) / 2),
      y: Math.round(((d0.xoa?.top ?? 0) + (d0.xoa?.bottom ?? 0)) / 2),
    });
    await new Promise((r) => setTimeout(r, 250));
    const reX = (await evaluate(DOC_BANG_MA)).dong[0].xoa;
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 });

    const ma = d0.ma;
    const xoa = d0.xoa;
    const sauMa =
      ma !== null &&
      xoa !== null &&
      xoa.left >= ma.right &&
      xoa.left - ma.right <= 12 &&
      xoa.right <= d0.oDau.right;
    check(
      `PC ${String(rong)} · bảng Mã: mã là chữ trơn, dấu X đỏ không nền ngay sau mã chỉ hiện khi rê chuột vào dòng, cột cuối là ngày mua`,
      yen.cuonNgang <= 1 &&
        // Hai nét chéo, không phải thùng rác: nét vẽ không có đoạn ngang hay dọc nào.
        (xoa?.net ?? '') !== '' &&
        !/[hHvV]/.test(xoa?.net ?? 'h') &&
        laMauDo(re.dong[0].xoa?.mau ?? '') &&
        laMauDo(reX?.mau ?? '') &&
        // Rê vào chính nó thì ĐẬM hơn lúc mới hiện: màu thẫm hơn, nét dày hơn — vẫn không nền, không viền.
        damHon(reX?.mau ?? '', re.dong[0].xoa?.mau ?? '') &&
        Number.parseFloat(reX?.day ?? '0') > Number.parseFloat(re.dong[0].xoa?.day ?? '0') &&
        khongNen(reX?.nen ?? '') &&
        reX?.vien === '0px' &&
        yen.tieuDeCuoi === 'Ngày mua' &&
        ma?.chu === 'FPT' &&
        ma.ten === 'Sửa FPT' &&
        d0.coChip === false &&
        d0.nenMa === 'rgba(0, 0, 0, 0)' &&
        xoa?.ten === 'Xoá FPT' &&
        sauMa &&
        d0.soNutCaDong === 2 &&
        d0.nutOCuoi === 0 &&
        // Ẩn ở MỌI dòng khi chưa rê; rê dòng đầu thì chỉ dòng ấy hiện.
        yen.dong.every((d) => d.xoa?.mo === '0') &&
        re.dong[0].xoa?.mo === '1' &&
        re.dong[1].xoa?.mo === '0' &&
        d0.ngay === '02/01/2026' &&
        yen.dong[1].ngay === '_ _',
      `cuộn ngang ${String(yen.cuonNgang)}px · tiêu đề cuối "${yen.tieuDeCuoi}" · mã "${String(ma?.chu)}" ${String(ma?.left)}..${String(ma?.right)} · dấu X ${String(xoa?.left)}..${String(xoa?.right)} (ô tới ${String(d0.oDau.right)}) · mờ ${yen.dong.map((d) => String(d.xoa?.mo)).join('/')} → rê ${re.dong.map((d) => String(d.xoa?.mo)).join('/')} · X lúc hiện: màu ${String(re.dong[0].xoa?.mau)} nét ${String(re.dong[0].xoa?.day)} → rê vào X: màu ${String(reX?.mau)} nét ${String(reX?.day)} nền ${String(reX?.nen)} viền ${String(reX?.vien)} · hình "${String(xoa?.net)}" · ngày "${d0.ngay}" / "${String(yen.dong[1]?.ngay)}" · chip: ${String(d0.coChip)}`,
    );
  }
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  /*
   * ── Ô ngày mua của form in ĐÚNG chữ của cột "Ngày mua" (13/10/2026) ──────────────────────────
   *
   * Chủ dự án chụp màn: cột in `03/10/2026`, bấm vào dòng để sửa thì ô ngày trong hộp thoại in
   * `10/03/2026`. Ô ấy là `<input type="date">`, do TRÌNH DUYỆT vẽ theo ngôn ngữ của trình duyệt
   * (Chrome tiếng Anh: tháng/ngày/năm) chứ không theo `formatIsoDate()` của bảng. Nay nó là ô chữ
   * (`DateField`). jsdom không vẽ ô ngày nên vitest chỉ chứng minh được "là ô chữ"; đọc trên Chrome
   * thật mới chứng minh được hai chỗ in cùng một chuỗi.
   *
   * Ngày gieo là 02/01: loại ngày mà đảo ngày với tháng vẫn ra một ngày có thật (01/02), nên sai là
   * không tự lộ ra. Mở form bằng cú bấm CHUỘT vào giữa dòng, đúng đường chủ dự án đi.
   */
  await open('/danh-muc/');
  await waitFor(
    `[...document.querySelectorAll('button')].some((b) => b.getAttribute('aria-label') === 'Sửa FPT')`,
  );
  const dongFpt = (await evaluate(DOC_BANG_MA)).dong[0];
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', {
      type,
      x: Math.round((dongFpt.dong.left + dongFpt.dong.right) / 2),
      y: Math.round((dongFpt.dong.top + dongFpt.dong.bottom) / 2),
      button: 'left',
      clickCount: 1,
    });
  }
  await waitFor(`document.querySelector('dialog[open]') !== null`);
  const oNgayMua = await evaluate(`(() => {
    const hopThoai = [...document.querySelectorAll('dialog[open]')].pop();
    const nhan = [...hopThoai.querySelectorAll('label')].find((l) => l.textContent === 'Ngày mua');
    const o = nhan === undefined ? null : document.getElementById(nhan.htmlFor);
    if (o === null) return { thay: false };
    const khung = o.parentElement;
    const lich = khung.querySelector('input[type="date"]');
    const nut = khung.querySelector('button');
    return {
      thay: true,
      loai: o.type,
      chu: o.value,
      caoKhung: Math.round(khung.getBoundingClientRect().height),
      nutLich: nut === null ? '' : (nut.getAttribute('aria-label') ?? ''),
      // Ô ngày của trình duyệt chỉ còn là ô TÀNG HÌNH của nút lịch: không in chữ, không nhận Tab.
      lichMo: lich === null ? '' : getComputedStyle(lich).opacity,
      lichTab: lich === null ? 0 : lich.tabIndex,
      oNgayNhinThay: [...hopThoai.querySelectorAll('input[type="date"]')].filter(
        (el) => getComputedStyle(el).opacity !== '0',
      ).length,
    };
  })()`);
  check(
    'PC 1440 · form Sửa: ô Ngày mua là ô chữ và in đúng chuỗi của cột Ngày mua, không còn ô ngày do trình duyệt vẽ',
    oNgayMua.thay === true &&
      oNgayMua.loai === 'text' &&
      oNgayMua.chu === '02/01/2026' &&
      oNgayMua.chu === dongFpt.ngay &&
      oNgayMua.caoKhung === 44 &&
      oNgayMua.nutLich === 'Ngày mua · Chọn ngày trên lịch' &&
      oNgayMua.lichMo === '0' &&
      oNgayMua.lichTab === -1 &&
      oNgayMua.oNgayNhinThay === 0,
    `cột "${String(dongFpt.ngay)}" · ô "${String(oNgayMua.chu)}" (type=${String(oNgayMua.loai)}) · khung cao ${String(oNgayMua.caoKhung)}px · nút "${String(oNgayMua.nutLich)}" · ô lịch mờ ${String(oNgayMua.lichMo)}, tabindex ${String(oNgayMua.lichTab)} · ô ngày nhìn thấy: ${String(oNgayMua.oNgayNhinThay)}`,
  );

  /*
   * ── Bảng Công thức theo đúng khuôn bảng Mã (13/10/2026) ──────────────────────────────────────
   *
   * Chủ dự án xem bảng Mã vừa dựng lại rồi bảo: "đồng bộ cả bên Công thức nữa chứ không phải mỗi
   * bên mã". Nên ở đây cũng vậy: mã hết là chip, hai nút biểu tượng cuối dòng bỏ, cả dòng là đích
   * bấm mở phép tính, dấu X đỏ không nền hiện ngay sau tên khi rê chuột, và cột cuối là ngày lưu.
   *
   * Hai dòng: một bình thường, một cần nạp lại chuỗi (nền vàng, liên kết mang tên "Nạp …"). Dòng
   * sau có tên dài để ở 1024px tên xuống dòng — dấu X phải vẫn nằm trong ô đầu.
   */
  await evaluate(`(() => {
    const t = (thang, ngay) => new Date(2026, thang - 1, ngay, 10, 0, 0).getTime();
    localStorage.setItem('ffb.saved.v1', JSON.stringify([
      { id: 'pe-a', formulaId: 'pe', name: 'HPG · P/E', code: 'HPG', inputs: {}, resultValue: 12.5, resultUnit: 'lần', savedAt: t(8, 25), needsSeries: false },
      { id: 'beta-b', formulaId: 'beta', name: 'Beta của FPT, bản tôi tự đặt tên cho dễ tìm lại', code: 'FPT', inputs: {}, resultValue: 1.08, resultUnit: 'lần', savedAt: t(10, 3), needsSeries: true, seriesCount: 120 },
    ]));
    return true;
  })()`);
  const DOC_BANG_CONG_THUC = `(() => {
    const hop = (el) => {
      const b = el.getBoundingClientRect();
      return { left: Math.round(b.left), right: Math.round(b.right), top: Math.round(b.top), bottom: Math.round(b.bottom) };
    };
    const khung = document.querySelector('[class*="tableWrap"]');
    const dong = [...khung.querySelectorAll('tbody tr')].map((tr) => {
      const o = [...tr.children];
      const ten = o[0].querySelector('a');
      const x = o[0].querySelector('button');
      return {
        dong: hop(tr),
        oDau: hop(o[0]),
        soO: o.length,
        ten: ten === null ? null : { chu: ten.textContent, nhan: ten.getAttribute('aria-label'), gach: getComputedStyle(ten).textDecorationLine, ...hop(ten) },
        xoa: x === null ? null : {
          ten: x.getAttribute('aria-label'),
          mo: getComputedStyle(x).opacity,
          mau: getComputedStyle(x).color,
          nen: getComputedStyle(x).backgroundColor,
          net: x.querySelector('path')?.getAttribute('d') ?? '',
          day: x.querySelector('svg') === null ? '' : getComputedStyle(x.querySelector('svg')).strokeWidth,
          ...hop(x),
        },
        ma: o[1].textContent,
        coChip: o[1].querySelector('[class*="badge"]') !== null,
        ngay: o[o.length - 1].textContent,
        // Chỉ đích đang vẽ.
        nutOCuoi: [...o[o.length - 1].querySelectorAll('a, button')].filter((b) => b.getClientRects().length > 0).length,
        soDichBam: [...tr.querySelectorAll('a, button')].filter((b) => b.getClientRects().length > 0).length,
        oKetQua: hop(o[2]),
      };
    });
    return {
      cuonNgang: khung.scrollWidth - khung.clientWidth,
      tieuDe: [...khung.querySelectorAll('thead th')].map((th) => th.textContent),
      dong,
    };
  })()`;
  for (const rong of [1440, 1024]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: rong,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await open('/danh-muc/?tab=cong-thuc');
    await waitFor(`document.querySelector('[class*="tableWrap"] tbody a') !== null`);
    const yen = await evaluate(DOC_BANG_CONG_THUC);
    // Mới nhất trước: dòng đầu là Beta (cần nạp), dòng hai là P/E.
    const [dNap, dMo] = yen.dong;
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: Math.round((dMo.oKetQua.left + dMo.oKetQua.right) / 2),
      y: Math.round((dMo.dong.top + dMo.dong.bottom) / 2),
    });
    await new Promise((r) => setTimeout(r, 250));
    const re = await evaluate(DOC_BANG_CONG_THUC);
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: Math.round(((dMo.xoa?.left ?? 0) + (dMo.xoa?.right ?? 0)) / 2),
      y: Math.round(((dMo.xoa?.top ?? 0) + (dMo.xoa?.bottom ?? 0)) / 2),
    });
    await new Promise((r) => setTimeout(r, 250));
    const reX = (await evaluate(DOC_BANG_CONG_THUC)).dong[1].xoa;
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 });

    // Bấm CHUỘT vào ô Kết quả của dòng P/E (không phải liên kết, không phải nút): dòng phải mở bản lưu.
    for (const type of ['mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', {
        type,
        x: Math.round((dMo.oKetQua.left + dMo.oKetQua.right) / 2),
        y: Math.round((dMo.dong.top + dMo.dong.bottom) / 2),
        button: 'left',
        clickCount: 1,
      });
    }
    await waitFor(`location.pathname.startsWith('/cong-thuc/')`);
    const dich = await evaluate(`location.pathname + location.search`);

    const sauTen = (d) =>
      d.ten !== null &&
      d.xoa !== null &&
      d.xoa.left >= d.ten.right &&
      d.xoa.left - d.ten.right <= 12 &&
      d.xoa.right <= d.oDau.right;
    check(
      `PC ${String(rong)} · bảng Công thức theo khuôn bảng Mã: bốn cột kết bằng ngày lưu, tên là liên kết, dấu X đỏ không nền hiện khi rê chuột, bấm dòng mở bản lưu`,
      yen.cuonNgang <= 1 &&
        yen.tieuDe.join('|') === 'Công thức|Mã|Kết quả|Ngày lưu' &&
        yen.dong.length === 2 &&
        yen.dong.every((d) => d.soO === 4 && d.soDichBam === 2 && d.nutOCuoi === 0) &&
        dMo.ten?.chu === 'HPG · P/E' &&
        dMo.ten.nhan === 'Mở HPG · P/E' &&
        dMo.ten.gach === 'none' &&
        (dNap.ten?.nhan ?? '').startsWith('Nạp ') &&
        dMo.xoa?.ten === 'Xoá HPG · P/E' &&
        sauTen(dMo) &&
        sauTen(dNap) &&
        dMo.ma === 'HPG' &&
        dMo.coChip === false &&
        dMo.ngay === '25/08/2026' &&
        dNap.ngay === '03/10/2026' &&
        // Ẩn ở MỌI dòng khi chưa rê; rê dòng P/E thì chỉ dòng ấy hiện.
        yen.dong.every((d) => d.xoa?.mo === '0') &&
        re.dong[1].xoa?.mo === '1' &&
        re.dong[0].xoa?.mo === '0' &&
        laMauDo(re.dong[1].xoa?.mau ?? '') &&
        laMauDo(reX?.mau ?? '') &&
        damHon(reX?.mau ?? '', re.dong[1].xoa?.mau ?? '') &&
        Number.parseFloat(reX?.day ?? '0') > Number.parseFloat(re.dong[1].xoa?.day ?? '0') &&
        khongNen(reX?.nen ?? '') &&
        !/[hHvV]/.test(dMo.xoa?.net ?? 'h') &&
        /^\/cong-thuc\/pe\/\?luu=pe-a$/.test(dich),
      `cuộn ngang ${String(yen.cuonNgang)}px · cột "${yen.tieuDe.join(' · ')}" · tên "${String(dMo.ten?.chu)}" ${String(dMo.ten?.left)}..${String(dMo.ten?.right)} · dấu X ${String(dMo.xoa?.left)}..${String(dMo.xoa?.right)} (ô tới ${String(dMo.oDau.right)}); dòng tên dài: X ${String(dNap.xoa?.left)}..${String(dNap.xoa?.right)} (ô tới ${String(dNap.oDau.right)}) · mờ ${yen.dong.map((d) => String(d.xoa?.mo)).join('/')} → rê ${re.dong.map((d) => String(d.xoa?.mo)).join('/')} · X lúc hiện: màu ${String(re.dong[1].xoa?.mau)} nét ${String(re.dong[1].xoa?.day)} → rê vào X: màu ${String(reX?.mau)} nét ${String(reX?.day)} nền ${String(reX?.nen)} · ngày "${dMo.ngay}" · chip: ${String(dMo.coChip)} · bấm dòng → ${String(dich)}`,
    );
  }

  /*
   * ── Bảng Công thức ở khổ ĐIỆN THOẠI: không dòng thả xuống (14/10/2026, lượt hai) ─────────────────
   *
   * Chủ dự án: "không có popup đổ xuống khi bấm vào mã nữa, chuyển date lên cùng hàng với cái số liệu
   * kia giống như bên Mã. bây giờ bấm vào công thức thì là vào phần sửa luôn, tạo thêm Icon xóa ở góc
   * bên phải như ở web". Nên dưới 1024px: bốn cột như PC, không dòng chi tiết, không mũi tên; dấu X đỏ
   * LUÔN hiện, cuối ô Ngày lưu, sát mép phải, vùng chạm 44px; chạm dòng mở phép tính.
   *
   * Thêm một dòng kết quả dài (67.520.669,9 ₫): thêm cột Ngày lưu làm ô Kết quả hẹp lại, và bản đầu để
   * đơn vị rơi xuống dòng riêng ở 390px. Số và đơn vị phải nằm trên MỘT dòng.
   *
   * Vùng chạm của dấu X không được phủ lên chữ ngày (chủ dự án: "giãn cách icon X để dễ dàng thao tác
   * hơn"). Bản đầu cách ngày 2px với vùng chạm lan sang trái 24px: chạm vào ngày là xoá. Cùng lúc bảng
   * phải vừa khung ở 360px — dòng kết quả dài kia chính là trường hợp chật nhất.
   *
   * Ba số liệu (mã, kết quả, ngày lưu) MỘT cỡ và nhỏ hơn tên phép tính (chủ dự án, cùng ngày: "đồng bộ
   * size text của các số liệu … đảm bảo size đó nhỏ hơn size của tên công thức"), và MỘT nét, nhạt hơn
   * tên ("đồng bộ để không in đậm. ngoại trừ tên công thức thì mới in đậm"). Đo bằng cỡ chữ và độ đậm đã
   * tính của trình duyệt, vì luật nằm trong `@media` mà jsdom không áp.
   *
   * Từ 19/10/2026 tên phép tính về 13px, BẰNG cỡ ba số liệu, và tối đa hai dòng rồi "…" (chủ dự án: "đoạn
   * text này đang lớn quá, giảm xuống, nếu quá dài thì có thể xuống đến hàng 2 và để ..."). Độ đậm là thứ
   * còn tách tên khỏi số liệu. Dòng Beta mang tên tự đặt dài chính là dòng phải bị cắt ở 360px.
   */
  await evaluate(`(() => {
    const t = (thang, ngay) => new Date(2026, thang - 1, ngay, 10, 0, 0).getTime();
    localStorage.setItem('ffb.saved.v1', JSON.stringify([
      { id: 'pe-a', formulaId: 'pe', name: 'HPG · P/E', code: 'HPG', inputs: {}, resultValue: 12.5, resultUnit: 'lần', savedAt: t(8, 25), needsSeries: false },
      { id: 'lk', formulaId: 'lai-kep', name: 'Lãi kép', inputs: {}, resultValue: 67520669.9, resultUnit: '₫', savedAt: t(9, 11), needsSeries: false },
      { id: 'beta-b', formulaId: 'beta', name: 'Beta của FPT, bản tôi tự đặt tên cho dễ tìm lại', code: 'FPT', inputs: {}, resultValue: 1.08, resultUnit: 'lần', savedAt: t(10, 3), needsSeries: true, seriesCount: 120 },
    ]));
    return true;
  })()`);
  const DOC_CONG_THUC_NHO = `(() => {
    const khung = document.querySelector('[class*="tableWrap"]');
    const bang = khung.querySelector('table');
    const hop = (el) => el.getBoundingClientRect();
    const soDong = (el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      return new Set([...r.getClientRects()].map((h) => Math.round(h.top))).size;
    };
    return {
      cot: [...bang.querySelectorAll('thead th')].filter((th) => getComputedStyle(th).display !== 'none').map((th) => th.textContent),
      cuon: khung.scrollWidth - khung.clientWidth,
      tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      chiTiet: document.querySelectorAll('tr[id*="chi-tiet"]').length,
      muiTen: [...bang.querySelectorAll('button')].filter((b) => (b.getAttribute('aria-label') ?? '').startsWith('Chi tiết')).length,
      dong: [...bang.querySelectorAll('tbody tr')].map((tr) => {
        const o = [...tr.children];
        const cuoi = o[o.length - 1];
        const x = cuoi.querySelector('button');
        const xr = x === null ? null : hop(x);
        const sau = x === null ? null : getComputedStyle(x, '::after');
        const kq = hop(o[2]);
        return {
          soO: o.length,
          ten: o[0].querySelector('a')?.textContent ?? '',
          nutODau: o[0].querySelectorAll('button').length,
          ngay: cuoi.textContent,
          ketQua: o[2].textContent,
          ketQuaDong: soDong(o[2]),
          // Số dòng NHÌN THẤY của tên (dòng bị cắt vẫn có hộp chữ, nên đo chiều cao chứ không đếm hộp),
          // và tên có bị cắt "…" hay không.
          tenDong: (() => {
            const a = o[0].querySelector('a');
            return Math.round(a.clientHeight / parseFloat(getComputedStyle(a).lineHeight));
          })(),
          tenCat: (() => {
            const a = o[0].querySelector('a');
            return a.scrollHeight > a.clientHeight + 1;
          })(),
          // Cỡ chữ: tên phép tính, và ba số liệu (mã — nếu dòng có mã —, kết quả, ngày lưu).
          coChu: (() => {
            const co = (el) => (el === null ? null : parseFloat(getComputedStyle(el).fontSize));
            return {
              ten: co(o[0].querySelector('a')),
              ma: co(o[1].querySelector('span')),
              ketQua: co(o[2]),
              ngay: co(cuoi.querySelector('[class*="lastCell"]') ?? cuoi),
            };
          })(),
          // Độ đậm của cùng bốn chỗ ấy: chỉ tên được đậm.
          netChu: (() => {
            const net = (el) => (el === null ? null : Number(getComputedStyle(el).fontWeight));
            return {
              ten: net(o[0].querySelector('a')),
              ma: net(o[1].querySelector('span')),
              ketQua: net(o[2]),
              ngay: net(cuoi.querySelector('[class*="lastCell"]') ?? cuoi),
            };
          })(),
          // Màu của cùng bốn chỗ ấy: MỘT màu cho cả dòng, tên cũng thế.
          mauChu: (() => {
            const mau = (el) => (el === null ? null : getComputedStyle(el).color);
            return {
              ten: mau(o[0].querySelector('a')),
              ma: mau(o[1].querySelector('span')),
              ketQua: mau(o[2]),
              ngay: mau(cuoi.querySelector('[class*="lastCell"]') ?? cuoi),
            };
          })(),
          tamKetQua: { x: (kq.left + kq.right) / 2, y: (kq.top + kq.bottom) / 2 },
          x: x === null ? null : {
            ten: x.getAttribute('aria-label'),
            mo: getComputedStyle(x).opacity,
            mau: getComputedStyle(x).color,
            sauNgay: x.previousSibling?.textContent === cuoi.textContent,
            cungHang: Math.abs((xr.top + xr.bottom) / 2 - (hop(cuoi).top + hop(cuoi).bottom) / 2) < 2,
            cachMepBang: Math.round(hop(bang).right - xr.right),
            chamRong: Math.round(xr.width - parseFloat(sau.left) - parseFloat(sau.right)),
            chamCao: Math.round(xr.height - parseFloat(sau.top) - parseFloat(sau.bottom)),
            // Mép trái vùng chạm trừ mép phải chữ ngày: âm là chạm vào ngày cũng thành xoá.
            chamCachNgay: (() => {
              const r = document.createRange();
              r.selectNodeContents(cuoi);
              r.setEndBefore(x);
              return Math.round(xr.left + parseFloat(sau.left) - r.getBoundingClientRect().right);
            })(),
            tam: { x: (xr.left + xr.right) / 2, y: (xr.top + xr.bottom) / 2 },
          },
        };
      }),
    };
  })()`;
  for (const [rong, cao] of [
    [360, 780],
    [560, 900],
  ]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: rong,
      height: cao,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await open('/danh-muc/?tab=cong-thuc');
    await waitFor(`document.querySelectorAll('[class*="tableWrap"] tbody a').length === 3`);

    /*
     * Sắp bảng Công thức bằng tiêu đề cột (14/10/2026), chạm chuột THẬT vào giữa ô tiêu đề "Công thức".
     * Lúc đầu Ngày lưu mang `aria-sort` (mặc định mới trước, có mũi tên); bấm thì tên xếp theo chữ cái, và
     * mũi tên ra sau chữ "Công thức" — cột mà ở 360px bề rộng tối thiểu đã do chính tiêu đề ấy quyết, cạnh
     * dòng kết quả dài nhất, nên đây là chỗ bảng dễ rộng quá khung nhất. Bấm thêm hai lần là về mặc định
     * và kho gỡ khoá; các bước chạm X và chạm dòng bên dưới đo trên thứ tự mặc định ấy.
     */
    const DOC_SAP_CONG_THUC = `(() => {
      const khung = document.querySelector('[class*="tableWrap"]');
      const ths = [...khung.querySelectorAll('thead th')];
      return {
        sap: ths.map((th) => th.getAttribute('aria-sort') ?? '').join('|'),
        muiTen: ths.map((th) => th.querySelector('svg') !== null),
        ten: [...khung.querySelectorAll('tbody tr')].map((tr) => tr.querySelector('a')?.textContent ?? ''),
        cuon: khung.scrollWidth - khung.clientWidth,
        tran: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        kho: localStorage.getItem('ffb.saved.sort.v1'),
      };
    })()`;
    const sapDau = await evaluate(DOC_SAP_CONG_THUC);
    const oCongThuc = await evaluate(`(() => {
      const r = document.querySelector('[class*="tableWrap"] thead th').getBoundingClientRect();
      return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 };
    })()`);
    const chamTieuDe = async () => {
      for (const type of ['mousePressed', 'mouseReleased']) {
        await send('Input.dispatchMouseEvent', {
          type,
          x: Math.round(oCongThuc.x),
          y: Math.round(oCongThuc.y),
          button: 'left',
          clickCount: 1,
        });
      }
      await new Promise((r) => setTimeout(r, 200));
    };
    await chamTieuDe();
    const sapTen = await evaluate(DOC_SAP_CONG_THUC);
    await chamTieuDe();
    await chamTieuDe();
    const sapVe = await evaluate(DOC_SAP_CONG_THUC);
    check(
      `${String(rong)} · Danh mục, bảng Công thức: chạm tiêu đề "Công thức" thì sắp theo tên, mũi tên ra sau chữ mà bảng không cuộn ngang; hai lần nữa thì về Ngày lưu mới trước`,
      sapDau.sap === '|||descending' &&
        sapDau.muiTen.join('|') === 'false|false|false|true' &&
        sapDau.ten.join('|') ===
          'Beta của FPT, bản tôi tự đặt tên cho dễ tìm lại|Lãi kép|HPG · P/E' &&
        sapTen.sap === 'ascending|||' &&
        sapTen.muiTen.join('|') === 'true|false|false|false' &&
        sapTen.ten.join('|') ===
          'Beta của FPT, bản tôi tự đặt tên cho dễ tìm lại|HPG · P/E|Lãi kép' &&
        sapTen.cuon <= 0 &&
        sapTen.tran === false &&
        sapTen.kho === '{"key":"title","dir":"asc"}' &&
        sapVe.sap === '|||descending' &&
        sapVe.ten.join('|') === sapDau.ten.join('|') &&
        sapVe.kho === null,
      `đầu: ${sapDau.sap} · ${sapDau.ten.join(' / ')} | sau chạm: ${sapTen.sap} · ${sapTen.ten.join(' / ')} · cuộn ${String(sapTen.cuon)}px · kho ${String(sapTen.kho)} | về: ${sapVe.sap} · kho ${String(sapVe.kho)}`,
    );

    const nho = await evaluate(DOC_CONG_THUC_NHO);
    const lk = nho.dong.find((d) => d.ten === 'Lãi kép');

    // Chạm chuột thật vào dấu X của dòng Lãi kép: dòng mất, trang đứng yên.
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 });
    for (const type of ['mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', {
        type,
        x: Math.round(lk?.x?.tam.x ?? 0),
        y: Math.round(lk?.x?.tam.y ?? 0),
        button: 'left',
        clickCount: 1,
      });
    }
    await new Promise((r) => setTimeout(r, 300));
    const sauXoa = await evaluate(
      `({ dong: document.querySelectorAll('[class*="tableWrap"] tbody tr').length, url: location.pathname })`,
    );

    // Chạm vào ô Kết quả của dòng P/E (không phải liên kết, không phải nút): mở thẳng bản lưu.
    const pe = (await evaluate(DOC_CONG_THUC_NHO)).dong.find((d) => d.ten === 'HPG · P/E');
    for (const type of ['mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', {
        type,
        x: Math.round(pe?.tamKetQua.x ?? 0),
        y: Math.round(pe?.tamKetQua.y ?? 0),
        button: 'left',
        clickCount: 1,
      });
    }
    await waitFor(`location.pathname.startsWith('/cong-thuc/')`);
    const dichNho = await evaluate(`location.pathname + location.search`);
    await evaluate(`sessionStorage.removeItem('ffb.visit.v1'), true`);
    // Phép xoá vừa rồi ghi xuống kho; gieo lại cho khổ sau.
    await evaluate(`(() => {
      const kho = JSON.parse(localStorage.getItem('ffb.saved.v1') ?? '[]');
      const t = new Date(2026, 8, 11, 10, 0, 0).getTime();
      kho.push({ id: 'lk', formulaId: 'lai-kep', name: 'Lãi kép', inputs: {}, resultValue: 67520669.9, resultUnit: '₫', savedAt: t, needsSeries: false });
      localStorage.setItem('ffb.saved.v1', JSON.stringify(kho));
      return true;
    })()`);

    check(
      `${String(rong)} · Danh mục, bảng Công thức: bốn cột cùng hàng, không dòng thả xuống, dấu X đỏ luôn hiện cuối ô Ngày lưu, chạm X xoá, chạm dòng mở phép tính`,
      nho.cot.join('|') === 'Công thức|Mã|Kết quả|Ngày lưu' &&
        nho.cuon <= 0 &&
        nho.tran === false &&
        nho.chiTiet === 0 &&
        nho.muiTen === 0 &&
        nho.dong.length === 3 &&
        nho.dong.every(
          (d) =>
            d.soO === 4 &&
            d.nutODau === 0 &&
            d.ketQuaDong === 1 &&
            d.x !== null &&
            d.x.mo === '1' &&
            laMauDo(d.x.mau) &&
            d.x.sauNgay &&
            d.x.cungHang &&
            d.x.cachMepBang >= 0 &&
            d.x.cachMepBang <= 12 &&
            d.x.chamRong >= 44 &&
            d.x.chamCao >= 44 &&
            d.x.chamCachNgay >= 0 &&
            // Tên tối đa hai dòng nhìn thấy (19/10/2026), phần thừa cắt bằng "…".
            d.tenDong >= 1 &&
            d.tenDong <= 2 &&
            // Ba số liệu một cỡ, BẰNG cỡ tên từ 19/10/2026 (mã chỉ so ở dòng có mã).
            d.coChu.ketQua === d.coChu.ngay &&
            (d.coChu.ma === null || d.coChu.ma === d.coChu.ngay) &&
            d.coChu.ngay === d.coChu.ten &&
            // …và một nét, nhạt hơn tên: chỉ tên phép tính in đậm.
            d.netChu.ketQua === d.netChu.ngay &&
            (d.netChu.ma === null || d.netChu.ma === d.netChu.ngay) &&
            (d.netChu.ngay ?? 0) < (d.netChu.ten ?? 0) &&
            // …và MỘT màu cho cả dòng, tên cũng thế.
            d.mauChu.ketQua === d.mauChu.ten &&
            d.mauChu.ngay === d.mauChu.ten &&
            (d.mauChu.ma === null || d.mauChu.ma === d.mauChu.ten),
        ) &&
        nho.dong.some((d) => d.coChu.ma !== null) &&
        // Ở 360px tên tự đặt dài của dòng Beta phải bị cắt thật, không thì ca trên chẳng thử được gì.
        (rong > 400 || nho.dong.some((d) => d.tenCat)) &&
        lk?.ketQua.replace(/\s/g, ' ') === '67.520.669,9 ₫' &&
        sauXoa.dong === 2 &&
        sauXoa.url === '/danh-muc/' &&
        /^\/cong-thuc\/pe\/\?luu=pe-a$/.test(dichNho),
      `cột "${nho.cot.join(' · ')}" · cuộn ${String(nho.cuon)}px · chi tiết ${String(nho.chiTiet)} · mũi tên ${String(nho.muiTen)} · ${nho.dong.map((d) => `${d.ten}: ${String(d.soO)} ô, tên ${String(d.tenDong)} dòng cắt ${String(d.tenCat)}, kết quả "${d.ketQua}" ${String(d.ketQuaDong)} dòng, X mờ ${String(d.x?.mo)} màu ${String(d.x?.mau)} sau ngày ${String(d.x?.sauNgay)} cùng hàng ${String(d.x?.cungHang)} cách mép ${String(d.x?.cachMepBang)}px chạm ${String(d.x?.chamRong)}×${String(d.x?.chamCao)} cách chữ ngày ${String(d.x?.chamCachNgay)}px, cỡ chữ tên ${String(d.coChu.ten)} · mã ${String(d.coChu.ma)} · kết quả ${String(d.coChu.ketQua)} · ngày ${String(d.coChu.ngay)}, nét tên ${String(d.netChu.ten)} · mã ${String(d.netChu.ma)} · kết quả ${String(d.netChu.ketQua)} · ngày ${String(d.netChu.ngay)}, màu tên ${String(d.mauChu.ten)} · mã ${String(d.mauChu.ma)} · kết quả ${String(d.mauChu.ketQua)} · ngày ${String(d.mauChu.ngay)}`).join(' | ')} · sau X: ${String(sauXoa.dong)} dòng ở ${sauXoa.url} · chạm dòng → ${dichNho}`,
    );
  }
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await open('/danh-muc/');
  await evaluate(`localStorage.removeItem('ffb.saved.v1'), true`);
  // Cú bấm dòng vừa rồi mở một lượt xem công thức; dọn dấu để các phép đo sau bắt đầu sạch.
  await evaluate(`sessionStorage.removeItem('ffb.visit.v1'), true`);

  await evaluate(`localStorage.removeItem('ffb.portfolio.v1'), true`);

  /*
   * ── Bảng dữ liệu: cột Ngày chỉ in ngày/tháng/năm (13/10/2026) ────────────────────────────────
   *
   * Cùng kiểu lỗi với ô ngày mua, theo cách riêng của bảng này: bộ mẫu và Finbox ghi ISO
   * ('2026-10-03'), người dùng gõ kiểu Việt, nên một cột in hai lối viết và cùng một phiên hiện ISO
   * ở đây nhưng '03/10/2026' trên trục biểu đồ của màn chi tiết. Gieo một bảng ISO như kho cũ đang
   * cất, mở màn, rồi đọc cả ô lẫn kho: bảng phải tự đưa về một lối và ghi lại theo lối ấy.
   */
  await evaluate(`(() => {
    localStorage.setItem('ffb.series.v1', JSON.stringify({ code: 'FPT', rows: [
      { date: '2026-10-02', open: 105, high: 112, low: 104, close: 110, volume: 1100 },
      { date: '2026-10-03', open: 110, high: 118, low: 109, close: 115, volume: 1200 },
    ] }));
    return true;
  })()`);
  await open('/du-lieu/');
  await waitFor(`document.querySelector('input[aria-label="Dòng 1 · Ngày"]') !== null`);
  await waitFor(
    `(JSON.parse(localStorage.getItem('ffb.series.v1') ?? '{}').rows ?? []).some((r) => r.date === '03/10/2026')`,
  );
  /*
   * Từ 20/10/2026 ô Ngày in gọn ngày/tháng khi không đang sửa, năm in một lần cạnh tiêu đề bảng
   * (khuôn lưới "Bảng dữ liệu"). Lối viết đủ năm vẫn là thứ nằm trong kho và trên đầu biểu đồ.
   */
  const ngayBang = await evaluate(`(() => ({
    o: [...document.querySelectorAll('input[aria-label$="· Ngày"]')].map((el) => el.value),
    kho: JSON.parse(localStorage.getItem('ffb.series.v1')).rows.map((r) => r.date),
    dauBieuDo: document.querySelector('figure')?.textContent ?? '',
    nam: [...document.querySelectorAll('main section p')].some((p) => p.textContent === 'Năm 2026'),
  }))()`);
  check(
    'PC 1440 · bảng dữ liệu: kho cất ngày ISO mở ra ngày/tháng ở cột Ngày (năm in một lần trên bảng), ngày/tháng/năm ở đầu biểu đồ và trong kho',
    ngayBang.o.join('|') === '03/10|02/10' &&
      ngayBang.nam === true &&
      ngayBang.kho.join('|') === '02/10/2026|03/10/2026' &&
      ngayBang.dauBieuDo.includes('02/10/2026 → 03/10/2026') &&
      !ngayBang.dauBieuDo.includes('2026-10'),
    `cột Ngày "${ngayBang.o.join(' · ')}" · kho "${ngayBang.kho.join(' · ')}"`,
  );
  await evaluate(`localStorage.removeItem('ffb.series.v1'), true`);

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
   *
   * Bốn chuỗi ngày viết kiểu ngày/tháng/năm từ 13/10/2026. `GIEO_CHUOI` vẫn gieo ISO như một kho cũ,
   * và bảng đưa mọi ngày đủ năm về một lối lúc mở màn rồi ghi lại theo lối ấy (xem phép đo "kho cất
   * ngày ISO…" ở trên). Thứ phép này gác KHÔNG đổi: màn mới nhất trước, kho cũ nhất trước. Từ
   * 20/10/2026 ô trên màn in gọn ngày/tháng (năm in một lần cạnh tiêu đề bảng), kho vẫn đủ năm.
   */
  check(
    'PC 1440 · bảng bày ngày MỚI NHẤT trước, còn mảng đã lưu vẫn theo thời gian cũ → mới',
    pcChuoi.soDong === 80 &&
      pcChuoi.ngayDau === '22/03' &&
      pcChuoi.ngayCuoi === '02/01' &&
      pcChuoi.luuDau === '02/01/2025' &&
      pcChuoi.luuCuoi === '22/03/2025',
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
   * ── Tấm dán đáy thành popup giữa màn ở khổ web, và GIỮ dán đáy ở điện thoại (13/10/2026) ─────
   *
   * Chủ dự án: _"chuyển đổi toàn bộ dialog bottom ở màn web thành popup ở giữa màn hình … còn ở màn
   * mobile thì giữ nguyên dialog bottom"_. Việc đổi dáng nằm trọn trong một khối `@media` ở cuối
   * `BottomSheet.module.css`, tức đúng loại thay đổi chỉ trình duyệt thật mới thấy: jsdom không áp
   * CSS Module, còn ca vitest của primitive chỉ so được CHỮ của hai bản luật chứ không biết luật
   * nào thắng trên màn.
   *
   * Đo bằng lề chứ không bằng tên lớp, cùng lối với phép đo sheet chọn mã của Danh mục ở trên: tấm
   * nổi giữa có lề trái bằng lề phải VÀ có lề dưới; tấm dán đáy thì lề dưới bằng 0. Bốn góc bo là
   * chỗ lần đổi vỏ 22/09/2026 từng hỏng (hai góc dưới vuông), nên đo cả hai chiều: bằng nhau ở khổ
   * web, và hai góc dưới PHẢI vuông ở điện thoại — đó là dấu hiệu tấm vẫn tựa vào mép màn.
   *
   * Sheet chọn mã không đo ở đây: nó cần danh sách mã từ Finbox mà script không có mạng. Nó dùng
   * chung primitive, và dáng nổi giữa của nó đã có phép đo riêng ở phần Danh mục.
   */
  const doTam = (nhanNut) =>
    evaluate(`(async () => {
    const nut = [...document.querySelectorAll('button')]
      .filter((b) => b.closest('dialog') === null)
      .find((b) => /${nhanNut}/.test(b.textContent ?? ''));
    if (nut === undefined) return { thay: false, vi: 'không thấy nút mở' };
    nut.click();

    let hop = null;
    for (let i = 0; i < 40 && hop === null; i += 1) {
      hop = document.querySelector('dialog[open]');
      if (hop === null) await new Promise((d) => setTimeout(d, 50));
    }
    if (hop === null) return { thay: false, vi: 'bấm rồi mà không tấm nào mở' };
    await new Promise((d) => setTimeout(d, 150));

    const tam = hop.querySelector('[class*="panel"]');
    const than = hop.querySelector('[class*="body"]');
    const vach = hop.querySelector('[class*="grabber"]');
    const k = hop.getBoundingClientRect();
    const s = getComputedStyle(tam);
    const ket = {
      thay: true,
      rong: Math.round(k.width),
      leTrai: Math.round(k.left),
      lePhai: Math.round(window.innerWidth - k.right),
      leDuoi: Math.round(window.innerHeight - k.bottom),
      manRong: window.innerWidth,
      goc: [
        s.borderTopLeftRadius,
        s.borderTopRightRadius,
        s.borderBottomRightRadius,
        s.borderBottomLeftRadius,
      ].map((v) => Math.round(parseFloat(v))),
      vachHien: vach !== null && getComputedStyle(vach).display !== 'none',
      // Thân phải cuộn bao nhiêu px mới hết nội dung — 0 là vừa khít.
      cuon: than.scrollHeight - than.clientHeight,
    };

    const dong = [...hop.querySelectorAll('button')].find((b) => /Đóng|Quay lại/.test(b.textContent ?? ''));
    if (dong !== undefined) dong.click();
    for (let i = 0; i < 40 && document.querySelector('dialog[open]') !== null; i += 1) {
      await new Promise((d) => setTimeout(d, 50));
    }
    return ket;
  })()`);

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await open('/cong-thuc/pe/');

  const pcXuat = await doTam('Tải về');
  check(
    'PC 1440 · sheet Tải về nổi giữa màn, không dán đáy',
    pcXuat.thay === true && Math.abs(pcXuat.leTrai - pcXuat.lePhai) <= 1 && pcXuat.leDuoi > 0,
    pcXuat.thay !== true
      ? String(pcXuat.vi)
      : `lề ${String(pcXuat.leTrai)}/${String(pcXuat.lePhai)} · đáy ${String(pcXuat.leDuoi)}px`,
  );
  check(
    'PC 1440 · sheet Tải về là tấm HẸP 560px, bốn góc bo đều, không còn vạch kéo',
    pcXuat.thay === true &&
      pcXuat.rong === 560 &&
      pcXuat.goc.every((v) => v >= 8) &&
      new Set(pcXuat.goc).size === 1 &&
      pcXuat.vachHien === false,
    pcXuat.thay !== true
      ? String(pcXuat.vi)
      : `rộng ${String(pcXuat.rong)}px · góc ${pcXuat.goc.join('/')}px · vạch kéo hiện: ${String(pcXuat.vachHien)}`,
  );

  /*
   * Sheet Nạp mẫu là tấm sát trần nhất: bốn dòng mã, mỗi dòng ba hàng chữ, cộng lối sang kho mã
   * lớn — ước tính ~586px trên trần 600px của dạng nổi giữa. Lố một chút là thân tấm mọc thanh
   * cuộn để cuộn mươi pixel, một thứ không ai báo lỗi nhưng ai cũng thấy vướng.
   */
  const pcMau = await doTam('Nạp mẫu');
  check(
    'PC 1440 · sheet Nạp mẫu nổi giữa màn, rộng 720px, thân vừa khít không phải cuộn',
    pcMau.thay === true &&
      pcMau.rong === 720 &&
      Math.abs(pcMau.leTrai - pcMau.lePhai) <= 1 &&
      pcMau.leDuoi > 0 &&
      pcMau.cuon <= 1,
    pcMau.thay !== true
      ? String(pcMau.vi)
      : `rộng ${String(pcMau.rong)}px · lề ${String(pcMau.leTrai)}/${String(pcMau.lePhai)} · đáy ${String(pcMau.leDuoi)}px · thân lố ${String(pcMau.cuon)}px`,
  );

  /*
   * Sheet chọn mã là tấm DUY NHẤT vừa không có hàng nút vừa có thân cuộn, và đó là chỗ hai lỗi của
   * dạng nổi giữa lộ ra (đo 13/10/2026, cả hai có từ 22/09 mà phép đo `border-radius` ở phần Danh
   * mục không thấy, vì nó đọc con số khai chứ không đọc cái vẽ ra):
   *
   *   1. Thanh cuộn của thân là một hình chữ nhật đè lên góc dưới phải — góc khai 16px mà trên màn
   *      thì vuông. Chữa bằng `overflow: hidden` trên tấm, để nó cắt con theo mép bo.
   *   2. `<dialog>` mang `overflow: hidden` nên cắt luôn bóng đổ của tấm bên trong, còn lại một
   *      mảng vuông sẫm sau bốn góc. Chữa bằng `overflow: visible` trên `<dialog>` dạng nổi giữa.
   *
   * Cả hai đo bằng `getComputedStyle` trên ĐÚNG phần tử đang mở, tức kết quả của cả tầng luật chứ
   * không phải một dòng khai. Đừng đổi sang `elementFromPoint` sát góc cho "thật" hơn: đã thử, và
   * Chrome dò điểm KHÔNG tính mép bo của phần tử cha — nó vẫn trả về thân tấm trong khi ảnh chụp
   * phóng 4 lần cho thấy góc đã tròn. Một phép đo đỏ trên màn đúng thì tệ hơn không đo.
   *
   * Danh sách mã lấy từ cache 24 giờ gieo sẵn — script không có mạng tới Finbox, và cache còn hạn
   * thì sheet không gọi mạng. Vào bằng lối rẽ trong sheet Nạp mẫu, đúng đường người dùng đi.
   */
  await evaluate(`localStorage.setItem('ffb.tickers.v1', JSON.stringify({
    fetchedAt: Date.now(),
    items: Array.from({ length: 24 }, (_, i) => ({
      code: 'M' + String(i + 10),
      name: 'Công ty Cổ phần Mẫu số ' + String(i + 10),
    })),
  })), true`);

  const pcChonMa = await evaluate(`(async () => {
    const cho = (ms) => new Promise((d) => setTimeout(d, ms));
    const moMau = [...document.querySelectorAll('button')]
      .filter((b) => b.closest('dialog') === null)
      .find((b) => /Nạp mẫu/.test(b.textContent ?? ''));
    if (moMau === undefined) return { thay: false, vi: 'không thấy nút Nạp mẫu' };
    moMau.click();

    let re = undefined;
    for (let i = 0; i < 40 && re === undefined; i += 1) {
      re = [...document.querySelectorAll('dialog[open] button')].find((b) => /mã khác/.test(b.textContent ?? ''));
      if (re === undefined) await cho(50);
    }
    if (re === undefined) return { thay: false, vi: 'sheet Nạp mẫu không có lối sang kho mã lớn' };
    re.click();

    let hop = null;
    for (let i = 0; i < 80 && hop === null; i += 1) {
      hop = [...document.querySelectorAll('dialog[open]')].find((d) => d.querySelectorAll('li').length > 0 && d.querySelector('input[type="search"]') !== null) ?? null;
      if (hop === null) await cho(50);
    }
    if (hop === null) return { thay: false, vi: 'sheet chọn mã không mở hoặc không có dòng nào' };
    await cho(150);

    const k = hop.getBoundingClientRect();
    const tam = hop.querySelector('[class*="panel"]');
    const than = hop.querySelector('[class*="body"]');
    const kieuTam = getComputedStyle(tam);
    const ket = {
      thay: true,
      rong: Math.round(k.width),
      cao: Math.round(k.height),
      leTrai: Math.round(k.left),
      lePhai: Math.round(window.innerWidth - k.right),
      leDuoi: Math.round(window.innerHeight - k.bottom),
      thanCuon: than.scrollHeight > than.clientHeight + 1,
      catCon: kieuTam.overflowX + '/' + kieuTam.overflowY,
      gocDuoiPhai: Math.round(parseFloat(kieuTam.borderBottomRightRadius)),
      catBong: getComputedStyle(hop).overflow,
      bong: kieuTam.boxShadow !== 'none',
    };

    const lui = [...hop.querySelectorAll('button')].find((b) => /Đóng|Quay lại/.test(b.textContent ?? ''));
    if (lui !== undefined) lui.click();
    await cho(200);
    // Lùi là về lại sheet Nạp mẫu — đóng nốt để phép đo sau thấy màn trống.
    const con = document.querySelector('dialog[open]');
    const dong = con === null ? undefined : [...con.querySelectorAll('button')].find((b) => /Đóng/.test(b.textContent ?? ''));
    if (dong !== undefined) dong.click();
    for (let i = 0; i < 40 && document.querySelector('dialog[open]') !== null; i += 1) await cho(50);
    return ket;
  })()`);
  await evaluate(`localStorage.removeItem('ffb.tickers.v1'), true`);

  check(
    'PC 1440 · sheet chọn mã ở màn chi tiết nổi giữa màn, 720 × 600, đúng dáng của nó ở Danh mục',
    pcChonMa.thay === true &&
      pcChonMa.rong === 720 &&
      pcChonMa.cao === 600 &&
      Math.abs(pcChonMa.leTrai - pcChonMa.lePhai) <= 1 &&
      pcChonMa.leDuoi > 0,
    pcChonMa.thay !== true
      ? String(pcChonMa.vi)
      : `${String(pcChonMa.rong)} × ${String(pcChonMa.cao)}px · lề ${String(pcChonMa.leTrai)}/${String(pcChonMa.lePhai)} · đáy ${String(pcChonMa.leDuoi)}px`,
  );
  check(
    'PC 1440 · tấm có thân cuộn cắt con theo mép bo (thanh cuộn không đè góc), và bóng đổ không bị cắt',
    pcChonMa.thay === true &&
      pcChonMa.thanCuon === true &&
      pcChonMa.catCon === 'hidden/hidden' &&
      pcChonMa.gocDuoiPhai >= 8 &&
      pcChonMa.catBong === 'visible' &&
      pcChonMa.bong === true,
    pcChonMa.thay !== true
      ? String(pcChonMa.vi)
      : `thân cuộn: ${String(pcChonMa.thanCuon)} · overflow của tấm: ${String(pcChonMa.catCon)} · góc dưới phải ${String(pcChonMa.gocDuoiPhai)}px · overflow của dialog: ${String(pcChonMa.catBong)} · có bóng: ${String(pcChonMa.bong)}`,
  );

  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 780,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await open('/cong-thuc/pe/');

  const dtXuat = await doTam('Tải về');
  check(
    'Điện thoại 360 · sheet Tải về VẪN dán đáy: rộng hết màn, hai góc dưới vuông, còn vạch kéo',
    dtXuat.thay === true &&
      dtXuat.leDuoi === 0 &&
      dtXuat.rong === dtXuat.manRong &&
      dtXuat.goc[0] >= 8 &&
      dtXuat.goc[1] >= 8 &&
      dtXuat.goc[2] === 0 &&
      dtXuat.goc[3] === 0 &&
      dtXuat.vachHien === true,
    dtXuat.thay !== true
      ? String(dtXuat.vi)
      : `rộng ${String(dtXuat.rong)}/${String(dtXuat.manRong)}px · đáy ${String(dtXuat.leDuoi)}px · góc ${dtXuat.goc.join('/')}px · vạch kéo hiện: ${String(dtXuat.vachHien)}`,
  );

  /*
   * ── Vào lại công thức thì về mặc định; F5 giữa chừng thì giữ số (13/10/2026) ────────────────
   *
   * Lỗi nghiêm trọng chủ dự án báo: *"vào lại hoặc search lại công thức đó thì lại đang lưu lại mã
   * cũ … phải reset lại công thức về mặc định"*. Phép chữa là một dấu lượt xem trong
   * `sessionStorage`: màn chi tiết so nó lúc gắn (`FormulaDetail`), còn lá `FormulaVisitTracker` ở
   * `AppShell` xoá nó khi người dùng sang màn khác. Hai nửa ấy nằm ở hai cây component và gặp nhau
   * qua một cú điều hướng THẬT của router — đúng thứ jsdom không chạy, nên các ca vitest phải giả
   * nửa thứ hai bằng tay. Chỉ ở đây hai nửa mới chạy cùng nhau.
   *
   * Đo bằng số TỰ GÕ chứ không bằng một mã: gõ số không cần mạng, mà nó đi qua đúng cửa gác ấy
   * (bản nháp là một trong ba kho bị xoá, cùng một hàm với kho mã).
   *
   * Cờ `__ffbCungTrang` chứng minh hai cú chuyển màn là điều hướng trong ứng dụng: tải lại cả trang
   * thì `window` mới và cờ mất. Thiếu nó, một `<a>` vô tình tải lại trang vẫn cho ra đúng kết quả
   * và phép đo xanh mà không đo được thứ nó sinh ra để đo.
   */
  const oGia = `document.querySelectorAll('input[inputmode="decimal"]')[0]`;
  /** Gõ đè một con số vào ô nhập đầu tiên của màn rồi rời ô — bằng bàn phím thật của Chrome. */
  const goVaoOGia = async (so) => {
    await evaluate(`${oGia}.focus(), true`);
    /*
     * Vào ô là ô dựng lại — '92.000' thành '92000' — và React gán lại `value`, việc ấy xoá vùng
     * chọn. Chọn hết trước lượt dựng ấy thì chữ gõ vào bị NỐI vào sau số cũ ('9200077777', rồi bị
     * kẹp về trần của ô) chứ không thay nó; bản đầu của phép đo này dính đúng thế và vẫn xanh. Nên
     * chờ tới khi dấu ngăn nghìn biến mất, rồi mới chọn và gõ, trong CÙNG một nhịp.
     */
    await waitFor(`!${oGia}.value.includes('.')`);
    await evaluate(`${oGia}.setSelectionRange(0, ${oGia}.value.length), true`);
    await send('Input.insertText', { text: so });
    await evaluate(`${oGia}.blur(), true`);
    // Quá nhịp gom 300 ms của lần ghi bản nháp.
    await new Promise((r) => setTimeout(r, 500));
  };
  /** Bộ số đang cất trong bản nháp của `pe`, hoặc `null` khi không có bản nháp nào của nó. */
  const banNhapPe = `(() => {
    try {
      const kho = JSON.parse(localStorage.getItem('ffb.draft.v1') ?? '[]');
      const muc = Array.isArray(kho) ? kho.find((m) => m?.id === 'pe') : undefined;
      return muc === undefined ? null : JSON.stringify(muc.inputs);
    } catch {
      return 'kho hỏng';
    }
  })()`;

  /*
   * Chrome không đầu coi tab này là KHÔNG có tiêu điểm, nên `el.focus()` đổi `activeElement` mà
   * không bắn sự kiện `focus` — `onFocus` của ô không chạy và ô không chuyển sang dạng đang sửa.
   * Bật giả lập tiêu điểm cho riêng cụm này rồi tắt lại ngay sau, để các cụm khác vẫn chạy trong
   * đúng điều kiện chúng được viết ra.
   */
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await evaluate(`localStorage.removeItem('ffb.draft.v1'), sessionStorage.clear(), true`);
  await open('/cong-thuc/pe/');
  const giaMacDinh = await evaluate(`${oGia}?.value ?? null`);
  await goVaoOGia('77777');
  const giaDaGo = await evaluate(`${oGia}.value`);
  // Có bản nháp thật thì phép đo "bản nháp bị xoá" phía dưới mới đo được gì.
  const banNhapTruoc = await evaluate(banNhapPe);

  const vaoLai = await evaluate(`(async () => {
    const cho = async (dieuKien) => {
      for (let i = 0; i < 80 && !dieuKien(); i += 1) await new Promise((d) => setTimeout(d, 100));
      return dieuKien();
    };
    window.__ffbCungTrang = true;

    const veDanhSach = document.querySelector('a[href="/cong-thuc/"]');
    if (veDanhSach === null) return { loi: 'màn chi tiết không có link nào về /cong-thuc/' };
    veDanhSach.click();
    if (!(await cho(() => location.pathname === '/cong-thuc/'))) {
      return { loi: 'không sang được màn danh sách' };
    }
    // Cho effect của màn danh sách và của AppShell chạy xong rồi mới đọc dấu.
    await new Promise((d) => setTimeout(d, 400));
    const dauODanhSach = sessionStorage.getItem('ffb.visit.v1');

    const moLai = document.querySelector('a[href="/cong-thuc/pe/"]');
    if (moLai === null) return { loi: 'màn danh sách không có link tới /cong-thuc/pe/' };
    moLai.click();
    if (!(await cho(() => location.pathname === '/cong-thuc/pe/' &&
        document.querySelector('input[inputmode="decimal"]') !== null))) {
      return { loi: 'không mở lại được màn chi tiết' };
    }
    await new Promise((d) => setTimeout(d, 400));

    return {
      loi: null,
      cungTrang: window.__ffbCungTrang === true,
      dauODanhSach,
      gia: document.querySelectorAll('input[inputmode="decimal"]')[0].value,
      dau: sessionStorage.getItem('ffb.visit.v1'),
    };
  })()`);
  const banNhapSau = vaoLai.loi === null ? await evaluate(banNhapPe) : 'chưa đo';

  check(
    'gõ số ở P/E → về danh sách → mở lại P/E: ô về số mặc định, bản nháp bị xoá',
    vaoLai.loi === null &&
      giaMacDinh !== null &&
      giaDaGo === '77.777' &&
      String(banNhapTruoc).includes('77777') &&
      vaoLai.cungTrang === true &&
      vaoLai.dauODanhSach === null &&
      vaoLai.gia === giaMacDinh &&
      banNhapSau === null &&
      vaoLai.dau === 'pe',
    vaoLai.loi ??
      `mặc định ${String(giaMacDinh)} · đã gõ ${String(giaDaGo)} · mở lại ${String(vaoLai.gia)} · bản nháp trước ${String(banNhapTruoc)} · sau ${String(banNhapSau)} · điều hướng trong ứng dụng: ${String(vaoLai.cungTrang)} · dấu ở danh sách: ${String(vaoLai.dauODanhSach)} · dấu sau khi mở lại: ${String(vaoLai.dau)}`,
  );

  /*
   * Vế phải GIỮ của cùng luật ấy: tải lại trang giữa chừng là VẪN đang xem công thức đó. Thiếu phép
   * đo này thì "xoá hết mỗi lần gắn" cũng qua được phép đo trên, và lỗi cũ chủ dự án đã báo — rời
   * màn rồi quay lại là mất số — quay về mà không ai thấy.
   */
  await goVaoOGia('66666');
  const giaTruocF5 = await evaluate(`${oGia}.value`);
  await open('/cong-thuc/pe/');
  const giaSauF5 = await evaluate(`${oGia}?.value ?? null`);
  check(
    'gõ số ở P/E → tải lại trang: số vừa gõ còn nguyên',
    giaTruocF5 === '66.666' && giaSauF5 === giaTruocF5,
    `trước ${String(giaTruocF5)} · sau ${String(giaSauF5)} · mặc định ${String(giaMacDinh)}`,
  );
  // Trả kho về trống để cụm service worker ngay dưới không thừa hưởng một bản nháp.
  await evaluate(`localStorage.removeItem('ffb.draft.v1'), sessionStorage.clear(), true`);
  await send('Emulation.setFocusEmulationEnabled', { enabled: false });

  /*
   * ── Nhóm ô lặp: thêm đợt mua thì lưới ô vẫn mỗi đợt một hàng (13/10/2026) ────────────────────
   *
   * Chủ dự án chỉ vào ba đợt mua khai cứng của `gia-von-trung-binh-dca` và hỏi người muốn nhập bốn,
   * năm, sáu đợt thì làm sao, rồi dặn: *"vì giao diện có thay đổi nên bạn cần thêm chức năng để
   * giao diện thay đổi tương ứng"*. Nút "Thêm đợt mua" thêm hai ô (tiền, giá) cho mỗi đợt.
   *
   * Thứ chỉ Chrome thật đo được là BỐ CỤC sau khi thêm. Lưới thường chia cột theo bề ngang (ba cột
   * ở 1024px), nên ô tiền và ô giá của cùng một đợt rơi sang hai hàng — với ba đợt còn dò được, tới
   * đợt năm thì không ai ghép nổi. Lớp `.fieldsRepeat` ghim số cột bằng số ô của một nhóm; nó phải
   * thắng cả `.fields` trong các `@media` lẫn `.fields.tileGrid` của thẻ gộp, mà cái sau chỉ thắng
   * được nhờ THỨ TỰ trong file. Đo ở ba khổ vì mỗi khổ một luật cột khác nhau đang bị đè: 360 (lưới
   * auto-fit), 1024 (ba cột) và 1440 (thẻ gộp).
   *
   * Bấm bằng `.click()` của DOM: nút là `<button>` thường, không có gì phụ thuộc con trỏ thật.
   */
  const DO_NHOM_LAP = `(() => {
    const oCua = (nhan) => {
      const label = [...document.querySelectorAll('label')].find((l) => l.textContent.trim().startsWith(nhan));
      const o = label ? document.getElementById(label.htmlFor) : null;
      return o ? o.getBoundingClientRect() : null;
    };
    const nut = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === '+ Thêm đợt mua');
    const hang = [];
    for (let n = 1; n <= 5; n += 1) {
      const tien = oCua('Tiền mua đợt ' + n);
      const gia = oCua('Giá mua đợt ' + n);
      if (!tien || !gia) return { loi: 'thiếu ô của đợt ' + n };
      hang.push({
        top: Math.round(tien.top),
        lech: Math.abs(Math.round(tien.top) - Math.round(gia.top)),
        tienTrai: tien.left < gia.left,
        day: Math.round(Math.max(tien.bottom, gia.bottom)),
        phai: Math.round(gia.right),
        rongTien: Math.round(tien.width),
        rongGia: Math.round(gia.width),
      });
    }
    const n = nut ? nut.getBoundingClientRect() : null;
    /* Cụm 'tên + con số' của thẻ gộp so với giữa LƯỚI Ô, không tính hàng nút thêm bớt bên dưới. */
    const khoi = document.querySelector('section[aria-labelledby="khoi-ket-qua"]');
    const cum = khoi ? [...khoi.children].find((e) => e.tagName !== 'H2') : null;
    const luoi = document.querySelector('section[aria-labelledby="khoi-so-lieu"] [class*="fields"]');
    const c = cum ? cum.getBoundingClientRect() : null;
    const l = luoi ? luoi.getBoundingClientRect() : null;
    return {
      hang,
      lechGiua: c && l ? Math.round((c.top + c.height / 2 - (l.top + l.height / 2)) * 10) / 10 : null,
      nut: n ? { top: Math.round(n.top), left: Math.round(n.left), right: Math.round(n.right) } : null,
      luoiPhai: l ? Math.round(l.right) : null,
      rongMan: window.innerWidth,
      tranNgang: document.documentElement.scrollWidth > window.innerWidth + 1,
      ketQua: document.querySelector('[data-testid="result-text"]')?.textContent ?? null,
    };
  })()`;

  for (const kho of [
    { width: 360, height: 780, mobile: true },
    { width: 1024, height: 900, mobile: false },
    { width: 1440, height: 900, mobile: false },
  ]) {
    await send('Emulation.setDeviceMetricsOverride', { ...kho, deviceScaleFactor: 1 });
    await evaluate(`localStorage.removeItem('ffb.draft.v1'), sessionStorage.clear(), true`);
    await open('/cong-thuc/gia-von-trung-binh-dca/');

    const ketQuaTruoc = await evaluate(
      `document.querySelector('[data-testid="result-text"]')?.textContent ?? null`,
    );
    for (let lan = 0; lan < 2; lan += 1) {
      await evaluate(
        `[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === '+ Thêm đợt mua')?.click(), true`,
      );
    }
    await waitFor(
      `[...document.querySelectorAll('label')].some((l) => l.textContent.trim().startsWith('Giá mua đợt 5'))`,
    );

    const nhom = await evaluate(DO_NHOM_LAP);
    const hang = nhom.hang ?? [];
    const cungHang = hang.every((h) => h.lech <= 1 && h.tienTrai);
    const xuongDan = hang.every((h, i) => i === 0 || h.top > (hang[i - 1]?.day ?? 0) - 1);
    const trongMan = hang.every((h) => h.phai <= nhom.rongMan);
    const cuoi = hang[hang.length - 1];
    /*
     * Hàng nút căn PHẢI, mọi khổ (chủ dự án, 14/10/2026: "chuyển chỗ khoanh đỏ sang bên phải … màn
     * web lẫn mobile"), và "+ Thêm" đứng ở mép phải — thẳng mép phải lưới ô.
     */
    const nutDuoiOCuoi =
      nhom.nut !== null &&
      cuoi !== undefined &&
      nhom.nut.top >= cuoi.day - 1 &&
      nhom.nut.left >= 0 &&
      nhom.nut.right <= nhom.rongMan &&
      nhom.luoiPhai !== null &&
      Math.abs(nhom.nut.right - nhom.luoiPhai) <= 1;

    check(
      `${String(kho.width)} · giá vốn DCA thêm hai đợt: mỗi đợt một hàng (tiền trái, giá phải), nút Thêm ngay dưới đợt cuối và thẳng mép phải lưới ô, trang không tràn ngang, kết quả chưa đổi`,
      nhom.loi === undefined &&
        hang.length === 5 &&
        cungHang &&
        xuongDan &&
        trongMan &&
        nutDuoiOCuoi &&
        nhom.tranNgang === false &&
        nhom.ketQua === ketQuaTruoc,
      nhom.loi ??
        `lệch trong hàng ${hang.map((h) => String(h.lech)).join('/')}px · đỉnh các hàng ${hang.map((h) => String(h.top)).join('/')} · ô rộng ${String(cuoi?.rongTien)}/${String(cuoi?.rongGia)}px · nút ở ${String(nhom.nut?.top)} (đợt cuối kết ở ${String(cuoi?.day)}), mép phải ${String(nhom.nut?.right)} / lưới ${String(nhom.luoiPhai)} · tràn ngang: ${String(nhom.tranNgang)} · kết quả ${String(ketQuaTruoc)} → ${String(nhom.ketQua)}`,
    );

    /*
     * Thẻ gộp có HÀNG NÚT dưới lưới ô: con số bên trái vẫn phải đứng giữa lưới ô, không phải giữa
     * "lưới ô + hàng nút" (13/10/2026). Phép căn giữa của thẻ gộp chừa hàng nút "?" ở trên bằng
     * token; còn hàng nút này thì chừa bằng con số 36px chép từ cỡ nút `size="sm"`, vì không có
     * token nào cho nó. Phép đo này là thứ giữ hai chỗ ấy không trôi khỏi nhau: quên phần chừa thì
     * cụm tụt xuống 20px, đúng nửa chiều cao hàng nút cộng khe. Năm đợt là số lẻ, nên giữa lưới
     * trùng giữa hàng thứ ba và mắt dò được ngay. Chỉ đo ở 1440: dưới 1280 không có thẻ gộp.
     */
    if (kho.width === 1440) {
      check(
        '1440 · giá vốn DCA năm đợt: con số kết quả đứng giữa lưới ô, không bị hàng nút Thêm kéo lệch',
        nhom.lechGiua !== null && Math.abs(nhom.lechGiua) <= 1,
        `lệch dọc ${String(nhom.lechGiua)}px so với giữa lưới ô`,
      );
    }
  }
  // Trả kho về trống: bản nháp năm đợt không được chảy sang cụm service worker ngay dưới.
  await evaluate(`localStorage.removeItem('ffb.draft.v1'), sessionStorage.clear(), true`);

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
