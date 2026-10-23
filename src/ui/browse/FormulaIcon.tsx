import { FORMULA_ICONS } from './formula-icons';

/** Id đã có hình riêng chưa — `FormulaCard` hỏi để biết có phải lùi về icon nhóm không. */
export function hasFormulaIcon(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(FORMULA_ICONS, id);
}

/*
 * Mỗi id một đối tượng `{ __html }` dùng mãi, không dựng mới mỗi lượt vẽ: React 19 so
 * `dangerouslySetInnerHTML` theo đối tượng, nên một đối tượng mới là một lần ghi lại nội dung SVG
 * — 111 lần cho mỗi phím gõ ở ô tìm của danh sách (cùng lý do `FormulaNotationCard` dựng nó một
 * lần bằng `useMemo`).
 */
const HTML = new Map<string, { __html: string }>();

function htmlOf(id: string): { __html: string } | undefined {
  const cached = HTML.get(id);
  if (cached !== undefined) return cached;
  if (!hasFormulaIcon(id)) return undefined;
  const html = { __html: FORMULA_ICONS[id] ?? '' };
  HTML.set(id, html);
  return html;
}

export interface FormulaIconProps {
  /** `FormulaSpec['id']`. */
  id: string;
  /** Cạnh của khung vẽ, tính bằng px. Bộ hình vẽ trên lưới 24 và rõ nhất ở 24–32px. */
  size?: number;
}

/**
 * Hình riêng của MỘT công thức — xem docblock `formula-icons.ts` về bộ hình và quy ước vẽ.
 *
 * KHÔNG `'use client'` và KHÔNG hook, cùng lẽ với `CategoryIcon`: `FormulaCard` (nhánh ô vuông)
 * được kệ `DailyShelf` dựng ở phía server, một hook ở đây sẽ kéo kệ vào gói máy khách.
 *
 * Trả `null` khi id chưa có hình, để nơi gọi tự chọn hình thay thế: một công thức mới chưa kịp
 * vẽ vẫn phải hiện ra được. `formula-icons.test.ts` là chỗ bắt việc quên vẽ.
 */
export function FormulaIcon({ id, size = 24 }: FormulaIconProps) {
  const html = htmlOf(id);
  if (html === undefined) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-formula-icon={id}
      dangerouslySetInnerHTML={html}
    />
  );
}
