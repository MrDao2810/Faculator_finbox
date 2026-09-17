import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Ranh giới "CHỈ LÚC BUILD" của thẻ Công thức.
 *
 * `katex` (~280 kB) và chữ "cách tính" của cả 111 công thức chỉ được chạy trên máy build, trong
 * `page.tsx` (server component). ESLint canh ranh giới TẦNG, không canh được ranh giới server/client
 * — docblock `latex-html.ts` đã tự thừa nhận điều đó. Lọt một dòng import vào client component là
 * cả hai đi vào gói JS của mọi trang, không cảnh báo nào, không ca kiểm nào khác đỏ (`npm run size`
 * vốn đang đỏ sẵn nên không ai nhận ra nó đỏ thêm).
 *
 * Nên ca này quét mã nguồn: mỗi thứ chỉ-lúc-build chỉ được import từ đúng danh sách nơi được phép.
 * Test không tính — chúng chạy trong Node.
 */

const SRC = fileURLToPath(new URL('../../../', import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

const tuongDoi = (path: string) => relative(SRC, path).split('\\').join('/');

/** Nguồn được import (chuỗi sau `from` hoặc trong `import(…)`), kể cả `import type`. */
function importsOf(noiDung: string): string[] {
  return [...noiDung.matchAll(/(?:from\s+|import\s*\(\s*)'([^']+)'/g)].map((m) => m[1] as string);
}

const LUAT: ReadonlyArray<{ ten: string; khop: (spec: string) => boolean; duocPhep: string[] }> = [
  {
    ten: 'katex',
    khop: (spec) => spec === 'katex' || spec.startsWith('katex/'),
    duocPhep: ['app/cong-thuc/[id]/latex-html.ts'],
  },
  {
    ten: 'latex-html',
    khop: (spec) => /(^|\/)latex-html$/.test(spec),
    duocPhep: ['app/cong-thuc/[id]/notation-view.ts'],
  },
  {
    ten: 'mathml-marks',
    khop: (spec) => /(^|\/)mathml-marks$/.test(spec),
    duocPhep: ['app/cong-thuc/[id]/notation-view.ts'],
  },
  {
    ten: 'notation-view',
    khop: (spec) => /(^|\/)notation-view$/.test(spec),
    duocPhep: ['app/cong-thuc/[id]/page.tsx'],
  },
  {
    ten: '@/application/how-to',
    khop: (spec) => spec === '@/application/how-to',
    duocPhep: ['app/cong-thuc/[id]/notation-view.ts'],
  },
  {
    ten: 'src/core/how-to',
    khop: (spec) => spec === '@/core/how-to' || spec.startsWith('@/core/how-to/'),
    duocPhep: ['application/how-to.ts'],
  },
];

describe('thứ chỉ-lúc-build không lọt vào gói máy khách', () => {
  const files = walk(SRC);

  it('quét được mã nguồn — ca dưới không được rỗng mà vẫn xanh', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  for (const luat of LUAT) {
    it(`${luat.ten} chỉ được import từ: ${luat.duocPhep.join(', ')}`, () => {
      const sai = files
        .filter((file) => importsOf(readFileSync(file, 'utf8')).some(luat.khop))
        .map(tuongDoi)
        .filter((file) => !luat.duocPhep.includes(file));
      expect(sai).toEqual([]);
    });
  }

  it('mọi nơi được phép vẫn còn thật sự import — danh sách không được mục ruỗng', () => {
    const thua = LUAT.flatMap((luat) =>
      luat.duocPhep
        .filter((file) => {
          const path = join(SRC, file);
          return !importsOf(readFileSync(path, 'utf8')).some(luat.khop);
        })
        .map((file) => `${luat.ten} ← ${file}`),
    );
    expect(thua).toEqual([]);
  });
});
