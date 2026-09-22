/**
 * Đo ĐỘ TRỄ KHI GÕ trên bản build tĩnh, bằng Chrome thật qua CDP — thước đo A/B của đợt tối ưu
 * hiệu năng (21/09/2026).
 *
 * ## Vì sao cần một script nữa
 *
 * `size-report.mjs` đo BYTE, `chrome-check.mjs` đo HÌNH HỌC và hành vi — cố ý không có phép kiểm
 * nào theo mili giây, vì thời gian phụ thuộc máy nên không làm cửa gác được. Nhưng tối ưu mà không
 * đo thì chỉ là đoán: repo đã một lần đo được "cắt 36% chunk chỉ đổi 16% độ trễ", và đang treo một
 * mục "`gia-von-trung-binh-dca` chặn ~140 ms khi gõ liền 14 phím, chưa truy ra chỗ tốn".
 *
 * Script này KHÔNG phải cửa gác: nó không đỏ, không `exit(1)`. Nó in ra số để so TRƯỚC và SAU một
 * thay đổi, trên cùng một máy, trong cùng một buổi.
 *
 * ## Cách đo
 *
 * Với mỗi trang: mở, chờ hydrate, rồi gõ 14 phím số vào ô nhập đầu tiên của khối Số liệu, cách nhau
 * 15 ms (đúng nhịp một người gõ nhanh, và đúng giao thức mà `TASK.md` đã dùng). Trong lúc ấy:
 *
 * - `PerformanceObserver({ type: 'longtask' })` gom mọi tác vụ dài trên luồng chính;
 * - mỗi sự kiện `input` hẹn một `requestAnimationFrame` để biết từ lúc trình duyệt nhận phím tới
 *   lúc sắp vẽ lại mất bao lâu — đó là con số người dùng CẢM được.
 *
 * Hai con số chính: **tổng thời gian chặn** (phần vượt 50 ms của mỗi tác vụ dài, đúng định nghĩa
 * Total Blocking Time) và **độ trễ mỗi phím p50**. Chạy 3 lượt, lấy trung vị, vì lượt đầu luôn đắt
 * hơn (JIT chưa ấm, chunk nạp trễ chưa về).
 *
 * ## Điều kiện để số có nghĩa
 *
 * - Chỉ đo trên `out/`, tức bản `npm run build`. **Không bao giờ đo trên `next dev`**: bản dev tốn
 *   596 ms trong `jsxDEV` so với 26 ms của bản thật, nên mọi kết luận rút từ đó đều sai.
 * - CPU bị ghì 4× (`Emulation.setCPUThrottlingRate`), khổ 360×780 — cùng điều kiện mà các lần đo
 *   trước trong `TASK.md` đã dùng, để số hôm nay so được với số hôm trước.
 * - Máy chủ tĩnh và Chrome đều là của riêng script: cổng do hệ điều hành cấp, hồ sơ Chrome ở thư
 *   mục tạm, và chỉ tắt đúng tiến trình mình bật. Không đụng cổng 3000 của `next dev`, không đụng
 *   4173 của `npm run preview`, không tìm-diệt Chrome theo tên.
 *
 * ## Chạy
 *
 *   node scripts/perf-probe.mjs
 *   node scripts/perf-probe.mjs --pages ty-so-sharpe,wacc --runs 5 --keys 20
 *   node scripts/perf-probe.mjs --json > truoc.json   # rồi so với sau.json
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve, sep } from 'node:path';

const ROOT = 'out';

/** Ba trang mốc, mỗi trang đại diện một hình dạng chi phí khác nhau. */
const DEFAULT_PAGES = [
  // Không có biểu đồ (`chartType: 'none'`) — chỗ duy nhất đo được chi phí gõ phím KHÔNG lẫn biểu đồ.
  'gia-von-trung-binh-dca',
  // Nặng nhất sản phẩm: thân riêng WF-14 dựng lịch trả nợ tới 240 kỳ, nằm TRÊN các khối hoãn vẽ.
  'lich-tra-no',
  // Biểu đồ đắt nhất đã đo (`buildChartModel` 15,6 ms) — đường đã có `useDeferredValue` bảo vệ.
  'wacc',
];

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

const PAGES = String(arg('pages', DEFAULT_PAGES.join(',')))
  .split(',')
  .filter(Boolean);
const RUNS = Number(arg('runs', '3'));
const KEYS = Number(arg('keys', '14'));
const GAP_MS = Number(arg('gap', '15'));
const CPU_RATE = Number(arg('cpu', '4'));
const asJson = process.argv.includes('--json');

if (!existsSync(ROOT)) {
  console.error(`Không thấy thư mục ${ROOT}/ — chạy \`npm run build\` trước.`);
  process.exit(1);
}

/* ── Máy chủ tĩnh của riêng script ───────────────────────────────────────── */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const BASE = resolve(ROOT);

const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const rel = path.endsWith('/') ? `${path}index.html` : path;
  const file = resolve(join(BASE, normalize(rel)));
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

/* ── Chrome của riêng script ─────────────────────────────────────────────── */

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

const profile = mkdtempSync(join(tmpdir(), 'ffb-perf-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

/** Chỉ tắt đúng tiến trình mình bật — Chrome của người dùng đang chạy. */
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
ws.onmessage = (raw) => {
  const msg = JSON.parse(raw.data);
  if (msg.id !== undefined) {
    pending.get(msg.id)?.(msg);
    pending.delete(msg.id);
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
    throw new Error(
      String(res.result.exceptionDetails.exception?.description ?? 'lỗi trong trang'),
    );
  }
  return res.result?.result?.value;
}

async function waitFor(expression, timeoutMs = 10000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    if ((await evaluate(`Boolean(${expression})`)) === true) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Chờ quá ${String(timeoutMs)}ms: ${expression}`);
}

/* ── Phép đo ─────────────────────────────────────────────────────────────── */

/**
 * Cài bộ đếm vào trang rồi đặt con trỏ vào ô nhập đầu tiên của khối Số liệu.
 *
 * Bỏ qua `input[type=range]`: thanh trượt là một đường khác (một sự kiện mỗi khung hình khi kéo),
 * đo riêng thì mới tách được hai chi phí.
 */
const CAI_DAT = `(() => {
  const o = document.querySelector('main') ?? document.body;
  const el = [...o.querySelectorAll('input')].find((i) => i.type !== 'range' && !i.disabled);
  if (!el) return null;
  const p = { key: [], longtask: [], t0: 0 };
  window.__ffbPerf = p;
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) p.longtask.push({ start: e.startTime, dur: e.duration });
  }).observe({ type: 'longtask', buffered: false });
  el.addEventListener('input', () => {
    const t = performance.now();
    requestAnimationFrame(() => { p.key.push(performance.now() - t); });
  });
  el.focus();
  el.setSelectionRange(el.value.length, el.value.length);
  p.t0 = performance.now();
  return { ok: true, name: el.getAttribute('id') ?? el.getAttribute('name') ?? '?' };
})()`;

const DOC_KET_QUA = `(() => {
  const p = window.__ffbPerf;
  const sau = p.longtask.filter((l) => l.start >= p.t0);
  return {
    key: p.key,
    tongChan: sau.reduce((s, l) => s + Math.max(0, l.dur - 50), 0),
    tongTacVuDai: sau.reduce((s, l) => s + l.dur, 0),
    dai: sau.length === 0 ? 0 : Math.max(...sau.map((l) => l.dur)),
    so: sau.length,
  };
})()`;

async function goMotPhim(ch) {
  const code = `Digit${ch}`;
  const key = ch;
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    text: ch,
    unmodifiedText: ch,
    key,
    code,
    windowsVirtualKeyCode: 48 + Number(ch),
    nativeVirtualKeyCode: 48 + Number(ch),
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
    code,
    windowsVirtualKeyCode: 48 + Number(ch),
    nativeVirtualKeyCode: 48 + Number(ch),
  });
}

function trungVi(xs) {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? ((s[mid - 1] ?? 0) + (s[mid] ?? 0)) / 2 : (s[mid] ?? 0);
}

/**
 * Đồng hồ của chính Chrome. Cần nó vì ngưỡng "tác vụ dài" là 50 ms: một phím gõ tốn 10–30 ms thì
 * `PerformanceObserver` không thấy gì cả, mà 14 phím như thế vẫn là hơn 300 ms luồng chính bị giữ.
 *
 * `TaskDuration` là tổng thời gian mọi tác vụ, không riêng tác vụ dài; `LayoutCount` đếm số lần
 * dàn trang — đúng thứ để bắt một lần đọc `scrollY` ép trình duyệt tính lại layout giữa chừng.
 */
async function docDongHo() {
  const { result } = await send('Performance.getMetrics');
  const m = Object.fromEntries((result?.metrics ?? []).map((x) => [x.name, x.value]));
  return {
    task: (m.TaskDuration ?? 0) * 1000,
    script: (m.ScriptDuration ?? 0) * 1000,
    layout: (m.LayoutDuration ?? 0) * 1000,
    style: (m.RecalcStyleDuration ?? 0) * 1000,
    soLanLayout: m.LayoutCount ?? 0,
    soLanStyle: m.RecalcStyleCount ?? 0,
  };
}

async function doMotLuot(id) {
  await send('Page.navigate', { url: `${ORIGIN}/cong-thuc/${id}/` });
  await waitFor("document.readyState === 'complete'");
  // Chờ hydrate và chunk nạp trễ (biểu đồ) về hẳn, để lượt gõ không đo lẫn chi phí khởi động.
  await new Promise((r) => setTimeout(r, 2500));

  const dat = await evaluate(CAI_DAT);
  if (dat === null) throw new Error(`${id}: không thấy ô nhập nào`);

  const truoc = await docDongHo();
  for (let i = 0; i < KEYS; i += 1) {
    await goMotPhim(String((i % 9) + 1));
    await new Promise((r) => setTimeout(r, GAP_MS));
  }
  // Chờ phần hoãn (useDeferredValue của biểu đồ) chạy nốt rồi mới chốt sổ.
  await new Promise((r) => setTimeout(r, 1500));
  const sau = await docDongHo();

  const kq = await evaluate(DOC_KET_QUA);
  return {
    task: Math.round(sau.task - truoc.task),
    script: Math.round(sau.script - truoc.script),
    layout: Math.round(sau.layout - truoc.layout),
    style: Math.round(sau.style - truoc.style),
    soLanLayout: sau.soLanLayout - truoc.soLanLayout,
    tongChan: Math.round(kq.tongChan),
    daiNhat: Math.round(kq.dai),
    p50: Math.round(trungVi(kq.key) * 10) / 10,
    soPhimNhan: kq.key.length,
  };
}

/* ── Chạy ────────────────────────────────────────────────────────────────── */

const ketQua = [];

try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Performance.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 780,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Emulation.setCPUThrottlingRate', { rate: CPU_RATE });

  for (const id of PAGES) {
    const luot = [];
    for (let r = 0; r < RUNS; r += 1) luot.push(await doMotLuot(id));
    ketQua.push({
      trang: id,
      task: trungVi(luot.map((l) => l.task)),
      script: trungVi(luot.map((l) => l.script)),
      layout: trungVi(luot.map((l) => l.layout)),
      style: trungVi(luot.map((l) => l.style)),
      soLanLayout: trungVi(luot.map((l) => l.soLanLayout)),
      tongChan: trungVi(luot.map((l) => l.tongChan)),
      daiNhat: trungVi(luot.map((l) => l.daiNhat)),
      p50: trungVi(luot.map((l) => l.p50)),
      soPhimNhan: luot[0]?.soPhimNhan ?? 0,
      luot,
    });
  }
} finally {
  try {
    await send('Browser.close');
  } catch {
    // Chrome đã chết trước đó — bước dưới lo nốt.
  }
  killOwnChrome();
  server.close();
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    // Windows còn giữ khoá file vài trăm ms sau khi Chrome tắt; thư mục tạm tự dọn sau.
  }
}

if (asJson) {
  console.log(
    JSON.stringify({ keys: KEYS, gapMs: GAP_MS, cpu: CPU_RATE, runs: RUNS, ketQua }, null, 2),
  );
} else {
  console.log(
    `\n=== Gõ ${String(KEYS)} phím, cách ${String(GAP_MS)} ms · CPU ghì ${String(CPU_RATE)}× · 360×780 · trung vị ${String(RUNS)} lượt ===\n`,
  );
  console.log(
    'Trang                         Luồng chính  trong đó script  layout  style  Số lần dàn trang  Độ trễ/phím p50',
  );
  for (const r of ketQua) {
    console.log(
      `${r.trang.padEnd(28)}  ${`${String(r.task)} ms`.padStart(11)}  ${`${String(r.script)} ms`.padStart(15)}  ${`${String(r.layout)} ms`.padStart(6)}  ${`${String(r.style)} ms`.padStart(5)}  ${String(r.soLanLayout).padStart(16)}  ${`${String(r.p50)} ms`.padStart(15)}`,
    );
  }
  console.log(
    '\nSố chỉ để so TRƯỚC/SAU trên cùng một máy — không phải cửa gác, không dùng làm ngưỡng.',
  );
}
