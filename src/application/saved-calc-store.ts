/**
 * Tầng APPLICATION — chỗ cất các phép tính người dùng đã lưu từ màn chi tiết công thức.
 *
 * Cùng khuôn với `portfolio-store.ts` và `price-series-store.ts`: phần thuần nằm ở đây, không
 * import React, nên test được bằng Node; phần chạm `localStorage` do màn gọi trong `useEffect`.
 *
 * NFR-SEC-01 · COM-03: một phép tính đã lưu nói lên người dùng đang quan tâm mã nào và đang
 * định giá nó bằng con số nào — riêng tư y như danh mục. Không tài khoản, không backend,
 * không gửi đi đâu.
 *
 * ── Cất gì và KHÔNG cất gì ──────────────────────────────────────────────────────────────────
 *
 * Cất `inputs` (để mở lại đúng bộ số) và kết quả THÔ lúc lưu (`resultValue` + `resultUnit`).
 *
 * KHÔNG cất chuỗi kết quả đã định dạng: đó là chữ đã dịch, mà ngôn ngữ đổi được lúc chạy —
 * cùng bài học sheet Xuất cũ (bỏ 17/11/2026) giữ **cờ** `failed` chứ không giữ câu lỗi đã dịch. Tab Danh mục
 * định dạng lại từ số thô mỗi lần hiện.
 *
 * Từ 25/11/2026 CÓ cất chuỗi giá (`series`) và bảng dòng tiền của XIRR (`cashflows`). Trước đó kho chỉ cất
 * `needsSeries` + `seriesCount` (lý do cũ: 248 phiên × 30 mục sẽ phình localStorage), và lúc mở lại màn dùng
 * chuỗi đang có ở `ffb.series.v1`. Lỗi báo về: lưu SMA trên dữ liệu mẫu ra 71.560 ₫, mở lại từ Danh mục thì
 * `_ _` kèm câu "chuỗi không khớp lúc lưu", vì chuỗi mẫu, chuỗi của mã và chuỗi dán tại chỗ đều KHÔNG nằm ở
 * `ffb.series.v1`: cả 35 công thức chuỗi và XIRR mở lại trắng. Đo: 250 phiên khoảng 20 kB một mục, 30 mục
 * khoảng 600 kB trong ~5 MB của tên miền; kho đầy thì nút Lưu báo lỗi chứ không ghi thiếu. `seriesCount`
 * vẫn ghi cho bản lưu cũ không có `series`: với chúng màn vẫn đối chiếu `ffb.series.v1` và nói rõ khi lệch
 * (FR-06).
 */

import type { Cashflow } from '@/core/cashflow-series';
import { isIsoDay } from '@/core/date-text';
import type { SeriesRow } from '@/core/price-series';
import { MAX_SAVED_NAME } from '@/core/saved-calc-name';

import { MAX_SERIES_ROWS, cleanRows, type WorkingSeriesSource } from './price-series-store';

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const SAVED_CALCS_KEY = 'ffb.saved.v1';

/**
 * Trần số phép tính cất giữ.
 *
 * Ba mươi: danh sách một cột dài hơn thế thì việc tìm lại một phép tính đã lưu tốn công hơn là
 * tính lại từ đầu, mà cái tên tự đặt cũng bắt đầu trùng nhau.
 */
export const MAX_SAVED_CALCS = 30;

/** Một phép tính đã lưu. */
export interface SavedCalc {
  /**
   * Khoá duy nhất, dạng `<formulaId>-<savedAt>`.
   *
   * Dựng từ hai thứ đã có sẵn thay vì `crypto.randomUUID()`: id này đi vào URL (`?luu=`), nên
   * nó phải đọc được và phải dựng lại được y hệt trong test mà không phải giả lập gì cả.
   */
  id: string;
  /** Id công thức trong Registry, ví dụ 'pe'. */
  formulaId: string;
  /** Tên người dùng đặt. */
  name: string;
  /** Mã cổ phiếu gắn kèm nếu phép tính đến từ `?ma=`. Bỏ hẳn trường khi không có. */
  code?: string;
  /** Bộ số đã nhập, khoá là `variable.key`. */
  inputs: Readonly<Record<string, number>>;
  /**
   * Kết quả lúc lưu, số thô.
   *
   * `null` chỉ tồn tại để bản lưu cũ/hỏng không làm sập màn — màn lưu KHÔNG cho lưu một kết quả
   * đang lỗi, vì bày một con số sai ra tab Danh mục đúng là thứ FR-06 sinh ra để chặn.
   */
  resultValue: number | null;
  /** Đơn vị của kết quả, lấy từ `spec.resultUnit`. */
  resultUnit: string;
  /** Mốc lưu, mili giây kể từ epoch. UI truyền vào — Application không tự lấy đồng hồ. */
  savedAt: number;
  /** Công thức có đọc chuỗi giá hay không — quyết định lời nhắc lúc mở lại. */
  needsSeries: boolean;
  /** Số phiên của chuỗi giá lúc lưu. Bỏ hẳn trường khi công thức không dùng chuỗi. */
  seriesCount?: number;
  /**
   * Bảng dòng tiền có ngày lúc lưu — riêng XIRR, công thức duy nhất đọc `ctx.cashflows` (25/11/2026).
   *
   * XIRR khai `variables: []`: toàn bộ số của nó nằm trong bảng dòng tiền chứ không trong `inputs`.
   * Trước ngày này kho chỉ cất `inputs`, nên tab Danh mục vẫn in kết quả đã lưu mà mở lại thì bảng
   * trống, màn báo "Cần tối thiểu 2 dòng tiền" (lỗi báo kèm các bước tái hiện). Khác chuỗi giá
   * (`bars`, không cất vì nặng), bảng này vài dòng nên cất nguyên. Chỉ cất dòng đã DÙNG ĐƯỢC
   * (`cashflowsOf()`), tức đúng những dòng đã sinh ra kết quả lưu kèm. Bỏ hẳn trường khi không có.
   */
  cashflows?: ReadonlyArray<Cashflow>;
  /**
   * Chuỗi giá đã sinh ra kết quả lưu kèm (25/11/2026), cho các công thức đọc chuỗi. Bỏ hẳn trường khi
   * công thức không dùng chuỗi hoặc chưa có chuỗi. Xem docblock đầu file.
   */
  series?: SavedSeries;
}

/** Chuỗi cất kèm một phép tính. */
export interface SavedSeries {
  rows: ReadonlyArray<SeriesRow>;
  /** Chuỗi VN-Index đi kèm (Beta và ví dụ của nó); `null` khi màn dùng chuỗi VN-Index mặc định. */
  marketSeries: ReadonlyArray<number> | null;
  /**
   * Chuỗi đến từ đâu, cùng nghĩa `WorkingSeriesSource`; `null` khi là chuỗi của mã hay của bảng dữ liệu.
   * Giữ để mở lại vẫn mang đúng ghi chú "dữ liệu minh hoạ".
   */
  source: WorkingSeriesSource | null;
}

/** Chuỗi đã lưu, hoặc `null` khi không còn dòng nào. Cùng phép lọc dòng với hai kho chuỗi kia. */
function cleanSeries(value: unknown): SavedSeries | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const rows = cleanRows(record.rows);
  if (rows.length === 0) return null;
  const market = Array.isArray(record.marketSeries)
    ? record.marketSeries
        .filter((item): item is number => typeof item === 'number' && Number.isFinite(item))
        .slice(0, MAX_SERIES_ROWS)
    : [];
  return {
    rows,
    marketSeries: market.length === 0 ? null : market,
    source: record.source === 'paste' || record.source === 'example' ? record.source : null,
  };
}

/** Trần số dòng tiền cất cho một phép tính: đủ rộng cho mọi bảng gõ tay, chặn một bản hỏng phình kho. */
export const MAX_SAVED_CASHFLOWS = 200;

/** Dòng tiền đã lưu, bỏ dòng hỏng (ngày không phải ISO có thật, số tiền không hữu hạn hoặc bằng 0). */
function cleanCashflows(value: unknown): Cashflow[] {
  if (!Array.isArray(value)) return [];
  const clean: Cashflow[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;
    const date = typeof record.date === 'string' ? record.date.trim() : '';
    const amount = numberOrNull(record.amount);
    // Dòng hỏng bị BỎ chứ không vá thành 0: số 0 là dòng tiền vô nghĩa, XIRR sẽ nói thiếu dòng.
    if (!isIsoDay(date) || amount === null || amount === 0) continue;
    clean.push({ date, amount });
    if (clean.length >= MAX_SAVED_CASHFLOWS) break;
  }
  return clean;
}

/** Số hữu hạn hay `null`. Thứ gì khác đều thành `null` chứ không thành 0. */
function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Bộ số đã nhập, bỏ mọi ô không phải số hữu hạn. */
function cleanInputs(value: unknown): Record<string, number> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};

  const clean: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const parsed = numberOrNull(raw);
    // Ô hỏng bị BỎ HẲN chứ không điền 0: `runFormula()` coi ô trống là "thiếu đầu vào" và nói
    // thành lời, còn một số 0 lặng lẽ sẽ ra kết quả sai mà trông vẫn có lý.
    if (parsed !== null) clean[key] = parsed;
  }
  return clean;
}

/**
 * Đọc danh sách từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném lỗi, và **bỏ hẳn** mục nào thiếu thứ bắt buộc (id, id công thức, tên,
 * mốc lưu) thay vì vá tạm: một mục không mở lại được mà vẫn nằm trong danh sách là một cái bẫy,
 * còn một mục biến mất thì người dùng nhìn thấy ngay.
 */
export function parseSavedCalcs(raw: string | null | undefined): SavedCalc[] {
  if (raw === null || raw === undefined || raw.trim() === '') return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const clean: SavedCalc[] = [];
  const seen = new Set<string>();

  for (const item of parsed) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;

    const id = typeof record.id === 'string' ? record.id.trim().slice(0, 80) : '';
    const formulaId = typeof record.formulaId === 'string' ? record.formulaId.trim() : '';
    const name = typeof record.name === 'string' ? record.name.trim().slice(0, MAX_SAVED_NAME) : '';
    const savedAt = numberOrNull(record.savedAt);

    if (id === '' || formulaId === '' || name === '' || savedAt === null || savedAt <= 0) continue;
    // Hai mục cùng id thì mục sau không mở lại được nữa (`?luu=` chỉ tìm thấy mục đầu) — bỏ.
    if (seen.has(id)) continue;
    seen.add(id);

    const code =
      typeof record.code === 'string' ? record.code.trim().toUpperCase().slice(0, 12) : '';
    const seriesCount = numberOrNull(record.seriesCount);
    const cashflows = cleanCashflows(record.cashflows);
    const series = cleanSeries(record.series);

    clean.push({
      id,
      formulaId,
      name,
      ...(code === '' ? {} : { code }),
      inputs: cleanInputs(record.inputs),
      resultValue: numberOrNull(record.resultValue),
      resultUnit:
        typeof record.resultUnit === 'string' ? record.resultUnit.trim().slice(0, 24) : '',
      savedAt,
      needsSeries: record.needsSeries === true,
      ...(seriesCount === null || seriesCount < 0 ? {} : { seriesCount }),
      ...(cashflows.length === 0 ? {} : { cashflows }),
      ...(series === null ? {} : { series }),
    });

    if (clean.length >= MAX_SAVED_CALCS) break;
  }

  return clean;
}

/** Chuỗi JSON để ghi vào localStorage. */
export function serializeSavedCalcs(list: ReadonlyArray<SavedCalc>): string {
  return JSON.stringify(list.slice(0, MAX_SAVED_CALCS));
}

/**
 * Thêm một phép tính, mới nhất lên đầu.
 *
 * Trùng `id` thì **thay thế tại chỗ** chứ không tạo mục thứ hai: cùng công thức, cùng mốc lưu
 * tới từng mili giây nghĩa là người dùng bấm Lưu hai lần, không phải hai phép tính khác nhau.
 *
 * Đầy trần thì trả về bản sao nguyên vẹn — màn phải tự chặn TRƯỚC để còn nói được lý do, y như
 * `addHolding()` với `MAX_HOLDINGS`.
 */
export function addSavedCalc(list: ReadonlyArray<SavedCalc>, item: SavedCalc): SavedCalc[] {
  if (item.id.trim() === '' || item.name.trim() === '') return [...list];

  const existing = list.findIndex((saved) => saved.id === item.id);
  if (existing >= 0) {
    return list.map((saved, index) => (index === existing ? item : saved));
  }

  if (list.length >= MAX_SAVED_CALCS) return [...list];
  return [item, ...list];
}

/** Đổi tên một phép tính. Tên rỗng hoặc id lạ thì trả về bản sao nguyên vẹn. */
export function renameSavedCalc(
  list: ReadonlyArray<SavedCalc>,
  id: string,
  name: string,
): SavedCalc[] {
  const next = name.trim().slice(0, MAX_SAVED_NAME);
  if (next === '') return [...list];
  return list.map((saved) => (saved.id === id ? { ...saved, name: next } : saved));
}

/** Bỏ một phép tính khỏi danh sách. */
export function removeSavedCalc(list: ReadonlyArray<SavedCalc>, id: string): SavedCalc[] {
  return list.filter((saved) => saved.id !== id);
}

/** Id của một lượt lưu — cùng công thức, cùng mốc thời gian là cùng một mục. */
export function savedCalcId(formulaId: string, savedAt: number): string {
  return `${formulaId}-${savedAt}`;
}
