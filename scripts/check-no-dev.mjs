/**
 * Cửa gác chạy TRƯỚC `next build` (npm gọi tự động qua script `prebuild`).
 *
 * ## Vì sao cần
 *
 * Chạy `npm run build` trong khi `npm run dev` đang chạy làm HỎNG dev server, và nó **không tự
 * hồi phục**: mọi trang trả 500 với `Cannot find module './124.js'` hoặc
 * `__webpack_modules__[moduleId] is not a function`, phải tắt dev, xoá `.next`, bật lại.
 *
 * Lỗi ấy trông y hệt lỗi trong code — nó chỉ vào file trong `.next/server/`, không hề nói gì
 * tới việc bạn vừa chạy build — nên rất tốn công truy. Đã dính hai lần: một lần ở đợt 12
 * (thông điệp lỗi còn được trích trong chú thích của `src/ui/layout/ServiceWorker.tsx`), một
 * lần nữa khi đổ đủ 107 công thức.
 *
 * ## Vì sao không sửa bằng cấu hình
 *
 * Đã thử tách `distDir` cho `next build` sang thư mục riêng — **không ăn thua**, đo lại vẫn hỏng
 * y như cũ. Nguyên nhân không phải build ghi đè chunk của dev: chụp cây file trước/sau build
 * cho thấy build KHÔNG đụng gì ngoài `.next*` và `out/`. Thứ nổ ra là bộ theo dõi file của dev
 * server — `next build` xoá rồi tạo lại hai thư mục đó ngay trong thư mục gốc, dev thấy thư mục
 * gốc đổi nên dựng lại đồ thị module, webpack đánh số lại chunk, còn bundle đã phát đi vẫn đòi
 * số cũ. Không có công tắc nào tắt được chuyện đó.
 *
 * Nên chặn ở đây: rẻ, rõ ràng, và nói đúng việc cần làm.
 *
 * ## An toàn
 *
 * - Chỉ dò cổng ở MÁY MÌNH. Trên CI hay Cloudflare Pages không có gì lắng nghe nên cửa gác im.
 * - Bản thân phép dò mà lỗi thì **cho build chạy tiếp** — cửa gác không bao giờ được là lý do
 *   một bản build hỏng.
 * - Muốn bỏ qua: đặt `FFB_ALLOW_BUILD_WITH_DEV=1`.
 */

import { createConnection } from 'node:net';

/** Cổng `next dev` hay dùng. `PORT` để lỡ ai đổi. */
const PORTS = [Number(process.env.PORT) || 3000, 3001, 3002];

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

if (process.env.FFB_ALLOW_BUILD_WITH_DEV === '1') {
  process.exit(0);
}

const busy = [];
for (const port of PORTS) {
  try {
    if (await isListening(port)) busy.push(port);
  } catch {
    // Dò không được thì thôi — tuyệt đối không chặn build vì chính cửa gác trục trặc.
  }
}

if (busy.length === 0) process.exit(0);

console.error(
  [
    '',
    '  ✖ Đang có server chạy ở cổng ' + busy.join(', ') + ' — dừng build.',
    '',
    '  `next build` xoá rồi tạo lại `.next/` và `out/`. Dev server đang chạy sẽ dựng lại đồ thị',
    '  module giữa chừng và HỎNG hẳn: mọi trang trả 500 với "Cannot find module \'./124.js\'".',
    '  Nó không tự hồi phục — phải tắt dev, xoá `.next`, bật lại.',
    '',
    '  Cách làm: tắt `npm run dev` rồi build lại.',
    '  Nếu cổng đó KHÔNG phải dev server của dự án này: FFB_ALLOW_BUILD_WITH_DEV=1 npm run build',
    '',
  ].join('\n'),
);
process.exit(1);
