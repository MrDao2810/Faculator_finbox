/**
 * Tầng DOMAIN — bộ câu hỏi kiểm tra hiểu bài của khối WF-19, đặt cuối màn chi tiết công thức.
 *
 * ── Bất biến của cả thư mục: MỖI CÂU PHẢI CÓ NGUỒN THẬT ──────────────────────────────────────
 *
 * Câu hỏi ở đây không được nghĩ ra cho đủ số. Mỗi câu phải xuất phát từ một chỗ mà người dùng
 * THẬT SỰ hiểu sai, đọc được trong một nguồn cụ thể, hoặc từ một quy định có văn bản. `QuizItem`
 * vì thế bắt buộc có `source.url` — không có đường dẫn thì không compile được, và
 * `quiz.test.ts` còn kiểm lại lần nữa.
 *
 * Hệ quả nhìn thấy được: **ngân hàng câu hỏi không đều**. 49 công thức chỉ có đúng một câu,
 * 38 công thức có hai, và `tiet-kiem-muc-tieu` không có câu nào vì không tìm ra nguồn nào bàn
 * về việc người dùng hiểu sai công thức ấy. Đó là kết quả trung thực chứ không phải việc làm dở:
 * khuôn "5 câu mỗi công thức" của bản wireframe đầu đã bị bỏ đúng vì nó buộc phải bịa 3–4 câu
 * cho 88 trên 111 công thức. Giao diện xử lý bằng hai trạng thái riêng (khối chỉ có 1–2 câu, và
 * khối rỗng), không phải bằng cách độn thêm câu.
 *
 * ── Vì sao `en` là tuỳ chọn ─────────────────────────────────────────────────────────────────
 *
 * Phần còn lại của Domain dùng `Bilingual` với cả hai vế bắt buộc. Ở đây thì không, và đó là
 * quyết định có chủ đích: 206 câu × (đề bài + 4 lựa chọn + giải thích) chưa được dịch, mà điền
 * một chuỗi tiếng Anh tạm vào cho hợp kiểu chính là bịa nội dung — đúng thứ thư mục này tồn tại
 * để tránh. Câu chưa dịch thì `en` bỏ trống, giao diện lùi về tiếng Việt và nói rõ là chưa có
 * bản dịch. `quiz.test.ts` đếm số câu chưa dịch để con số ấy không âm thầm nằm im (FR-08).
 */

/** Một đoạn chữ của câu hỏi. `en` vắng nghĩa là CHƯA dịch — xem docblock trên. */
export interface QuizText {
  vi: string;
  en?: string;
}

/**
 * Năm kiểu hiểu mà bộ câu hỏi kiểm tra, thay cho khuôn "định nghĩa · cách tính · điều kiện áp
 * dụng" của bản wireframe đầu.
 *
 * Khuôn cũ bị bỏ vì nó không gọi tên nổi hai loại câu chiếm 65/206: câu về quy định thị trường
 * Việt Nam (không có ngộ nhận để bác bỏ, chỉ có biết hoặc không biết) và câu về hậu quả bằng
 * tiền. Mỗi nhóm công thức nghiêng hẳn về một hai kiểu chứ không rải đều — nhóm phí & thuế gần
 * như toàn `dinh-che`, nhóm định giá nghiêng về `doc-ket-qua` và `dieu-kien`.
 */
export type QuizKind =
  /** D1 — con số này nói gì và KHÔNG nói gì. */
  | 'doc-ket-qua'
  /** D2 — trường hợp nào không dùng được công thức. */
  | 'dieu-kien'
  /** D3 — tham số, thứ tự, đơn vị dễ tính sai. */
  | 'quy-uoc'
  /** D4 — luật, phí, giới hạn của thị trường Việt Nam. */
  | 'dinh-che'
  /** D5 — quyết định sai thì mất bao nhiêu tiền. */
  | 'hau-qua';

/**
 * Sức nặng của bằng chứng đứng sau câu hỏi.
 *
 * `ngo-nhan` mạnh hơn `quy-dinh` ở chỗ nó có người viết ra rằng người ta hiểu sai thế nào;
 * `quy-dinh` chỉ nói điều đúng là gì. Giao diện không phân biệt hai tầng này, nhưng người soạn
 * nội dung thì cần: câu `quy-dinh` gắn với văn bản nên có HẠN DÙNG (xem `effectiveFrom`).
 *
 * `tinh-toan` là tầng thứ ba, mở ngày 24/09/2026 cho câu TÍNH TOÁN. Bằng chứng của nó không nằm
 * ở một trang web mà ở chính hàm `calc` của công thức: ai cũng gõ lại được bộ số liệu ấy vào màn
 * hình phía trên và ra đúng đáp số. Nó phải là một tầng riêng vì hai cửa gác khoá theo tầng và
 * cả hai đều sai nếu xếp nhầm nó:
 * - ca "trích nguyên văn" bắt MỌI câu `ngo-nhan` phải có `“…”`, mà lời giải của một phép tính
 *   thì không trích ai cả, nó dẫn lại chính phép tính;
 * - giao diện lấy tiêu đề hộp giải thích theo tầng, và `quy-dinh` cho ra "Quy định hiện hành",
 *   đọc sai hẳn với một câu hỏi đáp số bao nhiêu.
 */
export type QuizEvidence = 'ngo-nhan' | 'quy-dinh' | 'tinh-toan';

/** Ai nói điều được trích. */
export type QuizSourceKind =
  /** Người thật kể lại, hoặc báo chí thuật lại một vụ việc có số liệu. */
  | 'trai-nghiem'
  /** Phân tích viên, công ty chứng khoán, Damodaran, CFA Institute. */
  | 'chuyen-gia'
  /** Tài liệu dạy chuẩn. */
  | 'giao-khoa'
  /** Văn bản pháp luật, biểu phí công bố. */
  | 'quy-dinh';

/**
 * Nguồn của một câu hỏi.
 *
 * ── Vì sao ở đây KHÔNG có trường `quote` ────────────────────────────────────────────────────
 *
 * Bản dựng đầu tách câu trích ra khỏi lời giải thích thành một trường riêng, để khối nguồn của
 * WF-19D · S14 hiện nguyên văn. Thử trên cả 206 câu thì hỏng theo hai kiểu: 83 câu còn lại lời
 * giải thích RỖNG (cả đoạn vốn chỉ là dẫn nguồn), và những câu còn chữ thì bị cắt cụt giữa ý
 * ("P/E thấp là dấu." — mất hẳn vế sau). Cắt máy móc một đoạn văn để lấp cho vừa cấu trúc dữ
 * liệu chính là kiểu làm mà thư mục này tồn tại để tránh.
 *
 * Nên câu trích NẰM TRONG `explain`, giữa cặp ngoặc kép “…”, đúng chỗ người viết đặt nó —
 * `Damodaran nói: “…”` đọc tự nhiên hơn hẳn hai khối rời nhau lặp lại cùng một câu. Giao diện
 * tô riêng phần trong ngoặc kép, rồi in nhãn loại nguồn và đường dẫn bên dưới; người học vẫn
 * kiểm chứng được, mà không phải đọc cùng một câu hai lần.
 *
 * `quiz.test.ts` gác chuyện này: câu `ngo-nhan` phải có ít nhất một đoạn trong ngoặc kép, trừ
 * đúng 5 câu diễn giải bằng lời — con số 5 bị ghim trong ca kiểm để nó không trôi lên âm thầm.
 */
export interface QuizSource {
  /** Đường dẫn đầy đủ. Bắt buộc, không có ngoại lệ. */
  url: string;
  kind: QuizSourceKind;
  /** Nguồn có bàn thẳng vào bối cảnh thị trường Việt Nam không. */
  vietnam: boolean;
  /**
   * Ngày văn bản có hiệu lực, dạng ISO — CHỈ dành cho câu `quy-dinh`.
   *
   * Luật Thuế TNCN 109/2025/QH15 hiệu lực 01/7/2026, tỷ lệ ký quỹ phái sinh đổi theo thời điểm,
   * và đề xuất đánh 20% trên lãi cổ phiếu chưa niêm yết vẫn đang là dự thảo. Những câu ấy phải
   * rà lại định kỳ chứ không soạn một lần rồi để đó.
   */
  effectiveFrom?: string;
}

/** Bốn lựa chọn, khoá cố định để đáp án trỏ tới được. */
export type QuizChoiceKey = 'a' | 'b' | 'c' | 'd';

export const QUIZ_CHOICE_KEYS: ReadonlyArray<QuizChoiceKey> = ['a', 'b', 'c', 'd'];

/**
 * Dạng trả lời của một câu — WF-19C, mở ngày 23/09/2026.
 *
 * Chủ dự án: _"không phải tất cả câu đều là kiểu trắc nghiệm, có thể linh hoạt để phù hợp với
 * công thức"_. Ba dạng, mỗi dạng hợp với một kiểu hiểu khác nhau:
 *
 * - `trac-nghiem` — bốn lựa chọn, một đúng. Dạng mặc định và vẫn là đa số.
 * - `chon-nhieu` — bốn lựa chọn, HAI HOẶC BA đúng, phải chọn đúng trọn bộ. Hợp với câu D2 kiểu
 *   "những điều kiện nào làm P/E mất nghĩa", vốn bị dạng một-đáp-án bóp méo thành chọn cái
 *   "đúng nhất" trong khi thực tế nhiều cái cùng đúng.
 * - `dien-so` — tự tính rồi gõ kết quả. Hợp với câu D3 về quy ước tính: chọn đáp án cho người
 *   ta loại trừ ngược từ bốn con số, còn gõ thì phải tính thật.
 *
 * ── Dạng Đúng/Sai của WF-19C · S13 KHÔNG dựng, cố ý ──
 *
 * Chính bản vẽ ấy nêu lý do trong khối "điều kiện để mở hai dạng này": câu Đúng/Sai chỉ có 50%
 * xác suất đoán trúng, và đề xuất "bỏ hẳn và giữ trắc nghiệm". Một câu bốn lựa chọn hỏi VÌ SAO
 * một nhận định sai luôn đo được nhiều hơn một câu hỏi nó đúng hay sai. Nội dung dạng này ở v0.1
 * đã chuyển sang trắc nghiệm rồi (WF-19B · S7), và không có gì phải chuyển ngược lại.
 */
export type QuizFormat = 'trac-nghiem' | 'chon-nhieu' | 'dien-so';

/**
 * Sai số chấp nhận được của câu `dien-so` — điều kiện chặn số 1 mà WF-19C nêu ra.
 *
 * Bản vẽ đòi "bảng dung sai theo loại kết quả": ±0,1 cho tỷ số nhưng phải theo phần trăm cho kết
 * quả tiền tệ. Không dựng bảng ấy, vì một bảng tra theo đơn vị sẽ sai ngay ở ca đầu tiên lệch
 * chuẩn — người soạn câu mới là người biết con số nào mới đáng gọi là "gần đúng" cho chính câu
 * của mình. Nên mỗi câu tự khai, và docblock này là hướng dẫn:
 *
 * - `tuyet-doi` cho tỷ số và phần trăm — P/E 12,5 thì ±0,1 là đủ chặt, còn ±1% của 12,5 là 0,125
 *   nghe chính xác hơn mà thực ra lỏng hơn.
 * - `tuong-doi` cho tiền và mọi thứ có bậc độ lớn thay đổi theo đề bài — khoản trả góp 4,8 triệu
 *   và khoản 480 triệu không thể dùng chung một sai số tuyệt đối.
 *
 * `value` của `tuong-doi` là TỶ LỆ, không phải phần trăm: 0,01 nghĩa là 1%.
 */
export interface QuizTolerance {
  kind: 'tuyet-doi' | 'tuong-doi';
  value: number;
}

/** Phần chung của mọi dạng câu. */
interface QuizBase {
  /** Mã câu, duy nhất trong cả ngân hàng: `Q001`… */
  id: string;
  /** Id công thức mà câu này thuộc về — phải có thật trong Registry. */
  formulaId: string;
  kind: QuizKind;
  evidence: QuizEvidence;
  /** Đề bài. */
  prompt: QuizText;
  /**
   * Khối số liệu của đề bài, hiện thành bảng trên đầu câu hỏi (WF-19B · S5).
   *
   * Có mặt ở câu bắt người dùng tự tính rồi mới trả lời được — nên gần như BẮT BUỘC với câu
   * `dien-so`: người ta không gõ ra số nếu đề bài không đưa đủ số liệu. Vắng mặt ở câu khái niệm.
   */
  facts?: ReadonlyArray<{ label: QuizText; value: QuizText }>;
  /**
   * Vì sao đáp án đúng — hiện sau khi trả lời, ngay trên khối nguồn.
   *
   * Câu trích nguyên văn của nguồn nằm trong đây, giữa cặp ngoặc kép “…”; xem docblock của
   * `QuizSource`. Giao diện tô riêng phần ấy.
   *
   * KHI CÓ `giai`, trường này KHÔNG còn hiện lên màn — chỉ câu trích của nó được lấy ra đặt
   * dưới khối lời giải. Nó vẫn phải có, vì cửa gác "câu bác ngộ nhận thì trích nguyên văn"
   * đọc ở đây, và vì câu trích là thứ cho người đọc mở nguồn ra đối chiếu.
   */
  explain: QuizText;
  /**
   * Lời giải có CẤU TRÚC — chủ dự án 24/09/2026, thay cho đoạn văn xuôi.
   *
   * "chỉ cần ghi là câu hỏi trên là loại công thức để tính thứ gì → sẽ áp dụng công thức →
   * đưa ra công thức → sau đó áp dụng số liệu bên trên vào → kết quả cuối cùng là xong. bên
   * dưới cùng ghi nguồn là xong. không sáng tạo thêm hay thêm lời vô nghĩa."
   *
   * Đây là vòng thứ HAI trong cùng một ngày. Vòng một thêm khối "vì sao ba đáp án kia sai";
   * chủ dự án xem rồi bác vì dài. Nên khối này KHÔNG nhắc tới đáp án sai — đừng dựng lại.
   *
   * CÔNG THỨC KHÔNG NẰM Ở ĐÂY. Giao diện lấy nó từ `expression` của chính công thức mà câu
   * hỏi thuộc về (`quiz-view.ts` cắt sẵn lúc build). Chép công thức vào từng câu là dựng bản
   * sao thứ hai của một thứ đã có, và bản sao ấy sẽ lệch bản gốc đúng lúc không ai nhìn —
   * cùng lý do `worked` mang cả đáp án của từng ô thay vì có một mảng `answers[]` song song.
   */
  giai?: QuizGiai;
  source: QuizSource;
}

/**
 * Bốn dòng của một lời giải: tính gì · thay số · ra bao nhiêu.
 *
 * Dòng công thức là dòng thứ hai và nó đến từ `FormulaSpec.expression`, không từ đây.
 */
export interface QuizGiai {
  /** Câu hỏi này tính ra thứ gì. Một cụm danh từ, không phải một câu. */
  tinh: QuizText;
  /**
   * Ghi đè dòng công thức, CHỈ khi công thức của trang không phải thứ tính ra đáp án.
   *
   * Mặc định dòng ấy lấy từ `expression` của chính công thức mà câu hỏi thuộc về, và đó là
   * đường đi đúng cho gần hết mọi câu. Nhưng có những câu hỏi một QUY TẮC về chính đại lượng
   * ấy chứ không hỏi cách tính nó: "beta báo cáo 1,10 thì khoảng giá trị thật là bao nhiêu"
   * được trả lời bằng `beta ± 2 × sai số chuẩn`, không bằng `β = Cov ÷ Var`. In công thức của
   * trang ở đó là in một công thức đúng nhưng không liên quan tới phép tính vừa làm.
   *
   * RANH GIỚI: ghi đè vẫn phải là quy tắc về ĐẠI LƯỢNG CỦA CHÍNH TRANG ẤY. Không được mượn
   * chỗ này để in một công thức khác của thư viện — đó đúng là điều bất biến `CAU_DIEN_SO`
   * tồn tại để chặn, và nó chặn hình vẽ chứ không chặn được dòng chữ này.
   */
  congThuc?: QuizText;
  /** Thay số của đề bài vào công thức: "36.000 ÷ 3.000". Chỉ phép tính, không lời. */
  thaySo: QuizText;
  /** Kết quả cuối, kèm đơn vị: "12,0 lần". */
  ketQua: QuizText;
}

/** Bốn lựa chọn, một đáp án đúng. */
/**
 * Bộ số liệu để ĐỐI CHIẾU một câu tính toán với chính hàm `calc` của công thức.
 *
 * Chủ dự án 24/09/2026: "bài kiểm tra cần phải có liên quan đến phép tính công thức bên trên rồi
 * bên dưới là các đáp án để người dùng chọn". Câu kiểu ấy in sẵn đáp số trong một lựa chọn, nên
 * nếu người soạn tính nhầm thì bài kiểm tra dạy sai — và dạy sai đúng cái công thức nằm ngay phía
 * trên nó trên cùng một màn hình. Không cửa gác nào khác thấy được chuyện đó: `calc` vẫn đúng,
 * lời giải vẫn trôi chảy, chỉ con số là lệch.
 *
 * Khai `verify` thì `quiz.test.ts` chạy `runFormula` với đúng bộ `inputs` ấy và đòi kết quả khớp
 * `expected`. Đáp số trên màn do đó luôn bằng đáp số máy tính của sản phẩm tính ra.
 *
 * KHÔNG dùng cho công thức ăn chuỗi giá: chuỗi đi trong `CalcContext` chứ không trong `inputs`,
 * nên bộ số liệu ở đây không tả đủ đề bài.
 */
export interface QuizVerify {
  /** Giá trị từng ô nhập, khoá đúng bằng `VariableSpec.key` của công thức. */
  inputs: Readonly<Record<string, number>>;
  /** Kết quả `calc` phải trả về. */
  expected: number;
  /** Sai số cho phép khi đối chiếu, bù phần làm tròn lúc soạn đáp án. */
  tolerance: number;
}

export interface QuizTracNghiem extends QuizBase {
  format: 'trac-nghiem';
  choices: Readonly<Record<QuizChoiceKey, QuizText>>;
  answer: QuizChoiceKey;
  /**
   * Chỉ có ở câu TÍNH TOÁN: đáp án đúng là một con số, và con số ấy phải khớp với `calc`.
   * Câu lý thuyết không khai trường này. Xem docblock `QuizVerify`.
   */
  verify?: QuizVerify;
}

/**
 * Bốn lựa chọn, nhiều đáp án đúng — phải chọn đúng TRỌN BỘ mới tính là đúng.
 *
 * Chấm trọn gói chứ không cho điểm từng phần: chọn được hai trong ba điều kiện làm công thức mất
 * nghĩa nghĩa là vẫn sẽ dùng công thức sai ở trường hợp thứ ba. Nửa vời ở đây không có giá trị.
 */
export interface QuizChonNhieu extends QuizBase {
  format: 'chon-nhieu';
  choices: Readonly<Record<QuizChoiceKey, QuizText>>;
  /** Hai hoặc ba khoá. Một khoá thì dùng `trac-nghiem`, bốn khoá thì câu hỏi vô nghĩa. */
  answers: ReadonlyArray<QuizChoiceKey>;
}

/**
 * Đặt số liệu của đề bài vào đúng chỗ trong công thức.
 *
 * Chủ dự án 24/09/2026: "điền đúng chỗ số liệu vào công thức thì kiểm tra xem đúng chưa chứ không
 * phải hỏi xem kết quả là như nào." Trước đó dạng này in sẵn cả phép tính rồi bỏ trống đáp số, tức
 * nó kiểm kỹ năng bấm máy tính — không phải việc của một thư viện công thức.
 */
export interface QuizDienSo extends QuizBase {
  format: 'dien-so';
  /**
   * Kết quả của phép tính, dạng số thật — không phải chuỗi đã định dạng.
   *
   * KHÔNG còn là câu hỏi: người học không phải tính ra nó. Nó làm hai việc khác — cửa gác trong
   * `quiz.test.ts` bóc ngoặc vuông của `worked` ra, tính lại, và đòi rơi đúng vào `tolerance`
   * quanh con số này; và giao diện lộ nó ra sau khi chấm, như phần thưởng khép lại ví dụ.
   */
  expected: number;
  /** Chỉ còn dùng cho cửa gác tính lại `worked`. Việc chấm từng ô không có dung sai. */
  tolerance: QuizTolerance;
  /**
   * Đơn vị của kết quả: 'lần', '%', '₫'. In cạnh con số lộ ra sau khi chấm. Là `QuizText` vì đơn
   * vị cũng đổi theo ngôn ngữ ('lần' → 'x'), giống `UNIT_SCALES[].label` của Domain.
   */
  unit: QuizText;
  /**
   * Công thức của ví dụ, với SỐ LIỆU ĐẦU VÀO bỏ trống — giao diện dựng ô nhập ngay tại đó.
   *
   *     Beta điều chỉnh = [0,67] × [1,50] + [0,33] × 1
   *
   * Mỗi cặp ngoặc vuông là một ô trống, và đáp án của ô nằm ngay trong ngoặc của chính nó. Nhờ vậy
   * một chuỗi làm trọn ba việc: vẽ ra hình, chấm từng ô, và — sau khi bóc ngoặc — bị `quiz.test.ts`
   * tính lại để đối chiếu `expected`.
   *
   * Luật cấu trúc, luật chọn ô nào để bỏ trống, và bộ tính lại nằm ở `worked-line.ts` — đọc
   * docblock ở đó trước khi soạn một dòng mới.
   */
  worked: QuizText;
}

/**
 * Một câu hỏi của khối Kiểm tra hiểu bài.
 *
 * Hợp kiểu có nhãn phân biệt là `format`. Nhãn ấy BẮT BUỘC ở cả ba dạng, kể cả dạng mặc định:
 * một nhãn tuỳ chọn sẽ khiến TypeScript thu hẹp kiểu lỏng lẻo, và quan trọng hơn là khiến người
 * soạn câu không phải nghĩ xem dạng nào hợp với câu mình đang viết — đúng thứ gói này mở ra để
 * tránh.
 */
export type QuizItem = QuizTracNghiem | QuizChonNhieu | QuizDienSo;

/** Câu này có lựa chọn để bấm không — dùng để thu hẹp kiểu ở tầng giao diện và ca kiểm. */
export function hasChoices(item: QuizItem): item is QuizTracNghiem | QuizChonNhieu {
  return item.format !== 'dien-so';
}

/**
 * Số người dùng gõ có được tính là đúng không.
 *
 * Nằm ở Domain chứ không ở giao diện vì nó là một phép tính, và vì ca kiểm cần gọi thẳng. Không
 * bao giờ ném: `value` không phải số hữu hạn thì trả `false` — FR-06, một ô nhập hỏng không được
 * biến thành "đúng".
 */
export function isAccepted(item: QuizDienSo, value: number): boolean {
  if (!Number.isFinite(value)) return false;
  const lech = Math.abs(value - item.expected);
  return item.tolerance.kind === 'tuyet-doi'
    ? lech <= item.tolerance.value
    : lech <= Math.abs(item.expected) * item.tolerance.value;
}

/** Một câu đã dịch đủ hai ngôn ngữ chưa — dùng cho ca kiểm đếm FR-08. */
export function isTranslated(item: QuizItem): boolean {
  const texts: ReadonlyArray<QuizText> = [
    item.prompt,
    item.explain,
    ...(hasChoices(item)
      ? QUIZ_CHOICE_KEYS.map((key) => item.choices[key])
      : [item.unit, item.worked]),
    ...(item.facts ?? []).flatMap((fact) => [fact.label, fact.value]),
  ];
  return texts.every((text) => typeof text.en === 'string' && text.en.trim() !== '');
}
