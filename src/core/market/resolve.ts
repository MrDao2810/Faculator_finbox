/**
 * Tầng DOMAIN — tra cứu hằng số thị trường theo ngày (gói WBS 1.3.2).
 *
 * `asOf` là tham số bắt buộc chứ không lấy ngày hệ thống: tầng Domain phải cho ra
 * cùng một kết quả với cùng một đầu vào (NFR-REL-03), và người dùng phải tính lại
 * được một giao dịch cũ theo đúng biểu phí thời điểm đó.
 */

import type { FeeSchedule, MarketConfig, MarketConstantKey, TypedMarketConstant } from './types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Bản ghi đang có hiệu lực tại ngày `asOf`.
 * Có nhiều bản ghi cùng khoá thì lấy bản mới nhất còn nhỏ hơn hoặc bằng `asOf`.
 * Không có bản nào phù hợp thì trả undefined — nơi gọi phải xử lý, không được coi là 0.
 */
export function resolveConstant(
  schedule: FeeSchedule,
  key: MarketConstantKey,
  asOf: string,
): TypedMarketConstant | undefined {
  if (!ISO_DATE.test(asOf)) return undefined;

  let best: TypedMarketConstant | undefined;
  for (const constant of schedule.constants) {
    if (constant.key !== key) continue;
    if (constant.effectiveFrom > asOf) continue;
    if (best === undefined || constant.effectiveFrom > best.effectiveFrom) best = constant;
  }
  return best;
}

/** Giá trị thô của hằng số. Trả null khi không tra được — tuyệt đối không trả 0 (FR-06). */
export function resolveValue(
  schedule: FeeSchedule,
  key: MarketConstantKey,
  asOf: string,
): number | null {
  return resolveConstant(schedule, key, asOf)?.value ?? null;
}

/**
 * Hệ số nhân của một hằng số phần trăm: 0,15% → 0,0015.
 * Hằng số không phải đơn vị '%' thì trả null, để công thức không nhân nhầm.
 */
export function resolveRate(
  schedule: FeeSchedule,
  key: MarketConstantKey,
  asOf: string,
): number | null {
  const constant = resolveConstant(schedule, key, asOf);
  if (constant === undefined || constant.unit !== '%') return null;
  return constant.value / 100;
}

/** Toàn bộ hằng số đang có hiệu lực tại `asOf`, mỗi khoá một bản — dùng cho bảng ở màn Cài đặt. */
export function constantsAsOf(
  schedule: FeeSchedule,
  asOf: string,
): ReadonlyArray<TypedMarketConstant> {
  const latest = new Map<MarketConstantKey, TypedMarketConstant>();
  for (const constant of schedule.constants) {
    if (!ISO_DATE.test(asOf) || constant.effectiveFrom > asOf) continue;
    const current = latest.get(constant.key);
    if (current === undefined || constant.effectiveFrom > current.effectiveFrom) {
      latest.set(constant.key, constant);
    }
  }
  return [...latest.values()];
}

/** Tra biểu phí theo id. */
export function findSchedule(config: MarketConfig, id: string): FeeSchedule | undefined {
  return config.schedules.find((s) => s.id === id);
}

/**
 * Biểu phí người dùng chọn, rơi về biểu phí mặc định khi id lạ hoặc chưa chọn.
 * Trả undefined chỉ khi chính cấu hình bị hỏng.
 */
export function scheduleOrDefault(config: MarketConfig, id?: string): FeeSchedule | undefined {
  if (id !== undefined) {
    const picked = findSchedule(config, id);
    if (picked !== undefined) return picked;
  }
  return findSchedule(config, config.defaultScheduleId);
}

/**
 * Soát cấu hình thị trường. Trả danh sách vấn đề bằng tiếng Việt, không ném lỗi.
 * Chạy trong test để một bản ghi sai ngày hay trùng khoá không lọt vào bản phát hành.
 */
export function validateMarketConfig(config: MarketConfig): string[] {
  const problems: string[] = [];

  if (findSchedule(config, config.defaultScheduleId) === undefined) {
    problems.push(`Biểu phí mặc định '${config.defaultScheduleId}' không có trong danh sách.`);
  }

  const scheduleIds = new Set<string>();
  for (const schedule of config.schedules) {
    if (scheduleIds.has(schedule.id)) problems.push(`Trùng id biểu phí '${schedule.id}'.`);
    scheduleIds.add(schedule.id);

    if (schedule.constants.length === 0) {
      problems.push(`Biểu phí '${schedule.id}' không có hằng số nào.`);
    }

    const seen = new Set<string>();
    for (const constant of schedule.constants) {
      const at = `${schedule.id}/${constant.key}`;

      if (!ISO_DATE.test(constant.effectiveFrom)) {
        problems.push(
          `${at}: ngày hiệu lực '${constant.effectiveFrom}' không đúng dạng YYYY-MM-DD.`,
        );
      }
      if (!Number.isFinite(constant.value)) {
        problems.push(`${at}: giá trị phải là số hữu hạn.`);
      } else if (constant.value < 0) {
        problems.push(`${at}: giá trị không được âm.`);
      }
      if (constant.label.vi.trim() === '') problems.push(`${at}: thiếu nhãn tiếng Việt.`);
      // LDR-03: thiếu căn cứ pháp lý là lỗi, không phải nhắc nhở.
      if (constant.legalBasis.vi.trim() === '') problems.push(`${at}: thiếu căn cứ pháp lý.`);

      const stamp = `${constant.key}@${constant.effectiveFrom}`;
      if (seen.has(stamp)) problems.push(`${at}: trùng bản ghi ngày ${constant.effectiveFrom}.`);
      seen.add(stamp);
    }
  }

  return problems;
}
