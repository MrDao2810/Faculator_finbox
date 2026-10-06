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
    // 206 câu hỏi kiểm tra hiểu bài, ~150 kB chữ — mỗi trang chỉ cần 1–5 câu của chính nó, nên
    // ngân hàng chỉ được đọc lúc build rồi truyền xuống bằng prop. Xem `src/core/quiz/index.ts`.
    ten: '@/application/quiz',
    khop: (spec) => spec === '@/application/quiz',
    duocPhep: ['app/cong-thuc/[id]/quiz-view.ts'],
  },
  {
    ten: 'quiz-view',
    khop: (spec) => /(^|\/)quiz-view$/.test(spec),
    duocPhep: ['app/cong-thuc/[id]/page.tsx'],
  },
  {
    // Nơi thứ hai, `application/huong-dan.ts`, đã BỎ ngày 05/10/2026. Bài hướng dẫn WF-21 từng đọc
    // khung "cách tính" để biết ô gõ tay nào có công thức riêng trong thư viện, và để biết thẻ
    // Công thức có khung nào không. Cả hai câu trả lời chỉ dùng để bật tắt chữ dùng chung, thứ đã
    // đi khi chủ dự án chốt bài chỉ mang chữ của `guide-111.json`.
    ten: '@/application/how-to',
    khop: (spec) => spec === '@/application/how-to',
    duocPhep: ['app/cong-thuc/[id]/notation-view.ts'],
  },
  {
    ten: 'src/core/how-to',
    khop: (spec) => spec === '@/core/how-to' || spec.startsWith('@/core/how-to/'),
    duocPhep: ['application/how-to.ts'],
  },
  {
    // Mẫu thay số phân tích thành CÂY (05/10/2026). Ranh giới này không phải vì khối lượng chữ như
    // ba cái dưới, mà vì một module: `substitution-shape.ts` nhập `worked-line.ts`, bộ phân tích cú
    // pháp 24 kB. Cây dựng xong thì đứng yên — chỉ các lá đổi theo phím gõ — nên trình duyệt chỉ
    // cần `datSoThaySo` ở `@/core/substitution-cay`, thứ đi qua barrel bình thường.
    ten: '@/application/thay-so',
    khop: (spec) => spec === '@/application/thay-so',
    duocPhep: ['app/cong-thuc/[id]/page.tsx'],
  },
  {
    ten: 'src/core/substitution-shape',
    khop: (spec) => spec === '@/core/substitution-shape',
    duocPhep: ['application/thay-so.ts'],
  },
  {
    // Lời giải có cấu trúc của khối Ví dụ thực tế (29/09/2026) — chữ của cả 111 ví dụ, mỗi trang chỉ
    // cần phần của mình. Xem docblock `src/core/vi-du/types.ts`.
    ten: '@/application/vi-du',
    khop: (spec) => spec === '@/application/vi-du',
    duocPhep: ['app/cong-thuc/[id]/page.tsx'],
  },
  {
    // Trừ module LÁ `types` — barrel `@/application` xuất KIỂU từ đó (`export type`, bị xoá lúc biên
    // dịch), đúng nếp kiểu câu hỏi đi qua `@/core/quiz/types`.
    ten: 'src/core/vi-du',
    khop: (spec) =>
      (spec === '@/core/vi-du' || spec.startsWith('@/core/vi-du/')) &&
      spec !== '@/core/vi-du/types',
    duocPhep: ['application/vi-du.ts'],
  },
  {
    // Bài "Hướng dẫn sử dụng" của 111 công thức (WF-21, 02/10/2026). Ranh giới này nặng hơn ba cái
    // trên: dựng một bài phải CHẠY `calc` hàng trăm lượt (dò số phiên tối thiểu, lấy lại câu cảnh
    // báo thật), nên nó kéo theo cả Registry lẫn hàm tính. Xem `src/core/huong-dan/index.ts`.
    ten: '@/application/huong-dan',
    khop: (spec) => spec === '@/application/huong-dan',
    duocPhep: [
      'app/huong-dan/cong-thuc/[id]/page.tsx',
      /* Đợt 2 (02/10/2026): màn chi tiết dựng sẵn bài để panel mở tại chỗ không phải tải gì. */
      'app/cong-thuc/[id]/page.tsx',
    ],
  },
  {
    // Trừ module LÁ `types`, cùng lẽ với `src/core/vi-du` ngay trên.
    ten: 'src/core/huong-dan',
    khop: (spec) =>
      (spec === '@/core/huong-dan' || spec.startsWith('@/core/huong-dan/')) &&
      spec !== '@/core/huong-dan/types',
    duocPhep: ['application/huong-dan.ts'],
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
