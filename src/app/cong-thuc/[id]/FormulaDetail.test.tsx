// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { FORMULAS, NO_VALUE, WARNING_LABELS, t } from '@/application';
import type { FormulaSpec } from '@/application';

import { FormulaDetail } from './FormulaDetail';

/** jsdom chưa cài đặt <dialog>.showModal(); ba bottom sheet cần hai hàm này để mở ra được. */
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

afterEach(cleanup);

const AS_OF = '2026-08-04';

function specOf(id: string): FormulaSpec {
  const found = FORMULAS.find((f) => f.id === id);
  if (found === undefined) throw new Error(`Registry thiếu công thức '${id}'.`);
  return found;
}

describe('WF-03 — chín khối đúng thứ tự wireframe', () => {
  it('dựng đủ các khối bắt buộc của FR-02, FR-03 và FR-04', () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    expect(screen.getByRole('heading', { level: 1 })).not.toBeNull();
    expect(screen.getByText('Ý nghĩa')).not.toBeNull();
    expect(screen.getByText('Công thức')).not.toBeNull();
    expect(screen.getByText('Số liệu')).not.toBeNull();
    expect(screen.getByText('Giải thích cho người mới')).not.toBeNull();
    expect(screen.getByText('Nguồn tham khảo')).not.toBeNull();
  });

  it('nói rõ hai khối còn trống thay vì để trống lặng lẽ', () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    expect(screen.getByText(/tạm hiện công thức dạng chữ/)).not.toBeNull();
    expect(screen.getByText(/Biểu đồ cho công thức này sẽ có ở bản sau/)).not.toBeNull();
  });

  it('không lọt sổ sách nội bộ (WBS, nhánh, gói) ra màn người dùng', () => {
    const { container } = render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    // Chữ "WBS" từng nằm ngay trên màn chi tiết VÀ trong file PDF xuất ra (đợt 14 mới gỡ).
    // Ca kiểm này giữ cho nó không quay lại — người dùng không cần biết mã kế hoạch nội bộ.
    expect(container.textContent).not.toMatch(/WBS|nhánh \d|gói \d/);
  });

  it('ô nhập sinh từ VariableSpec, không viết cứng cho công thức nào (FR-05)', () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    expect(screen.getByLabelText(/Giá thị trường/)).not.toBeNull();
    expect(screen.getByLabelText(/EPS/)).not.toBeNull();
  });

  it('miễn trừ nằm NGAY ĐẦU MÀN chứ không đợi cuộn hết trang (FR-24 · UI-04)', () => {
    const { container } = render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    const notice = container.querySelector('[role="note"]');
    if (notice === null) throw new Error('Màn chi tiết thiếu dải miễn trừ.');
    expect(notice.textContent).toContain('không phải khuyến nghị đầu tư');

    // Phải đứng trước tiêu đề công thức — cuối màn thì không tính là "cùng tầm mắt với con số".
    const heading = screen.getByRole('heading', { level: 1 });
    const position = notice.compareDocumentPosition(heading);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('WF-03 — lưới ô nhập', () => {
  it('ô số xếp hai cột, thanh trượt chiếm trọn hàng', () => {
    // P/E toàn ô số; lịch trả nợ có ba thanh trượt và một nhóm nút.
    const narrow = render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);
    const narrowFields = [...narrow.container.querySelectorAll('[class*="fields"] > div')];

    expect(narrowFields.length).toBeGreaterThan(0);
    expect(narrowFields.every((el) => !el.className.includes('fieldWide'))).toBe(true);
    cleanup();

    const wide = render(<FormulaDetail spec={specOf('lich-tra-no')} asOf={AS_OF} />);
    const wideFields = [...wide.container.querySelectorAll('[class*="fields"] > div')];

    expect(wideFields.length).toBeGreaterThan(0);
    expect(wideFields.every((el) => el.className.includes('fieldWide'))).toBe(true);
  });
});

describe('WF-08 — khối chọn biểu phí đặt trên ô nhập', () => {
  it('công thức lãi ròng có ô chọn biểu phí; công thức khác thì không', () => {
    render(<FormulaDetail spec={specOf('loi-nhuan-rong')} asOf={AS_OF} />);
    expect(screen.getByLabelText('Biểu phí')).not.toBeNull();
    cleanup();

    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);
    expect(screen.queryByLabelText('Biểu phí')).toBeNull();
  });
});

describe('WF-03 — không hiện cùng một con số hai lần', () => {
  it('lãi ròng chỉ hiện ở thẻ riêng, không kèm khối kết quả chung', () => {
    render(<FormulaDetail spec={specOf('loi-nhuan-rong')} asOf={AS_OF} />);

    expect(screen.queryByText('KẾT QUẢ')).toBeNull();
    // Con số vẫn phải còn — bỏ khối chung chứ không bỏ kết quả.
    expect(screen.getByText('+4.618.150 ₫')).not.toBeNull();
  });

  it('lịch trả nợ GIỮ khối chung vì tổng lãi khác khoản trả hằng tháng', () => {
    render(<FormulaDetail spec={specOf('lich-tra-no')} asOf={AS_OF} />);

    expect(screen.getByText('KẾT QUẢ')).not.toBeNull();
    expect(screen.getByText('989.691.880,64')).not.toBeNull();
    expect(screen.getByText('7.457.050 ₫')).not.toBeNull();
  });

  it('công thức thường vẫn có khối kết quả chung', () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);
    expect(screen.getByText('KẾT QUẢ')).not.toBeNull();
  });

  /*
   * Đường lỗi của WF-08 sau khi bỏ khối kết quả chung được kiểm ở screens.test.tsx — chỗ đó
   * truyền thẳng bộ đầu vào thiếu `sellPrice` vào FeeTaxBody, tức đúng component giờ đang gánh
   * toàn bộ trách nhiệm hiện lỗi. Ở tầng màn thì không dựng lại được ca ấy: xoá ô nhập không
   * đưa giá trị về rỗng mà giữ số hợp lệ cuối cùng.
   */
});

describe('WF-03 — kết quả cập nhật tức thì', () => {
  it('P/E hiện đúng 15,21 lần với ví dụ của wireframe', () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);
    expect(screen.getByTestId('result-text').textContent).toBe('15,21 lần');
  });

  it('đổi ô nhập thì kết quả đổi theo', async () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    const price = screen.getByLabelText(/Giá thị trường/);
    await userEvent.clear(price);
    await userEvent.type(price, '120000');
    await userEvent.tab();

    expect(screen.getByTestId('result-text').textContent).toBe('19,83 lần');
  });

  it('EPS bằng 0 thì ra “— , —” kèm lý do, TUYỆT ĐỐI không ra 0 (FR-06)', async () => {
    const { container } = render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    const eps = screen.getByLabelText(/EPS/);
    await userEvent.clear(eps);
    await userEvent.type(eps, '0');
    await userEvent.tab();

    expect(screen.getByTestId('result-text').textContent).toContain('— , —');
    expect(container.textContent).toContain('EPS bằng 0');
    expect(container.textContent).not.toContain('NaN');
    expect(container.textContent).not.toContain('Infinity');
  });

  it('EPS âm thì báo không có ý nghĩa và gợi ý chuyển sang P/B (WF-15)', async () => {
    const { container } = render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    const eps = screen.getByLabelText(/EPS/);
    await userEvent.clear(eps);
    await userEvent.type(eps, '-1200');
    await userEvent.tab();

    expect(screen.getByTestId('result-text').textContent).toContain('— , —');
    expect(container.textContent).toContain('P/B');
  });
});

describe('WF-03 — nối ba bottom sheet của gói 2.5', () => {
  it('bấm Nạp mẫu thì mở sheet chọn mã', async () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    await userEvent.click(screen.getByRole('button', { name: 'Nạp mẫu' }));

    expect(screen.getByText('FPT')).not.toBeNull();
    expect(screen.getByLabelText('Tìm mã cổ phiếu')).not.toBeNull();
  });

  it('nạp preset thì giá trị chảy về ô nhập và kết quả tính lại (FR-10)', async () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    const before = screen.getByTestId('result-text').textContent;

    await userEvent.click(screen.getByRole('button', { name: 'Nạp mẫu' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Nạp' })[0] as HTMLElement);

    expect(screen.getByTestId('result-text').textContent).not.toBe(before);
    // Nút đổi nhãn để người dùng biết đang xem số liệu của mã nào.
    expect(screen.getByRole('button', { name: /Đã nạp FPT/ })).not.toBeNull();
  });

  it('bấm Xuất thì mở sheet xuất file, và miễn trừ không tắt được (FR-24)', async () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    await userEvent.click(screen.getByRole('button', { name: '↓ Xuất' }));

    expect(screen.getByText(/Miễn trừ tự động đính kèm/)).not.toBeNull();
    expect(screen.getByText(/Không thể tắt/)).not.toBeNull();
  });
});

describe('WF-03 — đường ra khỏi màn chi tiết', () => {
  /*
   * Lỗ hổng chủ dự án báo: vào một công thức rồi thì không có lối quay về danh sách để chọn
   * cái khác. Ca này chốt lại cho mọi công thức, không riêng một cái.
   */
  it('mọi công thức đều có link quay về danh sách', () => {
    for (const spec of FORMULAS) {
      const { unmount } = render(<FormulaDetail spec={spec} asOf={AS_OF} />);

      const back = screen.getByRole('link', { name: t('nav.backToList') });
      expect(back.getAttribute('href'), spec.id).toMatch(/^\/cong-thuc\/?(\?|$)/);

      unmount();
    }
  });

  it('đường ra là link thật, không phải nút — chạy được cả khi JavaScript chưa tải xong', () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    expect(screen.getByRole('link', { name: t('nav.backToList') }).tagName).toBe('A');
  });
});

describe('WF-03 — không công thức nào lọt giá trị vô nghĩa ra màn', () => {
  it('mọi công thức đều dựng được và không hiện NaN hay Infinity', () => {
    for (const spec of FORMULAS) {
      const { container, unmount } = render(<FormulaDetail spec={spec} asOf={AS_OF} />);

      expect(container.textContent, spec.id).not.toContain('NaN');
      expect(container.textContent, spec.id).not.toContain('Infinity');
      expect(container.textContent, spec.id).not.toContain('undefined');
      unmount();
    }
  });

  /*
   * Bất biến thật, viết lại khi Registry đủ 107 công thức.
   *
   * Bản trước đòi MỌI công thức ra được một con số với giá trị mặc định. Điều đó đúng khi cả 73
   * công thức đầu chỉ ăn biến vô hướng, nhưng 34 công thức chuỗi giá thì KHÔNG thể ra số khi
   * người dùng chưa nạp chuỗi — và ép chúng ra số nghĩa là bịa, đúng thứ FR-06 cấm.
   *
   * Nên bất biến đúng không phải "luôn ra số" mà là "không bao giờ là ngõ cụt": hoặc ra số,
   * hoặc nói rõ thiếu gì kèm một câu chỉ đường (NFR-USA-04).
   */
  it('không công thức nào là ngõ cụt: hoặc ra số, hoặc nói rõ thiếu gì và chỉ cách khắc phục', () => {
    for (const spec of FORMULAS) {
      const { unmount } = render(<FormulaDetail spec={spec} asOf={AS_OF} />);
      const shown = screen.getByTestId('result-text').textContent ?? '';

      if (!shown.includes(NO_VALUE)) {
        unmount();
        continue;
      }

      const alert = screen.getByRole('alert');
      const text = alert.textContent ?? '';

      /*
       * Lý do HỢP LỆ duy nhất để không ra số với giá trị mặc định là chưa có chuỗi giá.
       * Mọi mã khác — chia cho 0, không có ý nghĩa… — nghĩa là chính bộ giá trị mặc định của
       * công thức tự mâu thuẫn, và đó là lỗi thật chứ không phải trạng thái chờ người dùng.
       */
      expect(text, `${spec.id}: mã cảnh báo`).toContain(WARNING_LABELS.MISSING_SERIES);
      // Phải có câu chỉ đường, không được chỉ báo lỗi rồi bỏ mặc.
      expect(text, `${spec.id}: thiếu câu chỉ cách khắc phục`).toContain(t('result.fixPrefix'));

      unmount();
    }
  });

  it('đúng những công thức ăn chuỗi giá mới phải chờ dữ liệu, số còn lại ra số ngay', () => {
    const chờDữLiệu: string[] = [];

    for (const spec of FORMULAS) {
      const { unmount } = render(<FormulaDetail spec={spec} asOf={AS_OF} />);
      if ((screen.getByTestId('result-text').textContent ?? '').includes(NO_VALUE)) {
        chờDữLiệu.push(spec.id);
      }
      unmount();
    }

    // Hai nhóm chuỗi giá là `risk` và `technical`; `risk` còn một công thức vô hướng (cỡ lệnh).
    for (const id of chờDữLiệu) {
      const spec = specOf(id);
      expect(['risk', 'technical'], `${id} phải ra số ngay mà lại chờ dữ liệu`).toContain(
        spec.categoryId,
      );
    }

    // Và phải có ĐÚNG 34 công thức như vậy — thêm bớt là có người vừa đổi hợp đồng dữ liệu.
    expect(chờDữLiệu.length).toBe(34);
  });
});
