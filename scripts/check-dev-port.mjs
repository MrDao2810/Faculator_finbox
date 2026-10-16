/**
 * Cửa gác chạy TRƯỚC `next dev` (npm gọi tự động qua script `predev`), 16/10/2026.
 *
 * ## Vì sao cần
 *
 * Chủ dự án báo: _"mỗi lần tôi tắt chạy debug thì rồi chạy lại thì ko thấy lưu lại nội dung trong
 * danh mục"_. Đo trên máy: một `next dev` của HÔM TRƯỚC vẫn sống (terminal đã đóng mà tiến trình còn)
 * và giữ cổng 3000, nên lần chạy mới lặng lẽ nhảy sang 3001. Trình duyệt giữ `localStorage` theo
 * ORIGIN — giao thức + máy + CỔNG — nên `localhost:3000` và `localhost:3001` là hai kho riêng: danh mục
 * lưu ở cổng này thì mở cổng kia thấy trống, trông y hệt "mất dữ liệu".
 *
 * `next dev` chỉ tự nhảy cổng khi cổng KHÔNG được chỉ định (`allowRetry = portSource === 'default'`
 * trong `next/dist/cli/next-dev.js`), nên script `dev` nay ghi `-p 3000`: cổng bận thì Next dừng hẳn
 * thay vì đổi origin. Cửa gác này đứng trước nó chỉ để nói ra ĐÚNG nguyên nhân và cách gỡ, bằng tiếng
 * Việt, thay cho một dòng `EADDRINUSE` trơn.
 *
 * ## An toàn
 *
 * - Chỉ dò cổng 3000 ở MÁY MÌNH. Dò lỗi thì cho chạy tiếp — cửa gác không được là lý do dev không lên.
 * - Tìm số tiến trình chỉ để in ra cho người đọc; không tắt gì cả.
 */

import { execFileSync } from 'node:child_process';
import { createConnection } from 'node:net';

const PORT = 3000;

/** Có ai đang lắng nghe cổng này không. Không bao giờ ném — hỏng thì coi như không có. */
function isListening(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: '127.0.0.1', port });
    const done = (answer) => {
      socket.destroy();
      resolve(answer);
    };
    socket.setTimeout(700);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

/** Số tiến trình giữ cổng, hoặc `null`. Chỉ để in ra — dò hỏng thì thôi. */
function pidOnPort(port) {
  try {
    if (process.platform === 'win32') {
      const out = execFileSync('netstat', ['-ano', '-p', 'tcp'], { encoding: 'utf8' });
      const line = out
        .split(/\r?\n/)
        .find((row) => row.includes(`:${port} `) && /LISTENING/i.test(row));
      return line?.trim().split(/\s+/).pop() ?? null;
    }
    const out = execFileSync('lsof', ['-ti', `tcp:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
    return out.split(/\s+/).find((pid) => pid !== '') ?? null;
  } catch {
    return null;
  }
}

let busy = false;
try {
  busy = await isListening(PORT);
} catch {
  // Dò không được thì thôi — tuyệt đối không chặn dev vì chính cửa gác trục trặc.
}

if (!busy) process.exit(0);

const pid = pidOnPort(PORT);
const stop =
  pid === null
    ? '  Tìm tiến trình giữ cổng: netstat -ano | findstr :3000   rồi tắt nó.'
    : process.platform === 'win32'
      ? `  Tiến trình giữ cổng: ${pid}. Tắt nó (PowerShell): Stop-Process -Id ${pid}`
      : `  Tiến trình giữ cổng: ${pid}. Tắt nó: kill ${pid}`;

console.error(
  [
    '',
    `  ✖ Cổng ${PORT} đang bận — chưa chạy dev server.`,
    '',
    '  Thường là một `npm run dev` cũ còn sống (đóng terminal không tắt được nó). Chạy tiếp ở cổng',
    '  khác thì trình duyệt coi là một trang KHÁC: danh mục, phép tính đã lưu và mọi thứ trong',
    '  localStorage của localhost:3000 sẽ không thấy đâu.',
    '',
    stop,
    '  rồi chạy lại: npm run dev',
    '',
  ].join('\n'),
);
process.exit(1);
