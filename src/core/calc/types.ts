/**
 * Tầng DOMAIN — hợp đồng của bộ máy tính toán (gói WBS 3.x, nền cho nhánh 5).
 *
 * Cho tới đợt này Registry mới chỉ có METADATA: `FormulaSpec` mô tả biến, diễn giải, nguồn và
 * ca kiểm thử, nhưng không có gì biến `inputs` thành một con số. File này là mảnh còn thiếu.
 *
 * Quyết định thiết kế: spec và hàm tính nằm trong CÙNG MỘT object (`FormulaModule`), không phải
 * hai bảng tra ghép với nhau theo id. Nếu tách đôi thì khai một công thức mà quên viết hàm tính
 * là lỗi chỉ lộ ra lúc chạy; gộp lại thì typecheck bắt ngay. NFR-MNT-01 nói "thêm công thức mới
 * chỉ khai báo thêm một FormulaSpec và viết hàm tính" — đây đúng là hai thứ đó, buộc đi liền nhau.
 */

import type { Cashflow } from '../cashflow-series';
import type { FeeSchedule } from '../market/types';
import type { SeriesRow } from '../price-series';
import type { FormulaSpec } from '../registry/types';
import type { CalcOutput } from '../types';

/** Giá trị người dùng nhập, theo key của `VariableSpec`. Ô để trống thì KHÔNG có key. */
export type CalcInputs = Readonly<Record<string, number>>;

/**
 * Bối cảnh tính toán — mọi thứ hàm tính cần mà không nằm trong ô nhập.
 */
export interface CalcContext {
  /**
   * Ngày tra hằng số thuế & phí, dạng ISO 'YYYY-MM-DD'.
   * Bắt buộc, không có giá trị mặc định: tầng Domain không tự lấy ngày hệ thống (NFR-REL-03),
   * và người dùng phải tính lại được một giao dịch cũ theo đúng biểu phí thời điểm đó.
   */
  asOf: string;
  /** Biểu phí đang chọn. Công thức nhóm phí & thuế bắt buộc có; nhóm khác bỏ qua. */
  schedule?: FeeSchedule;
  /**
   * Chuỗi giá đóng cửa, phiên CŨ trước phiên MỚI — cho Sharpe, độ biến động, RSI… (FR-12).
   * Không có nghĩa là người dùng chưa nạp bảng dữ liệu: công thức cần chuỗi phải fail bằng
   * `missingSeries()`, tuyệt đối không tự chế một chuỗi mặc định.
   */
  series?: ReadonlyArray<number>;
  /**
   * Chuỗi phiên đầy đủ OHLCV cho công thức cần hơn giá đóng cửa (ATR, stochastic, VWAP…).
   * Cùng nguồn với `series`; ô nào người dùng chưa điền là `null` — công thức tự kiểm và
   * đếm phiên DÙNG ĐƯỢC trước khi tính, thiếu thì `missingSeries()`.
   */
  bars?: ReadonlyArray<SeriesRow>;
  /**
   * Chuỗi giá đóng cửa của VN-Index, cùng chiều với `series` (phiên CŨ trước, phiên MỚI CUỐI).
   * Riêng cho công thức Beta — hồi quy lợi suất cổ phiếu theo lợi suất thị trường cần HAI chuỗi
   * cùng lúc, khác mọi công thức chuỗi giá khác trong Registry vốn chỉ đọc một mình `series`.
   *
   * Nguồn không đến từ lựa chọn của người dùng như `series` — VN-Index là một chuỗi CỐ ĐỊNH,
   * luôn có mặt bất kể đang xem mã nào (xem `DataProvider.vnIndex()`), nên tầng gọi (màn chi
   * tiết) phải tự nạp trường này chứ không đợi người dùng dán thêm gì.
   */
  marketSeries?: ReadonlyArray<number>;
  /**
   * Dòng tiền có ngày cho XIRR — công thức duy nhất trong Registry cần một BẢNG thay vì một
   * chuỗi số hay vài ô nhập. Do thân riêng của XIRR (`ui/screens/XirrBody.tsx`) tự quản lý
   * bảng và nạp vào đây bằng `cashflowsOf()`, cùng cách `series` được nạp từ `bars`.
   */
  cashflows?: ReadonlyArray<Cashflow>;
  /** Kết quả các công thức thượng nguồn, cho cảnh báo kế thừa của FR-15. */
  upstream?: Readonly<Record<string, CalcOutput>>;
}

/**
 * Bộ đọc giá trị đầu vào truyền cho hàm tính.
 *
 * Là hàm chứ không phải object để trả về `number` chứ không phải `number | undefined`:
 * `noUncheckedIndexedAccess` đang bật, nên tra thẳng một `Record` sẽ bắt mọi công thức phải
 * viết `?? 0` — mà `?? 0` chính là thứ FR-06 cấm. `runFormula()` đã chặn ô thiếu từ trước khi
 * gọi tới đây, nên trong thân hàm tính mọi biến khai trong spec đều có mặt và hữu hạn.
 */
export type CalcValues = (key: string) => number;

/**
 * Hàm tính của một công thức.
 *
 * Bắt buộc trả `CalcOutput` dựng bằng `ok()` / `fail()` / `inherited()` — không hàm nào được
 * `return someNumber` trần (FR-06).
 */
export type CalcFn = (v: CalcValues, ctx: CalcContext) => CalcOutput;

/** Một công thức hoàn chỉnh: mô tả + cách tính. Đây là đơn vị mà nhánh 5 thêm vào từng cái. */
export interface FormulaModule {
  spec: FormulaSpec;
  calc: CalcFn;
}
