// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { FORMULAS, NO_VALUE, WARNING_LABELS, t } from '@/application';
import type { FormulaSpec } from '@/application';
import { DEFAULT_PREFERENCES, PREFERENCES_STORAGE_KEY } from '@/application/preferences';
import { PreferencesProvider } from '@/application/preferences-context';

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

afterEach(() => {
  cleanup();
  // Ca kiểm chế độ Nâng cao gieo tuỳ chọn vào localStorage — dọn để nó không chảy sang ca sau.
  window.localStorage.clear();
});

const AS_OF = '2026-08-04';

function specOf(id: string): FormulaSpec {
  const found = FORMULAS.find((f) => f.id === id);
  if (found === undefined) throw new Error(`Registry thiếu công thức '${id}'.`);
  return found;
}

/**
 * Ô gõ số trong khối **Số liệu**.
 *
 * Phải khoanh vùng từ khi khối Ví dụ thực tế cũng cho gõ số: hai khối bày CÙNG một giá trị nên ô
 * hai bên mang cùng một tên — đúng nghĩa, vì đó là một con số chứ không phải hai. Thứ phân biệt là
 * TÊN VÙNG, y như cách người dùng phân biệt, nên ca kiểm cũng phân biệt bằng đúng thứ đó.
 *
 * Dò theo vai `textbox` chứ không theo `selector: 'input'`: biến kiểu thanh trượt có hai điều khiển
 * cùng tên, và `input` khớp cả cái `range`.
 */
function oNhap(name: RegExp): HTMLElement {
  const khoi = screen.getByRole('region', { name: t('detail.inputs') });
  return within(khoi).getByRole('textbox', { name });
}

/** Ô gõ số trong khối **Ví dụ thực tế**. */
function oViDu(name: RegExp): HTMLElement {
  const khoi = screen.getByRole('region', { name: t('example.title') });
  return within(khoi).getByRole('textbox', { name });
}

/** Bốn nhãn mục của khối Giải thích, đúng thứ tự wireframe (FR-03). */
const NHAN_GIAI_THICH = [
  'explain.meaning',
  'explain.whenToUse',
  'explain.howToRead',
  'explain.commonMistakes',
] as const;

/**
 * Bốn mục của khối Giải thích, dưới dạng thẻ `<details>` để đọc được thuộc tính `open`.
 *
 * Phải lọc theo thẻ: vùng in của `ExportSheet` luôn có mặt trong DOM (chỉ ẩn bằng CSS) và nó dựng
 * cùng bốn nhãn ấy thành `<h2>`, nên một truy vấn theo chữ trần khớp hai phần tử.
 *
 * Dò `open` chứ không dò chữ: nội dung bốn mục nằm trong DOM cả khi gập, nên một ca kiểm bám vào chữ
 * sẽ xanh ngay cả lúc khối gập kín — đúng kiểu đỗ giả.
 */
function mucGiaiThich(): ReadonlyArray<HTMLDetailsElement> {
  return NHAN_GIAI_THICH.map((key) => {
    const summary = screen.getAllByText(t(key)).find((element) => element.tagName === 'SUMMARY');
    const details = summary?.closest('details');
    if (details === null || details === undefined) throw new Error(`Thiếu mục '${key}' trong DOM.`);
    return details;
  });
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

  /*
   * CẢ BỐN mục giải thích phải mở sẵn ngay khi vào màn, ở cả hai chế độ.
   *
   * Đã qua hai bản trung gian: gập hết ở chế độ Nâng cao (FR-09), rồi chỉ mở mục đầu. Cả hai đều bắt
   * người đọc phải bấm mới thấy phần giải thích, mà FR-03 bắt buộc bốn mục ấy có mặt chính là để đọc.
   */
  it('cả bốn mục của phần Giải thích mở sẵn khi vào màn', () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    const items = mucGiaiThich();
    expect(items).toHaveLength(4);
    for (const [index, item] of items.entries()) {
      expect(item.open, `mục thứ ${String(index + 1)}`).toBe(true);
    }
  });

  it('chế độ Nâng cao cũng mở sẵn — không còn gập theo chế độ', async () => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_PREFERENCES, mode: 'advanced' }),
    );

    // `lai-kep` có biến `perYear` khai `level: 'advanced'`, nên sự có mặt của ô đó là dấu hiệu
    // KIỂM CHỨNG ĐƯỢC rằng chế độ Nâng cao đã thật sự vào — không phải một ca đỗ giả vì Provider
    // chưa kịp đọc localStorage.
    render(
      <PreferencesProvider>
        <FormulaDetail spec={specOf('lai-kep')} asOf={AS_OF} />
      </PreferencesProvider>,
    );

    expect(await screen.findByRole('textbox', { name: /Số lần nhập lãi/ })).not.toBeNull();

    expect(mucGiaiThich().every((item) => item.open)).toBe(true);
  });

  it('nói rõ khối còn trống thay vì để trống lặng lẽ', () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    expect(screen.getByText(/tạm hiện công thức dạng chữ/)).not.toBeNull();
  });

  /*
   * Khung chờ "sẽ có ở bản sau" của khối biểu đồ đã bỏ hẳn: nay 97 công thức vẽ thật, 10 công thức
   * `chartType: 'none'` không dựng khối đó chút nào. WACC từng là đại diện của trạng thái chờ vì nó
   * thuộc nhóm Nâng cao — ca này giữ cho câu ấy không quay lại ở bất kỳ công thức nào.
   */
  it('không còn khung chờ ở khối biểu đồ — nhóm nâng cao cũng vẽ thật', async () => {
    render(<FormulaDetail spec={specOf('wacc')} asOf={AS_OF} />);

    expect(await screen.findByRole('figure')).not.toBeNull();
    expect(screen.queryByText(/sẽ có ở bản sau/)).toBeNull();
  });

  it('không lọt sổ sách nội bộ (WBS, nhánh, gói) ra màn người dùng', () => {
    const { container } = render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    // Chữ "WBS" từng nằm ngay trên màn chi tiết VÀ trong file PDF xuất ra (đợt 14 mới gỡ).
    // Ca kiểm này giữ cho nó không quay lại — người dùng không cần biết mã kế hoạch nội bộ.
    expect(container.textContent).not.toMatch(/WBS|nhánh \d|gói \d/);
  });

  it('ô nhập sinh từ VariableSpec, không viết cứng cho công thức nào (FR-05)', () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    expect(oNhap(/Giá thị trường/)).not.toBeNull();
    expect(oNhap(/EPS/)).not.toBeNull();
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

    const price = oNhap(/Giá thị trường/);
    await userEvent.clear(price);
    await userEvent.type(price, '120000');
    await userEvent.tab();

    expect(screen.getByTestId('result-text').textContent).toBe('19,83 lần');
  });

  it('EPS bằng 0 thì ra “— , —” kèm lý do, TUYỆT ĐỐI không ra 0 (FR-06)', async () => {
    const { container } = render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    const eps = oNhap(/EPS/);
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

    const eps = oNhap(/EPS/);
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

describe('WF-03 — lối nạp chuỗi giá cho công thức ăn chuỗi (FR-12)', () => {
  it('đúng 34 công thức có nút dán chuỗi — bằng số công thức CẦN chuỗi, không phải 11 công thức nến', () => {
    const coNut: string[] = [];

    for (const spec of FORMULAS) {
      const { unmount } = render(<FormulaDetail spec={spec} asOf={AS_OF} />);
      if (screen.queryByRole('button', { name: t('detail.pasteSeries') }) !== null) {
        coNut.push(spec.id);
      }
      unmount();
    }

    /*
     * Bug chủ dự án chưa báo nhưng có thật: chỗ này từng đọc `chartType === 'candlestick'`, tức
     * lấy loại BIỂU ĐỒ làm cờ dữ liệu. Nến chỉ là 11 trong 34 — 23 công thức còn lại (phân phối
     * lợi suất, sụt giảm từ đỉnh, hồi quy) gặp lỗi "chưa đủ phiên giá" mà trên màn không có lối
     * nào để nạp. Ngõ cụt thật sự, chỉ là không ai bấm tới.
     */
    expect(coNut).toHaveLength(34);
    expect(coNut.filter((id) => specOf(id).chartType === 'candlestick')).toHaveLength(11);

    /*
     * Hạn 15 giây thay cho mặc định 5 giây.
     *
     * Ca này dựng TRỌN 107 màn chi tiết — chạy riêng mất khoảng 3,3 giây, nhưng khi vitest chạy
     * song song nhiều file thì các worker giành CPU và nó lên hơn 5 giây, tức đỏ vì máy đang bận
     * chứ không vì sản phẩm sai. Nới hạn cho ĐÚNG ca này, không nới toàn cục: mọi ca khác vẫn nên
     * hỏng nếu chậm bất thường.
     */
  }, 15_000);

  it('công thức vô hướng không có nút nào — đừng bày thứ họ không dùng', () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    expect(screen.queryByRole('button', { name: t('detail.pasteSeries') })).toBeNull();
    expect(screen.queryByRole('link', { name: t('detail.openDataTable') })).toBeNull();
  });

  it('nạp bộ mẫu thì công thức chuỗi ra số NGAY, không còn báo thiếu phiên giá', async () => {
    render(<FormulaDetail spec={specOf('ty-so-sharpe')} asOf={AS_OF} />);

    // Mở màn ra là chờ dữ liệu — đúng FR-06, không bịa số.
    expect(screen.getByTestId('result-text').textContent).toContain(NO_VALUE);

    await userEvent.click(screen.getByRole('button', { name: 'Nạp mẫu' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Nạp' })[0] as HTMLElement);

    /*
     * Trước đợt này `applyPreset()` chỉ đặt các ô VÔ HƯỚNG, nên nạp FPT cho một công thức chuỗi
     * vẫn ra "chưa đủ phiên giá": nút "Nạp mẫu" nhìn như không làm gì, đúng 34 công thức. Bộ mẫu
     * có sẵn 248 phiên OHLCV từ đợt 9, chỉ là chưa ai chuyển sang ctx.
     */
    expect(screen.getByTestId('result-text').textContent).not.toContain(NO_VALUE);
    expect(screen.getByText(/Đã nạp số phiên giá/)).not.toBeNull();
  });
});

describe('WF-03 — khối biểu đồ (FR-07, FR-08)', () => {
  it('công thức cơ bản vẽ biểu đồ thật, nạp trễ qua next/dynamic', async () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    // Thân biểu đồ nằm sau ranh giới nạp trễ nên tới sau một nhịp.
    expect(await screen.findByRole('figure')).not.toBeNull();
    expect(screen.getByText('P/E theo Giá thị trường')).not.toBeNull();
  });

  it('đổi ô nhập thì biểu đồ và bảng số đổi theo, khớp con số ở khối Kết quả', async () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);
    const figure = await screen.findByRole('figure');

    const price = oNhap(/Giá thị trường/);
    await userEvent.clear(price);
    await userEvent.type(price, '120000');
    await userEvent.tab();

    expect(screen.getByTestId('result-text').textContent).toBe('19,83 lần');
    /*
     * Cùng con số ấy phải có mặt trong bảng số của biểu đồ — hai chỗ trên cùng một màn không được
     * nói hai số về một phép tính. Khoanh trong `<figure>` vì khối 8 của wireframe cũng là bảng.
     */
    expect(within(figure).getByRole('table').textContent).toContain('19,83');
  });

  it('công thức không có biểu đồ thì không dựng khối nào cả', () => {
    // `chartType: 'none'` — mười công thức như vậy sau đợt rà nhãn.
    const none = FORMULAS.find((f) => f.chartType === 'none');
    if (none === undefined) throw new Error('Registry không còn công thức nào chartType none.');

    render(<FormulaDetail spec={none} asOf={AS_OF} />);

    expect(screen.queryByRole('figure')).toBeNull();
    expect(screen.queryByText('Biểu đồ')).toBeNull();
  });

  /*
   * Luồng thật của công thức chuỗi giá, từ đầu tới cuối trên một màn.
   *
   * SMA thuộc nhóm 34 công thức ăn chuỗi. Mở màn ra nó chưa có gì để vẽ, và chỗ đó phải nói rõ thiếu
   * gì kèm câu chỉ đường chứ không bày khung rỗng; hai cú bấm "Nạp mẫu" sau thì phải ra đường thật
   * theo từng phiên. Trước đợt này nó chỉ có duy nhất câu "sẽ có ở bản sau", bấm gì cũng không đổi.
   */
  it('công thức ăn chuỗi giá: nói rõ thiếu gì, nạp mẫu xong thì vẽ theo từng phiên', async () => {
    render(<FormulaDetail spec={specOf('sma-n-phien')} asOf={AS_OF} />);

    expect(screen.queryByRole('figure')).toBeNull();
    const waiting = await screen.findByRole('status');
    expect(waiting.textContent).toContain('phiên giá');

    await userEvent.click(screen.getByRole('button', { name: 'Nạp mẫu' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Nạp' })[0] as HTMLElement);

    const figure = await screen.findByRole('figure');
    expect(figure.textContent).toContain('theo thời gian');
    // Trục X là ngày thật, và câu mô tả nói rõ đường vẽ theo phiên của mã nào.
    expect(within(figure).getByRole('columnheader', { name: 'Ngày' })).not.toBeNull();
    expect(figure.textContent).toContain('FPT');
  });
});

describe('WF-03 — người dùng gõ được số cụ thể của mã họ đang xem', () => {
  /*
   * Rào đo được trước đợt này: 97 biến kiểu `slider` trên toàn Registry chỉ nhập được bằng cách
   * kéo, và kéo thì bám lưới `step`. 39 trên 78 công thức nhóm Cơ bản có ít nhất một ô như vậy,
   * nên người dùng lấy số thật của một mã đưa vào thì không đưa được: lãi suất 12,37% không kéo
   * tới được khi bước là 0,1%.
   */
  it('gõ được giá trị lệch lưới bước vào ô của thanh trượt, và kết quả tính theo đúng số đó', async () => {
    render(<FormulaDetail spec={specOf('lai-kep')} asOf={AS_OF} />);

    const rate = oNhap(/Lãi suất/);
    await userEvent.clear(rate);
    await userEvent.type(rate, '12,37{Enter}');

    // Ô giữ đúng con số đã gõ, không bị làm tròn về 12,4.
    expect((rate as HTMLInputElement).value).toBe('12,37');
    // Và phép tính chạy theo con số ấy — khác hẳn kết quả của 12,4.
    const at1237 = screen.getByTestId('result-text').textContent;

    await userEvent.clear(rate);
    await userEvent.type(rate, '12,4{Enter}');

    expect(screen.getByTestId('result-text').textContent).not.toBe(at1237);
  });

  it('khoản vay gõ được từng đồng, dù bước thanh trượt là 10 triệu', async () => {
    render(<FormulaDetail spec={specOf('tra-gop-nien-kim')} asOf={AS_OF} />);

    const amount = oNhap(/Số tiền vay/);
    await userEvent.clear(amount);
    await userEvent.type(amount, '1234000000{Enter}');

    expect((amount as HTMLInputElement).value).toBe('1.234.000.000');
  });

  it('miền vẫn là luật — gõ ra ngoài min/max thì kẹp lại', async () => {
    render(<FormulaDetail spec={specOf('lai-kep')} asOf={AS_OF} />);

    const rate = oNhap(/Lãi suất/);
    await userEvent.clear(rate);
    await userEvent.type(rate, '999{Enter}');

    // max của lãi suất lãi kép là 20%.
    expect((rate as HTMLInputElement).value).toBe('20');
  });
});

describe('WF-03 — gõ số ngay tại khối Ví dụ thực tế', () => {
  it('dòng số của ví dụ là ô gõ được, không phải chữ chết', () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    expect((oViDu(/Giá thị trường/) as HTMLInputElement).readOnly).toBe(false);
    expect((oViDu(/EPS/) as HTMLInputElement).readOnly).toBe(false);
  });

  /*
   * Đây là ca then chốt của cả khối, và là câu trả lời cho lo ngại "hai bộ ô thì có ngày nói hai
   * kết quả": ô ở khối Ví dụ KHÔNG giữ state riêng, nó ghi thẳng vào state của màn. Nên gõ ở dưới
   * thì ô ở trên đổi theo, và ngược lại — chúng không phải hai bản sao mà LÀ một con số.
   */
  it('gõ ở khối Ví dụ thì ô ở khối Số liệu đổi theo, và kết quả tính lại', async () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    const duoi = oViDu(/Giá thị trường/);
    await userEvent.clear(duoi);
    await userEvent.type(duoi, '120000{Enter}');

    expect((oNhap(/Giá thị trường/) as HTMLInputElement).value).toBe('120.000');
    expect(screen.getByTestId('result-text').textContent).toBe('19,83 lần');
  });

  it('gõ ở khối Số liệu thì ô ở khối Ví dụ cũng đổi — hai chiều', async () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    const tren = oNhap(/EPS/);
    await userEvent.clear(tren);
    await userEvent.type(tren, '7000{Enter}');

    expect((oViDu(/EPS/) as HTMLInputElement).value).toBe('7.000');
  });

  it('biểu đồ vẽ lại theo số vừa gõ ở khối Ví dụ', async () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);
    const figure = await screen.findByRole('figure');

    const duoi = oViDu(/Giá thị trường/);
    await userEvent.clear(duoi);
    await userEvent.type(duoi, '120000{Enter}');

    expect(within(figure).getByRole('table').textContent).toContain('19,83');
  });

  it('lệch khỏi ví dụ thì nói ra con số gốc kèm nút quay về, bấm là trở lại trọn bộ', async () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);

    // Đang đúng bộ của ví dụ thì chưa cần bày nút nào.
    expect(screen.queryByRole('button', { name: 'Về số của ví dụ' })).toBeNull();

    const duoi = oViDu(/Giá thị trường/);
    await userEvent.clear(duoi);
    await userEvent.type(duoi, '50000{Enter}');

    expect(screen.getByText(/Ví dụ gốc cho:/)).not.toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Về số của ví dụ' }));

    expect((oNhap(/Giá thị trường/) as HTMLInputElement).value).toBe('92.000');
    expect(screen.getByTestId('result-text').textContent).toBe('15,21 lần');
  });
});

describe('WF-03 — nạp mã rồi thì biểu đồ vẽ theo số liệu của mã', () => {
  /*
   * Luồng người dùng thật, đầu tới cuối: mở P/E, bấm Nạp mẫu, chọn FPT. Trước đợt này biểu đồ vẫn
   * là đường giả định ±50% quanh giá vừa nạp; giờ nó chuyển sang 248 phiên thật của FPT, tức thứ
   * người vừa bấm "nạp FPT" đang chờ được thấy.
   */
  it('bấm Nạp mẫu thì trục X tự chuyển sang thời gian, câu mô tả nói rõ mã', async () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);
    await screen.findByRole('figure');

    expect(screen.getByText('P/E theo Giá thị trường')).not.toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Nạp mẫu' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Nạp' })[0] as HTMLElement);

    const figure = await screen.findByRole('figure');
    expect(screen.getByText('P/E theo thời gian')).not.toBeNull();
    expect(figure.textContent).toContain('P/E của FPT qua 248 phiên');
    expect(within(figure).getByRole('columnheader', { name: 'Ngày' })).not.toBeNull();
  });

  it('nạp mã xong vẫn đổi lại về đường giả định được (FR-10 — không khoá gì cả)', async () => {
    render(<FormulaDetail spec={specOf('pe')} asOf={AS_OF} />);
    await screen.findByRole('figure');

    await userEvent.click(screen.getByRole('button', { name: 'Nạp mẫu' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Nạp' })[0] as HTMLElement);
    await userEvent.selectOptions(screen.getByLabelText('Xem kết quả đổi theo'), 'eps');

    expect(screen.getByText('P/E theo EPS')).not.toBeNull();
  });

  /*
   * Ca hồi quy của lỗi vốn hoá: `presetInputs()` phải điền cả số cổ phiếu, theo đúng đơn vị triệu
   * CP. Bảng ánh xạ cũ bỏ sót khoá `shares`, nên nạp FPT ra "giá FPT × 118 triệu CP mặc định" —
   * sai hơn 12 lần mà trên màn không có gì nói là đã sai. Đọc qua ô nhập chứ không qua kết quả:
   * đây là kiểm việc NẠP, không kiểm phép tính.
   */
  it('nạp mã điền cả số cổ phiếu, không để nguyên giá trị mặc định', async () => {
    render(<FormulaDetail spec={specOf('von-hoa-thi-truong')} asOf={AS_OF} />);

    const shares = oNhap(/Số cổ phiếu lưu hành/);
    expect((shares as HTMLInputElement).value).toBe('118');

    await userEvent.click(screen.getByRole('button', { name: 'Nạp mẫu' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Nạp' })[0] as HTMLElement);

    expect((oNhap(/Số cổ phiếu lưu hành/) as HTMLInputElement).value).toBe('1.470');
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
