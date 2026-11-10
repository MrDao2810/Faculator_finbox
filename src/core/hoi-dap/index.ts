import { HOI_DAP_MUC } from './items';
import type { CauHoiThuongGap } from './types';

export type { CauHoiThuongGap, NguonTraLoi, NoiHoi, NoiHoiNguon } from './types';
export { hoiDapProblems } from './kiem';

/**
 * Câu hỏi thường gặp của cả thư viện, theo id công thức — xem docblock `types.ts`.
 *
 * CHỈ đọc lúc build (`page.tsx` qua `@/application/hoi-dap`), không bao giờ từ client component.
 */
export const HOI_DAP: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = HOI_DAP_MUC;

const RONG: ReadonlyArray<CauHoiThuongGap> = [];

/**
 * Câu hỏi của một công thức, câu Việt Nam trước (chủ dự án: _"ưu tiên Việt Nam trước"_), trong mỗi
 * phần giữ đúng thứ tự dữ liệu. **Chỉ trả câu ĐÃ CÓ trả lời** (chủ dự án, 10/11/2026, sau khi thấy
 * một câu "Chưa có trả lời" trên màn: _"ko có câu trả lời thì tạm thời ẩn đi, không cần hiển
 * thị"_): câu chưa trả lời vẫn nằm trong dữ liệu và hiện lại ngay khi có `traLoi`. Không còn câu
 * nào thì trả mảng rỗng, và màn không dựng khối.
 */
export function hoiDapFor(formulaId: string): ReadonlyArray<CauHoiThuongGap> {
  const items = (HOI_DAP[formulaId] ?? []).filter((c) => c.traLoi !== undefined);
  if (items.length === 0) return RONG;
  return [
    ...items.filter((c) => c.nguon?.vietnam === true),
    ...items.filter((c) => c.nguon !== undefined && !c.nguon.vietnam),
    ...items.filter((c) => c.nguon === undefined),
  ];
}
