/**
 * Tầng APPLICATION — từ điển tiếng Anh (gói WBS 1.4.1).
 *
 * Cố ý để rỗng. FR-21 xếp ở v1.0 và gói dịch là 3.6.3 (14 giờ, gồm cả 4 mục diễn giải của
 * từng công thức). Đợt này chỉ dựng khung: `t()` thiếu key thì rơi về tiếng Việt, và
 * `missingKeys('en')` liệt kê được đúng phần còn nợ để đội nội dung biết khối lượng.
 */

import type { vi } from './vi';

export const en: Partial<Record<keyof typeof vi, string>> = {};
