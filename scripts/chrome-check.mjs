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

const server = createServer((req, res) => {
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
  await evaluate(
    `(() => { const b = [...document.querySelectorAll('button')].find((x) => /Xuất/.test(x.textContent ?? '')); if (!b) return false; b.click(); return true; })()`,
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
  const buoc = await evaluate(`(() => {
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
    buoc !== null && buoc.tran === false,
    buoc === null ? 'không đọc được khối' : `trang rộng ${String(buoc.rong)}px`,
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

  /* ── 4. Trang chủ cá nhân hoá — lưới ghim sắp lại theo lịch sử trên máy ──── */

  /*
   * Chỗ DUY NHẤT trả lời được "có lệch hydration thật không".
   *
   * Lưới 18 ô do server dựng, rồi một client component sắp lại theo `ffb.usage.v1`. Lượt render
   * đầu ở máy khách phải trùng khít HTML tĩnh, nếu không React vứt cả cây đi — và cảnh báo của
   * nó chui ra đúng cái console mà phép kiểm thứ ba dưới đây đang soi. jsdom không thay được:
   * ở đó không có lượt hydrate thật nào.
   */
  await evaluate(
    `localStorage.setItem('ffb.usage.v1', JSON.stringify([{ id: 'xirr', count: 9, at: Date.now() }])), true`,
  );
  await open('/');

  const oDau = await evaluate(
    `document.querySelector('#home-featured')?.closest('section')?.querySelector('li a')?.getAttribute('href') ?? null`,
  );
  check(
    'lịch sử đưa công thức hay mở lên ô đầu của khối',
    oDau === '/cong-thuc/xirr/',
    `ô đầu trỏ ${String(oDau)}`,
  );

  const soGhim = (
    readFileSync('src/core/formulas/summaries.generated.ts', 'utf8').match(/isFeatured: true/g) ??
    []
  ).length;
  const soO = await evaluate(
    `document.querySelector('#home-featured')?.closest('section')?.querySelectorAll('li').length ?? 0`,
  );
  check(
    'khối vẫn đủ số ô sau khi sắp lại — không co giãn theo lịch sử',
    soGhim > 0 && soO === soGhim,
    `${String(soO)} ô, cần ${String(soGhim)}`,
  );

  check(
    'trang chủ đã cá nhân hoá không kêu lỗi hay cảnh báo nào ra console — kể cả lệch hydration',
    noise.length === 0,
    noise.slice(0, 2).join(' | '),
  );

  // Dọn ngay: cụm EN dưới đây phải thấy đúng thứ tự ghim như một máy sạch.
  await evaluate(`localStorage.removeItem('ffb.usage.v1'), true`);

  /* ── 5. Luồng EN sau hydrate — lá <T> trong children server-render (đợt 8) ─ */

  /*
   * Rủi ro riêng của kiến trúc i18n: ba khối trang chủ là server children truyền vào client
   * `HomeSearchPanel` — bản thân chúng KHÔNG render lại khi context đổi. Chữ trong đó đổi được
   * chỉ vì từng lá `<T>` tự subscribe. jsdom kiểm được từng lá một; còn "cả trang thật, hydrate
   * từ HTML tĩnh tiếng Việt, đổi sang EN mà console sạch" thì chỉ Chrome thật trả lời được —
   * cảnh báo lệch hydration của React chui ra đúng ở console mà phép kiểm cuối đang soi.
   */
  await evaluate(`localStorage.setItem('ffb.prefs.v1', JSON.stringify({ locale: 'en' })), true`);
  await open('/');

  let enServer = false;
  try {
    await waitFor(
      `[...document.querySelectorAll('h2')].some((h) => (h.textContent ?? '').includes('Browse by group'))`,
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
    'trang chủ ở chế độ EN không kêu lỗi hay cảnh báo nào ra console — kể cả lệch hydration',
    noise.length === 0,
    noise.slice(0, 2).join(' | '),
  );

  /* ── 6. Tên nhóm không bị cắt ở khổ 360px (cả hai chế độ) ────────────────── */

  /**
   * Đọc 12 ô "Duyệt theo nhóm": tên có bị cắt không, và badge bên phải đang chiếm bao nhiêu.
   *
   * Đo `scrollWidth > clientWidth` chứ không so chuỗi: `.name` cắt bằng `text-overflow: ellipsis`,
   * mà `textContent` vẫn trả về tên ĐẦY ĐỦ dù trên màn chỉ còn "Tà…". Không phép kiểm nào của
   * vitest thấy được chuyện này — jsdom không tính bố cục, nên `scrollWidth` ở đó luôn bằng 0.
   *
   * Cuộn tới khối trước khi đo, cùng lý do như `docThacNuoc()`.
   */
  function doONhom() {
    return evaluate(`(async () => {
    const khoi = document.querySelector('#home-browse')?.closest('section');
    if (!khoi) return [];
    khoi.scrollIntoView({ block: 'center' });
    await new Promise((d) => requestAnimationFrame(() => requestAnimationFrame(d)));
    return [...khoi.querySelectorAll('li a')].map((a) => {
      const ten = a.children[1];
      const badge = [...a.children].slice(2).find((s) => getComputedStyle(s).display !== 'none');
      return {
        ten: ten?.textContent ?? '',
        cut: ten ? ten.scrollWidth > ten.clientWidth + 1 : false,
        rong: ten ? Math.round(ten.clientWidth) : 0,
        can: ten ? Math.round(ten.scrollWidth) : 0,
        badge: badge?.textContent ?? '',
      };
    });
  })()`);
  }

  /*
   * Ô 'Tài chính DN' là ô duy nhất mà chế độ Cơ bản giấu sạch công thức, nên badge bên phải của nó
   * là NHÃN CHỮ ("chỉ ở Nâng cao") chứ không phải một con số hai chữ số. Đo được: nhãn chiếm 82px
   * trong khi tên và badge chỉ có 102px để chia nhau, mà `.count` khai `flex-shrink: 0` — tên bị
   * bóp còn 20px và hiện ra "Tà…". Đây là chỗ chặn, và nó chỉ chặn được từ Chrome thật.
   */
  await evaluate(`localStorage.removeItem('ffb.prefs.v1'), true`);
  await open('/');
  const oCoBan = await doONhom();
  const cutCoBan = oCoBan.filter((o) => o.cut);

  check(
    'chế độ Cơ bản: không tên nhóm nào bị cắt ở khổ 360px — kể cả ô mang nhãn chữ',
    oCoBan.length === 12 && cutCoBan.length === 0,
    // Không in "còn dư bao nhiêu px": chữ vừa khung thì `scrollWidth` LUÔN bằng `clientWidth`,
    // nên hiệu số đó là 0 ở mọi ô lành lặn và đọc ra như thể ô nào cũng sát nút.
    cutCoBan.length > 0
      ? cutCoBan.map((o) => `"${o.ten}" chỉ được ${String(o.rong)}/${String(o.can)}px`).join(' · ')
      : `${String(oCoBan.length)} ô, ô mang nhãn chữ là "${
          oCoBan.find((o) => !/^\d+$/.test(o.badge))?.ten ?? '—'
        }"`,
  );

  await evaluate(
    `localStorage.setItem('ffb.prefs.v1', JSON.stringify({ mode: 'advanced' })), true`,
  );
  await open('/');
  const oNangCao = await doONhom();
  const cutNangCao = oNangCao.filter((o) => o.cut);

  check(
    'chế độ Nâng cao: không tên nhóm nào bị cắt — badge quay về con số nên ô về lại một hàng',
    oNangCao.length === 12 && cutNangCao.length === 0,
    cutNangCao.length > 0
      ? cutNangCao.map((o) => `"${o.ten}" ${String(o.rong)}/${String(o.can)}px`).join(' · ')
      : `${String(oNangCao.length)} ô, badge dài nhất "${
          oNangCao.map((o) => o.badge).sort((a, b) => b.length - a.length)[0] ?? ''
        }"`,
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
    '/',
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
    const tab = [...document.querySelectorAll('button, [role="tab"]')]
      .find((el) => /Formulas|Công thức/.test(el.textContent ?? ''));
    tab?.click();
    await new Promise((d) => setTimeout(d, 300));
    return [...document.querySelectorAll('p')].map((p) => p.textContent ?? '');
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

  /* ── Hết phép kiểm ─────────────────────────────────────────────────────── */
} finally {
  await cleanup();
}

const failed = checks.filter((c) => !c.pass);
console.log(`\n=== ${String(checks.length - failed.length)}/${String(checks.length)} đạt ===`);
process.exit(failed.length > 0 ? 1 : 0);
