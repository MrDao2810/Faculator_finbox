/**
 * Tầng PRESENTATION — công cụ kiểm tra tương phản màu theo WCAG 2.1 (NFR-USA-06).
 *
 * Không phụ thuộc React. Dùng ở test của hệ thiết kế và về sau ở gói 7.1.3 audit tiếp cận.
 * Công thức lấy đúng định nghĩa của WCAG:
 *   https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 *   https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

/** Ngưỡng AA cho chữ thường (dưới 18,66px đậm hoặc dưới 24px thường). */
export const AA_TEXT = 4.5;
/** Ngưỡng AA cho chữ lớn. */
export const AA_LARGE_TEXT = 3;
/** Ngưỡng AA cho ranh giới điều khiển và đồ hoạ mang thông tin. */
export const AA_NON_TEXT = 3;

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/**
 * Đọc chuỗi màu dạng #rgb hoặc #rrggbb.
 * Chuỗi không hợp lệ thì trả null — không đoán, để test báo đúng chỗ sai.
 */
export function parseHex(hex: string): Rgb | null {
  const text = hex.trim().replace(/^#/, '');

  if (text.length === 3) {
    const [r, g, b] = [...text];
    if (r === undefined || g === undefined || b === undefined) return null;
    return parseHex(`${r}${r}${g}${g}${b}${b}`);
  }

  if (text.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(text)) return null;

  return {
    r: Number.parseInt(text.slice(0, 2), 16),
    g: Number.parseInt(text.slice(2, 4), 16),
    b: Number.parseInt(text.slice(4, 6), 16),
  };
}

/** Độ sáng tương đối của một kênh màu, đã bỏ gamma. */
function channelLuminance(value255: number): number {
  const c = value255 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Độ sáng tương đối của một màu, trong khoảng 0 (đen) đến 1 (trắng). */
export function relativeLuminance(color: Rgb): number {
  return (
    0.2126 * channelLuminance(color.r) +
    0.7152 * channelLuminance(color.g) +
    0.0722 * channelLuminance(color.b)
  );
}

/**
 * Tỉ số tương phản giữa hai màu, từ 1 (không phân biệt được) đến 21 (đen trên trắng).
 * Màu không đọc được thì trả 0 để phép so sánh ngưỡng luôn thất bại thay vì âm thầm đi qua.
 */
export function contrastRatio(foreground: string, background: string): number {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  if (fg === null || bg === null) return 0;

  const lighter = Math.max(relativeLuminance(fg), relativeLuminance(bg));
  const darker = Math.min(relativeLuminance(fg), relativeLuminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

/** Cặp màu có đạt ngưỡng không. Mặc định kiểm theo ngưỡng chữ thường. */
export function meetsContrast(
  foreground: string,
  background: string,
  threshold: number = AA_TEXT,
): boolean {
  return contrastRatio(foreground, background) >= threshold;
}

/** Che các ký tự có nghĩa trong biểu thức chính quy — tên bộ chọn có `[`, `]`, `'`. */
function escapeForRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Thân của khối luật ứng với một bộ chọn, hoặc `null` nếu không có.
 *
 * Đếm ngoặc để cắt cho đúng chỗ chứ không tìm `}` đầu tiên: globals.css hiện chưa có khối lồng
 * nhau, nhưng một `@media` bọc ngoài về sau sẽ làm cách cắt ngây thơ trả về một mẩu cụt mà vẫn
 * trông như hợp lệ — đúng loại hỏng âm thầm mà cả file test này sinh ra để chặn.
 *
 * Xuất ra ngoài vì `tokens.test.ts` cũng cần cắt đúng hai khối bảng màu ấy — hai cửa kiểm khác
 * nhau nhưng chung một phép cắt, và chép phép cắt sang file thứ hai là dựng ra chỗ để lệch.
 */
export function cssBlock(css: string, selector: string): string | null {
  const opening = new RegExp(`${escapeForRegExp(selector)}\\s*\\{`).exec(css);
  if (opening === null) return null;

  const start = opening.index + opening[0].length;
  let depth = 1;
  let index = start;

  while (index < css.length && depth > 0) {
    const char = css[index];
    if (char === '{') depth += 1;
    else if (char === '}') depth -= 1;
    index += 1;
  }

  // Ngoặc không đóng đủ nghĩa là file CSS hỏng — trả null để test báo, không đoán bừa.
  return depth === 0 ? css.slice(start, index - 1) : null;
}

/**
 * Bóc các biến màu `--color-*: #hex;` trong đúng MỘT khối luật của chuỗi CSS.
 * Dùng để test đọc thẳng globals.css, tránh cảnh chép màu ra file TS rồi lệch nhau.
 *
 * Có tham số `selector` kể từ khi thêm bảng màu tối: bản trước quét cả file rồi dồn vào một map
 * phẳng, nên khai sau đè khai trước. Thêm khối `[data-theme='dark']` vào là bộ kiểm tương phản
 * lặng lẽ chuyển sang chấm bảng TỐI, còn bảng sáng thì hết được chấm — mà CI vẫn xanh. Buộc phải
 * nói rõ đang hỏi bảng nào thì không còn đường nào để lệch.
 *
 * Bộ chọn không có trong file thì trả về map rỗng; nơi gọi tự báo thiếu token nào.
 */
export function extractColorTokens(css: string, selector = ':root'): Record<string, string> {
  const body = cssBlock(css, selector);
  if (body === null) return {};

  const tokens: Record<string, string> = {};
  const pattern = /(--color-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;

  for (const match of body.matchAll(pattern)) {
    const name = match[1];
    const value = match[2];
    if (name !== undefined && value !== undefined) tokens[name] = value;
  }

  return tokens;
}
