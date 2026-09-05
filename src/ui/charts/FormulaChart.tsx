'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

import type {
  CalcContext,
  CalcInputs,
  CalcOutput,
  FormulaModule,
  FormulaSpec,
} from '@/application';

/**
 * Ranh giới nạp trễ của biểu đồ — nhánh 4.
 *
 * **Bất biến của file này: KHÔNG import bất cứ thứ gì chạm `@/core/chart`.** Chỉ `next/dynamic` và
 * import kiểu (bị xoá lúc biên dịch). Một dòng `import { buildChartModel } from '@/application'`
 * lọt vào đây là toàn bộ động cơ quét rơi vào chunk chung của trang chi tiết, mà 10 công thức
 * không có biểu đồ cũng phải tải.
 *
 * Khuôn bám đúng `DetailBody.tsx` — tiền lệ đã đo được hiệu quả trên bản build thật.
 *
 * Lưu ý về ngân sách: `next/dynamic` KHÔNG giấu được chi phí khỏi cửa kiểm 170 kB. Next vẫn ghi
 * chunk vào HTML của trang thật sự dựng nó, nên "First Load JS" của 50 trang có biểu đồ vẫn tính
 * đủ. Nó chỉ giữ chi phí KHỎI những trang không dùng. Xem mục "chunk nạp trễ" của `npm run size`.
 */

const ChartBody = dynamic(async () => (await import('./ChartBody')).ChartBody);

/**
 * Công thức này có biểu đồ hay chưa.
 *
 * **Phủ 102 trên 111 công thức** — mọi công thức trừ 9 cái khai `chartType: 'none'`.
 *
 * Vì sao mở được rộng thế mà không phải viết thêm renderer nào: động cơ ở `@/core/chart` sinh điểm
 * từ hai lối, và giữa hai lối thì không công thức nào lọt. Đường quét độ nhạy chỉ cần một biến vô
 * hướng có `min`/`max` — 208 trên 209 biến của Registry đã khai sẵn. Đường theo thời gian chỉ cần
 * một chân giá hoặc một chuỗi cắt được tiền tố. Đo bằng `buildChartModel()` trên cả 111 công thức ×
 * 2 chế độ × có/không có chuỗi phiên: **0 ca ngoài dự kiến**, nên phạm vi ở đây là số đo chứ không
 * phải phỏng đoán.
 *
 * `chartType: 'none'` GIỮ NGUYÊN ở ngoài, và đó là ý nghĩa của nhãn ấy chứ không phải việc còn nợ:
 * phí giao dịch bằng giá × khối lượng × tỉ lệ, nên đường quét của nó là một đoạn thẳng mà người đọc
 * đoán trước được — vẽ ra chỉ thêm một hình không nói gì. Muốn mở thêm cái nào thì đổi `chartType`
 * của công thức ấy, không phải nới vị từ này.
 *
 * Vị từ vẫn là chỗ DUY NHẤT quyết định, nên nếu sau này chủ dự án khoá biểu đồ nâng cao vào bản trả
 * phí thì đó là thêm một điều kiện ở đây — không phải một đợt refactor.
 */
export function hasChart(spec: FormulaSpec): boolean {
  return spec.chartType !== 'none';
}

export interface FormulaChartProps {
  formula: FormulaModule;
  inputs: CalcInputs;
  ctx: CalcContext;
  output: CalcOutput;
  level: FormulaSpec['level'];
  /** Mã của bộ số liệu đang nạp, để câu mô tả nói rõ đường vẽ theo phiên của mã nào. */
  seriesLabel?: string;
  /**
   * Nhả tay tại một điểm trên đường quét thì gọi hàm này để ghi giá trị đó ngược vào ô Số liệu.
   *
   * **PHẢI có tham chiếu ổn định giữa các lượt render** (ví dụ dựng qua `useCallback` rồi cầm
   * bằng ref phía trong, không viết closure trực tiếp trong JSX) — đây là prop đi qua `memo` ngay
   * dưới đây, và một tham chiếu đổi mỗi lượt gõ phím sẽ vô hiệu hoá đúng cơ chế đang được giải
   * thích trong docblock của `memo`.
   */
  onApplyPoint?: (key: string, value: number) => void;
}

/**
 * `memo` ở đây là vế thứ hai của việc gõ mượt, và thiếu nó thì vế thứ nhất gần như vô nghĩa.
 *
 * Màn chi tiết đưa vào đây một bản `inputs` đã qua `useDeferredValue`, nghĩa là ở lượt dựng gấp
 * của mỗi phím gõ, mọi prop của component này đều GIỮ NGUYÊN tham chiếu cũ. Không có `memo` thì
 * React vẫn dựng lại cả cây biểu đồ ở lượt ấy: `buildChartModel()` thì `useMemo` bên trong đỡ
 * được, nhưng phần dựng và đối chiếu vài trăm thẻ SVG thì không — mà đó mới là phần thấy rõ trên
 * máy yếu. Có `memo` thì cả cây bị cắt ngay tại đây, và biểu đồ chỉ dựng lại ở lượt ưu tiên thấp
 * khi `inputs` hoãn thật sự đổi.
 *
 * So sánh nông (mặc định) là đủ: `inputs`, `ctx` và `output` bên màn chi tiết đều đi qua `useMemo`
 * hoặc `useState` nên chúng chỉ đổi tham chiếu khi nội dung đổi thật. `onApplyPoint` cũng phải giữ
 * đúng luật này — xem chú thích của nó ở `FormulaChartProps`.
 */
export const FormulaChart = memo(function FormulaChart(props: FormulaChartProps) {
  if (!hasChart(props.formula.spec)) return null;
  return <ChartBody {...props} />;
});
