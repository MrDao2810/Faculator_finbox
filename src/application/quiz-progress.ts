/**
 * Tầng APPLICATION — kết quả bài kiểm tra hiểu bài, lưu trên máy người dùng (WF-19 · S8).
 *
 * Cùng khuôn `formula-usage.ts`: phần thuần nằm ở đây nên test được bằng Node; phần chạm
 * `localStorage` do màn chi tiết gọi trong `useEffect`.
 *
 * LDR-04 · NFR-SEC-01: chỉ lưu id công thức, số câu đúng và mã câu đã sai — nằm trên máy, không
 * gửi đi đâu. Sản phẩm không có backend (SRS mục 3), nên xoá dữ liệu trình duyệt là mất kết quả.
 * Khối tổng kết nói thẳng điều đó với người dùng thay vì để họ tưởng điểm được cất ở đâu đó.
 */

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const QUIZ_PROGRESS_KEY = 'ffb.quiz.v1';

/**
 * Giữ kết quả của bao nhiêu công thức.
 *
 * 40 — rộng hơn hẳn số công thức một người thường học tới trong vài tuần, mà vẫn chỉ khoảng
 * 4 kB. Đầy chỗ thì đuổi mục CŨ NHẤT: khác với lịch sử mở công thức, ở đây không có "điểm dùng"
 * để xếp hạng, và kết quả cũ thì đúng là thứ ít giá trị nhất.
 */
export const MAX_QUIZ_ENTRIES = 40;

/** Id công thức là slug; mọi thứ khác là rác đọc lên từ máy người dùng. */
const ID_PATTERN = /^[a-z0-9-]{1,40}$/;

/** Mã câu do ngân hàng sinh: Q001… */
const MA_CAU_PATTERN = /^Q\d{3}$/;

/** Kết quả một lần làm bài của một công thức. */
export interface QuizProgress {
  /** Id công thức. */
  id: string;
  /** Số câu trả lời đúng. */
  right: number;
  /** Tổng số câu của lần làm ấy — lưu lại vì ngân hàng có thể dài thêm sau này. */
  total: number;
  /** Mã những câu đã trả lời sai, để nút "Ôn lại câu sai" biết hỏi lại câu nào. */
  wrong: ReadonlyArray<string>;
  /** Mốc làm bài, epoch ms. */
  at: number;
}

/** Một phần tử đọc lên có dùng được không? Trả về bản đã làm sạch, hoặc `null`. */
function cleanEntry(item: unknown): QuizProgress | null {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return null;

  const { id, right, total, wrong, at } = item as Record<string, unknown>;

  if (typeof id !== 'string' || !ID_PATTERN.test(id)) return null;
  if (typeof at !== 'number' || !Number.isFinite(at) || at <= 0) return null;
  if (typeof total !== 'number' || !Number.isInteger(total) || total <= 0) return null;
  if (typeof right !== 'number' || !Number.isInteger(right) || right < 0) return null;
  // Đúng nhiều hơn tổng là dữ liệu vô nghĩa — bỏ hẳn chứ đừng kẹp, vì không biết vế nào sai.
  if (right > total) return null;

  const sach = Array.isArray(wrong)
    ? wrong.filter((ma): ma is string => typeof ma === 'string' && MA_CAU_PATTERN.test(ma))
    : [];

  return { id, right, total, wrong: sach.slice(0, total), at };
}

/**
 * Đọc kết quả từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném lỗi: chuỗi hỏng hay lẫn phần tử rác thì bỏ phần ấy, không làm mất cả
 * danh sách. Mất kết quả thì khối chỉ trở về trạng thái chưa làm bài; ném lỗi thì hỏng cả màn.
 */
export function parseQuizProgress(raw: string | null | undefined): QuizProgress[] {
  if (raw === null || raw === undefined || raw.trim() === '') return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const clean: QuizProgress[] = [];
  for (const item of parsed) {
    const entry = cleanEntry(item);
    if (entry === null) continue;
    if (clean.some((existing) => existing.id === entry.id)) continue;
    clean.push(entry);
    if (clean.length >= MAX_QUIZ_ENTRIES) break;
  }
  return clean;
}

/** Chuỗi JSON để ghi vào localStorage. */
export function serializeQuizProgress(list: ReadonlyArray<QuizProgress>): string {
  return JSON.stringify(list.slice(0, MAX_QUIZ_ENTRIES));
}

/** Kết quả gần nhất của một công thức, hoặc `null` nếu chưa làm bao giờ. */
export function progressFor(
  list: ReadonlyArray<QuizProgress>,
  formulaId: string,
): QuizProgress | null {
  return list.find((entry) => entry.id === formulaId) ?? null;
}

/**
 * Ghi kết quả một lần làm bài, trả về mảng mới đã sắp theo mốc giảm dần.
 *
 * Làm lại thì GHI ĐÈ kết quả cũ của chính công thức ấy, không cộng dồn: khối tổng kết hỏi "lần
 * này bạn nắm tới đâu", không phải "từ trước tới nay bạn làm bao nhiêu câu".
 *
 * Đầu vào vô nghĩa thì trả bản sao nguyên vẹn — ghi hỏng còn tệ hơn không ghi.
 */
export function recordQuizResult(
  list: ReadonlyArray<QuizProgress>,
  result: QuizProgress,
): QuizProgress[] {
  const sach = cleanEntry(result);
  if (sach === null) return [...list];

  const rest = list.filter((entry) => entry.id !== sach.id);
  return [sach, ...rest].sort((a, b) => b.at - a.at).slice(0, MAX_QUIZ_ENTRIES);
}
