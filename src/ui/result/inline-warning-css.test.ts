import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Thẻ cảnh báo vàng gọn (`InlineWarning`): câu và dòng gợi ý bắt đầu từ mép trái thẻ, không thụt
 * sau icon (23/10/2026, chủ dự án kẻ mũi tên sang trái trên thẻ "Thiếu dữ liệu chuỗi" của biểu đồ).
 *
 * jsdom không dàn trang, nên ca này đọc CSS: thẻ là lưới hai cột, khối chữ tan vào lưới, câu và
 * dòng gợi ý trải hết hai cột. Quay về flex hai ô là hai dòng ấy thụt vào lại.
 */

const CSS = readFileSync(
  fileURLToPath(new URL('./InlineWarning.module.css', import.meta.url)),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

function luat(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`).exec(CSS)?.[1] ?? '';
}

describe('InlineWarning — câu cảnh báo thẳng mép trái thẻ', () => {
  it('thẻ là lưới hai cột: icon, rồi nhãn', () => {
    const than = luat('.warning');
    expect(than).toMatch(/display:\s*grid;/);
    expect(than).toMatch(/grid-template-columns:\s*auto minmax\(0, 1fr\);/);
  });

  it('khối chữ tan vào lưới của thẻ', () => {
    expect(luat('.body')).toMatch(/display:\s*contents;/);
  });

  it('câu và dòng gợi ý trải hết hai cột, bắt đầu dưới icon', () => {
    expect(luat('.message,\n.fix')).toMatch(/grid-column:\s*1 \/ -1;/);
  });

  it('từ 1024px khối câu cũng tan vào lưới, thẻ giữ dáng cũ', () => {
    expect(luat('.cause')).toMatch(/display:\s*contents;/);
  });
});

/*
 * Dưới 1024px thẻ là MỘT hàng như thẻ lỗi Kết quả (05/11/2026, chủ dự án kẻ mũi tên sang phải trên câu
 * "Cần ít nhất 60 phiên giá." của biểu đồ). Đo trên Chrome ở 360 và 390: câu chạm mép phải cùng hàng
 * nhãn, thẻ 59 → 39px; ở 320 câu xuống hàng từ mép trái; tâm icon trùng tâm nhãn.
 */
describe('InlineWarning — dưới 1024px câu đứng bên phải nhãn', () => {
  const khoi = /@media \(max-width: 1023\.98px\)\s*\{([\s\S]*)\}\s*$/.exec(CSS.trim())?.[1] ?? '';
  const trongKhoi = (selector: string): string => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(khoi)?.[1] ?? '';
  };

  it('khối ấy là khối cuối file, sau các luật gốc nó ghi đè', () => {
    expect(khoi).not.toBe('');
  });

  it('thẻ là hàng flex xuống dòng được, thẳng chân chữ', () => {
    const than = trongKhoi('.warning');
    expect(than).toMatch(/display:\s*flex;/);
    expect(than).toMatch(/flex-wrap:\s*wrap;/);
    expect(than).toMatch(/align-items:\s*baseline;/);
  });

  it('lề tự động ở NHÃN, không ở khối câu: câu dài xuống hàng thì bắt đầu ở mép trái', () => {
    expect(trongKhoi('.label')).toMatch(/margin-right:\s*auto;/);
    expect(trongKhoi('.cause')).not.toMatch(/margin-left:\s*auto;/);
  });

  it('câu và dòng ↳ chung một khối dọc', () => {
    const cau = trongKhoi('.cause');
    expect(cau).toMatch(/display:\s*flex;/);
    expect(cau).toMatch(/flex-direction:\s*column;/);
  });

  it('icon dời xuống 2px cho tâm icon trùng tâm nhãn', () => {
    const icon = trongKhoi('.icon');
    expect(icon).toMatch(/position:\s*relative;/);
    expect(icon).toMatch(/top:\s*2px;/);
  });
});
