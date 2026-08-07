/**
 * Sinh biểu tượng PNG cho PWA từ chính hình học của `public/icon.svg`.
 *
 * Vì sao phải có PNG khi đã có SVG: Chrome **từ chối** biểu tượng SVG trong manifest
 * ("Error while trying to use the following icon from the Manifest") và iOS chưa bao giờ nhận
 * SVG cho `apple-touch-icon`. Trước đợt này manifest chỉ khai SVG, nên PWA không cài được ở
 * bất kỳ nền tảng nào — lỗi chỉ lộ ra khi mở DevTools thật, không test nào bắt.
 *
 * Vì sao tự vẽ thay vì thêm thư viện: sharp/canvas là dependency nhị phân nặng, chỉ để vẽ ba
 * hình đa giác và một chữ nhật bo góc. Ở đây rasterise tay rồi đóng gói PNG bằng `node:zlib`
 * có sẵn — không thêm dependency nào (luật của dự án).
 *
 * Chạy: npm run gen:icons
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Hệ toạ độ gốc của icon.svg — mọi hình bên dưới nằm trong khung 32×32. */
const VIEW = 32;

/**
 * Chép từ `public/icon.svg`. Hai màu dải cũng là `--color-brand-from` / `--color-brand-to`
 * của globals.css.
 */
const PAPER = [0xf4, 0xf6, 0xfa];
const BRAND_FROM = [0x2c, 0x6c, 0xbe];
const BRAND_TO = [0x10, 0x2f, 0x5a];

/** Trục dải màu, đúng x1/y1/x2/y2 của `<linearGradient>` trong icon.svg. */
const GRADIENT = { x1: 4.8, y1: 4, x2: 27.2, y2: 27.887 };

/**
 * Màu của dải tại một điểm trong hệ 32.
 *
 * Chiếu điểm lên trục dải rồi nội suy tuyến tính trong không gian sRGB — đúng cách trình duyệt
 * dựng `<linearGradient>` mặc định (`color-interpolation: sRGB`). Nội suy trong không gian
 * tuyến tính hoá sẽ cho dải khác hẳn, và PNG sẽ lệch màu so với chính file SVG cạnh nó.
 */
const GX = GRADIENT.x2 - GRADIENT.x1;
const GY = GRADIENT.y2 - GRADIENT.y1;
const GLEN2 = GX * GX + GY * GY;

function brandAt(x, y) {
  const raw = ((x - GRADIENT.x1) * GX + (y - GRADIENT.y1) * GY) / GLEN2;
  // Ngoài hai đầu trục thì giữ nguyên màu đầu mút — `spreadMethod="pad"` mặc định của SVG.
  const t = raw < 0 ? 0 : raw > 1 ? 1 : raw;
  return [
    BRAND_FROM[0] + (BRAND_TO[0] - BRAND_FROM[0]) * t,
    BRAND_FROM[1] + (BRAND_TO[1] - BRAND_FROM[1]) * t,
    BRAND_FROM[2] + (BRAND_TO[2] - BRAND_FROM[2]) * t,
  ];
}

/**
 * Ba mặt của khối hộp, đúng ba path trong icon.svg. Cả ba lấy màu từ CÙNG một dải
 * (`brandAt()`), tách nhau bằng khe hở.
 *
 * Khe rộng 0,55 đơn vị và chỉ trừ vào cạnh TRONG; cạnh ngoài giữ nguyên nên bóng ngoài vẫn là
 * hình sáu cạnh sắc nét. Chỗ nào không thuộc mặt nào thì lộ nền — đúng như SVG, nơi khe để
 * trống chứ không tô trắng.
 */
const FACES = [
  {
    points: [
      [16, 4],
      [26.834, 8.386],
      [16, 12.771],
      [5.166, 8.386],
    ],
  },
  {
    points: [
      [4.8, 8.831],
      [15.725, 13.253],
      [15.725, 27.887],
      [4.8, 23.464],
    ],
  },
  {
    points: [
      [27.2, 8.831],
      [16.275, 13.253],
      [16.275, 27.887],
      [27.2, 23.464],
    ],
  },
];

/** Điểm có nằm trong đa giác không — thuật toán ray casting. */
function inside(px, py, points) {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Điểm có nằm trong chữ nhật bo góc không — dùng cho nền. `radius` tính theo hệ 32. */
function insideRounded(px, py, size, radius) {
  if (px < 0 || py < 0 || px > size || py > size) return false;
  const cx = Math.min(Math.max(px, radius), size - radius);
  const cy = Math.min(Math.max(py, radius), size - radius);
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Vẽ icon thành mảng RGBA.
 *
 * `SS` là hệ số lấy mẫu phụ: mỗi pixel đích lấy SS×SS mẫu rồi lấy trung bình, nếu không thì
 * cạnh xiên của khối hộp răng cưa rất rõ ở cỡ 192px. 4 là đủ và vẫn nhanh.
 *
 * `maskable` vẽ nền tràn viền và thu nhỏ hình vào vùng an toàn 80% — đúng yêu cầu của
 * `purpose: "maskable"`, nếu không hệ điều hành cắt góc là mất mất một phần khối hộp.
 */
function render(size, { maskable = false } = {}) {
  const SS = 4;
  const pixels = Buffer.alloc(size * size * 4);
  const scale = size / VIEW;

  // Vùng an toàn của maskable: hình co còn 80% và dời vào giữa.
  const shrink = maskable ? 0.8 : 1;
  const offset = maskable ? (VIEW * (1 - shrink)) / 2 : 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          // Toạ độ mẫu trong hệ 32 của SVG.
          const ux = (x + (sx + 0.5) / SS) / scale;
          const uy = (y + (sy + 0.5) / SS) / scale;

          let colour = null;

          if (maskable) {
            // Nền tràn hết khung, không bo góc — hệ điều hành tự cắt theo hình nó muốn.
            colour = PAPER;
          } else if (insideRounded(ux, uy, VIEW, 7)) {
            colour = PAPER;
          }

          if (colour !== null) {
            // Toạ độ hình khối, đã co vào vùng an toàn nếu là maskable.
            const fx = (ux - offset) / shrink;
            const fy = (uy - offset) / shrink;
            for (const face of FACES) {
              if (inside(fx, fy, face.points)) {
                // Lấy màu ở toạ độ ĐÃ gỡ co, không phải toạ độ trên khung ảnh: dải phải co
                // theo khối, nếu không bản maskable chỉ hứng được đoạn giữa của dải.
                colour = brandAt(fx, fy);
                break;
              }
            }
          }

          if (colour !== null) {
            r += colour[0];
            g += colour[1];
            b += colour[2];
            a += 255;
          }
        }
      }

      const samples = SS * SS;
      const i = (y * size + x) * 4;
      // Chia cho `samples` chứ không cho số mẫu trúng: mẫu trượt ra ngoài đóng góp màu 0 và
      // alpha 0, nhờ vậy biên bo góc mờ dần đúng cách thay vì răng cưa.
      pixels[i] = Math.round(r / samples);
      pixels[i + 1] = Math.round(g / samples);
      pixels[i + 2] = Math.round(b / samples);
      pixels[i + 3] = Math.round(a / samples);
    }
  }

  return pixels;
}

/* ── Đóng gói PNG ─────────────────────────────────────────────────────────── */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** RGBA thô → file PNG. Lọc 0 (None) cho mỗi hàng: ảnh phẳng nên deflate đã đủ tốt. */
function toPng(pixels, size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  // 10, 11, 12 = compression 0, filter 0, interlace 0 — Buffer.alloc đã điền 0.

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ── Sinh file ────────────────────────────────────────────────────────────── */

const TARGETS = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
  // iOS bỏ qua manifest và đọc <link rel="apple-touch-icon">; 180 là cỡ nó muốn.
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
];

for (const target of TARGETS) {
  const png = toPng(render(target.size, { maskable: target.maskable }), target.size);
  const path = fileURLToPath(new URL(`../public/${target.name}`, import.meta.url));
  writeFileSync(path, png);
  console.log(
    `${target.name.padEnd(24)} ${target.size}×${target.size} · ${(png.length / 1024).toFixed(1)} kB`,
  );
}
