import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Đầu thẻ nến màn /du-lieu/: thanh 1T/3T/6T/Cả chuỗi nằm cùng hàng với giá, dạt phải, ở MỌI khổ
 * (20/10/2026). Chủ dự án khoanh thanh và kẻ mũi tên sang phải dòng giá: _"có thể chuyển phần khoanh
 * đỏ sang bên phải … áp dụng cho bản mobile"_, rồi _"áp dụng cho cả màn web nữa. màn web đang bị xuống
 * dòng"_. Đo trên Chrome ở 320, 360, 390, 768, 1024, 1440: cùng hàng, cùng trục giữa với giá, mép phải
 * khay trùng mép trong của thẻ. Test React không chạy CSS Module, nên ca dưới đọc thẳng file.
 */

function doc(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8');
}

const CSS = doc('./CandleChart.module.css').replace(/\/\*[\s\S]*?\*\//g, '');
const TSX = doc('./CandleChart.tsx');

function luat(boChon: string, css = CSS): string {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[{}])\\s*${thoat}\\s*\\{([^}]*)\\}`, 'm').exec(css)?.[1] ?? '';
}

/** Phần file TRƯỚC khối `@media (max-width: 1023.98px)` cuối — luật gốc, áp dụng mọi khổ. */
const GOC = CSS.slice(0, CSS.lastIndexOf('@media (max-width: 1023.98px)'));

describe('đầu thẻ nến — thanh chọn khoảng cạnh giá', () => {
  it('thanh chọn khoảng nằm trong cùng khối với dòng giá', () => {
    const khoi = TSX.indexOf('className={styles.priceLine}');
    expect(khoi).toBeGreaterThan(0);
    expect(TSX.indexOf('className={styles.priceRow}')).toBeGreaterThan(khoi);
    expect(TSX.indexOf('className={styles.ranges}')).toBeGreaterThan(khoi);
  });

  it('ở mọi khổ: một hàng được xuống dòng, thanh dạt phải, dòng giá chỉ đòi chỗ cho con số', () => {
    const hang = luat('.priceLine', GOC);
    expect(hang).not.toMatch(/flex-direction:\s*column/);
    expect(hang).toMatch(/flex-wrap:\s*wrap;/);
    expect(hang).toMatch(/align-items:\s*center;/);
    expect(luat('.ranges', GOC)).toMatch(/margin-left:\s*auto;/);
    expect(luat('.ranges', GOC)).not.toMatch(/align-self/);
    expect(luat('.priceRow', GOC)).toMatch(/flex:\s*1 1 0;/);
  });

  /* Một chỗ khai: khối điện thoại không được dựng lại một bố cục riêng cho hàng giá. */
  it('khối điện thoại không khai lại hàng giá', () => {
    const dt = CSS.slice(CSS.lastIndexOf('@media (max-width: 1023.98px)'));
    expect(dt.includes('.priceLine')).toBe(false);
    expect(dt.includes('.priceRow')).toBe(false);
  });
});
