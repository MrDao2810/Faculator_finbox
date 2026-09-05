import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { DISCLAIMER_VI } from '@/core/disclaimer';
import { UNIT_SCALES } from '@/core/format';
import { COLUMN_LABELS } from '@/core/paste-import';

import { MAX_HOLDINGS } from '../portfolio-store';

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

  it('mọi khoá missingKeys() báo thiếu thì t() thật sự rơi về tiếng Việt, không hiện key trần', () => {
    // Bất biến chung, không neo vào một khoá cụ thể nào — vẫn kiểm được đường rơi về tiếng Việt
    // của t() kể cả khi (như hiện tại) không còn khoá nào thiếu, và tự bắt lại được nếu sau này
    // có khoá mới thêm vào vi.ts mà quên dịch sang en.ts.
    for (const locale of LOCALES) {
      for (const key of missingKeys(locale)) {
        expect(t(key, locale)).toBe(t(key, 'vi'));
      }
    }
  });

  it('từ điển tiếng Anh đã dịch đủ, không còn khoá nào nợ', () => {
    expect(missingKeys('en')).toEqual([]);
  });

  /*
   * Con số chép vào câu chữ thì rữa trong im lặng — lint không thấy được.
   *
   * `portfolio.errFull` phải nói đúng trần số mã đang có hiệu lực. Đây là ca duy nhất trong từ
   * điển có một hằng số của mã nguồn nằm bên trong câu, nên ghim nó lại thay vì đợi ai đó nâng
   * `MAX_HOLDINGS` rồi để màn báo sai con số.
   */
  it('câu “danh mục đã đầy” nói đúng trần MAX_HOLDINGS ở cả hai ngôn ngữ', () => {
    for (const locale of LOCALES) {
      expect(t('portfolio.errFull', locale)).toContain(String(MAX_HOLDINGS));
    }
  });

  it('isLocale chặn giá trị lạ đọc từ localStorage', () => {
    expect(isLocale('vi')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(7)).toBe(false);
  });

  it('câu miễn trừ FR-24 có mặt và đúng nội dung bắt buộc, cả hai ngôn ngữ', () => {
    expect(t('disclaimer.text')).toContain('tham khảo');
    expect(t('disclaimer.text')).toContain('không phải khuyến nghị đầu tư');
    expect(t('disclaimer.text', 'en')).toContain('reference only');
    expect(t('disclaimer.text', 'en')).toContain('not investment advice');
  });

  it('câu miễn trừ trên MÀN theo locale, câu đính vào file xuất luôn tiếng Việt (FR-24)', () => {
    // Hai câu diễn cùng một ý bằng hai ngôn ngữ ở chế độ EN — không phải bản dịch từng chữ của
    // nhau, vì DISCLAIMER_VI đính vào file xuất không đọc theo locale (xem docblock disclaimer.ts).
    expect(t('disclaimer.text', 'en')).not.toBe(DISCLAIMER_VI);
    expect(t('disclaimer.text', 'vi')).toBe(DISCLAIMER_VI);
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

  it('câu tiếng Anh không sót chữ có dấu — trừ một câu cố ý gọi tên đơn vị tiền Việt', () => {
    // `settings.units.scaleHint` gọi tên đơn vị tiền là "đồng" — đó chính là nội dung của câu.
    // Hai mục kia đã rời danh sách chứ không nằm lại cho mọc rêu: `search.placeholder` nay lấy ví
    // dụ "Sharpe" (chữ tìm được ở cả hai ngôn ngữ), còn `search.hint` thì bỏ hẳn khoá.
    const CO_Y = new Set(['settings.units.scaleHint']);
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
 * Chính tả tiếng Anh phải theo MỘT chuẩn — dự án chọn bản Mỹ.
 *
 * Không phải chuyện thẩm mỹ. Chữ tiếng Anh của sản phẩm nằm ở hai nơi rất xa nhau — từ điển này và
 * hàng trăm trường `Bilingual` rải khắp `src/core` — nên hai người viết hai lúc là ra hai lối viết
 * mà chẳng cửa nào đỏ. Đo lúc dựng cửa gác này: `annualized` 36 lần, `annualised` 1; `capitalization`
 * 2 lần ở `valuation-dcf.ts`, `capitalisation` 4 lần ở `valuation-multiples.ts` — cùng một khái niệm,
 * hai cách viết, trong hai file cạnh nhau. Bản Mỹ được chọn vì nó đã là đa số sẵn, và vì tiếng Anh
 * tài chính (Investopedia, Bloomberg, hầu hết fintech) viết như vậy.
 *
 * Danh sách là danh sách CẤM, liệt kê từng từ một, KHÔNG phải regex `-ise`/`-isation`: quét kiểu ấy
 * nuốt luôn "rising", "raising", "comprising", "advertise"… Cùng bài học với ba phép kiểm đã bỏ ở
 * `prose-audit.test.ts`. Mục nào không còn khớp câu nào thì cứ để yên — đây là danh sách cấm, mục
 * chết chính là mục đang làm đúng việc của nó, khác hẳn danh sách miễn trừ ở trên.
 *
 * Chỉ soi chuỗi trong `en: '…'`, không soi cả file: định danh mã nguồn `buildAmortisation()` ở
 * `personal.ts` viết theo lối Anh và không phải chữ người dùng đọc — quét cả file là báo nhầm nó.
 */
describe('chính tả tiếng Anh theo một chuẩn duy nhất', () => {
  /*
   * Khoá là PHẦN GỐC, không phải từ đủ — "annualis" một dòng thay cho annualise / annualised /
   * annualising. Cố ý KHÔNG có "analys": "analyses", "analysis" viết s ở cả hai bản, gốc ấy sẽ báo
   * nhầm chữ đúng. Cũng cố ý không có gốc trần "-ise"/"-our": xem docblock.
   */
  const ANH_MY: Readonly<Record<string, string>> = {
    amortis: 'amortiz',
    annualis: 'annualiz',
    capitalis: 'capitaliz',
    normalis: 'normaliz',
    organis: 'organiz',
    utilis: 'utiliz',
    behaviour: 'behavior',
    colour: 'color',
    favour: 'favor',
    labour: 'labor',
    centre: 'center',
    licence: 'license',
    modelling: 'modeling',
    cancelled: 'canceled',
    practise: 'practice',
    maths: 'math',
    whilst: 'while',
  };

  /** Báo đúng chữ đã bắt được kèm bản Mỹ của chính nó: "capitalisation → capitalization". */
  function viPham(text: string): string[] {
    const out: string[] = [];
    for (const [anh, my] of Object.entries(ANH_MY)) {
      for (const m of text.matchAll(new RegExp(`\\b\\w*${anh}\\w*\\b`, 'gi'))) {
        const chu = (m[0] ?? '').toLowerCase();
        out.push(`${chu} → ${chu.replace(anh, my)}`);
      }
    }
    return out;
  }

  /*
   * Hai ca dưới đều đang xanh vì KHÔNG tìm thấy gì — kiểu đỗ dễ giả nhất trong cả bộ. Ca này soi
   * chính cái máy dò: nó phải bắt được đúng những chuỗi đã sửa trong đợt này, và phải im trước
   * những chữ tiếng Anh hợp lệ mà một regex `-ise`/`-our` tham lam sẽ nuốt nhầm.
   */
  it('máy dò bắt đúng chuỗi lỗi và không báo nhầm chữ hợp lệ', () => {
    expect(viPham('Market capitalisation + Debt')).toEqual(['capitalisation → capitalization']);
    expect(viPham('Loan amortisation schedule')).toEqual(['amortisation → amortization']);
    expect(viPham('the annualised result')).toEqual(['annualised → annualized']);

    for (const sach of [
      'A stable or rising gross margin signals the company is holding its selling price',
      'The figure banks advertise, before accounting for the compounding effect.',
      'Comprising 97,000 VND transfer tax and 100,000 VND dividend tax.',
      'Market capitalization multiplied by shares outstanding',
      'Annualized historical volatility',
      // "analysis"/"analyses" viết s ở cả hai bản — đây là chữ đúng, không được đỏ.
      'The analyses in this section rest on one assumption.',
    ]) {
      expect(viPham(sach), sach).toEqual([]);
    }
  });

  it('từ điển giao diện không còn lối viết Anh', () => {
    const saiSot = Object.entries(en)
      .flatMap(([key, text]) => viPham(text ?? '').map((loi) => `${key}: ${loi}`))
      .sort();

    expect(saiSot, saiSot.join(' · ')).toEqual([]);
  });

  it('mọi chuỗi en: trong Domain không còn lối viết Anh', () => {
    const files = walk(join(SRC, 'core')).filter((path) => !path.includes('.test.'));
    // Đường dẫn hỏng thì `files` rỗng và ca kiểm đỗ vì KHÔNG có gì để soi — chặn kiểu đỗ giả đó.
    expect(files.length, `không quét được src/core từ ${SRC}`).toBeGreaterThan(20);

    const saiSot: string[] = [];
    for (const path of files) {
      const src = readFileSync(path, 'utf8');
      for (const m of src.matchAll(/\ben:\s*(['"])((?:[^\\]|\\.)*?)\1/g)) {
        for (const loi of viPham(m[2] ?? '')) {
          saiSot.push(`${path.slice(SRC.length)}: ${loi}`);
        }
      }
    }

    expect([...new Set(saiSot)].sort(), saiSot.join(' · ')).toEqual([]);
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
