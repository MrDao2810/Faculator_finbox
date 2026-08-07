/**
 * Báo cáo dung lượng bản build tĩnh — chạy SAU `npm run build`.
 *
 * Vì sao cần một script riêng bên cạnh con số Next in ra lúc build:
 *
 * 1. Next chỉ nói về **JS**. Thứ người dùng thật sự tải còn có HTML và CSS — mà với
 *    `output: 'export'` thì HTML là bản dựng sẵn đầy đủ, không nhỏ chút nào (trang chi tiết
 *    công thức nặng gần 50 kB thô).
 * 2. Next nói "First Load JS shared by all" gộp chung, không cho biết TRANG NÀO tải những gì.
 *    Ở đây mỗi trang được đo bằng chính những file mà HTML của nó tham chiếu — đó mới đúng
 *    nghĩa "lượt truy cập đầu vào trang này tốn bao nhiêu".
 * 3. Chủ dự án còn phải biết cả thư mục `out/` nặng bao nhiêu để tính chỗ lưu trữ.
 *
 * Đo cả bản thô lẫn bản nén gzip: hosting tĩnh (Cloudflare Pages) luôn nén khi gửi đi, nên
 * gzip mới là thứ đi qua đường truyền. Dùng `node:zlib` có sẵn, không thêm dependency.
 */

import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = 'out';

/** Ngưỡng NFR-PER-04 cho một lượt tải đầu, tính bằng byte đã nén. */
const BUDGET = 200 * 1024;

/**
 * Cửa kiểm sớm.
 * Đặt dưới hẳn ngưỡng chứ không sát nút: chỉ mục nhẹ nạp ở MỌI trang, nên mỗi công thức thêm
 * vào đều đẩy con số này lên. Chạm cửa kiểm là lúc phải tách gói, không phải lúc đã vỡ ngưỡng.
 */
const CHECKPOINT = 170 * 1024;

const FORMULAS_TARGET = 107;

/**
 * Số công thức đang thật sự có trong Registry — ĐỌC từ chỉ mục đã sinh, không viết cứng.
 *
 * Trước đợt này chỗ này là hằng số `21`. Nó đúng đúng một lần rồi lặng lẽ sai: tới khi Registry
 * đủ 107 thì script vẫn chia cho 21 và in ra một dự báo "sẽ vượt ngưỡng khi đủ 107" — trong khi
 * đã đủ 107 và đang dưới ngưỡng. Một dự báo sai lại còn to tiếng hơn số đo thật.
 */
function countFormulas() {
  const src = readFileSync('src/core/formulas/summaries.generated.ts', 'utf8');
  return (src.match(/categoryId:/g) ?? []).length;
}

const FORMULAS_NOW = countFormulas();

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

let paths;
try {
  paths = walk(ROOT);
} catch {
  console.error(`Không đọc được thư mục ${ROOT}/ — chạy \`npm run build\` trước.`);
  process.exit(1);
}

/** Bảng tra: đường dẫn tương đối → cỡ thô và cỡ nén. Nén một lần, tra nhiều lần. */
const sizes = new Map();
for (const path of paths) {
  const key = relative(ROOT, path).replaceAll('\\', '/');
  sizes.set(key, { bytes: statSync(path).size, gzip: gzipSync(readFileSync(path)).length });
}

const all = [...sizes.entries()].map(([path, size]) => ({ path, ext: extname(path), ...size }));
const totalBytes = all.reduce((s, r) => s + r.bytes, 0);
const totalGzip = all.reduce((s, r) => s + r.gzip, 0);

/* ── 1. Toàn bộ thư mục xuất ─────────────────────────────────────────────── */

console.log(`\n=== Toàn bộ bản build tĩnh (${ROOT}/) ===`);
console.log(`${String(all.length)} file · ${kb(totalBytes)} thô · ${kb(totalGzip)} nén gzip\n`);

const GROUPS = [
  { name: 'JS', exts: ['.js', '.mjs'] },
  { name: 'HTML', exts: ['.html'] },
  { name: 'CSS', exts: ['.css'] },
  { name: 'Ảnh & biểu tượng', exts: ['.svg', '.png', '.ico', '.webp'] },
];

const claimed = new Set();
for (const group of GROUPS) {
  const rows = all.filter((r) => group.exts.includes(r.ext));
  for (const r of rows) claimed.add(r.path);
  if (rows.length === 0) continue;
  const bytes = rows.reduce((s, r) => s + r.bytes, 0);
  const gzip = rows.reduce((s, r) => s + r.gzip, 0);
  console.log(
    `  ${group.name.padEnd(18)} ${String(rows.length).padStart(3)} file · ` +
      `${kb(bytes).padStart(10)} thô · ${kb(gzip).padStart(10)} nén · ` +
      `${((bytes / totalBytes) * 100).toFixed(0).padStart(3)}%`,
  );
}
const rest = all.filter((r) => !claimed.has(r.path));
if (rest.length > 0) {
  const bytes = rest.reduce((s, r) => s + r.bytes, 0);
  const gzip = rest.reduce((s, r) => s + r.gzip, 0);
  console.log(
    `  ${'Khác'.padEnd(18)} ${String(rest.length).padStart(3)} file · ` +
      `${kb(bytes).padStart(10)} thô · ${kb(gzip).padStart(10)} nén · ` +
      `${((bytes / totalBytes) * 100).toFixed(0).padStart(3)}%`,
  );
}

/* ── 2. Từng trang tải những gì ──────────────────────────────────────────── */

/**
 * Mọi tài nguyên `/_next/...` mà một file HTML tham chiếu.
 *
 * Đọc thẳng từ HTML chứ không đọc `build-manifest.json`: manifest nói ý ĐỊNH của bộ đóng gói,
 * còn HTML là thứ trình duyệt thật sự nhận. Hai cái lệch nhau thì bản HTML mới đúng.
 */
function assetsOf(html) {
  const found = new Set();
  for (const match of html.matchAll(/["'(](\/_next\/static\/[^"')]+?\.(?:js|css))["')]/g)) {
    const asset = match[1];
    if (asset !== undefined) found.add(asset.slice(1));
  }
  return [...found];
}

/**
 * Gói vá cho trình duyệt cũ. Next gắn `noModule` nên **trình duyệt hiện đại bỏ qua hoàn toàn**;
 * chính vì thế con số "First Load JS" của Next cũng không tính nó.
 *
 * Không loại nó ra thì mọi trang đội thêm 38 kB ảo và báo cáo lệch 40 kB so với chính bản build —
 * đó là lỗi của bản đầu script này.
 */
const isLegacyOnly = (asset) => /\/polyfills-[^/]+\.js$/.test(asset);

const pages = all
  .filter((r) => r.ext === '.html')
  .map((page) => {
    const html = readFileSync(join(ROOT, page.path), 'utf8');
    const assets = assetsOf(html).filter((a) => sizes.has(a));

    const sum = (list) => list.reduce((s, a) => s + (sizes.get(a)?.gzip ?? 0), 0);

    const js = assets.filter((a) => a.endsWith('.js') && !isLegacyOnly(a));
    const legacy = assets.filter(isLegacyOnly);
    const css = assets.filter((a) => a.endsWith('.css'));

    return {
      url: `/${page.path.replace(/index\.html$/, '')}`,
      htmlGzip: page.gzip,
      jsGzip: sum(js),
      legacyGzip: sum(legacy),
      cssGzip: sum(css),
      /** Tổng đi qua đường truyền cho một lượt truy cập đầu, trình duyệt hiện đại. */
      overWire: page.gzip + sum(js) + sum(css),
      assets,
    };
  })
  .sort((a, b) => b.overWire - a.overWire);

console.log('\n=== Lượt tải đầu của từng trang (đã nén, trình duyệt hiện đại) ===');
console.log(
  `${'Trang'.padEnd(30)} ${'HTML'.padStart(9)} ${'JS'.padStart(9)} ${'CSS'.padStart(8)} ${'Tổng'.padStart(9)}`,
);
for (const p of pages.slice(0, 12)) {
  console.log(
    `${p.url.padEnd(30)} ${kb(p.htmlGzip).padStart(9)} ${kb(p.jsGzip).padStart(9)} ` +
      `${kb(p.cssGzip).padStart(8)} ${kb(p.overWire).padStart(9)}`,
  );
}
if (pages.length > 12) console.log(`  … và ${String(pages.length - 12)} trang công thức khác`);

const legacyGzip = pages[0]?.legacyGzip ?? 0;
if (legacyGzip > 0) {
  console.log(`\nNgoài ra: gói vá ${kb(legacyGzip)} — chỉ trình duyệt CŨ tải (Next gắn noModule).`);
}

/* ── 3. Phần chung và phần riêng ─────────────────────────────────────────── */

/** Tài nguyên MỌI trang đều tham chiếu — phần không trang nào tránh được. */
const shared =
  pages[0]?.assets.filter((a) => !isLegacyOnly(a) && pages.every((p) => p.assets.includes(a))) ??
  [];

// Tách JS khỏi CSS: cột "JS" ở bảng trên chỉ tính JS, gộp chung ở đây thì con số "gói chung"
// hoá ra lớn hơn tổng JS của một trang — vô lý, và đó là lỗi của bản đầu script này.
const sharedJs = shared.filter((a) => a.endsWith('.js'));
const sharedCss = shared.filter((a) => a.endsWith('.css'));
const sumOf = (list) => list.reduce((s, a) => s + (sizes.get(a)?.gzip ?? 0), 0);

console.log(
  `\nGói chung mọi trang đều tải: ${kb(sumOf(sharedJs))} JS (${String(sharedJs.length)} file)` +
    ` + ${kb(sumOf(sharedCss))} CSS (${String(sharedCss.length)} file)`,
);

/* ── 4. Hai chỗ sẽ phình khi nhánh 5 đổ đủ công thức ─────────────────────── */

/**
 * Id của mọi công thức đang có, đọc từ chính `sitemap.xml` của bản build.
 *
 * Đọc từ bản build chứ không viết cứng danh sách: script này là file .mjs nên không import
 * được TypeScript, mà một danh sách chép tay thì sẽ lệch ngay lần thêm công thức tiếp theo.
 */
const formulaIds = [
  ...(() => {
    try {
      return readFileSync(join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/\/cong-thuc\/([^/<]+)\//g);
    } catch {
      return [];
    }
  })(),
].map((m) => m[1]);

/** Chunk có nhắc tới ít nhất một nửa số id — dấu hiệu nó mang dữ liệu công thức. */
const carriesFormulaData = (path) => {
  const text = readFileSync(join(ROOT, path), 'utf8');
  const hits = formulaIds.filter((id) => text.includes(`"${id}"`)).length;
  return formulaIds.length > 0 && hits * 2 >= formulaIds.length;
};

const heaviestJs = [...pages].sort((a, b) => b.jsGzip - a.jsGzip)[0];

/*
 * ── Nguồn phình 1: chỉ mục nhẹ, MỌI trang đều tải ─────────────────────────
 *
 * Đây là thứ duy nhất tăng theo số công thức trên mọi trang. Trước đợt 13, chỗ này là cả
 * Registry đầy đủ (33 kB nén, 29/29 trang tải, kể cả trang 404) vì barrel `@/application`
 * không rung cây được — xem `sideEffects` trong package.json.
 */
const indexChunks = shared.filter((asset) => carriesFormulaData(asset));
const indexGzip = indexChunks.reduce((s, a) => s + (sizes.get(a)?.gzip ?? 0), 0);
const remaining = Math.max(0, FORMULAS_TARGET - FORMULAS_NOW);
const perFormula = indexGzip / FORMULAS_NOW;
const indexGrowth = perFormula * remaining;

console.log(
  `\nChỉ mục nhẹ (mọi trang tải · ${String(FORMULAS_NOW)} công thức): ${kb(indexGzip)} nén · ` +
    (indexChunks.map((a) => a.split('/').pop()).join(', ') || '—'),
);
console.log(`  → ${kb(perFormula)} mỗi công thức`);
if (remaining > 0) {
  console.log(
    `  → đủ ${String(FORMULAS_TARGET)} công thức: ~${kb(perFormula * FORMULAS_TARGET)} (thêm ~${kb(indexGrowth)})`,
  );
}

/*
 * ── Nguồn phình 2: gói riêng của trang chi tiết ───────────────────────────
 *
 * Mọi trang chi tiết dùng chung một bộ chunk chứa hàm tính và giao diện WF-03. Phần hàm tính
 * tăng theo số công thức; phần giao diện thì không, nhưng script không tách được hai phần đó.
 * Vì vậy coi TOÀN BỘ là phần tăng — cố tình bi quan, để cửa kiểm kêu sớm chứ không kêu muộn.
 *
 * Riêng metadata đầy đủ của từng công thức nay nằm trong HTML của chính trang đó, nên nó
 * KHÔNG tăng theo số công thức: thêm công thức là thêm trang mới, không làm nặng trang cũ.
 */
const listPage = pages.find((p) => p.url === '/cong-thuc/');
const detailPages = pages.filter((p) => /^\/cong-thuc\/[^/]+\/$/.test(p.url));
const detailOnly =
  listPage === undefined || detailPages[0] === undefined
    ? []
    : detailPages[0].assets.filter(
        (a) =>
          !isLegacyOnly(a) &&
          a.endsWith('.js') &&
          !listPage.assets.includes(a) &&
          detailPages.every((p) => p.assets.includes(a)),
      );
const detailGzip = detailOnly.reduce((s, a) => s + (sizes.get(a)?.gzip ?? 0), 0);
const detailGrowth = (detailGzip / FORMULAS_NOW) * remaining;

console.log(
  `Gói riêng trang chi tiết (${String(detailPages.length)} trang dùng chung): ${kb(detailGzip)} nén`,
);

if (remaining > 0) {
  console.log(`  → phần tăng nếu coi TẤT CẢ là hàm tính: tối đa ~${kb(detailGrowth)}`);
  if (heaviestJs !== undefined) {
    const projected = heaviestJs.jsGzip + indexGrowth + detailGrowth;
    console.log(
      `\nƯỚC LƯỢNG TRÊN cho trang nặng nhất (${heaviestJs.url}) khi đủ ${String(FORMULAS_TARGET)} công thức: ` +
        `~${kb(projected)} ${projected > BUDGET ? '— VƯỢT' : '— còn dưới'} ngưỡng ${kb(BUDGET)}`,
    );
  }
} else {
  // Đã đủ 107 — từ đây không ngoại suy nữa, chỉ còn số ĐO ĐƯỢC ở mục cửa kiểm bên dưới.
  console.log(
    `\nRegistry đã đủ ${String(FORMULAS_TARGET)} công thức — không còn phần ngoại suy, ` +
      `con số dưới đây là số đo thật.`,
  );
}

/*
 * NFR-PER-04 nói về **First Load JS**, nên cửa kiểm gác đúng đại lượng đó — không gộp HTML và
 * CSS vào. Hai con số kia vẫn in ra ở trên vì chủ dự án cần biết tổng thật đi qua đường truyền,
 * nhưng lấy tổng đi so với một ngưỡng chỉ nói về JS là so lệch đại lượng.
 */

/* ── 5. Cửa kiểm ─────────────────────────────────────────────────────────── */

console.log(
  `\n=== Ngân sách NFR-PER-04 (First Load JS): ${kb(BUDGET)} · cửa kiểm ${kb(CHECKPOINT)} ===`,
);

const over = pages.filter((p) => p.jsGzip > CHECKPOINT);
if (over.length > 0) {
  console.error(`CHƯA ĐẠT — ${String(over.length)} trang vượt cửa kiểm:`);
  for (const p of over) console.error(`  ${p.url} · ${kb(p.jsGzip)} JS`);
  process.exit(1);
}

console.log(
  `OK — nặng nhất là ${heaviestJs?.url ?? '?'} với ${kb(heaviestJs?.jsGzip ?? 0)} JS, ` +
    `còn dưới cửa kiểm ${kb(CHECKPOINT)}.`,
);
