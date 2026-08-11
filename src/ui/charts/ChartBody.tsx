'use client';

import { useMemo, useState } from 'react';

import { buildChartModel } from '@/application';
import type { CalcContext, CalcInputs, CalcOutput, FormulaModule, Level } from '@/application';
import { InlineWarning } from '@/ui/result';

import { ChartFrame } from './ChartFrame';
import { ChartFullscreen } from './ChartFullscreen';
import { LineChart } from './LineChart';
import { SweepPicker } from './SweepPicker';
import { ZoomButton } from './ZoomButton';

/**
 * Thân biểu đồ — NẠP TRỄ.
 *
 * Đây là phía sau ranh giới `next/dynamic` của `FormulaChart`. Toàn bộ mã biểu đồ (động cơ quét,
 * chia vạch, dựng path, renderer SVG) nằm trong chunk này, nên 10 công thức không có biểu đồ cùng
 * trang danh sách, trang chủ và 404 không phải tải một byte nào của nó.
 *
 * Component chỉ có ba việc: giữ biến đang chọn cho trục X, gọi `buildChartModel()` một lần, rồi
 * `switch` theo `kind`. Không tính toán — mọi thứ khó đã xong ở Domain.
 */

export interface ChartBodyProps {
  formula: FormulaModule;
  inputs: CalcInputs;
  ctx: CalcContext;
  /** Kết quả đang hiện ở khối Kết quả, để biểu đồ nói đúng câu ấy khi không vẽ được. */
  output: CalcOutput;
  level: Level;
  /** Mã của bộ số liệu đang nạp, để câu mô tả nói rõ đường vẽ theo phiên của mã nào. */
  seriesLabel?: string;
}

export function ChartBody({ formula, inputs, ctx, output, level, seriesLabel }: ChartBodyProps) {
  /*
   * `null` nghĩa là "chưa chọn gì, dùng trục Domain tự chọn". Cố ý không khởi tạo bằng biến mặc
   * định: nếu chép nó vào state thì lúc đổi chế độ Cơ bản / Nâng cao, state còn giữ một biến giờ
   * đã bị ẩn, và biểu đồ vẽ theo ô người dùng không còn thấy trên màn.
   *
   * Cũng chính nhờ để `null` mà việc nạp bộ số liệu đổi được trục mặc định sang đường thời gian:
   * Domain thấy có phiên giá thì chọn nó, còn khi người dùng đã tự bấm một mục thì `sweepKey` có
   * giá trị và lựa chọn ấy được tôn trọng.
   */
  const [sweepKey, setSweepKey] = useState<string | null>(null);

  /** Đang xem toàn màn hình hay không. */
  const [zoomed, setZoomed] = useState(false);

  /*
   * Một lượt dựng đường quét là khoảng 42 lần gọi `runFormula`, cỡ vài chục micro giây; đường theo
   * thời gian nặng nhất là 248 lần có cắt tiền tố chuỗi, đo được 1,76ms. Cộng cả phần xếp hạng biến
   * vẫn xa ngưỡng 100ms của NFR-PER-02, nên không cần debounce, không cần `requestAnimationFrame`,
   * không cần worker; `useMemo` là đủ.
   */
  const model = useMemo(
    () =>
      buildChartModel({
        formula,
        inputs,
        ctx,
        output,
        level,
        ...(sweepKey === null ? {} : { sweepKey }),
        ...(seriesLabel === undefined ? {} : { seriesLabel }),
      }),
    [formula, inputs, ctx, output, level, sweepKey, seriesLabel],
  );

  if (model.kind === 'unavailable') {
    /*
     * Không vẽ được thì nói ĐÚNG câu khối Kết quả đang nói, kèm câu chỉ đường (NFR-USA-04).
     * Không thêm nút "Nạp mẫu" / "Dán chuỗi giá" ở đây: hai nút ấy đã nằm ngay khối Số liệu phía
     * trên cho cả 34 công thức ăn chuỗi (đợt trước), và bày lần hai là hai lối vào cho một việc.
     */
    return <InlineWarning warning={model.warning} />;
  }

  /*
   * MỘT ô chọn, dựng hai lần ở hai chỗ.
   *
   * Nó không giữ state riêng — giá trị đọc từ `model.sweepKey`, thay đổi bắn về `setSweepKey` — nên
   * ô trên trang và ô trong màn phóng to luôn nói cùng một biến. Đúng cách đã dùng cho khối Ví dụ
   * thực tế: hai chỗ hiện cùng con số vì chúng LÀ cùng con số.
   */
  const picker = (
    <SweepPicker options={model.options} value={model.sweepKey} onChange={setSweepKey} />
  );

  return (
    <>
      <ChartFrame
        model={model}
        picker={picker}
        action={
          <ZoomButton
            onClick={() => {
              setZoomed(true);
            }}
          />
        }
      >
        <LineChart model={model} />
      </ChartFrame>

      <ChartFullscreen
        open={zoomed}
        onClose={() => {
          setZoomed(false);
        }}
        model={model}
        controls={picker}
      />
    </>
  );
}
