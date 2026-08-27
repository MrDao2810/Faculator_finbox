/**
 * Tầng APPLICATION — bản nháp ô nhập của màn chi tiết công thức.
 *
 * Cùng khuôn `price-cache-store.ts` và `formula-usage.ts`: phần thuần nằm ở đây, không import
 * React, nên test được bằng Node; phần chạm `localStorage` do màn gọi trong `useEffect`.
 *
 * ── Lỗi nó sinh ra để sửa ───────────────────────────────────────────────────────────────────
 *
 * `FormulaDetail` giữ `inputs` bằng `useState` thuần. Nút "Mở bảng dữ liệu →" là một `<Link>`
 * sang `/du-lieu/` — điều hướng thật, component tháo, số người dùng vừa gõ mất sạch. Bấm Back
 * quay lại thì mọi ô về mặc định và họ phải nhập lại từ đầu.
 *
 * Tệ hơn là nó mất KHÔNG ĐỀU. Mã đang chọn nằm ở `sessionStorage` (`ffb.activeTicker.v1`) nên nó
 * SỐNG qua cú điều hướng, rồi tự nạp lại số liệu của mã. Nên người dùng quay lại và thấy một bộ
 * số khác hẳn thứ họ để lại — không phải mặc định, cũng không phải thứ họ vừa gõ. Chủ dự án báo
 * đúng hai triệu chứng này thành hai lỗi riêng; chúng là một.
 *
 * ── Vì sao `localStorage` chứ không `sessionStorage` ────────────────────────────────────────
 *
 * `sessionStorage` khớp vòng đời của mã đang chọn hơn, và đó là đề xuất ban đầu. Chủ dự án chốt
 * `localStorage`: người dùng thật đóng tab giữa chừng rồi mở lại, và mất số lúc ấy cũng khó chịu
 * y như mất số khi bấm Back.
 *
 * Đổi lại phải trả hai thứ, và cả hai đã trả:
 *
 *   · **Hạn dùng thật.** Số sống qua nhiều ngày thì phải có mốc hết hạn, nếu không màn hình có
 *     ngày bày ra một bộ số của tháng trước như thể vừa gõ xong — đúng loại "số sai mà trông có
 *     lý" mà FR-06 sinh ra để chặn. Bảy ngày, cùng mốc `PRICE_CACHE_TTL_MS` và cùng lý lẽ.
 *   · **Trần dung lượng.** 111 công thức × 6 biến là một kho phình vô kiểm soát trong máy người
 *     dùng. `MAX_DRAFTS` cắt ở 40, đuổi mục CŨ NHẤT trước.
 *
 * Điều thứ ba KHÔNG phải trả, vì màn đã có sẵn: người dùng luôn biết mình đang lệch khỏi ví dụ.
 * `ExampleBlock` bày dòng "Ví dụ gốc cho: …" kèm nút "Về số của ví dụ" ngay khi bộ số hiện tại
 * khác bộ số của ví dụ — tức mỗi lần một bản nháp được khôi phục. Không cần thêm lời cảnh báo
 * nào, chỉ cần đừng gỡ dòng ấy đi.
 *
 * ── Cất gì và không cất gì ──────────────────────────────────────────────────────────────────
 *
 * Chỉ `Record<string, number>` của các ô nhập, khoá theo id công thức. KHÔNG cất chuỗi giá, mã
 * đang chọn, hay kết quả tính: chuỗi giá đã có kho riêng (`ffb.series.v1`), mã đã có kho riêng,
 * còn kết quả thì tính lại từ đầu vào trong chưa tới một mili giây — cất nó vào là tạo cơ hội cho
 * một con số cũ sống sót sau khi công thức đã đổi.
 *
 * LDR-04 · NFR-SEC-01: nằm trên máy, không gửi đi đâu.
 */

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const INPUT_DRAFT_KEY = 'ffb.draft.v1';

/**
 * Hạn dùng của một bản nháp, tính bằng mili giây.
 *
 * Bảy ngày, cùng mốc với `PRICE_CACHE_TTL_MS` và vì cùng một lẽ: quá mốc đó thì thà để màn bày
 * bộ số mặc định — thứ người dùng đọc ra ngay là "chưa nhập gì" — còn hơn bày một bộ số cũ mà
 * không có gì trên màn nói nó cũ.
 */
export const INPUT_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Trần số công thức được cất bản nháp.
 *
 * 40 trên tổng 111. Một phiên làm việc thật chạm tới chừng chục công thức; 40 là rộng rãi mà vẫn
 * chặn được kho phình tới cỡ cả thư viện. Mỗi mục cỡ 6 biến × ~20 B, nên trần này ≈ 5 kB.
 */
export const MAX_DRAFTS = 40;

/** Id công thức là slug; mọi thứ khác là rác đọc lên từ máy người dùng. */
const ID_PATTERN = /^[a-z0-9-]{1,40}$/;

/** Khoá biến — cùng dạng `VariableSpec.key`, chữ và số kiểu camelCase. */
const KEY_PATTERN = /^[A-Za-z][A-Za-z0-9]{0,39}$/;

/** Số ô nhập tối đa của một công thức. Công thức nhiều biến nhất hiện có 6 biến. */
const MAX_KEYS = 24;

/** Dạng mã chứng khoán — cùng chuỗi với `active-ticker.ts`, nới tới 12 cho chứng quyền. */
const CODE_PATTERN = /^[A-Z0-9]{3,12}$/;

/** Một bản nháp: bộ số của một công thức, kèm mốc ghi gần nhất. */
export interface InputDraft {
  /** Id công thức, dạng slug. */
  id: string;
  /** Giá trị từng ô. Chỉ nhận số hữu hạn — xem `cleanInputs`. */
  inputs: Readonly<Record<string, number>>;
  /**
   * Mã đang nạp lúc ghi bản nháp, hoặc `null` khi người dùng gõ tay hoàn toàn.
   *
   * Đây là thứ quyết ai thắng khi mở lại `/cong-thuc/<id>/?ma=<MÃ>`, và nó cần thiết vì đường
   * `?ma=` là BẤT ĐỒNG BỘ: bản nháp khôi phục ngay lúc gắn, rồi lời gọi mạng về sau và
   * `applyPreset()` đè bộ số của mã lên trên.
   *
   *   · Trùng mã → bản nháp thắng. Người dùng đang xem đúng mã ấy, đã sửa vài ô, rồi rời màn và
   *     quay lại; đè số thô của mã lên là xoá đúng phần họ vừa sửa — chính là lỗi cần chữa.
   *   · Khác mã → mã thắng, tự nhiên, vì nó về sau. Bấm ƒ trên HPG ở màn Danh mục là đòi số của
   *     HPG, không phải bộ số cũ của mã khác.
   */
  code: string | null;
  /** Mốc ghi gần nhất, epoch ms. */
  at: number;
}

/** Bộ ô nhập đọc lên có dùng được không? Trả về bản đã làm sạch, hoặc `null`. */
function cleanInputs(raw: unknown): Record<string, number> | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;

  const clean: Record<string, number> = {};
  let count = 0;

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!KEY_PATTERN.test(key)) continue;
    /*
     * `Number.isFinite` chứ không `typeof === 'number'`: `NaN` và `Infinity` đều lọt qua phép
     * kiểm kiểu, mà đó đúng là hai giá trị FR-06 cấm bày ra màn. JSON không mã hoá được chúng
     * nên chúng chỉ tới đây qua bàn tay sửa DevTools — vẫn phải chặn.
     */
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    clean[key] = value;
    count += 1;
    if (count >= MAX_KEYS) break;
  }

  // Bộ rỗng không mang thông tin gì — coi như không có bản nháp.
  return count === 0 ? null : clean;
}

/** Một phần tử đọc lên có dùng được không? Trả về bản đã làm sạch, hoặc `null`. */
function cleanDraft(item: unknown): InputDraft | null {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return null;

  const { id, inputs, code, at } = item as {
    id?: unknown;
    inputs?: unknown;
    code?: unknown;
    at?: unknown;
  };

  if (typeof id !== 'string' || !ID_PATTERN.test(id)) return null;
  if (typeof at !== 'number' || !Number.isFinite(at) || at <= 0) return null;

  const clean = cleanInputs(inputs);
  if (clean === null) return null;

  // Mã sai dạng thì bỏ RIÊNG mã, giữ bộ số: mất mã chỉ làm bản nháp thua đường `?ma=`, còn bỏ cả
  // mục thì mất luôn thứ người dùng đã gõ — hỏng nặng hơn hẳn.
  const cleanCode = typeof code === 'string' && CODE_PATTERN.test(code) ? code : null;

  return { id, inputs: clean, code: cleanCode, at };
}

/**
 * Đọc kho bản nháp từ chuỗi JSON, đã bỏ mục quá hạn.
 *
 * TUYỆT ĐỐI không ném lỗi: chuỗi hỏng, không phải mảng, lẫn phần tử rác đều bị bỏ chứ không làm
 * mất cả kho — mất kho thì màn chỉ trở về bộ số mặc định, còn ném lỗi thì hỏng cả trang chi tiết.
 *
 * `now` phải TRUYỀN VÀO, tuyệt đối không gọi `Date.now()` trong này: lấy giờ hệ thống giữa lúc
 * render là đường thẳng tới lệch hydration — cùng ràng buộc đã ghi ở `formula-usage.ts`.
 */
export function parseInputDrafts(raw: string | null | undefined, now: number): InputDraft[] {
  if (raw === null || raw === undefined || raw.trim() === '') return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const clean: InputDraft[] = [];
  for (const item of parsed) {
    const draft = cleanDraft(item);
    if (draft === null) continue;
    // Đồng hồ máy chạy trước làm `at` nằm ở tương lai; kẹp tuổi về 0 chứ đừng coi là quá hạn.
    if (Math.max(0, now - draft.at) > INPUT_DRAFT_TTL_MS) continue;
    // Đọc từ máy người dùng nên vẫn phải chống trùng, phòng bản cũ ghi lỗi.
    if (clean.some((existing) => existing.id === draft.id)) continue;
    clean.push(draft);
    if (clean.length >= MAX_DRAFTS) break;
  }

  return clean;
}

/** Bản nháp của một công thức, hoặc `null` khi chưa có hoặc đã quá hạn. */
export function draftFor(drafts: ReadonlyArray<InputDraft>, formulaId: string): InputDraft | null {
  return drafts.find((draft) => draft.id === formulaId) ?? null;
}

/**
 * Ghi bộ số của một công thức vào kho và trả về kho mới.
 *
 * Trả về mảng đã sắp theo mốc GIẢM DẦN, nên cắt ở cuối là đuổi đúng mục cũ nhất. Đầu vào không
 * dùng được (`now` vô nghĩa, `id` sai dạng, bộ số rỗng) thì trả bản sao nguyên vẹn — ghi hỏng còn
 * tệ hơn không ghi.
 */
export function putDraft(
  drafts: ReadonlyArray<InputDraft>,
  formulaId: string,
  inputs: Readonly<Record<string, number>>,
  code: string | null,
  now: number,
): InputDraft[] {
  if (!Number.isFinite(now) || now <= 0) return [...drafts];
  if (!ID_PATTERN.test(formulaId)) return [...drafts];

  const clean = cleanInputs(inputs);
  if (clean === null) return [...drafts];

  const cleanCode = code !== null && CODE_PATTERN.test(code) ? code : null;
  const rest = drafts.filter((draft) => draft.id !== formulaId);

  return [{ id: formulaId, inputs: clean, code: cleanCode, at: now }, ...rest]
    .sort((a, b) => b.at - a.at)
    .slice(0, MAX_DRAFTS);
}

/**
 * Bỏ bản nháp của một công thức khỏi kho.
 *
 * Dùng khi người dùng nói rõ là không muốn bộ số ấy nữa — hiện là nút bỏ mã ở thanh mã, nơi
 * `clearTicker()` đã đưa mọi ô về mặc định. Giữ lại bản nháp ở đó là bộ số bị bỏ sẽ quay về ngay
 * lần mở kế tiếp.
 */
export function removeDraft(drafts: ReadonlyArray<InputDraft>, formulaId: string): InputDraft[] {
  return drafts.filter((draft) => draft.id !== formulaId);
}

/** Chuỗi JSON để ghi vào localStorage. */
export function serializeInputDrafts(drafts: ReadonlyArray<InputDraft>): string {
  return JSON.stringify(drafts.slice(0, MAX_DRAFTS));
}
