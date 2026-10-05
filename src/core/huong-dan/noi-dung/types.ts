import type { Bilingual } from '../../types';

/**
 * Chữ hướng dẫn RIÊNG của một công thức — ba dòng cho cả bài, cộng một mục cho mỗi ô nhập.
 *
 * Hai lần giao, và lần sau thay đúng một phần của lần trước:
 *
 *   · 03/10/2026 — "HUONG DAN SU DUNG tung cong thuc - 111 cong thuc": bốn dòng mỗi công thức.
 *   · 05/10/2026 — `guide-111.json`: ba dòng đầu GIỐNG 111/111 (đã đo từng chữ, không sửa dòng
 *     nào), còn dòng "Cần nhập" bị thay bằng 269 mục có khoá — xem `oNhap` dưới.
 *
 * Tổng chữ trong kho: 333 dòng cả bài + 433 chuỗi của ô nhập (269 `layODau` + 164 `luuY`).
 *
 * ── Vì sao có kho này, sau khi đợt 5 vừa đi cắt chữ riêng ────────────────────────────────────
 *
 * Đợt 5 bỏ bốn mục in LẠI `explanation.*` — tức bỏ những câu đã có chỗ đứng trên màn. Kho này đi
 * ngược chiều ấy, và nó không mâu thuẫn, vì đây là chữ VIẾT MỚI CHO BÀI chứ không phải bản sao.
 * Đo trên `pe` để thấy khác biệt thật:
 *
 *   · `variables[].description` nói biến LÀ GÌ — "Lợi nhuận sau thuế chia cho số cổ phiếu đang
 *     lưu hành."
 *   · `oNhap.eps.layODau` nói LẤY SỐ ẤY Ở ĐÂU — "Báo cáo tài chính, mục lãi cơ bản trên cổ phiếu."
 *
 * Hai câu trả lời hai câu hỏi khác nhau, và câu thứ hai là câu người dùng đang vướng. Chính tài
 * liệu cũng nhận ra: *"Dòng Cần nhập là phần có giá trị nhất và cũng là phần màn hình hiện chưa
 * có."* Đo lại trên cả 269 ô thì đúng vậy, và đúng tuyệt đối: không ô nào có `layODau` trùng từng
 * chữ với `description` — xem `noi-dung.test.ts`.
 *
 * ── Độ trùng ĐO ĐƯỢC, và chỗ đứng chọn theo nó ───────────────────────────────────────────────
 *
 * Bốn thứ không ngang giá trị nhau, nên chúng không được đối xử như nhau:
 *
 * | Chữ         | Trùng với gì trên màn chi tiết                | Chỗ đứng trong bài                    |
 * | ----------- | --------------------------------------------- | ------------------------------------- |
 * | `deLamGi`   | gần `spec.description` (khối Ý nghĩa)         | dải mở đầu TRANG, không vào khung nào |
 * | `oNhap`     | KHÔNG trùng gì — đo trên cả 269 ô             | mục `#nhap-so` — khung nút "?" mở     |
 * | `docKetQua` | gần `explanation.howToRead` (khối Giải thích) | mục `#doc-ket-qua`, chỉ có ở trang    |
 * | `deSai`     | KHÁC `explanation.commonMistakes`             | mục `#doc-ket-qua`, chỉ có ở trang    |
 *
 * Ba khung bật tại nút "?" mở `#hieu-cong-thuc` · `#nhap-so` · `#doc-bieu-do`. Chỉ `oNhap` lọt vào
 * một khung, và nó là thứ KHÔNG trùng gì. Hai dòng trùng nhiều nhất chỉ sống ở trang đầy đủ, nơi
 * không có khối Ý nghĩa lẫn khối Giải thích để mà trùng. Đó là cách gắn lời phê đợt 5 vào cấu trúc
 * thay vì vào trí nhớ.
 *
 * ── Vì sao KHÔNG để ở i18n, dù tài liệu đề xuất `guide.f.<id>.*` ─────────────────────────────
 *
 * Từ điển `vi.ts` đi vào GÓI JS CỦA MỌI TRANG — `useT()` đọc nó lúc chạy. 766 câu tiếng Việt ở đó
 * là vài chục kB nằm trên mọi màn, kể cả màn không ai mở hướng dẫn. Dự án đã ba lần gặp đúng bài
 * này và ba lần giải cùng một cách: `src/core/how-to/`, `src/core/vi-du/`, `src/core/quiz/` đều là
 * chữ RIÊNG của từng công thức, chỉ `page.tsx` đọc lúc build rồi truyền xuống bằng prop.
 *
 * Kho này nằm trong `src/core/huong-dan/`, nên nó đã sẵn nằm sau cửa chỉ-lúc-build
 * `@/application/huong-dan` mà `build-only-imports.test.ts` đang gác — không cần luật mới.
 *
 * ── `en` là TUỲ CHỌN, và đó là một quyết định có tiền lệ ─────────────────────────────────────
 *
 * Tài liệu chỉ có tiếng Việt. Thay vì dịch vội 766 câu, kho khai `en` tuỳ chọn và `pick()` tự rơi
 * về tiếng Việt — nhánh `value.en.trim() === ''` của nó có sẵn từ trước, đúng cho việc này. Cùng
 * nếp ngân hàng câu hỏi: 205/411 câu chưa có bản tiếng Anh, rơi về tiếng Việt IM LẶNG (câu thông
 * báo `quiz.notTranslated` đã bị bỏ 30/09/2026). `noi-dung.test.ts` đếm thành tiếng con số ấy để
 * nó không lặng lẽ đứng yên mãi.
 */
export interface BaiRieng {
  /** "Để làm gì" — một câu: mở màn này ra thì biết được điều gì. */
  deLamGi: SongNgu;
  /**
   * "Lấy số liệu ở đâu" — MỘT MỤC CHO MỖI Ô NHẬP, khoá là `VariableSpec.key`.
   *
   * Đợt 6 chỗ này là một chuỗi dài ngăn nhau bằng " · ", và `GuideBody` tách theo dấu ấy để in
   * thành danh sách. Nó chạy được nhưng không gắn vào ô nào: 74/111 công thức có số cụm khác số ô,
   * vì nhiều cụm nói chung cho hai ô ("Doanh thu thuần · Giá vốn hàng bán: cùng kỳ, cùng báo cáo").
   * Hệ quả đo được: không thể đặt một nút "?" cạnh MỘT ô mà chỉ hiện phần của ô đó, và đổi tên
   * biến thì chuỗi hướng dẫn trôi khỏi biến mà không gì đỏ.
   *
   * File `guide-111.json` (05/10/2026) đóng đúng chỗ ấy — chủ dự án giao 269 mục có khoá, và phép
   * đo trên Registry thật cho thấy nó khớp tuyệt đối: đúng từng `key` của `spec.variables`, đúng
   * thứ tự, 0 ô thiếu, 0 ô lạ, trên cả 111 công thức. `noi-dung.test.ts` giữ đúng ba điều ấy, nên
   * một ô mới thêm vào `spec.variables` sẽ làm đỏ chứ không lặng lẽ thiếu câu.
   */
  oNhap: Readonly<Record<string, ONhapRieng>>;
  /** "Đọc kết quả" — một câu: số vừa ra nói lên điều gì, ngưỡng nào đáng chú ý. */
  docKetQua: SongNgu;
  /** "Dễ sai" — ĐÚNG MỘT lỗi, lỗi hay gặp nhất. */
  deSai: SongNgu;
}

/**
 * Chữ riêng của MỘT ô nhập.
 *
 * Hai trường, và chúng cố ý không nói cùng một thứ với `VariableSpec`:
 *
 * | Trường                       | Trả lời câu nào       | Ví dụ trên `pe.eps`                          |
 * | ---------------------------- | --------------------- | -------------------------------------------- |
 * | `variables[].label`          | ô này TÊN gì          | "EPS — lợi nhuận trên mỗi cổ phiếu"          |
 * | `variables[].description`    | ô này LÀ GÌ           | "Lợi nhuận sau thuế chia cho số cổ phiếu…"   |
 * | `layODau`                    | lấy số ấy Ở ĐÂU       | "Báo cáo tài chính, mục lãi cơ bản trên CP"  |
 * | `luuY`                       | điền thì DỄ SAI gì    | "Cộng bốn quý gần nhất. Lấy một quý rồi…"    |
 *
 * Đo trên cả 269 ô: KHÔNG ô nào có `layODau` trùng từng chữ với `description`. Nên in hai câu cạnh
 * nhau không thành lặp — đúng lời phê đợt 5 ("không phải viết lại thông tin của phần đó"). Và 20 ô
 * chưa từng có `description` (`pb.price`, cả ba ô của `cagr`, cả ba ô của `lai-tien-gui`…) thì đây
 * là câu duy nhất người đọc có được: bảng biến đang in "—" ở đúng 20 chỗ ấy.
 *
 * Nhãn và đơn vị KHÔNG khai lại ở đây. `bai.ts` lấy chúng từ `spec.variables`, nên đổi nhãn một ô
 * là bài đổi theo — chép vào đây sẽ thành nguồn thứ hai, đúng loại lỗi `spec.usesConstants` đã
 * tránh bằng cách khai khoá chứ không khai giá trị.
 */
export interface ONhapRieng {
  /** Báo cáo nào, dòng nào, bảng nào. Bắt buộc — 269/269 ô đều có. */
  layODau: SongNgu;
  /** Một lưu ý khi điền ô ấy. Tuỳ chọn — 164/269 ô có. */
  luuY?: SongNgu;
}

/**
 * Song ngữ với `en` tuỳ chọn — xem docblock trên.
 *
 * Chuẩn hoá về `Bilingual` (với `en: ''`) ngay ở `bai.ts`, nên không tầng nào phía trên phải biết
 * tới kiểu này: `<Pick>` vẫn nhận đúng `Bilingual` như mọi chữ Domain khác.
 */
export interface SongNgu {
  vi: string;
  en?: string;
}

/** Đưa một `SongNgu` về `Bilingual`; `pick()` tự rơi về tiếng Việt khi `en` rỗng. */
export function songNgu(gia: SongNgu): Bilingual {
  return { vi: gia.vi, en: gia.en ?? '' };
}
