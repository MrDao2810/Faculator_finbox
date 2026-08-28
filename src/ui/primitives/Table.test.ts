import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Giữ hợp đồng cột số của primitive `Table`.
 *
 * Đọc file nguồn chứ không render: CSS Module không được áp trong jsdom, nên một ca kiểm
 * `getComputedStyle(...).textAlign` sẽ trả chuỗi rỗng ở CẢ hai phía và xanh dù bảng có hỏng.
 * Đúng lý do mà `tokens.test.ts` và `contrast.test.ts` cũng đọc thẳng file.
 *
 * ── Lỗi mà ca kiểm này sinh ra để chặn ────────────────────────────────────────────────────────
 *
 * `Table.tsx` công bố hợp đồng "cột số thì đặt className='numeric'", tức nơi gọi truyền CHUỖI
 * THÔ. Nhưng `.numeric` khai trong một `.module.css` thì bị băm tên thành `Table_numeric___vRFF`,
 * nên bộ chọn không bao giờ khớp. Đo trên bản build: CSS mang tên băm, còn
 * `out/cong-thuc/lich-tra-no/index.html` mang `class="numeric"` — ba cột tiền của lịch trả nợ
 * căn trái suốt từ ngày có tính năng, và không test nào bắt được.
 *
 * Cách chữa là `:global(.numeric)`. Ca kiểm giữ đúng hai vế của hợp đồng ấy.
 */

const SRC_DIR = fileURLToPath(new URL('../..', import.meta.url));

const TABLE_CSS = readFileSync(
  fileURLToPath(new URL('./Table.module.css', import.meta.url)),
  'utf8',
);

/** Nơi gọi truyền chuỗi thô: `className="numeric"`. */
const RAW_NUMERIC = /className=(?:"numeric"|\{'numeric'\}|\{"numeric"\})/;

function tsxFiles(): string[] {
  return readdirSync(SRC_DIR, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx'))
    .map((name) => join(SRC_DIR, name));
}

describe('Table — cột số phải căn phải thật', () => {
  it('luật .numeric bọc trong :global, nếu không tên lớp bị băm và bộ chọn không khớp', () => {
    // Bỏ chú thích trước khi soi, để đoạn docblock nhắc tới `.table .numeric` không tự làm ca kiểm xanh.
    const rules = TABLE_CSS.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(rules).toMatch(/\.table\s+:global\(\.numeric\)\s*\{/);
    expect(rules).toContain('text-align: right');

    // Dạng chưa bọc — chính là con bọ cũ. Không được quay lại.
    expect(rules).not.toMatch(/\.table\s+\.numeric\s*\{/);
  });

  it('vẫn còn nơi gọi truyền chuỗi thô — hợp đồng này có người dùng thật', () => {
    /*
     * Canary. Nếu mọi nơi gọi đổi sang `styles.numeric` thì `:global` thành thừa và ca kiểm trên
     * mất ý nghĩa — lúc ấy ca kiểm này đỏ để bắt phải xem lại cả hai vế, chứ không để chúng
     * lệch nhau trong im lặng.
     */
    const callers = tsxFiles().filter((file) => RAW_NUMERIC.test(readFileSync(file, 'utf8')));

    expect(callers.length).toBeGreaterThan(0);
  });

  it('không nơi nào gọi styles.numeric — lớp này cố ý KHÔNG băm tên', () => {
    const wrong = tsxFiles().filter((file) => /styles\.numeric\b/.test(readFileSync(file, 'utf8')));

    expect(wrong).toEqual([]);
  });
});
