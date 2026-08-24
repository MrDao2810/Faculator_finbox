/**
 * Tầng DOMAIN — cửa sổ hiển thị của danh sách ảo hoá (gói WBS 3.1.2).
 *
 * WF-02 phải chịu được 111 công thức mà vẫn giữ NFR-PER-02 (dưới 100 ms). Cách làm là chỉ
 * dựng ra DOM những dòng đang nằm trong tầm nhìn, còn phần trên và phần dưới thay bằng hai
 * khối đệm rỗng đúng chiều cao — thanh cuộn nhờ vậy vẫn dài đúng như khi có đủ dòng.
 *
 * Toàn bộ phần toán nằm ở đây, thuần và không chạm DOM, nên test được bằng Node. Component
 * chỉ còn việc nghe sự kiện cuộn. Không thêm dependency: một hàm 40 dòng không đáng đổi lấy
 * một thư viện ảo hoá vài chục kB.
 *
 * ## Vì sao nhận MẢNG chiều cao chứ không phải một `rowHeight` (sửa ở đợt này)
 *
 * Bản trước nhận đúng một con số và tin rằng "CSS ép mọi dòng cao bằng nhau". Với thư viện
 * thật thì không: đo 107 thẻ ở khổ 390px ra **sáu** chiều cao khác nhau, từ 102px tới 194px,
 * vì tên công thức dài ngắn khác nhau nên xuống dòng khác nhau.
 *
 * Hai hậu quả đã thấy tận mắt:
 *   - Thẻ cao hơn số đo bị `overflow: hidden` CẮT CỤT, chữ tràn đè lên thẻ bên cạnh.
 *   - Tổng chiều cao tính sai gần 5 000px, nên cuộn tới "đáy" mà danh sách chưa hết.
 *
 * Không sửa được bằng cách đo kỹ hơn một dòng: các dòng vốn KHÔNG bằng nhau. Phải nhận cả
 * mảng.
 */

/** Dưới ngưỡng này thì dựng thẳng cả danh sách, ảo hoá chỉ tổ thêm chỗ sai. */
export const VIRTUALIZE_THRESHOLD = 1000;

/** Số dòng dựng thêm ngoài tầm nhìn ở mỗi phía, để cuộn nhanh không thấy khoảng trắng. */
export const DEFAULT_OVERSCAN = 6;

export interface VirtualWindowArgs {
  /** Khoảng đã cuộn qua tính từ đỉnh danh sách, đơn vị px. Số âm coi như 0. */
  scrollTop: number;
  /** Chiều cao khung nhìn, đơn vị px. */
  viewportHeight: number;
  /**
   * Chiều cao TỪNG dòng, px — mảng dài đúng bằng số mục, không có lỗ.
   *
   * Dòng chưa đo được thì nơi gọi điền số ước lượng. Ước lượng sai chỉ làm hai khối đệm lệch
   * một chút rồi tự đúng dần khi người dùng cuộn qua và dòng được đo thật; nó KHÔNG làm cắt
   * cụt nội dung, vì dòng không còn bị ép chiều cao nữa.
   */
  heights: ReadonlyArray<number>;
  overscan?: number;
}

export interface VirtualWindow {
  /** Chỉ số dòng đầu tiên phải dựng. */
  start: number;
  /** Chỉ số ngay sau dòng cuối phải dựng — dùng thẳng cho `slice(start, end)`. */
  end: number;
  /** Chiều cao khối đệm phía trên, px. */
  padTop: number;
  /** Chiều cao khối đệm phía dưới, px. */
  padBottom: number;
}

/** Danh sách đủ dài để đáng ảo hoá chưa. */
export function shouldVirtualize(count: number, threshold = VIRTUALIZE_THRESHOLD): boolean {
  return count > threshold;
}

/** Chiều cao đã lọc rác: số âm, NaN, Infinity đều thành 0 để không kéo phép cộng đi sai. */
function heightAt(heights: ReadonlyArray<number>, index: number): number {
  const value = heights[index];
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Khoảng dòng cần dựng ứng với vị trí cuộn hiện tại.
 *
 * Không bao giờ ném lỗi và không bao giờ trả khoảng vô lý: cuộn quá đà ở hai đầu, danh sách
 * ngắn hơn khung nhìn, hay chưa đo được chiều cao nào đều có lối ra xác định.
 *
 * Duyệt tuyến tính chứ không tìm nhị phân: danh sách dài nhất của sản phẩm là 111 mục, và một
 * vòng lặp đọc thẳng thì không có chỗ để sai chỉ số — thứ đắt hơn nhiều so với vài chục phép
 * cộng mỗi lần cuộn.
 */
export function windowRange(args: VirtualWindowArgs): VirtualWindow {
  const { scrollTop, viewportHeight, heights, overscan = DEFAULT_OVERSCAN } = args;

  const count = heights.length;
  if (count <= 0) return { start: 0, end: 0, padTop: 0, padBottom: 0 };

  let total = 0;
  for (let i = 0; i < count; i += 1) total += heightAt(heights, i);

  // Chưa đo được dòng nào thì dựng cả danh sách. Thà chậm một nhịp còn hơn trả khoảng rỗng
  // rồi người dùng nhìn thấy trang trắng.
  if (total <= 0) return { start: 0, end: count, padTop: 0, padBottom: 0 };

  const scrolled = Number.isFinite(scrollTop) ? Math.max(0, scrollTop) : 0;
  const height = Number.isFinite(viewportHeight) ? Math.max(0, viewportHeight) : 0;

  // Dòng đầu tiên còn chạm mép trên khung nhìn, cùng phần đã cuộn qua trước nó.
  let firstVisible = 0;
  let before = 0;
  while (firstVisible < count - 1 && before + heightAt(heights, firstVisible) <= scrolled) {
    before += heightAt(heights, firstVisible);
    firstVisible += 1;
  }

  // Dòng cuối còn lọt vào khung nhìn. Ít nhất một dòng: khung nhìn cao 0px vẫn phải dựng gì đó
  // để còn đo lại được.
  let last = firstVisible;
  let filled = before + heightAt(heights, firstVisible) - scrolled;
  while (last < count - 1 && filled < height) {
    last += 1;
    filled += heightAt(heights, last);
  }

  const pad = Math.max(0, Math.trunc(Number.isFinite(overscan) ? overscan : 0));
  const start = Math.max(0, firstVisible - pad);
  const end = Math.min(count, last + 1 + pad);

  let padTop = 0;
  for (let i = 0; i < start; i += 1) padTop += heightAt(heights, i);

  let padBottom = 0;
  for (let i = end; i < count; i += 1) padBottom += heightAt(heights, i);

  return { start, end, padTop, padBottom };
}
