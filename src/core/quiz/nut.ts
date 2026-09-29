/**
 * Cây công thức của dòng điền số / dòng "Áp vào công thức" — module LÁ, không import gì (29/09/2026).
 *
 * Tách khỏi `worked-line.ts` để bộ VẼ (`CongThucDien.tsx`) dùng được mà không kéo theo bộ phân tích
 * cú pháp: khối Ví dụ thực tế nằm trong First Load JS của cả 111 trang chi tiết và vẽ cây dựng sẵn
 * lúc build, còn bộ phân tích chỉ khối Bài tập (gói tải muộn) cần. `worked-line.ts` xuất lại cả hai
 * thứ ở đây, nên mọi chỗ đang nhập từ đó không phải đổi.
 */

/**
 * Một nút của cây công thức.
 *
 * Xuất ra ngoài vì tầng giao diện phải tự đi hết cây để vẽ: ô nhập nằm TRONG tử số của phân số,
 * nên không thể giao cho Domain sinh sẵn một chuỗi HTML rồi nhét vào. CON-02 vẫn nguyên vẹn —
 * đây là dữ liệu thuần, `src/core` không biết gì về React.
 */
export type Nut =
  | { t: 'so'; raw: string }
  /** Ô trống: `thuTu` là chỗ của nó trong mảng người dùng gõ, `dap` là đáp án đúng. */
  | { t: 'o'; thuTu: number; dap: string }
  | { t: 'cong' | 'tru' | 'nhan' | 'chia' | 'luythua'; a: Nut; b: Nut }
  /**
   * Phép chia vẽ trên MỘT dòng, bằng dấu "÷" — chỉ `themNgoac` sinh ra, cho phép chia nằm bên
   * trong tử hoặc mẫu của một phân số khác. Bộ phân tích không bao giờ tạo nút này.
   */
  | { t: 'chiaDong'; a: Nut; b: Nut }
  /**
   * `san` = ⌊…⌋ làm tròn xuống, `tran` = ⌈…⌉ làm tròn lên (29/09/2026) — cho các công thức mà hình
   * của trang có bước làm tròn: số hợp đồng tối đa, số kỳ DCA. Thiếu chúng thì dòng "Áp vào công
   * thức" của khối Ví dụ ra 6,09 trong khi kết quả là 6.
   */
  | { t: 'can' | 'ln' | 'am' | 'tri' | 'san' | 'tran'; a: Nut }
  /** Dấu ngoặc tròn, do `themNgoac` cài sẵn trước khi trao cho giao diện. */
  | { t: 'ngoac'; a: Nut };

/**
 * Chiều cao của một nhánh, tính theo số tầng phân số.
 *
 * Giao diện dùng con số này để kéo dãn dấu ngoặc và dấu căn cho vừa thứ chúng bọc: CSS không tự
 * biết một `<span>` cao bao nhiêu dòng, mà đo lúc chạy thì lượt dựng đầu tiên trên trình duyệt sẽ
 * khác HTML tĩnh — đúng lớp lỗi hydration mà cả thư mục `src/ui/quiz/` phải tránh. Đếm trên cây là
 * hàm thuần nên máy chủ và trình duyệt luôn ra cùng một con số.
 */
export function chieuCao(nut: Nut): number {
  switch (nut.t) {
    case 'so':
    case 'o':
      return 1;
    case 'chia':
      return chieuCao(nut.a) + chieuCao(nut.b);
    case 'chiaDong':
      return Math.max(chieuCao(nut.a), chieuCao(nut.b));
    case 'am':
    case 'tri':
    case 'san':
    case 'tran':
    case 'can':
    case 'ln':
    case 'ngoac':
      return chieuCao(nut.a);
    case 'luythua':
      return chieuCao(nut.a);
    default:
      return Math.max(chieuCao(nut.a), chieuCao(nut.b));
  }
}
