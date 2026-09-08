/**
 * Sinh `src/data/ticker-coverage.generated.ts` — danh sách mã CÓ số liệu cơ bản dùng được.
 *
 * Chạy TAY, cần mạng: `npm run gen:ticker-coverage`. KHÔNG nằm trong `npm test`/`npm run check`/CI
 * — cùng lý do với `gen:live-fundamentals` và `check:chrome`.
 *
 * ── Vì sao cần ────────────────────────────────────────────────────────────────────────────────
 *
 * Sheet "Tìm mã khác trong thị trường" bày cả 1.649 mã từ `GET /bp/codes`, mà endpoint ấy chỉ trả
 * `{code, name}` — nó không biết mã nào có báo cáo dùng được. Người dùng chọn nhầm một chứng chỉ
 * quỹ rồi nhận câu "chưa có đủ số liệu cơ bản", đóng sheet, mở lại, chọn nhầm mã khác. Khoảng 100
 * trên 1.005 mã sẽ KHÔNG BAO GIỜ nạp được; đánh dấu chúng ngay trong danh sách là cách duy nhất để
 * người dùng biết trước khi bấm.
 *
 * Hỏi lúc chạy thì không được: `POST /data/symbols` nặng ~6,6 kB mỗi mã, nên dò 60 dòng đang hiện
 * là ~400 kB mỗi lần mở sheet. Sinh sẵn lúc build thì tốn 0 byte lúc chạy, và file được nạp TRỄ
 * nên cũng không đụng cửa kiểm First Load JS 180 kB.
 *
 * ── Luật lọc: ĐÚNG luật `toFundamentals()` ────────────────────────────────────────────────────
 *
 * Danh sách này chỉ có nghĩa nếu nó dự đoán đúng thứ `src/data/finbox/map.ts` sẽ làm lúc người
 * dùng bấm. Năm phép dưới đây chép đúng `toFundamentals()`, và phần đọc quý dùng chung
 * `scripts/lib/finbox-quarters.mjs` với `gen-live-fundamentals.mjs` để ba chỗ không trôi khỏi nhau.
 *
 * ⚠ KHÔNG áp `checkSelfConsistent()` của `gen-live-fundamentals.mjs` ở đây. Phép ấy là luật CHỌN
 * MẪU — ta tự quyết bày mã nào nên chỉ bày mã có bộ số tự khớp là được lợi. Còn ở đây là dự đoán
 * cho mã NGƯỜI DÙNG SẮP HỎI: đánh dấu "không dùng được" cho một mã mà `map.ts` thật ra nạp được là
 * nói dối theo chiều ngược lại, và giấu mất một mã hoàn toàn hợp lệ (PLX, SSI, HCM…).
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  latestQuarters,
  periodicOf,
  quartersAgree,
  trailingTwelveMonths,
  usableNumber,
  withinTolerance,
} from './lib/finbox-quarters.mjs';

const LIST_ENDPOINT = 'https://dcs.finbox.vn/bp/codes';
const SNAPSHOT_ENDPOINT = 'https://dcs.finbox.vn/data/symbols';

/**
 * Số mã mỗi lượt gọi.
 *
 * Đo được: 30 mã ≈ 199 kB / 0,23 s. 100 mã mỗi lô cho ~17 lượt cho cả thị trường — đủ ít lượt để
 * chạy nhanh, đủ nhỏ để một lô hỏng không kéo theo cả nghìn mã.
 */
const BATCH = 100;

const TARGET = fileURLToPath(new URL('../src/data/ticker-coverage.generated.ts', import.meta.url));

/**
 * Mã bắt buộc phải sống sót.
 *
 * Bốn mã WF-10 bị ghim trong `provider.test.ts` và `charts.test.tsx`. Nếu chúng rơi khỏi danh sách
 * thì luật lọc ở đây đã sai chứ không phải thị trường đổi — dừng, không ghi file.
 */
const REQUIRED = ['FPT', 'HPG', 'VNM', 'MWG'];

/**
 * Bản ghi này có qua được `toFundamentals()` không — chép đúng năm phép của `map.ts`.
 *
 * Trả về `true`/`false` chứ không dựng `Fundamentals`: ở đây chỉ cần biết ĐƯỢC hay KHÔNG, và dựng
 * cả object là mời người sau tưởng file sinh ra chứa số liệu thật (nó không, và không nên — số
 * liệu của 903 mã là ~200 kB trong bundle).
 */
function usable(record) {
  const eps = record.eps_pha_loang;
  const book = record.gia_tri_so_sach;
  const shares = record.slcp;
  const price = record.priceFlat;
  const bctc = record.bctc;

  // 1. Field bắt buộc.
  if (!usableNumber(eps) || !usableNumber(book)) return false;
  if (typeof shares !== 'number' || !Number.isFinite(shares) || shares <= 0) return false;
  if (typeof bctc !== 'string' || bctc.trim() === '') return false;

  // 2 + 3. P/E và P/B bắt lỗi đơn vị — đối chiếu bằng CHÍNH đơn vị API trả (chưa nhân 1000).
  const priceOk = typeof price === 'number' && Number.isFinite(price);
  if (priceOk && !withinTolerance(price / eps, record.pe)) return false;
  if (priceOk && !withinTolerance(price / book, record.pb)) return false;

  // 4 + 5. Kỳ báo cáo: hai quý gần nhất phải khớp, và bốn quý phải liền nhau.
  const periodic = periodicOf(record);
  const quarters = latestQuarters(periodic, 'ln_');
  if (!quartersAgree(periodic, quarters, 'ln_')) return false;

  return trailingTwelveMonths(quarters) !== undefined;
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { accept: '*/*', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} trả về HTTP ${String(res.status)}`);
  return res.json();
}

/** `GET /bp/codes` → mã giao dịch được. Luật `code !== name` chép từ `parseTickerList()`. */
async function fetchCodes() {
  const res = await fetch(LIST_ENDPOINT, { headers: { accept: '*/*' } });
  if (!res.ok) throw new Error(`${LIST_ENDPOINT} trả về HTTP ${String(res.status)}`);

  const body = await res.json();
  if (!Array.isArray(body)) throw new Error('Danh sách mã không phải mảng — API đã đổi hình dạng.');

  const seen = new Set();
  for (const row of body) {
    if (typeof row !== 'object' || row === null) continue;
    const code = typeof row.code === 'string' ? row.code.trim() : '';
    const name = typeof row.name === 'string' ? row.name.trim() : '';
    if (code === '' || name === '' || code === name) continue;
    seen.add(code.toUpperCase());
  }
  return [...seen].sort();
}

const codes = await fetchCodes();
console.log(`Danh sách: ${String(codes.length)} mã giao dịch được.`);

const ok = [];
let seenBack = 0;

for (let i = 0; i < codes.length; i += BATCH) {
  const batch = codes.slice(i, i + BATCH);
  process.stdout.write(`  lô ${String(i / BATCH + 1)} (${String(batch.length)} mã)... `);

  const body = await postJson(SNAPSHOT_ENDPOINT, { symbols: batch });
  const rows = Array.isArray(body) ? body : Array.isArray(body.symbols) ? body.symbols : [];
  seenBack += rows.length;

  for (const row of rows) {
    if (typeof row !== 'object' || row === null) continue;
    const code = typeof row.ticker === 'string' ? row.ticker.trim().toUpperCase() : '';
    if (code !== '' && usable(row)) ok.push(code);
  }
  console.log('xong');
}

ok.sort();

const missing = REQUIRED.filter((code) => !ok.includes(code));
if (missing.length > 0) {
  throw new Error(
    `Mất mã WF-10 bắt buộc: ${missing.join(', ')} — dừng, không ghi file. ` +
      `Bốn mã này chắc chắn có báo cáo dùng được, nên đây là luật lọc ở script đã sai.`,
  );
}

const fetchedAt = new Date().toISOString();

/*
 * Ghi thành MỘT CHUỖI cách nhau dấu cách, không phải mảng.
 *
 * ~903 mã × 4 ký tự: mảng tốn thêm hai dấu nháy và một dấu phẩy mỗi phần tử. Chuỗi rồi `.split(' ')`
 * lúc chạy rẻ hơn khoảng 40% sau gzip, và phép tách chạy đúng một lần khi sheet mở.
 */
const file = `/**
 * SINH TỰ ĐỘNG TỪ API FINBOX_V2 (\`dcs.finbox.vn\`) — ĐỪNG SỬA TAY.
 * Sinh lại bằng: npm run gen:ticker-coverage
 *
 * Mã có số liệu cơ bản qua được \`toFundamentals()\` (\`src/data/finbox/map.ts\`) tại thời điểm
 * sinh file. Sheet chọn mã đọc danh sách này để đánh dấu những mã KHÔNG nạp được, thay vì để người
 * dùng bấm vào rồi mới biết.
 *
 * ⚠ Danh sách CŨ ĐI mỗi kỳ báo cáo: một mã hôm nay thiếu quý liền nhau, quý sau công bố thêm là
 * dùng được. Nơi hiển thị vì thế phải in ngày dưới đây và cho phép hiện lại những mã bị ẩn — ẩn
 * vĩnh viễn một mã hợp lệ vì một file cũ là đúng kiểu "im lặng bớt đi" mà FR-06 cấm.
 *
 * Lấy lúc: ${fetchedAt}
 */

export const TICKER_COVERAGE_FETCHED_AT = '${fetchedAt}';

/** ${String(ok.length)} mã, cách nhau một dấu cách. Xem docblock đầu file vì sao là chuỗi. */
export const TICKERS_WITH_FUNDAMENTALS = '${ok.join(' ')}';
`;

writeFileSync(TARGET, file, 'utf8');
console.log(
  `\nAPI trả về ${String(seenBack)} bản ghi; ${String(ok.length)} mã có số liệu dùng được ` +
    `(${String(codes.length - ok.length)} mã không).`,
);
console.log(`Đã ghi vào ${TARGET}`);
