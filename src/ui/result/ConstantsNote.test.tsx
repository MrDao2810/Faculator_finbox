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
  label: 'Phí môi giới lệnh mua',
  value: 0.15,
  unit: '%',
  effectiveFrom: '2022-01-01',
  legalBasis: 'Thông tư 102/2021/TT-BTC — mức trần phí môi giới 0,45% giá trị giao dịch',
};

const PHI_LUU_KY: TypedMarketConstant = {
  key: 'fee.custody',
  label: 'Phí lưu ký',
  value: 0.27,
  unit: '₫/CP/tháng',
  effectiveFrom: '2022-01-01',
  legalBasis: 'Biểu giá kèm Thông tư 101/2021/TT-BTC',
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

  it('bản ghi THẬT trong MARKET_CONFIG hiện đúng, không chỉ bản ghi dựng trong test', () => {
    const bieuPhi = scheduleOrDefault(MARKET_CONFIG);
    if (bieuPhi === undefined) throw new Error('không dựng được biểu phí mặc định');

    // Đi qua resolveConstant chứ không đọc thẳng mảng: cùng một khoá có nhiều bản ghi theo thời
    // gian, và đây đúng là hàm mà màn chi tiết dùng để chọn bản đang hiệu lực.
    const that = resolveConstant(bieuPhi, 'tax.transfer.sell', '2026-08-04');
    if (that === undefined) throw new Error('không tra được thuế chuyển nhượng');

    render(<ConstantsNote constants={[that]} />);

    expect(screen.getByText('0,1 %')).toBeTruthy();
    expect(screen.getByText(that.label)).toBeTruthy();
  });
});
