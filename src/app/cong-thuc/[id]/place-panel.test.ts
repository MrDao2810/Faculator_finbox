import { describe, expect, it } from 'vitest';

import { PANEL_GAP, placePanel } from './place-panel';
import type { Bounds } from './place-panel';

/** Hai khổ màn mà `check:chrome` đo: điện thoại 360×780 và PC 1440×900, trừ lề 8px. */
const DIEN_THOAI: Bounds = { top: 8, left: 8, right: 352, bottom: 772 };
const PC: Bounds = { top: 72, left: 8, right: 1432, bottom: 892 };

describe('placePanel()', () => {
  it('đủ chỗ thì nằm dưới điểm chạm, căn giữa theo nó', () => {
    const cho = placePanel(
      { top: 200, left: 600, width: 40, height: 20 },
      { width: 352, height: 180 },
      PC,
    );
    expect(cho.side).toBe('below');
    expect(cho.top).toBe(220 + PANEL_GAP);
    expect(cho.left).toBe(620 - 176);
    expect(cho.maxHeight).toBeNull();
  });

  it('phía dưới thiếu chỗ thì lên trên', () => {
    const cho = placePanel(
      { top: 700, left: 600, width: 40, height: 20 },
      { width: 352, height: 300 },
      PC,
    );
    expect(cho.side).toBe('above');
    expect(cho.top).toBe(700 - PANEL_GAP - 300);
  });

  it('cả hai phía đều thiếu thì chọn phía rộng hơn và giới hạn chiều cao', () => {
    // Điểm chạm ở cao 300: dưới còn 444px, trên còn 284px — chọn dưới.
    const duoi = placePanel(
      { top: 300, left: 100, width: 40, height: 20 },
      { width: 344, height: 900 },
      DIEN_THOAI,
    );
    expect(duoi.side).toBe('below');
    expect(duoi.maxHeight).toBe(772 - 320 - PANEL_GAP);
    expect(duoi.top + (duoi.maxHeight ?? 0)).toBeLessThanOrEqual(DIEN_THOAI.bottom);

    // Điểm chạm ở cao 500: trên rộng hơn — khung lên trên, mép trên không lọt khỏi vùng cho phép.
    const tren = placePanel(
      { top: 500, left: 100, width: 40, height: 20 },
      { width: 344, height: 900 },
      DIEN_THOAI,
    );
    expect(tren.side).toBe('above');
    expect(tren.top).toBeGreaterThanOrEqual(DIEN_THOAI.top);
  });

  it('điểm chạm sát mép trái hay phải thì khung vẫn nằm trọn trong màn', () => {
    const trai = placePanel(
      { top: 100, left: 10, width: 20, height: 20 },
      { width: 344, height: 100 },
      DIEN_THOAI,
    );
    expect(trai.left).toBe(DIEN_THOAI.left);

    const phai = placePanel(
      { top: 100, left: 330, width: 20, height: 20 },
      { width: 344, height: 100 },
      DIEN_THOAI,
    );
    expect(phai.left + 344).toBeLessThanOrEqual(DIEN_THOAI.right);
  });

  it('khung rộng hơn cả vùng cho phép thì dính mép trái, không ra số âm', () => {
    const cho = placePanel(
      { top: 100, left: 150, width: 20, height: 20 },
      { width: 400, height: 100 },
      DIEN_THOAI,
    );
    expect(cho.left).toBe(DIEN_THOAI.left);
  });
});
