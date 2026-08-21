// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  NO_VALUE,
  WARNING_CODES,
  WARNING_LABELS,
  divideByZero,
  fail,
  incompleteInput,
  inheritedFrom,
  meaningless,
  missingSeries,
  modelViolation,
  ok,
} from '@/application';
import type { CalcWarning, WarningCode } from '@/application';

import { ErrorState } from './ErrorState';
import { ResultBlock } from './ResultBlock';

afterEach(cleanup);

/** Sáu loại lỗi chuẩn của WF-15, dựng đúng bằng catalog tầng Domain. */
const WF15: Readonly<Record<WarningCode, CalcWarning>> = {
  DIVIDE_BY_ZERO: divideByZero({ vi: 'P/E', en: 'P/E' }, { vi: 'EPS', en: 'EPS' }),
  MEANINGLESS: meaningless(
    {
      vi: 'P/E không có ý nghĩa khi doanh nghiệp đang lỗ.',
      en: 'P/E is not meaningful when the company is losing money.',
    },
    { vi: 'Gợi ý chuyển sang P/B', en: 'Suggest switching to P/B' },
  ),
  MISSING_SERIES: missingSeries(60, 24),
  MODEL_VIOLATION: modelViolation(
    { vi: 'g ≥ WACC', en: 'g ≥ WACC' },
    { vi: 'Giảm g xuống dưới 12,1%', en: 'Lower g below 12.1%' },
  ),
  INHERITED: inheritedFrom({ vi: 'Beta', en: 'Beta' }, { vi: 'WACC', en: 'WACC' }),
  INCOMPLETE_INPUT: incompleteInput([{ vi: 'Giá bán', en: 'Sale price' }]),
};

describe('sáu loại lỗi của WF-15', () => {
  for (const code of WARNING_CODES) {
    it(`${code} — hiện nguyên nhân, gợi ý sửa và nhãn mã lỗi`, () => {
      const warning = WF15[code];
      render(<ErrorState warning={warning} unit="lần" />);

      // Câu nêu nguyên nhân.
      expect(screen.getByText(warning.message.vi)).not.toBeNull();

      // Nhãn ngắn — dấu hiệu chữ, để không phụ thuộc màu (NFR-USA-06).
      expect(screen.getByText(WARNING_LABELS[code].vi)).not.toBeNull();

      // Dòng gợi ý sửa (NFR-USA-04). Cả sáu mã của WF-15 đều phải có.
      expect(warning.fix, `mã ${code} thiếu gợi ý sửa`).toBeDefined();
      if (warning.fix !== undefined) {
        expect(screen.getByText(warning.fix.vi, { exact: false })).not.toBeNull();
      }
    });
  }
});

describe('bất biến FR-06 ở lớp hiển thị', () => {
  it('hiện đúng chuỗi “— , —” thay cho con số', () => {
    render(<ErrorState warning={WF15.DIVIDE_BY_ZERO} unit="lần" />);
    expect(screen.getByText(NO_VALUE)).not.toBeNull();
  });

  it('không màn lỗi nào lọt NaN, Infinity, hay số 0 thay cho lỗi', () => {
    for (const code of WARNING_CODES) {
      cleanup();
      const { container } = render(<ErrorState warning={WF15[code]} unit="lần" />);
      const text = container.textContent ?? '';

      expect(text, `mã ${code}`).not.toContain('NaN');
      expect(text, `mã ${code}`).not.toContain('Infinity');
      expect(text, `mã ${code}`).not.toContain('undefined');
      expect(text, `mã ${code}`).not.toContain('null');
    }
  });

  it('báo cho trình đọc màn hình bằng role="alert"', () => {
    render(<ErrorState warning={WF15.DIVIDE_BY_ZERO} />);
    expect(screen.getByRole('alert')).not.toBeNull();
  });

  it('vẫn hiện đơn vị để người dùng biết đang đọc đại lượng gì', () => {
    render(<ErrorState warning={WF15.DIVIDE_BY_ZERO} unit="lần" />);
    expect(screen.getByText('lần')).not.toBeNull();
  });
});

describe('ResultBlock giao việc báo lỗi cho ErrorState', () => {
  it('tính được thì hiện số lớn kèm đơn vị', () => {
    render(<ResultBlock output={ok(15.21, 'lần')} />);
    expect(screen.getByText('15,21')).not.toBeNull();
  });

  it('không tính được thì tự chuyển sang khuôn lỗi WF-15, màn không phải tự kiểm', () => {
    render(<ResultBlock output={fail('lần', WF15.DIVIDE_BY_ZERO)} />);

    expect(screen.getByRole('alert')).not.toBeNull();
    expect(screen.getByText(NO_VALUE)).not.toBeNull();
    expect(screen.getByText(WF15.DIVIDE_BY_ZERO.message.vi)).not.toBeNull();
  });

  it('ok() chặn Infinity nên khối kết quả cũng không thể hiện Infinity', () => {
    const { container } = render(<ResultBlock output={ok(1 / 0, 'lần')} />);
    expect(container.textContent ?? '').not.toContain('Infinity');
    expect(screen.getByText(NO_VALUE)).not.toBeNull();
  });

  it('CalcOutput dựng tay thiếu warning cũng không làm vỡ màn', () => {
    const { container } = render(<ResultBlock output={{ value: null, unit: 'lần' }} />);
    expect(container.textContent ?? '').not.toContain('undefined');
    expect(screen.getByRole('alert')).not.toBeNull();
  });

  it('hiện câu diễn giải kết quả — khối 4 của WF-03', () => {
    render(
      <ResultBlock
        output={ok(15.2, 'lần')}
        interpretation="Cao hơn trung bình ngành (12,4) — thị trường đang kỳ vọng tăng trưởng."
      />,
    );
    expect(screen.getByText(/Cao hơn trung bình ngành/)).not.toBeNull();
  });
});
