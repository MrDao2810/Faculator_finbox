/**
 * Sinh `src/data/ticker-names-en.generated.ts` — tên TIẾNG ANH của từng mã trong danh sách Finbox.
 *
 * Chạy TAY, cần mạng: `npm run gen:ticker-names-en`. KHÔNG nằm trong `npm test`/`npm run check`/CI,
 * cùng lý do với `gen:live-fundamentals` (phụ thuộc thứ nằm ngoài máy build). File sinh ra là dữ
 * liệu TĨNH: lúc chạy, sản phẩm không gọi thêm máy chủ nào — `connect-src` vẫn chỉ mở
 * `dcs.finbox.vn`.
 *
 * ── Vì sao có file này (05/11/2026) ─────────────────────────────────────────────────────────
 *
 * Chủ dự án chuyển sang tiếng Anh, mở "Load a sample dataset" và "Pick a ticker", thấy tên doanh
 * nghiệp vẫn là "Vàng Bạc Đá quý Phú Nhuận", "Thủy sản Mekong": _"tại sao chuyển sang tiếng anh mà
 * vẫn còn tiếng việt, lỗi nghiêm trọng"_. Trước đó CLAUDE.md ghi tên doanh nghiệp là thứ CỐ Ý để
 * tiếng Việt ở chế độ EN ("source data, like proper nouns") — điều ấy bị đảo.
 *
 * Finbox chỉ có tên tiếng Việt: đã gọi thử cả ba endpoint `/bp/codes`, `/data/symbols`,
 * `/v1/getTickerDetail` — không trường nào là tên tiếng Anh. Nguồn có tên tiếng Anh do chính doanh
 * nghiệp đăng ký là API mã chứng khoán của VNDirect (`api-finfo.vndirect.com.vn/v4/stocks`, không
 * cần token), nguồn dự án đã dùng cho chuỗi giá ví dụ (`market-series-2026.ts`). Trường
 * `shortNameEng` là tên ngắn ("Phu Nhuan Jewelry", "Mekong Fisheries", "DABACO").
 *
 * ── Chọn tên, theo thứ tự ──────────────────────────────────────────────────────────────────
 *
 * 0. Tên Finbox KHÔNG mang dấu ("Sacombank", "FPT Corp", các quỹ ETF) là tên thương hiệu sẵn: giữ
 *    nguyên, không ghi vào file. Thay bằng tên VNDirect chỉ thêm rủi ro: STB thành "Saigon
 *    Treasure Bank".
 * 1. `TEN_VIET_TAY` dưới đây — danh sách ngắn, mỗi dòng có lý do.
 * 2. `shortNameEng` của VNDirect, nếu có và không mang dấu tiếng Việt.
 * 3. `companyNameEng` (tên đầy đủ), bỏ đuôi pháp lý "Joint Stock Company"… cho ngắn như bậc 2.
 * 4. Không nguồn nào có tên tiếng Anh: tên Finbox BỎ DẤU, bỏ tiền tố "Công ty Cổ phần". Đó là cách
 *    báo quốc tế viết tên riêng Việt Nam khi doanh nghiệp không đăng ký tên tiếng Anh. Cụm từ (không
 *    phải tên riêng) rơi vào bậc này thì phải thêm vào `TEN_VIET_TAY`.
 *
 * Không ai đọc lại được 1.500 tên tự động. Tên VNDirect là tên doanh nghiệp tự đăng ký, nhưng có
 * dòng sai (AAH); gặp thì thêm vào `TEN_VIET_TAY` rồi sinh lại.
 */

import * as prettier from 'prettier';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'src/data/ticker-names-en.generated.ts');

const FINBOX = 'https://dcs.finbox.vn';
const VND = 'https://api-finfo.vndirect.com.vn/v4/stocks';
const FIELDS = 'code,type,status,shortNameEng,companyNameEng';
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (faculator-finbox gen-ticker-names-en)' };

async function getJson(url) {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`${url} trả HTTP ${response.status}`);
  return response.json();
}

/** Dấu tiếng Việt, kể cả đ — tên tiếng Anh mà còn chúng thì không phải tên tiếng Anh. */
const CO_DAU = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

function boDau(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const DUOI_PHAP_LY =
  /[\s,.\-–]*\b(joint[\s-]+stock[\s-]+(company|corporation|commercial bank)|jsc|corporation|company limited|co\.?,? ?ltd\.?)\.?\s*$/i;

/**
 * Tên viết tay, ĐẶT TRƯỚC mọi nguồn. Chỉ hai loại mã được vào đây:
 *
 * · Mã không nguồn nào có tên tiếng Anh, mà tên Finbox là CỤM TỪ chứ không phải tên riêng — bỏ dấu
 *   "Xuất Nhập Khẩu Vĩnh Long" chỉ ra "Xuat Nhap Khau Vinh Long", vẫn là tiếng Việt.
 * · Mã mà tên VNDirect sai rõ, hoặc cụt sau khi bỏ đuôi pháp lý: G36 "Tổng Công ty 36" thành "36";
 * AAH "Hợp Nhất" (tên riêng) thành
 *   "Continued JSC".
 * · Mã mà tên NGẮN tiếng Anh của VNDirect sai chính tả trong khi tên ĐẦY ĐỦ đúng (06/11/2026): lấy
 *   theo tên đầy đủ, bỏ đuôi pháp lý — DHT "Ha Tay Pharmac", DP2 và MED "…Phama", UMC "Urband",
 *   VNY "Vererinary".
 *
 * Tên riêng (người, địa danh, thương hiệu) giữ nguyên, chỉ bỏ dấu.
 */
const TEN_VIET_TAY = {
  AAH: 'Hop Nhat',
  DHT: 'Ha Tay Pharmaceutical',
  DP2: 'Central Pharmaceutical No. 2',
  MED: 'Mediplantex National Pharmaceutical',
  UMC: 'Nam Dinh Urban Construction Management',
  VNY: 'Vietnam Veterinary Products',
  FUEVCDIV: 'ETF VCAM GROWTH VNDIVIDEND',
  G36: 'Corporation 36',
  HHI: 'Hoang Hac',
  HWI: 'Hanoi Clean Water Infrastructure',
  ICL: 'Vinh Long Import Export',
  LTQ: 'Nguyen Van Troi Forestry',
  MDD: 'Mai Dong',
  MT7: 'Minh Thanh',
  SMV: 'Seoul Metal Vietnam',
  VLS: 'Viet Long Steel',
  VUG: 'Viet Uc Seafood',
};

function gonTen(text) {
  const sach = text.replace(/\s+/g, ' ').trim();
  const gon = sach.replace(DUOI_PHAP_LY, '').trim();
  return gon === '' ? sach : gon;
}

function tenTiengAnh(record) {
  const ngan = record?.shortNameEng?.replace(/\s+/g, ' ').trim();
  // Đuôi pháp lý ("HYCO4 - JSC") bỏ cả ở tên ngắn: nó không giúp nhận ra doanh nghiệp, và gạch nối đứng sát số
  // là dạng `i18n.test.ts` cấm (đọc thành phép trừ).
  if (ngan && !CO_DAU.test(ngan)) return { ten: gonTen(ngan), bac: 1 };
  const dai = record?.companyNameEng?.trim();
  if (dai && !CO_DAU.test(dai)) return { ten: gonTen(dai), bac: 2 };
  return null;
}

async function main() {
  const finbox = await getJson(`${FINBOX}/bp/codes`);
  /* Cùng luật lọc với `parseTickerList()` (`src/data/finbox/map.ts`): chỉ số và tên ngành có `code === name`. */
  const ma = finbox
    .filter((r) => typeof r.code === 'string' && typeof r.name === 'string' && r.code !== r.name)
    .map((r) => ({ code: r.code.trim().toUpperCase(), name: r.name.trim() }))
    .filter((r) => r.code !== '' && r.name !== '');

  const ban = new Map();
  const nhan = (rows) => {
    for (const r of rows) {
      const code = String(r.code ?? '').toUpperCase();
      const cu = ban.get(code);
      // Bản ghi đang niêm yết thắng bản ghi đã huỷ niêm yết cùng mã.
      if (cu === undefined || (tenTiengAnh(cu) === null && tenTiengAnh(r) !== null))
        ban.set(code, r);
    }
  };

  const niemYet = await getJson(
    `${VND}?q=type:STOCK,ETF,IFC~status:listed&size=5000&fields=${FIELDS}`,
  );
  nhan(niemYet.data ?? []);

  /* Mã Finbox còn thiếu: hỏi đích danh từng nhóm, không lọc trạng thái. */
  const thieu = ma.filter((r) => tenTiengAnh(ban.get(r.code)) === null).map((r) => r.code);
  for (let i = 0; i < thieu.length; i += 40) {
    const nhom = thieu.slice(i, i + 40);
    const body = await getJson(`${VND}?q=code:${nhom.join(',')}&size=200&fields=${FIELDS}`);
    nhan(body.data ?? []);
  }

  const dem = { 1: 0, 2: 0, 3: 0, tay: 0, trung: 0 };
  const dong = [];
  for (const { code, name } of [...ma].sort((a, b) => a.code.localeCompare(b.code))) {
    // Tên Finbox không mang dấu là tên thương hiệu sẵn ('Sacombank', 'FPT Corp', các quỹ ETF):
    // giữ nguyên. Lấy tên VNDirect thay vào chỉ thêm rủi ro — STB thành 'Saigon Treasure Bank'.
    if (!CO_DAU.test(name)) {
      dem.trung += 1;
      continue;
    }
    const tay = TEN_VIET_TAY[code];
    const tim = tay === undefined ? tenTiengAnh(ban.get(code)) : null;
    const ten = tay ?? tim?.ten ?? boDau(name.replace(/^(công ty cổ phần|ctcp)\s+/i, ''));
    dem[tay !== undefined ? 'tay' : (tim?.bac ?? 3)] += 1;
    if (ten === name) {
      dem.trung += 1;
      continue;
    }
    dong.push(`  ${JSON.stringify(code)}: ${JSON.stringify(ten)},`);
  }

  const fetchedAt = new Date().toISOString();
  const noiDung = `/**
 * FILE SINH TỰ ĐỘNG — đừng sửa tay. Sinh lại bằng \`npm run gen:ticker-names-en\` (cần mạng).
 *
 * Tên tiếng Anh của từng mã Finbox, cho chế độ EN. Nguồn và thứ tự chọn tên: xem docblock của
 * \`scripts/gen-ticker-names-en.mjs\`. Lần sinh này, ${ma.length} mã: ${dem.trung} giữ tên Finbox (không
 * dấu, hoặc tên tiếng Anh trùng), ${dem.tay} tên viết tay, ${dem[1]} tên ngắn tiếng Anh của VNDirect,
 * ${dem[2]} tên đầy đủ tiếng Anh, ${dem[3]} không có tên tiếng Anh ở nguồn nào nên in tên bỏ dấu.
 * Mã giữ tên Finbox không có dòng dưới đây.
 *
 * Chỉ nạp cùng từ điển tiếng Anh (\`loadLocale('en')\`), không nằm trong gói JS của người dùng
 * tiếng Việt.
 */

export const TICKER_NAMES_EN_FETCHED_AT = ${JSON.stringify(fetchedAt)};

export const TICKER_NAMES_EN: Readonly<Record<string, string>> = {
${dong.join('\n')}
};
`;
  // Định dạng ngay bằng prettier của repo: file không nằm trong `.prettierignore`, và hook lint-staged sẽ
  // định dạng lại lúc commit — để nguyên dạng JSON là lần sinh sau lệch với bản đã commit.
  const cauHinh = (await prettier.resolveConfig(OUT)) ?? {};
  writeFileSync(OUT, await prettier.format(noiDung, { ...cauHinh, filepath: OUT }));
  console.log(
    `Đã ghi ${OUT}: ${dong.length} mã (bậc 1: ${dem[1]}, bậc 2: ${dem[2]}, viết tay: ${dem.tay}, bỏ dấu: ${dem[3]}, giữ tên Finbox: ${dem.trung}).`,
  );
}

await main();
