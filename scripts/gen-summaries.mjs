/**
 * Sinh lại `src/core/formulas/summaries.generated.ts` từ Registry thật.
 *
 * Chạy sau mỗi lần thêm hoặc sửa metadata một công thức. Quên chạy thì `npm test` đỏ ở
 * `summaries.test.ts` chứ không âm thầm lệch.
 *
 * Vì sao phải đi vòng qua vitest thay vì đọc thẳng file TypeScript: bộ sinh cần IMPORT
 * `ALL_FORMULAS` — tức là phải biên dịch TypeScript. Vitest đã có sẵn trong dự án và làm
 * đúng việc đó; thêm một bộ chạy TS riêng chỉ để sinh một file là thừa dependency.
 *
 * Đặt biến môi trường bằng Node chứ không viết `UPDATE_SUMMARIES=1 vitest` trong package.json:
 * trên Windows npm chạy script qua cmd.exe, cú pháp gán biến kiểu POSIX không hiểu được.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/*
 * Gọi thẳng file .mjs của vitest bằng chính Node đang chạy, không qua `npx`: từ Node 20,
 * `spawn` từ chối chạy `.cmd` trên Windows nếu không bật `shell: true` (EINVAL), mà bật shell
 * thì lại phải lo chuyện trích dẫn đường dẫn có dấu cách. Đường này không vướng cả hai.
 */
const vitest = fileURLToPath(new URL('../node_modules/vitest/vitest.mjs', import.meta.url));

if (!existsSync(vitest)) {
  console.error('Không thấy vitest — chạy `npm ci` trước.');
  process.exit(1);
}

const result = spawnSync(process.execPath, [vitest, 'run', 'src/core/formulas/summaries.test.ts'], {
  stdio: 'inherit',
  env: { ...process.env, UPDATE_SUMMARIES: '1' },
});

if (result.error !== undefined) {
  console.error('Không chạy được vitest:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
