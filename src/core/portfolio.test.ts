import { describe, expect, it } from 'vitest';

import { summarisePortfolio, valueHoldings } from './portfolio';
import type { Holding } from './portfolio';

const PRICES = new Map([
  ['FPT', 100_000],
  ['HPG', 30_000],
]);

function holding(patch: Partial<Holding> = {}): Holding {
  return {
    code: 'FPT',
    quantity: 500,
    costPrice: 78_000,
    buyDate: '2025-01-02',
    beta: 1.1,
    ...patch,
  };
}

describe('valueHoldings', () => {
  it('định giá theo thị giá và tính tỷ trọng cộng lại đúng 100%', () => {
    const rows = valueHoldings(
      [holding({ code: 'FPT', quantity: 500 }), holding({ code: 'HPG', quantity: 1_000 })],
      PRICES,
    );

    expect(rows[0]?.value).toBe(50_000_000);
    expect(rows[1]?.value).toBe(30_000_000);

    const sum = rows.reduce((total, row) => total + (row.weight ?? 0), 0);
    expect(sum).toBeCloseTo(100, 6);
  });

  it('mã không tra được giá thì để null, KHÔNG rơi về giá vốn', () => {
    const rows = valueHoldings([holding({ code: 'MNG' })], PRICES);
    expect(rows[0]?.marketPrice).toBeNull();
    expect(rows[0]?.value).toBeNull();
    expect(rows[0]?.weight).toBeNull();
  });

  it('số lượng bằng 0 hoặc âm không tạo ra giá trị', () => {
    expect(valueHoldings([holding({ quantity: 0 })], PRICES)[0]?.value).toBeNull();
    expect(valueHoldings([holding({ quantity: -5 })], PRICES)[0]?.value).toBeNull();
  });

  it('danh mục rỗng không ném lỗi', () => {
    expect(valueHoldings([], PRICES)).toEqual([]);
  });
});

describe('summarisePortfolio — bốn con số của WF-06', () => {
  const asOf = '2026-01-02';

  it('danh mục rỗng: nói rõ chưa có mã nào, KHÔNG hiện 0 ₫ (FR-06)', () => {
    const summary = summarisePortfolio([], PRICES, asOf);

    expect(summary.totalValue.value).toBeNull();
    expect(summary.totalValue.warning?.code).toBe('INCOMPLETE_INPUT');
    expect(summary.count.value).toBe(0);
  });

  it('tổng giá trị cộng đúng theo thị giá', () => {
    const summary = summarisePortfolio(
      [holding({ code: 'FPT', quantity: 500 }), holding({ code: 'HPG', quantity: 1_000 })],
      PRICES,
      asOf,
    );

    expect(summary.totalValue.value).toBe(80_000_000);
    expect(summary.count.value).toBe(2);
  });

  it('thiếu thị giá một mã thì tổng báo thiếu và nêu đích danh mã đó', () => {
    const summary = summarisePortfolio([holding(), holding({ code: 'MNG' })], PRICES, asOf);

    expect(summary.totalValue.value).toBeNull();
    expect(summary.totalValue.warning?.code).toBe('MISSING_SERIES');
    expect(summary.totalValue.warning?.message.vi).toContain('MNG');
  });

  /*
   * Hai ca dưới đây tách "nguồn không có mã này" khỏi "không hỏi được nguồn". Cùng ra kết quả
   * thiếu giá, nhưng lời khuyên phải ngược nhau — khuyên bỏ mã khỏi danh mục lúc chỉ rớt mạng
   * là xui người dùng xoá dữ liệu thật của họ vì một sự cố tạm thời.
   */
  it('không lấy được giá vì mạng: khuyên thử lại, KHÔNG khuyên bỏ mã', () => {
    const summary = summarisePortfolio([holding()], new Map(), asOf, 'failed');

    expect(summary.totalValue.value).toBeNull();
    expect(summary.totalValue.warning?.code).toBe('MISSING_SERIES');
    expect(summary.totalValue.warning?.fix?.vi).toContain('Thử lại');
    expect(summary.totalValue.warning?.fix?.vi).not.toContain('bỏ mã');
  });

  it('nguồn không có mã: vẫn nêu đích danh mã và cho phép bỏ mã', () => {
    const summary = summarisePortfolio([holding({ code: 'MNG' })], PRICES, asOf, 'ready');

    expect(summary.totalValue.warning?.message.vi).toContain('MNG');
    expect(summary.totalValue.warning?.fix?.vi).toContain('bỏ mã');
  });

  it('lỗi mạng vẫn KHÔNG được để bất kỳ ô nào rơi về 0 (FR-06)', () => {
    const summary = summarisePortfolio([holding({ beta: 1 })], new Map(), asOf, 'failed');

    expect(summary.totalValue.value).toBeNull();
    expect(summary.beta.value).toBeNull();
    expect(summary.xirr.value).toBeNull();
    // Số mã thì vẫn đếm được — nó không phụ thuộc thị giá.
    expect(summary.count.value).toBe(1);
  });

  it('beta danh mục là bình quân gia quyền theo giá trị, không phải trung bình cộng', () => {
    // FPT 50 tr₫ beta 1,0 · HPG 30 tr₫ beta 1,5 → (50×1,0 + 30×1,5) / 80 = 1,1875
    const summary = summarisePortfolio(
      [
        holding({ code: 'FPT', quantity: 500, beta: 1 }),
        holding({ code: 'HPG', quantity: 1_000, beta: 1.5 }),
      ],
      PRICES,
      asOf,
    );

    expect(summary.beta.value).toBeCloseTo(1.1875, 6);
    // Trung bình cộng sẽ là 1,25 — con số đó là sai, và test này chặn đúng nhầm lẫn ấy.
    expect(summary.beta.value).not.toBeCloseTo(1.25, 3);
  });

  it('thiếu beta một mã thì beta danh mục báo thiếu, không coi mã đó bằng 1', () => {
    const summary = summarisePortfolio(
      [holding({ code: 'FPT', beta: 1 }), holding({ code: 'HPG', beta: null })],
      PRICES,
      asOf,
    );

    expect(summary.beta.value).toBeNull();
    expect(summary.beta.warning?.code).toBe('MISSING_SERIES');
    expect(summary.beta.warning?.message.vi).toContain('HPG');
  });

  it('beta kế thừa lỗi khi tổng giá trị lỗi (FR-15)', () => {
    const summary = summarisePortfolio([holding({ code: 'MNG', beta: 1 })], PRICES, asOf);
    expect(summary.beta.warning?.code).toBe('INHERITED');
  });

  it('XIRR dương khi danh mục lãi, và khớp mức lãi tính tay', () => {
    // Mua 500 CP giá vốn 78.000 ₫ ngày 2025-01-02 = 39 tr₫; một năm sau trị giá 50 tr₫.
    // Lợi suất năm ≈ 50/39 − 1 = 28,2 %.
    const summary = summarisePortfolio([holding({ buyDate: '2025-01-02' })], PRICES, '2026-01-02');

    expect(summary.xirr.value).not.toBeNull();
    expect(summary.xirr.value ?? 0).toBeCloseTo(28.2, 0);
    expect(summary.xirr.unit).toBe('%/năm');
  });

  it('ngày mua sai định dạng thì nói rõ mã nào, không tính bừa', () => {
    const summary = summarisePortfolio([holding({ buyDate: '02/01/2025' })], PRICES, asOf);

    expect(summary.xirr.value).toBeNull();
    expect(summary.xirr.warning?.code).toBe('INCOMPLETE_INPUT');
    expect(summary.xirr.warning?.message.vi).toContain('FPT');
  });

  it('ngày định giá sai thì báo thiếu chứ không tự lấy ngày hệ thống (NFR-REL-03)', () => {
    const summary = summarisePortfolio([holding()], PRICES, 'hom-nay');
    expect(summary.xirr.value).toBeNull();
    expect(summary.xirr.warning?.code).toBe('INCOMPLETE_INPUT');
  });

  /*
   * Ca này ban đầu tôi đoán sai: tưởng XIRR sẽ không có nghiệm. Thật ra dòng tiền chỉ đảo
   * chiều nên phương trình vẫn giải được và trả về −22 %/năm — một con số đọc như khoản lỗ
   * trong khi nguyên nhân thật là gõ nhầm năm. Vì thế mới thêm luật chặn ở `summarisePortfolio`.
   */
  it('mua sau ngày định giá bị chặn, không trả ra con số trông có lý', () => {
    const summary = summarisePortfolio([holding({ buyDate: '2027-01-02' })], PRICES, asOf);

    expect(summary.xirr.value).toBeNull();
    expect(summary.xirr.warning?.code).toBe('MODEL_VIOLATION');
    expect(summary.xirr.warning?.message.vi).toContain('FPT');
  });

  it('không bao giờ để lọt NaN hay Infinity ra ngoài (FR-06)', () => {
    const summary = summarisePortfolio(
      [
        holding({ quantity: Number.NaN }),
        holding({ code: 'HPG', costPrice: Number.POSITIVE_INFINITY }),
      ],
      PRICES,
      asOf,
    );

    for (const output of [
      summary.totalValue,
      summary.totalCost,
      summary.gain,
      summary.gainPercent,
      summary.beta,
      summary.xirr,
      summary.count,
    ]) {
      expect(output.value === null || Number.isFinite(output.value)).toBe(true);
    }
  });
});

describe('vốn đã bỏ ra và lãi/lỗ chưa thực hiện', () => {
  const asOf = '2026-01-02';

  it('cộng đúng vốn, hiệu ra lãi, và phần trăm khớp tay', () => {
    // 500 CP × 78.000 ₫ = 39.000.000 ₫ vốn; thị giá 100.000 ₫ → 50.000.000 ₫.
    const summary = summarisePortfolio([holding()], PRICES, asOf);

    expect(summary.totalCost.value).toBe(39_000_000);
    expect(summary.gain.value).toBe(11_000_000);
    expect(summary.gainPercent.value).toBeCloseTo((11 / 39) * 100, 6);
  });

  it('lỗ ra số âm chứ không bị kẹp về 0', () => {
    const summary = summarisePortfolio([holding({ costPrice: 120_000 })], PRICES, asOf);

    expect(summary.gain.value).toBe(-10_000_000);
    expect(summary.gainPercent.value).toBeLessThan(0);
  });

  /*
   * Ca này chặn một cái bẫy cụ thể. `total` trong `summarisePortfolio()` cộng bằng
   * `row.value ?? 0`, tức coi mã thiếu giá như bằng 0 ₫. Đem `total` trừ thẳng tổng vốn thì mã
   * ấy đóng góp một khoản "lỗ" bịa đúng bằng số tiền đã bỏ ra — con số sai mà trông rất có lý,
   * đúng loại FR-06 muốn chặn. Lãi/lỗ phải THỪA HƯỞNG lỗi thay vì tự tính lấy.
   */
  it('một mã thiếu giá thì lãi/lỗ báo thừa hưởng, KHÔNG bịa ra khoản lỗ bằng vốn', () => {
    const summary = summarisePortfolio([holding(), holding({ code: 'MNG' })], PRICES, asOf);

    expect(summary.totalValue.value).toBeNull();
    expect(summary.gain.value).toBeNull();
    expect(summary.gain.warning?.code).toBe('INHERITED');
    expect(summary.gainPercent.value).toBeNull();
  });

  /*
   * Vốn KHÔNG phụ thuộc thị giá — đó là điểm khiến nó đáng có mặt trên màn: mất mạng thì đây là
   * con số thật duy nhất còn lại, và nó giữ cho khối đầu màn không trắng trơn.
   */
  it('mất mạng vẫn cộng được vốn, vì vốn không cần thị giá', () => {
    const summary = summarisePortfolio([holding()], new Map(), asOf, 'failed');

    expect(summary.totalValue.value).toBeNull();
    expect(summary.totalCost.value).toBe(39_000_000);
  });

  it('vốn hỏng thì lãi/lỗ thừa hưởng từ phía vốn, và nói đúng phía nào hỏng', () => {
    const summary = summarisePortfolio([holding({ costPrice: Number.NaN })], PRICES, asOf);

    expect(summary.totalCost.value).toBeNull();
    expect(summary.gain.warning?.code).toBe('INHERITED');
    expect(summary.gain.warning?.message.vi).toContain('vốn');
  });

  it('danh mục rỗng: cả ba ô mới đều nói lý do, không ô nào ra 0', () => {
    const summary = summarisePortfolio([], PRICES, asOf);

    for (const output of [summary.totalCost, summary.gain, summary.gainPercent]) {
      expect(output.value).toBeNull();
      expect(output.warning?.code).toBe('INCOMPLETE_INPUT');
    }
  });
});

describe('ba trạng thái của bảng thị giá', () => {
  const asOf = '2026-01-02';

  it("'ready': thiếu giá là do nguồn không có mã, nên khuyên kiểm tra lại mã", () => {
    const summary = summarisePortfolio([holding({ code: 'MNG' })], PRICES, asOf, 'ready');

    expect(summary.totalValue.warning?.fix?.vi).toContain('bỏ mã khỏi danh mục');
  });

  /*
   * `'stale'` đi chung nhánh với `'failed'`: cả hai đều là "không hỏi được nguồn". Lời khuyên
   * phải là thử lại, KHÔNG được là "bỏ mã khỏi danh mục" — xui người dùng xoá dữ liệu thật của
   * họ vì một sự cố tạm thời là hỏng nặng hơn nhiều so với việc thiếu một con số.
   */
  it("'stale' và 'failed' đều khuyên thử lại, không khuyên bỏ mã", () => {
    for (const state of ['stale', 'failed'] as const) {
      const summary = summarisePortfolio([holding({ code: 'MNG' })], PRICES, asOf, state);

      expect(summary.totalValue.warning?.fix?.vi).toContain('Thử lại');
      expect(summary.totalValue.warning?.fix?.vi).not.toContain('bỏ mã khỏi danh mục');
    }
  });

  it("'stale' mà mọi mã đều có giá thì tổng vẫn ra số — giá cũ vẫn là giá thật", () => {
    const summary = summarisePortfolio([holding()], PRICES, asOf, 'stale');

    expect(summary.totalValue.value).toBe(50_000_000);
    expect(summary.gain.value).toBe(11_000_000);
  });
});
