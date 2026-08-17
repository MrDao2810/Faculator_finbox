'use client';

import { useMemo, useState } from 'react';

import { buildChartModel } from '@/application';
import type { CalcContext, CalcInputs, CalcOutput, FormulaModule, Level } from '@/application';
import { InlineWarning } from '@/ui/result';

import { ChartFrame } from './ChartFrame';
import { ChartFullscreen } from './ChartFullscreen';
import { LineChart } from './LineChart';
import { SweepPicker } from './SweepPicker';
import { WaterfallChart } from './WaterfallChart';
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
   * Gốc của mọi `id` trong cây biểu đồ — sinh từ prop, KHÔNG từ `useId()`.
   *
   * Vì sao: cả thư mục này nằm sau ranh giới `next/dynamic` của `FormulaChart`. React đánh số
   * `useId()` theo vị trí trong cây, mà cây lúc dựng HTML tĩnh khác cây lúc hydrate — phía máy
   * khách còn thêm một bậc `lazy` đang chờ. Kết quả là chuỗi hai bên lệch nhau, và giả lập Android
   * đo được 5 lượt cảnh báo lệch hydration trên mỗi trang có biểu đồ (trang `chartType: 'none'`
   * thì 0). Hậu quả thực tế nhỏ — React giữ giá trị của máy chủ cho cả hai thuộc tính nên
   * `aria-labelledby` vẫn trỏ đúng — nhưng cảnh báo là thật, và nó nuốt mất tín hiệu của mọi lỗi
   * hydration sau này.
   *
   * `spec.id` an toàn làm gốc: nó chính là đoạn URL của công thức, Registry đã kiểm trùng, và nó
   * đến từ prop chứ không từ nội bộ React — nên hai bên giống nhau theo cấu tạo, không theo may rủi.
   *
   * Hậu tố `-full`: bản phóng to là bản THỨ HAI của cùng một hình và nó cùng nằm trong DOM khi lớp
   * phủ mở. Thiếu hậu tố là hai node trùng `<pattern id>`, trình duyệt lấy node đầu, vùng gạch chéo
   * của màn phóng to trỏ nhầm. Có ca kiểm chốt điều này.
   *
   * Bất biến này được chốt bằng CA KIỂM, không bằng grep: `charts.test.tsx` quét cả cây biểu đồ và
   * đỏ nếu có `id` nào mang hình dạng React tự sinh (`:r…:` hoặc `«…»`). Grep không dùng được vì
   * chính những dòng chú thích này đã chứa chữ ấy.
   */
  const idBase = `chart-${formula.spec.id}`;

  /*
   * MỘT ô chọn, dựng hai lần ở hai chỗ.
   *
   * Nó không giữ state riêng — giá trị đọc từ `model.sweepKey`, thay đổi bắn về `setSweepKey` — nên
   * ô trên trang và ô trong màn phóng to luôn nói cùng một biến. Đúng cách đã dùng cho khối Ví dụ
   * thực tế: hai chỗ hiện cùng con số vì chúng LÀ cùng con số.
   *
   * Nhưng `id` thì phải KHÁC nhau, nên đây là một HÀM DỰNG chứ không phải một biến giữ sẵn element:
   * hai bản cùng nằm trong DOM khi lớp phủ mở, và `<label for>` trỏ vào node đầu tiên trùng `id`.
   * Dùng chung một element là ô chọn trong màn phóng to mất nhãn.
   */
  const pickerVoi = (base: string) => (
    <SweepPicker
      idBase={base}
      options={model.options}
      value={model.sweepKey}
      onChange={setSweepKey}
    />
  );

  return (
    <>
      <ChartFrame
        model={model}
        idBase={idBase}
        picker={pickerVoi(idBase)}
        action={
          <ZoomButton
            onClick={() => {
              setZoomed(true);
            }}
          />
        }
      >
        {/*
          Một `switch` trên `kind`, đúng lời hứa ở đầu `chart/types.ts`: mọi phần khó đã xong ở
          Domain, chỗ này chỉ chọn renderer. Thêm loại thứ tư sau này cũng chỉ thêm một nhánh —
          `ChartFrame` và màn phóng to nhận `DrawableChart` nên không phải sửa.
        */}
        {model.kind === 'waterfall' ? (
          <WaterfallChart model={model} idBase={idBase} />
        ) : (
          <LineChart model={model} idBase={idBase} />
        )}
      </ChartFrame>

      <ChartFullscreen
        open={zoomed}
        onClose={() => {
          setZoomed(false);
        }}
        model={model}
        idBase={`${idBase}-full`}
        controls={pickerVoi(`${idBase}-full`)}
      />
    </>
  );
}
