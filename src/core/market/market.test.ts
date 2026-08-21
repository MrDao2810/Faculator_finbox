import { describe, expect, it } from 'vitest';

import {
  constantsAsOf,
  findSchedule,
  resolveConstant,
  resolveRate,
  resolveValue,
  scheduleOrDefault,
  validateMarketConfig,
} from './resolve';
import { HOSE_2026, MARKET_CONFIG } from './schedules';
import { SOURCE_FEE_CIRCULAR } from '../formulas/shared';
import type { FeeSchedule, MarketConfig } from './types';

/** Ngày cố định trong test — Domain không được lấy ngày hệ thống (NFR-REL-03). */
const SAU_KHI_LUAT_MOI_HIEU_LUC = '2026-08-01';
const TRUOC_KHI_LUAT_MOI_HIEU_LUC = '2026-06-30';

describe('cấu hình thị trường mặc định', () => {
  it('không có vấn đề nào khi soát (LDR-03, CON-10)', () => {
    expect(validateMarketConfig(MARKET_CONFIG)).toEqual([]);
  });

  it('mọi hằng số đều có ngày hiệu lực và căn cứ pháp lý', () => {
    for (const constant of HOSE_2026.constants) {
      expect(constant.effectiveFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(constant.legalBasis.vi.trim()).not.toBe('');
    }
  });

  it('có đủ bộ hằng số WF-08 cần để bóc tách chi phí', () => {
    const keys = HOSE_2026.constants.map((c) => c.key);
    expect(keys).toContain('fee.brokerage.buy');
    expect(keys).toContain('fee.brokerage.sell');
    expect(keys).toContain('tax.transfer.sell');
    expect(keys).toContain('fee.custody');
  });
});

/*
 * Dây neo giữa hai nơi cùng trích một văn bản.
 *
 * Vòng đối chiếu 5.1.1 sửa `legalBasis` của hai hằng số phí môi giới sang Thông tư 102/2021
 * nhưng bỏ sót `SOURCE_FEE_CIRCULAR` — nhãn hiện ở khối Nguồn của 5 trang công thức phí — nên
 * suốt một thời gian màn tính bằng căn cứ mới trong khi khối Nguồn chỉ người dùng tới văn bản
 * đã bị thay. Không có ca kiểm nào bắt được vì hai bên nằm ở hai thư mục khác nhau.
 */
describe('căn cứ pháp lý không được lệch giữa hằng số và khối Nguồn', () => {
  it('phí môi giới và SOURCE_FEE_CIRCULAR trích cùng một thông tư', () => {
    const soThongTu = /Thông tư (\d+\/\d+)\/TT-BTC/;
    const cuaHangSo = soThongTu.exec(
      HOSE_2026.constants.find((c) => c.key === 'fee.brokerage.buy')?.legalBasis.vi ?? '',
    )?.[1];
    const cuaKhoiNguon = soThongTu.exec(SOURCE_FEE_CIRCULAR.label.vi)?.[1];

    expect(cuaHangSo, 'không đọc được số thông tư trong legalBasis').toBeDefined();
    expect(cuaKhoiNguon, 'không đọc được số thông tư trong SOURCE_FEE_CIRCULAR').toBeDefined();
    expect(cuaKhoiNguon).toBe(cuaHangSo);
  });
});

describe('resolveConstant()', () => {
  it('lấy được thuế chuyển nhượng khi luật đã có hiệu lực', () => {
    const c = resolveConstant(HOSE_2026, 'tax.transfer.sell', SAU_KHI_LUAT_MOI_HIEU_LUC);
    expect(c?.value).toBe(0.1);
    expect(c?.legalBasis.vi).toContain('109/2025/QH15');
  });

  /*
   * Trước 01/07/2026 KHÔNG phải là "chưa có thuế" — là luật cũ. Hai bản ghi nối nhau từ đợt duyệt
   * Q5: mức vẫn 0,1% nhưng căn cứ đổi, và căn cứ là thứ hiện ở khối Nguồn nên phải đúng thời điểm.
   */
  it('trước ngày luật mới hiệu lực thì rơi về bản ghi luật cũ, cùng mức 0,1%', () => {
    const c = resolveConstant(HOSE_2026, 'tax.transfer.sell', TRUOC_KHI_LUAT_MOI_HIEU_LUC);
    expect(c?.value).toBe(0.1);
    expect(c?.legalBasis.vi).toContain('71/2014/QH13');
    expect(c?.legalBasis.vi).not.toContain('109/2025');
  });

  it('trước khi CÓ bất kỳ bản ghi nào thì mới là undefined — 2014 còn hai cách tính song song', () => {
    expect(resolveConstant(HOSE_2026, 'tax.transfer.sell', '2014-12-31')).toBeUndefined();
  });

  it('có nhiều bản ghi cùng khoá thì lấy bản mới nhất còn hiệu lực', () => {
    const schedule: FeeSchedule = {
      id: 'test',
      name: { vi: 'Biểu phí thử', en: 'Test schedule' },
      description: { vi: '', en: '' },
      constants: [
        {
          key: 'tax.transfer.sell',
          label: { vi: 'Thuế chuyển nhượng', en: 'Transfer tax' },
          value: 0.1,
          unit: '%',
          effectiveFrom: '2015-01-01',
          legalBasis: { vi: 'Luật cũ', en: 'Old law' },
        },
        {
          key: 'tax.transfer.sell',
          label: { vi: 'Thuế chuyển nhượng', en: 'Transfer tax' },
          value: 0.2,
          unit: '%',
          effectiveFrom: '2026-07-01',
          legalBasis: { vi: 'Luật mới', en: 'New law' },
        },
      ],
    };

    expect(resolveConstant(schedule, 'tax.transfer.sell', '2020-05-05')?.value).toBe(0.1);
    expect(resolveConstant(schedule, 'tax.transfer.sell', '2026-12-31')?.value).toBe(0.2);
  });

  it('ngày sai định dạng thì trả undefined chứ không đoán', () => {
    expect(resolveConstant(HOSE_2026, 'fee.custody', '01/08/2026')).toBeUndefined();
  });
});

describe('resolveValue() và resolveRate()', () => {
  it('trả null thay vì 0 khi không tra được (FR-06)', () => {
    // 2008: trước cả Luật Thuế TNCN đầu tiên (04/2007 hiệu lực 01/01/2009) — không có gì để tra.
    expect(resolveValue(HOSE_2026, 'tax.dividend.cash', '2008-06-30')).toBeNull();
  });

  it('đổi phần trăm sang hệ số nhân theo quy ước CON-05', () => {
    expect(resolveRate(HOSE_2026, 'fee.brokerage.buy', SAU_KHI_LUAT_MOI_HIEU_LUC)).toBeCloseTo(
      0.0015,
      6,
    );
    expect(resolveRate(HOSE_2026, 'tax.transfer.sell', SAU_KHI_LUAT_MOI_HIEU_LUC)).toBeCloseTo(
      0.001,
      6,
    );
  });

  it('hằng số không phải phần trăm thì không đổi ra hệ số', () => {
    expect(resolveRate(HOSE_2026, 'fee.custody', SAU_KHI_LUAT_MOI_HIEU_LUC)).toBeNull();
    expect(resolveValue(HOSE_2026, 'fee.custody', SAU_KHI_LUAT_MOI_HIEU_LUC)).toBe(0.27);
  });
});

describe('constantsAsOf()', () => {
  it('mỗi khoá chỉ còn một bản tại ngày tra', () => {
    const list = constantsAsOf(HOSE_2026, SAU_KHI_LUAT_MOI_HIEU_LUC);
    const keys = list.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(list).toHaveLength(7);
  });

  it('bỏ hằng số chưa có hiệu lực', () => {
    const list = constantsAsOf(HOSE_2026, '2014-12-31');
    expect(list.map((c) => c.key)).not.toContain('tax.transfer.sell');
  });

  /*
   * Chỗ dễ vỡ nhất sau khi thuế có hai bản ghi: màn Cài đặt dựng bảng từ hàm này, mà hai bản cùng
   * khoá lên bảng cả hai là người dùng thấy "Thuế chuyển nhượng" hai dòng. Mỗi khoá đúng MỘT bản,
   * và bản thắng phải là bản mới.
   */
  it('khoá có hai bản ghi thì bảng chỉ hiện bản đang hiệu lực — luật mới', () => {
    const list = constantsAsOf(HOSE_2026, SAU_KHI_LUAT_MOI_HIEU_LUC);
    const transfer = list.filter((c) => c.key === 'tax.transfer.sell');
    expect(transfer).toHaveLength(1);
    expect(transfer[0]?.legalBasis.vi).toContain('109/2025/QH15');
  });
});

describe('chọn biểu phí (WF-08, WF-13)', () => {
  it('tra được biểu phí theo id', () => {
    expect(findSchedule(MARKET_CONFIG, 'hose-2026')?.name.vi).toBe('Mặc định HOSE 2026');
  });

  it('id lạ hoặc chưa chọn thì rơi về biểu phí mặc định', () => {
    expect(scheduleOrDefault(MARKET_CONFIG, 'khong-co')?.id).toBe('hose-2026');
    expect(scheduleOrDefault(MARKET_CONFIG)?.id).toBe('hose-2026');
  });
});

describe('validateMarketConfig()', () => {
  it('bắt biểu phí mặc định trỏ vào id không tồn tại', () => {
    const broken: MarketConfig = { ...MARKET_CONFIG, defaultScheduleId: 'khong-co' };
    expect(validateMarketConfig(broken).some((p) => p.includes('không có trong danh sách'))).toBe(
      true,
    );
  });

  it('bắt hằng số thiếu căn cứ pháp lý (LDR-03)', () => {
    const broken: MarketConfig = {
      defaultScheduleId: 'x',
      schedules: [
        {
          id: 'x',
          name: { vi: 'x', en: 'x' },
          description: { vi: '', en: '' },
          constants: [
            {
              key: 'fee.custody',
              label: { vi: 'Phí lưu ký', en: 'Custody fee' },
              value: 0.27,
              unit: '₫/CP/tháng',
              effectiveFrom: '2022-02-27',
              legalBasis: { vi: '   ', en: '   ' },
            },
          ],
        },
      ],
    };
    expect(validateMarketConfig(broken).some((p) => p.includes('căn cứ pháp lý'))).toBe(true);
  });

  it('bắt ngày hiệu lực sai định dạng và giá trị âm', () => {
    const broken: MarketConfig = {
      defaultScheduleId: 'x',
      schedules: [
        {
          id: 'x',
          name: { vi: 'x', en: 'x' },
          description: { vi: '', en: '' },
          constants: [
            {
              key: 'fee.brokerage.buy',
              label: { vi: 'Phí môi giới', en: 'Brokerage fee' },
              value: -1,
              unit: '%',
              effectiveFrom: '15/02/2019',
              legalBasis: { vi: 'Thông tư 128/2018/TT-BTC', en: 'Circular 128/2018/TT-BTC' },
            },
          ],
        },
      ],
    };
    const problems = validateMarketConfig(broken);
    expect(problems.some((p) => p.includes('YYYY-MM-DD'))).toBe(true);
    expect(problems.some((p) => p.includes('không được âm'))).toBe(true);
  });
});
