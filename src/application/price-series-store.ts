/**
 * Tầng APPLICATION — chỗ cất chuỗi giá (gói WBS 3.3.1).
 *
 * HAI kho, cùng một hình dạng dòng nên ở chung một file: bảng WF-05 mà người dùng chủ động quản
 * (`PRICE_SERIES_KEY`, phần trên), và chuỗi vừa thay tại chỗ ở màn chi tiết
 * (`WORKING_SERIES_KEY`, phần dưới — docblock ở đó nói vì sao chúng phải tách nhau).
 *
 * Cùng khuôn với `recent-searches.ts`: phần thuần nằm ở đây, không import React, nên test được
 * bằng Node; phần chạm kho của trình duyệt do màn gọi trong `useEffect`.
 *
 * NFR-SEC-01 · COM-03: chuỗi giá là dữ liệu người dùng tự nhập, nằm trên máy họ, không gửi
 * đi đâu. Sản phẩm không có backend nên đây không phải lựa chọn — nhưng vẫn phải nói rõ
 * trên màn để người dùng biết dữ liệu của mình đi đâu.
 */

import type { SeriesRow } from '@/core/price-series';

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const PRICE_SERIES_KEY = 'ffb.series.v1';

/**
 * Trần số phiên giữ lại. Beta theo thông lệ cần 60 phiên, một năm giao dịch khoảng 250;
 * 400 đủ rộng cho mọi công thức trong SRS mà vẫn không phình localStorage (giới hạn ~5 MB
 * cho cả tên miền, và bảng này chỉ là một trong nhiều thứ được cất ở đó).
 */
export const MAX_SERIES_ROWS = 400;

/** Chuỗi giá của một mã, kèm mã đang xem để màn biết đang sửa chuỗi của ai. */
export interface StoredSeries {
  /** Mã cổ phiếu viết hoa, ví dụ 'HPG'. Chuỗi rỗng nghĩa là bảng tự nhập, chưa gắn mã nào. */
  code: string;
  rows: ReadonlyArray<SeriesRow>;
}

/** Một ô số đọc từ JSON. Thứ gì không phải số hữu hạn đều thành `null` chứ không thành 0. */
function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Làm sạch mảng dòng đọc lên từ JSON — dùng chung cho cả hai kho chuỗi trong file này.
 *
 * Một chỗ duy nhất biết một dòng hợp lệ trông thế nào: hai bản sao của phép lọc này sẽ lệch nhau
 * đúng vào ngày `SeriesRow` thêm một trường, và kho nào quên trường ấy thì mất dữ liệu lặng lẽ.
 */
function cleanRows(value: unknown): SeriesRow[] {
  if (!Array.isArray(value)) return [];

  const rows: SeriesRow[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;

    rows.push({
      date: typeof record.date === 'string' ? record.date.trim().slice(0, 20) : '',
      open: numberOrNull(record.open),
      high: numberOrNull(record.high),
      low: numberOrNull(record.low),
      close: numberOrNull(record.close),
      volume: numberOrNull(record.volume),
    });

    if (rows.length >= MAX_SERIES_ROWS) break;
  }

  return rows;
}

/**
 * Đọc từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném lỗi: chuỗi hỏng, không phải object, thiếu trường, hay lẫn kiểu lạ đều
 * bị bỏ chứ không làm mất cả bảng. Dữ liệu này nằm trong máy người dùng và có thể do bản cũ
 * ghi ra, nên phải coi mọi thứ đọc lên là không đáng tin.
 */
export function parseStoredSeries(raw: string | null | undefined): StoredSeries {
  const empty: StoredSeries = { code: '', rows: [] };
  if (raw === null || raw === undefined || raw.trim() === '') return empty;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return empty;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return empty;

  const source = parsed as Record<string, unknown>;
  const code = typeof source.code === 'string' ? source.code.trim().toUpperCase().slice(0, 12) : '';

  return { code, rows: cleanRows(source.rows) };
}

/** Chuỗi JSON để ghi vào localStorage. */
export function serializeStoredSeries(series: StoredSeries): string {
  return JSON.stringify({
    code: series.code.trim().toUpperCase().slice(0, 12),
    rows: series.rows.slice(0, MAX_SERIES_ROWS),
  });
}

/**
 * Sửa một ô trong bảng, trả về mảng mới.
 *
 * Chỉ số ngoài phạm vi thì trả nguyên mảng cũ chứ không tạo lỗ trống — bảng luôn liền mạch.
 */
export function updateRow(
  rows: ReadonlyArray<SeriesRow>,
  index: number,
  patch: Partial<SeriesRow>,
): SeriesRow[] {
  if (index < 0 || index >= rows.length) return [...rows];
  return rows.map((row, position) => (position === index ? { ...row, ...patch } : row));
}

/** Bỏ một dòng khỏi bảng. */
export function removeRow(rows: ReadonlyArray<SeriesRow>, index: number): SeriesRow[] {
  return rows.filter((_, position) => position !== index);
}

/** Thêm một dòng vào cuối, chặn ở trần `MAX_SERIES_ROWS`. */
export function appendRow(rows: ReadonlyArray<SeriesRow>, row: SeriesRow): SeriesRow[] {
  if (rows.length >= MAX_SERIES_ROWS) return [...rows];
  return [...rows, row];
}

/**
 * ── Chuỗi ĐANG DÙNG trên màn chi tiết, và vì sao nó cần chỗ cất riêng ────────────────────────
 *
 * Bảng WF-05 ở trên là dữ liệu người dùng chủ động quản. Màn chi tiết còn một chuỗi THỨ HAI:
 * chuỗi vừa dán tại chỗ ("Dán chuỗi giá") hoặc chuỗi minh hoạ có sẵn trong `spec.example`
 * ("Xem ví dụ minh hoạ"). Cả hai CỐ Ý không ghi đè bảng WF-05 — muốn đưa vào bảng thì đã có nút
 * "Áp dụng vào bảng dữ liệu" riêng — nên trước đợt này chúng chỉ sống trong state của màn.
 *
 * Đó là phần còn lại của lỗi đã vá cho ô nhập (`input-draft-store.ts`): nút "Mở bảng dữ liệu →"
 * là một `<Link>` thật, component tháo, chuỗi bốc hơi. Bấm Back quay lại thì công thức chuỗi trở
 * lại đúng câu "chưa đủ phiên giá" mà người dùng vừa thoát ra khỏi — và họ sang bảng dữ liệu
 * chính là để xem chuỗi ấy.
 *
 * ── Vì sao `sessionStorage`, khác bản nháp ô nhập ───────────────────────────────────────────
 *
 * Bản nháp ô nhập nằm ở `localStorage` vì chủ dự án chốt: "đóng tab rồi mở lại mà mất số cũng
 * khó chịu y như bấm Back". Chuỗi khác ở hai điểm, và cả hai đều đẩy về phía `sessionStorage`:
 *
 *   · Chuỗi ĐÃ CÓ chỗ ở lại lâu dài, cách đúng một nút bấm — bảng WF-05. Cất thêm bản thử nhanh
 *     vào `localStorage` là dựng nguồn sự thật thứ hai cho cùng một thứ, và nút "Áp dụng vào
 *     bảng dữ liệu" mất hết ý nghĩa: người dùng không còn phân biệt được cái nào sẽ ở lại.
 *   · Nó có sẵn anh em cùng vòng đời: preset của mã đang xem nằm ở `sessionStorage`
 *     (`ffb.activeTicker.v1`) và cũng mang theo 248 phiên. Chuỗi của "Nạp mẫu" sống sót qua cú
 *     điều hướng nhờ đúng kho ấy — đây chỉ là bù nốt hai lối nạp còn lại.
 *
 * ĐÚNG MỘT bản ghi, khoá theo id công thức. Chuỗi minh hoạ của Beta (kèm chuỗi VN-Index riêng để
 * ra đúng 1,5 lần) mà hiện lại ở màn RSI thì là số của công thức khác — và một bản ghi thì trần
 * dung lượng luôn là 400 phiên, không phải 400 × số công thức từng mở.
 */
export const WORKING_SERIES_KEY = 'ffb.workingSeries.v1';

/** Chuỗi trên màn đến từ đâu — quyết định nhãn nút và ghi chú "không phải số thật" đi kèm. */
export type WorkingSeriesSource = 'paste' | 'example';

/** Chuỗi đang dùng trên màn chi tiết của MỘT công thức. */
export interface WorkingSeries {
  /** Id công thức, dạng slug. */
  id: string;
  rows: ReadonlyArray<SeriesRow>;
  /**
   * Chuỗi VN-Index đi kèm, `null` khi công thức không đọc tới nó.
   *
   * Bắt buộc phải cất cùng: Beta đọc CẢ HAI chuỗi, nên khôi phục mỗi vế cổ phiếu là nó lặng lẽ
   * lấy vế thị trường từ hằng số PRNG của màn và ra một con số khác hẳn thứ người dùng để lại.
   */
  marketSeries: ReadonlyArray<number> | null;
  source: WorkingSeriesSource;
  /**
   * Mã đang gắn lúc ghi, `null` khi người dùng dán chuỗi của riêng mình.
   *
   * Cùng vai và cùng luật với `InputDraft.code`: mở lại kèm `?ma=` thì trùng mã là bản ghi thắng
   * (họ đã thay chuỗi khi đang xem chính mã ấy), khác mã là mã thắng.
   */
  code: string | null;
}

/** Id công thức là slug; mọi thứ khác là rác đọc lên từ máy người dùng. */
const FORMULA_ID_PATTERN = /^[a-z0-9-]{1,40}$/;

/** Dạng mã chứng khoán — cùng chuỗi với `active-ticker.ts`, nới tới 12 cho chứng quyền. */
const CODE_PATTERN = /^[A-Z0-9]{3,12}$/;

/**
 * Đọc bản ghi từ chuỗi JSON. `null` khi chưa có, khi chuỗi hỏng, hoặc khi không còn dòng nào
 * dùng được — mọi ca ấy đều dẫn tới cùng một hành vi: màn chạy như trước, không khôi phục gì.
 *
 * TUYỆT ĐỐI không ném lỗi, cùng lẽ với `parseStoredSeries()` ở trên.
 */
export function parseWorkingSeries(raw: string | null | undefined): WorkingSeries | null {
  if (raw === null || raw === undefined || raw.trim() === '') return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  const source = parsed as Record<string, unknown>;

  if (typeof source.id !== 'string' || !FORMULA_ID_PATTERN.test(source.id)) return null;
  if (source.source !== 'paste' && source.source !== 'example') return null;

  const rows = cleanRows(source.rows);
  if (rows.length === 0) return null;

  const marketSeries = Array.isArray(source.marketSeries)
    ? source.marketSeries
        .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
        .slice(0, MAX_SERIES_ROWS)
    : null;

  return {
    id: source.id,
    rows,
    // Mảng rỗng cũng là "không có" — khôi phục một chuỗi thị trường rỗng chỉ tổ làm Beta ra lỗi.
    marketSeries: marketSeries === null || marketSeries.length === 0 ? null : marketSeries,
    source: source.source,
    code:
      typeof source.code === 'string' && CODE_PATTERN.test(source.code.trim().toUpperCase())
        ? source.code.trim().toUpperCase()
        : null,
  };
}

/** Chuỗi JSON để ghi vào sessionStorage. */
export function serializeWorkingSeries(series: WorkingSeries): string {
  return JSON.stringify({
    id: series.id,
    rows: series.rows.slice(0, MAX_SERIES_ROWS),
    marketSeries:
      series.marketSeries === null ? null : series.marketSeries.slice(0, MAX_SERIES_ROWS),
    source: series.source,
    code: series.code,
  });
}
