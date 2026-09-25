/**
 * Tầng APPLICATION — cửa riêng cho dòng công thức của câu điền số.
 *
 * Vì sao là một file riêng chứ không nhét vào barrel `@/application`: barrel nằm trong First Load
 * JS của mọi trang, nên mọi thứ xuất qua đó đều có nguy cơ đi theo. `worked-line.ts` mang cả bộ
 * phân tích cú pháp — thứ chỉ khối câu hỏi mới cần. Nhập qua đường này thì nó rơi vào gói tải muộn
 * của `QuizPanel` (ranh giới `next/dynamic`), không tốn byte nào của First Load JS.
 *
 * Cùng khuôn `@/application/quiz` và `@/application/how-to`: dữ liệu nặng đi cửa riêng, không đi
 * cửa chung. Khác một điểm — hai cửa kia chỉ được đọc LÚC BUILD, còn cửa này chạy trên trình duyệt,
 * vì ô nhập nằm giữa công thức nên hình phải dựng cùng chỗ với ô.
 *
 * Cây cú pháp (`Nut`) đi qua đây dưới dạng KIỂU: giao diện phải tự đi hết cây để vẽ, vì `<input>`
 * nằm trong tử số của phân số nên Domain không thể sinh sẵn một chuỗi HTML rồi trao sang. CON-02
 * vẫn nguyên vẹn — `Nut` là dữ liệu thuần, `src/core` không biết gì về React.
 */

export { blankAccepts, blanksOf, chieuCao, workedShape } from '@/core/quiz/worked-line';
export type { Nut, WorkedShape } from '@/core/quiz/worked-line';
