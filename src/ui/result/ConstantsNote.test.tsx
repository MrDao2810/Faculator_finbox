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

import { cleanup, render, screen } from '@testing-library/react';
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
