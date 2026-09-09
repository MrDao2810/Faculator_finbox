/**
 * Tầng APPLICATION — gói bộ số liệu đang nhập vào URL để chia sẻ được (FR-19, mở rộng).
 *
 * Chủ dự án chốt: *"1 icon tượng trưng cho share link để người dùng có thể chia sẻ công thức kèm
 * số liệu vừa thao tác"* — và khi được hỏi link mang tới đâu: *"link công thức kèm số liệu ví dụ
 * bên trong. nếu người dùng có thao tác gì thì gửi kèm cả số liệu đã thay đổi đó luôn"*.
 *
 * Nghĩa là link LUÔN mang con số đang nằm trong ô, bất kể chúng đến từ đâu — mặc định của công
 * thức, bộ mẫu vừa nạp, số liệu thật của một mã, hay chính tay người dùng gõ. Không có nhánh
 * "chỉ gửi khi đã sửa": người nhận phải mở ra thấy ĐÚNG màn người gửi đang nhìn, và một link đôi
 * khi mang số đôi khi không là thứ không ai đoán được.
 *
 * ── Vì sao ở tầng này, cạnh `url-state.ts` ────────────────────────────────────────────────────
 *
 * Cùng một việc: đọc/ghi trạng thái màn lên URL. `url-state.ts` lo màn danh sách, file này lo màn
 * chi tiết. Cả hai đều là hàm THUẦN không đọc `window`, nên test được bằng Node và dùng lại được
 * ở cả hai phía ranh giới `next/dynamic`.
 *
 * ── Ba luật của phần GIẢI MÃ, và cả ba đều là chuyện an toàn ─────────────────────────────────
 *
 * Chuỗi này đến từ URL, tức từ người lạ. Nên:
 *
 *   1. **Chỉ nhận khoá có thật trong `spec.variables`.** Khoá lạ bị bỏ im lặng, không ném lỗi —
 *      một link cũ trỏ vào công thức đã đổi tên biến vẫn phải mở được, chỉ là thiếu ô đó.
 *   2. **Chỉ nhận số hữu hạn.** `NaN`/`Infinity` bị loại ngay tại đây, trước khi chạm vào phép
 *      tính — đúng tinh thần FR-06, chặn ở cửa chứ không sửa ở giữa.
 *   3. **Kẹp về miền của biến bằng `clampToSpec()`.** Một link mang `soTien=-1e9` không được phép
 *      đẩy màn vào trạng thái mà chính ô nhập không bao giờ tạo ra được.
 *
 * ── Thứ link KHÔNG mang, và vì sao ────────────────────────────────────────────────────────────
 *
 * Chuỗi giá 248 phiên và bảng dòng tiền không đi vào URL. Một chuỗi như thế đã dài hơn 3.000 ký
 * tự, vượt trần thực tế của trình duyệt lẫn ô chat — mà cắt bớt để vừa thì con số người nhận thấy
 * sẽ khác con số người gửi thấy, đúng loại "số sai trông như số đúng" mà FR-06 tồn tại để chặn.
 * 35 công thức ăn chuỗi giá vì thế nhận link mang phần số RỜI, và màn phải nói ra điều đó.
 */

import { clampToSpec } from '@/core/calc-output';
import type { VariableSpec } from '@/core/types';

/** Tên tham số mang bộ số liệu. Tiếng Việt, cùng nếp `?ma=` và `?luu=` của chính màn chi tiết. */
export const SHARE_INPUTS_PARAM = 'so';

/** Ngăn giữa hai cặp, và giữa khoá với giá trị. Cả hai đều an toàn trong query, không phải mã hoá. */
const PAIR_SEP = '~';
const KV_SEP = '_';

/**
 * Gói bộ số liệu thành một chuỗi ngắn: `key_value~key_value`.
 *
 * KHÔNG dùng JSON rồi `encodeURIComponent`: cùng bộ số ấy ra chuỗi dài gấp ~2,4 lần vì mọi dấu
 * ngoặc và nháy đều thành `%22`/`%7B`, và link chia sẻ là thứ người ta dán vào ô chat.
 *
 * Chỉ gói những khoá có trong `spec.variables`, theo đúng THỨ TỰ khai báo — nhờ vậy cùng một màn
 * luôn sinh ra cùng một chuỗi, và hai link giống nhau thì so sánh được bằng mắt.
 */
export function encodeShareInputs(
  variables: ReadonlyArray<VariableSpec>,
  inputs: Readonly<Record<string, number>>,
): string {
  return variables
    .flatMap((variable) => {
      const value = inputs[variable.key];
      if (value === undefined || !Number.isFinite(value)) return [];
      return [`${variable.key}${KV_SEP}${String(value)}`];
    })
    .join(PAIR_SEP);
}

/**
 * Mở gói chuỗi trên. Trả về đúng những ô đọc được — nơi gọi trộn nó ĐÈ LÊN bộ số hiện có.
 *
 * Trả `Record` chứ không phải `null` khi hỏng: một chuỗi rác cho ra object rỗng, và màn mở ra
 * bình thường với bộ số mặc định. Ném lỗi ở đây là để một ký tự thừa trên URL làm trắng cả trang.
 */
export function decodeShareInputs(
  variables: ReadonlyArray<VariableSpec>,
  raw: string | null | undefined,
): Record<string, number> {
  if (raw === null || raw === undefined || raw.trim() === '') return {};

  const byKey = new Map(variables.map((variable) => [variable.key, variable]));
  const out: Record<string, number> = {};

  for (const pair of raw.split(PAIR_SEP)) {
    const at = pair.indexOf(KV_SEP);
    if (at <= 0) continue;

    const variable = byKey.get(pair.slice(0, at));
    if (variable === undefined) continue;

    const value = Number(pair.slice(at + 1));
    if (!Number.isFinite(value)) continue;

    out[variable.key] = clampToSpec(value, variable);
  }

  return out;
}
