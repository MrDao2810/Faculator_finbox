'use client';

import { useMemo, useState } from 'react';

import { buildChartModel } from '@/application';
import type { CalcContext, CalcInputs, CalcOutput, FormulaModule, Level } from '@/application';
import { useT } from '@/application/preferences-context';
import { InlineWarning } from '@/ui/result';

import { ApplyHint } from './ApplyHint';
import type { ApplyHintState } from './ApplyHint';
import { ChartFrame } from './ChartFrame';
import { ChartFullscreen } from './ChartFullscreen';
import { LineChart } from './LineChart';
import { SweepPicker } from './SweepPicker';
import { WaterfallChart } from './WaterfallChart';
import { ZoomButton } from './ZoomButton';
import styles from './chart.module.css';

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
  /**
   * Nhả tay tại một điểm đang dò trên đường quét thì gọi hàm này với `(khoá biến, giá trị X)`.
   *
   * Chỉ forward xuống `LineChart` khi biến trên trục X hiện là một biến INPUT THẬT của công thức
   * đang xem — xem `canApplyPoint` bên dưới. Không áp dụng cho `WaterfallChart`: mỗi cột thác nước
   * là một THÀNH PHẦN khác nhau của phép bóc tách, không phải các mức khác nhau của một biến.
   */
  onApplyPoint?: (key: string, value: number) => void;
}

export function ChartBody({
  formula,
  inputs,
  ctx,
  output,
  level,
  seriesLabel,
  onApplyPoint,
}: ChartBodyProps) {
  const t = useT();

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
     *
     * NHƯNG vẫn giữ ô chọn trục khi còn trục khác để chọn: ô ấy nằm trong khung biểu đồ, nên bỏ
     * hình đi mà bỏ luôn ô chọn là bịt đường ra — người dùng phải rời màn rồi vào lại mới đổi được
     * trục. Ca thật: chuỗi 61 phiên với SMA 75 phiên thì trục thời gian không còn điểm nào, trong
     * khi trục "Số phiên" vẫn vẽ tốt phần N ≤ 61.
     */
    const escapeOptions = model.options ?? [];
    if (escapeOptions.length <= 1) return <InlineWarning warning={model.warning} />;

    return (
      <>
        <InlineWarning warning={model.warning} />
        <div className={styles.axisEscape}>
          <SweepPicker
            idBase={`chart-${formula.spec.id}`}
            options={escapeOptions}
            value={model.sweepKey ?? escapeOptions[0]?.key ?? ''}
            onChange={setSweepKey}
          />
        </div>
      </>
    );
  }

  /*
   * Chỉ cho phép ghi ngược vào ô Số liệu khi trục X hiện đang là một biến INPUT THẬT của công thức
   * đang xem — `sweepKey` có thể là `HISTORY_KEY` ('__time', trục thời gian, tự chọn làm mặc định
   * sau khi nạp chuỗi giá) hoặc `BREAKDOWN_KEY` ('__breakdown', chỉ ở `kind: 'waterfall'`), cả hai
   * đều không phải mức của một input nào — nhả tay lúc đó không được ghi gì. Không cần biết tên
   * hai khoá đặc biệt ấy: mọi `sweepKey` do người dùng TỰ CHỌN đã được `sweepCandidates()` đảm bảo
   * là một `VariableSpec.key` thật (xem `core/chart/sweep.ts`), nên chỉ cần hỏi thẳng Registry.
   */
  const canApplyPoint =
    model.kind === 'line' && formula.spec.variables.some((v) => v.key === model.sweepKey);

  /*
   * Dòng gợi ý về lối bấm-áp-dụng — BA trạng thái, không phải một cờ bật/tắt.
   *
   * Bản trước chỉ nói khi tính năng KHÔNG dùng được ("trục đang là thời gian…"), nên người dùng làm
   * đúng theo lời khuyên, đổi trục, rồi câu ấy biến mất và không còn dấu hiệu nào cho biết giờ bấm
   * được. Lối tương tác duy nhất của biểu đồ tự giấu mình đi đúng lúc nó bắt đầu chạy.
   *
   *   - `'ready'`  — trục X đang là một biến thật: nói thẳng là bấm được.
   *   - `'switch'` — đang ở trục thời gian nhưng có biến khác đổi sang được: chỉ đường như cũ.
   *   - `null`     — tính năng không bật ở màn này (`onApplyPoint` vắng), hoặc không trục nào áp
   *                  dụng được, nên không có gì để mời cũng không có gì để chỉ.
   *
   * Tính MỘT lần ở đây rồi truyền cả hai bản (trên trang và phóng to), để câu trả lời cho "khi nào
   * nói gì" chỉ sống ở một chỗ.
   */
  const applyHint: ApplyHintState | null =
    model.kind !== 'line' || onApplyPoint === undefined
      ? null
      : canApplyPoint
        ? 'ready'
        : model.options.some((option) => formula.spec.variables.some((v) => v.key === option.key))
          ? 'switch'
          : null;

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
          <>
            <LineChart
              model={model}
              idBase={idBase}
              onApplyPoint={canApplyPoint ? onApplyPoint : undefined}
            />
            {applyHint !== null && <ApplyHint state={applyHint} />}
          </>
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
        onApplyPoint={canApplyPoint ? onApplyPoint : undefined}
        applyHint={applyHint}
      />
    </>
  );
}
