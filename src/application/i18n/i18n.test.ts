import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { UNIT_SCALES } from '@/core/format';
import { COLUMN_LABELS } from '@/core/paste-import';

import { LOCALES, en, isLocale, missingKeys, t, vi } from './index';

/** Gốc src/ — hai cửa gác quét file (khoá mồ côi, import t trong client) dùng chung. */
const SRC = fileURLToPath(new URL('../..', import.meta.url));

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else if (extname(path) === '.ts' || extname(path) === '.tsx') out.push(path);
  }
  return out;
}

describe('khung i18n', () => {
  it('có đúng hai ngôn ngữ', () => {
    expect(LOCALES).toEqual(['vi', 'en']);
  });

  it('mọi key tiếng Việt đều có nội dung — không được để trống', () => {
    expect(missingKeys('vi')).toEqual([]);
  });

  it('lấy đúng câu tiếng Việt', () => {
    expect(t('nav.home')).toBe('Trang chủ');
    expect(t('mode.advanced')).toBe('Nâng cao');
  });

  it('chưa dịch thì rơi về tiếng Việt, không hiện key trần', () => {
    // `disclaimer.text` là khoá duy nhất còn cố ý chưa dịch (xem docblock en.ts) — dùng chính
    // nó để giữ đường rơi về tiếng Việt luôn có ca kiểm che.
    const text = t('disclaimer.text', 'en');
    expect(text).toBe(t('disclaimer.text'));
    expect(text).not.toContain('disclaimer.');
  });

  it('phần còn nợ dịch chỉ còn đúng câu miễn trừ — cố ý, xem docblock en.ts', () => {
    // Câu miễn trừ trên màn phải trùng từng chữ với câu đính vào file xuất (DISCLAIMER_VI),
    // mà bộ dựng file xuất chưa biết locale — dịch một vế là hai vế lệch nhau (FR-24).
    expect(missingKeys('en')).toEqual(['disclaimer.text']);
  });

  it('isLocale chặn giá trị lạ đọc từ localStorage', () => {
    expect(isLocale('vi')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(7)).toBe(false);
  });

  it('câu miễn trừ FR-24 có mặt và đúng nội dung bắt buộc', () => {
    expect(t('disclaimer.text')).toContain('tham khảo');
    expect(t('disclaimer.text')).toContain('không phải khuyến nghị đầu tư');
  });
});

/**
 * Gói 3.6.3 phần giao diện (đợt 7): từ điển EN đã dịch đủ trừ `disclaimer.text`. Ba ca dưới
 * gác đúng ba cách bản dịch hỏng ÂM THẦM: truyền locale mà vẫn ra tiếng Việt (luồng nối sai),
 * sót chữ có dấu trong câu tiếng Anh (dịch thiếu nửa câu), và hai khoá nhắc nhau lệch nhãn.
 */
describe('từ điển tiếng Anh (gói 3.6.3, phần giao diện)', () => {
  it('truyền locale en thì lấy đúng câu tiếng Anh', () => {
    expect(t('nav.home', 'en')).toBe('Home');
    expect(t('mode.advanced', 'en')).toBe('Advanced');
    expect(t('search.noMatch', 'en')).toBe('Nothing found for');
  });

  it('câu tiếng Anh không sót chữ có dấu — trừ hai câu cố ý chứa ví dụ tiếng Việt', () => {
    // `search.hint` phải nêu ví dụ “Định giá” (đó chính là nội dung của câu), và
    // `settings.units.scaleHint` gọi tên đơn vị tiền là "đồng".
    const CO_Y = new Set(['search.hint', 'settings.units.scaleHint']);
    const chuCoDau = /[À-ʯḀ-ỿ]/u;
    const saiSot = Object.entries(en)
      .filter(([key, text]) => !CO_Y.has(key) && chuCoDau.test(text ?? ''))
      .map(([key]) => key);
    expect(saiSot).toEqual([]);
  });

  it('câu trạng thái bảng trống nhắc đúng nhãn nút Add row đã dịch', () => {
    expect(en['series.empty']).toContain(`“${en['series.addRow']}”`);
  });

  it('khoá nhãn bậc đơn vị unit.scale.* khớp từng chữ với UNIT_SCALES gốc (CON-05)', () => {
    // Cùng lý do với paste.col.*: Domain giữ chữ chuẩn, UI tra khoá theo locale — dây neo giữ
    // hai bên không trôi. Đây là chỗ từng hiện "Total interest … million ₫" trên "Unit: triệu ₫".
    for (const scale of UNIT_SCALES) {
      expect(vi[`unit.scale.${scale.id}`]).toBe(scale.label);
    }
  });

  it('khoá nhãn cột paste.col.* khớp từng chữ với COLUMN_LABELS gốc của WF-11', () => {
    // Hai bản cùng tồn tại có chủ đích: Domain giữ chữ chuẩn WF-11 (CON-02 cấm nó đọc i18n),
    // UI tra khoá theo locale. Ca này là dây neo — sửa một bên mà quên bên kia là đỏ.
    const kinds = ['date', 'open', 'high', 'low', 'close', 'volume', 'ignore'] as const;
    for (const kind of kinds) {
      expect(vi[`paste.col.${kind}`]).toBe(COLUMN_LABELS[kind]);
    }
  });
});

/**
 * Chữ trên màn phải đổi được theo ngôn ngữ — cửa gác của luồng locale (gói 3.6.3).
 *
 * `t()` import tĩnh từ barrel là bản ĐÓNG BĂNG tiếng Việt lúc build. Dùng nó cho chữ trên màn
 * thì nút VI/EN bấm không ăn ở đúng chỗ đó, và lỗi ấy chỉ lộ khi có người mở lại từng màn ở
 * chế độ EN mà soi — nghĩa là gần như không bao giờ.
 *
 * Đợt 8 gác bằng cách soi file mở đầu bằng `'use client'`, VÀ ĐÃ THỦNG ngay trong chính đợt đó:
 * `FormulaCard.tsx` với `SearchResults.tsx` không mang directive nào — chúng là module dùng
 * chung, đi vào gói máy khách theo chân component import chúng — nên hai cái badge
 * "Cơ bản"/"Nâng cao" nằm im tiếng Việt giữa màn tiếng Anh mà cửa gác vẫn xanh.
 *
 * Nay soi TOÀN BỘ `src/ui` + `src/app`, không hỏi directive nữa: muốn dùng `t()` build-time thì
 * phải có tên trong danh sách dưới đây kèm lý do. Danh sách này cố ý hẹp và cùng một loại —
 * chữ KHÔNG phải chữ trên màn (metadata), hoặc chữ phải đứng yên vì ràng buộc pháp lý/SEO.
 */
describe('chữ trên màn không được đóng băng lúc build', () => {
  const CO_Y: ReadonlyArray<{ duoi: string; viSao: string }> = [
    {
      duoi: join('app', 'layout.tsx'),
      viSao: 'metadata dựng lúc build (tiêu đề tài liệu, manifest) — không phải chữ trên màn',
    },
    {
      duoi: join('navigation', 'DisclaimerBar.tsx'),
      viSao: 'FR-24 — câu miễn trừ phải trùng từng chữ với câu đính vào file xuất',
    },
    {
      duoi: join('cong-thuc', 'StaticFormulaList.tsx'),
      viSao: 'fallback SEO trong HTML tĩnh, bị FormulaBrowser (đã theo locale) thế chỗ sau hydrate',
    },
    {
      duoi: join('sheets', 'draw-card.ts'),
      viSao: 'thẻ PNG là file xuất — tài liệu tiếng Việt trọn vẹn',
    },
    {
      duoi: join('sheets', 'ExportSheet.tsx'),
      viSao: 'vùng in PDF, cùng lý do với draw-card — giữ bản build-time dưới tên `tVi`',
    },
  ];

  it('không file nào ngoài danh sách miễn trừ import t tĩnh từ barrel', () => {
    const files = [...walk(join(SRC, 'ui')), ...walk(join(SRC, 'app'))].filter(
      (path) => !path.includes('.test.'),
    );
    // Đường dẫn hỏng thì `files` rỗng và ca kiểm đỗ vì KHÔNG có gì để soi — chặn kiểu đỗ giả đó.
    expect(files.length, `không quét được src/ui và src/app từ ${SRC}`).toBeGreaterThan(50);

    const saiSot = files.filter((path) => {
      if (CO_Y.some((mien) => path.endsWith(mien.duoi))) return false;
      // Soi cả đường vòng '@/application/i18n' — barrel không phải cửa duy nhất tới `t`.
      return /import\s*\{[^}]*\bt\b[^}]*\}\s*from\s*'@\/application(\/i18n)?'/.test(
        readFileSync(path, 'utf8'),
      );
    });

    expect(
      saiSot,
      `còn dùng t() build-time cho chữ trên màn: ${saiSot.join(', ')} — chuyển sang useT() (client) hoặc lá <T> (server)`,
    ).toEqual([]);
  });

  it('mọi mục miễn trừ đều còn tồn tại và thật sự đang dùng t build-time', () => {
    // Miễn trừ chết là miễn trừ nguy hiểm: nó ở lại danh sách rồi che một file khác trùng tên
    // sau này. Hết lý do thì phải xoá khỏi danh sách, không để nằm đó cho đẹp.
    const files = [...walk(join(SRC, 'ui')), ...walk(join(SRC, 'app'))];
    const thua = CO_Y.filter((mien) => {
      const path = files.find((p) => p.endsWith(mien.duoi));
      if (path === undefined) return true;
      return !/import\s*\{[^}]*\bt\b[^}]*\}\s*from\s*'@\/application(\/i18n)?'/.test(
        readFileSync(path, 'utf8'),
      );
    });

    expect(
      thua.map((m) => m.duoi),
      'mục miễn trừ không còn cần thiết — xoá khỏi CO_Y',
    ).toEqual([]);
  });
});

/**
 * Khoá mồ côi tự tích lại sau mỗi lần dựng lại màn: viết key trước, đổi ý, quên xoá. Đợt 13
 * dọn 13 khoá như vậy — trong đó 6 khoá `page.placeholder.*` còn nói SAI ("màn WF-01 sẽ dựng"
 * trong khi đã dựng xong từ đợt 8). Ca kiểm này giữ cho chuyện đó không lặp lại, và quan
 * trọng hơn: gói 3.6.3 sẽ dịch từng khoá sang tiếng Anh, dịch cả khoá chết là tốn công thật.
 */
describe('từ điển không được có khoá mồ côi', () => {
  it('mọi key khai báo đều có nơi dùng', () => {
    // Tìm CHÍNH chuỗi key ở bất cứ đâu ngoài thư mục i18n, không chỉ tìm `t('key')`: nhiều
    // key đi vòng qua `labelKey`/`nameKey`/`hintKey` trong một mảng cấu hình rồi mới tới
    // `t(item.labelKey)` — chỉ soi lời gọi trực tiếp là báo nhầm hàng chục khoá.
    // Nhận cả hai kiểu nháy: `t('key')` trong code, và `<T k="key" />` trong JSX (đợt 8).
    const files = walk(SRC).filter((path) => !path.includes(join('application', 'i18n')));
    // Đường dẫn hỏng thì `files` rỗng và ca kiểm đỗ vì KHÔNG có gì để soi — chặn kiểu đỗ giả đó.
    expect(files.length, `không quét được src/ từ ${SRC}`).toBeGreaterThan(50);

    const blob = files.map((path) => readFileSync(path, 'utf8')).join('\n');

    const orphans = Object.keys(vi).filter(
      (key) => !blob.includes(`'${key}'`) && !blob.includes(`"${key}"`),
    );

    expect(orphans, `khoá không nơi nào dùng: ${orphans.join(', ')}`).toEqual([]);
  });
});
