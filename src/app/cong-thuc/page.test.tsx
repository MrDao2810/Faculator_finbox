import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES } from '@/application';

import { metadata } from './page';

describe('metadata trang /cong-thuc/', () => {
  it('mô tả SEO nêu đúng số công thức hiện có, không hardcode số cũ', () => {
    expect(metadata.description).toContain(String(FORMULA_MODULES.length));
  });
});
