/**
 * Tầng DATA — bộ số liệu mẫu (gói WBS 2.5.1).
 *
 * ⚠ SỐ LIỆU TỰ DỰNG — KHÔNG PHẢI BÁO CÁO TÀI CHÍNH THẬT.
 *
 * SRS ghi giả định A1 và rủi ro R-01: Finbox sẽ cấp bộ số liệu mẫu, và tới giờ vẫn chưa có.
 * Không có dữ liệu thì sheet WF-10 không dựng được, nên đợt này tự dựng một bộ để hoàn thiện
 * đường đi. Con số bên dưới ở mức hợp lý cho thị trường Việt Nam nhưng **do tôi đặt ra**;
 * mọi `Preset` đều mang `isDraft: true` và giao diện bắt buộc nói rõ điều đó với người dùng.
 * Khi có số liệu thật thì thay nội dung file này, không phải sửa chỗ nào khác.
 *
 * Chuỗi giá sinh bằng bước ngẫu nhiên CÓ HẠT GIỐNG cố định, không dùng Math.random: bản build
 * là HTML tĩnh nên số liệu phải giống hệt nhau giữa lúc build và lúc chạy, nếu không sẽ lệch
 * hydration. Cùng lý do với việc `resolveConstant()` bắt buộc nhận `asOf` (NFR-REL-03).
 */

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

/** Số liệu cơ bản của một mã, phần khai bằng tay. `netIncome` và `equity` suy ra sau. */
type PerShare = Omit<Fundamentals, 'netIncome' | 'equity'>;

/**
 * Đổi số trên mỗi cổ phiếu thành khoản mục toàn doanh nghiệp.
 *
 * `eps` và `bookValuePerShare` tính bằng ₫/CP, nhân với số CP ra ₫, chia một tỷ ra **tỷ ₫** —
 * đúng đơn vị mà `numberVar('netIncome', …, 'tỷ ₫')` bên Domain đang chờ.
 *
 * Đây là chỗ đáng nói rõ: hai trường này **suy ra bằng phép nhân, không phải số tôi tự đặt thêm**.
 * Bộ mẫu vốn đã bịa sẵn EPS và BVPS; nhân chúng lên không bịa thêm gì, chỉ nói lại cùng một điều
 * bằng đơn vị khác. Nhờ vậy `roe`, `bvps` và `eps-co-ban` nạp được từ bộ mẫu mà số liệu bản thảo
 * không nở thêm một dòng nào. Các dòng còn lại của báo cáo (doanh thu, tổng tài sản, tài sản ngắn
 * hạn, tồn kho…) thì KHÔNG suy ra được từ đây, nên vẫn để trống chờ số liệu thật của Finbox.
 *
 * Kiểm chứng: FPT với EPS 6.050 ₫ và 1,47 tỷ CP ra 8.893,5 tỷ ₫, khớp mức 8.894 mà
 * `src/core/formulas/fundamentals.ts` đã dựng bộ số kiểm quanh nó.
 */
function wholeCompany(perShare: PerShare): Fundamentals {
  const shares = perShare.sharesOutstanding;
  return {
    ...perShare,
    netIncome: (perShare.eps * shares) / 1_000_000_000,
    equity: (perShare.bookValuePerShare * shares) / 1_000_000_000,
  };
}

function preset(code: string, name: string, basePrice: number, perShare: PerShare): Preset {
  return {
    code,
    name,
    meta: `${perShare.period} · ${SESSION_COUNT} phiên giá`,
    fundamentals: wholeCompany(perShare),
    bars: makeBars(code, basePrice),
    // Không bao giờ đặt false ở đây cho tới khi có người đối chiếu báo cáo thật.
    isDraft: true,
  };
}

/** Bốn mã của WF-10. */
export const SAMPLE_PRESETS: ReadonlyArray<Preset> = [
  preset('FPT', 'FPT Corporation', 92_000, {
    eps: 6_050,
    bookValuePerShare: 24_800,
    sharesOutstanding: 1_470_000_000,
    dividendPerShare: 2_000,
    period: 'BCTC 2025',
  }),
  preset('HPG', 'Tập đoàn Hoà Phát', 25_400, {
    eps: 1_720,
    bookValuePerShare: 17_900,
    sharesOutstanding: 6_390_000_000,
    dividendPerShare: 500,
    period: 'BCTC 2025',
  }),
  preset('VNM', 'Vinamilk', 64_000, {
    eps: 4_310,
    bookValuePerShare: 16_200,
    sharesOutstanding: 2_090_000_000,
    dividendPerShare: 3_850,
    period: 'BCTC 2025',
  }),
  preset('MWG', 'Thế Giới Di Động', 52_000, {
    eps: 2_480,
    bookValuePerShare: 14_600,
    sharesOutstanding: 1_460_000_000,
    dividendPerShare: 500,
    period: 'BCTC 2025',
  }),
];
