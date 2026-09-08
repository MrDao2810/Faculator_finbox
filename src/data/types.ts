/**
 * Tầng DATA — hợp đồng cấp số liệu (gói WBS 2.5.1).
 *
 * FR-17: "gắn được mã cổ phiếu và chỉ số VN-Index thật qua DataProvider; bản đầu dùng dữ liệu
 * mẫu, khi có nguồn thật chỉ thay cài đặt DataProvider." Nghĩa là giao diện chỉ được biết tới
 * `DataProvider`, không được biết số liệu đến từ file tĩnh hay từ API.
 *
 * Tầng này không được import React hay Next, và không được gọi lên tầng giao diện.
 */

/** Một phiên giá. Cùng hình dạng với `PriceBar` mà bộ dán Excel sinh ra, để hai nguồn thay nhau được. */
export interface DailyBar {
  /** Ngày dạng ISO 'YYYY-MM-DD'. */
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
}

/**
 * Số liệu cơ bản lấy từ báo cáo tài chính, đơn vị ghi rõ ở từng trường.
 *
 * Quy ước đơn vị bám đúng tầng Domain (`src/core/formulas/fundamentals.ts`): số trên mỗi cổ phiếu
 * ghi bằng **₫**, khoản mục toàn doanh nghiệp ghi bằng **tỷ ₫**, số cổ phiếu ghi bằng **CP**. Nhờ
 * vậy `presetInputs()` gán thẳng vào ô nhập, không đổi đơn vị dọc đường — chỗ nào phải nhân chia
 * để khớp đơn vị là chỗ sẽ có ngày sai một nghìn lần mà không ai thấy.
 */
export interface Fundamentals {
  /** Lợi nhuận trên mỗi cổ phiếu, đơn vị ₫. */
  eps: number;
  /** Giá trị sổ sách trên mỗi cổ phiếu, đơn vị ₫. */
  bookValuePerShare: number;
  /** Số cổ phiếu đang lưu hành, đơn vị cổ phiếu. */
  sharesOutstanding: number;
  /** Cổ tức tiền mặt mỗi cổ phiếu trong năm, đơn vị ₫. */
  dividendPerShare: number;
  /**
   * Lợi nhuận sau thuế cả năm, đơn vị **tỷ ₫**.
   *
   * Ở bộ mẫu, trường này SUY RA bằng phép nhân `eps × sharesOutstanding` chứ không phải một con số
   * tự đặt thêm — xem `samples.ts`. Nguồn thật thì phải đọc thẳng từ báo cáo: lợi nhuận thật không
   * bằng đúng tích ấy, vì EPS công bố tính trên số cổ phiếu bình quân gia quyền và có phần pha
   * loãng. Nên đây là trường RIÊNG chứ không phải thứ tính lại được từ hai trường trên.
   */
  netIncome: number;
  /**
   * Vốn chủ sở hữu cuối kỳ, đơn vị **tỷ ₫**.
   * Ở bộ mẫu suy ra bằng `bookValuePerShare × sharesOutstanding`; nguồn thật đọc từ báo cáo.
   */
  equity: number;
  /** Kỳ báo cáo, ví dụ 'BCTC 2025'. */
  period: string;

  /*
   * ── Năm trường mở rộng, tất cả TUỲ CHỌN ───────────────────────────────────────────────────
   *
   * Tuỳ chọn vì hai lẽ, và cả hai đều quan trọng hơn vẻ gọn gàng của một kiểu bắt buộc:
   *
   * 1. `PRESET_CONTRACT_VERSION` giữ nguyên 1 — thêm trường tuỳ chọn thì KHÔNG tăng, theo đúng
   *    luật đã ghi ở hằng số ấy. Bộ số liệu cũ vẫn đọc được.
   * 2. Một mã thiếu `dt_q*` vẫn phải nạp được sáu trường kia. Bỏ cả bản ghi vì một dòng báo cáo
   *    khuyết là quay lại đúng cái bẫy đã loại oan 268/1.005 mã (xem `finbox/map.ts`).
   *
   * HAI TRONG NĂM TRƯỜNG LÀ SỐ **SUY RA**, không phải dòng đọc thẳng từ báo cáo —
   * `totalLiabilities` và `totalAssets`. Docblock từng trường nói rõ phép suy và nguồn thật nếu sau
   * này có API tốt hơn. Đừng đọc chúng như thể là số trên bảng cân đối kế toán.
   *
   * Hai khoá ô nhập nữa — `bvps` và `salesPerShare` — KHÔNG nằm ở đây dù công thức có dùng: chúng
   * tính lại được từ các trường trên (`bvps` chính là `bookValuePerShare`; `salesPerShare` là
   * `revenue × 1e9 ÷ sharesOutstanding`), nên chỗ của chúng là bảng ánh xạ trong `preset-inputs.ts`,
   * không phải kiểu dữ liệu. Lưu một con số ở hai nơi là mời hai nơi ấy lệch nhau.
   *
   * ⚠ Phạm vi hợp nhất lệch nhau, và chỗ này là nơi duy nhất ghi lại: `equity` suy ra từ
   * `bookValuePerShare × sharesOutstanding`, tức phần thuộc **công ty mẹ**, còn `noVCSH` do Finbox
   * công bố nhiều khả năng tính trên **toàn tập đoàn**. Doanh nghiệp có lợi ích cổ đông thiểu số
   * lớn thì `totalLiabilities`/`totalAssets` lệch theo. Bộ sinh của bộ mẫu lọc ca này bằng
   * `checkSelfConsistent()`; đường LIVE cố ý không lọc, lý do ở `finbox/map.ts`.
   */

  /**
   * Doanh thu thuần 12 tháng gần nhất, đơn vị **tỷ ₫**.
   *
   * Cộng 4 quý `dt_q{quý}/{năm}` liền nhau — cùng thuật toán `trailingTwelveMonths()` đang dùng cho
   * `ln_`, chỉ khác tiền tố. Không lấy `dt_y{năm}` vì với năm chưa kết thúc thì đó là luỹ kế từ đầu
   * năm, khác kỳ với `netIncome` — đúng cái bẫy đã vá cho lợi nhuận.
   */
  revenue?: number;
  /**
   * Tổng nợ phải trả cuối kỳ, đơn vị **tỷ ₫**. **Suy ra**: `noVCSH × equity`.
   *
   * `noVCSH` là tỷ số nợ trên vốn chủ do Finbox công bố. Đây là TOÀN BỘ nợ phải trả, không riêng nợ
   * vay có lãi — nên nó điền được ô của `no-tren-von-chu` và `ncav-tren-co-phieu`, nhưng KHÔNG điền
   * ô "Nợ vay" của `ev` (khoá `totalDebt`, nghĩa hẹp hơn).
   */
  totalLiabilities?: number;
  /**
   * Tổng tài sản cuối kỳ, đơn vị **tỷ ₫**. **Suy ra**: `equity + totalLiabilities`.
   *
   * KHÔNG lấy `netIncome ÷ roa` dù API có sẵn `roa`, vì `roa` của Finbox tính trên tài sản **bình
   * quân** còn `equity` của ta là số **cuối kỳ** — trộn hai kỳ vào một bảng cân đối là đúng loại lỗi
   * mà `finbox/map.ts` đã viết cả một docblock để cảnh báo. Đo trên FPT: hai cách lệch 9%.
   *
   * Lấy `equity + totalLiabilities` thì ba trường tạo thành một tam giác kín `A = E + L`, chỉ tiêu
   * thụ **một** field API (`noVCSH`), và `roa`/`roe` của API trở thành phép đối chiếu ĐỘC LẬP thay vì
   * nguồn — đúng vai `pe`/`pb` đang giữ.
   */
  totalAssets?: number;
  /**
   * Vốn hoá thị trường, đơn vị **tỷ ₫**. Đọc thẳng field `vonhoa`.
   *
   * Không suy ra từ `priceVnd × sharesOutstanding`: `TickerSnapshot.priceVnd` được đối chiếu ĐỘC LẬP
   * với `fundamentals`, nên một mã có thể có số liệu cơ bản hợp lệ mà không có thị giá. Nếu vốn hoá
   * phụ thuộc thị giá thì cột `priceFields` của `LIVE_PRESET_FORMULAS` nói sai và sheet "công thức
   * cho mã này" hứa sai với đúng nhóm mã ấy.
   */
  marketCap?: number;
  /** P/E hiện tại, đơn vị **lần**. Đọc thẳng field `pe` — cùng field vẫn đang dùng để đối chiếu. */
  pe?: number;
}

/**
 * Phiên bản hợp đồng dữ liệu mẫu (SW-05 · LDR-05).
 *
 * Tăng số này khi hình dạng `Preset` đổi theo cách một bộ số liệu cũ không còn đọc đúng được —
 * thêm trường tuỳ chọn thì KHÔNG tăng, bỏ hay đổi nghĩa một trường thì có. `createStaticProvider()`
 * đối chiếu từng bộ khi dựng, nên một bộ số liệu sinh bởi phiên bản khác không thể lặng lẽ đi
 * tiếp vào công thức.
 *
 * Vì sao cần dù `samples.ts` nằm ngay trong repo và typecheck đã gác hình dạng: fundamentals của
 * bốn mã nay do `npm run gen:live-fundamentals` sinh từ API, và SW-05 chốt rằng dữ liệu mẫu từ
 * Finbox đi theo "hợp đồng dữ liệu có phiên bản". Typecheck chỉ thấy được file đang có trong cây
 * mã; nó không thấy một bộ số liệu người khác gửi sang.
 */
export const PRESET_CONTRACT_VERSION = 1;

/** Một bộ số liệu mẫu chọn được ở sheet WF-10. */
export interface Preset {
  /** Phiên bản hợp đồng dữ liệu — xem `PRESET_CONTRACT_VERSION`. */
  version: number;
  /** Mã cổ phiếu, ví dụ 'FPT'. */
  code: string;
  /** Tên doanh nghiệp hiện dưới mã. */
  name: string;
  /**
   * Ngành, ví dụ 'Ngân hàng'. `undefined` khi nguồn không nói.
   *
   * Có mặt vì sheet "Nạp mẫu" nay chọn 4 mã theo công thức đang xem, và ngành là thứ trả lời
   * nhanh nhất câu "vì sao bốn mã này lại cho ra bốn kết quả khác nhau đến vậy" — một P/B dưới 1
   * của ngân hàng đứng cạnh P/B trên 3 của bán lẻ đọc ra ngay, còn hai con số trần thì không.
   */
  industry?: string;
  /** Dòng mô tả nguồn, đúng khuôn WF-10: 'BCTC 2025 · 248 phiên giá'. */
  meta: string;
  fundamentals: Fundamentals;
  /** Chuỗi giá theo phiên, cũ nhất trước. */
  bars: ReadonlyArray<DailyBar>;
  /**
   * Số liệu này có phải bản thảo tự dựng hay không.
   * `true` nghĩa là CHƯA đối chiếu báo cáo thật — giao diện phải nói rõ cho người dùng biết
   * (giả định A1, rủi ro R-01 của SRS vẫn còn mở).
   */
  isDraft: boolean;
  /**
   * Ngày (ISO) mà `fundamentals` được đối chiếu với nguồn thật gần nhất nhất — `undefined` nghĩa
   * là không rõ/không áp dụng (nguồn tự dựng thuần không có mốc "lấy lúc nào" để nói).
   *
   * Không ghi TÊN nguồn ở đây — đó vẫn là chi tiết riêng của phần cấp `DataProvider` này
   * (FR-17: "giao diện chỉ được biết tới DataProvider"), chỉ ghi ĐỘ MỚI để màn chi tiết nói
   * "cập nhật lúc …" khi đã nạp một preset có trường này.
   */
  fundamentalsAsOf?: string;
}

/**
 * Cổng cấp số liệu. Bản đầu đọc file tĩnh; sau này thay bằng bản gọi API mà giao diện
 * không phải sửa gì (FR-17).
 *
 * Mọi hàm đều đồng bộ vì bản tĩnh không có gì để chờ; khi có nguồn thật thì đổi sang Promise
 * là một thay đổi phá vỡ có chủ đích, làm cùng lúc với gói lấy dữ liệu.
 */
export interface DataProvider {
  /** Toàn bộ mã có số liệu mẫu. */
  list(): ReadonlyArray<Preset>;
  /** Tra một mã. Không có thì trả undefined chứ không ném lỗi. */
  byCode(code: string): Preset | undefined;
  /** Tìm theo mã hoặc tên, bỏ dấu. Chuỗi rỗng thì trả về toàn bộ danh sách. */
  search(query: string): ReadonlyArray<Preset>;
  /**
   * Chuỗi phiên của VN-Index — riêng cho công thức Beta (FR-17: "gắn được mã cổ phiếu và chỉ
   * số VN-Index thật qua DataProvider"). Không phải một `Preset`: không có mã, không hiện ở
   * PresetSheet — chỉ nạp thẳng vào `ctx.marketSeries`.
   */
  vnIndex(): ReadonlyArray<DailyBar>;
  /**
   * Chuỗi VN-Index ở trên có phải số tự dựng hay không.
   *
   * `Preset` mang cờ `isDraft` của riêng nó, còn chuỗi chỉ số thì trước đây không có chỗ nào để
   * nói ra điều tương tự — và đó là một lỗ FR-06 thật, không phải chuyện siêu dữ liệu: Beta hồi
   * quy lợi suất cổ phiếu theo lợi suất thị trường, nên khi vế thị trường là PRNG, con số ra là
   * một con số SAI trông rất có lý. Nặng hơn nữa vì chuỗi này luôn nằm sẵn trong `ctx`, người
   * dùng không phải bấm "Nạp mẫu" lần nào, nên không có một dấu hiệu nào cho họ biết.
   *
   * Khi thay bằng chuỗi chỉ số thật thì trả `false` — một chỗ duy nhất, và câu cảnh báo trên màn
   * tự biến mất.
   */
  vnIndexIsDraft(): boolean;
}
