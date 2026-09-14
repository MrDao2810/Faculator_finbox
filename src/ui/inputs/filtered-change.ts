import type { ChangeEvent, KeyboardEvent } from 'react';

/**
 * Số ký tự vừa bị loại khỏi một ô mà NGƯỜI DÙNG (và bộ gõ) vẫn tưởng là đã gõ vào được.
 *
 * WeakMap chứ không phải state React: con số này không vẽ ra gì cả, để nó vào state là mỗi phím
 * gõ thêm một lượt render cho không. Khoá là chính phần tử DOM nên ô rời khỏi cây là mục tự tiêu.
 */
const choXoaBu = new WeakMap<HTMLInputElement, number>();

/** Trần cộng dồn — gõ sai liên tiếp quá chừng này thì thôi, đừng nuốt phím xoá vô hạn. */
const TRAN_BU = 8;

/** Phím bổ trợ: bấm chúng không dời con trỏ nên không cắt chuỗi "vừa gõ nhầm". */
const BO_TRO = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'AltGraph']);

/**
 * Lọc ký tự của một ô nhập ngay trong `onChange`, GIỮ NGUYÊN vị trí con trỏ.
 *
 * ── Vì sao lọc ở `onChange` chứ không ở `onBeforeInput` hay `onPaste` ─────────────────────────
 *
 * `onChange` là phễu DUY NHẤT mà mọi đường sửa nội dung đều đi qua: gõ phím, dán, kéo-thả, IME
 * chốt chữ, autofill, hoàn tác. Hai lựa chọn kia mỗi cái chỉ che một đường, mà `onBeforeInput`
 * của React còn không phải sự kiện `beforeinput` gốc — nó là sự kiện tổng hợp dựng từ
 * `compositionend`/`keypress`/`textInput`, nên phụ thuộc trình duyệt và mong manh trong jsdom.
 *
 * ── Vì sao phải tự đặt lại con trỏ ───────────────────────────────────────────────────────────
 *
 * Ô là controlled: khi ký tự bị loại ở GIỮA chuỗi, giá trị state không đổi nên React không vẽ
 * lại, nhưng nó vẫn ghi `node.value` về đúng prop sau khi sự kiện chạy xong — và trình duyệt đẩy
 * con trỏ về CUỐI ô. Gõ nhầm một chữ ở giữa '92.000' là con trỏ văng ra đuôi.
 *
 * Nhánh sửa con trỏ chỉ chạy khi thật sự có ký tự bị loại (`kept === typed` thì thoát ngay), nên
 * mọi lượt gõ hợp lệ không tốn thêm gì.
 *
 * Hai điều nơi gọi phải giữ:
 *
 *   1. **Chỉ dùng cho `type="text"`.** `setSelectionRange` ném lỗi trên `type="date"`/`"number"`.
 *   2. **Phải đưa đúng chuỗi trả về vào state.** Nếu state khác `kept` thì React ghi đè lại và
 *      con trỏ nhảy y như cũ — tức là mất đúng thứ hàm này sinh ra để giữ.
 *   3. **Phải gắn kèm `guardFilteredDelete` vào `onKeyDown`.** Không có nó thì ô ăn mất chữ số
 *      thật — xem docblock của hàm ấy; đây không phải tuỳ chọn.
 */
export function filterTypedValue(
  event: ChangeEvent<HTMLInputElement>,
  keep: (text: string) => string,
): string {
  const el = event.currentTarget;
  const typed = el.value;
  const kept = keep(typed);

  if (kept === typed) {
    choXoaBu.set(el, 0);
    return kept;
  }

  const boDi = typed.length - kept.length;
  /*
   * Chỉ cộng dồn cho thao tác GÕ MỘT PHÍM (loại đúng một ký tự). Dán '100 cổ phiếu' loại chín ký
   * tự cùng lúc, mà người dán thì thấy ngay ô chỉ nhận '100' — họ không gõ xoá để bù, nên nuốt
   * chín phím xoá sau đó là cướp phím của họ.
   */
  const truoc = choXoaBu.get(el) ?? 0;
  choXoaBu.set(el, boDi === 1 ? Math.min(truoc + 1, TRAN_BU) : 0);

  /* Vị trí mới = số ký tự SỐNG SÓT nằm trước con trỏ cũ. */
  const caret = el.selectionStart ?? typed.length;
  const moi = keep(typed.slice(0, caret)).length;

  /* Ghi thẳng vào DOM TRƯỚC khi đặt con trỏ: bỏ bước này thì React tự khôi phục `value` sau sự
     kiện và con trỏ lại văng về cuối. Ghi rồi thì lượt vẽ kế tiếp thấy `value` đã bằng `kept`,
     React không đụng nữa, con trỏ đứng yên. */
  el.value = kept;
  el.setSelectionRange(moi, moi);
  return kept;
}

/**
 * Nuốt đúng bấy nhiêu phím XOÁ LÙI ứng với số ký tự vừa bị `filterTypedValue()` loại đi.
 *
 * ── Lỗi mà hàm này sinh ra để chữa ───────────────────────────────────────────────────────────
 *
 * Chủ dự án báo: *"đang nhập số mà bấm nhầm sau text chữ số thì số trong ô lại bị xóa đi"*. Gõ
 * '100', bấm nhầm 'a', rồi bấm Backspace để xoá chữ vừa gõ nhầm — nhưng 'a' đã bị loại từ trước,
 * nên phím xoá ăn thẳng vào chữ số thật và ô còn '10'.
 *
 * **Với bộ gõ tiếng Việt thì phím xoá ấy là TỰ ĐỘNG**, người dùng không bấm gì cả: Unikey/EVKey
 * gõ 'a' rồi 's' để ra 'á' bằng cách gửi Backspace rồi chèn 'á'. Mỗi chữ có dấu là một chữ số
 * biến mất, gõ vài lần là ô sạch trơn. Đây là cái giá của việc lọc âm thầm, và nó chỉ xuất hiện
 * SAU khi cửa lọc ra đời — trước đó 'a' nằm lại trong ô nên phím xoá ăn đúng vào 'a'.
 *
 * ── Vì sao đếm chứ không chỉ một cờ bật/tắt ──────────────────────────────────────────────────
 *
 * Bấm nhầm hai chữ liền thì người dùng cũng bấm xoá hai lần. Đếm thì lần xoá thứ ba mới ăn vào
 * chữ số — đúng số lần họ tưởng mình phải xoá. Một cờ đơn sẽ để lần thứ hai ăn mất số.
 *
 * Bộ đếm đặt lại về 0 khi: có một lượt nhập hợp lệ, khi người dùng bấm phím khác (kể cả phím
 * điều hướng — con trỏ đã dời đi thì phím xoá không còn là "xoá chữ vừa nhầm" nữa), và khi rời ô
 * qua `resetFilteredDelete`.
 *
 * KHÔNG nuốt khi đang bôi đen một vùng: lúc ấy người dùng chủ ý xoá đúng vùng đó, không phải xoá
 * ký tự vừa gõ.
 */
export function guardFilteredDelete(event: KeyboardEvent<HTMLInputElement>): void {
  const el = event.currentTarget;

  if (event.key !== 'Backspace') {
    /*
     * Phím ĐIỀU HƯỚNG/chức năng chấm dứt chuỗi "vừa gõ nhầm": con trỏ đã dời đi thì phím xoá tiếp
     * theo không còn là xoá ký tự vừa nhầm nữa.
     *
     * Phím KÝ TỰ thì không đụng tới bộ đếm — để `filterTypedValue` quyết, vì chỉ nó mới biết ký
     * tự ấy có lọt cửa hay không. Đặt lại ở đây là hỏng phép cộng dồn: bấm nhầm 'ab' thì keydown
     * của 'b' xoá mất lượt đếm của 'a', và phím xoá thứ hai lại ăn vào chữ số.
     *
     * Phím bổ trợ (Shift, Control…) cũng để yên: bấm Shift để gõ chữ hoa không phải là dời con trỏ.
     */
    const laKyTu = [...event.key].length === 1;
    const laBoTro = BO_TRO.has(event.key);
    if (!laKyTu && !laBoTro) choXoaBu.set(el, 0);
    return;
  }

  const con = choXoaBu.get(el) ?? 0;
  if (con <= 0) return;

  choXoaBu.set(el, con - 1);
  if (el.selectionStart !== el.selectionEnd) return;

  event.preventDefault();
}

/** Quên chuỗi "vừa gõ nhầm" — gọi khi rời ô, hoặc khi con trỏ được đặt lại bằng chuột. */
export function resetFilteredDelete(el: HTMLInputElement): void {
  choXoaBu.set(el, 0);
}
