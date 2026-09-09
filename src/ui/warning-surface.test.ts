import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Mặt phẳng cảnh báo vàng phải giống nhau ở mọi màn — đợt rà soát phân cấp thị giác.
 *
 * Bản rà soát thiết kế xếp "Warning/Disclaimer" vào nhóm "lặp lại nhưng chưa đồng nhất giữa các
 * màn". Đo được năm chỗ dựng lại cùng bộ ba token vàng với hai bán kính và hai cỡ chữ:
 *
 *   `InlineWarning.warning`              bo `sm`
 *   `PortfolioScreen.priceError`         bo `sm`, cỡ 12
 *   `FormulaDetail.seriesShortNote`      bo `sm`, cỡ 12
 *   `DisclaimerBar.notice`               bo `md`, cỡ 13
 *   `XirrBody.issues`                    bo `md`, cỡ 13
 *
 * Mỗi luật tự nó vẫn hợp lệ — `tokens.test.ts` chỉ chặn màu viết thẳng, không so hai file với
 * nhau — nên chênh lệch này không cửa nào bắt được. Ca kiểm dưới đây là cửa đó.
 *
 * KHÔNG gom thành component: năm chỗ có cấu trúc bên trong khác hẳn nhau (một cái có icon và
 * dòng "cách sửa", một cái là `<ul>`, một cái là `<p>` một dòng). Thứ phải giống nhau là MẶT
 * PHẲNG — nền, viền, bo góc, cỡ chữ — nên neo đúng bốn thứ ấy.
 *
 * ── `DisclaimerBar.notice` đã RỜI nhóm này, có chủ ý ─────────────────────────────────────────
 *
 * Nó từng nằm trong bảng dưới. Chủ dự án chốt thu nhỏ nó lại — *"giảm size text. màu nhạt đi và
 * padding giảm xuống"* — và lượt ấy phá đúng hai vế của bộ kiểm này. Chỗ đó không phải chỗ nới
 * luật cho dễ, mà là chỗ nhận ra bảng này gom nhầm một thứ ngay từ đầu:
 *
 *   · Năm mặt còn lại xuất hiện vì CÓ CHUYỆN vừa xảy ra — phép tính không ra số, thiếu chuỗi giá,
 *     mã không nạp được. Chúng phải giành lấy mắt người dùng đúng lúc đó.
 *   · Ô miễn trừ thì luôn ở đó, ở mọi màn công thức, bất kể mọi thứ đang chạy tốt. Người dùng đã
 *     đọc nó lần đầu; từ lần thứ hai trở đi nó là ràng buộc pháp lý (FR-24) chứ không phải tin
 *     tức. Bắt nó hét lên bằng đúng giọng của một cảnh báo hỏng việc là dạy người dùng bỏ qua
 *     giọng ấy — và lần bỏ qua tốn kém là ở năm mặt kia.
 *
 * Lý do "không được dùng `--text-xs`" ghi ở ca thứ hai cũng chỉ đúng cho năm mặt kia: nó nói về
 * "câu giải thích vì sao phép tính không ra số". Ô miễn trừ không giải thích gì cả.
 *
 * Rời nhóm KHÔNG có nghĩa là thôi bị canh — xem `describe` thứ hai ở cuối file, nơi neo lại đúng
 * thứ nay đang giữ FR-24 cho nó.
 */

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

const SURFACES: ReadonlyArray<readonly [file: string, className: string]> = [
  ['ui/result/InlineWarning.module.css', 'warning'],
  ['ui/screens/XirrBody.module.css', 'issues'],
  ['app/danh-muc/PortfolioScreen.module.css', 'priceError'],
  ['app/cong-thuc/[id]/FormulaDetail.module.css', 'seriesShortNote'],
  /* "Công thức này không dùng số liệu của mã X" — thêm ở đợt sửa nút Nạp mẫu hứa suông. */
  ['app/cong-thuc/[id]/FormulaDetail.module.css', 'presetMismatch'],
];

const EXPECTED = {
  background: 'var(--color-warning-soft)',
  border: '1px solid var(--color-warning-line)',
  'border-radius': 'var(--radius-md)',
} as const;

function ruleBody(css: string, className: string): string | null {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return new RegExp(`^\\.${className}\\s*\\{([^}]*)\\}`, 'm').exec(stripped)?.[1] ?? null;
}

describe('Mặt phẳng cảnh báo vàng', () => {
  it.each(SURFACES)('%s .%s dùng đúng nền, viền và bo góc chung', (file, className) => {
    const body = ruleBody(readFileSync(join(SRC_DIR, file), 'utf8'), className);

    expect(body, `không tìm thấy luật .${className} trong ${file}`).not.toBeNull();
    if (body === null) return;

    for (const [property, value] of Object.entries(EXPECTED)) {
      const literal = value.replace(/[()\\.*+?[\]^$|]/g, '\\$&');
      expect(body, `${file} .${className} — ${property}`).toMatch(
        new RegExp(`${property}\\s*:\\s*${literal}\\s*;`),
      );
    }
  });

  it('không mặt nào còn để cỡ chữ nhỏ nhất — câu cảnh báo phải đọc được', () => {
    /*
     * `--text-xs` là bậc dành cho metadata (nhãn ô, huy hiệu, tên nhóm). Một câu giải thích vì
     * sao phép tính không ra số KHÔNG phải metadata, và ở bậc đó nó mờ ngang một dòng chú thích
     * bên lề — trái hẳn NFR-USA-04, vốn đòi câu lỗi nói rõ nguyên nhân kèm cách sửa.
     *
     * Khai `font-size` là tuỳ chọn (`InlineWarning` để con bên trong tự lo), nhưng khai thì
     * không được là `--text-xs`.
     */
    for (const [file, className] of SURFACES) {
      const body = ruleBody(readFileSync(join(SRC_DIR, file), 'utf8'), className) ?? '';

      expect(body, `${file} .${className}`).not.toMatch(/font-size:\s*var\(--text-xs\)/);
    }
  });
});

/*
 * Ô miễn trừ ở đầu màn chi tiết — mặt phẳng RIÊNG, và đây là cửa canh nó.
 *
 * Nó rời nhóm trên vì được phép nhạt và nhỏ hơn (lý do đầy đủ ở docblock đầu file). Nhưng "được
 * phép nhạt" tới lúc nào thì thành "biến mất"? FR-24 đòi câu miễn trừ phải thấy được, và sau lượt
 * làm nhạt thì NỀN không còn làm được việc ấy: `--color-notice-soft` chỉ hơn nền trang 1,10:1.
 *
 * Thứ vẽ ra hình cái ô nay là ĐƯỜNG VIỀN. Nên ca dưới neo đúng nó — bỏ viền đi là ô miễn trừ tan
 * vào trang, mà đó là loại hỏng không ai báo: không có gì lỗi cả, chỉ là một ràng buộc pháp lý
 * lặng lẽ thôi hiển thị.
 *
 * Nền thì neo lỏng hơn: chỉ đòi nó là một token riêng của ô miễn trừ, không phải nền cảnh báo
 * chung. Ai muốn đổi sắc độ cứ đổi ở `globals.css`; ai gán lại nó về `--color-warning-soft` là
 * kéo ô này về nhóm cũ mà không đọc lý do vì sao nó ra khỏi đó.
 */
describe('Ô miễn trừ giữ được hình khối dù nền đã nhạt', () => {
  const body =
    ruleBody(
      readFileSync(join(SRC_DIR, 'ui/navigation/DisclaimerBar.module.css'), 'utf8'),
      'notice',
    ) ?? '';

  it('tìm thấy luật .notice — ca kiểm này không được rỗng mà vẫn xanh', () => {
    expect(body).not.toBe('');
  });

  it('còn viền vàng: đó là thứ duy nhất còn vẽ ra mép ô (FR-24)', () => {
    expect(body).toMatch(/border:\s*1px solid var\(--color-warning-line\)\s*;/);
  });

  it('dùng nền riêng của ô miễn trừ, không phải nền cảnh báo chung', () => {
    expect(body).toMatch(/background:\s*var\(--color-notice-soft\)\s*;/);
  });
});
