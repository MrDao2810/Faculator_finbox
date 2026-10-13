/**
 * Tầng DOMAIN — một NGÀY ĐƠN do người dùng gõ: ngày mua của một mã, ngày của một dòng tiền.
 *
 * ── Lỗi mà file này sinh ra để chữa (13/10/2026) ────────────────────────────────────────────────
 *
 * Chủ dự án chụp màn Danh mục: cột "Ngày mua" in `03/10/2026`, bấm vào dòng để sửa thì ô ngày
 * trong hộp thoại in `10/03/2026`. Cùng một ngày, hai thứ tự. Cột do `formatIsoDate()` của sản
 * phẩm in (ngày/tháng/năm), còn ô sửa là `<input type="date">` do TRÌNH DUYỆT vẽ theo ngôn ngữ của
 * chính nó: Chrome tiếng Anh in tháng/ngày/năm. Không thuộc tính HTML hay CSS nào ép được ô ấy
 * sang thứ tự khác, nên cách duy nhất để hai chỗ nói cùng một lối là thôi dùng ô của trình duyệt.
 *
 * Từ đó: ngày gõ vào sản phẩm là một ô CHỮ, đọc và in bằng các hàm dưới đây. Thứ tự luôn là
 * ngày/tháng/năm (CON-05), ở cả giao diện tiếng Anh, vì `formatIsoDate()` vốn đã in như vậy ở mọi
 * chỗ khác.
 *
 * ── Hai dạng của cùng một ngày ──────────────────────────────────────────────────────────────────
 *
 *   • LƯU và TÍNH: ISO 'YYYY-MM-DD'. `xirr()` dựng mốc thời gian từ dạng này, `summarisePortfolio()`
 *     so chuỗi để biết ngày nào trước, và kho `ffb.portfolio.v1` đã ghi dạng này từ đầu.
 *   • HIỆN và GÕ: 'DD/MM/YYYY'.
 *
 * Giá trị của ô (`value` của `DateField`/`DateCell`) vì thế là ISO khi ô đang giữ một ngày CÓ THẬT,
 * và là chính chuỗi đang gõ dở khi chưa. Nơi nhận tự soi bằng `isIsoDay()`: một chuỗi không qua
 * cửa ấy là "chưa phải một ngày", không bao giờ được coi là ô trống (FR-06 áp cho dữ liệu vào).
 *
 * Khác `price-series.ts` ở một điểm: cột Ngày của bảng WF-05 nhận cả '15/07' thiếu năm lẫn số thứ
 * tự phiên, nên nó giữ chữ. Ở đây một ngày thiếu năm là chưa đủ để tính, nên bị từ chối.
 */

import { formatIsoDate } from './format';
import { parseSeriesDate, withSeriesDateSlashes } from './price-series';

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

function laNamNhuan(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Ngày có trên lịch hay không.
 *
 * `parseSeriesDate()` chỉ chặn ngày quá 31 và tháng quá 12, đủ cho việc sắp bảng. Ở đây chuỗi đi
 * tiếp vào `Date.parse()`, mà V8 đọc '2026-02-31' thành ngày 3 tháng 3 chứ không báo lỗi: một ngày
 * gõ nhầm sẽ lặng lẽ thành một ngày khác, và XIRR tính trên ngày khác ấy. Ô `type="date"` cũ không
 * cho gõ ra ngày như vậy, nên ô chữ thay nó phải giữ đúng bảo đảm đó.
 */
function coTrenLich(year: number, month: number, day: number): boolean {
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const soNgay =
    month === 2 ? (laNamNhuan(year) ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31;
  return day <= soNgay;
}

/** Đúng dạng 'YYYY-MM-DD' VÀ là một ngày có trên lịch. */
export function isIsoDay(text: string): boolean {
  const match = ISO_DAY.exec(text);
  if (match === null) return false;
  return coTrenLich(Number(match[1]), Number(match[2]), Number(match[3]));
}

/**
 * Đọc thứ người dùng gõ thành ngày ISO, hoặc `null` nếu chưa phải một ngày đủ năm có thật.
 *
 * Nhận đúng những lối viết cột Ngày của bảng WF-05 nhận, để hai chỗ nhập ngày của sản phẩm không
 * đọc cùng một chuỗi ra hai kết quả: '03/10/2026', '3/10/2026', '03-10-2026', '03.10.2026',
 * '2026-10-03', và dãy tám chữ số '03102026' (bàn phím số của điện thoại không có phím '/').
 * Ngày/tháng luôn đọc theo lối Việt Nam: '03/10/2026' là ngày 3 tháng 10.
 */
export function parseDateText(raw: string): string | null {
  const date = parseSeriesDate(withSeriesDateSlashes(raw.trim()));
  if (date === null || date.year === null) return null;
  if (!coTrenLich(date.year, date.month, date.day)) return null;

  const year = String(date.year).padStart(4, '0');
  const month = String(date.month).padStart(2, '0');
  const day = String(date.day).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Chữ in trong ô cho một giá trị: ngày ISO thành 'DD/MM/YYYY', còn lại in nguyên xi.
 *
 * "Còn lại" là chuỗi đang gõ dở, hoặc một chuỗi hỏng đọc lên từ kho. In nguyên xi là cố ý: ô
 * `type="date"` cũ hiện ô TRỐNG cho một chuỗi hỏng rồi lặng lẽ ghi lại chính chuỗi hỏng ấy khi
 * lưu; in ra thì người dùng thấy và sửa được.
 */
export function dateTextOf(value: string): string {
  return ISO_DAY.test(value) ? formatIsoDate(value) : value;
}

/**
 * Giá trị của ô TRONG LÚC GÕ: thành ISO chỉ khi chữ trong ô đã đúng y dạng 'DD/MM/YYYY'.
 *
 * Điều kiện "đúng y dạng" là thứ giữ con trỏ đứng yên. Ô là controlled: giá trị đổi thành ISO thì
 * chữ in ra là `dateTextOf(iso)`, và nếu chữ ấy khác chữ vừa gõ dù một ký tự, React ghi đè nội
 * dung ô và đẩy con trỏ về cuối. Xoá số 0 của '03/10/2026' để gõ số khác mà ô tự điền lại số 0 là
 * đúng lỗi "sửa giá trị dưới tay người đang gõ" mà `NumberInput` cấm. Mọi lối viết khác chờ tới
 * lúc rời ô (`settledDateValue()`).
 */
export function typedDateValue(text: string): string {
  const iso = parseDateText(text);
  return iso !== null && dateTextOf(iso) === text ? iso : text;
}

/** Giá trị của ô LÚC RỜI Ô: mọi lối viết đọc được đều về ISO, không đọc được thì giữ chữ đã gõ. */
export function settledDateValue(text: string): string {
  const trimmed = text.trim();
  return parseDateText(trimmed) ?? trimmed;
}
