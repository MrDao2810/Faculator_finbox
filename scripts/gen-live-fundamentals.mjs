/**
 * Sinh `src/data/live-fundamentals.generated.ts` từ số liệu cơ bản THẬT của Finbox_v2
 * (`dcs.finbox.vn`, cùng công ty) — thay phần bịa trong `src/data/samples.ts`.
 *
 * Chạy TAY, cần mạng: `npm run gen:live-fundamentals`. KHÔNG nằm trong `npm test`/`npm run
 * check`/CI — cùng lý do với `check:chrome` (phụ thuộc thứ nằm ngoài máy build).
 *
 * Endpoint không cần Bearer token (đã xác nhận qua đọc code `finbox_v2` và gọi thử thật).
 *
 * ── Vì sao một KHO mã chứ không còn 4 ──────────────────────────────────────────────────────
 *
 * Sheet "Nạp mẫu" trước đây bày đúng 4 mã cho cả 111 công thức, và 4 dòng ấy đọc y hệt nhau vì
 * dòng mô tả chỉ ghi NGUỒN (`BCTC Q2/2026 · 248 phiên giá`) chứ không ghi con số nào của mã. Chủ
 * dự án báo đúng chỗ đó. Bản sửa cho mỗi công thức tự chọn 4 mã CHO RA 4 KẾT QUẢ TRẢI RỘNG
 * (`src/data/preset-pick.ts`), và phép chọn ấy cần một kho rộng hơn 4 mới có gì để chọn.
 *
 * Danh sách dưới đây trải đều ngành để phép chọn có biên độ thật: một P/E thấp và một P/E cao phải
 * là hai doanh nghiệp khác hẳn nhau về bản chất, không phải hai mã cùng ngành lệch nhau vài phần
 * trăm. Ngân hàng có mặt vì thiếu nó thì P/B không bao giờ xuống dưới 1.
 *
 * ── Vì sao lấy thêm `priceFlat`, `company`, `industry` ──────────────────────────────────────
 *
 * `priceFlat` là **thị giá thật** của phiên gần nhất. Trước đợt này giá mở đầu chuỗi mẫu là con
 * số viết tay trong `samples.ts` (FPT 92.000 ₫), nên P/E của bộ mẫu là P/E của một mức giá bịa.
 * Nay chuỗi giá vẫn tự dựng (Finbox không có lịch sử dài) nhưng được NEO vào giá thật ở phiên
 * cuối — xem `makeBars()` — nên mọi công thức ăn `price` nhận đúng thị giá.
 *
 * `company`/`industry` thay danh sách tên viết tay: mỗi dòng tên gõ tay là một chỗ gõ sai được, và
 * ngành là thứ sheet cần để nói vì sao bốn mã nó chọn lại khác nhau.
 *
 * ── Mã hỏng thì BỎ QUA, mã lệch đơn vị thì DỪNG ─────────────────────────────────────────────
 *
 * Hai loại lỗi khác hẳn nhau, nên xử khác nhau. Thiếu dữ liệu (chưa đủ 4 quý liền nhau, thiếu
 * field) là chuyện của riêng một doanh nghiệp — bỏ mã đó, ghi ra màn, những mã còn lại vẫn đúng.
 * Còn `checkClose` lệch nghĩa là PHÉP ĐỔI ĐƠN VỊ của chính script này sai, và cái sai đó không
 * dừng ở một mã — dừng hẳn, không ghi file. Bốn mã WF-10 bắt buộc phải sống sót: chúng bị ghim
 * trong `provider.test.ts` và `charts.test.tsx`.
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
 * ngược lại ra số sai gần 2/3. Đúng phép: cộng 4 quý gần nhất
 * (`ln_q2/2026+ln_q1/2026+ln_q4/2025+ln_q3/2025` = 9.856,5).
 *
 * ⚠ Bản đầu đối chiếu tổng TTM ấy với `eps_pha_loang × slcp` (MWG lệch 0,18% nên qua). Phép đó
 * ĐÃ GỠ ngày 25/08/2026: nó so hai đại lượng khác nhau — EPS công bố tính trên số CP bình quân
 * gia quyền, phần lợi nhuận thuộc cổ đông mẹ, đã pha loãng — và loại nhầm 268/1.005 mã ở bản
 * chạy lúc chạy (SSI 10,4%, HHV 6,7%, CEO 4,5%). Thay bằng `checkLatestQuarters()`: hai quý ta
 * chọn phải khớp `ln_quygannhat` / `ln_quygannhi`. Lý do đầy đủ ở `src/data/finbox/map.ts`.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  latestQuarters,
  quartersAgree,
  trailingTwelveMonths,
  usableNumber,
} from './lib/finbox-quarters.mjs';

const ENDPOINT = 'https://dcs.finbox.vn/v1/getTickerDetail';

/** Bốn mã WF-10. Mất một mã trong nhóm này là dừng — xem docblock đầu file. */
const REQUIRED = ['FPT', 'HPG', 'VNM', 'MWG'];

/**
 * Kho mã mẫu ỨNG VIÊN, xếp theo ngành để dễ soi khi thêm bớt.
 *
 * Danh sách này là đầu vào, không phải kết quả: `checkSelfConsistent()` loại mã có bộ số tự mâu
 * thuẫn, nên số mã thật sự ghi ra file luôn ít hơn. Cố ý để dư ứng viên ở mỗi ngành vì mất mã nào
 * thì chỉ biết sau khi gọi API — đo lần đầu: 5 trên 24 mã rụng, toàn mô hình tập đoàn.
 */
const TICKERS = [
  // Công nghệ · bán lẻ · tiêu dùng
  'FPT',
  'MWG',
  'PNJ',
  'VNM',
  'SAB',
  'MSN',
  'DBC',
  'VJC',
  // Ngân hàng — thiếu nhóm này thì P/B không bao giờ xuống dưới 1
  'VCB',
  'TCB',
  'MBB',
  'ACB',
  'VPB',
  'BID',
  'CTG',
  // Chứng khoán
  'SSI',
  'VND',
  'HCM',
  // Vật liệu · công nghiệp
  'HPG',
  'HSG',
  'GVR',
  'DGC',
  'BMP',
  // Bất động sản
  'VHM',
  'VIC',
  'KDH',
  'NLG',
  'KBC',
  // Năng lượng · tiện ích
  'GAS',
  'POW',
  'REE',
  'PLX',
  'NT2',
  // Dược · viễn thông
  'DHG',
  'VTP',
];
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
 * Bản NÉM của `quartersAgree()`: ở đây lệch kỳ báo cáo là lỗi phải dừng cả lượt sinh, không phải
 * một mã đáng bỏ qua. Phép so nằm trong `lib/finbox-quarters.mjs`, dùng chung với
 * `gen-ticker-coverage.mjs` và song sinh với `latestQuartersAgree()` bên `map.ts`.
 */
function checkLatestQuarters(ticker, dynamic, quarters, prefix) {
  if (quartersAgree(dynamic, quarters, prefix)) return;
  throw new Error(
    `${ticker}: quý gần nhất tự chọn (${String(quarters[0]?.value)}) không khớp con số API công bố ` +
      `(${String(dynamic[`${prefix}quygannhat`])}) — dừng, không ghi file.`,
  );
}

/**
 * Bốn trường phải nói cùng một chuyện về cùng một doanh nghiệp.
 *
 * `netIncome ÷ số CP` phải xấp xỉ `eps`. Đo trên 24 mã đầu tiên: 19 mã lệch dưới 0,6%, còn PLX
 * lệch **81%**, SSI 10,4%, NLG 9,6%, POW 5,3%, MSN 4,2% — toàn mô hình tập đoàn có LỢI ÍCH CỔ
 * ĐÔNG THIỂU SỐ lớn. `ln_q*` là lợi nhuận TOÀN tập đoàn, còn `eps_pha_loang` là phần thuộc cổ
 * đông công ty mẹ; `equity` thì suy ra từ `bvps × số CP`, tức cũng chỉ phần công ty mẹ.
 *
 * Để lọt thì ROE = `netIncome / equity` lấy tử số toàn tập đoàn chia mẫu số công ty mẹ — với PLX
 * ra một con số cao hơn sự thật gần gấp đôi, mà trên màn không có gì nói là đã sai. Đúng loại lỗi
 * FR-06 tồn tại để chặn, và sheet "Nạp mẫu" nay xếp hạng mã THEO chính con số đó nên nó sẽ đứng ở
 * đầu bảng.
 *
 * ── Vì sao ở ĐÂY được mà ở `map.ts` thì không ───────────────────────────────────────────────
 *
 * Docblock đầu file ghi rằng một phép đối chiếu gần giống đã bị GỠ khỏi `src/data/finbox/map.ts`
 * vì loại nhầm 268/1.005 mã. Hai chỗ khác nhau ở chỗ mất gì khi loại: ở `map.ts`, mã bị loại là
 * mã NGƯỜI DÙNG VỪA HỎI — loại nó là lấy mất thứ họ cần. Ở đây là CHỌN MẪU: ta tự quyết bày mã
 * nào, nên chỉ bày mã có bộ số tự khớp là được lợi, không mất gì. Đừng bê phép này ngược lại
 * `map.ts`.
 */
function checkSelfConsistent(ticker, eps, sharesOutstanding, netIncomeTTM) {
  const TOLERANCE = 0.02;
  const epsFromNetIncome = (netIncomeTTM * 1_000_000_000) / sharesOutstanding;
  const diff = Math.abs(epsFromNetIncome - eps) / Math.abs(eps);

  if (diff > TOLERANCE) {
    throw new SkipTicker(
      `${ticker}: lợi nhuận TTM ÷ số CP ra ${epsFromNetIncome.toFixed(0)} ₫ nhưng EPS công bố là ` +
        `${String(eps)} ₫ (lệch ${(diff * 100).toFixed(1)}%) — nhiều khả năng có lợi ích cổ đông ` +
        `thiểu số lớn, ROE suy ra sẽ sai.`,
    );
  }
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

/**
 * Mã này thiếu dữ liệu, không phải script sai — bỏ mã, chạy tiếp.
 * Xem docblock đầu file về hai loại lỗi.
 */
class SkipTicker extends Error {}

function buildFundamentals(ticker, main) {
  for (const [field, value] of Object.entries({
    priceFlat: main.priceFlat,
    eps_pha_loang: main.eps_pha_loang,
    gia_tri_so_sach: main.gia_tri_so_sach,
    slcp: main.slcp,
  })) {
    if (!usableNumber(value)) {
      throw new SkipTicker(`${ticker}: thiếu hoặc bằng 0 ở field \`${field}\`.`);
    }
  }

  checkClose(ticker, 'P/E', main.priceFlat / main.eps_pha_loang, main.pe);
  checkClose(ticker, 'P/B', main.priceFlat / main.gia_tri_so_sach, main.pb);

  const eps = round(main.eps_pha_loang * 1000, 0);
  const bookValuePerShare = round(main.gia_tri_so_sach * 1000, 0);
  const sharesOutstanding = main.slcp;
  const period =
    typeof main.bctc === 'string' && main.bctc.startsWith('BCTC') ? main.bctc : `BCTC ${main.bctc}`;

  const quarters = latestQuarters(main.dynamic, 'ln_');
  // Đối chiếu kỳ báo cáo — bắt được lỗi chọn nhầm quý mà checkClose P/E, P/B không thấy (khác
  // field API). Phải chạy TRƯỚC phép cộng: sai kỳ thì tổng có ra số cũng là số của kỳ khác.
  checkLatestQuarters(ticker, main.dynamic, quarters, 'ln_');

  const netIncomeTTM = trailingTwelveMonths(quarters);
  if (netIncomeTTM === undefined) {
    throw new SkipTicker(
      `${ticker}: không đủ 4 quý liền nhau trong dynamic.ln_q* để tính lợi nhuận TTM.`,
    );
  }

  // Cùng thang "nghìn ₫" như eps/bookValue — xem docblock đầu file, KHÔNG phải tỷ lệ trên mệnh giá.
  const dividendEntry = latestNonZero(main.dynamic, 'ct_ct_tm_');
  const dividendPerShare = dividendEntry === undefined ? 0 : round(dividendEntry.value * 1000, 0);

  // Suy ra như `wholeCompany()` trong samples.ts — API không có field vốn chủ sở hữu tuyệt đối.
  const equity = round((bookValuePerShare * sharesOutstanding) / 1_000_000_000, 1);

  checkSelfConsistent(ticker, eps, sharesOutstanding, netIncomeTTM);

  return {
    eps,
    bookValuePerShare,
    sharesOutstanding,
    dividendPerShare,
    netIncome: round(netIncomeTTM, 1),
    equity,
    period,
    ...buildExtended(ticker, main, {
      sharesOutstanding,
      equity,
      netIncome: round(netIncomeTTM, 1),
    }),
  };
}

/**
 * Năm trường mở rộng — bản song sinh của `extendedFields()` trong `src/data/finbox/map.ts`.
 *
 * Khác một điểm có chủ đích: ở đây, trường nào không dựng được thì **vắng mặt lặng lẽ** chứ không
 * `throw`. Xương sống của bản ghi (`eps`, `bookValuePerShare`, `netIncome`) vẫn giữ nguyên luật cũ
 * — sai là dừng, không ghi file. Nhưng một mã thiếu `dt_q*` mà vẫn có đủ EPS và số cổ phiếu thì bỏ
 * cả mã khỏi bộ mẫu là mất nhiều hơn được, đúng bài học 268/1.005 mã ở docblock `map.ts`.
 *
 * `checkClose` (ngưỡng 1%) chỉ dùng cho `vonhoa` — nó phải khớp `thị giá × số CP`, một phép nhân
 * thuần nên lệch quá 1% là lỗi ĐƠN VỊ của chính script. `roa`/`bienloinhuan` thì dùng ngưỡng RỘNG
 * 25% vì hai vế khác kỳ và khác phạm vi hợp nhất — lý do đầy đủ ở `LOOSE_TOLERANCE` trong `map.ts`.
 */
function buildExtended(ticker, main, anchor) {
  const out = {};
  const LOOSE = 0.25;
  const near = (computed, expected) =>
    typeof expected !== 'number' || !Number.isFinite(expected) || expected === 0
      ? true
      : Math.abs(computed - expected) / Math.abs(expected) <= LOOSE;

  /*
   * ⚠ KHÔNG đối chiếu doanh thu với `bienloinhuan` — bản đầu có phép ấy và nó loại 19/27 mã. Đo
   * ngày 08/09/2026 trên 14 mã lớn: biên ròng tự tính lệch từ 13% tới 86%, không mã nào khớp.
   * `bienloinhuan` không phải "lợi nhuận sau thuế ÷ doanh thu thuần". Xem `extendedFields()` trong
   * `src/data/finbox/map.ts` để đọc đủ.
   *
   * Dùng `quartersAgree()` bản MỀM (trả `false`) chứ không `checkLatestQuarters()` bản ném: với
   * `ln_` thì lệch kỳ là hỏng xương sống bản ghi nên phải dừng, còn với `dt_` thì chỉ mất một
   * trường tuỳ chọn — dừng cả lượt sinh vì một mã bày doanh thu lạ là phản ứng quá tay.
   */
  const revenueQuarters = latestQuarters(main.dynamic, 'dt_');
  const revenueTTM = quartersAgree(main.dynamic, revenueQuarters, 'dt_')
    ? trailingTwelveMonths(revenueQuarters)
    : undefined;
  if (revenueTTM !== undefined && revenueTTM > 0) out.revenue = round(revenueTTM, 1);

  // `noVCSH === 0` là hợp lệ (doanh nghiệp không nợ), nên KHÔNG dùng `usableNumber` vốn loại số 0.
  if (
    typeof main.noVCSH === 'number' &&
    Number.isFinite(main.noVCSH) &&
    main.noVCSH >= 0 &&
    anchor.equity > 0
  ) {
    const totalLiabilities = round(main.noVCSH * anchor.equity, 1);
    const totalAssets = round(anchor.equity + totalLiabilities, 1);
    if (totalAssets > 0 && near(anchor.netIncome / totalAssets, main.roa)) {
      out.totalLiabilities = totalLiabilities;
      out.totalAssets = totalAssets;
    }
  }

  if (usableNumber(main.vonhoa)) {
    checkClose(
      ticker,
      'vốn hoá',
      (main.priceFlat * 1000 * anchor.sharesOutstanding) / 1_000_000_000,
      main.vonhoa,
    );
    out.marketCap = main.vonhoa;
  }

  if (usableNumber(main.pe) && main.pe > 0) out.pe = main.pe;

  return out;
}

/**
 * Tên hiển thị và ngành.
 *
 * `company` là tên thương hiệu ngắn ('Vietcombank'), khác `info` vốn là cả đoạn giới thiệu. Thiếu
 * thì lấy chính mã làm tên — một dòng thiếu tên vẫn dùng được, không đáng bỏ cả mã.
 */
function buildMeta(ticker, main) {
  const text = (value, fallback) =>
    typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;

  return {
    name: text(main.company, ticker),
    industry: text(main.industry, ''),
    // API yết bằng nghìn ₫, cùng thang với eps/gia_tri_so_sach — xem docblock đầu file.
    priceVnd: round(main.priceFlat * 1000, 0),
  };
}

function quote(text) {
  return `'${text.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

function render(entries, fetchedAt) {
  // Không quote khoá — prettier tự bỏ quote cho key hợp lệ như định danh (quoteProps:
  // as-needed), viết sẵn khớp luôn để không cần chạy `prettier --write` sau khi sinh.
  // Năm trường mở rộng là TUỲ CHỌN: trường nào mã này không dựng được thì không in dòng nào cả,
  // chứ không in `undefined` hay 0 — xem docblock `Fundamentals` trong `src/data/types.ts`.
  const optionalRow = (f, key) => (f[key] === undefined ? '' : `\n    ${key}: ${String(f[key])},`);

  const fundamentalRows = entries.map(
    ([ticker, { fundamentals: f }]) => `  ${ticker}: {
    eps: ${String(f.eps)},
    bookValuePerShare: ${String(f.bookValuePerShare)},
    sharesOutstanding: ${String(f.sharesOutstanding)},
    dividendPerShare: ${String(f.dividendPerShare)},
    netIncome: ${String(f.netIncome)},
    equity: ${String(f.equity)},
    period: ${quote(f.period)},${optionalRow(f, 'revenue')}${optionalRow(f, 'totalLiabilities')}${optionalRow(f, 'totalAssets')}${optionalRow(f, 'marketCap')}${optionalRow(f, 'pe')}
  },`,
  );

  const metaRows = entries.map(
    ([ticker, { meta }]) => `  ${ticker}: {
    name: ${quote(meta.name)},
    industry: ${quote(meta.industry)},
    priceVnd: ${String(meta.priceVnd)},
  },`,
  );

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
 * Năm trường cuối là TUỲ CHỌN, mã nào không dựng được thì vắng dòng. \`revenue\` là doanh thu
 * **12 tháng gần nhất** (cộng 4 quý \`dt_q*\` liền nhau, cùng phép với \`netIncome\`).
 * \`marketCap\` và \`pe\` đọc thẳng field \`vonhoa\`/\`pe\`. \`totalLiabilities\` SUY RA
 * (\`noVCSH × equity\`) và \`totalAssets\` SUY RA (\`equity + totalLiabilities\`) — chúng KHÔNG
 * phải dòng đọc thẳng từ bảng cân đối; xem docblock \`Fundamentals\` trong \`./types\`.
 *
 * \`LIVE_TICKER_META.priceVnd\` là **thị giá thật** của phiên gần nhất lúc sinh file. Chuỗi giá
 * trong \`samples.ts\` vẫn tự dựng (Finbox không có lịch sử dài) nhưng được neo vào con số này ở
 * phiên cuối, nên công thức ăn \`price\` nhận đúng thị giá — xem \`makeBars()\`.
 *
 * Lấy lúc: ${fetchedAt}
 */

import type { Fundamentals } from './types';

export const LIVE_FUNDAMENTALS_FETCHED_AT = ${quote(fetchedAt)};

export const LIVE_FUNDAMENTALS: Readonly<Record<string, Fundamentals>> = {
${fundamentalRows.join('\n')}
};

/** Tên, ngành và thị giá phiên gần nhất — phần KHÔNG thuộc báo cáo tài chính. */
export interface LiveTickerMeta {
  /** Tên thương hiệu ngắn, ví dụ 'Vietcombank'. */
  name: string;
  /** Ngành theo phân loại Finbox, ví dụ 'Ngân hàng'. Chuỗi rỗng khi API không trả. */
  industry: string;
  /** Thị giá phiên gần nhất lúc sinh file, đơn vị ₫. */
  priceVnd: number;
}

export const LIVE_TICKER_META: Readonly<Record<string, LiveTickerMeta>> = {
${metaRows.join('\n')}
};
`;
}

const entries = [];
const skipped = [];

for (const ticker of TICKERS) {
  process.stdout.write(`Đang lấy ${ticker}... `);
  const main = await fetchTickerDetail(ticker);
  try {
    entries.push([
      ticker,
      { fundamentals: buildFundamentals(ticker, main), meta: buildMeta(ticker, main) },
    ]);
    console.log('xong');
  } catch (error) {
    // Lệch đơn vị là lỗi của script, không phải của mã — để nó nổ lên và dừng cả lượt chạy.
    if (!(error instanceof SkipTicker)) throw error;
    skipped.push(error.message);
    console.log('BỎ QUA');
  }
}

if (skipped.length > 0) {
  console.log(`\nBỏ qua ${String(skipped.length)} mã:`);
  for (const line of skipped) console.log(`  · ${line}`);
}

const missing = REQUIRED.filter((code) => !entries.some(([ticker]) => ticker === code));
if (missing.length > 0) {
  throw new Error(
    `Mất mã WF-10 bắt buộc: ${missing.join(', ')} — dừng, không ghi file. ` +
      `Bốn mã này bị ghim trong provider.test.ts và charts.test.tsx.`,
  );
}

const fetchedAt = new Date().toISOString();
writeFileSync(TARGET, render(entries, fetchedAt), 'utf8');
console.log(`\nĐã ghi ${String(entries.length)} mã vào ${TARGET}`);
