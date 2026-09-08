/**
 * Tầng DATA — bộ số liệu mẫu (gói WBS 2.5.1).
 *
 * ⚠ ĐƯỜNG ĐI CỦA GIÁ VẪN TỰ DỰNG, NHƯNG ĐIỂM CUỐI LÀ GIÁ THẬT. Số liệu cơ bản (EPS, giá trị sổ
 * sách, số CP, lợi nhuận ròng, cổ tức) đọc từ `LIVE_FUNDAMENTALS`, và thị giá phiên gần nhất đọc
 * từ `LIVE_TICKER_META.priceVnd` — cả hai sinh từ API thật của Finbox_v2
 * (`npm run gen:live-fundamentals`). Phần còn tự dựng là 247 phiên TRƯỚC phiên cuối: Finbox_v2
 * không có lịch sử giá dài (tối đa 10-21 phiên, đã xác nhận), nên `Preset` vẫn giữ
 * `isDraft: true`.
 *
 * Trước đợt "4 mã mẫu trùng thông số", giá mở chuỗi là con số VIẾT TAY ngay trong file này (FPT
 * 92.000 ₫). Nghĩa là mọi công thức ăn `price` — P/E, P/B, vốn hoá, tỷ suất cổ tức, phí, thuế —
 * đều chạy trên một mức giá bịa, trong khi EPS bên cạnh nó là số thật. Nay chuỗi được NEO vào
 * thị giá thật ở phiên cuối, nên hai vế của cùng một tỷ số nói cùng một chuyện.
 *
 * ── Vì sao một KHO mã chứ không còn 4 ──────────────────────────────────────────────────────
 *
 * Sheet "Nạp mẫu" bày đúng 4 mã cho cả 111 công thức, và bốn dòng ấy đọc y hệt nhau vì dòng mô tả
 * chỉ ghi NGUỒN (`BCTC Q2/2026 · 248 phiên giá`), không ghi con số nào của mã. Bản sửa cho mỗi
 * công thức tự chọn 4 mã cho ra 4 kết quả TRẢI RỘNG (`preset-pick.ts`) — phép chọn ấy cần một kho
 * rộng hơn 4 mới có gì để chọn. Bốn mã WF-10 đứng đầu danh sách và vẫn là bộ dự phòng khi công
 * thức không ăn số liệu của mã nào.
 *
 * `equity` (vốn chủ sở hữu) vẫn SUY RA bằng `bookValuePerShare × sharesOutstanding` — Finbox_v2
 * không có field vốn chủ sở hữu tuyệt đối, xem docblock `scripts/gen-live-fundamentals.mjs`.
 *
 * SRS ghi giả định A1 và rủi ro R-01: Finbox sẽ cấp bộ số liệu mẫu — nay đã đúng một phần
 * (fundamentals), còn chuỗi giá dài hạn theo mã và VN-Index thì API Finbox_v2 không có (đã xác
 * nhận: tối đa 10-21 phiên, không đủ cho SMA/RSI/Bollinger/MACD hay hồi quy Beta) — xem
 * `src/core/formulas/README.md` mục "Còn thiếu" và `TASK.md`.
 *
 * `VN_INDEX_BARS` ở cuối file là chuỗi chỉ số, không phải một `Preset` — nó không đi qua
 * PresetSheet, chỉ nạp thẳng vào `ctx.marketSeries` cho công thức Beta. Vẫn PRNG bịa như cũ.
 *
 * Chuỗi giá sinh bằng bước ngẫu nhiên CÓ HẠT GIỐNG cố định, không dùng Math.random: bản build
 * là HTML tĩnh nên số liệu phải giống hệt nhau giữa lúc build và lúc chạy, nếu không sẽ lệch
 * hydration. Cùng lý do với việc `resolveConstant()` bắt buộc nhận `asOf` (NFR-REL-03).
 */

import {
  LIVE_FUNDAMENTALS,
  LIVE_FUNDAMENTALS_FETCHED_AT,
  LIVE_TICKER_META,
} from './live-fundamentals.generated';
import { PRESET_CONTRACT_VERSION } from './types';
import type { DailyBar, Fundamentals, Preset } from './types';

/** Phiên gần nhất của bộ mẫu. Cố định, không lấy ngày hệ thống. */
const LAST_SESSION = '2025-12-31';

/** Đúng số phiên mà WF-10 ghi trên dòng mô tả nguồn. */
const SESSION_COUNT = 248;

/**
 * Bộ sinh số giả ngẫu nhiên mulberry32 — nhỏ, xác định, đủ tốt để vẽ một đường giá trông thật.
 * Cùng hạt giống luôn cho cùng chuỗi.
 */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hạt giống suy từ mã cổ phiếu, để mỗi mã một đường giá riêng mà vẫn xác định. */
function seedOf(code: string): number {
  let hash = 2166136261;
  for (const char of code) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** `count` ngày giao dịch tính ngược từ `lastIso`, bỏ thứ Bảy và Chủ nhật. Cũ nhất đứng trước. */
function tradingDays(lastIso: string, count: number): string[] {
  const days: string[] = [];
  const cursor = new Date(`${lastIso}T00:00:00Z`);

  while (days.length < count) {
    const weekday = cursor.getUTCDay();
    if (weekday !== 0 && weekday !== 6) days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return days.reverse();
}

/**
 * Dãy ngày dùng chung cho mọi mã — tính đúng MỘT lần.
 *
 * Mọi preset có cùng phiên cuối và cùng số phiên, nên 24 lần gọi `tradingDays()` cho ra 24 mảng
 * giống hệt nhau. Dùng chung một mảng thì 24 × 248 chuỗi ngày rút còn 248, và chúng bất biến nên
 * chia sẻ tham chiếu là an toàn.
 */
const SESSION_DATES: ReadonlyArray<string> = tradingDays(LAST_SESSION, SESSION_COUNT);

/**
 * Sinh chuỗi phiên giá KẾT THÚC đúng ở `lastPrice`.
 *
 * Biên độ mỗi phiên giữ trong khoảng ±3% cho giống cổ phiếu niêm yết HOSE, và giá luôn dương nên
 * không bao giờ tạo ra ca vô lý cho công thức nào.
 *
 * Neo ở phiên CUỐI chứ không phiên đầu, vì phiên cuối mới là phiên mọi công thức đọc: `price`,
 * `endPrice`, `sellPrice` đều lấy `bars[bars.length - 1].close` (xem `preset-inputs.ts`). Neo đầu
 * chuỗi thì con số thật trôi qua 247 bước ngẫu nhiên rồi mới tới chỗ dùng, tức lại là giá bịa.
 *
 * Cách neo: dựng chuỗi như cũ rồi nhân cả chuỗi cho tỉ lệ `lastPrice / close cuối`. Nhân đều giữ
 * nguyên HÌNH chuỗi (biên độ theo phần trăm không đổi), khác hẳn việc cộng bù — cộng bù làm biên
 * độ tương đối của những phiên giá thấp phình lên.
 */
function makeBars(code: string, lastPrice: number): DailyBar[] {
  const random = seededRandom(seedOf(code));

  let close = lastPrice;
  const raw = SESSION_DATES.map((date) => {
    const drift = (random() - 0.49) * 0.03;
    const open = close;
    close = Math.max(1_000, close * (1 + drift));

    return {
      date,
      open,
      close,
      high: Math.max(open, close) * (1 + random() * 0.012),
      low: Math.min(open, close) * (1 - random() * 0.012),
      volume: Math.round(500_000 + random() * 3_500_000),
    };
  });

  const drifted = raw[raw.length - 1]?.close ?? lastPrice;
  const factor = drifted > 0 ? lastPrice / drifted : 1;

  return raw.map((bar, index) => ({
    date: bar.date,
    open: round(bar.open * factor),
    // Phiên cuối lấy ĐÚNG con số thật, không qua `round()`: thị giá đã là bội số 10 sẵn, nhưng
    // để phép làm tròn quyết định thì một ngày nào đó giá lẻ sẽ lệch khỏi con số API trả về.
    close: index === raw.length - 1 ? lastPrice : round(bar.close * factor),
    high: round(bar.high * factor),
    low: round(bar.low * factor),
    volume: bar.volume,
  }));
}

/** Giá cổ phiếu Việt Nam yết theo bội số 10 ₫ ở phần lớn khoảng giá. */
function round(value: number): number {
  return Math.round(value / 10) * 10;
}

/** Tra một mã trong file sinh, báo lỗi rõ ràng thay vì âm thầm để `undefined` lọt vào Preset. */
function liveEntry(code: string): {
  fundamentals: Fundamentals;
  name: string;
  industry: string;
  priceVnd: number;
} {
  const fundamentals = LIVE_FUNDAMENTALS[code];
  const meta = LIVE_TICKER_META[code];
  if (fundamentals === undefined || meta === undefined) {
    throw new Error(
      `Thiếu số liệu thật cho mã ${code} trong live-fundamentals.generated.ts — chạy lại ` +
        `\`npm run gen:live-fundamentals\`.`,
    );
  }
  return { fundamentals, ...meta };
}

function preset(code: string): Preset {
  const { fundamentals, name, industry, priceVnd } = liveEntry(code);

  return {
    version: PRESET_CONTRACT_VERSION,
    code,
    name,
    industry: industry === '' ? undefined : industry,
    meta: `${fundamentals.period} · ${SESSION_COUNT} phiên giá`,
    fundamentals,
    bars: makeBars(code, priceVnd),
    // Đường đi của giá vẫn PRNG — xem docblock đầu file — nên chưa đặt false ở đây được, dù
    // fundamentals và thị giá phiên cuối đều là số thật từ Finbox_v2.
    isDraft: true,
    fundamentalsAsOf: LIVE_FUNDAMENTALS_FETCHED_AT,
  };
}

/**
 * Bốn mã WF-10 — bộ mặc định khi công thức không ăn số liệu của mã nào, nên phép chọn theo công
 * thức không có gì để xếp hạng. Cũng là bộ bị ghim trong `provider.test.ts` và `charts.test.tsx`,
 * và là bộ mà `gen-live-fundamentals.mjs` bắt buộc phải lấy được.
 */
export const WF10_CODES: ReadonlyArray<string> = ['FPT', 'HPG', 'VNM', 'MWG'];

/**
 * Kho mã mẫu — bốn mã WF-10 đứng trước, phần còn lại theo thứ tự file sinh (đã xếp theo ngành).
 *
 * Danh sách mã do `scripts/gen-live-fundamentals.mjs` quyết định, không viết tay ở đây: một mã bị
 * bỏ vì thiếu dữ liệu (xem docblock script) thì file này tự hụt theo, không để lại một dòng gọi
 * `preset('XYZ')` nổ lúc dựng module.
 */
export const SAMPLE_PRESETS: ReadonlyArray<Preset> = [
  ...WF10_CODES,
  ...Object.keys(LIVE_TICKER_META).filter((code) => !WF10_CODES.includes(code)),
].map(preset);

/**
 * Chuỗi phiên VN-Index — CỐ ĐỊNH, không phải một mã để tìm hay chọn qua PresetSheet.
 *
 * Dùng riêng cho công thức Beta (`ctx.marketSeries`, xem docblock ở `calc/types.ts`): hồi quy
 * lợi suất cổ phiếu theo lợi suất thị trường cần một chuỗi CHỈ SỐ, không phải một mã cổ phiếu.
 * Cùng cách dựng và vẫn PRNG bịa như bốn mã ở trên — API Finbox_v2 có VN-Index thật nhưng chỉ
 * ~21 phiên (đã gọi thử, xem TASK.md), không đủ dài để thay chuỗi này.
 *
 * Không có giá thật để neo như các mã cổ phiếu (Finbox_v2 chỉ trả chỉ số theo phiên, không có
 * mức đóng cửa lịch sử), nên tham số dưới đây là điểm cuối GIẢ ĐỊNH chứ không phải số thật.
 *
 * Đã biết và cố ý CHƯA vá: các mã cổ phiếu và chuỗi này đều là PRNG ĐỘC LẬP, không có nhân tố
 * thị trường chung — beta tính từ chúng sẽ ra một số gần 0 (đúng về toán, không minh hoạ được
 * một cổ phiếu thật). `spec.tests` của `BETA` dùng chuỗi dựng riêng để minh hoạ đúng ý nghĩa,
 * không dựa vào bộ mẫu này. Xem `src/core/formulas/README.md` mục "Còn thiếu".
 */
export const VN_INDEX_BARS: ReadonlyArray<DailyBar> = makeBars('VNINDEX', 1_250);
