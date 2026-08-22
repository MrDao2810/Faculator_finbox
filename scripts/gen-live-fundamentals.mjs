/**
 * Sinh `src/data/live-fundamentals.generated.ts` từ số liệu cơ bản THẬT của Finbox_v2
 * (`dcs.finbox.vn`, cùng công ty) — thay phần bịa trong `src/data/samples.ts`.
 *
 * Chạy TAY, cần mạng: `npm run gen:live-fundamentals`. KHÔNG nằm trong `npm test`/`npm run
 * check`/CI — cùng lý do với `check:chrome` (phụ thuộc thứ nằm ngoài máy build).
 *
 * Chỉ lấy đúng 4 mã đang có preset trong `samples.ts`. Endpoint không cần Bearer token (đã xác
 * nhận qua đọc code `finbox_v2` và gọi thử thật).
 *
 * Vì sao có bước tự đối chiếu P/E, P/B trước khi ghi file: đơn vị của API (nghìn ₫) khác đơn vị
 * `Fundamentals` (₫) đúng 1000 lần — sai một lần nhân là số sai cả nghìn lần mà không ai thấy
 * ngay, đúng bẫy `preset-inputs.ts` từng cảnh báo. Tính lại P/E = priceFlat/eps và P/B =
 * priceFlat/bookValue bằng CHÍNH đơn vị API trả (không nhân 1000) rồi so với `pe`/`pb` mà
 * Finbox tự tính — lệch quá 1% thì dừng, không ghi file sai.
 *
 * `ct_ct_tm_{năm}` (cổ tức tiền mặt) LÚC ĐẦU tưởng là một TỶ LỆ trên mệnh giá (gặp VCB
 * `ct_ct_tm_2025=0.45`, giống 45%) — sai. Đối chiếu thêm VNM (`...2025=4.35`) và FPT
 * (`...2025=2`) mới thấy: đây là cùng thang "nghìn ₫" như `eps_pha_loang`/`gia_tri_so_sach`,
 * tức 4.35 = 4.350 ₫/CP thật (khớp mức cổ tức VNM vẫn trả), không phải 43.500 ₫ như nhân với
 * mệnh giá 10.000 ₫ sẽ ra. VCB thấp (0.45 → 450 ₫) chỉ vì VCB vốn trả cổ tức tiền mặt thấp,
 * không phải vì đơn vị khác công ty khác. Không có field API nào tham chiếu để tự đối chiếu số
 * này (khác P/E, P/B) nên phải cẩn thận đọc dữ liệu thô nhiều mã trước khi tin một quy tắc.
 *
 * `netIncome` KHÔNG lấy `dynamic.ln_y{năm hiện tại}` — đã thử và sai: với MWG, `ln_y2026 = 6017`
 * chỉ là LŨY KẾ TỪ ĐẦU NĂM (đúng bằng `ln_q1/2026 + ln_q2/2026`, vì 2026 chưa hết năm), trong khi
 * `eps_pha_loang` là EPS **12 tháng gần nhất** (TTM). Hai khái niệm khác kỳ, đem tính ROE/EPS
 * ngược lại ra số sai gần 2/3. Phép đối chiếu đúng: cộng 4 quý gần nhất
 * (`ln_q2/2026+ln_q1/2026+ln_q4/2025+ln_q3/2025` = 9.856,5) khớp `eps_pha_loang × slcp`
 * (9.838,9, lệch 0,18%) — vì vậy dùng TTM (4 quý gần nhất), có tự đối chiếu bằng đúng phép này.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ENDPOINT = 'https://dcs.finbox.vn/v1/getTickerDetail';
const TICKERS = ['FPT', 'HPG', 'VNM', 'MWG'];
const TARGET = fileURLToPath(
  new URL('../src/data/live-fundamentals.generated.ts', import.meta.url),
);

async function fetchTickerDetail(ticker) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { accept: '*/*', 'Content-Type': 'application/json' },
    body: JSON.stringify({ day: 0, ticker }),
  });
  if (!res.ok) {
    throw new Error(`Finbox_v2 trả về HTTP ${res.status} cho mã ${ticker}`);
  }
  const raw = await res.json();
  return JSON.parse(raw.tickerData);
}

/**
 * `dynamic` chứa nhiều năm, một số năm giá trị `0` — nghi là chưa có số chứ không phải cổ tức
 * thật bằng 0 (đã thấy `ln_y2024=0` trong lúc khảo sát, cùng dạng thiếu số). Bỏ qua năm `0`, lấy
 * năm gần nhất có giá trị khác 0.
 */
function latestNonZero(dynamic, prefix) {
  const re = new RegExp(`^${prefix}(\\d{4})$`);
  const years = Object.keys(dynamic)
    .map((key) => re.exec(key))
    .filter((m) => m !== null)
    .map((m) => Number(m[1]))
    .sort((a, b) => b - a);

  for (const year of years) {
    const value = dynamic[`${prefix}${year}`];
    if (typeof value === 'number' && Number.isFinite(value) && value !== 0) return { year, value };
  }
  return undefined;
}

/**
 * Lợi nhuận ròng 12 tháng gần nhất — cộng 4 quý gần nhất tìm được trong `dynamic.ln_q{quý}/{năm}`.
 * Xem docblock đầu file vì sao không dùng `ln_y{năm}`.
 */
function trailingTwelveMonths(dynamic) {
  const re = /^ln_q(\d)\/(\d{4})$/;
  const quarters = Object.keys(dynamic)
    .map((key) => {
      const m = re.exec(key);
      if (m === null) return undefined;
      const value = dynamic[key];
      if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
      const quarter = Number(m[1]);
      const year = Number(m[2]);
      return { rank: year * 4 + quarter, value };
    })
    .filter((entry) => entry !== undefined)
    .sort((a, b) => b.rank - a.rank);

  if (quarters.length < 4) return undefined;
  return quarters.slice(0, 4).reduce((sum, entry) => sum + entry.value, 0);
}

function checkClose(ticker, label, computed, expected) {
  if (typeof expected !== 'number' || !Number.isFinite(expected) || expected === 0) return;
  const diff = Math.abs(computed - expected) / Math.abs(expected);
  if (diff > 0.01) {
    throw new Error(
      `${ticker}: ${label} tự tính (${computed.toFixed(3)}) lệch quá 1% so với API ` +
        `(${String(expected)}) — dừng, không ghi file.`,
    );
  }
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function buildFundamentals(ticker, main) {
  checkClose(ticker, 'P/E', main.priceFlat / main.eps_pha_loang, main.pe);
  checkClose(ticker, 'P/B', main.priceFlat / main.gia_tri_so_sach, main.pb);

  const eps = round(main.eps_pha_loang * 1000, 0);
  const bookValuePerShare = round(main.gia_tri_so_sach * 1000, 0);
  const sharesOutstanding = main.slcp;
  const period =
    typeof main.bctc === 'string' && main.bctc.startsWith('BCTC') ? main.bctc : `BCTC ${main.bctc}`;

  const netIncomeTTM = trailingTwelveMonths(main.dynamic);
  if (netIncomeTTM === undefined) {
    throw new Error(
      `${ticker}: không đủ 4 quý gần nhất trong dynamic.ln_q* để tính lợi nhuận TTM.`,
    );
  }
  // Đối chiếu: TTM phải sinh lại đúng EPS hiện tại (cùng khái niệm "12 tháng gần nhất") — chỗ này
  // bắt được lỗi kỳ báo cáo lệch nhau mà checkClose P/E, P/B không bắt được (khác field API).
  checkClose(ticker, 'netIncome TTM → EPS', (netIncomeTTM * 1e9) / sharesOutstanding, eps);

  // Cùng thang "nghìn ₫" như eps/bookValue — xem docblock đầu file, KHÔNG phải tỷ lệ trên mệnh giá.
  const dividendEntry = latestNonZero(main.dynamic, 'ct_ct_tm_');
  const dividendPerShare = dividendEntry === undefined ? 0 : round(dividendEntry.value * 1000, 0);

  // Suy ra như `wholeCompany()` trong samples.ts — API không có field vốn chủ sở hữu tuyệt đối.
  const equity = round((bookValuePerShare * sharesOutstanding) / 1_000_000_000, 1);

  return {
    eps,
    bookValuePerShare,
    sharesOutstanding,
    dividendPerShare,
    netIncome: round(netIncomeTTM, 1),
    equity,
    period,
  };
}

function quote(text) {
  return `'${text.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

function render(entries, fetchedAt) {
  const rows = entries.map(([ticker, f]) => {
    // Không quote khoá — prettier tự bỏ quote cho key hợp lệ như định danh (quoteProps:
    // as-needed), viết sẵn khớp luôn để không cần chạy `prettier --write` sau khi sinh.
    return `  ${ticker}: {
    eps: ${String(f.eps)},
    bookValuePerShare: ${String(f.bookValuePerShare)},
    sharesOutstanding: ${String(f.sharesOutstanding)},
    dividendPerShare: ${String(f.dividendPerShare)},
    netIncome: ${String(f.netIncome)},
    equity: ${String(f.equity)},
    period: ${quote(f.period)},
  },`;
  });

  return `/**
 * SINH TỰ ĐỘNG TỪ API FINBOX_V2 (\`dcs.finbox.vn\`) — ĐỪNG SỬA TAY.
 * Sinh lại bằng: npm run gen:live-fundamentals
 *
 * \`eps\`/\`bookValuePerShare\`/\`sharesOutstanding\`/\`dividendPerShare\`/\`period\` đọc thẳng từ
 * báo cáo thật (chỉ đổi đơn vị nghìn ₫ → ₫). \`netIncome\` là lợi nhuận ròng **12 tháng gần
 * nhất** (cộng 4 quý gần nhất, không phải luỹ kế từ đầu năm — xem docblock script sinh).
 * \`equity\` vẫn SUY RA (\`bookValuePerShare × sharesOutstanding\`) — Finbox_v2 không có field
 * vốn chủ sở hữu tuyệt đối.
 *
 * Lấy lúc: ${fetchedAt}
 */

import type { Fundamentals } from './types';

export const LIVE_FUNDAMENTALS_FETCHED_AT = ${quote(fetchedAt)};

export const LIVE_FUNDAMENTALS: Readonly<Record<string, Fundamentals>> = {
${rows.join('\n')}
};
`;
}

const entries = [];
for (const ticker of TICKERS) {
  console.log(`Đang lấy ${ticker}...`);
  const main = await fetchTickerDetail(ticker);
  entries.push([ticker, buildFundamentals(ticker, main)]);
}

const fetchedAt = new Date().toISOString();
writeFileSync(TARGET, render(entries, fetchedAt), 'utf8');
console.log(`Đã ghi ${TARGET}`);
