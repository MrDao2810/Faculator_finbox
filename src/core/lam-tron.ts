/**
 * Làm tròn xuống / lên tới số nguyên, CHỊU được sai số dấu phẩy động (16/10/2026).
 *
 * `Math.floor(450.000.000 × 0,018 ÷ 1.350.000)` về toán là ⌊6⌋ = 6, nhưng máy có thể tính phép chia
 * ra 5,999999999999999 rồi cắt thành 5. Ai bấm máy tính tay đều ra 6. Lỗi thật, đo được trên
 * `co-vi-the-phai-sinh` khi dựng cửa gác "dải thay số chuẩn xác tuyệt đối": `calc` ra 6 chỉ nhờ
 * `1,8 ÷ 100` tình cờ làm tròn lên, còn bấm lại đúng các số in trên dải thì ra 5.
 *
 * Nới một khoảng 1e-9 (tương đối) về phía số nguyên gần nhất trước khi cắt. Ô nhập có tối đa vài
 * chữ số lẻ, nên một thương THẬT SỰ cách số nguyên chưa tới một phần tỷ chỉ có thể là chính số
 * nguyên ấy bị sai số dấu phẩy động đẩy lệch.
 *
 * Module lá, không nhập gì: cả `calc` (`src/core/formulas`) lẫn bộ tính lại cây của dải thay số
 * (`src/core/quiz/nut.ts`, có mặt trong gói của trình duyệt) dùng chung, để hai bên làm tròn MỘT
 * kiểu — khác kiểu là dải in ra một số nguyên khác con số khối Kết quả.
 */
const BUI = 1e-9;

export function lamTronXuong(x: number): number {
  return Math.floor(x + BUI * Math.max(1, Math.abs(x)));
}

export function lamTronLen(x: number): number {
  return Math.ceil(x - BUI * Math.max(1, Math.abs(x)));
}
