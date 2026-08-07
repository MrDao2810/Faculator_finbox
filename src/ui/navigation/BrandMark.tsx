/**
 * Dấu hiệu thương hiệu — khối hộp ba chiều, theo bản icon chủ dự án đưa.
 *
 * Vẽ tay bằng SVG chứ không nhúng file ảnh: bản build là HTML tĩnh và mọi ảnh đều
 * `unoptimized`, nên một hình khối đơn giản thế này đi thẳng vào HTML thì không tốn thêm
 * một lượt tải nào (NFR-PER-04). Cũng nhờ vậy nó ăn theo token màu chứ không cứng màu
 * trong file ảnh.
 *
 * Ba mặt tách nhau bằng KHE HỞ chứ không bằng ba sắc xanh như bản trước. Khe để trống chứ
 * không tô trắng: nền nào ở dưới thì lộ nền ấy, nên logo đặt lên thanh trên (nền
 * `--color-surface`) hay lên nền giấy đều đúng, không cần biết trước nền là gì.
 *
 * Vì ranh giới là HÌNH HỌC chứ không phải sắc độ, khối vẫn nổi hình khi mất hẳn màu
 * (NFR-USA-06) — chắc hơn bản ba sắc trước, và cũng là lý do đổ dải màu lên được mà không
 * làm hỏng gì: dải chạy xuyên cả ba mặt, khe vẫn tách chúng ra.
 *
 * `aria-hidden` vì tên thương hiệu bằng chữ nằm ngay cạnh, đọc hai lần là thừa.
 */

/**
 * Ba mặt của khối, đã trừ khe hở.
 *
 * Tỉ lệ đo từ chính ảnh chủ dự án đưa, quy về nửa chiều rộng khối: mặt bên cao 1,333 lần, độ
 * sâu mặt trên 0,405 lần. Bản trước của dự án dùng tỉ lệ khác hẳn (mặt trên sâu hơn mặt bên
 * cao) nên khối trông bẹt — đó là chỗ lệch dễ bỏ qua nhất khi chỉ nhìn lướt hai hình.
 *
 * Khe rộng 0,55 đơn vị trong hệ 32 và chỉ trừ vào CẠNH TRONG — cạnh ngoài giữ nguyên, nên
 * bóng ngoài của khối vẫn là hình sáu cạnh sắc nét. Cùng bộ toạ độ này nằm ở `public/icon.svg`,
 * `public/icon-maskable.svg` và `scripts/gen-icons.mjs`; sửa một chỗ thì sửa cả bốn.
 *
 * Vì sao khe 0,55 chứ không mảnh như bản gốc: bản gốc là ảnh 1024px, khe mảnh ở đó vẫn thấy rõ.
 * Trên thanh trên logo chỉ 26px, khe mảnh hơn nửa pixel thì tan thành một vệt xám và khối mất
 * hình. Đã rasterise đúng 26px rồi phóng nearest-neighbour để kiểm: ở mức này khe còn sống.
 */
export const BRAND_FACES = {
  top: 'M16 4 26.834 8.386 16 12.771 5.166 8.386Z',
  left: 'M4.8 8.831 15.725 13.253v14.634L4.8 23.464V8.831Z',
  right: 'M27.2 8.831 16.275 13.253v14.634L27.2 23.464V8.831Z',
} as const;

/**
 * Trục dải màu: chéo từ góc trên-trái tới góc dưới-phải của khối.
 *
 * `userSpaceOnUse` chứ không phải `objectBoundingBox`: ba mặt là ba `<path>` riêng, nếu dải
 * tính theo khung bao của TỪNG path thì mỗi mặt có một dải riêng và chỗ giáp nhau bị gãy màu.
 * Neo vào hệ toạ độ chung thì dải chạy liền qua cả khối, đúng như một vật thể được chiếu sáng.
 */
const GRADIENT_ID = 'ffb-brand-gradient';

export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={GRADIENT_ID}
          gradientUnits="userSpaceOnUse"
          x1="4.8"
          y1="4"
          x2="27.2"
          y2="27.887"
        >
          {/*
            Dùng `style` chứ không phải thuộc tính `stop-color="var(…)"`: thuộc tính SVG không
            phân giải `var()`, chỉ thuộc tính CSS mới phân giải được.
          */}
          <stop offset="0" style={{ stopColor: 'var(--color-brand-from)' }} />
          <stop offset="1" style={{ stopColor: 'var(--color-brand-to)' }} />
        </linearGradient>
      </defs>

      <path d={BRAND_FACES.top} fill={`url(#${GRADIENT_ID})`} />
      <path d={BRAND_FACES.left} fill={`url(#${GRADIENT_ID})`} />
      <path d={BRAND_FACES.right} fill={`url(#${GRADIENT_ID})`} />
    </svg>
  );
}
