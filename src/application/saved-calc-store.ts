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
 * cùng bài học `ExportSheet` giữ **cờ** `failed` chứ không giữ câu lỗi đã dịch. Tab Danh mục
 * định dạng lại từ số thô mỗi lần hiện.
 *
 * KHÔNG cất chuỗi giá (`bars`): 248 phiên × 6 trường × 30 mục là đủ để phình localStorage
 * (~5 MB cho cả tên miền, và kho này chỉ là một trong bảy thứ nằm ở đó). Thay vào đó cất
 * `needsSeries` + `seriesCount`; lúc mở lại, màn dùng chuỗi đang có ở `ffb.series.v1` và
 * **nói rõ** khi số phiên đã khác lúc lưu. Báo lệch còn hơn im lặng trả ra một con số khác
 * cho cùng một cái tên (FR-06).
 */

import { MAX_SAVED_NAME } from '@/core/saved-calc-name';

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
