import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    /*
     * Mặc định vẫn là Node: phần lớn test của dự án là hàm thuần ở tầng Domain và
     * Application, chạy Node nhanh hơn hẳn và không cần DOM giả.
     *
     * File nào cần render React thì tự bật jsdom bằng docblock ở đầu file:
     *   // @vitest-environment jsdom
     * Cách này ổn định hơn `environmentMatchGlobs` — tuỳ chọn đó đã bị đánh dấu deprecated
     * ở Vitest 3.
     */
    environment: 'node',
    // Có cả .tsx, nếu không thì test component bị bỏ qua IM LẶNG chứ không báo lỗi.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    /*
     * Nạp sẵn từ điển tiếng Anh cho cả bộ test (28/10/2026). Ở trình duyệt nó nạp động — xem
     * `loadLocale` trong `src/application/i18n/index.ts` — nên thiếu bước này thì mọi ca dựng màn ở
     * chế độ EN thấy chữ tiếng Việt trong lượt đầu và phải chờ một nhịp. Ca kiểm riêng của đường nạp
     * động tự dựng lại module bằng `vi.resetModules()`.
     */
    setupFiles: ['./src/test-setup.ts'],
  },
});
