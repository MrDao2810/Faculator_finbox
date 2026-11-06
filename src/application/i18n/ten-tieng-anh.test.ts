import { describe, expect, it } from 'vitest';

import { LIVE_TICKER_META } from '@/data/live-fundamentals.generated';
import { TICKER_NAMES_EN } from '@/data/ticker-names-en.generated';

import { companyName, industryName } from './index';
import { INDUSTRY_NAMES_EN, companyNameEn, industryNameEn } from './ten-tieng-anh';

/*
 * Tên doanh nghiệp và tên ngành ở chế độ EN (05/11/2026): chủ dự án chuyển sang tiếng Anh và thấy
 * "Vàng Bạc Đá quý Phú Nhuận · Bán lẻ" trong "Load a sample dataset". Xem docblock `./ten-tieng-anh.ts`.
 */

const DAU_VIET = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

describe('tên doanh nghiệp tiếng Anh', () => {
  it('bảng sinh không có tên nào mang dấu tiếng Việt, không tên nào rỗng', () => {
    const loi = Object.entries(TICKER_NAMES_EN).filter(
      ([, ten]) => ten.trim() === '' || DAU_VIET.test(ten),
    );
    expect(loi).toEqual([]);
  });

  it('mã có trong bảng lấy tên của bảng; mã ngoài bảng in tên Finbox bỏ dấu, không bao giờ có dấu', () => {
    expect(companyNameEn('PNJ', 'Vàng Bạc Đá quý Phú Nhuận')).toBe('Phu Nhuan Jewelry');
    expect(companyNameEn('pnj', 'Vàng Bạc Đá quý Phú Nhuận')).toBe('Phu Nhuan Jewelry');
    // Mã giả, chưa có trong bảng: bậc cuối của script sinh — bỏ dấu, bỏ tiền tố pháp lý.
    expect(companyNameEn('ZZZ9', 'Công ty Cổ phần Thủy sản Đồng Tháp')).toBe('Thuy san Dong Thap');
    // Tên Finbox vốn không dấu là tên thương hiệu: in nguyên.
    expect(companyNameEn('ZZZ8', 'Sacombank')).toBe('Sacombank');
  });

  it('ở tiếng Việt in nguyên tên Finbox', () => {
    expect(companyName('PNJ', 'Vàng Bạc Đá quý Phú Nhuận', 'vi')).toBe('Vàng Bạc Đá quý Phú Nhuận');
    expect(companyName('PNJ', 'Vàng Bạc Đá quý Phú Nhuận', 'en')).toBe('Phu Nhuan Jewelry');
  });

  it('bốn mã WF-10 và cả kho mã mẫu đều in được không dấu ở tiếng Anh', () => {
    for (const [code, meta] of Object.entries(LIVE_TICKER_META)) {
      expect(DAU_VIET.test(companyName(code, meta.name, 'en')), `${code}: ${meta.name}`).toBe(
        false,
      );
    }
  });
});

describe('tên ngành tiếng Anh', () => {
  it('mọi ngành của kho mã mẫu đều có bản dịch', () => {
    const thieu = Object.values(LIVE_TICKER_META)
      .map((meta) => meta.industry)
      .filter((nganh) => nganh !== '' && industryNameEn(nganh) === undefined);
    expect(thieu).toEqual([]);
  });

  it('bản dịch không mang dấu tiếng Việt, và mọi khoá là tên ngành Finbox có dấu như nguồn', () => {
    for (const [vi, en] of Object.entries(INDUSTRY_NAMES_EN)) {
      expect(DAU_VIET.test(en), `${vi} → ${en}`).toBe(false);
      expect(en.trim()).not.toBe('');
    }
    // Đếm ngày 05/11/2026 trên `/bp/codes`: 80 mục `code === name`, trừ 9 chỉ số và hợp đồng
    // (VNINDEX, VN30, HNX, UPCOM, ILA, bốn mã VN30F) còn 71 tên ngành — bảng phủ đủ cả 71.
    expect(Object.keys(INDUSTRY_NAMES_EN)).toHaveLength(71);
  });

  it('tiếng Việt in nguyên; tiếng Anh thiếu bản dịch thì trả undefined để bên gọi bỏ hẳn', () => {
    expect(industryName('Bán lẻ', 'vi')).toBe('Bán lẻ');
    expect(industryName('Bán lẻ', 'en')).toBe('Retail');
    expect(industryName('Ngành chưa có', 'en')).toBeUndefined();
  });

  /*
   * `/data/symbols` viết cùng một ngành nhiều kiểu (đo 06/11/2026 trên cả danh sách mã): 'ĐIện' của S4A,
   * 'Điện tử & thiết bị điện' của HPO, 'Sách & sản phẩm văn hóa' của KHX, 'Bất động sản' dạng tổ hợp
   * của SLD. So nguyên văn thì bốn mã ấy mất tên ngành ở chế độ tiếng Anh.
   */
  it('khớp tên ngành bất kể chữ hoa thường, dạng Unicode và khoảng trắng thừa', () => {
    expect(industryNameEn('ĐIện')).toBe(INDUSTRY_NAMES_EN['Điện']);
    expect(industryNameEn('Điện tử & thiết bị điện')).toBe(
      INDUSTRY_NAMES_EN['Điện tử & Thiết bị điện'],
    );
    expect(industryNameEn('Sách & sản phẩm văn hóa')).toBe(
      INDUSTRY_NAMES_EN['Sách & Sản phẩm văn hóa'],
    );
    expect(industryNameEn('Bất động sản'.normalize('NFD'))).toBe(INDUSTRY_NAMES_EN['Bất động sản']);
    expect(industryNameEn('  Bán   lẻ ')).toBe('Retail');
  });
});
