// @vitest-environment jsdom

/**
 * Khối Kiểm tra hiểu bài — bất biến hành vi.
 *
 * Bốn thứ ca kiểm này giữ, và cả bốn đều là quyết định sản phẩm chứ không phải chi tiết dựng:
 * nút Kiểm tra khoá tới khi chọn đáp án; trả lời rồi thì KHÔNG đổi được đáp án; mọi câu đã trả
 * lời đều bày đường dẫn nguồn; và khối dưới ba câu không dựng thanh tiến độ.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { t } from '@/application';
import type { QuizItem, QuizTolerance } from '@/application';

import { QuizBody } from './QuizBody';

afterEach(cleanup);

function cau(id: string, answer: 'a' | 'b' = 'b'): QuizItem {
  return {
    id,
    formulaId: 'pe',
    format: 'trac-nghiem',
    kind: 'doc-ket-qua',
    evidence: 'ngo-nhan',
    prompt: { vi: `Đề bài ${id}` },
    choices: {
      a: { vi: `Lựa chọn A của ${id}` },
      b: { vi: `Lựa chọn B của ${id}` },
      c: { vi: `Lựa chọn C của ${id}` },
      d: { vi: `Lựa chọn D của ${id}` },
    },
    answer,
    explain: { vi: `Nguồn ghi “trích dẫn của ${id}” nên đáp án là vậy.` },
    source: {
      url: `https://vi.dụ/${id}`,
      kind: 'chuyen-gia',
      vietnam: true,
    },
  };
}

/** Nhãn vị trí trong bài, dựng từ khoá i18n để ca kiểm không chép cứng chữ "Câu". */
const viTri = (n: number, tong: number) =>
  t('quiz.step').replace('{n}', String(n)).replace('{total}', String(tong));

const BA_CAU = [cau('Q001'), cau('Q002'), cau('Q003')];

function batDau(items: ReadonlyArray<QuizItem>, onFinish?: () => void) {
  render(<QuizBody formulaId="pe" items={items} onFinish={onFinish} />);
  fireEvent.click(screen.getByRole('button'));
}

describe('công thức chưa có câu nào', () => {
  it('dựng trạng thái rỗng và nói rõ lý do, không dựng nút bắt đầu', () => {
    render(<QuizBody formulaId="tiet-kiem-muc-tieu" items={[]} />);
    expect(screen.getByText(t('quiz.empty.title'))).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('làm bài', () => {
  it('nút Kiểm tra khoá tới khi chọn một đáp án', () => {
    batDau(BA_CAU);
    const kiemTra = screen.getByRole('button', { name: t('quiz.check') });
    expect(kiemTra.hasAttribute('disabled')).toBe(true);

    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn A/ }));
    expect(screen.getByRole('button', { name: t('quiz.check') }).hasAttribute('disabled')).toBe(
      false,
    );
  });

  it('trả lời xong thì khoá hết lựa chọn — không cho đổi đáp án sau khi đã thấy lời giải', () => {
    batDau(BA_CAU);
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn A/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));

    for (const radio of screen.getAllByRole('radio')) {
      expect((radio as HTMLInputElement).disabled).toBe(true);
    }
  });

  /*
   * Từ 24/09/2026 cả hai nhãn đều gọn: ô chọn sai mang "Sai" và BỊ GẠCH BỎ, ô đáp án đúng
   * mang "Đúng" chứ không còn "Đáp án đúng". Ca này gác luôn nét gạch, vì nó là thứ duy nhất
   * còn phân biệt ô sai sau khi nền đỏ bị bỏ — mất nó thì ô sai chỉ khác ô thường ở cái viền.
   */
  it('chọn sai thì ô ấy bị gạch bỏ kèm nhãn Sai, ô đáp án đúng mang nhãn Đúng', () => {
    batDau(BA_CAU);
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn A/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));

    expect(screen.getByText(t('quiz.wrong'))).toBeTruthy();
    expect(screen.getByText(t('quiz.right'))).toBeTruthy();

    const oSai = screen.getByRole('radio', { name: /Lựa chọn A/ }).closest('label');
    expect(oSai?.className).toMatch(/choiceWrong/);
  });

  it('câu đã trả lời luôn bày đường dẫn nguồn để kiểm chứng', () => {
    batDau(BA_CAU);
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('https://vi.dụ/Q001');
  });

  it('câu trích của nguồn được tô riêng bằng thẻ <q>, không chìm vào lời giải', () => {
    const { container } = render(<QuizBody formulaId="pe" items={BA_CAU} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));

    const quote = container.querySelector('q');
    expect(quote?.textContent).toBe('trích dẫn của Q001');
  });
});

describe('khối ít câu — 87 trên 111 công thức rơi vào đây', () => {
  it('dưới ba câu thì không dựng thanh tiến độ', () => {
    const { container } = render(<QuizBody formulaId="pe" items={[cau('Q001'), cau('Q002')]} />);
    fireEvent.click(screen.getByRole('button'));
    expect(container.textContent).not.toContain(viTri(1, 2));
  });

  it('từ ba câu trở lên thì có', () => {
    const { container } = render(<QuizBody formulaId="pe" items={BA_CAU} />);
    fireEvent.click(screen.getByRole('button'));
    expect(container.textContent).toContain(viTri(1, 3));
  });
});

describe('tổng kết', () => {
  it('báo đúng số câu đúng và mã câu đã sai khi làm xong', () => {
    const onFinish = vi.fn();
    render(<QuizBody formulaId="pe" items={[cau('Q001'), cau('Q002')]} onFinish={onFinish} />);
    fireEvent.click(screen.getByRole('button'));

    // Câu 1 trả lời đúng (đáp án 'b'), câu 2 trả lời sai.
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.next') }));

    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn A/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.seeResult') }));

    expect(onFinish).toHaveBeenCalledWith({ right: 1, total: 2, wrong: ['Q002'] });
    expect(screen.getByText('1 / 2')).toBeTruthy();
  });

  /*
   * Màn tổng kết KHÔNG còn câu "Kết quả lưu trên máy bạn…" (bỏ 24/09/2026). Ca này đảo chiều
   * ca cũ chứ không xoá luôn: câu ấy từng là chỗ sản phẩm nói ra LDR-04 · NFR-SEC-01, nên nếu
   * có ngày nó quay về thì phải là một quyết định, không phải một lần sửa lỡ tay.
   *
   * Nhãn viết thẳng ra đây chứ không đọc qua `t()`: khoá đã xoá, gọi `t()` là lỗi biên dịch.
   */
  it('màn tổng kết không còn câu cam kết lưu cục bộ', () => {
    render(<QuizBody formulaId="pe" items={[cau('Q001')]} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.seeResult') }));

    expect(screen.getByText(t('quiz.result'))).toBeTruthy();
    expect(document.body.textContent ?? '').not.toContain('lưu trên máy bạn');
  });

  /*
   * "Ôn lại câu sai" chạy lại một TẬP CON của bài. Ghi kết quả lượt ấy xuống kho là ghi đè bản
   * cũ theo id (`recordQuizResult`), nên 3/5 hoá thành 2/2 — điểm đẹp lên một cách sai lệch.
   */
  it('ôn lại câu sai thì KHÔNG ghi đè kết quả của lần làm đầy đủ', () => {
    const onFinish = vi.fn();
    render(<QuizBody formulaId="pe" items={[cau('Q001'), cau('Q002')]} onFinish={onFinish} />);
    fireEvent.click(screen.getByRole('button'));

    // Lượt đầy đủ: câu 1 đúng, câu 2 sai → 1/2, ghi xuống kho.
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.next') }));
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn A/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.seeResult') }));
    expect(onFinish).toHaveBeenCalledTimes(1);

    // Lượt ôn: đúng cả câu vừa sai. Màn vẫn báo 1/1 cho người dùng…
    fireEvent.click(screen.getByRole('button', { name: t('quiz.reviewWrong') }));
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.seeResult') }));
    expect(screen.getByText('1 / 1')).toBeTruthy();

    // …nhưng KHÔNG gọi lại `onFinish`, nên kho vẫn giữ 1/2 của lần làm đầy đủ.
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenLastCalledWith({ right: 1, total: 2, wrong: ['Q002'] });
  });

  /* Sai CẢ bài thì tập con bằng cả bài — lúc ấy ghi lại là đúng. */
  it('làm lại từ đầu thì có ghi kết quả', () => {
    const onFinish = vi.fn();
    render(<QuizBody formulaId="pe" items={[cau('Q001')]} onFinish={onFinish} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn A/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.seeResult') }));

    fireEvent.click(screen.getByRole('button', { name: t('quiz.retry') }));
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.seeResult') }));

    expect(onFinish).toHaveBeenCalledTimes(2);
    expect(onFinish).toHaveBeenLastCalledWith({ right: 1, total: 1, wrong: [] });
  });
});

describe('dạng chọn nhiều — WF-19C', () => {
  function cauChonNhieu(): QuizItem {
    const base = cau('Q001');
    if (base.format !== 'trac-nghiem') throw new Error('fixture phải là trắc nghiệm');
    // Không spread rồi ghi đè `format`: trường `answer` của bản gốc sẽ lọt vào và hợp kiểu từ chối.
    return {
      id: base.id,
      formulaId: base.formulaId,
      format: 'chon-nhieu',
      kind: base.kind,
      evidence: base.evidence,
      prompt: base.prompt,
      choices: base.choices,
      answers: ['a', 'c'],
      explain: base.explain,
      source: base.source,
    };
  }

  it('dựng checkbox chứ không phải radio, và nói trước là có nhiều đáp án', () => {
    batDau([cauChonNhieu()]);
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.getByText(t('quiz.pickAll'))).toBeTruthy();
  });

  it('chọn được nhiều ô cùng lúc, bỏ chọn lại được', () => {
    batDau([cauChonNhieu()]);
    const a = screen.getByRole('checkbox', { name: /Lựa chọn A/ }) as HTMLInputElement;
    const c = screen.getByRole('checkbox', { name: /Lựa chọn C/ }) as HTMLInputElement;

    fireEvent.click(a);
    fireEvent.click(c);
    expect(a.checked).toBe(true);
    expect(c.checked).toBe(true);

    fireEvent.click(a);
    expect(a.checked).toBe(false);
  });

  /*
   * Chấm TRỌN GÓI: chọn được hai trong ba điều kiện làm công thức mất nghĩa nghĩa là vẫn sẽ dùng
   * sai ở trường hợp thứ ba. Ca này giữ đúng chỗ ấy.
   */
  it('chọn thiếu một đáp án vẫn là sai', () => {
    const onFinish = vi.fn();
    const { container } = render(
      <QuizBody formulaId="pe" items={[cauChonNhieu()]} onFinish={onFinish} />,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('checkbox', { name: /Lựa chọn A/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));

    // Dòng phán quyết CHUNG, không phải huy hiệu của từng ô: ô A đã chọn vẫn mang huy hiệu Đúng.
    expect(container.querySelector('[data-verdict]')?.textContent).toBe(t('quiz.wrong'));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.seeResult') }));
    expect(onFinish).toHaveBeenCalledWith({ right: 0, total: 1, wrong: ['Q001'] });
  });

  it('chọn đúng trọn bộ thì tính là đúng', () => {
    const onFinish = vi.fn();
    batDau([cauChonNhieu()], onFinish);
    fireEvent.click(screen.getByRole('checkbox', { name: /Lựa chọn A/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Lựa chọn C/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.seeResult') }));

    expect(onFinish).toHaveBeenCalledWith({ right: 1, total: 1, wrong: [] });
  });
});

describe('dạng điền số — đặt số liệu vào công thức, WF-19C · S10–S12', () => {
  function cauDienSo(worked = 'P/E = [92.000] ÷ [7.360]', expected = 12.5): QuizItem {
    const base = cau('Q001');
    return {
      id: base.id,
      formulaId: base.formulaId,
      kind: 'quy-uoc',
      evidence: base.evidence,
      prompt: base.prompt,
      explain: base.explain,
      source: base.source,
      format: 'dien-so',
      expected,
      tolerance: { kind: 'tuyet-doi', value: 0.1 },
      unit: { vi: 'lần' },
      worked: { vi: worked },
      facts: [{ label: { vi: 'Giá thị trường' }, value: { vi: '92.000 ₫' } }],
    };
  }

  /** Các ô trống của công thức, theo thứ tự trái sang phải trong DOM. */
  function cacO(): HTMLInputElement[] {
    return screen.getAllByRole('textbox') as HTMLInputElement[];
  }

  function go(thuTu: number, text: string) {
    const o = cacO()[thuTu];
    if (o === undefined) throw new Error(`không có ô số ${thuTu}`);
    fireEvent.change(o, { target: { value: text } });
  }

  function kiemTra() {
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
  }

  it('dựng một ô nhập cho mỗi số liệu, không dựng lựa chọn nào', () => {
    batDau([cauDienSo()]);
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(cacO()).toHaveLength(2);
  });

  /*
   * Nhãn trợ năng đánh SỐ THỨ TỰ ô. Người dùng bộ đọc màn hình không thấy được vị trí ô trong
   * hình, nên số thứ tự là thứ duy nhất phân biệt được các ô giống hệt nhau.
   */
  it('mỗi ô mang nhãn trợ năng riêng theo thứ tự', () => {
    batDau([cauDienSo()]);
    expect(cacO()[0]?.getAttribute('aria-label')).toContain('1');
    expect(cacO()[1]?.getAttribute('aria-label')).toContain('2');
  });

  it('nút Kiểm tra khoá tới khi MỌI ô đều có một số đọc được', () => {
    batDau([cauDienSo()]);
    const nut = () => screen.getByRole('button', { name: t('quiz.check') });
    expect(nut().hasAttribute('disabled')).toBe(true);

    go(0, '92.000');
    // Mới một trong hai ô — điền dở nửa công thức thì chưa có gì để chấm.
    expect(nut().hasAttribute('disabled')).toBe(true);

    // Gõ dở: một dấu trừ chưa phải số.
    go(1, '-');
    expect(nut().hasAttribute('disabled')).toBe(true);

    go(1, '7.360');
    expect(nut().hasAttribute('disabled')).toBe(false);
  });

  /*
   * Điều kiện chặn "quy ước dấu thập phân của người Việt" mà WF-19C nêu ra: người dùng gõ lẫn lộn
   * dấu phẩy và dấu chấm, và cả hai phải ra cùng một số.
   */
  it('nhận cả dấu phẩy lẫn dấu chấm làm dấu thập phân', () => {
    for (const text of ['1,5', '1.5']) {
      const onFinish = vi.fn();
      batDau([cauDienSo('x = [1,5] × [2]', 3)], onFinish);
      go(0, text);
      go(1, '2');
      kiemTra();
      fireEvent.click(screen.getByRole('button', { name: t('quiz.seeResult') }));
      expect(onFinish, text).toHaveBeenCalledWith({ right: 1, total: 1, wrong: [] });
      cleanup();
    }
  });

  /*
   * ĐÂY là bài tập, và là thứ cả vòng dựng lại 24/09/2026 xoay quanh. Chủ dự án: "điền đúng chỗ
   * số liệu vào công thức thì kiểm tra xem đúng chưa chứ không phải hỏi xem kết quả là như nào."
   *
   * Đặt đủ hai số nhưng ĐỔI CHỖ cho nhau thì SAI — dù người học rõ ràng đã nhặt đúng hai con số
   * của đề bài. Bản cũ chấm kết quả nên không phân biệt nổi chuyện này.
   */
  it('đặt đúng chỗ thì đúng, đổi chỗ hai số liệu thì sai', () => {
    batDau([cauDienSo()]);
    go(0, '92.000');
    go(1, '7.360');
    kiemTra();
    expect(screen.getByText(new RegExp(t('quiz.right')))).toBeTruthy();

    cleanup();
    batDau([cauDienSo()]);
    go(0, '7.360');
    go(1, '92.000');
    kiemTra();
    expect(screen.getByText(new RegExp(t('quiz.wrong')))).toBeTruthy();
  });

  /* Chấm TRỌN GÓI: đúng một nửa công thức thì con số ra được vẫn sai hẳn. */
  it('đúng một ô mà sai ô kia thì cả câu tính là sai', () => {
    batDau([cauDienSo()]);
    go(0, '92.000');
    go(1, '99');
    kiemTra();
    expect(screen.getByText(new RegExp(t('quiz.wrong')))).toBeTruthy();
  });

  it('chấm xong thì TỪNG ô mang dấu đúng hay sai của riêng nó', () => {
    batDau([cauDienSo()]);
    go(0, '92.000');
    go(1, '99');
    kiemTra();
    expect(cacO()[0]?.getAttribute('data-ket-qua')).toBe('dung');
    expect(cacO()[1]?.getAttribute('data-ket-qua')).toBe('sai');
  });

  /*
   * Phép chia vẽ thành PHÂN SỐ XẾP TẦNG có gạch phân, và ô nhập nằm ngay trong tử số và mẫu số.
   * Chủ dự án 24/09/2026, kèm ảnh `β = Cov(Rᵢ, Rₘ) / Var(Rₘ)`: "trình bày trên dưới có gạch phân
   * rõ như công thức kìa thì mới hiểu."
   *
   * Đây cũng là lý do khối bỏ MathML: `<mfrac>` không cho nhúng `<input>` vào tử số.
   */
  it('phép chia vẽ thành phân số, ô nhập nằm trong tử và trong mẫu', () => {
    const { container } = render(<QuizBody formulaId="pe" items={[cauDienSo()]} />);
    fireEvent.click(screen.getByRole('button'));

    const phanSo = container.querySelector('[data-phan-so]');
    expect(phanSo).toBeTruthy();
    expect(phanSo?.children).toHaveLength(2);
    expect(phanSo?.children[0]?.querySelector('input')).toBeTruthy();
    expect(phanSo?.children[1]?.querySelector('input')).toBeTruthy();
    // Đã thành phân số thì dấu chia không còn được in ra chữ nữa.
    expect(container.textContent).not.toContain('÷');
  });

  it('ô nhập nằm NGAY TRONG khối công thức, không phải một khối riêng bên dưới', () => {
    const { container } = render(<QuizBody formulaId="pe" items={[cauDienSo()]} />);
    fireEvent.click(screen.getByRole('button'));

    const congThuc = container.querySelector('[data-cong-thuc]');
    expect(congThuc).toBeTruthy();
    for (const o of cacO()) expect(congThuc?.contains(o)).toBe(true);
  });

  /*
   * Ô nhập là `<input>` TRẦN, không qua `Input`: `Input` có nhãn ở trên, mà một nhãn đặt giữa công
   * thức thì phá nát công thức. Nhãn cho bộ đọc màn hình đi qua `aria-label`.
   */
  it('không dựng thẻ label nào, nhãn đi qua aria-label', () => {
    const { container } = render(<QuizBody formulaId="pe" items={[cauDienSo()]} />);
    fireEvent.click(screen.getByRole('button'));

    expect(container.querySelector('label')).toBeNull();
    for (const o of cacO()) expect(o.getAttribute('aria-label')).toBeTruthy();
  });

  /*
   * Kết quả KHÔNG hiện sẵn — người học không phải tính nó. Nó lộ ra sau khi chấm, như chỗ khép
   * lại ví dụ, và in theo quy ước SỐ VIỆT: trước 24/09/2026 nó in thẳng số JS nên `beta` hiện
   * "1.335 lần", người Việt đọc thành một nghìn ba trăm ba lăm, sai gấp nghìn lần.
   */
  it('kết quả chỉ lộ ra sau khi chấm, và in dấu phẩy thập phân', () => {
    const { container } = render(
      <QuizBody formulaId="pe" items={[cauDienSo('x = [0,89] × [1,5]', 1.335)]} />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(container.textContent).not.toContain('1,335');

    go(0, '0,67');
    go(1, '2');
    kiemTra();

    const dong =
      [...container.querySelectorAll('p')]
        .map((el) => el.textContent ?? '')
        .find((text) => text.includes(t('quiz.workedResult'))) ?? '';
    expect(dong).toContain('1,335');
    expect(dong).not.toContain('1.335');
  });

  it('đặt sai thì in ra thứ tự đúng của các ô', () => {
    const { container } = render(<QuizBody formulaId="pe" items={[cauDienSo()]} />);
    fireEvent.click(screen.getByRole('button'));
    go(0, '7.360');
    go(1, '92.000');
    kiemTra();

    const dong =
      [...container.querySelectorAll('p')]
        .map((el) => el.textContent ?? '')
        .find((text) => text.includes(t('quiz.correctSlots'))) ?? '';
    expect(dong).toContain('92.000');
    expect(dong).toContain('7.360');
  });

  /*
   * Không còn dòng "Chấp nhận sai số ±0,1 lần". Việc chấm VỊ TRÍ không có dung sai — chép đúng
   * con số hay không, thế thôi. `tolerance` vẫn còn trong dữ liệu nhưng chỉ cửa gác đọc.
   */
  it('không còn dòng sai số nào dưới công thức', () => {
    const { container } = render(<QuizBody formulaId="pe" items={[cauDienSo()]} />);
    fireEvent.click(screen.getByRole('button'));
    expect(container.textContent).not.toContain('±');
    expect(container.textContent).not.toContain('dấu thập phân');
  });

  /*
   * Ô đã chấm thì khoá lại. Đổi số sau khi đã thấy đáp án là tự chấm điểm cho mình — quyết định 3
   * ở docblock đầu `QuizBody`.
   */
  it('chấm xong thì khoá mọi ô', () => {
    batDau([cauDienSo()]);
    go(0, '92.000');
    go(1, '7.360');
    kiemTra();
    for (const o of cacO()) expect(o.hasAttribute('disabled')).toBe(true);
  });
});

describe('khối nguồn — WF-19D · S14 và S16', () => {
  function traLoiDung() {
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
  }

  /*
   * Đầu câu KHÔNG còn chip phân loại nào — cả ba bỏ trong ngày 24/09/2026. Ca này gác đúng chỗ
   * chúng từng đứng, vì một chip lặng lẽ quay về thì không cửa gác nào khác thấy. Nhãn viết
   * thẳng ra đây chứ không đọc qua `t()`: khoá i18n đã xoá, nên gọi `t()` là lỗi biên dịch.
   */
  it('đầu câu không còn chip phân loại nào', () => {
    batDau(BA_CAU);
    const chu = document.body.textContent ?? '';
    expect(chu).not.toMatch(/\bD[1-5] · /);
    for (const nhan of ['Ngộ nhận có ghi chép', 'Quy định hoặc chuẩn ngành', 'Tự tính lại được'])
      expect(chu).not.toContain(nhan);
  });

  it('chữ của link là đường dẫn rút gọn, `title` giữ đường dẫn đầy đủ', () => {
    batDau(BA_CAU);
    traLoiDung();

    const link = screen.getByRole('link', { name: 'vi.dụ/Q001' });
    expect(link.getAttribute('title')).toBe('https://vi.dụ/Q001');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('câu bác ngộ nhận thì hộp giải thích hỏi "vì sao"', () => {
    batDau(BA_CAU);
    traLoiDung();
    expect(screen.getByText(t('quiz.whyRight'))).toBeTruthy();
  });

  /*
   * Câu dựa trên quy định không có "vì sao": tiêu đề hộp là "Quy định hiện hành" dù đúng hay sai.
   * Đúng/sai vẫn nói bằng badge ở lựa chọn, nên ca này kiểm cả hai để chắc badge không mất.
   */
  it('câu dựa trên quy định thì hộp mang tiêu đề "Quy định hiện hành", đúng hay sai đều vậy', () => {
    const quyDinh: QuizItem = { ...cau('Q001'), evidence: 'quy-dinh' };
    render(<QuizBody formulaId="pe" items={[quyDinh, { ...cau('Q002'), evidence: 'quy-dinh' }]} />);
    fireEvent.click(screen.getByRole('button'));

    traLoiDung();
    expect(screen.getByText(t('quiz.rule'))).toBeTruthy();
    expect(screen.queryByText(t('quiz.whyRight'))).toBeNull();
    expect(screen.getByText(t('quiz.right'))).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: t('quiz.next') }));
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn A/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    expect(screen.getByText(t('quiz.rule'))).toBeTruthy();
    expect(screen.queryByText(t('quiz.whyWrong'))).toBeNull();
    expect(screen.getByText(t('quiz.wrong'))).toBeTruthy();
  });
});

/*
 * Khối lời giải có cấu trúc (`QuizGiai`), theo thứ tự chủ dự án đặt 25/09/2026: Công thức áp
 * dụng (hình + "để tính …") · Thay số (ký hiệu nào nhận số nào) · Áp vào công thức · Kết quả ·
 * Nguồn. Hình do màn chi tiết dựng sẵn — nút ấy tự mở khung "cách tính" khi rê vào ký hiệu
 * (`QuizFormulaPicture`, kiểm riêng ở `src/app/cong-thuc/[id]/`).
 */
describe('khối lời giải có cấu trúc — QuizGiai', () => {
  const HINH = <span data-testid="hinh-cong-thuc">P/E = P ÷ EPS</span>;
  const KY_HIEU = [
    {
      latex: 'P',
      html: '<math><mi>P</mi></math>',
      nghia: { vi: 'giá thị trường một cổ phiếu, ₫' },
    },
    { latex: 'EPS', html: '<math><mi>EPS</mi></math>', nghia: { vi: 'lợi nhuận mỗi cổ phiếu, ₫' } },
  ];

  function cauGiai(
    ghiDe?: string,
    gan: ReadonlyArray<{ kyHieu: string; giaTri: { vi: string } }> = [
      { kyHieu: 'P', giaTri: { vi: '36.000' } },
      { kyHieu: 'EPS', giaTri: { vi: '3.000' } },
    ],
  ): QuizItem {
    return {
      ...cau('Q900'),
      giai: {
        tinh: { vi: 'P/E của cổ phiếu' },
        ...(ghiDe === undefined ? {} : { congThuc: { vi: ghiDe } }),
        thaySo: { vi: '36.000 ÷ 3.000' },
        ketQua: { vi: '12,0 lần' },
        ...(ghiDe === undefined ? { gan } : {}),
      },
    };
  }

  function traLoi(item: QuizItem, coHinh: boolean) {
    render(
      <QuizBody
        formulaId="pe"
        items={[item]}
        kyHieu={KY_HIEU}
        {...(coHinh ? { hinhCongThuc: HINH } : {})}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn A/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
  }

  /** Các dòng NGOÀI CÙNG của khối, mỗi dòng một nhãn — không lẫn `<dl>` con của dòng Thay số. */
  const khoi = () => document.querySelector('dl') as HTMLElement;
  const nhanCacDong = () =>
    [...khoi().children].map((dong) => dong.querySelector(':scope > dt')?.textContent);
  const dongCo = (nhan: string) =>
    [...khoi().children].find((dong) => dong.querySelector(':scope > dt')?.textContent === nhan);

  it('năm dòng theo đúng thứ tự: công thức · thay số · áp vào công thức · kết quả · nguồn', () => {
    traLoi(cauGiai(), true);
    expect(nhanCacDong()).toEqual([
      t('quiz.giai.congThuc'),
      t('quiz.giai.thaySo'),
      t('quiz.giai.apVao'),
      t('quiz.giai.ketQua'),
      t('quiz.source'),
    ]);
  });

  it('dòng công thức đặt đúng hình của màn chi tiết, kèm đuôi "để tính …"', () => {
    traLoi(cauGiai(), true);
    const dong = dongCo(t('quiz.giai.congThuc'));
    expect(dong?.contains(screen.getByTestId('hinh-cong-thuc'))).toBe(true);
    expect(dong?.textContent).toContain(t('quiz.giai.deTinh').replace('{x}', 'P/E của cổ phiếu'));
  });

  it('dòng Thay số nói rõ số nào là ký hiệu nào, kèm nghĩa lấy từ bảng ký hiệu', () => {
    traLoi(cauGiai(), true);
    const bang = dongCo(t('quiz.giai.thaySo'))?.querySelector('dl');
    const kyHieu = [...(bang?.querySelectorAll(':scope > dt') ?? [])];
    expect(kyHieu.map((dt) => dt.querySelector('math')?.textContent)).toEqual(['P', 'EPS']);
    const nghia = [...(bang?.querySelectorAll(':scope > dd') ?? [])].map((dd) => dd.textContent);
    expect(nghia[0]).toContain('= 36.000');
    expect(nghia[0]).toContain('giá thị trường một cổ phiếu');
    expect(nghia[1]).toContain('= 3.000');
  });

  /*
   * Ký hiệu nhận nhiều số nói bằng MỘT câu mô tả — chủ dự án 25/09/2026 đọc "C_i = 12.000.000 ·
   * 12.000.000 · 12.000.000 · tiền mua đợt i" và hỏi "tiền mua đợt i nghĩa là gì?". Câu mô tả in
   * liền sau ký hiệu, không dấu "=", và nghĩa tổng quát của bảng ký hiệu thôi không in bên cạnh.
   */
  it('câu mô tả in liền sau ký hiệu và thay luôn nghĩa tổng quát của bảng ký hiệu', () => {
    traLoi(
      {
        ...cauGiai(),
        giai: {
          ...(cauGiai().giai as NonNullable<QuizItem['giai']>),
          gan: [
            { kyHieu: 'P', moTa: { vi: 'là giá lúc mua: lần 1 là 60.000 ₫, lần 2 là 40.000 ₫' } },
            { kyHieu: 'EPS', giaTri: { vi: '3.000' } },
          ],
        },
      },
      true,
    );
    const bang = dongCo(t('quiz.giai.thaySo'))?.querySelector('dl');
    const [moTa, giaTri] = [...(bang?.querySelectorAll(':scope > dd') ?? [])].map(
      (dd) => dd.textContent,
    );
    expect(moTa).toBe('là giá lúc mua: lần 1 là 60.000 ₫, lần 2 là 40.000 ₫');
    expect(moTa).not.toContain('=');
    expect(giaTri).toContain('= 3.000');
    expect(giaTri).toContain('lợi nhuận mỗi cổ phiếu');
  });

  it('cụm \\text{…} không có dòng trong bảng ký hiệu thì in đúng chữ ấy, không kèm nghĩa', () => {
    traLoi(
      cauGiai(undefined, [{ kyHieu: '\\text{Tài sản ngắn hạn}', giaTri: { vi: '110.620' } }]),
      true,
    );
    const bang = dongCo(t('quiz.giai.thaySo'))?.querySelector('dl');
    expect(bang?.querySelector(':scope > dt')?.textContent).toBe('Tài sản ngắn hạn');
    expect(bang?.querySelector(':scope > dd')?.textContent).toBe('= 110.620');
  });

  it('câu ghi đè dòng công thức thì in chữ ghi đè, không đặt hình, không có dòng Thay số', () => {
    traLoi(cauGiai('Khoảng tin cậy = Beta ± 2 × Sai số chuẩn'), true);
    expect(screen.getByText('Khoảng tin cậy = Beta ± 2 × Sai số chuẩn')).toBeTruthy();
    expect(screen.queryByTestId('hinh-cong-thuc')).toBeNull();
    expect(nhanCacDong()).not.toContain(t('quiz.giai.thaySo'));
  });

  it('lời giải có cấu trúc thì thôi in đoạn văn, nhưng câu trích của nguồn vẫn còn', () => {
    traLoi(cauGiai(), true);
    expect(screen.queryByText(/nên đáp án là vậy/)).toBeNull();
    expect(screen.getByText('trích dẫn của Q900').tagName).toBe('Q');
  });

  it('không có hình công thức mà cũng không ghi đè thì lùi về đoạn văn cũ', () => {
    traLoi(cauGiai(), false);
    expect(document.querySelector('dl')).toBeNull();
    expect(screen.getByText(/nên đáp án là vậy/)).toBeTruthy();
  });
});

describe('lối ra giữa bài — WF-19 · S2', () => {
  it('nút Thoát có cả ở bài ngắn, nơi không dựng thanh tiến độ', () => {
    batDau([cau('Q001')]);
    expect(screen.getByRole('button', { name: t('quiz.exit') })).toBeTruthy();
  });

  it('thoát thì về trạng thái nghỉ và xoá tiến trình dở, không ghi gì xuống kho', () => {
    const onFinish = vi.fn();
    batDau(BA_CAU, onFinish);

    // Trả lời đúng câu 1 rồi thoát giữa chừng.
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.exit') }));

    expect(onFinish).not.toHaveBeenCalled();
    // Về màn nghỉ: nút bắt đầu quay lại, câu hỏi biến mất.
    expect(screen.getByRole('button', { name: t('quiz.start') })).toBeTruthy();
    expect(screen.queryByRole('radio')).toBeNull();

    // Bắt đầu lại là làm lại từ đầu, không giữ điểm cũ.
    fireEvent.click(screen.getByRole('button', { name: t('quiz.start') }));
    expect(screen.getByText(viTri(1, 3))).toBeTruthy();
  });

  /*
   * Bộ BA câu, và cố ý để lọt một câu đúng: lượt ôn khi ấy chỉ có hai câu — dưới ngưỡng thanh
   * tiến độ — nên nếu `exit()` quên trả `queue` về cả bộ, màn nghỉ sẽ bày nút "Làm thử" của bài
   * ngắn thay vì "Bắt đầu kiểm tra". Sai cả bài thì tập con BẰNG cả bài và ca kiểm mù.
   */
  it('thoát khỏi lượt ôn lại thì lần bắt đầu sau là CẢ bài, không phải tập con', () => {
    batDau(BA_CAU);

    // Câu 1 đúng, câu 2 và 3 sai → lượt ôn có 2 câu.
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.next') }));
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn A/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.next') }));
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn A/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.seeResult') }));

    fireEvent.click(screen.getByRole('button', { name: t('quiz.reviewWrong') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.exit') }));

    // `queue` đã về cả bộ câu: nút mang nhãn bài dài, và bài chạy lại từ 1 / 3.
    fireEvent.click(screen.getByRole('button', { name: t('quiz.start') }));
    expect(screen.getByText(viTri(1, 3))).toBeTruthy();
  });
});

describe('bỏ qua câu — WF-19 · S2', () => {
  it('bỏ qua thì sang câu sau mà không cần chọn đáp án', () => {
    batDau(BA_CAU);
    expect(screen.getByText(viTri(1, 3))).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: t('quiz.skip') }));
    expect(screen.getByText(viTri(2, 3))).toBeTruthy();
  });

  /*
   * `skip()` vừa ghi thêm mã sai vừa đóng lượt trong CÙNG một lượt bấm. Đọc `wrongIds` từ closure
   * cũ ở đây là mất đúng câu cuối — ca này gác chỗ ấy.
   */
  it('bỏ qua đúng câu CUỐI thì mã câu vẫn vào kết quả ghi xuống kho', () => {
    const onFinish = vi.fn();
    render(<QuizBody formulaId="pe" items={[cau('Q001'), cau('Q002')]} onFinish={onFinish} />);
    fireEvent.click(screen.getByRole('button'));

    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.next') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.skip') }));

    expect(onFinish).toHaveBeenCalledWith({ right: 1, total: 2, wrong: ['Q002'] });
  });

  it('câu bỏ qua đánh dấu khác câu trả lời sai, và có dòng giải nghĩa dấu ấy', () => {
    const { container } = render(<QuizBody formulaId="pe" items={[cau('Q001'), cau('Q002')]} />);
    fireEvent.click(screen.getByRole('button'));

    // Câu 1 trả lời SAI, câu 2 BỎ QUA.
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn A/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.next') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.skip') }));

    const marks = [...container.querySelectorAll('li span:first-child')].map((n) => n.textContent);
    expect(marks).toEqual(['✕', '?']);
    expect(screen.getByText(t('quiz.skippedNote'))).toBeTruthy();
  });

  it('không bỏ qua câu nào thì không có dòng giải nghĩa', () => {
    batDau([cau('Q001')]);
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.seeResult') }));

    expect(screen.queryByText(t('quiz.skippedNote'))).toBeNull();
  });

  it('câu bỏ qua vào được lượt "Ôn lại câu sai"', () => {
    batDau([cau('Q001')]);
    fireEvent.click(screen.getByRole('button', { name: t('quiz.skip') }));

    fireEvent.click(screen.getByRole('button', { name: t('quiz.reviewWrong') }));
    expect(screen.getByText('Đề bài Q001')).toBeTruthy();
  });
});

/*
 * `id` của khối phải TẤT ĐỊNH.
 *
 * Khối nằm sau ranh giới `next/dynamic` của `QuizPanel`, chỗ mà `useId()` sinh chuỗi lệch nhau
 * giữa lần dựng HTML tĩnh và lần hydrate — cùng lớp lỗi đã đo được ở cây biểu đồ (5 cảnh báo mỗi
 * trang). Và `<h2>` dưới đây có mặt trong HTML của CẢ 110 trang có câu hỏi, kể cả khi người dùng
 * chưa bấm bắt đầu, nên id lệch là lệch trên toàn bộ.
 *
 * Soi id đã dựng ra chứ không grep mã nguồn: chính dòng chú thích trong `QuizBody` cũng chứa chữ
 * `useId` — cùng lý do ca kiểm của `charts` đã ghi.
 */
describe('id của khối — tất định, không do React sinh', () => {
  /** Hình dạng id React tự sinh: `:r3:` ở React 18, `«r3»` ở bản dựng sẵn phía máy chủ. */
  const ID_CUA_REACT = /^[:«]/;

  it('tiêu đề mang id ghép từ mã công thức, và section trỏ đúng vào đó', () => {
    const { container } = render(<QuizBody formulaId="pe" items={BA_CAU} />);

    const section = container.querySelector('section');
    const title = container.querySelector('h2');

    expect(title?.id).toBe('quiz-pe-title');
    expect(section?.getAttribute('aria-labelledby')).toBe('quiz-pe-title');
    expect(ID_CUA_REACT.test(title?.id ?? '')).toBe(false);
  });

  it('nhóm radio của từng câu cũng ghép từ mã công thức', () => {
    const { container } = render(<QuizBody formulaId="ty-so-sharpe" items={BA_CAU} />);
    fireEvent.click(screen.getByRole('button'));

    const radio = container.querySelector('input[type="radio"]');
    expect(radio?.getAttribute('name')).toBe('quiz-ty-so-sharpe-Q001');
  });
});

/**
 * Dải câu đã làm — 24/09/2026.
 *
 * Chủ dự án: "Mỗi khi xong 1 câu thì dù sai hay đúng thì bên trên cần có bản thu nhỏ của câu hỏi
 * và nó nằm ở ngay trên câu hỏi mới, người dùng có thể click vào màn thu nhỏ đó để xem lại câu
 * cũ." Trước đó bấm "Câu tiếp" là mất hẳn câu vừa đọc.
 *
 * Ba thứ ca kiểm này giữ: dải nằm TRƯỚC câu đang hỏi trong DOM (không phải chỉ trước về mặt
 * CSS), mở ra thì thấy đúng lời giải của câu cũ, và câu cũ không thao tác được nữa — nó là bản
 * ghi, không phải chỗ làm lại.
 */
describe('dải câu đã làm — 24/09/2026', () => {
  /** Trả lời đúng câu đang hỏi rồi sang câu sau. */
  function xongMotCau() {
    fireEvent.click(screen.getByRole('radio', { name: /Lựa chọn B/ }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.check') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.next') }));
  }

  it('câu đầu tiên chưa có dải nào phía trên', () => {
    batDau(BA_CAU);
    expect(screen.queryByRole('button', { name: /Đề bài Q001/ })).toBeNull();
  });

  it('xong một câu thì câu ấy co lại thành một dòng nằm TRÊN câu mới', () => {
    batDau(BA_CAU);
    xongMotCau();

    const thuNho = screen.getByRole('button', { name: /Đề bài Q001/ });
    const cauMoi = screen.getByText('Đề bài Q002');
    /* `DOCUMENT_POSITION_FOLLOWING` = câu mới đứng SAU dòng thu nhỏ trong cây tài liệu. */
    expect(thuNho.compareDocumentPosition(cauMoi) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('dải dài thêm sau mỗi câu, giữ đúng thứ tự đã làm', () => {
    batDau(BA_CAU);
    xongMotCau();
    xongMotCau();

    expect(screen.getByRole('button', { name: /Đề bài Q001/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Đề bài Q002/ })).toBeTruthy();
    expect(screen.getByText('Đề bài Q003')).toBeTruthy();
  });

  it('bấm vào dòng thu nhỏ thì mở lại nguyên câu cũ kèm lời giải', () => {
    batDau(BA_CAU);
    xongMotCau();

    const thuNho = screen.getByRole('button', { name: /Đề bài Q001/ });
    expect(thuNho.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText(/trích dẫn của Q001/)).toBeNull();

    fireEvent.click(thuNho);
    expect(thuNho.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/trích dẫn của Q001/)).toBeTruthy();
  });

  it('câu cũ mở ra thì khoá hết, không làm lại được', () => {
    const { container } = render(<QuizBody formulaId="pe" items={BA_CAU} />);
    fireEvent.click(screen.getByRole('button'));
    xongMotCau();
    fireEvent.click(screen.getByRole('button', { name: /Đề bài Q001/ }));

    const cu = container.querySelectorAll<HTMLInputElement>('input[name="quiz-pe-ls-Q001"]');
    expect(cu.length).toBe(4);
    for (const radio of cu) expect(radio.disabled).toBe(true);
  });

  /*
   * Mở một câu tại một thời điểm. Mở nhiều câu cùng lúc thì câu đang hỏi bị đẩy khỏi màn — đúng
   * thứ dải này sinh ra để tránh.
   */
  it('mở câu thứ hai thì câu thứ nhất tự đóng lại', () => {
    batDau(BA_CAU);
    xongMotCau();
    xongMotCau();

    fireEvent.click(screen.getByRole('button', { name: /Đề bài Q001/ }));
    fireEvent.click(screen.getByRole('button', { name: /Đề bài Q002/ }));

    expect(screen.getByRole('button', { name: /Đề bài Q001/ }).getAttribute('aria-expanded')).toBe(
      'false',
    );
    expect(screen.queryByText(/trích dẫn của Q001/)).toBeNull();
    expect(screen.getByText(/trích dẫn của Q002/)).toBeTruthy();
  });

  it('câu bỏ qua cũng vào dải, mang dấu khác câu trả lời sai', () => {
    batDau(BA_CAU);
    fireEvent.click(screen.getByRole('button', { name: t('quiz.skip') }));

    const thuNho = screen.getByRole('button', { name: /Đề bài Q001/ });
    expect(thuNho.textContent).toContain('?');
    expect(thuNho.textContent).not.toContain('✕');
  });

  it('thoát giữa bài thì dải xoá theo', () => {
    batDau(BA_CAU);
    xongMotCau();
    fireEvent.click(screen.getByRole('button', { name: t('quiz.exit') }));
    fireEvent.click(screen.getByRole('button', { name: t('quiz.start') }));

    expect(screen.queryByRole('button', { name: /Đề bài Q001/ })).toBeNull();
  });
});

/**
 * Hàng nút và lưới đáp án, sắp lại ngày 24/09/2026 theo chỉ đạo của chủ dự án.
 */
describe('sắp xếp lại hàng nút và lưới đáp án — 24/09/2026', () => {
  /*
   * Hàng nút KHÔNG còn dòng chữ nào. Trước đó có "Chọn một đáp án để mở nút Kiểm tra" — chủ dự án
   * bỏ ("xóa luôn text thừa") vì nút xám và không bấm được đã nói đúng điều ấy. Ca này gác việc
   * hàng nút chỉ còn đúng hai nút, để dòng chữ kia không lặng lẽ quay lại.
   */
  it('hàng nút chỉ có hai nút, không kèm dòng chữ nào', () => {
    const { container } = render(<QuizBody formulaId="pe" items={BA_CAU} />);
    fireEvent.click(screen.getByRole('button'));

    const hangNut = [...container.querySelectorAll('div')].find((el) =>
      [...el.children].some(
        (con) => con.tagName === 'BUTTON' && /Kiểm tra/.test(con.textContent ?? ''),
      ),
    );
    expect(hangNut).toBeTruthy();
    expect(hangNut?.querySelector('p')).toBeNull();
    expect(hangNut?.querySelectorAll('button').length).toBe(2);
  });

  /*
   * Hai nút đứng cạnh nhau. Bản sáng cùng ngày đẩy "Bỏ qua câu này" sang mép phải bằng
   * `margin-left: auto`; ở khổ rộng chúng cách nhau gần cả bề ngang thẻ và thôi đọc ra là một cặp.
   * jsdom không dàn trang nên ca này gác Ở TẦNG DOM: không nút nào trong hàng được mang lớp đẩy.
   */
  it('không nút nào trong hàng bị đẩy sang mép đối diện', () => {
    const { container } = render(<QuizBody formulaId="pe" items={BA_CAU} />);
    fireEvent.click(screen.getByRole('button'));

    const boQua = screen.getByRole('button', { name: t('quiz.skip') });
    const kiemTra = screen.getByRole('button', { name: t('quiz.check') });
    expect(boQua.parentElement).toBe(kiemTra.parentElement);
    expect(boQua.className).toBe(
      [...container.querySelectorAll('button')]
        .filter((b) => b.textContent === t('quiz.skip'))
        .map((b) => b.className)[0],
    );
    // Nút Bỏ qua dùng đúng lớp của Button, không thêm lớp riêng nào của khối câu hỏi.
    expect(boQua.className).not.toMatch(/skip/i);
  });

  /*
   * Hai cột ở khổ PC quyết định bằng ĐỘ DÀI ĐÁP ÁN, đo lúc dựng. Đo bằng JS lúc chạy thì lượt
   * dựng đầu tiên trên trình duyệt sẽ khác HTML tĩnh — xem `khoHaiCot()` ở `QuizQuestion`.
   *
   * Thuộc tính mang TÊN KHỔ MÀN nhỏ nhất còn xếp hai cột được, nên ca này phải chạm cả BA bậc.
   * Bỏ sót bậc giữa chính là chỗ hỏng chủ dự án báo ngày 24/09/2026: mọi đáp án dài hơn 48 ký
   * tự đều rơi thẳng về một cột, kể cả khi màn còn thừa gần một nửa chỗ.
   */
  const doiDapAnA = (loi: string): QuizItem => {
    const goc = cau('Q201');
    /* `cau()` trả về kiểu hợp; hẹp lại trước khi chạm `choices` — `QuizDienSo` không có trường ấy. */
    if (goc.format !== 'trac-nghiem') throw new Error('cau() phải trả về câu trắc nghiệm');
    return { ...goc, choices: { ...goc.choices, a: { vi: loi } } };
  };
  const khoCua = (c: HTMLElement) =>
    c.querySelector('[data-hai-cot]')?.getAttribute('data-hai-cot');

  it('độ dài đáp án quyết định khổ màn nhỏ nhất còn xếp hai cột', () => {
    const { container } = render(<QuizBody formulaId="pe" items={BA_CAU} />);
    fireEvent.click(screen.getByRole('button'));
    expect(khoCua(container)).toBe('1024');

    cleanup();

    /* 62 ký tự: quá 55 nên khổ 1024 không đủ, nhưng dưới 78 nên từ 1280 là hai cột. */
    const vua = doiDapAnA('Giảm sai lầm loại 1 nhưng tăng sai lầm loại 2, tức bỏ lỡ cơ hội');
    const giua = render(<QuizBody formulaId="pe" items={[vua]} />);
    fireEvent.click(screen.getByRole('button'));
    expect(khoCua(giua.container)).toBe('1280');

    cleanup();

    const dai = doiDapAnA(
      'Một lựa chọn dài tới mức không thể nào nằm gọn trong nửa bề ngang của thẻ dù màn hình có rộng tới đâu',
    );
    const sau = render(<QuizBody formulaId="pe" items={[dai]} />);
    fireEvent.click(screen.getByRole('button'));
    expect(khoCua(sau.container)).toBe('0');
  });
});
