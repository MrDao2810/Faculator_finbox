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
    it(`${code} — hiện nguyên nhân và gợi ý sửa, KHÔNG in nhãn mã lỗi`, () => {
      const warning = WF15[code];
      const { container } = render(<ErrorState warning={warning} unit="lần" />);

      // Câu nêu nguyên nhân — dấu hiệu chữ của thẻ, để không phụ thuộc màu (NFR-USA-06).
      expect(screen.getByText(warning.message.vi)).not.toBeNull();

      /*
       * Nhãn mã lỗi ("Không có ý nghĩa"…) BỎ 20/10/2026 — chủ dự án: _"xóa đoạn cảnh báo 'Không có ý
       * nghĩa' đi"_. Ca đảo chiều: nhãn quay lại phải là một quyết định. Mã vẫn đọc được ở
       * `data-ma-loi` cho các ca kiểm khác.
       */
      expect(container.textContent).not.toContain(WARNING_LABELS[code].vi);
      expect(screen.getByRole('alert').getAttribute('data-ma-loi')).toBe(code);

      // Dòng gợi ý sửa (NFR-USA-04). Năm mã phải có; `INCOMPLETE_INPUT` thì không — ca riêng dưới.
      if (code === 'INCOMPLETE_INPUT') return;
      expect(warning.fix, `mã ${code} thiếu gợi ý sửa`).toBeDefined();
      if (warning.fix !== undefined) {
        expect(screen.getByText(warning.fix.vi, { exact: false })).not.toBeNull();
      }
    });
  }

  /*
   * Ca ĐẢO NGƯỢC: chủ dự án bỏ "↳ Nhập nốt các ô còn trống rồi kết quả hiện ngay." (15/10/2026) — câu
   * "Còn thiếu: …" đã nói thiếu ô nào. Câu gợi ý quay lại là một quyết định, không phải sơ suất.
   */
  it('INCOMPLETE_INPUT — chỉ nói thiếu ô nào, không có dòng ↳ gợi ý sửa', () => {
    const warning = WF15.INCOMPLETE_INPUT;
    const { container } = render(<ErrorState warning={warning} unit="lần" />);

    expect(warning.fix).toBeUndefined();
    expect(screen.getByText('Còn thiếu: Giá bán.')).not.toBeNull();
    expect(container.textContent).not.toContain('↳');
    expect(container.textContent).not.toContain('Nhập nốt các ô còn trống');
  });
});

describe('bất biến FR-06 ở lớp hiển thị', () => {
  it('hiện đúng chuỗi “_ _” thay cho con số', () => {
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

  /*
   * Chiều NGƯỢC của một lần bỏ chữ, ghim lại để không ai dựng lại mà không đọc lý do.
   *
   * Nhãn 'cập nhật tức thì' (FR-05) từng nằm cùng hàng với chữ KẾT QUẢ; chủ dự án chốt bỏ
   * 14/09/2026 — cũng là mục #34 của bảng feedback test nội bộ. Điều khoản ấy nay giữ bằng CHỨC
   * NĂNG: ca "đổi ô nhập thì kết quả đổi theo" ở `FormulaDetail.test.tsx` mới là chỗ chứng minh
   * nó, và đó là chỗ đúng — một nhãn dán chỉ nói rằng sản phẩm làm việc đó.
   */
  it('dòng nhãn chỉ còn chữ KẾT QUẢ, không còn nhãn "cập nhật tức thì"', () => {
    const { container } = render(<ResultBlock output={ok(15.21, 'lần')} />);

    expect(container.textContent ?? '').not.toContain('ập nhật tức thì');
    // Và chữ KẾT QUẢ phải đứng một mình trong thẻ của nó — ba ca ở FormulaDetail dò đúng chuỗi ấy.
    expect(screen.getByText('KẾT QUẢ')).not.toBeNull();
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
