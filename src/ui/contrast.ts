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

/**
 * Bóc các biến màu `--color-*: #hex;` từ một chuỗi CSS.
 * Dùng để test đọc thẳng globals.css, tránh cảnh chép màu ra file TS rồi lệch nhau.
 */
export function extractColorTokens(css: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  const pattern = /(--color-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;

  for (const match of css.matchAll(pattern)) {
    const name = match[1];
    const value = match[2];
    if (name !== undefined && value !== undefined) tokens[name] = value;
  }

  return tokens;
}
