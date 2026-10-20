// @vitest-environment jsdom

/**
 * Khối hằng số thuế & phí — gói hằng số.
 *
 * Ca kiểm ở đây khoá đúng ba mảnh mà khối này sinh ra để bày: trị số, ngày hiệu lực và căn cứ
 * pháp lý. Thiếu bất kỳ mảnh nào thì khối vẫn "có hiện" nhưng không còn trả lời được câu hỏi
 * mà nó sinh ra để trả lời — con số trên màn đang tính theo mức nào, từ bao giờ, theo văn bản
 * nào — nên cả ba đều là ca riêng chứ không gộp thành một phép kiểm "có render".
 *
 * Ca cuối là ca đắt nhất: nó lấy bản ghi THẬT trong `MARKET_CONFIG` chứ không dựng bản ghi giả,
 * để nếu một ngày quy ước CON-05 đổi (0,15 nghĩa là 0,15%) thì chỗ này đỏ chứ không âm thầm in
 * "0,0015 %" ra màn.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { MARKET_CONFIG, resolveConstant, scheduleOrDefault } from '@/application';
import type { TypedMarketConstant } from '@/application';

import { ConstantsNote } from './ConstantsNote';

afterEach(cleanup);

const PHI_MOI_GIOI: TypedMarketConstant = {
  key: 'fee.brokerage.buy',
  label: { vi: 'Phí môi giới lệnh mua', en: 'Buy order brokerage fee' },
  value: 0.15,
  unit: '%',
  effectiveFrom: '2022-01-01',
  legalBasis: {
    vi: 'Thông tư 102/2021/TT-BTC — mức trần phí môi giới 0,45% giá trị giao dịch',
    en: 'Circular 102/2021/TT-BTC — brokerage fee cap of 0.45% of transaction value',
  },
  // Cùng câu mà bản ghi thật trong `schedules.ts` mang — xem ca kiểm về ghi chú ở cuối file.
  note: {
    vi: 'Mức phổ biến trên thị trường, không phải mức luật định.',
    en: 'A common market rate, not a statutory rate.',
  },
};

const PHI_LUU_KY: TypedMarketConstant = {
  key: 'fee.custody',
  label: { vi: 'Phí lưu ký', en: 'Custody fee' },
  value: 0.27,
  unit: '₫/CP/tháng',
  effectiveFrom: '2022-01-01',
  legalBasis: {
    vi: 'Biểu giá kèm Thông tư 101/2021/TT-BTC',
    en: 'Fee schedule attached to Circular 101/2021/TT-BTC',
  },
};

describe('ConstantsNote', () => {
  it('không có hằng số nào thì không dựng gì — 95 trang không tra hằng số phải sạch DOM', () => {
    const { container } = render(<ConstantsNote constants={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('bày trị số kèm đơn vị theo quy ước Việt Nam', () => {
    render(<ConstantsNote constants={[PHI_MOI_GIOI]} />);

    expect(screen.getByText('Phí môi giới lệnh mua')).toBeTruthy();
    // 0,15 chứ không phải 0.15 — CON-05, và phần trăm giữ nguyên dạng người đọc thấy trên văn bản.
    expect(screen.getByText('0,15 %')).toBeTruthy();
  });

  it('bày ngày hiệu lực dạng ngày/tháng/năm, vì mức phí thay đổi theo thời gian', () => {
    render(<ConstantsNote constants={[PHI_MOI_GIOI]} />);
    expect(screen.getByText(/01\/01\/2022/)).toBeTruthy();
  });

  it('bày căn cứ pháp lý — LDR-03 bắt bản ghi phải có thì màn hình phải cho thấy', () => {
    render(<ConstantsNote constants={[PHI_MOI_GIOI]} />);
    expect(screen.getByText(/Thông tư 102\/2021\/TT-BTC/)).toBeTruthy();
  });

  it('không làm tròn mất một mức phí lẻ: 0,27 ₫/CP/tháng phải ra đủ', () => {
    render(<ConstantsNote constants={[PHI_LUU_KY]} />);
    expect(screen.getByText('0,27 ₫/CP/tháng')).toBeTruthy();
  });

  it('nhiều hằng số thì mỗi cái một dòng — gia-hoa-von tra tới bốn mức', () => {
    render(<ConstantsNote constants={[PHI_MOI_GIOI, PHI_LUU_KY]} />);
    expect(screen.getAllByRole('term')).toHaveLength(2);
  });

  /*
   * Ghi chú của bản ghi là câu ĐÍNH CHÍNH, không phải chữ trang trí: 0,15% là mức phổ biến trên
   * thị trường (thực tế 0,1%–0,35%), mà nó in ra ngay cạnh dòng "Thông tư 102/2021/TT-BTC" vốn
   * chỉ đặt TRẦN 0,45%. Ghép hai mảnh ấy lại mà thiếu câu này thì người đọc kết luận 0,15% là
   * con số luật định — và câu ấy đã nằm sẵn trong `schedules.ts` từ đầu, chỉ là không ai in.
   */
  it('bày ghi chú của bản ghi — nếu không, mức phổ biến đọc lên như mức luật định', () => {
    render(<ConstantsNote constants={[PHI_MOI_GIOI]} />);
    expect(screen.getByText(/không phải mức luật định/)).toBeTruthy();
  });

  it('bản ghi không có ghi chú thì không mọc thêm dòng trống', () => {
    const khongGhiChu: TypedMarketConstant = { ...PHI_MOI_GIOI };
    delete (khongGhiChu as { note?: unknown }).note;

    const { container } = render(<ConstantsNote constants={[khongGhiChu]} />);

    expect(screen.queryByText(/không phải mức luật định/)).toBeNull();
    // Ba mảnh còn lại: trị số, ngày hiệu lực, căn cứ pháp lý.
    expect(container.querySelectorAll('dd > span')).toHaveLength(3);
  });

  it('bản ghi THẬT trong MARKET_CONFIG hiện đúng, không chỉ bản ghi dựng trong test', () => {
    const bieuPhi = scheduleOrDefault(MARKET_CONFIG);
    if (bieuPhi === undefined) throw new Error('không dựng được biểu phí mặc định');

    // Đi qua resolveConstant chứ không đọc thẳng mảng: cùng một khoá có nhiều bản ghi theo thời
    // gian, và đây đúng là hàm mà màn chi tiết dùng để chọn bản đang hiệu lực.
    const that = resolveConstant(bieuPhi, 'tax.transfer.sell', '2026-08-04');
    if (that === undefined) throw new Error('không tra được thuế chuyển nhượng');

    render(<ConstantsNote constants={[that]} />);

    expect(screen.getByText('0,1 %')).toBeTruthy();
    expect(screen.getByText(that.label.vi)).toBeTruthy();
  });

  /*
   * `compact` — khối đang đứng trong THẺ GỘP ở khổ PC, nên bày hai cột từ 1280px (02/10/2026).
   *
   * Hai cột là chuyện của CSS, mà jsdom không chạy CSS Module; thứ test này kiểm được là điều
   * kiện CẦN để luật CSS ấy với tới được — lớp `compact` có mặt trên thẻ gốc, và CHỈ khi được
   * yêu cầu. Đó cũng đúng là nửa dễ hỏng: một prop quên nối dây thì không có gì báo, khối vẫn
   * dựng ra đủ chữ và mọi ca kiểm khác vẫn xanh.
   *
   * Bề ngang thật thì đã đo bằng Chrome ở 1440 (xem TASK.md 02/10/2026): 4 hằng số 376 → 253px,
   * còn công thức một hằng số không đổi một pixel nhờ luật `.row:only-child`.
   */
  it('không truyền compact thì thẻ gốc chỉ mang một lớp — khuôn hai cột không với tới', () => {
    const { container } = render(<ConstantsNote constants={[PHI_MOI_GIOI, PHI_LUU_KY]} />);
    const khoi = container.querySelector('section');

    expect(khoi).not.toBeNull();
    expect(khoi?.className.split(' ').filter(Boolean)).toHaveLength(1);
  });

  it('truyền compact thì thẻ gốc mang thêm đúng một lớp nữa', () => {
    const { container } = render(<ConstantsNote constants={[PHI_MOI_GIOI, PHI_LUU_KY]} compact />);
    const khoi = container.querySelector('section');

    expect(khoi).not.toBeNull();
    expect(khoi?.className.split(' ').filter(Boolean)).toHaveLength(2);

    // Và không đụng gì tới nội dung: hai hằng số vẫn là hai hàng, đủ chữ như bản thường.
    expect(container.querySelectorAll('dl > div')).toHaveLength(2);
    expect(screen.getByText(PHI_LUU_KY.label.vi)).toBeTruthy();
  });
});

/*
 * Thứ bậc chữ trong một mức (13/10/2026). Chủ dự án khoanh bốn tên mức và ba dòng ghi chú: *"nếu nó
 * là đề mục thì tại sao lại nhỏ hơn hoặc nhỏ bằng phần nội dung bên dưới? và màu của nó ko đủ nổi
 * bật?"*. Bản cũ để tên mức 12px mờ, còn ghi chú 12px lại sáng nhất và đứng ngay trên tên mức kế
 * tiếp, nên không ai phân biệt được dòng nào là đề mục.
 *
 * jsdom không áp CSS Module nên đọc thẳng file, cùng lối `SearchBox.test.tsx`. Hình thật đã đo bằng
 * Chrome ở 1440 và 360 (TASK.md 13/10/2026).
 */
describe('ConstantsNote — tên mức là đề mục, ghi chú là lời bên lề', () => {
  // `process.cwd()` chứ không `import.meta.url`: ở môi trường jsdom đó không phải một URL `file:`.
  const css = readFileSync(
    join(process.cwd(), 'src/ui/result/ConstantsNote.module.css'),
    'utf8',
  ).replace(/\/\*[\s\S]*?\*\//g, '');

  /** Thân luật của một lớp ở tầng ngoài cùng — không lấy luật nằm trong `@media`. */
  function luat(lop: string): string {
    const khop = new RegExp(`^\\.${lop}\\s*\\{([^}]*)\\}`, 'm').exec(css);
    if (khop === null) throw new Error(`không tìm thấy luật .${lop}`);
    return khop[1] ?? '';
  }

  it('tên mức to, đậm và sáng nhất hàng — không dòng nào bên dưới vượt nó', () => {
    const ten = luat('label');

    expect(ten).toMatch(/font-size:\s*var\(--text-sm\)/);
    expect(ten).toMatch(/font-weight:\s*var\(--weight-bold\)/);
    expect(ten).toMatch(/color:\s*var\(--color-ink\)/);

    // Trị số cùng cỡ thì phải nhẹ nét hơn; ba dòng còn lại thì nhỏ hơn một bậc.
    expect(luat('amount')).toMatch(/font-size:\s*var\(--text-sm\)/);
    expect(luat('amount')).toMatch(/font-weight:\s*var\(--weight-regular\)/);
    for (const lop of ['since', 'basis', 'note']) {
      expect(luat(lop), lop).toMatch(/font-size:\s*var\(--text-xs\)/);
      expect(luat(lop), lop).not.toMatch(/font-weight/);
    }
  });

  it('ghi chú mang vạch trái, và vẫn khác màu với căn cứ pháp lý', () => {
    expect(luat('note')).toMatch(/border-left:\s*2px solid var\(--color-border-strong\)/);

    // Hai câu nói ngược nhau ("Thông tư …" và "không phải mức luật định") không được cùng màu.
    expect(luat('note')).toMatch(/color:\s*var\(--color-ink\)/);
    expect(luat('basis')).toMatch(/color:\s*var\(--color-muted\)/);
  });
});

/*
 * Nút Thu gọn (20/10/2026, chủ dự án: _"cần có thêm một button text 'Thu gọn' để người dùng có thể bỏ
 * qua đoạn này"_). Mở sẵn — HTML tĩnh là khối đang mở — và một nút làm cả hai chiều: lúc gọn lại
 * khối chỉ còn hàng tiêu đề, nên nút phải nói được cách mở ra.
 */
describe('ConstantsNote — nút Thu gọn', () => {
  it('mở sẵn: nút "Thu gọn" trỏ vào danh sách và báo đang mở', () => {
    render(<ConstantsNote constants={[PHI_MOI_GIOI, PHI_LUU_KY]} />);

    const nut = screen.getByRole('button', { name: 'Thu gọn' });
    expect(nut.getAttribute('aria-expanded')).toBe('true');
    const danhSach = document.getElementById(nut.getAttribute('aria-controls') ?? '');
    expect(danhSach?.tagName).toBe('DL');
    expect(danhSach?.hidden).toBe(false);
  });

  it('bấm thì danh sách ẩn, tiêu đề còn, nút thành "Mở rộng"; bấm lại thì hiện như cũ', async () => {
    render(<ConstantsNote constants={[PHI_MOI_GIOI, PHI_LUU_KY]} />);
    const danhSach = () => document.querySelector('dl');

    await userEvent.click(screen.getByRole('button', { name: 'Thu gọn' }));
    expect(danhSach()?.hidden).toBe(true);
    expect(screen.getByRole('heading', { name: 'Đang tính theo các mức sau' })).not.toBeNull();
    const moRong = screen.getByRole('button', { name: 'Mở rộng' });
    expect(moRong.getAttribute('aria-expanded')).toBe('false');

    await userEvent.click(moRong);
    expect(danhSach()?.hidden).toBe(false);
    expect(screen.getByRole('button', { name: 'Thu gọn' })).not.toBeNull();
  });

  /*
   * `hidden` một mình KHÔNG ẩn được danh sách: `.list` khai `display: flex` (và lưới ở 1280px), thắng
   * `display: none` mặc định của trình duyệt. jsdom không chạy CSS nên ca trên vẫn xanh khi thiếu luật;
   * ca này đọc file.
   */
  it('CSS có luật ẩn danh sách mang hidden, đủ mạnh để thắng cả bản lưới', () => {
    const css = readFileSync(
      join(process.cwd(), 'src/ui/result/ConstantsNote.module.css'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/\.block > \.list\[hidden\]\s*\{\s*display:\s*none;/);
  });
});
