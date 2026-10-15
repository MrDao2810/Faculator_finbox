import type { Metadata, Viewport } from 'next';

import { PREFERENCES_STORAGE_KEY, t } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';
import { AppShell } from '@/ui/layout/AppShell';

import './globals.css';

/*
 * Tên sản phẩm lấy từ từ điển chứ không gõ lại: nó xuất hiện ba lần ngay trong khối này.
 * Cách viết đúng là "Faculator Finbox" — không có chữ `l`, khớp gói npm `faculator-finbox`.
 * Một chỗ giữ chữ thì không có chỗ nào để lệch thêm.
 */
const APP_NAME = t('app.name');

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    // Mỗi công thức một tiêu đề riêng, ghép vào khuôn này (FR-25).
    template: `%s · ${APP_NAME}`,
  },
  description:
    'Thư viện công thức tài chính và chứng khoán Việt Nam — tra cứu, tính toán, giải thích.',
  applicationName: APP_NAME,

  /*
   * PWA — gói WBS 3.6.2. Manifest và biểu tượng là file tĩnh trong `public/`, không phải
   * route sinh ra: `trailingSlash: true` biến mọi route thành thư mục có `/` ở cuối, mà
   * `/manifest.webmanifest/` thì trình duyệt không đọc được.
   */
  manifest: '/manifest.webmanifest',
  /*
   * SVG cho tab trình duyệt (nét luôn sắc ở mọi cỡ), PNG cho hệ điều hành.
   * PNG là bắt buộc chứ không phải dự phòng: Chrome từ chối biểu tượng SVG trong manifest, và
   * iOS chưa bao giờ đọc SVG cho apple-touch-icon — chỉ khai SVG thì PWA không cài được ở đâu
   * cả (lỗi tìm ra ở đợt 13, vá ở đợt 15). Sinh lại bằng `npm run gen:icons`.
   */
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    // Tên dưới biểu tượng trên màn hình chính iOS — chỗ hẹp, dùng tên gọn như thanh trên.
    title: t('app.brand'),
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  // Không đặt maximum-scale: người dùng phải phóng to được (NFR-USA-06).
  width: 'device-width',
  initialScale: 1,
  /*
   * Bằng --color-paper của bảng màu xanh (đợt 8). Trước đợt này còn sót màu giấy của đợt 4.
   *
   * Đây là giá trị của BẢNG SÁNG, tức mặc định. Người đã chọn Tối được `PreferencesProvider`
   * vá lại thẻ này lúc chạy, đọc thẳng token đang áp — xem effect bảng màu ở đó. Metadata của
   * Next dựng lúc build nên không có cách nào biết lựa chọn nằm trong máy người dùng.
   */
  themeColor: '#f8fafc',
};

/*
 * Đặt bảng màu và chế độ hiển thị TRƯỚC lượt vẽ đầu tiên.
 *
 * Không có nó thì `data-theme` chỉ được đặt sau khi hydrate xong, và người đã chọn Tối phải nhìn
 * một nháy trắng nguyên trang mỗi lần tải cứng — trên nền tối thì cái nháy ấy chói mắt thật sự.
 *
 * `data-mode` vào cùng script vì cùng một lý do và cùng một kho: màn Công thức bày số công thức
 * trên chip nhóm và dòng đếm theo chế độ, dựng sẵn cả hai con số cho CSS chọn (xem docblock
 * `CategoryChips`). Đặt sau hydrate là người chọn Nâng cao thấy 79 nháy thành 111 ngay dưới mắt. Một lượt đọc `localStorage`, hai
 * thuộc tính — rẻ hơn hẳn việc thêm một script thứ hai.
 *
 * Chỉ ghi thuộc tính khi lựa chọn KHÁC mặc định (`theme: 'light'`, `mode: 'basic'`): HTML tĩnh
 * không mang thuộc tính nào, nên bỏ trống chính là bày đúng mặc định, và CSS ở cả hai chỗ đều
 * viết theo hướng "không có thuộc tính = mặc định".
 *
 * Đây là script inline đầu tiên của dự án. Hai điều đi kèm:
 *   · CSP đã cho phép sẵn — `public/_headers` có `script-src 'self' 'unsafe-inline'`, vốn phải
 *     có vì bản export tĩnh của Next tự bootstrap bằng script inline. Không nới thêm gì.
 *   · `<html>` cần `suppressHydrationWarning`, vì DOM sẽ mang thuộc tính mà HTML tĩnh không
 *     có. Cờ đó chỉ chặn cảnh báo trên ĐÚNG thẻ `<html>`, không lan xuống cây con — và
 *     `chrome-check.mjs` có 5 ca đòi console sạch tuyệt đối để canh chuyện đó.
 *
 * Chỉ đọc, chỉ đặt thuộc tính, và nuốt mọi lỗi: trình duyệt chặn localStorage (chế độ riêng
 * tư của Safari) thì trang vẫn chạy bằng bảng sáng và chế độ Cơ bản chứ không gãy ngay từ `<head>`.
 *
 * ── Ngôn ngữ: che thân trang tới khi chữ đã sang tiếng Anh (15/10/2026) ─────────────────────
 *
 * Thuộc tính thứ ba, cùng một lượt đọc kho. HTML tĩnh là tiếng Việt, và `PreferencesProvider` chỉ
 * đổi chữ sau hydrate, nên người đã chọn EN thấy cả trang tiếng Việt mỗi lần tải cứng rồi mới nhảy
 * sang tiếng Anh — cùng loại nháy với bảng màu. Không thể vẽ sẵn chữ Anh trước khi JS chạy (trang
 * tĩnh chỉ có một bản), nên cách chặn là CHE: script đặt `data-locale-pending`, luật CSS ở
 * `THEME_BOOT_STYLE` ẩn `<body>`, và `PreferencesProvider` gỡ thuộc tính ngay sau lượt vẽ đầu tiên
 * đã mang chữ Anh. Chủ dự án chọn cách này, biết giá của nó: người dùng EN thấy trang muộn hơn một
 * nhịp; người dùng VI không đổi gì.
 *
 * Hạn chót `LOCALE_REVEAL_MS` là lưới an toàn: JS hỏng hay máy quá chậm thì trang vẫn hiện (bằng
 * tiếng Việt) chứ không trắng mãi. `visibility` chứ không `display`: bố cục vẫn dựng sẵn, gỡ che là
 * hiện ngay, không phải tính lại.
 */
const LOCALE_REVEAL_MS = 1500;

const THEME_BOOT_SCRIPT =
  `try{var p=JSON.parse(localStorage.getItem('${PREFERENCES_STORAGE_KEY}')||'{}');` +
  `var d=document.documentElement.dataset;` +
  `if(p.theme==='dark'){d.theme='dark'}` +
  `if(p.mode==='advanced'){d.mode='advanced'}` +
  `if(p.locale==='en'){d.localePending='';` +
  `setTimeout(function(){delete d.localePending},${String(LOCALE_REVEAL_MS)})}}catch(e){}`;

/*
 * Một luật CSS duy nhất, nằm THẲNG trong `<head>` — nửa còn lại của việc chặn nháy.
 *
 * ── Đo được, không phải phỏng đoán ────────────────────────────────────────────────────────
 *
 * Script trên đặt `data-theme='dark'` rất sớm, nhưng `color-scheme: dark` đi kèm thì nằm trong
 * `globals.css`, tức một file NGOÀI. Đo trên Chrome thật (quan sát viên cài qua CDP trước mọi
 * script của trang, người dùng đã chọn Tối, tải lại cứng):
 *
 *   t=131ms  chưa có stylesheet nào   data-theme=null    nền <html> = rgba(0,0,0,0)
 *   t=142ms  stylesheet đã tải        data-theme=dark    nền <html> = rgb(17,24,39)
 *
 * Trong quãng đầu ấy `<html>` không có `color-scheme` nào cả, nên trình duyệt vẽ canvas bằng
 * TRẮNG mặc định của nó — chính là cái nháy chủ dự án báo. Nó không do React ghi đè: `data-theme`
 * đo được không hề đi qua `'light'` lấy một lần. Quãng đo được ở đây chỉ 11ms vì máy nhanh và
 * CSS nằm sẵn trong bộ nhớ đệm; máy chậm hoặc lần tải nguội thì dài hơn hẳn, và đó là lúc nhìn
 * thấy rõ.
 *
 * `color-scheme: dark` khiến trình duyệt tự vẽ canvas bằng nền tối ngay cả khi chưa có luật màu
 * nào của ta — nên chỉ cần nó có mặt SỚM là hết nháy. Không chép mã màu vào đây: mã màu chỉ được
 * sống trong `globals.css` (CON-05, `tokens.test.ts` gác), mà cũng không cần.
 *
 * ── Vì sao bọc trong `@media screen` ──────────────────────────────────────────────────────
 *
 * `globals.css` có `@media print { [data-theme] { color-scheme: light } }` để bản in luôn sáng,
 * và luật ấy thắng được nhờ đứng SAU với cùng độ ưu tiên (0,1,0) — docblock ở đó ghi rõ chuyện
 * này đã đo và đã sửa một lần. Thẻ `<style>` này thì không kiểm soát được mình đứng trước hay sau
 * `<link>` của Next, nên nếu để trần thì nó có thể thắng ngược luật in ra. `@media screen` cắt
 * đứt khả năng đó ngay từ gốc: nó không bao giờ áp khi in, bất kể thứ tự.
 *
 * Luật thứ hai che thân trang khi người dùng đã chọn EN — xem `LOCALE_REVEAL_MS` ở trên. Nằm ở đây
 * chứ không ở `globals.css` vì cùng lý do với luật thứ nhất: nó phải có mặt TRƯỚC lượt vẽ đầu.
 */
const THEME_BOOT_STYLE =
  `@media screen{[data-theme='dark']{color-scheme:dark}` +
  `html[data-locale-pending] body{visibility:hidden}}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: THEME_BOOT_STYLE }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <PreferencesProvider>
          <AppShell>{children}</AppShell>
        </PreferencesProvider>
      </body>
    </html>
  );
}
