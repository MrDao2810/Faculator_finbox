/**
 * Tầng DOMAIN — mô hình bài "Hướng dẫn sử dụng" của MỘT công thức (WF-21, 02/10/2026).
 *
 * ── Bài này trả lời câu gì ───────────────────────────────────────────────────────────────────
 *
 * Chủ dự án: *"Ai muốn xem lúc nào thì bấm vào là xem được, trong hướng dẫn sử dụng có link để
 * bấm vào các phần luôn là đẹp nhất."* Đọc ra: hướng dẫn là chỗ TRA CỨU TẠI CHỖ lúc đang vướng —
 * "giờ tôi phải làm gì / số này lấy ở đâu / sao ô kết quả trống" — chứ không phải tài liệu đọc từ
 * đầu đến cuối. Bản vẽ và lý lẽ đầy đủ ở `docs/wf21/README.md`.
 *
 * Hệ quả nằm thẳng trong kiểu dữ liệu dưới đây: đơn vị nội dung là MỤC, mỗi mục một neo `#`, và
 * `mucCo` nói mục nào có thật trong bài này. Một bài không có đủ năm mục là chuyện bình thường.
 *
 * ── Đợt 5 (03/10/2026) ĐẢO HƯỚNG NỘI DUNG: bài nói VIỆC PHẢI LÀM, không nói lại thông tin ────
 *
 * Đợt 1–4 suy bài ra từ `explanation.*` và `variables[].description`. Chủ dự án xem rồi chốt:
 * *"đây là hướng dẫn sử dụng nên khi bấm vào đó thì nó là hướng dẫn sử dụng như nào chứ không phải
 * viết lại thông tin của phần đó"*. Lời phê ấy đo được, và số đo ủng hộ nó hoàn toàn:
 *
 *   · `#dung-de-lam-gi` in `explanation.whenToUse` — đúng câu khối "Giải thích cho người mới"
 *     đang in, cách nút "?" cũ đúng một hàng.
 *   · `#doc-ket-qua` in `explanation.howToRead`, `#sai-lam` in `explanation.commonMistakes` —
 *     hai mục nữa của cùng khối ấy.
 *   · `#can-so-gi` in bảng ba cột nhãn · đơn vị · mô tả. Nhãn và đơn vị đang nằm ngay cạnh, trên
 *     chính ô nhập; mô tả thì đã có nguyên một "Bảng biến đầu vào" ba cột ở cuối trang in đủ.
 *
 * Tức bốn trong sáu mục là bản sao thứ hai (có mục là thứ ba) của chữ người đọc vừa đi qua. Một
 * cửa gác thậm chí ghim đúng điều ấy: `huong-dan.test.ts` đòi `dungKhiNao`/`cachDoc`/`saiLam`
 * phải `toEqual` `spec.explanation.*` NGUYÊN VĂN.
 *
 * Năm mục mới đều là VIỆC: đọc hình công thức thế nào · số vào màn bằng đường nào · có con số rồi
 * thì làm gì tiếp · đường trên biểu đồ đọc ra sao · ô kết quả trống thì sửa thế nào. Không mục nào
 * còn đọc `explanation.*`.
 *
 * ── Vì sao vẫn SUY RA, không viết tay 111 bài ────────────────────────────────────────────────
 *
 * Lập luận không đổi, chỉ đổi thứ được suy. Trước: suy chữ NỘI DUNG từ `explanation.*` (sai hướng,
 * vì chữ ấy đã có chỗ đứng). Nay: suy CỜ từ Registry, còn câu chữ là chuỗi i18n dùng chung cho cả
 * 111 bài — vì thao tác thì 111 công thức giống nhau, chỉ khác ở việc màn nào có nút nào.
 *
 * Giá phải trả vẫn thế và vẫn đúng: cờ nào Registry không trả lời được thì mục ấy KHÔNG có. 9
 * công thức `chartType: 'none'` không có mục "Đọc biểu đồ"; 11 công thức không khai ca hỏng nào
 * thì không có mục "Khi kết quả hiện _ _". **Thiếu mục là đúng, bịa mới là sai.**
 *
 * Và một cờ phải gắn chứ không được nói chung — đo được: trên thẻ Công thức, rê vào một ký hiệu
 * KHÔNG CÓ khung "cách tính" thì không ra gì cả (`hasHowTo` chặn ngay ở tầng điểm chạm, không có
 * cả con trỏ bàn tay). 61/111 công thức có khung, 50 công thức không có. Một câu "rê vào ký hiệu
 * để xem cách tính" in cho cả 111 bài là 50 bài dạy một cú rê không làm gì.
 *
 * ── Không có trường "hướng dẫn thao tác" nào trong Registry, và không nên có ──────────────────
 *
 * Dự án đã ba lần gỡ loại chữ ấy khỏi màn làm việc (`example.editHint` 10/09/2026,
 * `tile.editHint` 01/10/2026, và luật ở `vi.ts`: *"Nhãn của một ô nhập nên gọi tên thứ nó nhận,
 * không mang theo hướng dẫn"*). Chữ thao tác không bị cấm — nó bị cấm ĐỨNG CHẮN giữa việc đang
 * làm. Ở đây nó được chào đón, nhưng vẫn không thành trường của `FormulaSpec`: bài chỉ khai CỜ,
 * câu chữ nằm ở từ điển i18n.
 *
 * Hai câu đợt này mang về chính là bằng chứng cho luật ấy. `chart.applyHintReady` ("Bấm vào biểu
 * đồ để áp dụng giá trị đó vào ô nhập.") và `chart.applyHintTimeAxis` bị bỏ khỏi màn ngày
 * 14/09/2026 theo yêu cầu chủ dự án, và chú thích tại chỗ ghi lại cái giá: *"Không còn câu nào nói
 * ra điều ấy, nên cú bấm đầu tiên trên những màn đó trông như tính năng không hoạt động."* Tính
 * năng vẫn còn nguyên. Nó về mục `#doc-bieu-do` — sau một cú bấm người đọc tự chọn, không phải một
 * dòng chữ dưới hình.
 */

import type { ChartType } from '../registry/types';
import type { Bilingual, Level, WarningCode } from '../types';

/**
 * Chữ riêng ĐÃ CHUẨN HOÁ về `Bilingual` — `en` rỗng thì `pick()` tự rơi về tiếng Việt.
 *
 * Khai lại ở đây chứ nhập thẳng từ `./noi-dung/types`, vì file này là module LÁ mà cả
 * `@/application` lẫn `@/ui` nhập kiểu từ đó. Kéo theo một import tới kho chữ sẽ mở đường cho ai
 * đó vô tình nhập luôn dữ liệu.
 */
export interface BaiRiengDaChuan {
  deLamGi: Bilingual;
  /** Một mục cho mỗi ô nhập, ĐÚNG thứ tự `spec.variables` — xem `ONhapHuongDan`. */
  oNhap: ReadonlyArray<ONhapHuongDan>;
  docKetQua: Bilingual;
  deSai: Bilingual;
}

/**
 * Chữ "lấy số ở đâu" của MỘT ô nhập, đã ghép nhãn từ `spec.variables`.
 *
 * Ba điều về khuôn này là có lý do, không phải tiện tay:
 *
 * 1. **`nhan` lấy từ `spec.variables[].label`, kho chữ không khai lại.** Đổi nhãn một ô là bài đổi
 *    theo. Một bản sao ở kho chữ sẽ lệch ngay lần đầu ai đó sửa nhãn, và lint không thấy được —
 *    đúng loại lỗi `spec.usesConstants` đã tránh bằng cách khai KHOÁ chứ không khai giá trị.
 * 2. **Thứ tự theo `spec.variables`, không theo thứ tự gõ trong kho.** Bài liệt kê ô theo đúng thứ
 *    tự khối Số liệu bày chúng, nên mắt người đọc đi từ trên xuống là khớp với màn. `bai.ts` duyệt
 *    `spec.variables` rồi tra kho, chứ không duyệt kho.
 * 3. **`nangCao` phải có mặt.** 12 trong 269 ô chỉ hiện ở chế độ Nâng cao. Bài chỉ vào một ô mà
 *    người đọc không tìm thấy trên màn là đúng lỗi đợt 5 đã trả giá một lần: `duongNapSo` luôn kê
 *    "Nạp mẫu" trong khi 38 công thức không bày nút ấy. Một dấu nhỏ ở 12 ô ấy là cách rẻ nhất để
 *    không lặp lại.
 *
 * Đơn vị thì KHÔNG mang sang: ô nhập trên màn đã in đơn vị bên phải nó, và chỗ nào cái bẫy nằm ở
 * đơn vị thì `luuY` nói thẳng ("1,47 tỷ cổ phiếu thì nhập 1470").
 */
export interface ONhapHuongDan {
  /** `VariableSpec.key` — khoá React của hàng, và thứ duy nhất phân biệt hai ô trùng nhãn. */
  key: string;
  nhan: Bilingual;
  /** Báo cáo nào, dòng nào, bảng nào. */
  layODau: Bilingual;
  /** Một lưu ý khi điền ô ấy; 164/269 ô có. */
  luuY?: Bilingual;
  /** Ô chỉ hiện ở chế độ Nâng cao — 12/269 ô. */
  nangCao: boolean;
}

/**
 * Năm mục của một bài. Mã mục cũng chính là neo `#` trên URL, nên nó là HỢP ĐỒNG URL:
 * đổi một chuỗi ở đây là mọi link người dùng đã copy gửi đi bị gãy.
 *
 * Cả năm chuỗi đổi hết ở đợt 5, và đó là việc CHỈ làm được một lần: tính năng chưa commit, chưa
 * ra bản nào, nên chưa có link nào tồn tại để gãy. Từ bản phát hành đầu tiên trở đi thì mỗi chuỗi
 * ở đây là một lời hứa, và thêm mục mới là cách duy nhất.
 *
 * Mục cũ, giữ lại để ai đọc git log không tưởng là xoá nhầm: `dung-de-lam-gi` · `can-so-gi` ·
 * `nap-so` · `sai-lam` (đợt 5), rồi `hieu-cong-thuc` (đợt 8). Bốn cái đầu in lại `explanation.*`
 * hoặc bảng ô nhập; `nap-so` thì KHÔNG bị bỏ mà nhập vào `nhap-so` cùng với phần còn dùng được
 * của `can-so-gi`.
 *
 * `hieu-cong-thuc` đi vì một lý do khác hẳn, và lý do ấy phải đọc được: đợt 8 (05/10/2026) chủ dự
 * án chốt bài chỉ được mang chữ trong `guide-111.json` — *"câu thừa trước đó thì bỏ đi, chỉ để lại
 * những câu đã tạo trong file tôi gửi thôi"*. File ấy không có chữ nào cho việc đọc HÌNH công
 * thức, nên mục này không còn gì để in. Nó không bị chê, nó hết nội dung. Có chữ cho nó thì dựng
 * lại là thêm một chuỗi vào `MucId` và một nhánh ở `GuideMuc`.
 *
 * Viết không dấu vì nó đi vào URL, cùng lẽ với slug công thức.
 */
export type MucId = 'nhap-so' | 'doc-ket-qua' | 'doc-bieu-do' | 'ket-qua-trong';

/**
 * Thứ tự cố định của năm mục — mục lục và thân bài đọc chung mảng này.
 *
 * Thứ tự là một lập luận, không phải thẩm mỹ: nó đi theo đúng đường mắt người dùng trên màn thật
 * (hình công thức → khối Số liệu → khối Kết quả → khối Biểu đồ), rồi mới tới mục chữa lỗi. Ba mục
 * đầu cũng là ba chỗ có nút "?" trên màn, nên bấm ở đâu mở ra mục của đúng chỗ ấy.
 */
export const THU_TU_MUC: ReadonlyArray<MucId> = [
  'nhap-so',
  'doc-ket-qua',
  'doc-bieu-do',
  'ket-qua-trong',
];

/*
 * ── Mộ chí: mười cờ của đợt 5–7 ─────────────────────────────────────────────────────────────
 *
 * `coKhungCachTinh` · `hinhNhieuDong` · `duongNapSo` (và kiểu `DuongNapSo`) · `soPhienToiThieu` ·
 * `oNhanTuCongThuc` (và kiểu cùng tên) · `coONangCao` · `hangSo` · `ghiChuPhamVi` · `coBocTach` ·
 * `coTrucThoiGian` đã BỎ ngày 05/10/2026.
 *
 * Không cờ nào sai, và vài cờ trong số đó đo được những thứ không dễ đo lại (`soPhienToiThieu`
 * chạy `calc` thật cho tới khi hết báo thiếu chuỗi; `coTrucThoiGian` đối chiếu khớp `historyPlan()`
 * 111/111). Chúng đi vì thứ chúng điều khiển đã đi: mỗi cờ bật tắt một CÂU DÙNG CHUNG trong i18n,
 * và chủ dự án chốt bài chỉ được mang chữ trong `guide-111.json` — *"câu thừa trước đó thì bỏ đi,
 * chỉ để lại những câu đã tạo trong file tôi gửi thôi"*. Một cờ không còn câu nào để bật là dữ
 * liệu chết, và dữ liệu chết tệ hơn không có: nó trông như đang làm việc gì đó.
 *
 * Cần lại thì `git log` còn nguyên phép suy của từng cái. Đừng dựng lại cờ trước khi có câu cho nó.
 */

/** Một bài hướng dẫn hoàn chỉnh của một công thức. */
export interface BaiHuongDan {
  id: string;
  ten: Bilingual;
  moTaNgan: Bilingual;
  nhomId: string;
  muc: Level;

  /* ── Mục "Đọc biểu đồ" ─────────────────────────────────────────────────────────────────── */

  /**
   * Loại biểu đồ của công thức, hoặc `undefined` với 9 công thức `chartType: 'none'`.
   *
   * `undefined` thì mục "Đọc biểu đồ" không có trong bài — màn của chúng cũng không dựng khối biểu
   * đồ, nên một mục dạy đọc hình ở đó là dạy đọc một thứ không có trên màn.
   *
   * Trước 05/10/2026 đây là cờ `coBieuDo: boolean` và mục in bảy câu dùng chung, bật tắt theo ba
   * cờ khác. Nay nó mang LOẠI, vì `guide-111.json` viết một đoạn riêng cho mỗi loại biểu đồ: một
   * đoạn nói đúng thứ hình đang vẽ, thay cho bảy câu nói cho mọi hình.
   */
  kieuBieuDo?: ChartType;

  /* ── Mục "Khi kết quả hiện _ _" ────────────────────────────────────────────────────────── */

  /**
   * Những MÃ cảnh báo mà công thức này phát ra được — lấy bằng cách CHẠY LẠI các ca kiểm có
   * `expectedWarning`, không phải một danh sách khai tay.
   *
   * Rỗng với 11 công thức không khai ca hỏng nào (nhóm phí, thuế, trả góp — chúng gần như không
   * hỏng được). Khi rỗng thì `mucCo` không chứa `'ket-qua-trong'`.
   *
   * Chỉ MÃ, không mang câu: trước 05/10/2026 trường này là `CalcWarning[]` và mục in nguyên câu
   * `calc` viết kèm câu "cách sửa". `guide-111.json` có câu riêng cho từng mã, nên in cả hai là
   * hai câu nói cùng một việc — đúng thứ chủ dự án bảo bỏ. Giữ phép CHẠY THẬT vì nó quyết định mã
   * nào có mặt, và đó là một sự thật chứ không phải một câu chữ.
   */
  ketQuaTrong: ReadonlyArray<WarningCode>;

  /* ── Chữ viết riêng cho công thức này ──────────────────────────────────────────────────── */

  /**
   * Chữ riêng của công thức, từ hai lần chủ dự án giao (03/10/2026, rồi `guide-111.json`
   * 05/10/2026) — `undefined` nếu kho chưa có mục cho id này (không xảy ra với 111 công thức hiện
   * tại, `noi-dung.test.ts` gác).
   *
   * Bốn thứ KHÔNG đứng cùng chỗ, và đó là cách gắn lời phê đợt 5 vào cấu trúc thay vì vào trí
   * nhớ: `deLamGi` ở dải mở đầu TRANG (không khung nào mang nó), `oNhap` ở mục `#nhap-so` — mục
   * duy nhất trong ba khung "?" nhận chữ riêng, và cũng là thứ KHÔNG trùng gì trên màn — còn
   * `docKetQua` với `deSai` chỉ sống ở `#doc-ket-qua`, mục không có nút "?" nào mở.
   *
   * Bảng độ trùng đo được: `./noi-dung/types.ts`.
   */
  rieng?: BaiRiengDaChuan;

  /** Mục nào có thật trong bài này, đúng thứ tự `THU_TU_MUC`. */
  mucCo: ReadonlyArray<MucId>;
  /** Công thức nên xem cùng: thượng nguồn trước, rồi cùng nhóm. Tối đa 4. */
  lienQuan: ReadonlyArray<string>;
}
