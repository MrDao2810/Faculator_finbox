/**
 * Tầng DOMAIN — gợi ý tên cho một phép tính sắp lưu (tab "Công thức" của màn Danh mục).
 *
 * Vì sao cần gợi ý chứ không để ô tên trống: một danh sách ba mươi mục tên "P/E", "P/E (1)",
 * "P/E (2)" thì vô dụng đúng bằng không lưu gì. Ba thứ phân biệt được một phép tính với phép
 * tính khác của **cùng một công thức** là mã cổ phiếu, con số kết quả và ngày lưu — nên ba gợi
 * ý là ba cách ghép ba thứ đó lại.
 *
 * Hàm này KHÔNG đọc i18n (CON-02 cấm `src/core` chạm tầng trên): tên công thức và chuỗi kết quả
 * đã được UI `pick()`/định dạng sẵn rồi truyền vào. Nhờ vậy gợi ý đổi theo ngôn ngữ đang xem mà
 * Domain vẫn thuần.
 *
 * `savedAt` là tham số bắt buộc, không gọi `Date.now()` bên trong — cùng lý do
 * `summarisePortfolio()` bắt buộc nhận `asOf` (NFR-REL-03).
 */

/**
 * Trần độ dài tên. Đủ cho 'HPG · Giá trị nội tại FCFF · 25/08/2026' mà không vỡ một dòng.
 *
 * Sống ở Domain chứ không ở `saved-calc-store.ts` vì cả hai bên đều cắt theo nó: nơi gợi ý tên
 * và nơi cất tên. Một trần đặt hai chỗ là hai trần sẽ lệch nhau. CON-02 chỉ cho phép chiều
 * Application → Domain, nên chỗ chung duy nhất là ở đây.
 */
export const MAX_SAVED_NAME = 60;

/**
 * Trần số lần thử hậu tố né trùng. Kho chỉ giữ 30 mục nên tới 40 là chắc chắn tìm được chỗ
 * trống; con số này chỉ để vòng lặp không bao giờ chạy vô hạn.
 */
const MAX_SUFFIX_TRIES = 40;

/** Dấu ngăn giữa các mảnh của một cái tên. Cùng ký tự màn Danh mục dùng cho dòng phụ. */
const SEPARATOR = ' · ';

/** Khoá so trùng: bỏ qua hoa thường và khoảng trắng thừa. */
function key(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export interface SuggestCalcNameInput {
  /** Tên công thức đã chọn theo ngôn ngữ đang xem, ví dụ 'P/E'. */
  formulaName: string;
  /** Mã cổ phiếu gắn kèm, nếu có. */
  code?: string;
  /** Kết quả đã định dạng, ví dụ '12,3 lần'. Bỏ trống khi chưa tính được. */
  resultText?: string;
  /** Mốc lưu, mili giây kể từ epoch. */
  savedAt: number;
  /** Những tên đã có trong kho — gợi ý sẽ né trùng. */
  existing?: ReadonlyArray<string>;
}

/**
 * Ngày dạng 'DD/MM/YYYY' từ mốc epoch, theo giờ **địa phương**.
 *
 * Dùng `getDate()`/`getMonth()` chứ không `toISOString()`: hàm kia đổi sang UTC, nên lưu lúc
 * 7 giờ sáng ở Việt Nam sẽ hiện ra ngày hôm trước. Chuỗi này chỉ dùng để đặt tên nên không
 * vướng ràng buộc "HTML tĩnh phải khớp lúc chạy" của `formatIsoDate()`.
 */
function dayLabel(savedAt: number): string {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

/** Cắt tên về đúng trần, không để lại khoảng trắng cụt ở đuôi. */
function trim(name: string): string {
  return name.trim().slice(0, MAX_SAVED_NAME).trim();
}

/**
 * Né trùng bằng hậu tố ' (2)', ' (3)'…
 *
 * So sánh không phân biệt hoa thường và khoảng trắng thừa: 'P/E · HPG' với 'p/e  ·  hpg' là
 * cùng một cái tên trong mắt người dùng, và hai mục trông y hệt nhau thì mở nhầm là chuyện sớm
 * muộn. Trần độ dài vẫn được tôn trọng — cắt phần thân chứ không cắt hậu tố, vì mất hậu tố là
 * mất đúng thứ phân biệt hai mục.
 */
function dedupe(name: string, taken: ReadonlySet<string>): string {
  if (name === '' || !taken.has(key(name))) return name;

  for (let counter = 2; counter <= MAX_SUFFIX_TRIES; counter += 1) {
    const suffix = ` (${counter})`;
    const candidate = `${name.slice(0, MAX_SAVED_NAME - suffix.length).trim()}${suffix}`;
    if (!taken.has(key(candidate))) return candidate;
  }
  return name;
}

/**
 * Ba gợi ý tên, đã né trùng, không mục nào rỗng và không mục nào lặp lại mục trước.
 *
 * Thứ tự có chủ đích — gợi ý đầu tiên là thứ ô tên điền sẵn:
 *   1. Mã + tên công thức ('HPG · P/E') — có mã thì đó là thứ người dùng nhớ trước nhất.
 *      Không có mã thì lùi về dạng ngày.
 *   2. Tên công thức + kết quả ('P/E · 12,3 lần') — phân biệt hai lần tính cùng một mã.
 *   3. Tên công thức + ngày ('P/E · 25/08/2026') — luôn dựng được, kể cả khi thiếu cả hai thứ trên.
 */
export interface DisplayCalcNameInput {
  /** Tên đang nằm trong kho. */
  stored: string;
  /** Tên công thức bằng TIẾNG VIỆT — ngôn ngữ mà mọi bản lưu trước đây được đặt tên. */
  viName: string;
  /** Tên công thức theo ngôn ngữ ĐANG XEM. */
  localName: string;
  code?: string;
  /** Kết quả đã định dạng, bản tiếng Việt — dùng để nhận ra gợi ý số 2. */
  viResult?: string;
  /** Cùng kết quả ấy theo ngôn ngữ đang xem. */
  localResult?: string;
  savedAt: number;
}

/**
 * Tên HIỂN THỊ của một phép tính đã lưu — dịch lại nếu nó vốn là gợi ý, giữ nguyên nếu người
 * dùng tự gõ.
 *
 * ── Vấn đề ──────────────────────────────────────────────────────────────────────────────────
 *
 * `SavedCalc.name` là chuỗi ĐÃ GHÉP, cất vào localStorage lúc bấm Lưu. Nếu lúc ấy giao diện đang
 * chạy tiếng Việt thì cái tên đóng băng vĩnh viễn bằng tiếng Việt, và chuyển sang EN nó vẫn là
 * "AAA · Giá hoà vốn thực" trong khi dòng phụ ngay dưới đã là "AAA · True break-even price".
 * Chủ dự án báo đúng chỗ này. Nó cũng đi ngược nguyên tắc `saved-calc-store.ts` tự nêu: **không
 * cất chữ đã dịch** — kho đã cất `resultValue` + `resultUnit` thô thay vì chuỗi kết quả, chính vì
 * lý do đó; riêng cái tên thì lọt.
 *
 * ── Vì sao NHẬN RA thay vì thêm một trường cờ ───────────────────────────────────────────────
 *
 * Thêm `nameIsAuto` vào `SavedCalc` chỉ cứu được những bản lưu TỪ NAY TRỞ ĐI — hai mục trong ảnh
 * chủ dự án gửi vẫn tiếng Việt mãi, vì không có gì để biết chúng là tên tự gợi ý hay tên tự gõ.
 * Ở đây thì biết được: dựng lại đúng bộ gợi ý bằng tiếng Việt rồi so. Khớp nghĩa là người dùng đã
 * NHẬN gợi ý — trả về gợi ý cùng vị trí ở ngôn ngữ đang xem. Không khớp nghĩa là tên tự gõ, giữ
 * nguyên từng chữ. Không cần migration, không cần trường mới, và bản lưu cũ cũng được cứu.
 *
 * Giá phải trả, nhận có ý thức: ai đó GÕ TAY đúng y một chuỗi gợi ý thì tên ấy cũng sẽ dịch theo.
 * Kết quả giống hệt thứ họ sẽ nhận nếu bấm chọn gợi ý đó, nên không mất gì.
 *
 * Ở locale tiếng Việt thì `viName === localName`, hàm trả lại đúng chuỗi cũ — không phải ca đặc
 * biệt nào cả, nó rơi ra từ chính phép so.
 */
export function displayCalcName(input: DisplayCalcNameInput): string {
  const stored = input.stored.trim();
  if (stored === '' || input.viName === input.localName) return input.stored;

  /*
   * Tách hậu tố né trùng ' (2)' ra trước khi so: nó do `dedupe()` gắn thêm SAU khi ghép, nên nó
   * không có trong bộ gợi ý gốc. Không tách thì mọi mục trùng tên đều trượt và ở lại tiếng Việt.
   */
  const found = /\s\((\d+)\)$/.exec(stored);
  const base = found === null ? stored : stored.slice(0, found.index).trim();
  const suffix = found === null ? '' : found[0];

  const viNames = suggestCalcNames({
    formulaName: input.viName,
    ...(input.code === undefined ? {} : { code: input.code }),
    ...(input.viResult === undefined ? {} : { resultText: input.viResult }),
    savedAt: input.savedAt,
  });

  const at = viNames.findIndex((name) => key(name) === key(base));
  if (at < 0) return input.stored;

  const localNames = suggestCalcNames({
    formulaName: input.localName,
    ...(input.code === undefined ? {} : { code: input.code }),
    ...(input.localResult === undefined ? {} : { resultText: input.localResult }),
    savedAt: input.savedAt,
  });

  const replacement = localNames[at];
  if (replacement === undefined) return input.stored;
  if (suffix === '') return replacement;

  // Cắt phần THÂN chứ không cắt hậu tố — cùng luật với `dedupe()`, vì hậu tố mới là thứ phân biệt.
  return `${replacement.slice(0, MAX_SAVED_NAME - suffix.length).trim()}${suffix}`;
}

export function suggestCalcNames(input: SuggestCalcNameInput): string[] {
  const formulaName = input.formulaName.trim();
  const code = input.code?.trim().toUpperCase() ?? '';
  const resultText = input.resultText?.trim() ?? '';
  const day = dayLabel(input.savedAt);

  // Không có tên công thức thì ngày đứng thay — tên rỗng là gợi ý vô dụng.
  const base = formulaName === '' ? day : formulaName;
  const withDay = day === '' || base === day ? '' : `${base}${SEPARATOR}${day}`;

  const raw = [
    // Không có mã thì gợi ý đầu lùi về dạng ngày; hỏng nốt cả mốc thời gian thì còn mỗi tên
    // công thức — vẫn hơn một ô tên trống.
    code === '' ? (withDay === '' ? base : withDay) : `${code}${SEPARATOR}${base}`,
    resultText === '' ? '' : `${base}${SEPARATOR}${resultText}`,
    withDay,
  ];

  const taken = new Set((input.existing ?? []).map(key));
  /*
   * Hai gợi ý dựng ra y hệt nhau (thiếu mã thì gợi ý 1 và 3 cùng là 'tên · ngày') thì BỎ hẳn
   * cái sau, không đánh số. Hậu tố ' (2)' chỉ có nghĩa khi né một tên đã nằm trong kho —
   * đem nó ra tách hai dòng giống hệt nhau trong cùng một danh sách gợi ý là bày ra một lựa
   * chọn giả.
   */
  const produced = new Set<string>();
  const names: string[] = [];

  for (const candidate of raw) {
    const bare = trim(candidate);
    if (bare === '' || produced.has(key(bare))) continue;
    produced.add(key(bare));

    const name = dedupe(bare, taken);
    if (name === '') continue;
    names.push(name);
    taken.add(key(name));
  }

  return names;
}
