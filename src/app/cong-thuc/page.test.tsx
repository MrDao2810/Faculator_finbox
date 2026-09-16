import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES } from '@/application';

import { metadata } from './page';

describe('metadata trang /cong-thuc/', () => {
  it('mô tả SEO nêu đúng số công thức hiện có, không hardcode số cũ', () => {
    expect(metadata.description).toContain(String(FORMULA_MODULES.length));
  });
});

/*
 * Cửa gác sớm cho HTML tĩnh — chạy trong `npm test`, trước cả `next build`.
 *
 * `verify-static.mjs` mới là chỗ gác cuối (nó đọc chính file HTML xuất ra), nhưng nó chỉ chạy SAU
 * build. Ca này bắt sớm cái lỗi phổ biến nhất: ai đó "cho nhất quán" bằng cách gọi `useSearchParams()`
 * hay `useListParams()` thẳng trong màn, thế là Next bỏ cả kệ lẫn danh sách khỏi HTML tĩnh mà build
 * vẫn xanh. Chỗ duy nhất được phép đọc URL là `ListUrlSync` ở tầng application.
 */
describe('màn /cong-thuc/ không đọc URL bằng hook đẩy cả cây ra khỏi HTML tĩnh', () => {
  it('không file nào của route (trừ trang chi tiết) gọi useSearchParams hay useListParams', () => {
    const dir = join(process.cwd(), 'src', 'app', 'cong-thuc');
    const files = readdirSync(dir).filter(
      (name) => /\.tsx?$/.test(name) && !name.includes('.test.'),
    );
    expect(files.length, `không quét được ${dir}`).toBeGreaterThan(3);

    // Soi câu IMPORT chứ không soi chữ trần: docblock của màn nhắc tên hai hook này để nói vì sao
    // không dùng, và một phép soi chữ trần sẽ báo nhầm chính lời giải thích ấy.
    const viPham = files.filter((name) => {
      const src = readFileSync(join(dir, name), 'utf8');
      return (
        /import\s*\{[^}]*\buseSearchParams\b[^}]*\}\s*from\s*'next\/navigation'/.test(src) ||
        /from\s*'@\/application\/use-list-params'/.test(src)
      );
    });
    expect(viPham).toEqual([]);
  });
});
