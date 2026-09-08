/**
 * Phép đọc chuỗi theo QUÝ của Finbox_v2, dùng chung cho các script sinh.
 *
 * Tách ra đây khi `gen-ticker-coverage.mjs` ra đời: nó cần đúng luật mà
 * `gen-live-fundamentals.mjs` đã chạy đúng cho 27 mã, và chép sang một bản thứ ba là mở đường cho
 * ba bản trôi khỏi nhau ở chỗ khó thấy nhất. Hiện có hai bản và đó đã là giới hạn chấp nhận được:
 * bản TypeScript `src/data/finbox/map.ts` (chạy lúc người dùng mở trang) và bản `.mjs` này (chạy
 * lúc build, vì Node trần không import được TypeScript). `map.test.ts` giữ hai bản khớp nhau.
 *
 * ── Hai hình dạng phản hồi, một hàm đọc ─────────────────────────────────────────────────────
 *
 * `POST /v1/getTickerDetail` gói chuỗi theo kỳ vào object con `dynamic`; `POST /data/symbols` trải
 * phẳng chúng ngay trên bản ghi (đã đo: `typeof record.dynamic === 'undefined'` ở endpoint thứ
 * hai). `periodicOf()` che khác biệt ấy đi, đúng vai `periodicNumber()` bên `map.ts`.
 */

/** Nơi chứa các khoá theo kỳ, bất kể phản hồi đến từ endpoint nào. */
export function periodicOf(record) {
  const nested = record.dynamic;
  return typeof nested === 'object' && nested !== null && !Array.isArray(nested) ? nested : record;
}

/**
 * Các quý có số trong `{prefix}q{quý}/{năm}`, MỚI NHẤT TRƯỚC. Đơn vị tỷ ₫.
 *
 * `prefix` là `'ln_'` (lợi nhuận) hoặc `'dt_'` (doanh thu): API bày cả hai theo đúng một khuôn tên
 * và đúng một thang đơn vị, nên cùng một phép cộng TTM chạy được cho cả hai.
 *
 * KHÔNG dùng `{prefix}y{năm}`: với năm chưa kết thúc thì đó là luỹ kế từ đầu năm. Đo trên MWG,
 * `ln_y2026 = 6017` trong khi 12 tháng gần nhất là 9.856,5 — lệch 63%.
 */
export function latestQuarters(periodic, prefix) {
  const re = new RegExp(`^${prefix}q(\\d)\\/(\\d{4})$`);
  return Object.keys(periodic)
    .map((key) => {
      const m = re.exec(key);
      if (m === null) return undefined;
      const value = periodic[key];
      if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
      return { rank: Number(m[2]) * 4 + Number(m[1]), value };
    })
    .filter((entry) => entry !== undefined)
    .sort((a, b) => b.rank - a.rank);
}

/**
 * Tổng 12 tháng gần nhất — cộng 4 quý gần nhất, và bốn quý phải LIỀN NHAU.
 *
 * Chuỗi thủng một kỳ vẫn "đủ bốn cái" nhưng tổng khi ấy trải rộng hơn 12 tháng nên không còn là
 * TTM — đo ngày 25/08/2026 có 13 trên 941 bản ghi thủng như vậy, có mã nhảy thẳng từ Q2/2025 về
 * Q3/2017. `rank` đếm theo kỳ, nên liền nhau nghĩa là hiệu đúng bằng 3.
 */
export function trailingTwelveMonths(quarters) {
  const newest = quarters[0];
  const oldest = quarters[3];
  if (newest === undefined || oldest === undefined) return undefined;
  if (newest.rank - oldest.rank !== 3) return undefined;

  return quarters.slice(0, 4).reduce((sum, entry) => sum + entry.value, 0);
}

/**
 * Hai quý ta chọn có khớp `{prefix}quygannhat` / `{prefix}quygannhi` do API tự công bố không.
 *
 * Đây là phép đối chiếu thay cho "TTM phải sinh lại đúng EPS" — phép cũ loại nhầm 268/1.005 mã vì
 * so hai đại lượng khác nhau (số CP bình quân gia quyền, lợi ích cổ đông thiểu số, pha loãng). Lý
 * do đầy đủ ở docblock `src/data/finbox/map.ts`.
 *
 * Ngưỡng là SAI SỐ TUYỆT ĐỐI 0,05 tỷ ₫: cả hai vế đều đã được API làm tròn tới một chữ số thập
 * phân, nên chênh lệch hợp lệ duy nhất là chênh lệch làm tròn.
 *
 * Thiếu trường để so thì coi như ĐẠT — 27 trên 1.005 bản ghi rơi vào ca này.
 */
export function quartersAgree(periodic, quarters, prefix) {
  const EPSILON = 0.05;
  return [periodic[`${prefix}quygannhat`], periodic[`${prefix}quygannhi`]].every((value, index) => {
    const picked = quarters[index];
    if (typeof value !== 'number' || !Number.isFinite(value) || picked === undefined) return true;
    return Math.abs(picked.value - value) <= EPSILON;
  });
}

/** Sai số tương đối trong ngưỡng hay không. Không có số để so thì coi như đạt. */
export function withinTolerance(computed, expected, tolerance = 0.01) {
  if (typeof expected !== 'number' || !Number.isFinite(expected) || expected === 0) return true;
  return Math.abs(computed - expected) / Math.abs(expected) <= tolerance;
}

/** Số dùng được, hay là chỗ trống mà API trả về bằng `null`/`0`/thiếu hẳn. */
export function usableNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value !== 0;
}
