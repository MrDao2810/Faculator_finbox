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
      expect(constant.legalBasis.trim()).not.toBe('');
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

describe('resolveConstant()', () => {
  it('lấy được thuế chuyển nhượng khi luật đã có hiệu lực', () => {
    const c = resolveConstant(HOSE_2026, 'tax.transfer.sell', SAU_KHI_LUAT_MOI_HIEU_LUC);
    expect(c?.value).toBe(0.1);
    expect(c?.legalBasis).toContain('109/2025/QH15');
  });

  it('không trả bản ghi chưa tới ngày hiệu lực', () => {
    expect(
      resolveConstant(HOSE_2026, 'tax.transfer.sell', TRUOC_KHI_LUAT_MOI_HIEU_LUC),
    ).toBeUndefined();
  });

  it('có nhiều bản ghi cùng khoá thì lấy bản mới nhất còn hiệu lực', () => {
    const schedule: FeeSchedule = {
      id: 'test',
      name: 'Biểu phí thử',
      description: '',
      constants: [
        {
          key: 'tax.transfer.sell',
          label: 'Thuế chuyển nhượng',
          value: 0.1,
          unit: '%',
          effectiveFrom: '2015-01-01',
          legalBasis: 'Luật cũ',
        },
        {
          key: 'tax.transfer.sell',
          label: 'Thuế chuyển nhượng',
          value: 0.2,
          unit: '%',
          effectiveFrom: '2026-07-01',
          legalBasis: 'Luật mới',
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
    expect(resolveValue(HOSE_2026, 'tax.dividend.cash', TRUOC_KHI_LUAT_MOI_HIEU_LUC)).toBeNull();
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
    const list = constantsAsOf(HOSE_2026, TRUOC_KHI_LUAT_MOI_HIEU_LUC);
    expect(list.map((c) => c.key)).not.toContain('tax.transfer.sell');
  });
});

describe('chọn biểu phí (WF-08, WF-13)', () => {
  it('tra được biểu phí theo id', () => {
    expect(findSchedule(MARKET_CONFIG, 'hose-2026')?.name).toBe('Mặc định HOSE 2026');
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
          name: 'x',
          description: '',
          constants: [
            {
              key: 'fee.custody',
              label: 'Phí lưu ký',
              value: 0.27,
              unit: '₫/CP/tháng',
              effectiveFrom: '2022-02-27',
              legalBasis: '   ',
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
          name: 'x',
          description: '',
          constants: [
            {
              key: 'fee.brokerage.buy',
              label: 'Phí môi giới',
              value: -1,
              unit: '%',
              effectiveFrom: '15/02/2019',
              legalBasis: 'Thông tư 128/2018/TT-BTC',
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
