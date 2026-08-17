import katex from 'katex';

/**
 * Dựng ký hiệu toán học từ `spec.latex` — gói WBS 2.4.3, FR-02.
 *
 * ── Bất biến của file này: CHỈ server component được import ────────────────────────────────────
 *
 * `page.tsx` không có `'use client'`, nên với `output: 'export'` nó chạy **đúng một lần trên máy
 * build** và kết quả được nướng thẳng vào HTML tĩnh của 108 trang. Đó là toàn bộ lý do gói này
 * không tốn một byte JS nào phía máy khách — `katex` nặng ~280 kB thô, đưa vào gói trình duyệt là
 * vượt cửa kiểm 170 kB của NFR-PER-04 ngay lập tức.
 *
 * Để file này lọt vào một client component là mất trọn tính chất ấy mà không có cảnh báo nào.
 * Hàng rào ESLint của dự án canh ranh giới TẦNG, không canh được ranh giới server/client, nên chỗ
 * này chỉ có docblock và ca kiểm dung lượng (`npm run size`) canh.
 *
 * ── Vì sao `output: 'mathml'` chứ không phải mặc định `htmlAndMathml` ──────────────────────────
 *
 * Đo trên chính 107 công thức của dự án, không suy đoán:
 *
 * | Chế độ          | 107 CT thô | nén     | Tài sản kèm theo            | Chữ Việt có dấu    |
 * | --------------- | ---------- | ------- | --------------------------- | ------------------ |
 * | `htmlAndMathml` | 414,9 kB   | 20,1 kB | +23 kB CSS, ~20 file font   | **hỏng metric**    |
 * | `html`          | 358,2 kB   | 12,7 kB | +23 kB CSS, ~20 file font   | **hỏng metric**    |
 * | `mathml`        | 55,9 kB    | 6,0 kB  | **không gì cả**             | sạch, 0 cảnh báo   |
 *
 * Con số dung lượng đã đủ để chọn, nhưng thứ thật sự loại hai chế độ kia là cột cuối. Công thức
 * của dự án viết bằng CHỮ TIẾNG VIỆT trong `\text{}` — `\text{Vốn chủ sở hữu}`,
 * `\text{Số CP lưu hành}`. Bộ dựng HTML của KaTeX không có số đo bề rộng cho ký tự có dấu tiếng
 * Việt ("No character metrics for 'ổ'…"), nên nó phải đoán, và font `KaTeX_Main` cũng không chứa
 * những glyph ấy. Nhánh MathML không cần metric: trình duyệt tự dàn trang bằng font của chính
 * trang, nên chữ Việt hiện đúng như mọi chữ khác trên màn.
 *
 * Mỗi trang chỉ mang MỘT công thức, nên chi phí thật là 294–1326 B thô (~229–452 B nén), không
 * phải con số tổng ở bảng trên.
 *
 * ── Ba điều đã kiểm, ghi lại để khỏi kiểm lại ─────────────────────────────────────────────────
 *
 * 1. **Cả 108 chuỗi `latex` đều dựng được**, 0 lỗi, 0 cảnh báo ở `strict: false`.
 * 2. **KaTeX tự bẻ vài ký tự có dấu thành dấu chồng** — "ố" thành `<mover>` hai tầng trên "o".
 *    Đây là hành vi của thư viện, không phải lỗi dữ liệu: nguồn đã ở dạng NFC (U+1ED1), đã kiểm
 *    cả 108 chuỗi `latex`, `name.vi` và `expression` — không chuỗi nào lệch NFC. Chụp màn bằng
 *    Chrome thật cho thấy kết quả hiện **đúng y chữ "ố"**, nên không phải xử lý gì.
 * 3. **Không cần lọc HTML.** Đầu vào là hằng số trong repo, không phải chữ người dùng gõ, và
 *    `trust` để mặc định `false` nên KaTeX từ chối mọi lệnh sinh liên kết hay thuộc tính tuỳ ý.
 */

/**
 * Chuỗi MathML của một công thức, đã sẵn sàng cho `dangerouslySetInnerHTML`.
 *
 * Ném lỗi nếu `latex` hỏng, và đó là CỐ Ý: `throwOnError` bật thì một chuỗi sai cú pháp làm
 * **đỏ `next build`** thay vì lặng lẽ in một khối chữ đỏ vào trang tĩnh của người dùng. Cùng nếp
 * với FR-06 — thà hỏng ồn còn hơn hỏng im.
 */
export function latexToMathml(latex: string): string {
  return katex.renderToString(latex, {
    output: 'mathml',
    displayMode: true,
    throwOnError: true,
    // `warn` sẽ in hàng trăm dòng "Unrecognized Unicode character" cho mỗi chữ Việt có dấu, làm
    // ngập log build mà không nói thêm điều gì — nhánh MathML không dùng tới bảng ký hiệu ấy.
    strict: false,
  });
}
