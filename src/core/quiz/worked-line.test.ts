import { describe, expect, it } from 'vitest';

import {
  arithmeticOf,
  blankAccepts,
  blanksOf,
  chieuCao,
  evaluateWorked,
  labelOf,
  parseWorked,
  workedProblems,
  workedShape,
} from './worked-line';

/**
 * Luật cấu trúc và bộ tính lại của dòng công thức trong câu điền số.
 *
 * Ca kiểm ở đây gác chính BỘ MÁY, không gác nội dung câu hỏi: nếu nó đọc sai một con số viết theo
 * quy ước Việt hay sai thứ tự phép tính thì cửa gác trong `quiz.test.ts` sẽ báo đỏ nhầm chỗ, hoặc
 * tệ hơn là xanh nhầm — và lúc ấy một dòng công thức sai vẫn lọt ra màn.
 */

describe('cấu trúc dòng công thức', () => {
  it('đạt khi có ô trống, có dấu = và bóc ngoặc ra thì tính được', () => {
    expect(workedProblems('P/E = [64.000] ÷ [4.000]')).toEqual([]);
  });

  it('không có ô trống nào thì báo lỗi — không có gì cho người học làm', () => {
    expect(workedProblems('P/E = 64.000 ÷ 4.000')).toContain('không có ô trống nào');
  });

  it('ngoặc vuông lệch thì báo lỗi', () => {
    expect(workedProblems('P/E = [64.000 ÷ [4.000]')).toContain(
      'ngoặc vuông lệch: 2 dấu mở, 1 dấu đóng',
    );
  });

  it('ô trống bọc chữ chứ không bọc số thì báo lỗi', () => {
    expect(workedProblems('P/E = [giá] ÷ [4.000]')).toContain(
      "ô trống 'giá' không phải một con số",
    );
  });

  it('không có dấu = thì báo lỗi', () => {
    expect(workedProblems('P/E rồi [4]')).toContain('thiếu dấu =');
  });

  it('hai dấu = thì báo lỗi — hình cũ kết thúc bằng "= ___" phải bị chặn', () => {
    expect(workedProblems('P/E = [64.000] ÷ [4.000] = ___')).toContain('có nhiều hơn một dấu =');
  });

  it('thiếu tên đại lượng trước dấu = thì báo lỗi', () => {
    expect(workedProblems(' = [4] ÷ [2]')).toContain('thiếu tên đại lượng trước dấu =');
  });

  /*
   * Luật MỚI so với hình cũ: dòng viết bằng lời không còn được chấp nhận. Ba câu từng viết bằng
   * lời (Q244, Q248, Q329) đã chuyển sang ô trống, nên danh sách ngoại lệ bị bỏ — xem docblock
   * `worked-line.ts`.
   */
  it('dòng có chữ xen vào thì báo lỗi vì không vẽ được', () => {
    expect(workedProblems('MDD = ([400] − Đáy ngay sau đỉnh) ÷ [400] × 100')).toContain(
      'không phân tích được thành phép tính',
    );
  });
});

describe('cắt dòng', () => {
  it('tên đại lượng là phần trước dấu = đầu tiên', () => {
    expect(labelOf('Beta điều chỉnh = [0,67] × 1')).toBe('Beta điều chỉnh');
  });

  it('đoạn số học đã bóc hết ngoặc vuông', () => {
    expect(arithmeticOf('P/E = [64.000] ÷ [4.000]')).toBe('64.000 ÷ 4.000');
  });

  it('đáp án từng ô lấy theo thứ tự trái sang phải', () => {
    expect(blanksOf('Beta điều chỉnh = [0,67] × [1,50] + [0,33] × 1')).toEqual([
      '0,67',
      '1,50',
      '0,33',
    ]);
  });
});

describe('bộ tính', () => {
  it('đọc số theo quy ước Việt: chấm ngăn nghìn, phẩy thập phân', () => {
    expect(evaluateWorked('64.000 ÷ 4.000')).toBe(16);
    expect(evaluateWorked('1,5 × 2')).toBe(3);
  });

  it('nhân chia trước cộng trừ', () => {
    expect(evaluateWorked('2 + 3 × 5')).toBe(17);
  });

  it('ngoặc đổi thứ tự', () => {
    expect(evaluateWorked('(2 + 3) × 5')).toBe(25);
  });

  it('trừ liên tiếp kết hợp trái', () => {
    expect(evaluateWorked('10 − 3 − 1')).toBe(6);
  });

  it('luỹ thừa kết hợp phải', () => {
    expect(evaluateWorked('2 ^ 3 ^ 2')).toBe(512);
  });

  it('căn bậc hai, có và không có ngoặc', () => {
    expect(evaluateWorked('√25')).toBe(5);
    expect(evaluateWorked('√(9 + 16)')).toBe(5);
  });

  it('logarit tự nhiên', () => {
    expect(evaluateWorked('ln(1)')).toBe(0);
  });

  it('trị tuyệt đối — dạng VaR nêu mức lỗ bằng số dương', () => {
    expect(evaluateWorked('|−21|')).toBe(21);
    expect(evaluateWorked('|3 − 10|')).toBe(7);
  });

  it('ô trống tính bằng chính đáp án nằm trong ngoặc của nó', () => {
    expect(evaluateWorked('[0,67] × [1,50] + [0,33] × 1')).toBeCloseTo(1.335, 10);
  });

  /* FR-06 áp cả ở đây: không bao giờ trả Infinity hay NaN ra ngoài. */
  it('chia cho 0 trả null chứ không trả Infinity', () => {
    expect(evaluateWorked('5 ÷ 0')).toBeNull();
  });

  it('căn số âm và ln số không dương trả null', () => {
    expect(evaluateWorked('√(0 − 4)')).toBeNull();
    expect(evaluateWorked('ln(0)')).toBeNull();
  });

  it('chữ, dấu %, ngoặc lệch đều trả null — "không đọc được" khác "sai"', () => {
    expect(evaluateWorked('Đỉnh ÷ Đáy')).toBeNull();
    expect(evaluateWorked('30 % 100')).toBeNull();
    expect(evaluateWorked('(2 + 3')).toBeNull();
  });
});

describe('hình dạng trao cho giao diện', () => {
  it('cây phân số giữ nguyên hai vế, không thêm ngoặc — gạch phân đã tách chúng', () => {
    const hinh = workedShape('x = ([2] + [3]) ÷ [5]');
    expect(hinh?.cay.t).toBe('chia');
    if (hinh?.cay.t !== 'chia') return;
    /* Tử số là phép cộng TRẦN: bọc ngoặc quanh nó là vẽ thừa. */
    expect(hinh.cay.a.t).toBe('cong');
  });

  it('nhân với một tổng thì tổng phải được bọc ngoặc', () => {
    const hinh = workedShape('x = ([2] + [3]) × [5]');
    expect(hinh?.cay.t).toBe('nhan');
    if (hinh?.cay.t !== 'nhan') return;
    expect(hinh.cay.a.t).toBe('ngoac');
  });

  it('cộng rồi nhân theo đúng thứ tự thì không sinh ngoặc thừa', () => {
    const hinh = workedShape('x = [2] + [3] × [5]');
    expect(hinh?.cay.t).toBe('cong');
    if (hinh?.cay.t !== 'cong') return;
    expect(hinh.cay.b.t).toBe('nhan');
  });

  it('vế phải của phép trừ giữ ngoặc — a − (b − c) khác a − b − c', () => {
    const hinh = workedShape('x = [10] − ([3] − [1])');
    expect(hinh?.cay.t).toBe('tru');
    if (hinh?.cay.t !== 'tru') return;
    expect(hinh.cay.b.t).toBe('ngoac');
  });

  it('ô trống mang thứ tự để giao diện nối đúng ô người dùng gõ', () => {
    const hinh = workedShape('x = [7] ÷ [2]');
    expect(hinh?.dapAn).toEqual(['7', '2']);
    if (hinh?.cay.t !== 'chia') return;
    expect(hinh.cay.a).toEqual({ t: 'o', thuTu: 0, dap: '7' });
    expect(hinh.cay.b).toEqual({ t: 'o', thuTu: 1, dap: '2' });
  });

  /*
   * Chiều cao là thứ CSS kéo dãn dấu ngoặc và dấu căn theo. Đo trên cây chứ không đo lúc chạy —
   * xem docblock `chieuCao`.
   */
  it('phân số cao gấp đôi, phân số lồng thì cao hơn nữa', () => {
    const phang = parseWorked('1 + 2');
    const phanSo = parseWorked('1 ÷ 2');
    const long = parseWorked('(1 ÷ 2) ÷ 3');
    expect(phang === null ? 0 : chieuCao(phang)).toBe(1);
    expect(phanSo === null ? 0 : chieuCao(phanSo)).toBe(2);
    expect(long === null ? 0 : chieuCao(long)).toBe(3);
  });

  it('dòng không vẽ được trả null', () => {
    expect(workedShape('MDD = Đỉnh ÷ Đáy')).toBeNull();
    expect(workedShape('Độ lệch chuẩn của chuỗi')).toBeNull();
  });
});

describe('chấm từng ô', () => {
  it('so bằng GIÁ TRỊ nên 1,50 và 1,5 đều đúng', () => {
    expect(blankAccepts('1,50', 1.5)).toBe(true);
    expect(blankAccepts('1,5', 1.5)).toBe(true);
  });

  it('số ngăn nghìn đọc đúng', () => {
    expect(blankAccepts('64.000', 64000)).toBe(true);
    expect(blankAccepts('64.000', 64)).toBe(false);
  });

  it('số âm đọc được cả dấu trừ thật lẫn gạch nối', () => {
    expect(blankAccepts('−21', -21)).toBe(true);
    expect(blankAccepts('-21', -21)).toBe(true);
    expect(blankAccepts('−21', 21)).toBe(false);
  });

  /* Không có dung sai: đây là phép chép số liệu, không phải phép tính. */
  it('lệch một chút cũng là sai — chỉ bỏ qua hạt bụi dấu phẩy động', () => {
    expect(blankAccepts('1,5', 1.51)).toBe(false);
    expect(blankAccepts('0,3', 0.1 + 0.2)).toBe(true);
  });

  it('giá trị không hữu hạn là sai, không bao giờ là đúng (FR-06)', () => {
    expect(blankAccepts('1', Number.NaN)).toBe(false);
    expect(blankAccepts('1', Number.POSITIVE_INFINITY)).toBe(false);
  });
});
