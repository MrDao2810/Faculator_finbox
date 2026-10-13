/**
 * Tầng APPLICATION — chỗ cất các MÃ CHỜ SỐ LIỆU của màn Danh mục (13/10/2026).
 *
 * Mã chờ là mã được đưa vào danh mục từ nguồn ngoài — trước hết là watchlist tài khoản Finbox — mà
 * chưa có số lượng và giá vốn. Một watchlist chỉ chứa MÃ, còn `Holding` thì bắt buộc cả hai con số
 * ấy đều dương, nên chúng không vào thẳng `ffb.portfolio.v1` được.
 *
 * ── Vì sao một kho riêng chứ không nới `Holding` cho phép số trống ──────────────────────────────
 *
 * `summarisePortfolio()` có sẵn nhánh "Thiếu số lượng hoặc giá vốn của … nên chưa cộng được vốn đã
 * bỏ ra": chỉ cần MỘT dòng thiếu là "Vốn đã bỏ ra" và lãi/lỗ của cả danh mục ra `_ _`. Nhánh ấy
 * đúng cho một dòng hỏng, nhưng sai cho ca này — nhập mười mã từ Finbox về là xoá sạch hai con số
 * thật của những mã đã nhập đủ từ trước. Lối thoát duy nhất trong cùng một danh sách là cho phép
 * cộng bỏ qua dòng thiếu, tức coi nó như 0 — đúng thứ FR-06 dựng ra để chặn.
 *
 * Tách kho thì mã chờ KHÔNG BAO GIỜ vào một phép cộng nào: không có đường nào để nó thành 0.
 * `parseHoldings()`, `addHolding()` và `valueHoldings()` không đổi một dòng, và danh mục đang nằm
 * trong máy người dùng đọc lại y nguyên.
 *
 * Trên màn thì hai kho là MỘT bảng: dòng chờ đứng sau các dòng nắm giữ, mang nền riêng, bấm vào
 * là mở bảng nhập phần còn thiếu. Nhập xong thì mã rời kho này và đi qua `addHolding()` như mọi mã.
 *
 * Cùng khuôn với `portfolio-store.ts`: phần thuần nằm ở đây, không import React, không ném lỗi.
 * NFR-SEC-01 · COM-03: kho chỉ có mã, và cũng như danh mục, nó nằm trên máy người dùng.
 */

import { MAX_HOLDINGS } from './portfolio-store';

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const PENDING_KEY = 'ffb.portfolio.pending.v1';

/**
 * Hình dạng một mã hợp lệ: chữ cái Latin và chữ số, tối đa 12 ký tự ('FPT', 'E1VFVN30', 'VN30F1M').
 *
 * Chặt hơn `parseHoldings()` (chỉ cắt 12 ký tự) vì nguồn ở đây là một đường link hoặc một phản hồi
 * từ ngoài, không phải thứ người dùng chọn trong sheet. Mã sai hình dạng thì BỎ chứ không cắt cho
 * vừa: cắt 'ABCDEFGHIJKLMNOP' còn 12 ký tự là dựng ra một mã khác mà không ai gửi.
 */
const CODE_SHAPE = /^[A-Z0-9]{1,12}$/;

/** Mã đã chuẩn hoá, hoặc `null` khi không phải một mã. */
function cleanCode(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase();
  return CODE_SHAPE.test(code) ? code : null;
}

/**
 * Đọc kho mã chờ từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném lỗi. Mục hỏng và mục trùng bị bỏ; thứ tự còn lại là thứ tự đã nhập.
 */
export function parsePendingCodes(raw: string | null | undefined): string[] {
  if (raw === null || raw === undefined || raw.trim() === '') return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const clean: string[] = [];
  for (const item of parsed) {
    const code = cleanCode(item);
    if (code === null || clean.includes(code)) continue;

    clean.push(code);
    if (clean.length >= MAX_HOLDINGS) break;
  }

  return clean;
}

/** Chuỗi JSON để ghi vào localStorage. */
export function serializePendingCodes(list: ReadonlyArray<string>): string {
  return JSON.stringify(list.slice(0, MAX_HOLDINGS));
}

/**
 * Tách một chuỗi danh sách mã ('FPT,HPG', 'FPT HPG', 'FPT;HPG', mỗi mã một dòng) thành từng phần.
 *
 * Chỉ TÁCH, không lọc: việc mã nào hợp lệ là của `importCodes()`, để một chỗ duy nhất quyết định.
 */
export function splitCodeList(raw: string): string[] {
  return raw.split(/[\s,;]+/).filter((part) => part !== '');
}

/**
 * Khớp kho mã chờ với danh mục đang có, dùng lúc nạp từ localStorage.
 *
 * Hai kho ghi riêng nên có thể lệch nhau (một tab khác vừa nhập đủ số cho mã ấy, hoặc người dùng
 * sửa tay): mã đã thành nắm giữ thì không còn chờ gì nữa, và tổng hai kho không vượt trần của bảng.
 */
export function reconcilePending(
  pending: ReadonlyArray<string>,
  heldCodes: ReadonlySet<string>,
): string[] {
  const room = Math.max(0, MAX_HOLDINGS - heldCodes.size);
  return pending.filter((code) => !heldCodes.has(code)).slice(0, room);
}

/** Kết quả một lượt nhập mã. */
export interface ImportResult {
  /** Kho mã chờ sau lượt nhập. */
  pending: string[];
  /** Mã MỚI vào kho ở lượt này, theo thứ tự nhận. */
  added: string[];
  /**
   * Mã hợp lệ nhưng không còn chỗ vì bảng đã đủ `MAX_HOLDINGS` dòng.
   *
   * Trả về THEO TÊN chứ không chỉ một con số: màn phải nói được mã nào chưa vào, nếu không người
   * dùng nhập ba mươi mã, thấy hai mươi dòng và không biết mười mã kia là mã nào.
   */
  overflow: string[];
}

/**
 * Nhận một lượt mã từ ngoài vào kho chờ — CỬA DUY NHẤT, dù nguồn là đường link hay một API.
 *
 * Bỏ trong im lặng, vì không có gì để nói: mã sai hình dạng (không phải một mã), mã đang nắm giữ và
 * mã đang chờ sẵn (đã ở trong bảng — nhập lại cùng một danh sách không được sinh dòng đôi).
 *
 * Trần `MAX_HOLDINGS` tính CHUNG hai kho: nó là trần của bảng, và mỗi mã chờ rồi sẽ thành một dòng
 * nắm giữ. Tính riêng thì có lúc bảng dài một trăm dòng mà năm mươi dòng không bao giờ nhập đủ được.
 */
export function importCodes(
  pending: ReadonlyArray<string>,
  heldCodes: ReadonlySet<string>,
  incoming: ReadonlyArray<string>,
): ImportResult {
  const next = [...pending];
  const added: string[] = [];
  const overflow: string[] = [];

  for (const item of incoming) {
    const code = cleanCode(item);
    if (code === null || heldCodes.has(code) || next.includes(code) || overflow.includes(code)) {
      continue;
    }

    if (heldCodes.size + next.length >= MAX_HOLDINGS) {
      overflow.push(code);
      continue;
    }

    next.push(code);
    added.push(code);
  }

  return { pending: next, added, overflow };
}

/** Gỡ một mã khỏi kho chờ — khi người dùng xoá dòng, hoặc khi mã đã nhập đủ số. */
export function removePendingCode(list: ReadonlyArray<string>, code: string): string[] {
  const target = code.trim().toUpperCase();
  return list.filter((item) => item !== target);
}
