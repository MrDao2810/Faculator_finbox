// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { MARKET_CONFIG, scheduleOrDefault } from '@/application';
import type { CalcContext } from '@/application';

import { FeeScheduleField } from './FeeScheduleField';
import { FeeTaxBody } from './FeeTaxBody';
import { LoanScheduleBody } from './LoanScheduleBody';
import { hasConfigBlock, hasCustomBody } from './DetailBody';

afterEach(cleanup);

const CTX: CalcContext = {
  asOf: '2026-08-04',
  schedule: scheduleOrDefault(MARKET_CONFIG),
};

/** Đúng bộ số ví dụ của WF-08. */
const WF08 = { quantity: 1_000, months: 5, buyPrice: 92_000, sellPrice: 97_000 };

/** Đúng bộ số ví dụ của WF-14. */
const WF14 = { amount: 800_000_000, rate: 9.5, years: 20, method: 1 };

describe('hasCustomBody()', () => {
  it('chỉ hai công thức có thân riêng', () => {
    expect(hasCustomBody('loi-nhuan-rong')).toBe(true);
    expect(hasCustomBody('lich-tra-no')).toBe(true);
    expect(hasCustomBody('pe')).toBe(false);
  });
});

describe('hasConfigBlock()', () => {
  it('chỉ WF-08 có khối cấu hình trên ô nhập', () => {
    expect(hasConfigBlock('loi-nhuan-rong')).toBe(true);
    // Lịch trả nợ có thân riêng nhưng KHÔNG có khối cấu hình — hai danh sách phải tách nhau.
    expect(hasConfigBlock('lich-tra-no')).toBe(false);
    expect(hasConfigBlock('pe')).toBe(false);
  });
});

describe('FeeScheduleField — ô chọn biểu phí của WF-08', () => {
  it('dựng lựa chọn từ MarketConfig chứ không viết cứng', () => {
    render(<FeeScheduleField />);
    const select = screen.getByLabelText('Biểu phí') as HTMLSelectElement;

    expect([...select.options].map((o) => o.value)).toEqual(
      MARKET_CONFIG.schedules.map((s) => s.id),
    );
    expect(select.value).toBe(MARKET_CONFIG.defaultScheduleId);
  });

  it('nói rõ hằng số lấy từ đâu — CON-10', () => {
    const { container } = render(<FeeScheduleField />);
    expect(container.textContent).toContain('Market Config');
  });
});

describe('FeeTaxBody — WF-08', () => {
  it('hiện đủ bốn dòng bóc tách kèm công thức trong dòng', () => {
    render(<FeeTaxBody inputs={WF08} ctx={CTX} />);

    expect(screen.getByText('Phí giao dịch mua')).not.toBeNull();
    expect(screen.getByText('Phí giao dịch bán')).not.toBeNull();
    expect(screen.getByText('Thuế CNCK (khi bán)')).not.toBeNull();
    expect(screen.getByText('Phí lưu ký')).not.toBeNull();

    // Công thức phải hiện ngay trong dòng, không giấu đi — WF-08 nêu đích danh.
    expect(screen.getByText('0,15% × 92.000.000 ₫')).not.toBeNull();
    expect(screen.getByText('0,10% × 97.000.000 ₫')).not.toBeNull();
  });

  it('bốn con số chi phí đúng như wireframe dựng sẵn', () => {
    render(<FeeTaxBody inputs={WF08} ctx={CTX} />);

    expect(screen.getByText('138.000 ₫')).not.toBeNull();
    expect(screen.getByText('145.500 ₫')).not.toBeNull();
    expect(screen.getByText('97.000 ₫')).not.toBeNull();
    expect(screen.getByText('1.350 ₫')).not.toBeNull();
    expect(screen.getByText('381.850 ₫')).not.toBeNull();
  });

  it('giá hoà vốn, lãi ròng và ROI ròng khớp wireframe, có dấu + cho số dương', () => {
    render(<FeeTaxBody inputs={WF08} ctx={CTX} />);

    expect(screen.getByText('92.370 ₫')).not.toBeNull();
    expect(screen.getByText('+4.618.150 ₫')).not.toBeNull();
    expect(screen.getByText('+5,01 %')).not.toBeNull();
  });

  it('nói rõ bán dưới giá hoà vốn là lỗ', () => {
    render(<FeeTaxBody inputs={WF08} ctx={CTX} />);
    expect(screen.getByText('bán dưới giá này là lỗ')).not.toBeNull();
  });

  it('thiếu giá bán thì báo đúng ô còn thiếu, TUYỆT ĐỐI không hiện 0 (FR-06)', () => {
    const { container } = render(
      <FeeTaxBody inputs={{ quantity: 1_000, months: 5, buyPrice: 92_000 }} ctx={CTX} />,
    );

    // Dòng phí mua và phí lưu ký vẫn tính được.
    expect(screen.getByText('138.000 ₫')).not.toBeNull();
    expect(screen.getByText('1.350 ₫')).not.toBeNull();

    // Dòng cần giá bán thì hiện “— , —” kèm tên ô còn thiếu.
    expect(screen.getAllByText(/— , —/).length).toBeGreaterThan(0);
    expect(container.textContent).toContain('Giá bán');
    expect(container.textContent).not.toContain('NaN');
  });

  it('bán lỗ thì lãi ròng mang dấu trừ, không mất dấu', () => {
    render(
      <FeeTaxBody
        inputs={{ quantity: 1_000, months: 5, buyPrice: 92_000, sellPrice: 85_000 }}
        ctx={CTX}
      />,
    );

    expect(screen.getByText(/^-7\./)).not.toBeNull();
  });

  it('huy hiệu ROI đổi sắc theo lãi/lỗ, và trung tính khi chưa tính được', () => {
    const roiClassOf = (inputs: Record<string, number>): string => {
      const { container, unmount } = render(<FeeTaxBody inputs={inputs} ctx={CTX} />);
      const badge = container.querySelector('[class*="roi"]');
      const className = badge?.className ?? '';
      unmount();
      return className;
    };

    const base = { quantity: 1_000, months: 5, buyPrice: 92_000 };

    expect(roiClassOf({ ...base, sellPrice: 97_000 })).toMatch(/roiGain/);
    expect(roiClassOf({ ...base, sellPrice: 85_000 })).toMatch(/roiLoss/);

    // Chưa nhập giá bán KHÔNG phải là lỗ — không được tô đỏ một ô còn trống (FR-06).
    const pending = roiClassOf(base);
    expect(pending).toMatch(/roiUnknown/);
    expect(pending).not.toMatch(/roiLoss/);
  });
});

describe('LoanScheduleBody — WF-14', () => {
  it('ba số kết quả khớp ví dụ wireframe', () => {
    render(<LoanScheduleBody inputs={WF14} />);

    expect(screen.getByText('7.457.050 ₫')).not.toBeNull();
    expect(screen.getByText('989,7 triệu ₫')).not.toBeNull();
    expect(screen.getByText('1.789,7 triệu ₫')).not.toBeNull();
  });

  it('bảng rút gọn chứ không đổ hết 240 dòng ra DOM', () => {
    const { container } = render(<LoanScheduleBody inputs={WF14} />);
    const rows = container.querySelectorAll('tbody tr');

    expect(rows.length).toBeLessThan(60);
    expect(rows.length).toBeGreaterThan(20);
  });

  it('NÓI RÕ đã rút gọn bao nhiêu kỳ, không cắt im lặng', () => {
    render(<LoanScheduleBody inputs={WF14} />);

    // Chính dòng ghi chú phải nêu cả số kỳ đang hiện lẫn tổng số kỳ thật.
    const note = screen.getByText(/Bảng đã rút gọn/).closest('p');
    expect(note?.textContent).toMatch(/\d+\/240/);
  });

  it('có đủ kỳ đầu và kỳ cuối', () => {
    const { container } = render(<LoanScheduleBody inputs={WF14} />);
    const periods = [...container.querySelectorAll('tbody tr th')].map((th) => th.textContent);

    expect(periods[0]).toBe('1');
    expect(periods[periods.length - 1]).toBe('240');
  });

  it('gốc đều thì khoản trả kỳ đầu nặng hơn niên kim', () => {
    render(<LoanScheduleBody inputs={{ ...WF14, method: 2 }} />);
    expect(screen.getByText('9.666.667 ₫')).not.toBeNull();
  });

  it('kỳ hạn 0 thì không dựng bảng, và không ném lỗi', () => {
    const { container } = render(<LoanScheduleBody inputs={{ ...WF14, years: 0 }} />);
    expect(container.querySelector('table')).toBeNull();
  });

  it('không lọt NaN ra màn ở mọi bộ số', () => {
    for (const inputs of [WF14, { ...WF14, rate: 0 }, { ...WF14, method: 2 }]) {
      const { container, unmount } = render(<LoanScheduleBody inputs={inputs} />);
      expect(container.textContent).not.toContain('NaN');
      unmount();
    }
  });

  it('hàng "…" đánh dấu chỗ đã bỏ bớt kỳ, và không đội lốt một kỳ thật', () => {
    const { container } = render(<LoanScheduleBody inputs={WF14} />);
    const gaps = container.querySelectorAll('tbody tr td[colspan]');

    expect(gaps.length).toBeGreaterThan(0);
    // Hàng dấu không có ô <th> số kỳ — nếu có thì nó sẽ lọt vào phép đếm kỳ ở test bên trên.
    for (const gap of gaps) {
      expect(gap.closest('tr')?.querySelector('th')).toBeNull();
    }
    // Trình đọc màn hình phải nghe được câu giải thích, không phải ba dấu chấm.
    expect(screen.getAllByText('đã bỏ bớt các kỳ ở giữa').length).toBe(gaps.length);
  });

  it('bảng ngắn không bị rút gọn thì không có hàng "…" nào', () => {
    const { container } = render(<LoanScheduleBody inputs={{ ...WF14, years: 1 }} />);
    expect(container.querySelectorAll('tbody tr td[colspan]')).toHaveLength(0);
  });
});
