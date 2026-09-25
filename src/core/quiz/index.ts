/**
 * Tầng DOMAIN — chỉ mục bộ câu hỏi kiểm tra hiểu bài (WF-19), gói triển khai 23/09/2026.
 *
 * ── CẢNH BÁO KÍCH THƯỚC: đừng import file này từ client component ───────────────────────────
 *
 * 206 câu hỏi là khoảng 150 kB chữ. Kéo cả chỉ mục vào gói JS của 111 trang chi tiết là nhân
 * một khối chữ mà mỗi trang chỉ cần 1–5 câu của chính nó lên 111 lần, trong khi `npm run size`
 * vốn đã đỏ. Đường đi đúng giống hệt khung "cách tính": `page.tsx` (server component) đọc ở đây
 * lúc build qua `@/application/quiz`, lấy phần của đúng công thức ấy, rồi truyền xuống bằng
 * prop. `build-only-imports.test.ts` gác danh sách nơi được phép import.
 *
 * Chỉ mục KHÔNG xuất qua barrel `@/application` vì lý do đó — cùng tiền lệ `how-to.ts`.
 */

import { BOI_SO } from './items/valuation-multiples';
import { CA_NHAN } from './items/personal';
import { CHI_SO_DN } from './items/fundamentals';
import { DCF } from './items/valuation-dcf';
import { KY_THUAT } from './items/technical';
import { LOI_SUAT } from './items/returns';
import { PHAI_SINH } from './items/derivatives';
import { PHI_THUE } from './items/fees';
import { RUI_RO } from './items/risk';
import { THUC_HANH } from './items/thuc-hanh';
import { TINH_TOAN } from './items/tinh-toan';
import type { QuizItem } from './types';

export * from './types';

/**
 * Cả ngân hàng, theo đúng thứ tự chín nhóm đã soạn.
 *
 * Thứ tự trong mỗi nhóm là thứ tự soạn, và cũng là thứ tự hỏi: câu về cách đọc kết quả đứng
 * trước câu về điều kiện áp dụng, vì hiểu con số là điều kiện để bàn tiếp nó dùng được ở đâu.
 */
export const QUIZ_ITEMS: ReadonlyArray<QuizItem> = [
  ...BOI_SO,
  ...DCF,
  ...CHI_SO_DN,
  ...RUI_RO,
  ...KY_THUAT,
  ...LOI_SUAT,
  ...PHAI_SINH,
  ...PHI_THUE,
  ...CA_NHAN,
  ...TINH_TOAN,
  ...THUC_HANH,
];

/*
 * Ngưỡng "công thức mới có ít câu" (WF-19D · S18) KHÔNG ở đây.
 *
 * Nó từng là `QUIZ_MIN_FOR_PROGRESS = 3` trong file này, nhưng không ai import lúc chạy: ngưỡng
 * thật là tham số mặc định `minForProgress` của `QuizBody`, và tầng giao diện không với tới
 * module này được (CON-03, cộng cửa gác chỉ-đọc-lúc-build). Hai con số 3 nằm hai nơi, đổi chỗ này
 * thì màn hình không đổi theo — nên bỏ hẳn chỗ này, giữ một nguồn sự thật ở `QuizBody.tsx`.
 */

function groupByFormula(): ReadonlyMap<string, ReadonlyArray<QuizItem>> {
  const map = new Map<string, QuizItem[]>();
  for (const item of QUIZ_ITEMS) {
    const list = map.get(item.formulaId);
    if (list === undefined) map.set(item.formulaId, [item]);
    else list.push(item);
  }
  return map;
}

const BY_FORMULA = groupByFormula();

/**
 * Bộ câu hỏi của một công thức — mảng RỖNG là câu trả lời hợp lệ, không phải lỗi.
 *
 * HÔM NAY không công thức nào rỗng: `tiet-kiem-muc-tieu` từng là công thức duy nhất trống và đã
 * có câu từ lô 1 (23/09/2026). Nhưng nhánh rỗng vẫn phải giữ, ở đây và ở `QuizBody`: thêm một
 * công thức mới vào Registry là nó rỗng ngay, và lúc ấy trạng thái rỗng là cách trung thực duy
 * nhất — độn cho đủ nghĩa là bịa. Chủ dự án đã chốt giữ nhánh này thay vì ẩn hẳn khối.
 */
export function quizFor(formulaId: string): ReadonlyArray<QuizItem> {
  return BY_FORMULA.get(formulaId) ?? [];
}

/**
 * Công thức nào đang có bao nhiêu câu — dùng cho ca kiểm và báo cáo nội dung.
 *
 * `knownIds` truyền vào chứ không import `FORMULA_SUMMARIES`, đúng tiền lệ `formula-usage.ts`:
 * kéo chỉ mục 111 công thức vào đây là kéo nó theo vào mọi chỗ import module này.
 */
export function quizCoverage(knownIds: ReadonlyArray<string>): ReadonlyMap<string, number> {
  const cover = new Map<string, number>();
  for (const id of knownIds) cover.set(id, quizFor(id).length);
  return cover;
}
