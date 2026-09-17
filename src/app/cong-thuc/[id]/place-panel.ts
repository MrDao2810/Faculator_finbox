/**
 * Tính chỗ đặt khung "cách tính" cạnh điểm chạm — hàm thuần, toạ độ theo khung nhìn (viewport).
 *
 * Luật, theo thứ tự ưu tiên:
 * 1. Nằm DƯỚI điểm chạm nếu đủ chỗ — mắt đang đọc từ trên xuống, khung ra ngay dưới chữ vừa trỏ.
 * 2. Không đủ thì lên TRÊN.
 * 3. Cả hai phía đều thiếu thì đặt ở phía rộng hơn và giới hạn chiều cao (khung tự cuộn bên trong),
 *    thay vì để nó tràn ra ngoài màn.
 * 4. Theo chiều ngang: căn giữa theo điểm chạm, rồi kẹp trong màn. Ở khổ 360 khung gần như rộng
 *    trọn màn nên thực tế nó dính hai lề.
 *
 * "Màn" ở đây là vùng nhìn thấy được sau khi trừ header dính ở trên và thanh tab dính ở dưới — nơi
 * gọi đo hai thanh ấy rồi truyền `bounds` vào, hàm này không đọc DOM.
 */

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Vùng được phép đặt khung, theo toạ độ khung nhìn. */
export interface Bounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface Placement {
  top: number;
  left: number;
  /** Có giá trị khi khung phải tự cuộn vì không phía nào đủ chỗ. */
  maxHeight: number | null;
  side: 'below' | 'above';
}

/** Khoảng hở giữa điểm chạm và mép khung. */
export const PANEL_GAP = 8;

export function placePanel(
  anchor: Box,
  panel: { width: number; height: number },
  bounds: Bounds,
): Placement {
  const anchorBottom = anchor.top + anchor.height;
  const spaceBelow = bounds.bottom - anchorBottom - PANEL_GAP;
  const spaceAbove = anchor.top - bounds.top - PANEL_GAP;

  let side: Placement['side'];
  let top: number;
  let maxHeight: number | null = null;

  if (panel.height <= spaceBelow) {
    side = 'below';
    top = anchorBottom + PANEL_GAP;
  } else if (panel.height <= spaceAbove) {
    side = 'above';
    top = anchor.top - PANEL_GAP - panel.height;
  } else if (spaceBelow >= spaceAbove) {
    side = 'below';
    top = anchorBottom + PANEL_GAP;
    maxHeight = Math.max(spaceBelow, 0);
  } else {
    side = 'above';
    maxHeight = Math.max(spaceAbove, 0);
    top = anchor.top - PANEL_GAP - maxHeight;
  }

  const ideal = anchor.left + anchor.width / 2 - panel.width / 2;
  const maxLeft = Math.max(bounds.left, bounds.right - panel.width);
  const left = Math.min(Math.max(ideal, bounds.left), maxLeft);

  return { top, left, maxHeight, side };
}
