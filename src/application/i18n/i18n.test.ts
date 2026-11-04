import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { DISCLAIMER_VI } from '@/core/disclaimer';
import { findFormulaModule } from '@/core/formulas';
import { UNIT_SCALES } from '@/core/format';
import { TEN_DANG_VE } from '@/core/chart';
import { COLUMN_LABELS } from '@/core/paste-import';

import { MAX_HOLDINGS } from '../portfolio-store';

import { en } from './en';
import { LOCALES, isLocale, missingKeys, t, vi } from './index';

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
    expect(t('nav.formulas')).toBe('Công thức');
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
    expect(t('nav.formulas', 'en')).toBe('Formulas');
    expect(t('mode.advanced', 'en')).toBe('Advanced');
    expect(t('search.noMatch', 'en')).toBe('Nothing found for');
  });

  it('câu tiếng Anh không sót chữ có dấu', () => {
    /*
     * Danh sách miễn nay RỖNG, và đó là chỗ đáng ghi: cả ba mục từng nằm đây đều rời đi vì khoá
     * của chúng biến mất hoặc đổi nội dung, không mục nào nằm lại cho mọc rêu.
     *
     *   `search.placeholder`        — đổi ví dụ sang "Sharpe", chữ tìm được ở cả hai ngôn ngữ.
     *   `search.hint`               — bỏ hẳn khoá.
     *   `settings.units.scaleHint`  — bỏ hẳn khoá (09/09/2026). Nó là câu duy nhất còn lại gọi tên
     *                                 đơn vị tiền là "đồng" ngay trong bản tiếng Anh.
     *
     * Rỗng thì giữ `Set` chứ đừng gỡ luôn: lần sau có một câu tiếng Anh cố ý mang chữ Việt thì đây
     * là chỗ khai kèm lý do, thay vì ai đó nới regex.
     */
    const CO_Y = new Set<string>([]);
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
    const kinds = ['date', 'open', 'high', 'low', 'close', 'volume'] as const;
    for (const kind of kinds) {
      expect(vi[`paste.col.${kind}`]).toBe(COLUMN_LABELS[kind]);
    }
  });

  it('tên dạng vẽ TEN_DANG_VE khớp từng chữ với nhãn ô "Loại biểu đồ" (chart.kind*), hai ngôn ngữ', () => {
    // Domain viết câu "Chưa vẽ được dạng “…”" mà không đọc được i18n (CON-02), nên giữ một bản tên
    // riêng; ca này là dây neo, cùng nếp COLUMN_LABELS ở trên.
    const khoa = {
      line: 'chart.kindLine',
      candle: 'chart.kindCandle',
      bar: 'chart.kindBar',
      dots: 'chart.kindDots',
      step: 'chart.kindStep',
      signArea: 'chart.kindSignArea',
      waterfall: 'chart.kindWaterfall',
      donut: 'chart.kindDonut',
      gauge: 'chart.kindGauge',
    } as const;
    for (const [dang, key] of Object.entries(khoa)) {
      const ten = TEN_DANG_VE[dang as keyof typeof khoa];
      expect(vi[key], dang).toBe(ten.vi);
      expect(en[key], dang).toBe(ten.en);
    }
  });

  /*
   * "Không dùng" đã bỏ ngày 13/10/2026 — xem mộ chí cạnh `paste.col.*` trong vi.ts. Ghim cả hai
   * phía: khoá không quay lại từ điển, và Domain không quay lại nhãn thứ bảy. Ai cần một cột
   * "bỏ qua" phải đọc lý do ở đó trước, vì chính lựa chọn ấy làm số liệu một cột không được nạp.
   */
  it('không còn nhãn "Không dùng" cho cột, ở cả từ điển lẫn Domain', () => {
    expect(Object.keys(vi).filter((key) => key.startsWith('paste.col.'))).toHaveLength(6);
    expect(Object.keys(COLUMN_LABELS)).toEqual(['date', 'open', 'high', 'low', 'close', 'volume']);
    expect(Object.values(vi)).not.toContain('Không dùng');
  });

  /*
   * Dây neo thứ ba, và nó neo Ý chứ không neo CHỮ.
   *
   * Ô nhập beta ở form Danh mục và công thức `beta` trong Registry nói về cùng một khái niệm, ở hai
   * chỗ người dùng gặp cách nhau vài cú bấm. Hai cách giải thích khác nhau cho cùng một khái niệm
   * là thứ làm người đọc ngờ chính mình hiểu sai.
   *
   * Không so từng chữ như hai ca trên: một câu gợi ý trong form và một đoạn `meaning` đầy đủ vốn dĩ
   * phải khác độ dài. Cái ghim được là MỎ NEO — cùng con số ví dụ, cùng tên chỉ số.
   *
   * Ca này thêm ngày 14/09/2026 khi chủ dự án báo câu gợi ý cũ khó hiểu: nó chỉ nói vì sao sản phẩm
   * CHƯA tính được beta, mà không nói beta là gì — tức chỉ có nghĩa với người đã biết. Vế cuối giữ
   * đúng điều đó khỏi quay lại.
   */
  it('gợi ý beta ở form Danh mục dùng chung mỏ neo với công thức beta của Registry', () => {
    const meaning = findFormulaModule('beta')?.spec.explanation.meaning.vi ?? '';

    /*
     * ── Mỏ neo CON SỐ đã bỏ 09/10/2026, và hai chỗ nay cố ý KHÁC nhau ở chỗ đó ────────────
     *
     * Ca này từng ghim cả hai bên cùng mang ví dụ "1,5". Nửa Registry của mỏ neo ấy không còn:
     * chủ dự án chốt mục Ý nghĩa không được nêu số liệu mẫu (*"ý nghĩa thì làm gì có chuyện có
     * số liệu cụ thể trong đó"*), và `meaning-rules.ts` nay gác điều đó cho cả 111 công thức.
     *
     * Câu gợi ý ở form thì GIỮ con số, và đó là một quyết định chứ không phải bỏ sót: nó đứng
     * dưới một ô người dùng phải tự gõ beta vào, nên một mức ví dụ nói cho họ biết con số phải
     * cỡ nào. Đó là việc của một dòng gợi ý ô nhập, không phải việc của mục Ý nghĩa.
     *
     * Thứ ca này còn ghim được, và là thứ nó sinh ra để ghim: hai chỗ phải giải thích CÙNG MỘT
     * khái niệm theo cùng một mỏ neo — tên chỉ số thật mà `beta` hồi quy theo.
     */
    expect(meaning).toContain('VN-Index');

    const hint = vi['portfolio.betaHint'];
    expect(hint).toContain('1,5');
    expect(hint).toContain('VN-Index');
    // Và vế "vì sao người dùng phải tự nhập" vẫn phải còn — nó là lý do ô này bắt người dùng tự gõ.
    // Từng ghim bằng chữ "nhập tay"; cụm ấy bỏ khỏi cả sản phẩm ngày 20/10/2026 (ca cuối file).
    expect(hint).toMatch(/chưa tự tính được/);
    expect(hint).toMatch(/bạn nhập vào đây/);
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
 * Chữ trên màn không dùng cụm "nhập tay" (20/10/2026).
 *
 * Chủ dự án, đọc mô tả ô beta của CAPM ("… Nhập tay — tính bằng công thức Beta …"): _"tôi đã đưa ra
 * nhiều yêu cầu liên quan đến việc ngôn ngữ cứ lấy từ 'Nhập tay' rồi. nó quê mùa và không hay"_. Lần
 * trước (16/10) chỉ gác chú giải ký hiệu (`formulas.test.ts`), nên cụm ấy còn sống ở chín chỗ khác:
 * mô tả ô, hướng dẫn, gợi ý sửa lỗi, nhãn "đã nhập tay", thông báo lỗi mã, bảng dữ liệu trống. Ca này
 * soi MỌI chuỗi trong mã nguồn (không phải test) của bốn tầng có chữ người dùng đọc, sau khi bỏ chú
 * thích — chú thích nói về "ô nhập tay" như một khái niệm kỹ thuật thì không sao.
 */
describe('chữ trên màn không dùng cụm "nhập tay"', () => {
  const CUM = /nhập tay/i;

  /** Bỏ chú thích khối và chú thích dòng; `[^:]` giữ lại "https://" trong chuỗi. */
  function boChuThich(src: string): string {
    return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  }

  it('máy dò bắt chuỗi có cụm ấy và bỏ qua chú thích', () => {
    expect(CUM.test(boChuThich("vi: 'Nhập tay nếu đã có.',"))).toBe(true);
    expect(CUM.test(boChuThich('/** ô nhập tay thuần */ const a = 1; // ô nhập tay'))).toBe(false);
  });

  it('từ điển tiếng Việt không còn cụm ấy', () => {
    const viPham = Object.entries(vi)
      .filter(([, text]) => CUM.test(text ?? ''))
      .map(([key]) => key);
    expect(viPham).toEqual([]);
  });

  it('mọi chuỗi trong src/core, src/application, src/ui, src/app không còn cụm ấy', () => {
    const files = ['core', 'application', 'ui', 'app']
      .flatMap((tang) => walk(join(SRC, tang)))
      .filter((path) => !path.includes('.test.'));
    // Đường dẫn hỏng thì `files` rỗng và ca đỗ vì không có gì để soi — chặn kiểu đỗ giả đó.
    expect(files.length, `không quét được src từ ${SRC}`).toBeGreaterThan(100);

    const viPham = files
      .filter((path) => CUM.test(boChuThich(readFileSync(path, 'utf8'))))
      .map((path) => path.slice(SRC.length));
    expect(viPham).toEqual([]);
  });
});

/**
 * Chữ trên màn không dùng gạch dài "—" (02/11/2026).
 *
 * Chủ dự án: _"đoạn ký hiệu này "— " đang quá dài. rà xoát lại trong toàn bộ dự án và đổi lại ngắn
 * hơn thành "-"_. Một lượt đổi 1.333 dấu trong chữ hiển thị của 58 file (tên công thức "P/E - hệ số…",
 * nhãn ô "EPS - lợi nhuận…", tên biểu đồ, ngân hàng câu hỏi, từ điển giao diện). Căn cứ pháp lý của
 * biểu phí dùng ":" thay vì "-", vì vế sau là con số ("khoản 2 - 0,1%" đọc thành hai trừ 0,1%).
 *
 * Ca này soi bằng bộ phân tích của TypeScript, không bằng regex bỏ chú thích như ca "nhập tay": nó
 * chỉ đọc CHUỖI, TEMPLATE và CHỮ JSX. Chú thích được dùng gạch dài, và regex cũng vậy, vì nhiều luật
 * viết chữ CẤM gạch dài bằng chính một regex chứa nó, còn ô nhập nhận "—4" là âm 4.
 *
 * Một miễn trừ: gạch nằm giữa “…” trong LỜI GIẢI (`explain`) của ngân hàng câu hỏi là câu TRÍCH
 * NGUYÊN VĂN của nguồn tiếng Anh, giữ đúng như nguồn viết để người đọc mở trang nguồn đối chiếu được.
 * Chỉ `explain`: đề và đáp án cũng có ngoặc cong, nhưng đó là chữ của sản phẩm (đáp án "Hiện “— , —”"
 * của câu P/E âm tả chính chỗ giữ số của màn, và lượt đổi suýt bỏ sót nó). Số gạch được miễn ghim ở 14,
 * nên câu trích thứ 15 có gạch dài là một quyết định chứ không lọt cửa.
 *
 * Chuỗi đọc theo GIÁ TRỊ (`.text`), không theo mã nguồn: '—' trong mã vẫn in ra "—". Chữ JSX thì
 * React giải thực thể HTML, nên `&mdash;` cũng bị bắt.
 */
describe('chữ trên màn không dùng gạch dài "—"', () => {
  const GACH = '—';
  const THUC_THE = /&mdash;|&#8212;|&#x2014;/gi;
  const CO_THE_CO_GACH = /—|\\u2014|\\u\{2014\}|&mdash;|&#8212;|&#x2014;/i;

  /** Chuỗi có nằm dưới khoá `explain` không — chỗ duy nhất ngân hàng câu hỏi đặt câu trích nguồn. */
  function duoiExplain(node: ts.Node, sf: ts.SourceFile): boolean {
    for (let p = node.parent; p !== undefined; p = p.parent) {
      if (ts.isPropertyAssignment(p) && p.name.getText(sf) === 'explain') return true;
    }
    return false;
  }

  /** Gạch dài trong chữ hiển thị của một file (`loi`), và những gạch được miễn (`trich`), kèm số dòng. */
  function gachTrongChu(path: string, text: string): { loi: string[]; trich: string[] } {
    const sf = ts.createSourceFile(
      path,
      text,
      ts.ScriptTarget.Latest,
      true,
      path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const laCauHoi = path.includes(join('core', 'quiz', 'items'));
    const loi: string[] = [];
    const trich: string[] = [];
    const soi = (node: ts.Node): void => {
      if (
        ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node) ||
        ts.isJsxText(node)
      ) {
        const giaTri = (ts.isJsxText(node) ? node.getText(sf) : node.text).replace(THUC_THE, GACH);
        const dauNut = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
        for (let i = giaTri.indexOf(GACH); i >= 0; i = giaTri.indexOf(GACH, i + 1)) {
          const truoc = giaTri.slice(0, i);
          const trongTrich =
            laCauHoi &&
            duoiExplain(node, sf) &&
            (truoc.match(/“/g) ?? []).length > (truoc.match(/”/g) ?? []).length;
          const dong = dauNut + (truoc.match(/\n/g) ?? []).length;
          (trongTrich ? trich : loi).push(`${dong}: ${giaTri.slice(Math.max(0, i - 30), i + 20)}`);
        }
      }
      ts.forEachChild(node, soi);
    };
    soi(sf);
    return { loi, trich };
  }

  it('máy dò bắt chuỗi, chữ JSX, mã thoát và thực thể HTML; bỏ qua chú thích, regex và câu trích của lời giải', () => {
    const loi = (path: string, text: string): number => gachTrongChu(path, text).loi.length;
    expect(loi('a.ts', "const a = 'P/E — hệ số';")).toBe(1);
    expect(loi('a.tsx', 'const a = <p>Bảng — {x}</p>;')).toBe(1);
    expect(loi('a.ts', 'const a = `${x} — ${y}`;')).toBe(1);
    expect(loi('a.ts', '/** P/E — hệ số */ const a = /[—–]/; // —')).toBe(0);
    expect(loi('a.ts', "const a = 'P/E \\u2014 hệ số';")).toBe(1);
    expect(loi('a.tsx', 'const a = <p title="a &mdash; b">Bảng &mdash; {x}</p>;')).toBe(2);
    const cauHoi = join('core', 'quiz', 'items', 'x.ts');
    // Lời giải: gạch trong câu trích được miễn, gạch ngoài ngoặc thì không.
    const q = "const q = { explain: { vi: 'Nguồn ghi “a — b” — c' } };";
    expect(loi(cauHoi, q)).toBe(1);
    expect(gachTrongChu(cauHoi, q).trich).toHaveLength(1);
    // Ngoặc cong ở đáp án và đề là chữ của sản phẩm: bắt hết.
    expect(loi(cauHoi, "const q = { choices: { b: { vi: 'Hiện “— , —”' } } };")).toBe(2);
    expect(loi(cauHoi, "const q = { prompt: { vi: 'Bấm “Lưu — Thoát”' } };")).toBe(1);
  });

  it('mọi chữ hiển thị trong src/core, src/application, src/ui, src/app, src/data không còn gạch dài', () => {
    const files = ['core', 'application', 'ui', 'app', 'data']
      .flatMap((tang) => walk(join(SRC, tang)))
      .filter((path) => !path.includes('.test.'));
    // Đường dẫn hỏng thì `files` rỗng và ca đỗ vì không có gì để soi — chặn kiểu đỗ giả đó.
    expect(files.length, `không quét được src từ ${SRC}`).toBeGreaterThan(100);

    const trich: string[] = [];
    const viPham = files.flatMap((path) => {
      const text = readFileSync(path, 'utf8');
      if (!CO_THE_CO_GACH.test(text)) return [];
      const ketQua = gachTrongChu(path, text);
      trich.push(...ketQua.trich.map((cho) => `${path.slice(SRC.length)}:${cho}`));
      return ketQua.loi.map((cho) => `${path.slice(SRC.length)}:${cho}`);
    });
    expect(viPham, viPham.join('\n')).toEqual([]);
    // 14 gạch trong 5 câu trích nguồn tiếng Anh (fundamentals, personal, risk, technical,
    // valuation-multiples). Đổi số này là quyết định giữ hay bỏ một câu trích, không phải nới cửa.
    expect(trich, trich.join('\n')).toHaveLength(14);
  }, 30_000);

  it('manifest.webmanifest (tên, mô tả, lối tắt hiện khi cài ứng dụng) không có gạch dài', () => {
    const chuoi: string[] = [];
    const gom = (v: unknown): void => {
      if (typeof v === 'string') chuoi.push(v);
      else if (Array.isArray(v)) v.forEach(gom);
      else if (typeof v === 'object' && v !== null) Object.values(v).forEach(gom);
    };
    gom(JSON.parse(readFileSync(join(SRC, '..', 'public', 'manifest.webmanifest'), 'utf8')));
    expect(chuoi.length).toBeGreaterThan(5);
    expect(chuoi.filter((s) => s.includes(GACH))).toEqual([]);
  });

  it('CSS không vẽ gạch dài bằng `content:`', () => {
    const css = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) return css(path);
        return extname(path) === '.css' ? [path] : [];
      });
    const files = css(SRC);
    expect(files.length).toBeGreaterThan(20);
    const viPham = files.flatMap((path) => {
      const text = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      return [...text.matchAll(/content\s*:\s*([^;}]+)/g)]
        .filter((m) => /—|\\0*2014/.test(m[1] ?? ''))
        .map((m) => `${path.slice(SRC.length)}: ${m[0]}`);
    });
    expect(viPham).toEqual([]);
  });
});

/**
 * Gạch nối cách hai bên không đứng sát con số (03/11/2026).
 *
 * Lượt đổi "—" thành "-" tạo ra đúng loại lỗi chủ dự án đã hai lần bắt ở gạch dài cạnh công thức:
 * gạch nối đứng ngay trước hay ngay sau một con số thì đọc thành dấu trừ. "” - 28.000 (giá sau điều
 * chỉnh) + 2.000 = 30.000" thành −28.000, "FPT - 1.000 CP" thành âm 1.000 cổ phiếu, "ví dụ 1,1 -
 * hoặc…" thành 1,1 trừ. Vòng soát đối kháng tìm ra khoảng 250 chỗ như vậy; tất cả viết lại bằng ":",
 * ",", ", tức", ngoặc đơn hoặc tách câu, và tiêu đề Ví dụ thực tế đổi hẳn sang "FPT: …".
 *
 * Ca này giữ phần máy thấy được: một chữ số (kèm %, ₫ hay ngoặc đóng) ngay trước " - ", hoặc ngay sau
 * (kèm dấu trừ, dấu cộng hay ngoặc mở). Gạch kẹp giữa hai ký hiệu ("g - r", "EPS - EPS") thì máy không
 * phân biệt được với "P/E - hệ số…", nên vẫn phải đọc bằng mắt. Bỏ qua: tên khoá, chuỗi LaTeX (có `\`,
 * `_{`, `^{`), mẩu mã dẫn chứng (`calcEvidence` và các mảng mã cùng loại), và câu trích “…” của ngân hàng
 * câu hỏi, nơi công thức của nguồn viết "(V₀ - VD)" bằng dấu trừ thật.
 */
describe('chữ trên màn không để gạch nối đứng sát con số', () => {
  const SAT_SO = /\d[%₫)]?\s-\s|\s-\s[(−+]?\d/;
  const LATEX = /\\|_\{|\^\{/;
  const MA = /\bconst\b|\breturn\b|=>|\.length\b|\bMath\.|[a-z]\([a-z]/;
  /** Khoá mà giá trị là LaTeX hay mã, không phải chữ: "-" ở đó là dấu trừ thật. */
  const KHOA_KHONG_PHAI_CHU = new Set(['latex', 'symbol', 'calcEvidence']);

  function khoaGanNhat(node: ts.Node, sf: ts.SourceFile): string {
    for (let p = node.parent; p !== undefined; p = p.parent) {
      if (ts.isPropertyAssignment(p)) return p.name.getText(sf);
    }
    return '';
  }

  function satSo(path: string, text: string): string[] {
    const sf = ts.createSourceFile(
      path,
      text,
      ts.ScriptTarget.Latest,
      true,
      path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const laCauHoi = path.includes(join('core', 'quiz', 'items'));
    const out: string[] = [];
    const soi = (node: ts.Node): void => {
      const laChu =
        ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node) ||
        ts.isJsxText(node);
      const laTenKhoa = laChu && ts.isPropertyAssignment(node.parent) && node.parent.name === node;
      if (laChu && !laTenKhoa && !KHOA_KHONG_PHAI_CHU.has(khoaGanNhat(node, sf))) {
        let giaTri = ts.isJsxText(node) ? node.getText(sf) : node.text;
        if (laCauHoi) giaTri = giaTri.replace(/“[^”]*”/g, '“”');
        const m = SAT_SO.exec(giaTri);
        if (m !== null && !LATEX.test(giaTri) && !MA.test(giaTri)) {
          const dong = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
          out.push(`${dong}: …${giaTri.slice(Math.max(0, m.index - 30), m.index + 30)}…`);
        }
      }
      ts.forEachChild(node, soi);
    };
    soi(sf);
    return out;
  }

  it('máy dò bắt số sát gạch ở cả hai phía, bỏ qua LaTeX, mã và câu trích', () => {
    expect(satSo('a.ts', "const a = 'nắm giữ - 0,27 đồng';")).toHaveLength(1);
    expect(satSo('a.ts', "const a = 'ví dụ 1,1 - hoặc để trống';")).toHaveLength(1);
    expect(satSo('a.ts', "const a = 'đúng 5,77% - lệch càng lớn';")).toHaveLength(1);
    expect(satSo('a.ts', "const a = 'P/E - hệ số giá trên lợi nhuận';")).toHaveLength(0);
    expect(satSo('a.ts', "const a = 'VN-Index, 6-12 tháng';")).toHaveLength(0);
    expect(satSo('a.ts', "const a = 'r_t = \\\\frac{P_t}{P_{t-1}} - 1';")).toHaveLength(0);
    expect(satSo('a.ts', "const a = 'const h = (sorted.length - 1) * ratio';")).toHaveLength(0);
    expect(satSo('a.ts', "const a = { latex: '(1+i)^n - 1', meaning: 'x' };")).toHaveLength(0);
    const cauHoi = join('core', 'quiz', 'items', 'x.ts');
    expect(
      satSo(cauHoi, "const q = { explain: { vi: 'Nguồn ghi “(r - 5%)” rồi' } };"),
    ).toHaveLength(0);
    expect(satSo(cauHoi, "const q = { explain: { vi: 'Nguồn ghi “a” - 28.000' } };")).toHaveLength(
      1,
    );
  });

  it('mọi chữ hiển thị trong src/core, src/application, src/ui, src/app, src/data', () => {
    const files = ['core', 'application', 'ui', 'app', 'data']
      .flatMap((tang) => walk(join(SRC, tang)))
      .filter((path) => !path.includes('.test.'));
    expect(files.length, `không quét được src từ ${SRC}`).toBeGreaterThan(100);

    const viPham = files.flatMap((path) => {
      const text = readFileSync(path, 'utf8');
      if (!/\s-\s/.test(text)) return [];
      return satSo(path, text).map((cho) => `${path.slice(SRC.length)}:${cho}`);
    });
    expect(viPham, viPham.join('\n')).toEqual([]);
  }, 30_000);
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

/**
 * Bài hướng dẫn trỏ vào màn tính bằng NHÃN đặt trong ngoặc kép, nên nhãn ấy phải có thật.
 *
 * Lỗi thật, lộ ra ngày 06/10/2026 khi chủ dự án hỏi *"«Xem kết quả đổi theo» là phần nào?"*. Bản
 * tiếng Việt quả có nhãn ấy; bản tiếng Anh của cùng đoạn lại viết "See the result change with",
 * còn nhãn thật trên màn là "See how the result changes with" — bài chỉ người đọc đi tìm một cái
 * tên không tồn tại, và không cửa gác nào thấy được: cả hai đều là chuỗi hợp lệ.
 *
 * Quét theo NGOẶC KÉP THẲNG (`"…"`) chứ không quét mọi dấu nháy: đó là dấu duy nhất bài dùng để
 * trích nhãn màn hình, trong khi `“…”` là dấu trích nguồn của ngân hàng câu hỏi.
 */
describe('bài hướng dẫn chỉ trích nhãn có thật trên màn', () => {
  it.each(['vi', 'en'] as const)('mọi nhãn bài %s trích đều là một nhãn của chính màn ấy', (ma) => {
    const tuDien: Readonly<Record<string, string>> = ma === 'vi' ? vi : en;
    /* So với TOÀN BỘ từ điển cùng thứ tiếng: nhãn có thể là tiêu đề khối, nhãn ô hay nhãn nút. */
    const nhanCo = new Set(Object.values(tuDien).filter((chu) => chu.length > 0));

    const sai: string[] = [];
    for (const [khoa, chu] of Object.entries(tuDien)) {
      if (!khoa.startsWith('guide.')) continue;
      for (const m of chu.matchAll(/"([^"]+)"/g)) {
        const nhan = m[1] ?? '';
        if (!nhanCo.has(nhan)) sai.push(`${khoa}: không có nhãn nào tên "${nhan}"`);
      }
    }

    expect(sai, sai.join(' · ')).toEqual([]);
  });

  /*
   * ── Mộ chí: ca "có ít nhất một đoạn bài đang trích nhãn màn hình" (bỏ 13/10/2026) ───────────
   *
   * Ca ấy chặn kiểu đỗ giả: phép quét ở trên vẫn xanh nếu bài không còn trích nhãn nào, nên nó đòi
   * giữ ít nhất một chỗ trích thật "để ai bỏ nốt chỗ trích ấy phải đọc đoạn này". Chỗ trích cuối
   * cùng đã đi, và đi có chủ ý: `guide.chart.switchAxis` · `switchKind` · `when.breakdown` là ba
   * câu duy nhất còn chỉ tới nhãn của màn tính, và chủ dự án bảo gỡ cả (*"không cần đoạn text
   * sau"* — mộ chí ở `vi.ts`). Khung "?" nay chỉ in hình đang hiện, nên không còn câu nào phải dắt
   * người đọc tới một dòng điều khiển.
   *
   * Phép quét GIỮ NGUYÊN và hiện không có gì để quét. Ngày nào bài lại trích một nhãn trong ngoặc
   * kép thẳng thì nó tự làm việc trở lại — và khi ấy nên dựng lại ca này cùng lúc.
   */

  /*
   * Mục "Đọc biểu đồ" (13/10/2026) in nhãn hai dạng, và nhãn ấy phải mang đúng chữ của hai nút
   * "Loại biểu đồ" trên màn tính. Bản tiếng Anh viết "As bars" trong khi nút tên "Bars", nên so
   * không phân biệt hoa thường. Chữ riêng của từng công thức gọi các cột là "bars" cũng vì nút ấy
   * (`kiem.ts` giữ vế đó).
   */
  it.each(['vi', 'en'] as const)('mục "Đọc biểu đồ" %s gọi đúng tên hai nút dạng của màn', (ma) => {
    expect(t('guide.chart.line', ma).toLowerCase()).toContain(
      t('chart.kindLine', ma).toLowerCase(),
    );
    expect(t('guide.chart.bar', ma).toLowerCase()).toContain(t('chart.kindBar', ma).toLowerCase());
  });
});
