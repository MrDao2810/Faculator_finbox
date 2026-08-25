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
