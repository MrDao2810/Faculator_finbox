'use client';

import dynamic from 'next/dynamic';

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
 * **Phủ 97 trên 107 công thức** — mọi công thức trừ 10 cái khai `chartType: 'none'`.
 *
 * Vì sao mở được rộng thế mà không phải viết thêm renderer nào: động cơ ở `@/core/chart` sinh điểm
 * từ hai lối, và giữa hai lối thì không công thức nào lọt. Đường quét độ nhạy chỉ cần một biến vô
 * hướng có `min`/`max` — 208 trên 209 biến của Registry đã khai sẵn. Đường theo thời gian chỉ cần
 * một chân giá hoặc một chuỗi cắt được tiền tố. Đo bằng `buildChartModel()` trên cả 107 công thức ×
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
}

export function FormulaChart(props: FormulaChartProps) {
  if (!hasChart(props.formula.spec)) return null;
  return <ChartBody {...props} />;
}
