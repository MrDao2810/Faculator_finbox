import { describe, expect, it } from 'vitest';

import {
  DEFAULT_OVERSCAN,
  VIRTUALIZE_THRESHOLD,
  shouldVirtualize,
  windowRange,
} from './virtual-window';

/** Bộ số sát thực tế WF-02: 107 công thức, khung nhìn điện thoại 780px. */
const DEU = (h: number, n = 107): number[] => Array.from({ length: n }, () => h);
const BASE = { viewportHeight: 780, overscan: 0 } as const;

/**
 * Chiều cao THẬT đo được của 107 thẻ ở khổ 390px (xem docblock của VirtualList): sáu mức, từ
 * 102px tới 194px. Dựng lại đúng phân bố ấy để ca kiểm chạy trên hình dạng dữ liệu thật chứ
 * không trên một danh sách đều tăm tắp mà sản phẩm không bao giờ có.
 */
const THAT: number[] = [
  ...DEU(102, 4),
  ...DEU(122, 67),
  ...DEU(141, 12),
  ...DEU(152, 22),
  ...DEU(171, 1),
  ...DEU(194, 1),
];
const TONG_THAT = THAT.reduce((s, h) => s + h, 0);

describe('shouldVirtualize()', () => {
  it('danh sách ngắn thì dựng thẳng, không ảo hoá', () => {
    expect(shouldVirtualize(21)).toBe(false);
    expect(shouldVirtualize(VIRTUALIZE_THRESHOLD)).toBe(false);
  });

  it('vượt ngưỡng thì mới ảo hoá', () => {
    expect(shouldVirtualize(VIRTUALIZE_THRESHOLD + 1)).toBe(true);
    expect(shouldVirtualize(107)).toBe(true);
  });
});

describe('windowRange() — ở đỉnh danh sách', () => {
  it('bắt đầu từ dòng 0 và không có đệm trên', () => {
    const w = windowRange({ ...BASE, heights: DEU(84), scrollTop: 0 });

    expect(w.start).toBe(0);
    expect(w.padTop).toBe(0);
  });

  it('chỉ dựng đủ số dòng lấp kín khung nhìn', () => {
    const w = windowRange({ ...BASE, heights: DEU(84), scrollTop: 0 });

    // 780 / 84 = 9,28 → dòng thứ 10 (chỉ số 9) là dòng cuối còn chạm khung nhìn.
    expect(w.end).toBe(10);
  });

  it('đệm dưới đúng bằng phần chưa dựng', () => {
    const w = windowRange({ ...BASE, heights: DEU(84), scrollTop: 0 });
    expect(w.padBottom).toBe((107 - w.end) * 84);
  });
});

describe('windowRange() — giữa danh sách', () => {
  it('bỏ qua đúng số dòng đã cuộn qua', () => {
    // Cuộn 840px = đúng 10 dòng cao 84px.
    const w = windowRange({ ...BASE, heights: DEU(84), scrollTop: 840 });

    expect(w.start).toBe(10);
    expect(w.padTop).toBe(840);
  });

  it('overscan dựng thêm dòng ở cả hai phía', () => {
    const heights = DEU(84);
    const plain = windowRange({ ...BASE, heights, scrollTop: 2_100, overscan: 0 });
    const padded = windowRange({ ...BASE, heights, scrollTop: 2_100, overscan: 5 });

    expect(padded.start).toBe(plain.start - 5);
    expect(padded.end).toBe(plain.end + 5);
  });

  it('overscan mặc định lớn hơn 0 — cuộn nhanh không thấy khoảng trắng', () => {
    expect(DEFAULT_OVERSCAN).toBeGreaterThan(0);
  });
});

/*
 * Đây là nhóm ca kiểm gác đúng lỗi đã gặp: bản trước nhận một `rowHeight` duy nhất và tin mọi
 * dòng cao bằng nhau, nên với thư viện thật (sáu chiều cao khác nhau) nó tính tổng thiếu gần
 * 5 000px và cắt cụt thẻ cao.
 */
describe('windowRange() — dòng KHÔNG cao bằng nhau', () => {
  it('tổng chiều cao luôn khớp tuyệt đối với tổng thật, ở mọi vị trí cuộn', () => {
    for (let scrollTop = 0; scrollTop <= TONG_THAT + 500; scrollTop += 331) {
      const w = windowRange({ ...BASE, heights: THAT, scrollTop });
      const dungRa = THAT.slice(w.start, w.end).reduce((s, h) => s + h, 0);

      expect(w.padTop + dungRa + w.padBottom, `scrollTop=${scrollTop}`).toBe(TONG_THAT);
    }
  });

  it('đệm trên bằng đúng tổng các dòng phía trên, không phải số dòng nhân một hằng số', () => {
    // Cuộn qua trọn 4 thẻ 102px + 10 thẻ 122px = 1 628px.
    const w = windowRange({ ...BASE, heights: THAT, scrollTop: 1_628 });

    expect(w.start).toBe(14);
    expect(w.padTop).toBe(4 * 102 + 10 * 122);
  });

  it('dòng đang nằm trong tầm nhìn luôn được dựng, kể cả dòng cao bất thường', () => {
    // Thẻ 194px là thẻ cuối cùng của bộ; cuộn tới đúng chỗ nó bắt đầu.
    const truoc = THAT.slice(0, 106).reduce((s, h) => s + h, 0);
    const w = windowRange({ ...BASE, heights: THAT, scrollTop: truoc });

    expect(w.start).toBeLessThanOrEqual(106);
    expect(w.end).toBe(107);
    expect(w.padBottom).toBe(0);
  });

  it('khung nhìn lấp đầy bằng CHIỀU CAO thật chứ không bằng số dòng', () => {
    // Toàn dòng cao 194px thì 780px khung nhìn chỉ chứa được 5 dòng…
    const cao = windowRange({ ...BASE, heights: DEU(194), scrollTop: 0 });
    // …còn toàn dòng 102px thì chứa được 8.
    const thap = windowRange({ ...BASE, heights: DEU(102), scrollTop: 0 });

    expect(cao.end).toBe(5);
    expect(thap.end).toBe(8);
  });
});

describe('windowRange() — các mép dễ sai', () => {
  it('cuộn tới đáy thì end dừng đúng ở số dòng, không vượt', () => {
    const w = windowRange({ ...BASE, heights: DEU(84), scrollTop: 107 * 84 });

    expect(w.end).toBe(107);
    expect(w.padBottom).toBe(0);
    expect(w.start).toBeLessThan(107);
  });

  it('cuộn quá đà xuống dưới vẫn cho khoảng hợp lệ', () => {
    const w = windowRange({ ...BASE, heights: DEU(84), scrollTop: 999_999 });

    expect(w.start).toBe(106);
    expect(w.end).toBe(107);
    expect(w.padBottom).toBe(0);
  });

  it('cuộn quá đà lên trên (đàn hồi trên iOS) coi như ở đỉnh', () => {
    const w = windowRange({ ...BASE, heights: DEU(84), scrollTop: -300 });

    expect(w.start).toBe(0);
    expect(w.padTop).toBe(0);
  });

  it('danh sách ngắn hơn khung nhìn thì dựng hết, không có đệm', () => {
    const w = windowRange({ ...BASE, heights: DEU(84, 3), scrollTop: 0 });

    expect(w).toEqual({ start: 0, end: 3, padTop: 0, padBottom: 0 });
  });

  it('danh sách rỗng trả khoảng rỗng, không ném lỗi', () => {
    expect(windowRange({ ...BASE, heights: [], scrollTop: 0 })).toEqual({
      start: 0,
      end: 0,
      padTop: 0,
      padBottom: 0,
    });
  });

  it('chưa đo được dòng nào thì dựng cả danh sách chứ không dựng rỗng', () => {
    const w = windowRange({ ...BASE, heights: DEU(0), scrollTop: 0 });

    expect(w.start).toBe(0);
    expect(w.end).toBe(107);
  });

  it('chiều cao rác lẫn vào không kéo phép cộng đi sai', () => {
    const heights = [100, Number.NaN, 100, -50, 100, Number.POSITIVE_INFINITY, 100];
    const w = windowRange({ ...BASE, heights, scrollTop: 0, overscan: 0 });

    expect(w.padTop + heights.slice(w.start, w.end).filter((h) => h === 100).length * 100).toBe(
      400,
    );
    expect(Number.isFinite(w.padBottom)).toBe(true);
    expect(w.padBottom).toBeGreaterThanOrEqual(0);
  });

  it('khung nhìn cao 0 vẫn dựng ít nhất một dòng để đo lại', () => {
    const w = windowRange({ ...BASE, heights: DEU(84), viewportHeight: 0, scrollTop: 0 });
    expect(w.end - w.start).toBeGreaterThanOrEqual(1);
  });

  it('giá trị không hữu hạn không làm hỏng khoảng trả về', () => {
    const w = windowRange({ ...BASE, heights: DEU(84), scrollTop: Number.NaN });

    expect(Number.isFinite(w.start)).toBe(true);
    expect(Number.isFinite(w.padTop)).toBe(true);
    expect(w.start).toBe(0);
  });

  it('start luôn nhỏ hơn hoặc bằng end, ở mọi vị trí cuộn và cả khi dòng lệch nhau', () => {
    for (const heights of [DEU(84), THAT]) {
      for (let scrollTop = -500; scrollTop <= 16_000; scrollTop += 137) {
        const w = windowRange({ ...BASE, heights, scrollTop, overscan: 4 });

        expect(w.start, `scrollTop=${scrollTop}`).toBeLessThanOrEqual(w.end);
        expect(w.start).toBeGreaterThanOrEqual(0);
        expect(w.end).toBeLessThanOrEqual(107);
        expect(w.padTop).toBeGreaterThanOrEqual(0);
        expect(w.padBottom).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
