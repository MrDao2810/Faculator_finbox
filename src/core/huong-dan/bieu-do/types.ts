/**
 * Tầng DOMAIN — mục "Đọc biểu đồ" của bài hướng dẫn, viết RIÊNG cho từng công thức (13/10/2026).
 *
 * ── Vì sao có thư mục này ────────────────────────────────────────────────────────────────────
 *
 * Tới 12/10/2026 mục này in MỘT đoạn chọn theo `spec.chartType` — chín đoạn dùng chung, tiêu đề là
 * tên loại ("Biểu đồ quét độ nhạy", "Biểu đồ nến"…). Chủ dự án đọc nó trên màn và hỏi bốn câu liền:
 * *"nghĩa là sao? đây là biểu đồ về cái gì? đang hướng dẫn sử dụng biểu đồ gì? biểu đồ đang là dạng
 * gì?"*, rồi chốt: *"biểu đồ tên là gì thì ghi vào đó chứ không phải là 'Biểu đồ quét độ nhạy' vì
 * nó vô nghĩa … nói rõ là ở dạng đường thì đường cong đi từ đâu đến đâu và xu thế của thị trường hay
 * xu thế của biểu đồ đang ám chỉ cái gì. còn dạng cột thì làm sao đó tương tự. sửa lại ở tất cả công
 * thức, không được làm đối phó."*
 *
 * Phép đo đi kèm cho thấy cái sai không chỉ ở một cái tên. `chartType` là một NHÃN khai trong
 * Registry; thứ màn tính thật sự dựng thì chỉ có ba hình (`ChartModel`): đường "kết quả theo một ô
 * nhập", đường theo thời gian, và các thanh bóc tách. Chạy `buildChartModel()` cho cả 111 công thức:
 *
 *   · 63 công thức mở ra một đường theo một ô nhập (57 khai `sensitivity`, 6 khai `stackedBar`);
 *   · 35 công thức không vẽ gì cho tới khi nạp chuỗi giá, rồi vẽ đường theo thời gian — trong đó 26
 *     công thức khai `candlestick` / `histogram` / `underwater` / `scatter`, bốn hình màn tính KHÔNG
 *     có renderer nào, nên bài của chúng tả nến, cột phân phối, chấm hồi quy không tồn tại trên màn;
 *   · 5 công thức mở ra thanh bóc tách — NẰM NGANG, trong khi đoạn cũ nói "cột cuối vẽ từ 0 lên";
 *   · 8 công thức không có khối biểu đồ.
 *
 * Nên mục này nay đi từ HÌNH THẬT chứ không từ nhãn: `ke-hoach.ts` hỏi chính bộ dựng biểu đồ xem
 * công thức có những hình nào, tên gì; kho chữ ở `noi-dung/` viết cho đúng những hình ấy; và
 * `kiem.ts` chặn mọi chỗ chữ nói khác hình.
 *
 * ── Mỗi MỤC của ô chọn "Xem kết quả đổi theo" một đoạn chữ (đợt hai, cùng ngày 13/10/2026) ─────
 *
 * Bản đầu chỉ viết cho hình MỞ RA: một đường theo ô nhập mặc định, cộng hình thời gian và hình bóc
 * tách. Khung "?" cạnh khối Biểu đồ in hết ngần ấy khối cùng lúc, kèm hai câu chỉ tới hai dòng điều
 * khiển. Chủ dự án xem rồi chốt hai điều: bỏ hai câu ấy, và *"ô hướng dẫn sử dụng đang rất dài, sửa
 * logic như sau: sau khi lựa chọn một select mới từ đường thì mới hiển thị xem biểu đồ dạng đường,
 * tương tự khi click vào xem biểu đồ dạng cột. hoặc khi đổi dạng Xem theo thời gian, Khối lượng,
 * thời gian nắm giữ,... với tất cả các loại biểu đồ của tất cả công thức"*.
 *
 * Tức khung chỉ nói về ĐÚNG hình đang hiện, ở đúng dạng đang chọn. Điều đó đòi một thứ bản đầu
 * không có: chữ cho MỌI mục của ô chọn, không riêng mục mặc định. Đo lại trên cả thư viện: 103 công
 * thức có 248 ô nhập đứng được trên trục ngang (10 ô chỉ hiện ở chế độ Nâng cao), trong khi bản đầu
 * mới có chữ cho 64. Thiếu 184 mục kia thì chọn "Khối lượng" là khung hoặc trống, hoặc nói về một
 * hình khác với hình đang vẽ — đúng lỗi "chữ nói khác hình" mà cả thư mục này sinh ra để chặn.
 *
 * Hai điều đo được chi phối cách viết 248 mục ấy:
 *
 *   · 197 trục vẽ được ngay; 51 trục thuộc về 35 công thức ăn chuỗi giá, CHỈ vẽ được sau khi nạp
 *     chuỗi. Với 51 trục ấy hình dạng đường do chuỗi được nạp quyết định, nên lúc build không đo
 *     được chiều đi — chữ phải nói đường phụ thuộc chuỗi đã nạp, và chỉ được hứa một chiều khi chiều
 *     ấy đúng với mọi chuỗi (ca kiểm thử trên nhiều chuỗi dựng).
 *   · 4 trục cho ra một đường NẰM NGANG với bộ số mặc định (`gia-hoa-von` theo Khối lượng: khối
 *     lượng rút gọn ở cả tử lẫn mẫu). Bản đầu chỉ biết "đi lên" và "đi xuống" vì trục mặc định bao
 *     giờ cũng là trục làm kết quả đổi mạnh nhất; mở ra mọi trục thì phải có chiều thứ ba.
 *
 * ── Luật "chỉ chữ trong `guide-111.json`" KHÔNG còn đúng cho mục này ─────────────────────────
 *
 * Bốn mục kia của bài vẫn chỉ mang chữ chủ dự án giao (đợt 8, 05/10/2026). Riêng mục này thì chữ do
 * người viết code viết, theo đúng yêu cầu trên, và chín đoạn `charts[kind]` của file ấy đã đi (mộ
 * chí ở `vi.ts`, khoá `guide.chartKind.*`). Chủ dự án biết điều đó khi duyệt: chữ ở đây cần được đọc
 * lại như mọi nội dung chưa qua thẩm định.
 *
 * ── CHỈ đọc lúc build ────────────────────────────────────────────────────────────────────────
 *
 * Cùng cửa `@/application/huong-dan` với phần còn lại của bài; `build-only-imports.test.ts` gác.
 * Sáu trăm đoạn × 2 ngôn ngữ là thứ mỗi trang chỉ cần phần của chính nó.
 */

import type { Bilingual } from '../../types';

/**
 * Hai dạng của MỘT biểu đồ đường — đúng hai nút "Đường" / "Cột" của dòng "Loại biểu đồ".
 *
 * `cot` vắng khi màn KHÔNG bày hai nút ấy cho biểu đồ đó: `ChartBody` chỉ bật lối cột khi hình có
 * đúng một chuỗi, mà đường theo thời gian của `sma-n-phien` vẽ kèm đường giá đóng cửa. Tả một dạng
 * màn không có là đúng lỗi thư mục này đi sửa.
 */
export interface HaiDang {
  duong: Bilingual;
  cot?: Bilingual;
}

/**
 * Chữ "Đọc biểu đồ" của một công thức. Trường nào có mặt là do HÌNH quyết định, không do người viết:
 * `kiem.ts` đòi đúng những trường `keHoachBieuDo()` nói công thức ấy có, không thừa không thiếu.
 */
export interface BieuDoRieng {
  /**
   * Đường "kết quả theo một ô nhập" — MỘT mục cho mỗi ô nhập đứng được trên trục ngang, khoá là
   * `VariableSpec.key`. 248 mục trên 103 công thức.
   *
   * Khoá bằng chính `key` của ô chứ không bằng vai ("mặc định", "nâng cao") như bản đầu: vai là thứ
   * bộ dựng biểu đồ tự chọn và đổi được, còn đoạn chữ thì nói về MỘT ô cụ thể. Gắn chữ vào vai là
   * ngày trục mặc định đổi, đoạn chữ lặng lẽ sang nằm dưới một hình khác.
   */
  truc?: Readonly<Record<string, HaiDang>>;
  /** Đường theo thời gian — có khi đã nạp mã cổ phiếu hoặc chuỗi giá. 47 công thức. */
  thoiGian?: HaiDang;
  /** Các thanh bóc tách — mặc định ở 5 công thức, một mục trong ô chọn ở 6 công thức. */
  bocTach?: Bilingual;
}

/**
 * Chiều đi của đường "kết quả theo một ô nhập", đo trên bộ số mặc định.
 *
 * `'ngang'` là khi ô nhập không làm kết quả đổi trong dải đang vẽ — hỏi bằng `isFlatSpan()`, đúng
 * điều kiện màn dùng để vẽ một vạch nằm ngang.
 */
export type ChieuDuong = 'len' | 'xuong' | 'ngang';

/** Những thứ ĐO được trên một đường — chỉ có khi đường vẽ được mà không cần chuỗi giá. */
export interface HinhDoDuoc {
  chieu: ChieuDuong;
  /** Có quãng không tính được (màn vẽ thành vùng gạch chéo) hay không. */
  coQuangTrong: boolean;
  /** Kết quả đổi dấu trong dải — ở dạng Cột, có cột quay xuống dưới vạch 0. */
  catKhong: boolean;
}

/** Kế hoạch của MỘT đường theo một ô nhập. */
export interface KeHoachTruc {
  /** `VariableSpec.key` — cũng là giá trị của mục ấy trong ô chọn "Xem kết quả đổi theo". */
  khoa: string;
  /** Tên biểu đồ, đúng chữ màn tính in dưới hình: 'P/E theo Giá thị trường'. */
  ten: Bilingual;
  /** Tên ô nhập nằm trên trục ngang, đúng chữ trong ô chọn "Xem kết quả đổi theo". */
  truc: Bilingual;
  /** Ô nhập chỉ hiện ở chế độ Nâng cao, nên mục này cũng chỉ có trong ô chọn ở chế độ ấy. */
  nangCao: boolean;
  /**
   * Dải của trục ngang. `'nua-gap-ruoi'` là ±50% quanh con số đang nhập (`SWEEP_SPAN`) — 242/248
   * trục. `'khac'` là sáu trục còn lại: con số mặc định bằng 0 nên không có "phần trăm quanh nó",
   * hoặc `min`/`max` của ô cắt mất một đầu dải.
   */
  dai: 'nua-gap-ruoi' | 'khac';
  /**
   * Số đo của đường trên bộ số mặc định — `undefined` khi trục CHỈ vẽ được sau khi nạp chuỗi giá
   * (51 trục). Lúc build không có chuỗi nào, và tầng Domain không được tự chế ra một chuỗi
   * (`CalcContext.series`), nên với những trục ấy không có gì để đo.
   */
  hinh?: HinhDoDuoc;
  /**
   * Có bộ số NGƯỜI DÙNG GÕ ĐƯỢC nào làm đường này đi ngược chiều mặc định hay không — 26 trục.
   *
   * `hinh.chieu` đo trên bộ số mặc định, mà khung "?" thì mở ra cạnh hình của bộ số người dùng đang
   * gõ. Nhập lợi nhuận âm thì ROE theo Vốn chủ thôi đi xuống mà đi lên; đoạn chữ chỉ nói "đi xuống"
   * là đang nói ngược hình ngay trước mắt người đọc. Với những trục này `kiem.ts` đòi đoạn chữ nói
   * CẢ HAI chiều, tức nêu điều kiện của chiều mặc định và chuyện gì xảy ra khi điều kiện ấy đảo.
   *
   * `false` với trục chỉ vẽ được trên chuỗi giá: ở đó không có hình mặc định để mà ngược, và lời
   * hứa một chiều (nếu có) đã được thử trên nhiều chuỗi dựng.
   */
  daoChieu: boolean;
}

export interface KeHoachThoiGian {
  /** 'P/E theo thời gian'. */
  ten: Bilingual;
  /** Màn có bày hai nút Đường/Cột cho hình này không — xem `HaiDang.cot`. */
  coCot: boolean;
  /** Mốc ngang công thức khai (`spec.referenceLines`): RSI có 30 và 70. */
  moc: ReadonlyArray<{ label: Bilingual; value: number }>;
  /** Tên các đường vẽ kèm; hiện chỉ có "Giá đóng cửa" của `sma-n-phien`. */
  chuoiPhu: ReadonlyArray<Bilingual>;
}

export interface KeHoachBocTach {
  /** 'EV — bóc tách'. */
  ten: Bilingual;
  /** Nhãn từng thanh thành phần, đúng chữ màn in cạnh thanh. */
  chang: ReadonlyArray<Bilingual>;
  /** Nhãn thanh tổng đứng cuối. */
  tong: Bilingual;
  /** `true`: hình này mở ra mặc định. `false`: phải chọn "Bóc tách" trong ô chọn trục. */
  macDinh: boolean;
}

/**
 * Những hình mà màn tính của một công thức dựng được — `undefined` với 8 công thức không có khối
 * biểu đồ. Đây là "đề bài" của kho chữ: có hình nào ở đây thì phải có đoạn chữ cho hình ấy.
 */
export interface KeHoachBieuDo {
  /** Mọi ô nhập đứng được trên trục ngang, đúng thứ tự ô chọn "Xem kết quả đổi theo" bày chúng. */
  truc: ReadonlyArray<KeHoachTruc>;
  thoiGian?: KeHoachThoiGian;
  bocTach?: KeHoachBocTach;
  /**
   * Khoá của hình màn MỞ RA: một ô nhập (63 công thức), `BREAKDOWN_KEY` (5), hoặc `HISTORY_KEY`
   * với 35 công thức không vẽ gì cho tới khi có chuỗi giá — hình đầu tiên họ thấy là hình ấy.
   */
  moRa: string;
}

/**
 * Một hình trong mục "Đọc biểu đồ", đã ghép tên với chữ — thứ giao diện in.
 *
 * `khoa` là chìa để khung "?" tìm đúng khối của hình đang hiện: nó bằng `ChartModel.sweepKey`, tức
 * `VariableSpec.key` của ô trên trục ngang, `HISTORY_KEY` cho hình thời gian, hoặc `BREAKDOWN_KEY`
 * cho hình bóc tách.
 */
export interface KhoiBieuDoBai {
  khoa: string;
  ten: Bilingual;
  duong?: Bilingual;
  cot?: Bilingual;
  /** Đoạn của hình bóc tách — một đoạn, không chia hai dạng: hình ấy chỉ có thanh. */
  thanh?: Bilingual;
  /** Mục này chỉ có trong ô chọn ở chế độ Nâng cao. */
  nangCao: boolean;
  /** Hình chỉ vẽ được sau khi đã nạp mã cổ phiếu hoặc chuỗi giá. */
  canChuoi: boolean;
}

/**
 * Cả mục "Đọc biểu đồ" của một bài: khối ĐẦU là hình màn mở ra, các khối sau theo thứ tự ô chọn.
 *
 * `nhieuTruc` và `coHaiDang` của bản đầu đã bỏ: chúng bật hai câu chỉ tới dòng "Xem kết quả đổi
 * theo" và dòng "Loại biểu đồ", hai câu chủ dự án bảo gỡ (mộ chí ở `vi.ts`).
 */
export interface MucBieuDoBai {
  khoi: ReadonlyArray<KhoiBieuDoBai>;
}

/**
 * Hình ĐANG HIỆN ở khối Biểu đồ của màn tính — `ChartBody` báo lên, khung "?" đọc để chỉ in đúng
 * khối của hình ấy, ở đúng dạng đang chọn.
 */
export interface HinhDangXem {
  /**
   * `ChartModel.sweepKey` của hình đang vẽ. `null` khi khối Biểu đồ đang hiện cảnh báo thay cho
   * hình VÀ người dùng chưa tự chọn mục nào — khi ấy khung nói về hình màn sẽ mở ra.
   */
  khoa: string | null;
  /** Dạng đang vẽ thật sự, tức ý muốn của hai nút "Loại biểu đồ" đã lọc qua việc hình có cho vẽ cột. */
  dang: 'duong' | 'cot';
  /** `false` khi khối Biểu đồ đang hiện cảnh báo thay cho hình. */
  daVe: boolean;
}
