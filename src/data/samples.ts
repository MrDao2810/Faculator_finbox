/**
 * Tầng DATA — bộ số liệu mẫu (gói WBS 2.5.1).
 *
 * ⚠ CHUỖI GIÁ VẪN TỰ DỰNG — KHÔNG PHẢI GIÁ THẬT. Số liệu cơ bản (EPS, giá trị sổ sách, số CP,
 * lợi nhuận ròng, cổ tức) từ nay đọc từ `LIVE_FUNDAMENTALS` (`live-fundamentals.generated.ts`,
 * sinh từ API thật của Finbox_v2 — `npm run gen:live-fundamentals`). Vì chuỗi giá `bars` vẫn là
 * PRNG bịa, cả `Preset` vẫn giữ `isDraft: true`: chưa thể coi là "đã đối chiếu báo cáo thật"
 * trọn vẹn khi phần giá trong cùng preset còn là số tự dựng.
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

import { LIVE_FUNDAMENTALS, LIVE_FUNDAMENTALS_FETCHED_AT } from './live-fundamentals.generated';
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
 * Sinh chuỗi phiên giá quanh mức `basePrice`.
 * Biên độ mỗi phiên giữ trong khoảng ±3% cho giống cổ phiếu niêm yết HOSE, và giá luôn dương
 * nên không bao giờ tạo ra ca vô lý cho công thức nào.
 */
function makeBars(code: string, basePrice: number): DailyBar[] {
  const random = seededRandom(seedOf(code));
  const dates = tradingDays(LAST_SESSION, SESSION_COUNT);

  let close = basePrice;
  return dates.map((date) => {
    const drift = (random() - 0.49) * 0.03;
    const open = round(close);
    close = Math.max(1_000, round(close * (1 + drift)));

    const high = round(Math.max(open, close) * (1 + random() * 0.012));
    const low = round(Math.min(open, close) * (1 - random() * 0.012));
    const volume = Math.round(500_000 + random() * 3_500_000);

    return { date, open, high, low, close, volume };
  });
}

/** Giá cổ phiếu Việt Nam yết theo bội số 10 ₫ ở phần lớn khoảng giá. */
function round(value: number): number {
  return Math.round(value / 10) * 10;
}

function preset(code: string, name: string, basePrice: number, fundamentals: Fundamentals): Preset {
  return {
    version: PRESET_CONTRACT_VERSION,
    code,
    name,
    meta: `${fundamentals.period} · ${SESSION_COUNT} phiên giá`,
    fundamentals,
    bars: makeBars(code, basePrice),
    // Chuỗi giá (bars) vẫn PRNG bịa — xem docblock đầu file — nên chưa đặt false ở đây được,
    // dù fundamentals bên dưới đã là số thật từ Finbox_v2.
    isDraft: true,
    fundamentalsAsOf: LIVE_FUNDAMENTALS_FETCHED_AT,
  };
}

/** Tra `LIVE_FUNDAMENTALS`, báo lỗi rõ ràng thay vì âm thầm để `undefined` lọt vào Preset. */
function liveFundamentals(code: string): Fundamentals {
  const found = LIVE_FUNDAMENTALS[code];
  if (found === undefined) {
    throw new Error(
      `Thiếu số liệu thật cho mã ${code} trong live-fundamentals.generated.ts — chạy lại ` +
        `\`npm run gen:live-fundamentals\`.`,
    );
  }
  return found;
}

/** Bốn mã của WF-10 — fundamentals đọc từ `LIVE_FUNDAMENTALS` (số thật, Finbox_v2). */
export const SAMPLE_PRESETS: ReadonlyArray<Preset> = [
  preset('FPT', 'FPT Corporation', 92_000, liveFundamentals('FPT')),
  preset('HPG', 'Tập đoàn Hoà Phát', 25_400, liveFundamentals('HPG')),
  preset('VNM', 'Vinamilk', 64_000, liveFundamentals('VNM')),
  preset('MWG', 'Thế Giới Di Động', 52_000, liveFundamentals('MWG')),
];

/**
 * Chuỗi phiên VN-Index — CỐ ĐỊNH, không phải một mã để tìm hay chọn qua PresetSheet.
 *
 * Dùng riêng cho công thức Beta (`ctx.marketSeries`, xem docblock ở `calc/types.ts`): hồi quy
 * lợi suất cổ phiếu theo lợi suất thị trường cần một chuỗi CHỈ SỐ, không phải một mã cổ phiếu.
 * Cùng cách dựng và vẫn PRNG bịa như bốn mã ở trên — API Finbox_v2 có VN-Index thật nhưng chỉ
 * ~21 phiên (đã gọi thử, xem TASK.md), không đủ dài để thay chuỗi này.
 *
 * Đã biết và cố ý CHƯA vá: bốn mã cổ phiếu và chuỗi này đều là PRNG ĐỘC LẬP, không có nhân tố
 * thị trường chung — beta tính từ chúng sẽ ra một số gần 0 (đúng về toán, không minh hoạ được
 * một cổ phiếu thật). `spec.tests` của `BETA` dùng chuỗi dựng riêng để minh hoạ đúng ý nghĩa,
 * không dựa vào bộ mẫu này. Xem `src/core/formulas/README.md` mục "Còn thiếu".
 */
export const VN_INDEX_BARS: ReadonlyArray<DailyBar> = makeBars('VNINDEX', 1_250);
