// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FORMULAS,
  FORMULA_USAGE_KEY,
  NO_VALUE,
  SAMPLE_DATA,
  ACTIVE_TICKER_KEY,
  SAVED_CALCS_KEY,
  WARNING_LABELS,
  formatIsoDate,
  parseFormulaUsage,
  parseActiveTicker,
  parseSavedCalcs,
  t,
} from '@/application';
import type { FormulaSpec } from '@/application';
import { DEFAULT_PREFERENCES, PREFERENCES_STORAGE_KEY } from '@/application/preferences';
import { PreferencesProvider } from '@/application/preferences-context';
/*
 * Import sâu, cố ý: `@/ui/charts` (barrel) chỉ export `FormulaChart`/`hasChart` để giữ renderer
 * ngoài chunk chung (xem docblock ở đó) — `CHART_GEOMETRY` không có trong barrel. Test không đóng
 * gói cho trình duyệt và không đi qua luật ESLint chặn `@/core/*` từ `src/app`, nên import sâu ở
 * đây an toàn, chỉ để lấy đúng hằng số hình học đã dùng để giả `getBoundingClientRect()`.
 */
import { CHART_GEOMETRY } from '@/ui/charts/LineChart';

import { FormulaDetail } from './FormulaDetail';
import { latexToMathml } from './latex-html';

/**
 * Cổng số liệu thị trường thay bằng bản giả — chỉ đường `?ma=` dùng tới nó.
 *
 * `vi.hoisted` là bắt buộc vì `vi.mock` bị kéo lên đầu file. Thay `@/data` chứ không thay
 * `@/application`: barrel của Application chỉ re-export lại từ đây, và `SAMPLE_DATA` cùng mọi
 * thứ khác vẫn là bản thật nhờ `importOriginal`.
 */
const feed = vi.hoisted(() => ({ listTickers: vi.fn(), snapshots: vi.fn() }));

vi.mock('@/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data')>();
  return { ...actual, MARKET_FEED: feed };
});

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
  // Mã dính theo lượt duyệt sống ở sessionStorage; không dọn thì mã của ca trước tự nạp vào ca sau.
  window.sessionStorage.clear();
  // Ca kiểm `?ma=` đổi URL; trả lại đường trơn để ca sau không vô tình nạp một mã.
  window.history.replaceState({}, '', '/');
  feed.listTickers.mockReset();
  feed.snapshots.mockReset();
});

const AS_OF = '2026-08-04';

function specOf(id: string): FormulaSpec {
  const found = FORMULAS.find((f) => f.id === id);
  if (found === undefined) throw new Error(`Registry thiếu công thức '${id}'.`);
  return found;
}

/**
 * Màn chi tiết như `page.tsx` dựng nó.
 *
 * Dựng ký hiệu toán bằng **chính hàm `page.tsx` gọi**, không phải một chuỗi giả: nếu ca kiểm nhận
 * `latexHtml="<math/>"` viết tay thì nó chứng minh được đúng một thứ là component in ra cái nó
 * được đưa — còn việc 111 chuỗi `latex` có dựng nổi hay không thì không ai kiểm. Đi qua hàm thật
 * thì mọi ca dùng `Man` đều là một lượt kiểm KaTeX kèm theo, miễn phí.
 */
function Man({ spec }: { spec: FormulaSpec }) {
  return <FormulaDetail spec={spec} asOf={AS_OF} latexHtml={latexToMathml(spec.latex)} />;
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
 * Lọc theo thẻ chứ không lấy phần tử đầu tiên: vùng in của `ExportSheet` dựng cùng bốn nhãn ấy
 * thành `<h2>`, nên một truy vấn theo chữ trần khớp hai phần tử ngay khi sheet đã mở. (Từ đợt vá
 * hiệu năng, sheet chỉ được dựng từ lần mở đầu tiên — nhưng chỗ lọc này vẫn phải giữ: nó là thứ
 * nói rằng ta đang dò đúng thẻ `<summary>` của khối gập, không phải một tiêu đề trùng chữ.)
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
    render(<Man spec={specOf('pe')} />);

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
    render(<Man spec={specOf('pe')} />);

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
        <Man spec={specOf('lai-kep')} />
      </PreferencesProvider>,
    );

    expect(await screen.findByRole('textbox', { name: /Số lần nhập lãi/ })).not.toBeNull();

    expect(mucGiaiThich().every((item) => item.open)).toBe(true);
  });

  /*
   * Trạng thái chờ CUỐI CÙNG của màn này đã đóng: khối Công thức từng in câu "bản ký hiệu toán học
   * đang hoàn thiện" trong khi gói 2.4.3 hoãn. Nay nó dựng MathML thật.
   *
   * Ca kiểm bám vào `<math>` chứ không bám vào chuỗi ký hiệu: nội dung bên trong là chuyện của
   * KaTeX, thứ dự án cam kết là khối Công thức có ký hiệu toán chứ không chỉ có một dòng chữ.
   */
  it('khối Công thức dựng ký hiệu toán thật, không còn câu chờ', () => {
    const { container } = render(<Man spec={specOf('pe')} />);

    expect(container.querySelector('math')).not.toBeNull();
    expect(screen.queryByText(/đang hoàn thiện|tạm hiện công thức dạng chữ/)).toBeNull();
  });

  /*
   * Bản dạng chữ phải CÒN bên cạnh ký hiệu, không bị nó thay thế: nó nói cùng công thức bằng tên
   * đầy đủ tiếng Việt, thứ mà ký hiệu viết tắt không nói — và là lối đọc còn lại nếu trình duyệt
   * quá cũ không dựng được MathML.
   */
  it('giữ cả bản dạng chữ bên cạnh ký hiệu toán', () => {
    render(<Man spec={specOf('roe')} />);

    const expr = specOf('roe').expression;
    expect(expr).toBeDefined();
    expect(screen.getByText(expr?.vi ?? '')).not.toBeNull();
  });

  /*
   * Khung chờ "sẽ có ở bản sau" của khối biểu đồ đã bỏ hẳn: nay 97 công thức vẽ thật, 10 công thức
   * `chartType: 'none'` không dựng khối đó chút nào. WACC từng là đại diện của trạng thái chờ vì nó
   * thuộc nhóm Nâng cao — ca này giữ cho câu ấy không quay lại ở bất kỳ công thức nào.
   */
  it('không còn khung chờ ở khối biểu đồ — nhóm nâng cao cũng vẽ thật', async () => {
    render(<Man spec={specOf('wacc')} />);

    expect(await screen.findByRole('figure')).not.toBeNull();
    expect(screen.queryByText(/sẽ có ở bản sau/)).toBeNull();
  });

  it('không lọt sổ sách nội bộ (WBS, nhánh, gói) ra màn người dùng', () => {
    const { container } = render(<Man spec={specOf('pe')} />);

    // Chữ "WBS" từng nằm ngay trên màn chi tiết VÀ trong file PDF xuất ra (đợt 14 mới gỡ).
    // Ca kiểm này giữ cho nó không quay lại — người dùng không cần biết mã kế hoạch nội bộ.
    expect(container.textContent).not.toMatch(/WBS|nhánh \d|gói \d/);
  });

  it('ô nhập sinh từ VariableSpec, không viết cứng cho công thức nào (FR-05)', () => {
    render(<Man spec={specOf('pe')} />);

    expect(oNhap(/Giá thị trường/)).not.toBeNull();
    expect(oNhap(/EPS/)).not.toBeNull();
  });

  it('miễn trừ nằm NGAY ĐẦU MÀN chứ không đợi cuộn hết trang (FR-24 · UI-04)', () => {
    const { container } = render(<Man spec={specOf('pe')} />);

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
    const narrow = render(<Man spec={specOf('pe')} />);
    const narrowFields = [...narrow.container.querySelectorAll('[class*="fields"] > div')];

    expect(narrowFields.length).toBeGreaterThan(0);
    expect(narrowFields.every((el) => !el.className.includes('fieldWide'))).toBe(true);
    cleanup();

    const wide = render(<Man spec={specOf('lich-tra-no')} />);
    const wideFields = [...wide.container.querySelectorAll('[class*="fields"] > div')];

    expect(wideFields.length).toBeGreaterThan(0);
    expect(wideFields.every((el) => el.className.includes('fieldWide'))).toBe(true);
  });
});

describe('WF-08 — khối chọn biểu phí đặt trên ô nhập', () => {
  it('công thức lãi ròng có ô chọn biểu phí; công thức khác thì không', () => {
    render(<Man spec={specOf('loi-nhuan-rong')} />);
    expect(screen.getByLabelText('Biểu phí')).not.toBeNull();
    cleanup();

    render(<Man spec={specOf('pe')} />);
    expect(screen.queryByLabelText('Biểu phí')).toBeNull();
  });
});

describe('WF-03 — không hiện cùng một con số hai lần', () => {
  it('lãi ròng chỉ hiện ở thẻ riêng, không kèm khối kết quả chung', () => {
    render(<Man spec={specOf('loi-nhuan-rong')} />);

    expect(screen.queryByText('KẾT QUẢ')).toBeNull();
    // Con số vẫn phải còn — bỏ khối chung chứ không bỏ kết quả.
    expect(screen.getByText('+4.618.150 ₫')).not.toBeNull();
  });

  it('lịch trả nợ GIỮ khối chung vì tổng lãi khác khoản trả hằng tháng', () => {
    render(<Man spec={specOf('lich-tra-no')} />);

    expect(screen.getByText('KẾT QUẢ')).not.toBeNull();
    expect(screen.getByText('989.691.880,64')).not.toBeNull();
    expect(screen.getByText('7.457.050 ₫')).not.toBeNull();
  });

  it('công thức thường vẫn có khối kết quả chung', () => {
    render(<Man spec={specOf('pe')} />);
    expect(screen.getByText('KẾT QUẢ')).not.toBeNull();
  });

  /*
   * Đường lỗi của WF-08 sau khi bỏ khối kết quả chung được kiểm ở screens.test.tsx — chỗ đó
   * truyền thẳng bộ đầu vào thiếu `sellPrice` vào FeeTaxBody, tức đúng component giờ đang gánh
   * toàn bộ trách nhiệm hiện lỗi. Ở tầng màn thì không dựng lại được ca ấy: xoá ô nhập không
   * đưa giá trị về rỗng mà giữ số hợp lệ cuối cùng.
   */
});

describe('WF-03 — lưới ô nhập: điều kiện cần để hàng thẳng được', () => {
  /*
   * Hai ô cùng hàng thẳng nhau nhờ `subgrid`, mà `subgrid` chỉ với tới con TRỰC TIẾP của lưới —
   * nên nhãn / khung nhập / dòng phụ phải là con của chính ô lưới, không được nằm sau một lớp
   * <div> bọc. Trước đợt này màn chi tiết có lớp bọc ấy và hai khung nhập của `pe` lệch nhau 20px
   * ở khổ 360px khi nhãn một bên xuống hai dòng.
   *
   * jsdom không dựng bố cục nên không đo được độ lệch — ca đó nằm ở `npm run check:chrome`. Ở đây
   * chỉ giữ ĐIỀU KIỆN CẦN, và nó là thứ dễ vô tình phá nhất khi ai đó bọc thêm một div.
   */
  it('ô lưới chính là điều khiển, không có lớp div bọc ở giữa', () => {
    render(<Man spec={specOf('pe')} />);

    const khoi = screen.getByRole('region', { name: t('detail.inputs') });
    const luoi = khoi.querySelector('[class*="fields"]');
    expect(luoi).not.toBeNull();

    const oLuoi = [...(luoi?.children ?? [])];
    expect(oLuoi.length).toBe(2);

    for (const o of oLuoi) {
      // Nhãn và ô nhập phải là CON TRỰC TIẾP của ô lưới.
      const conTrucTiep = [...o.children];
      expect(
        conTrucTiep.some((c) => c.tagName === 'LABEL'),
        `ô "${o.querySelector('label')?.textContent ?? '?'}" không có <label> làm con trực tiếp`,
      ).toBe(true);
    }
  });

  it('mọi ô hẹp đều span đủ số hàng — nếu không hàng dưới sẽ chèn vào giữa', () => {
    // Cùng lý do: một ô quên `grid-row: span` sẽ phá thế thẳng hàng của cả lưới. Giữ bằng cách
    // khoá tên class, vì giá trị span nằm ở CSS mà jsdom không đọc.
    render(<Man spec={specOf('pe')} />);

    const khoi = screen.getByRole('region', { name: t('detail.inputs') });
    const luoi = khoi.querySelector('[class*="fields"]');

    for (const o of [...(luoi?.children ?? [])]) {
      expect(String(o.className)).toMatch(/field/);
    }
  });
});

describe('WF-03 — hằng số thuế & phí phải hiện ra, không được ẩn sau kết quả', () => {
  /*
   * Lỗ hổng gói này vá: trước đây `phi-giao-dich-mua` cho ra 138.000 ₫ từ 1.000 CP × 92.000 ₫ mà
   * mức 0,15% KHÔNG xuất hiện ở bất kỳ đâu trên trang — không ở bảng biến (nó không phải ô nhập),
   * không ở khối Nguồn (chỗ đó dành cho `spec.source`), và `example.note` của công thức này thì
   * trống. Người dùng thấy con số phí mà không có cách nào biết nó tính theo tỷ lệ nào, trong khi
   * đó lại đúng là thứ khác nhau giữa các công ty chứng khoán.
   */
  it('phí giao dịch mua nói rõ đang tính theo 0,15%, kèm ngày hiệu lực và căn cứ', () => {
    render(<Man spec={specOf('phi-giao-dich-mua')} />);

    // Khoanh vùng Số liệu, không dò cả trang: khối Nguồn cũng trích đúng thông tư ấy, nên một
    // truy vấn trần khớp hai chỗ — mà chỗ phải đúng là chỗ đứng cạnh ô nhập.
    const khoi = screen.getByRole('region', { name: t('detail.inputs') });

    expect(within(khoi).getByText('0,15 %')).not.toBeNull();
    expect(within(khoi).getByText(/01\/01\/2022/)).not.toBeNull();
    expect(within(khoi).getByText(/Thông tư 102\/2021\/TT-BTC/)).not.toBeNull();
    // Con số kết quả vẫn nguyên — khối mới thêm thông tin chứ không thay chỗ của gì cả.
    // getAllByText vì con số này hiện ở hai chỗ: khối Kết quả và khối Ví dụ. (Trước đợt vá hiệu
    // năng còn chỗ thứ ba là vùng in của ExportSheet, hồi nó luôn nằm sẵn trong DOM.)
    expect(screen.getAllByText('138.000 ₫').length).toBeGreaterThan(0);
  });

  it('công thức tra nhiều mức thì bày đủ — giá hoà vốn ăn cả bốn', () => {
    render(<Man spec={specOf('gia-hoa-von')} />);

    // Đúng 4, không phải "ít nhất 4": bảng biến cũng dựng dt nhưng nằm ở khối khác, nên một con
    // số dôi ra ở đây nghĩa là khối bị dựng hai lần hoặc lọt hằng số của công thức khác.
    const khoi = screen.getByRole('region', { name: t('detail.inputs') });
    expect(within(khoi).getAllByRole('term')).toHaveLength(4);
  });

  it('công thức không tra hằng số nào thì không mọc thêm khối — P/E phải sạch', () => {
    render(<Man spec={specOf('pe')} />);
    expect(screen.queryByText(t('detail.constantsInUse'))).toBeNull();
  });

  it('hệ số nhân VN30F hiện bằng trị số thật, không phải chữ "hệ số nhân" suông', () => {
    render(<Man spec={specOf('lai-lo-vi-the-long')} />);
    expect(screen.getByText('100.000 ₫/điểm')).not.toBeNull();
  });
});

describe('WF-03 — kết quả cập nhật tức thì', () => {
  it('P/E hiện đúng 15,21 lần với ví dụ của wireframe', () => {
    render(<Man spec={specOf('pe')} />);
    expect(screen.getByTestId('result-text').textContent).toBe('15,21 lần');
  });

  it('đổi ô nhập thì kết quả đổi theo', async () => {
    render(<Man spec={specOf('pe')} />);

    const price = oNhap(/Giá thị trường/);
    await userEvent.clear(price);
    await userEvent.type(price, '120000');
    await userEvent.tab();

    expect(screen.getByTestId('result-text').textContent).toBe('19,83 lần');
  });

  /*
   * Kết quả đổi NGAY TRONG LÚC GÕ, không đợi rời ô.
   *
   * Ca ngay trên có `userEvent.tab()` ở cuối nên nó không phân biệt được hai chuyện: cập nhật theo
   * từng phím, hay chỉ cập nhật một lần lúc chốt. Bản đầu là vế thứ hai, và người dùng báo đúng
   * triệu chứng đó — gõ xong mà khối Kết quả vẫn đứng im, trông như màn bị treo.
   *
   * Ca này KHÔNG rời ô, và đó là toàn bộ điểm của nó.
   */
  it('kết quả đổi theo từng phím gõ, chưa cần rời ô', async () => {
    render(<Man spec={specOf('pe')} />);

    const price = oNhap(/Giá thị trường/);
    await userEvent.clear(price);
    await userEvent.type(price, '120000');

    // Con trỏ vẫn nằm trong ô.
    expect(price).toBe(document.activeElement);
    expect(screen.getByTestId('result-text').textContent).toBe('19,83 lần');
  });

  it('EPS bằng 0 thì ra “— , —” kèm lý do, TUYỆT ĐỐI không ra 0 (FR-06)', async () => {
    const { container } = render(<Man spec={specOf('pe')} />);

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
    const { container } = render(<Man spec={specOf('pe')} />);

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
    render(<Man spec={specOf('pe')} />);

    await userEvent.click(screen.getByRole('button', { name: 'Nạp mẫu' }));

    expect(screen.getByText('FPT')).not.toBeNull();
    expect(screen.getByLabelText('Tìm mã cổ phiếu')).not.toBeNull();
  });

  /*
   * ── `?ma=` — lối đi từ tab Danh mục sang màn này ────────────────────────────────────────────
   *
   * Bốn ca dưới đây khoá đúng bốn điều đáng hỏng: nạp được, không nạp bừa, hỏng thì nói, và
   * KHÔNG gọi mạng ở 111 trang mở theo đường thường.
   */
  it('mở kèm ?ma=FPT thì tự nạp số liệu thật của mã vào ô nhập', async () => {
    feed.snapshots.mockResolvedValue(
      new Map([
        [
          'FPT',
          {
            code: 'FPT',
            name: 'FPT Corp',
            priceVnd: 71_400,
            floor: 'HOSE',
            industry: 'Phần mềm & DV máy tính',
            fundamentals: {
              eps: 5867,
              bookValuePerShare: 23246,
              sharesOutstanding: 1714326422,
              dividendPerShare: 2000,
              netIncome: 9999.4,
              equity: 39851.2,
              period: 'BCTC Q2/2026',
            },
          },
        ],
      ]),
    );
    window.history.replaceState({}, '', '/cong-thuc/pe/?ma=FPT');

    render(<Man spec={specOf('pe')} />);

    // Nút đổi nhãn y như khi bấm "Nạp mẫu" — cùng một đường `applyPreset()`.
    await screen.findByRole('button', { name: /Đã nạp FPT/ });
    // Chờ xong rồi mới soi lời gọi: phần gọi mạng nằm sau `await import()` nên nó KHÔNG xảy ra
    // ngay trong lượt render đầu.
    expect(feed.snapshots.mock.calls[0]?.[0]).toEqual(['FPT']);
    /*
     * Và dòng nguồn phải hiện, dù FPT-của-API không đi qua bộ mẫu WF-10 — đây chính là ca mà
     * phép tra `SAMPLE_DATA.byCode()` cũ làm hỏng, vì mã lấy lúc chạy không nằm trong bộ mẫu.
     *
     * Dò bằng một mẩu chữ đặc trưng chứ không bọc cả câu vào `new RegExp`: câu đầy đủ có dấu
     * ngoặc đơn, mà trong biểu thức chính quy thì đó là dấu gom nhóm chứ không phải chữ.
     */
    expect(screen.getByText(/lấy thật từ Finbox_v2/)).not.toBeNull();
  });

  it('không gọi mạng khi mở trang theo đường thường', () => {
    render(<Man spec={specOf('pe')} />);

    expect(feed.snapshots).not.toHaveBeenCalled();
  });

  it('tham số ?ma= gõ bậy thì bỏ qua, không đem đi gọi mạng', () => {
    window.history.replaceState({}, '', '/cong-thuc/pe/?ma=<script>');

    render(<Man spec={specOf('pe')} />);

    expect(feed.snapshots).not.toHaveBeenCalled();
  });

  it('lấy số liệu hỏng thì nói rõ và chỉ đường khác, không im lặng', async () => {
    feed.snapshots.mockRejectedValue(new Error('mất mạng'));
    window.history.replaceState({}, '', '/cong-thuc/pe/?ma=FPT');

    render(<Man spec={specOf('pe')} />);

    await screen.findByText(/không lấy được số liệu của mã/);
    // Vẫn còn lối đi khác: bộ mẫu WF-10 không cần mạng.
    expect(screen.getByRole('button', { name: 'Nạp mẫu' })).not.toBeNull();
  });

  it('nạp preset thì giá trị chảy về ô nhập và kết quả tính lại (FR-10)', async () => {
    render(<Man spec={specOf('pe')} />);

    const before = screen.getByTestId('result-text').textContent;

    await userEvent.click(screen.getByRole('button', { name: 'Nạp mẫu' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Nạp' })[0] as HTMLElement);

    expect(screen.getByTestId('result-text').textContent).not.toBe(before);
    // Nút đổi nhãn để người dùng biết đang xem số liệu của mã nào.
    expect(screen.getByRole('button', { name: /Đã nạp FPT/ })).not.toBeNull();
  });

  /*
   * Chủ dự án hỏi "ví dụ thực tế lấy từ API Finbox đúng không, cho biết bắt đầu từ đâu, như thế
   * nào" — hoá ra câu hỏi đó chỉ đúng với "Nạp mẫu" (Ví dụ thực tế/"Xem ví dụ minh hoạ" đều là số
   * tĩnh viết tay, không đụng API). Ca này chốt đúng chỗ CÓ số thật: sau khi nạp mẫu, màn phải nói
   * rõ tên nguồn (Finbox_v2) và ngày đối chiếu — không được để người dùng tự đoán.
   */
  it('nạp mẫu thì hiện dòng nói rõ nguồn số liệu cơ bản (Finbox_v2) và ngày đối chiếu', async () => {
    render(<Man spec={specOf('pe')} />);

    // Chưa nạp gì thì chưa có gì để nói về nguồn — đừng bày trước khi có sự thật để bày.
    // Chuỗi khoá có dấu ngoặc — dò bằng so khớp con chuỗi (exact: false), không bọc RegExp: bọc
    // RegExp thì dấu ngoặc trong chuỗi bị hiểu thành cú pháp nhóm, khớp sai hẳn ý.
    expect(screen.queryByText(t('detail.fundamentalsSource'), { exact: false })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Nạp mẫu' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Nạp' })[0] as HTMLElement);

    const fpt = SAMPLE_DATA.byCode('FPT');
    if (fpt?.fundamentalsAsOf === undefined) {
      throw new Error('Bộ mẫu WF-10 thiếu fundamentalsAsOf cho FPT.');
    }

    const note = screen.getByText(t('detail.fundamentalsSource'), { exact: false });
    expect(note.textContent).toContain('Finbox_v2');
    expect(note.textContent).toContain(formatIsoDate(fpt.fundamentalsAsOf.slice(0, 10)));
  });

  it('bấm Xuất thì mở sheet xuất file, và miễn trừ không tắt được (FR-24)', async () => {
    render(<Man spec={specOf('pe')} />);

    await userEvent.click(screen.getByRole('button', { name: '↓ Xuất' }));

    expect(screen.getByText(/Miễn trừ tự động đính kèm/)).not.toBeNull();
    expect(screen.getByText(/Không thể tắt/)).not.toBeNull();
  });
});

/*
 * Ba bottom sheet từng luôn nằm trong DOM, chỉ đóng bằng thuộc tính `open` của `<dialog>`. Cái giá
 * đo được: mỗi lượt vào màn chi tiết dựng thừa ~150 nút, và riêng `ExportSheet` gọi
 * `buildExportContent()` ở MỖI lượt dựng — tức mỗi phím gõ — để dựng một tài liệu chưa ai mở.
 */
describe('WF-03 — bottom sheet chỉ dựng khi người dùng mở', () => {
  it('chưa bấm nút nào thì cả ba sheet đều vắng mặt', () => {
    const { container } = render(<Man spec={specOf('pe')} />);

    // Vùng in của ExportSheet đi theo sheet, nên nó cũng chưa có mặt.
    expect(container.querySelector('.print-region')).toBeNull();
    expect(screen.queryByText(/Miễn trừ tự động đính kèm/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Nạp' })).toBeNull();
  });

  it('mở rồi đóng thì sheet vẫn còn trong DOM — không mất lựa chọn bên trong', async () => {
    const { container } = render(<Man spec={specOf('pe')} />);

    await userEvent.click(screen.getByRole('button', { name: '↓ Xuất' }));
    expect(container.querySelector('.print-region')).not.toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(container.querySelector('.print-region')).not.toBeNull();
  });
});

/*
 * jsdom không dựng bố cục nên không kiểm được `content-visibility` có tác dụng thật hay không —
 * phần đó nằm ở `scripts/chrome-check.mjs`. Ở đây chỉ giữ điều kiện CẦN: lớp phải còn nguyên trên
 * đúng những khối được phép hoãn, và tuyệt đối KHÔNG lan sang khối Số liệu (chỗ người dùng thao
 * tác) hay ra ngoài các khối có phần tử cần thoát khỏi hộp cha.
 */
describe('WF-03 — khối dưới nếp gấp mang lớp hoãn dựng hình', () => {
  it('năm khối cuối màn có lớp, khối Số liệu thì không', () => {
    const { container } = render(<Man spec={specOf('pe')} />);

    const hoan = [...container.querySelectorAll('[class*="deferred"]')];
    // Giải thích · Bảng biến · Ví dụ thực tế · Nguồn tham khảo · Biểu đồ.
    expect(hoan).toHaveLength(5);

    const soLieu = screen.getByRole('region', { name: t('detail.inputs') });
    expect(String(soLieu.className)).not.toMatch(/deferred/);
  });
});

describe('WF-03 — lối nạp chuỗi giá cho công thức ăn chuỗi (FR-12)', () => {
  it('đúng 35 công thức có nút dán chuỗi — bằng số công thức CẦN chuỗi, không phải 11 công thức nến', () => {
    const coNut: string[] = [];

    for (const spec of FORMULAS) {
      const { unmount } = render(<Man spec={spec} />);
      if (screen.queryByRole('button', { name: t('detail.pasteSeries') }) !== null) {
        coNut.push(spec.id);
      }
      unmount();
    }

    /*
     * Bug chủ dự án chưa báo nhưng có thật: chỗ này từng đọc `chartType === 'candlestick'`, tức
     * lấy loại BIỂU ĐỒ làm cờ dữ liệu. Nến chỉ là 11 trong 35 — 24 công thức còn lại (phân phối
     * lợi suất, sụt giảm từ đỉnh, hồi quy) gặp lỗi "chưa đủ phiên giá" mà trên màn không có lối
     * nào để nạp. Ngõ cụt thật sự, chỉ là không ai bấm tới.
     */
    expect(coNut).toHaveLength(35);
    expect(coNut.filter((id) => specOf(id).chartType === 'candlestick')).toHaveLength(11);

    /*
     * Hạn 15 giây thay cho mặc định 5 giây.
     *
     * Ca này dựng TRỌN 111 màn chi tiết — chạy riêng mất khoảng 3,3 giây, nhưng khi vitest chạy
     * song song nhiều file thì các worker giành CPU và nó lên hơn 5 giây, tức đỏ vì máy đang bận
     * chứ không vì sản phẩm sai. Nới hạn cho ĐÚNG ca này, không nới toàn cục: mọi ca khác vẫn nên
     * hỏng nếu chậm bất thường.
     */
  }, 15_000);

  it('công thức vô hướng không có nút nào — đừng bày thứ họ không dùng', () => {
    render(<Man spec={specOf('pe')} />);

    expect(screen.queryByRole('button', { name: t('detail.pasteSeries') })).toBeNull();
    expect(screen.queryByRole('link', { name: t('detail.openDataTable') })).toBeNull();
  });

  it('nạp bộ mẫu thì công thức chuỗi ra số NGAY, không còn báo thiếu phiên giá', async () => {
    render(<Man spec={specOf('ty-so-sharpe')} />);

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

  /*
   * Lối thứ ba cho người chưa hiểu bộ mẫu 4 công ty (PRNG bịa) VÀ không có chuỗi giá thật nào
   * của riêng mình để dán — xem docblock `loadIllustrativeExample()`. Khác "Nạp mẫu": không đòi
   * người dùng biết bộ mẫu là gì, chỉ cần bấm một nút là công thức chạy ra đúng con số minh hoạ.
   */
  it('nút "Xem ví dụ minh hoạ" nạp thẳng chuỗi có sẵn trong spec.example, ra số NGAY', async () => {
    render(<Man spec={specOf('ty-so-sharpe')} />);

    expect(screen.getByTestId('result-text').textContent).toContain(NO_VALUE);
    expect(screen.queryByRole('button', { name: t('detail.exampleLoaded') })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: t('detail.loadExample') }));

    expect(screen.getByTestId('result-text').textContent).not.toContain(NO_VALUE);
    // Nhãn nút đổi để người dùng biết mình vừa nạp gì, và ghi chú nói rõ đây KHÔNG phải số thật.
    expect(screen.getByRole('button', { name: t('detail.exampleLoaded') })).not.toBeNull();
    expect(screen.getByText(t('detail.exampleSeriesNote'))).not.toBeNull();
    // Đây không phải một bộ mẫu công ty — nút "Nạp mẫu" ở đầu trang vẫn phải đứng nguyên nhãn cũ.
    expect(screen.getByRole('button', { name: t('detail.loadPreset') })).not.toBeNull();
    // Và KHÔNG được nói đây là số thật từ Finbox_v2 — chuỗi minh hoạ không đụng API nào cả.
    expect(screen.queryByText(t('detail.fundamentalsSource'), { exact: false })).toBeNull();
  });

  /*
   * Ca hồi quy riêng cho Beta: công thức này đọc CẢ HAI chuỗi (cổ phiếu VÀ VN-Index) cùng lúc,
   * còn 34 công thức chuỗi khác chỉ đọc một. Nếu `loadIllustrativeExample()` chỉ nạp vế cổ phiếu
   * (`example.series`) mà bỏ quên `example.marketSeries`, hồi quy vẫn chạy nhưng lấy vế thị
   * trường từ `VN_INDEX_CLOSES` (PRNG bịa cố định của màn) — beta ra một số KHÁC 1,5, sai âm thầm
   * mà ca kiểm coi "không còn NO_VALUE" ở test bên trên không bắt được. Ca này bắt đúng lỗi đó.
   */
  it('với Beta, nút minh hoạ đổi CẢ chuỗi cổ phiếu lẫn chuỗi VN-Index — ra đúng 1,5 lần của ví dụ', async () => {
    render(<Man spec={specOf('beta')} />);

    expect(screen.getByTestId('result-text').textContent).toContain(NO_VALUE);

    await userEvent.click(screen.getByRole('button', { name: t('detail.loadExample') }));

    const shown = screen.getByTestId('result-text').textContent ?? '';
    expect(shown).not.toContain(NO_VALUE);
    const parsed = Number(shown.replace(' lần', '').replace(',', '.'));
    expect(parsed).toBeCloseTo(1.5, 1);
  });
});

describe('WF-03 — khối biểu đồ (FR-07, FR-08)', () => {
  it('công thức cơ bản vẽ biểu đồ thật, nạp trễ qua next/dynamic', async () => {
    render(<Man spec={specOf('pe')} />);

    // Thân biểu đồ nằm sau ranh giới nạp trễ nên tới sau một nhịp.
    expect(await screen.findByRole('figure')).not.toBeNull();
    expect(screen.getByText('P/E theo Giá thị trường')).not.toBeNull();
  });

  it('đổi ô nhập thì biểu đồ và bảng số đổi theo, khớp con số ở khối Kết quả', async () => {
    render(<Man spec={specOf('pe')} />);
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

    render(<Man spec={none} />);

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
    render(<Man spec={specOf('sma-n-phien')} />);

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
    render(<Man spec={specOf('lai-kep')} />);

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
    render(<Man spec={specOf('tra-gop-nien-kim')} />);

    const amount = oNhap(/Số tiền vay/);
    await userEvent.clear(amount);
    await userEvent.type(amount, '1234000000{Enter}');

    expect((amount as HTMLInputElement).value).toBe('1.234.000.000');
  });

  it('miền vẫn là luật — gõ ra ngoài min/max thì kẹp lại', async () => {
    render(<Man spec={specOf('lai-kep')} />);

    const rate = oNhap(/Lãi suất/);
    await userEvent.clear(rate);
    await userEvent.type(rate, '999{Enter}');

    // max của lãi suất lãi kép là 20%.
    expect((rate as HTMLInputElement).value).toBe('20');
  });
});

describe('WF-03 — gõ số ngay tại khối Ví dụ thực tế', () => {
  it('dòng số của ví dụ là ô gõ được, không phải chữ chết', () => {
    render(<Man spec={specOf('pe')} />);

    expect((oViDu(/Giá thị trường/) as HTMLInputElement).readOnly).toBe(false);
    expect((oViDu(/EPS/) as HTMLInputElement).readOnly).toBe(false);
  });

  /*
   * Đây là ca then chốt của cả khối, và là câu trả lời cho lo ngại "hai bộ ô thì có ngày nói hai
   * kết quả": ô ở khối Ví dụ KHÔNG giữ state riêng, nó ghi thẳng vào state của màn. Nên gõ ở dưới
   * thì ô ở trên đổi theo, và ngược lại — chúng không phải hai bản sao mà LÀ một con số.
   */
  it('gõ ở khối Ví dụ thì ô ở khối Số liệu đổi theo, và kết quả tính lại', async () => {
    render(<Man spec={specOf('pe')} />);

    const duoi = oViDu(/Giá thị trường/);
    await userEvent.clear(duoi);
    await userEvent.type(duoi, '120000{Enter}');

    expect((oNhap(/Giá thị trường/) as HTMLInputElement).value).toBe('120.000');
    expect(screen.getByTestId('result-text').textContent).toBe('19,83 lần');
  });

  it('gõ ở khối Số liệu thì ô ở khối Ví dụ cũng đổi — hai chiều', async () => {
    render(<Man spec={specOf('pe')} />);

    const tren = oNhap(/EPS/);
    await userEvent.clear(tren);
    await userEvent.type(tren, '7000{Enter}');

    expect((oViDu(/EPS/) as HTMLInputElement).value).toBe('7.000');
  });

  it('biểu đồ vẽ lại theo số vừa gõ ở khối Ví dụ', async () => {
    render(<Man spec={specOf('pe')} />);
    const figure = await screen.findByRole('figure');

    const duoi = oViDu(/Giá thị trường/);
    await userEvent.clear(duoi);
    await userEvent.type(duoi, '120000{Enter}');

    expect(within(figure).getByRole('table').textContent).toContain('19,83');
  });

  it('lệch khỏi ví dụ thì nói ra con số gốc kèm nút quay về, bấm là trở lại trọn bộ', async () => {
    render(<Man spec={specOf('pe')} />);

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

  /*
   * Nút cuộn xuống khối này (đầu màn, cạnh "Nạp mẫu") phải có mặt trên CẢ 111 công thức, không
   * riêng nhóm chuỗi giá — chủ dự án chốt điều này sau khi hỏi vì sao chỉ 35 công thức chuỗi có
   * lối "Xem ví dụ minh hoạ": người "chưa hiểu, chưa có số liệu" là một nhóm người dùng, không
   * phải một nhóm công thức. jsdom không cài `Element.scrollIntoView`, nên ca này còn kiểm luôn
   * nhánh an toàn trong `scrollToExample()` không ném lỗi khi hàm đó vắng mặt.
   */
  it('nút "Xem ví dụ thực tế ↓" ở đầu trang có trên mọi công thức, kể cả công thức chuỗi giá', async () => {
    for (const id of ['pe', 'beta']) {
      const { unmount } = render(<Man spec={specOf(id)} />);

      const jump = screen.getByRole('button', { name: t('detail.jumpToExample') });
      await userEvent.click(jump);
      expect(document.getElementById('khoi-vi-du')).not.toBeNull();

      unmount();
    }
  });
});

describe('WF-03 — nạp mã rồi thì biểu đồ vẽ theo số liệu của mã', () => {
  /*
   * Luồng người dùng thật, đầu tới cuối: mở P/E, bấm Nạp mẫu, chọn FPT. Trước đợt này biểu đồ vẫn
   * là đường giả định ±50% quanh giá vừa nạp; giờ nó chuyển sang 248 phiên thật của FPT, tức thứ
   * người vừa bấm "nạp FPT" đang chờ được thấy.
   */
  it('bấm Nạp mẫu thì trục X tự chuyển sang thời gian, câu mô tả nói rõ mã', async () => {
    render(<Man spec={specOf('pe')} />);
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
    render(<Man spec={specOf('pe')} />);
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
    render(<Man spec={specOf('von-hoa-thi-truong')} />);

    const shares = oNhap(/Số cổ phiếu lưu hành/);
    expect((shares as HTMLInputElement).value).toBe('118');

    await userEvent.click(screen.getByRole('button', { name: 'Nạp mẫu' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Nạp' })[0] as HTMLElement);

    // Không ghim cứng chuỗi hiển thị: `sharesOutstanding` đọc từ số thật (LIVE_FUNDAMENTALS,
    // Finbox_v2), đổi mỗi lần chạy `npm run gen:live-fundamentals`. So bằng số sau khi đổi
    // định dạng vi-VN ('.' phân nghìn, ',' thập phân) ngược lại thành number.
    const fpt = SAMPLE_DATA.byCode('FPT');
    if (fpt === undefined) throw new Error('Bộ mẫu thiếu FPT.');
    const expectedShares = fpt.fundamentals.sharesOutstanding / 1_000_000;

    const shown = (oNhap(/Số cổ phiếu lưu hành/) as HTMLInputElement).value;
    expect(shown).not.toBe('118');
    const parsed = Number(shown.replaceAll('.', '').replace(',', '.'));
    expect(parsed).toBeCloseTo(expectedShares, 2);
  });
});

describe('WF-03 — đường ra khỏi màn chi tiết', () => {
  /*
   * Lỗ hổng chủ dự án báo: vào một công thức rồi thì không có lối quay về danh sách để chọn
   * cái khác. Ca này chốt lại cho mọi công thức, không riêng một cái.
   */
  it('mọi công thức đều có link quay về danh sách', () => {
    for (const spec of FORMULAS) {
      const { unmount } = render(<Man spec={spec} />);

      const back = screen.getByRole('link', { name: t('nav.backToList') });
      expect(back.getAttribute('href'), spec.id).toMatch(/^\/cong-thuc\/?(\?|$)/);

      unmount();
    }
  });

  it('đường ra là link thật, không phải nút — chạy được cả khi JavaScript chưa tải xong', () => {
    render(<Man spec={specOf('pe')} />);

    expect(screen.getByRole('link', { name: t('nav.backToList') }).tagName).toBe('A');
  });
});

describe('WF-03 — không công thức nào lọt giá trị vô nghĩa ra màn', () => {
  it('mọi công thức đều dựng được và không hiện NaN hay Infinity', () => {
    for (const spec of FORMULAS) {
      const { container, unmount } = render(<Man spec={spec} />);

      expect(container.textContent, spec.id).not.toContain('NaN');
      expect(container.textContent, spec.id).not.toContain('Infinity');
      expect(container.textContent, spec.id).not.toContain('undefined');
      unmount();
    }
  });

  /*
   * Bất biến thật, viết lại khi Registry đủ 108 công thức.
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
      const { unmount } = render(<Man spec={spec} />);
      const shown = screen.getByTestId('result-text').textContent ?? '';

      if (!shown.includes(NO_VALUE)) {
        unmount();
        continue;
      }

      const alert = screen.getByRole('alert');
      const text = alert.textContent ?? '';

      /*
       * Lý do HỢP LỆ để không ra số với giá trị mặc định là chưa có chuỗi giá (MISSING_SERIES).
       * Mọi mã khác — chia cho 0, không có ý nghĩa… — nghĩa là chính bộ giá trị mặc định của
       * công thức tự mâu thuẫn, và đó là lỗi thật chứ không phải trạng thái chờ người dùng.
       *
       * `xirr` là ngoại lệ DUY NHẤT, và có lý do riêng: nó không đọc `ctx.series`/`ctx.bars`
       * nên không được mang mã MISSING_SERIES — mang mã đó sẽ khiến `needsPriceSeries()` xếp
       * nhầm nó vào nhóm cần nút "Dán chuỗi giá" (xem docblock ở `calc` của `xirr`). Đầu vào
       * của nó là một BẢNG dòng tiền, nên mã đúng là INCOMPLETE_INPUT — cùng bản chất "chờ
       * dữ liệu có cấu trúc từ người dùng", chỉ khác cấu trúc đó là bảng chứ không phải chuỗi.
       */
      const expectedLabel =
        spec.id === 'xirr' ? WARNING_LABELS.INCOMPLETE_INPUT : WARNING_LABELS.MISSING_SERIES;
      expect(text, `${spec.id}: mã cảnh báo`).toContain(expectedLabel.vi);
      // Phải có câu chỉ đường, không được chỉ báo lỗi rồi bỏ mặc.
      expect(text, `${spec.id}: thiếu câu chỉ cách khắc phục`).toContain(t('result.fixPrefix'));

      unmount();
    }
  });

  it('đúng những công thức ăn chuỗi giá mới phải chờ dữ liệu, số còn lại ra số ngay', () => {
    const chờDữLiệu: string[] = [];

    for (const spec of FORMULAS) {
      const { unmount } = render(<Man spec={spec} />);
      if ((screen.getByTestId('result-text').textContent ?? '').includes(NO_VALUE)) {
        chờDữLiệu.push(spec.id);
      }
      unmount();
    }

    // Hai nhóm chuỗi giá là `risk` và `technical`; `risk` còn một công thức vô hướng (cỡ lệnh).
    // `xirr` chờ một BẢNG dòng tiền chứ không chuỗi giá, nên đứng riêng ở nhóm `returns`.
    for (const id of chờDữLiệu) {
      const spec = specOf(id);
      const allowed = id === 'xirr' ? ['returns'] : ['risk', 'technical'];
      expect(allowed, `${id} phải ra số ngay mà lại chờ dữ liệu`).toContain(spec.categoryId);
    }

    // Và phải có ĐÚNG 36 công thức như vậy — thêm bớt là có người vừa đổi hợp đồng dữ liệu.
    expect(chờDữLiệu.length).toBe(36);
  });
});

/*
 * ── Chuỗi công thức trên màn nâng cao — WF-04, FR-15 (gói 5.2.3) ────────────────────────────
 *
 * Đây là lần đầu FR-15 chạy thật trên một màn: `dependsOn` sinh ra dải luồng, kết quả bước trước
 * chảy vào ô bước sau, và thượng nguồn gãy thì bước sau kế thừa cảnh báo. Ca kiểm ở đây soi phần
 * NỐI DÂY; phần toán của chuỗi đã có `run-chain.test.ts` lo.
 */

/** Màn chi tiết ở chế độ Nâng cao — gieo tuỳ chọn trước khi Provider đọc localStorage. */
function manNangCao(spec: FormulaSpec) {
  window.localStorage.setItem(
    PREFERENCES_STORAGE_KEY,
    JSON.stringify({ ...DEFAULT_PREFERENCES, mode: 'advanced' }),
  );
  return render(
    <PreferencesProvider>
      <Man spec={spec} />
    </PreferencesProvider>,
  );
}

/** Khối chuỗi — một vùng có tên riêng, tách hẳn khỏi vùng "Số liệu". */
function khoiChuoi(): HTMLElement {
  return screen.getByRole('region', { name: t('chain.title') });
}

describe('WF-04 — chuỗi công thức ở chế độ Nâng cao', () => {
  it('chế độ Cơ bản không dựng khối chuỗi, kể cả với công thức nằm trong chuỗi', () => {
    render(<Man spec={specOf('mo-hinh-gordon')} />);

    expect(screen.queryByRole('region', { name: t('chain.title') })).toBeNull();
    // Và ô r vẫn là thanh trượt nhập tay như trước đợt này.
    expect(screen.queryByRole('button', { name: t('input.override') })).toBeNull();
  });

  it('công thức không dính cạnh nào thì Nâng cao cũng không có khối chuỗi', async () => {
    manNangCao(specOf('pe'));

    // Chờ Provider đọc xong localStorage rồi mới kết luận là KHÔNG có — nếu không thì ca này
    // đỗ giả ngay ở lượt dựng đầu, lúc chế độ còn là Cơ bản.
    expect(await screen.findByTestId('result-text')).not.toBeNull();
    expect(screen.queryByRole('region', { name: t('chain.title') })).toBeNull();
  });

  it('ô "Suất sinh lợi yêu cầu" nhận tự động từ CAPM, có ghi tên nguồn (FR-15)', async () => {
    manNangCao(specOf('mo-hinh-gordon'));

    // '↳ CAPM — chi phí vốn chủ sở hữu' do LinkedInput dựng; sự có mặt của nó chứng minh cạnh
    // dependsOn đã chảy tới tận ô nhập, không dừng ở metadata.
    expect(await screen.findByText(/↳ CAPM/)).not.toBeNull();

    // 3,5 + 1,2 × 8 = 13,1% — con số của CAPM, không phải 12% mặc định của chính ô này.
    const o = oNhap(/Suất sinh lợi yêu cầu/) as HTMLInputElement;
    expect(o.value).toBe('13,1');

    // 2.000 × 1,05 ÷ 0,081 = 25.925,93 ₫
    expect(screen.getByTestId('result-text').textContent).toContain('25.925');
  });

  it('dải luồng bày đủ ba bước và đánh dấu bước đang xem', async () => {
    manNangCao(specOf('mo-hinh-gordon'));
    const khoi = await screen.findByRole('region', { name: t('chain.title') });

    const dai = within(khoi).getByRole('list');
    expect(dai.textContent).toContain('CAPM');
    expect(dai.textContent).toContain('Biên an toàn');
    expect(dai.querySelector('[aria-current="step"]')?.textContent).toContain('Gordon');
  });

  it('sửa số ở bước TRƯỚC thì kết quả của công thức đang xem đổi theo', async () => {
    manNangCao(specOf('mo-hinh-gordon'));
    const khoi = await screen.findByRole('region', { name: t('chain.title') });

    // Thẻ CAPM mở sẵn vì nó cấp số liệu trực tiếp cho công thức đang xem.
    const beta = within(khoi).getByRole('textbox', { name: /Hệ số beta/ });
    await userEvent.clear(beta);
    await userEvent.type(beta, '2');

    // 3,5 + 2 × 8 = 19,5% → 2.000 × 1,05 ÷ 0,145 = 14.482,76 ₫
    expect((oNhap(/Suất sinh lợi yêu cầu/) as HTMLInputElement).value).toBe('19,5');
    expect(screen.getByTestId('result-text').textContent).toContain('14.482');
  });

  it('thượng nguồn lỗi thì kết quả là CẢNH BÁO KẾ THỪA, không phải "còn thiếu"', async () => {
    manNangCao(specOf('mo-hinh-gordon'));
    const khoi = await screen.findByRole('region', { name: t('chain.title') });

    // beta −2 kéo chi phí vốn chủ xuống 3,5 − 16 = −12,5% → CAPM không tính được.
    const beta = within(khoi).getByRole('textbox', { name: /Hệ số beta/ });
    await userEvent.clear(beta);
    await userEvent.type(beta, '-2');

    expect(screen.getByTestId('result-text').textContent).toContain(NO_VALUE);
    expect(screen.getAllByText(WARNING_LABELS.INHERITED.vi).length).toBeGreaterThan(0);
    // Ô r người dùng KHÔNG hề bỏ trống, nên tuyệt đối không được báo "Còn thiếu".
    expect(screen.queryByText(/Còn thiếu/)).toBeNull();
  });

  it('bấm Ghi đè thì ô thành của người dùng và chuỗi chạy tiếp', async () => {
    manNangCao(specOf('mo-hinh-gordon'));
    await screen.findByText(/↳ CAPM/);

    const khoiSoLieu = screen.getByRole('region', { name: t('detail.inputs') });
    await userEvent.click(within(khoiSoLieu).getByRole('button', { name: t('input.override') }));

    expect(within(khoiSoLieu).getByText(t('input.overridden'))).not.toBeNull();
    expect(within(khoiSoLieu).getByRole('button', { name: t('input.revert') })).not.toBeNull();
    // Ghi đè bắt đầu từ chính giá trị đang hiện nên kết quả không nhảy lung tung.
    expect(screen.getByTestId('result-text').textContent).toContain('25.925');
  });

  it('bước SAU dùng kết quả của công thức đang xem, và nói rõ đó là bước sau', async () => {
    manNangCao(specOf('mo-hinh-gordon'));
    const khoi = await screen.findByRole('region', { name: t('chain.title') });

    expect(within(khoi).getByText(t('chain.upstreamHeading'))).not.toBeNull();
    expect(within(khoi).getByText(t('chain.downstreamHeading'))).not.toBeNull();

    // Biên an toàn gập sẵn, nhưng dòng tóm tắt phải hiện kết quả:
    // (25.925,93 − 30.000) ÷ 25.925,93 = −15,71%
    expect(khoiChuoi().textContent).toContain('-15,71');
  });
});

/*
 * Bấm/nhả trên biểu đồ ghi giá trị vào ô Số liệu — luồng ĐẦU-CUỐI thật (khác `charts.test.tsx`,
 * nơi kiểm `ChartBody`/`LineChart` cô lập). Ở đây phải đi trọn đường: `LineChart` → `ChartBody` →
 * `FormulaChart` (qua `next/dynamic`, qua `memo`) → `onChartApplyPoint`/`setValue` ở
 * `FormulaDetail.tsx` → ô nhập thật đổi số, kết quả tính lại. KHÔNG cuộn trang — cố ý, xem docblock
 * cạnh `onChartApplyPoint`.
 */
describe('WF-03 — bấm/nhả trên biểu đồ ghi giá trị vào ô Số liệu', () => {
  function gioKhungKhopViewBox() {
    vi.spyOn(SVGSVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: CHART_GEOMETRY.W,
      height: CHART_GEOMETRY.H,
      right: CHART_GEOMETRY.W,
      bottom: CHART_GEOMETRY.H,
      x: 0,
      y: 0,
      toJSON() {
        return this;
      },
    } as DOMRect);
  }

  it('bấm/nhả tại một điểm khác điểm hiện tại: ô "Giá thị trường" đổi số, kết quả tính lại', async () => {
    gioKhungKhopViewBox();

    render(<Man spec={specOf('pe')} />);
    const figure = await screen.findByRole('figure');

    const capture = within(figure).getByTestId('chart-pe-hover-capture');
    const markerX = Number(
      within(figure).getByTestId('chart-marker').querySelector('line')?.getAttribute('x1'),
    );
    if (Number.isNaN(markerX)) {
      throw new Error('Không đọc được dấu "giá trị hiện tại" — kịch bản test đã đổi.');
    }
    // Lệch hẳn khỏi điểm hiện tại để chắc chắn thấy ô đổi số, không phải áp đúng số cũ.
    const target = Math.max(CHART_GEOMETRY.PLOT.x0 + 4, markerX - 60);
    const y = (CHART_GEOMETRY.PLOT.y0 + CHART_GEOMETRY.PLOT.y1) / 2;

    fireEvent.pointerMove(capture, { pointerType: 'mouse', clientX: target, clientY: y });
    fireEvent.pointerUp(capture, { pointerType: 'mouse' });

    const price = oNhap(/Giá thị trường/) as HTMLInputElement;
    expect(price.value).not.toBe('92.000');
    // Kết quả (P/E) phải tính lại theo đúng số vừa ghi — không phải khối Kết quả đứng im.
    expect(screen.getByTestId('result-text').textContent).not.toBe('15,21 lần');
  });

  it('chỉ rê chuột suông rồi rời đi (chưa nhả tay tại điểm nào): ô Số liệu KHÔNG đổi', async () => {
    gioKhungKhopViewBox();
    render(<Man spec={specOf('pe')} />);
    const figure = await screen.findByRole('figure');

    const capture = within(figure).getByTestId('chart-pe-hover-capture');
    const y = (CHART_GEOMETRY.PLOT.y0 + CHART_GEOMETRY.PLOT.y1) / 2;
    fireEvent.pointerMove(capture, {
      pointerType: 'mouse',
      clientX: CHART_GEOMETRY.PLOT.x0 + 20,
      clientY: y,
    });
    fireEvent.pointerLeave(capture, { pointerType: 'mouse' });

    expect((oNhap(/Giá thị trường/) as HTMLInputElement).value).toBe('92.000');
  });
});

/*
 * ── Lưu phép tính vào tab "Công thức" của màn Danh mục ──────────────────────────────────────
 *
 * Chiều đi thứ hai giữa hai màn. Trước gói này quan hệ chỉ có một chiều: tab Danh mục mở
 * `/cong-thuc/<id>/?ma=<MÃ>`, còn số liệu người dùng vừa nhập ở đây thì đóng trang là mất.
 */
describe('WF-03 — lưu phép tính vào danh mục', () => {
  it('nút có mặt ở mọi công thức, không riêng nhóm gắn với một mã', () => {
    for (const id of ['pe', 'lich-tra-no', 'phi-giao-dich-mua']) {
      cleanup();
      render(<Man spec={specOf(id)} />);
      expect(screen.getByRole('button', { name: t('detail.saveToPortfolio') })).not.toBeNull();
    }
  });

  it('lưu xong thì phép tính nằm trong localStorage kèm bộ số đang nhập', async () => {
    render(<Man spec={specOf('pe')} />);

    await userEvent.click(screen.getByRole('button', { name: t('detail.saveToPortfolio') }));
    await userEvent.click(screen.getByRole('button', { name: t('save.submit') }));

    const saved = parseSavedCalcs(window.localStorage.getItem(SAVED_CALCS_KEY));
    expect(saved).toHaveLength(1);
    expect(saved[0]?.formulaId).toBe('pe');
    expect(saved[0]?.name.trim()).not.toBe('');
    // Bộ số mặc định của P/E: giá 92.000 ₫, và kết quả cất đi phải khớp con số đang hiện.
    expect(saved[0]?.inputs.price).toBe(92_000);
    expect(saved[0]?.resultValue).toBeCloseTo(15.2066, 3);
    expect(screen.getByTestId('result-text').textContent).toBe('15,21 lần');
  });

  it('`?luu=` nạp lại đúng bộ số đã lưu và nói rõ ngày lưu', async () => {
    const savedAt = new Date(2026, 7, 25, 10, 0, 0).getTime();
    window.localStorage.setItem(
      SAVED_CALCS_KEY,
      JSON.stringify([
        {
          id: 'pe-1',
          formulaId: 'pe',
          name: 'Phép tính của tôi',
          inputs: { price: 50_000, eps: 5_000 },
          resultValue: 10,
          resultUnit: 'lần',
          savedAt,
          needsSeries: false,
        },
      ]),
    );
    window.history.replaceState({}, '', '/cong-thuc/pe/?luu=pe-1');

    render(<Man spec={specOf('pe')} />);

    expect(await screen.findByText(/Phép tính của tôi/)).not.toBeNull();
    expect(screen.getByText(/25\/08\/2026/)).not.toBeNull();
    expect((oNhap(/Giá thị trường/) as HTMLInputElement).value).toBe('50.000');
    expect(screen.getByTestId('result-text').textContent).toBe('10 lần');
  });

  it('id lạ thì nói ra, không lặng lẽ bày bộ số mặc định', async () => {
    window.history.replaceState({}, '', '/cong-thuc/pe/?luu=khong-co-that');
    render(<Man spec={specOf('pe')} />);

    expect(await screen.findByText(t('detail.restoredMissing'))).not.toBeNull();
  });

  /*
   * Hai tham số cùng ghi vào ô nhập. Phép tính đã lưu là bộ số người dùng tự chốt, nên nạp đè
   * số liệu thị trường lên nó là làm hỏng đúng thứ họ vừa mở ra xem.
   */
  it('`?luu=` thắng `?ma=` — không gọi mạng khi đang mở lại một phép tính đã lưu', async () => {
    window.localStorage.setItem(
      SAVED_CALCS_KEY,
      JSON.stringify([
        {
          id: 'pe-1',
          formulaId: 'pe',
          name: 'Bộ số của tôi',
          inputs: { price: 50_000, eps: 5_000 },
          resultValue: 10,
          resultUnit: 'lần',
          savedAt: Date.now(),
          needsSeries: false,
        },
      ]),
    );
    window.history.replaceState({}, '', '/cong-thuc/pe/?luu=pe-1&ma=FPT');

    render(<Man spec={specOf('pe')} />);

    await screen.findByText(/Bộ số của tôi/);
    expect(feed.snapshots).not.toHaveBeenCalled();
    expect((oNhap(/Giá thị trường/) as HTMLInputElement).value).toBe('50.000');
  });

  it('công thức chuỗi giá: mở lại mà chuỗi đã khác thì nói ra, không im lặng đổi số', async () => {
    window.localStorage.setItem(
      SAVED_CALCS_KEY,
      JSON.stringify([
        {
          id: 'rsi-1',
          formulaId: 'rsi-wilder',
          name: 'RSI đã lưu',
          inputs: {},
          resultValue: 55,
          resultUnit: 'điểm',
          savedAt: Date.now(),
          needsSeries: true,
          seriesCount: 248,
        },
      ]),
    );
    window.history.replaceState({}, '', '/cong-thuc/rsi-wilder/?luu=rsi-1');

    render(<Man spec={specOf('rsi-wilder')} />);

    // Máy này chưa có chuỗi nào trong bảng WF-05, nên 0 phiên ≠ 248 phiên lúc lưu.
    expect(await screen.findByText(t('detail.restoredNeedsSeries'))).not.toBeNull();
  });
});

/**
 * Ghi nhận lượt dùng — nguyên liệu cho khối "Công thức dùng hằng ngày" của trang chủ (FR-20).
 *
 * Đồng hồ giả CỤC BỘ trong describe này: bốn vòng quét 111 màn ở trên chạy với đồng hồ thật và
 * không được đụng tới. Ngưỡng ở lại 8 giây cũng là lý do các ca kiểm khác không vô tình ghi lượt
 * dùng — không ca nào chạy lâu đến thế.
 */
describe('ghi nhận lượt dùng', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Lịch sử đang nằm trong localStorage, đã lọc sạch. */
  function lichSu(): ReadonlyArray<{ id: string; count: number; at: number }> {
    return parseFormulaUsage(window.localStorage.getItem(FORMULA_USAGE_KEY));
  }

  function choiDenNguong(ms = 8000): void {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  }

  it('rời trang trước ngưỡng thì không ghi gì — bấm nhầm không xáo trang chủ', () => {
    render(<Man spec={specOf('pe')} />);
    choiDenNguong(7000);
    cleanup();

    expect(lichSu()).toEqual([]);
  });

  it('ở lại qua ngưỡng thì ghi đúng một lượt', () => {
    render(<Man spec={specOf('pe')} />);
    choiDenNguong();

    expect(lichSu()).toEqual([{ id: 'pe', count: 1, at: expect.any(Number) }]);
  });

  it('ở lại thêm nữa cũng chỉ một lượt cho mỗi lần mở trang', () => {
    render(<Man spec={specOf('pe')} />);
    choiDenNguong();
    choiDenNguong(60_000);

    expect(lichSu()[0]?.count).toBe(1);
  });

  it('mở lại lần hai thì cộng thành hai lượt', () => {
    render(<Man spec={specOf('pe')} />);
    choiDenNguong();
    cleanup();

    render(<Man spec={specOf('pe')} />);
    choiDenNguong();

    expect(lichSu()).toEqual([{ id: 'pe', count: 2, at: expect.any(Number) }]);
  });

  it('chạm vào số liệu thì ghi ngay, và timer sau đó không ghi thêm lần nữa', () => {
    render(<Man spec={specOf('pe')} />);

    fireEvent.change(oNhap(/Giá thị trường/), { target: { value: '100000' } });
    expect(lichSu()[0]?.count).toBe(1);

    choiDenNguong();
    expect(lichSu()[0]?.count).toBe(1);
  });

  it('tab đang ẩn lúc hết ngưỡng thì không ghi — tab mở nền không phải người đang đọc', () => {
    const goc = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });

    render(<Man spec={specOf('pe')} />);
    choiDenNguong();

    expect(lichSu()).toEqual([]);

    if (goc === undefined) {
      // @ts-expect-error — trả document về nguyên trạng, jsdom không có API nào khác.
      delete document.visibilityState;
    } else {
      Object.defineProperty(document, 'visibilityState', goc);
    }
  });

  it('localStorage bị chặn thì không ném lỗi ra ngoài, màn vẫn dựng', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('chế độ riêng tư');
    });

    render(<Man spec={specOf('pe')} />);
    expect(() => {
      choiDenNguong();
    }).not.toThrow();

    expect(screen.getByRole('region', { name: t('detail.inputs') })).not.toBeNull();
    vi.restoreAllMocks();
  });
});

/*
 * ── Mã dính theo lượt duyệt ─────────────────────────────────────────────────────────────────
 *
 * Người dùng thật xem MỘT mã qua NHIỀU chỉ số, không phải một chỉ số của nhiều mã. Trước đợt
 * này mã chỉ sống trong state của một màn, nên xem HPG qua 5 công thức là 5 lần nạp mẫu.
 */
const FPT_SNAPSHOT = {
  code: 'FPT',
  name: 'FPT Corp',
  priceVnd: 71_400,
  asOfDate: '2026-08-21',
  floor: 'HOSE',
  industry: 'Phần mềm & DV máy tính',
  fundamentals: {
    eps: 5867,
    bookValuePerShare: 23246,
    sharesOutstanding: 1714326422,
    dividendPerShare: 2000,
    netIncome: 9999.4,
    equity: 39851.2,
    period: 'BCTC Q2/2026',
  },
};

/** Gieo sẵn một mã vào kho phiên, đúng hình dạng `applyPreset()` ghi ra. */
function seedActiveTicker(): void {
  window.sessionStorage.setItem(
    ACTIVE_TICKER_KEY,
    JSON.stringify({
      code: 'FPT',
      preset: {
        code: 'FPT',
        name: 'FPT Corp',
        meta: 'BCTC Q2/2026 · thị giá phiên gần nhất',
        fundamentals: FPT_SNAPSHOT.fundamentals,
        bars: [
          { date: '2026-08-21', open: null, high: null, low: null, close: 71_400, volume: null },
        ],
        isDraft: false,
        fundamentalsAsOf: '2026-08-21',
      },
    }),
  );
}

describe('WF-03 — mã dính theo lượt duyệt', () => {
  it('mở công thức khác thì mã tự theo sang, KHÔNG gọi mạng lần nữa', async () => {
    seedActiveTicker();

    render(<Man spec={specOf('pb')} />);

    await screen.findByRole('button', { name: /Đã nạp FPT/ });
    // Đây là điểm mấu chốt: preset đã cất từ lượt tra đầu tiên, cả lượt duyệt chỉ tốn một request.
    expect(feed.snapshots).not.toHaveBeenCalled();
  });

  it('nói rõ đang dùng mã nào — không tự điền ô trong im lặng', async () => {
    seedActiveTicker();

    render(<Man spec={specOf('pe')} />);

    const bar = await screen.findByRole('status');
    expect(bar.textContent).toContain('FPT');
    expect(bar.textContent).toContain(t('detail.tickerSticky'));
  });

  it('nạp mẫu ở một công thức thì ghi mã vào kho phiên cho công thức sau', async () => {
    render(<Man spec={specOf('pe')} />);

    await userEvent.click(screen.getByRole('button', { name: t('detail.loadPreset') }));
    await userEvent.click(
      (await screen.findAllByRole('button', { name: 'Nạp' }))[0] as HTMLElement,
    );

    const stored = parseActiveTicker(window.sessionStorage.getItem(ACTIVE_TICKER_KEY));
    expect(stored).not.toBeNull();
    expect(stored?.code).toBe(stored?.preset.code);
  });

  it('bỏ mã thì xoá kho VÀ trả ô nhập về mặc định', async () => {
    seedActiveTicker();
    render(<Man spec={specOf('pe')} />);

    await screen.findByRole('button', { name: /Đã nạp FPT/ });
    const filled = (oNhap(/Giá thị trường/) as HTMLInputElement).value;
    expect(filled).toBe('71.400');

    await userEvent.click(screen.getByRole('button', { name: t('detail.tickerClear') }));

    expect(window.sessionStorage.getItem(ACTIVE_TICKER_KEY)).toBeNull();
    // Chỉ xoá kho mà để nguyên số trên màn là bày một bộ số người dùng vừa nói là không muốn nữa.
    expect((oNhap(/Giá thị trường/) as HTMLInputElement).value).toBe('92.000');
    expect(screen.queryByRole('button', { name: t('detail.tickerClear') })).toBeNull();
  });

  /* `?ma=` là ý định vừa nói ra, còn kho phiên là ý định của lượt trước — cái mới thắng. */
  it('`?ma=` trên URL thắng mã đang có trong kho phiên', async () => {
    seedActiveTicker();
    feed.snapshots.mockResolvedValue(
      new Map([['HPG', { ...FPT_SNAPSHOT, code: 'HPG', name: 'Tập đoàn Hoà Phát' }]]),
    );
    window.history.replaceState({}, '', '/cong-thuc/pe/?ma=HPG');

    render(<Man spec={specOf('pe')} />);

    await screen.findByRole('button', { name: /Đã nạp HPG/ });
    expect(feed.snapshots.mock.calls[0]?.[0]).toEqual(['HPG']);
  });

  it('`?luu=` thắng cả kho phiên — bộ số đã lưu là thứ người dùng tự chốt', async () => {
    seedActiveTicker();
    window.localStorage.setItem(
      SAVED_CALCS_KEY,
      JSON.stringify([
        {
          id: 'pe-1',
          formulaId: 'pe',
          name: 'Bộ số của tôi',
          inputs: { price: 50_000, eps: 5_000 },
          resultValue: 10,
          resultUnit: 'lần',
          savedAt: Date.now(),
          needsSeries: false,
        },
      ]),
    );
    window.history.replaceState({}, '', '/cong-thuc/pe/?luu=pe-1');

    render(<Man spec={specOf('pe')} />);

    await screen.findByText(/Bộ số của tôi/);
    expect((oNhap(/Giá thị trường/) as HTMLInputElement).value).toBe('50.000');
  });

  it('kho phiên hỏng thì màn chạy như trước đợt này, không sập', async () => {
    window.sessionStorage.setItem(ACTIVE_TICKER_KEY, '{"code":"FPT","preset":null}');

    render(<Man spec={specOf('pe')} />);

    await screen.findByRole('button', { name: t('detail.loadPreset') });
    expect((oNhap(/Giá thị trường/) as HTMLInputElement).value).toBe('92.000');
  });
});
