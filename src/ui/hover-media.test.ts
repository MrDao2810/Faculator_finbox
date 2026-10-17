import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Mọi kiểu "đang trỏ chuột vào" (`:hover`) chỉ áp cho máy CÓ chuột — `@media (hover: hover)`.
 *
 * Chủ dự án báo trên điện thoại (16/10/2026): _"click vào button 'Xem ví dụ thực tế' và scroll xuống dưới
 * rồi nhưng khi kéo màn hình lên trên thì vẫn thấy button 'Xem ví dụ thực tế' còn màu"_. Màn cảm ứng
 * không có chuột, nên sau một cú chạm trình duyệt coi phần tử vừa chạm là ĐANG ĐƯỢC TRỎ cho tới khi chạm
 * chỗ khác — nền xanh nhạt của `.secondary:hover` cứ dính trên nút. Không riêng nút ấy: 61 trên 64 luật
 * `:hover` của sản phẩm nằm ngoài khối này (nút, chip, tab, thẻ công thức…), chỉ màn Danh mục đã bọc ba
 * luật. Cả 56 luật dính màu được bọc cùng lần, tại chỗ, nên thứ tự khai — thứ quyết luật nào thắng giữa
 * hai lớp cùng độ ưu tiên — không đổi.
 *
 * Hai dạng được phép đứng ngoài, vì chúng không TÔ màu gì khi trỏ, chỉ giữ nguyên màu cũ:
 *   - nhóm "chống hover": `.a, .a:hover { … }` — bộ chọn có `:hover` đi kèm chính nó không có `:hover`;
 *   - luật trong `@media (prefers-reduced-motion: reduce)` — đặt lại chuyển động về không.
 *
 * Luật gộp `:hover` với `:focus-visible` phải TÁCH: nửa bàn phím vẫn áp ở mọi máy.
 */

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return cssFiles(path);
    return path.endsWith('.css') ? [path] : [];
  });
}

/** Tách danh sách bộ chọn theo dấu phẩy NGOÀI ngoặc — `:not(.a, .b)` không bị cắt đôi. */
function tachBoChon(head: string): string[] {
  const out: string[] = [];
  let sau = 0;
  let cur = '';
  for (const ch of head) {
    if (ch === '(') sau += 1;
    if (ch === ')') sau -= 1;
    if (ch === ',' && sau === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim() !== '') out.push(cur.trim());
  return out;
}

const boHover = (sel: string): string =>
  sel.replace(/:hover(:not\([^()]*(\([^()]*\))?[^()]*\))*/g, '');

/** Mọi luật có `:hover` đứng ngoài `@media (hover: hover)` mà không thuộc hai dạng được phép. */
function luatDinhMau(css: string): string[] {
  const masked = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const stack: string[] = [];
  const sai: string[] = [];
  let start = 0;
  for (let i = 0; i < masked.length; i += 1) {
    const ch = masked[i];
    if (ch === '{') {
      stack.push(masked.slice(start, i).trim());
      start = i + 1;
    } else if (ch === '}') {
      const head = stack.pop() ?? '';
      start = i + 1;
      if (head.startsWith('@') || !head.includes(':hover')) continue;
      const media = stack.filter((h) => h.startsWith('@'));
      if (media.some((m) => /\(hover:\s*hover\)/.test(m))) continue;
      if (media.some((m) => m.includes('prefers-reduced-motion'))) continue;
      const sels = tachBoChon(head);
      const khac = sels.filter((s) => !s.includes(':hover'));
      if (sels.filter((s) => s.includes(':hover')).every((s) => khac.includes(boHover(s))))
        continue;
      sai.push(
        `dòng ${String(masked.slice(0, i).split('\n').length)}: ${head.replace(/\s+/g, ' ')}`,
      );
    } else if (ch === ';' && stack.length > 0) {
      start = i + 1;
    }
  }
  return sai;
}

describe('Kiểu trỏ chuột chỉ áp cho máy có chuột — @media (hover: hover)', () => {
  it('không luật :hover nào tô màu ngoài khối ấy — trên màn cảm ứng màu sẽ dính sau một cú chạm', () => {
    const sai = cssFiles(SRC_DIR).flatMap((file) =>
      luatDinhMau(readFileSync(file, 'utf8')).map((dong) => `${relative(SRC_DIR, file)} ${dong}`),
    );
    expect(sai).toEqual([]);
  });

  /* Ca kiểm của chính ca kiểm: bộ dò phải bắt được đúng dạng lỗi chủ dự án báo, và tha hai dạng được phép. */
  it('bộ dò bắt luật trần, tha luật đã bọc, nhóm chống hover và luật giảm chuyển động', () => {
    expect(luatDinhMau('.secondary:hover:not(:disabled) { background: red; }')).toHaveLength(1);
    expect(luatDinhMau('.hint:hover, .hint:focus-visible { color: red; }')).toHaveLength(1);
    expect(
      luatDinhMau('@media (min-width: 1024px) { .tab:hover { background: red; } }'),
    ).toHaveLength(1);
    expect(luatDinhMau('@media (hover: hover) { .a:hover { color: red; } }')).toEqual([]);
    expect(
      luatDinhMau(
        '@media (min-width: 1024px) { @media (hover: hover) { .a:hover { color: red; } } }',
      ),
    ).toEqual([]);
    expect(luatDinhMau('.active, .active:hover:not(:disabled) { color: blue; }')).toEqual([]);
    expect(
      luatDinhMau(
        '@media (prefers-reduced-motion: reduce) { .back:hover .icon { transform: none; } }',
      ),
    ).toEqual([]);
  });
});
