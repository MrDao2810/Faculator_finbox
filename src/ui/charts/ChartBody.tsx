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
import { ChartKindToggle } from './ChartKindToggle';
import type { ChartKind } from './ChartKindToggle';
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
  /**
   * Khoá biến mà màn đang KHOÁ, nên bấm/nhả không ghi được gì vào đó.
   *
   * Màn chi tiết khoá những ô mà mã đang nạp không cấp được số. Không biết tập ấy thì biểu đồ
   * vẫn mời "bấm để áp dụng" trên một trục ghi vào đâu cũng không đổi — một lời mời không giữ
   * lời. `setValue()` bên màn đã chặn cú ghi, đây là chặn nốt lời mời.
   *
   * PHẢI có tham chiếu ổn định giữa các lượt render — prop này đi qua `memo(FormulaChart)`.
   */
  lockedKeys?: ReadonlySet<string>;
}

/**
 * TẠM ẨN nút phóng to — chủ dự án chốt "chưa cần".
 *
 * Lần ẩn trước là vì HỎNG: lớp phủ không nổi lên trên điện thoại. Lần này KHÔNG phải thế, và phân
 * biệt hai lý do là điều đáng ghi lại. Lỗi ấy đã tìm ra nguyên nhân (`ChartFullscreen` xin
 * fullscreen cho `<html>`, đẩy tổ tiên của `<dialog>` lên trên chính nó trong lớp trên cùng của
 * trình duyệt) và đã sửa hẳn; lớp phủ nay chạy đúng ở cả điện thoại lẫn PC, đã chụp màn xác nhận.
 * Nó bị ẩn thuần vì thứ tự ưu tiên sản phẩm.
 *
 * Bật lại là đổi hằng này thành `true` rồi gỡ `.skip` ở `charts.test.tsx`. Giữ nguyên `ZoomButton`,
 * `ChartFullscreen` và state `zoomed` thay vì xoá — 340 dòng lớp phủ ấy gánh những chỗ khó không
 * dựng lại nhanh được: bẫy nút Back của Android, khoá cuộn nền, hậu tố `-full` cho `<pattern id>`,
 * và vệt dò tách biệt giữa hai bản.
 *
 * Kiểu `boolean` tường minh là cố ý: thiếu nó thì TypeScript thu hẹp về kiểu literal `false` và mọi
 * nhánh `true` thành mã chết dưới mắt lint.
 */
const PHONG_TO_BAT: boolean = false;

export function ChartBody({
  formula,
  inputs,
  ctx,
  output,
  level,
  seriesLabel,
  onApplyPoint,
  lockedKeys,
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
   * Lối vẽ chuỗi chính. Mặc định ĐƯỜNG, và giữ nguyên như thế qua mọi lần đổi trục.
   *
   * Không đặt lại về `'line'` khi người dùng đổi trục: lối vẽ là sở thích ĐỌC của họ, không phải
   * thuộc tính của trục đang xem. Bắt chọn lại cột sau mỗi lần đổi trục là bắt nói lại một ý đã nói.
   *
   * Cột chỉ vẽ được khi model chấp nhận — xem `coCotDuoc` bên dưới. State vẫn giữ `'bar'` cả khi
   * điều kiện tạm mất (người dùng đổi sang trục thời gian có đường giá chồng lên chẳng hạn), nên
   * đổi về trục cũ là cột quay lại đúng như họ để.
   */
  const [kind, setKind] = useState<ChartKind>('line');

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
        /*
         * Xin trục chứa mốc 0 khi người dùng đang xem CỘT.
         *
         * Phải xin ở đây, lúc DỰNG model, chứ không nới miền ở tầng vẽ: nhãn vạch do Domain sinh
         * cùng lúc với miền, nên nới miền một mình bên kia là nhãn nói một đằng, hình vẽ một nẻo.
         * Lý do vì sao cột bắt buộc phải có mốc 0 nằm ở `ChartArgs.zeroBaseline`.
         *
         * Xin cả khi model hoá ra không vẽ cột được (nhiều chuỗi chẳng hạn) là vô hại: lúc ấy
         * `coCotDuoc` false, hình vẫn vẽ đường, chỉ là trục rộng thêm tới 0. Nhưng nó KHÔNG xảy ra
         * — `kind` chỉ lên `'bar'` qua nút bấm, mà nút chỉ hiện khi điều kiện đã đủ.
         */
        ...(kind === 'bar' ? { zeroBaseline: true } : {}),
      }),
    [formula, inputs, ctx, output, level, sweepKey, seriesLabel, kind],
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
    model.kind === 'line' &&
    formula.spec.variables.some((v) => v.key === model.sweepKey) &&
    lockedKeys?.has(model.sweepKey) !== true;

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
        : model.options.some(
              (option) =>
                formula.spec.variables.some((v) => v.key === option.key) &&
                lockedKeys?.has(option.key) !== true,
            )
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
  /*
   * Có mời người dùng đổi sang lối CỘT hay không.
   *
   * Hai điều kiện, cả hai đều là "vẽ ra sẽ đọc sai" chứ không phải "vẽ ra sẽ xấu":
   *
   *   - Thác nước VỐN ĐÃ là cột, với ý nghĩa khác hẳn (mỗi cột một THÀNH PHẦN của phép bóc tách,
   *     không phải một mức của cùng một biến). Bày thêm nút "Cột" ở đó là hỏi một câu vô nghĩa.
   *   - Nhiều chuỗi thì cột của chuỗi chính che mất đường phụ, mà đường phụ là bối cảnh người ta
   *     cần để đọc chuỗi chính (giá đóng cửa dưới đường SMA chẳng hạn). Vẽ được, nhưng đọc thành
   *     một hình khác với hình nó đang nói.
   *
   * Nút VẮNG MẶT chứ không phải bị làm mờ: một nút không bao giờ bấm được ở màn này thì bày ra chỉ
   * để người dùng thử rồi thất vọng.
   */
  const coCotDuoc =
    model.kind === 'line' && (model.overlays === undefined || model.overlays.length === 0);

  /* Lối vẽ THẬT SỰ đang dùng — `kind` là ý muốn, còn đây là ý muốn đã lọc qua điều kiện. */
  const variant: ChartKind = coCotDuoc ? kind : 'line';

  /*
   * MỘT ô chọn trục và MỘT nhóm nút lối vẽ, dựng hai lần ở hai chỗ — cùng lý do đã ghi ngay dưới:
   * `id` phải khác nhau nên đây là hàm dựng, không phải element giữ sẵn.
   */
  const pickerVoi = (base: string) => (
    <>
      <SweepPicker
        idBase={base}
        options={model.options}
        value={model.sweepKey}
        onChange={setSweepKey}
      />
      {coCotDuoc && <ChartKindToggle idBase={base} value={kind} onChange={setKind} />}
    </>
  );

  return (
    <>
      <ChartFrame
        model={model}
        idBase={idBase}
        picker={pickerVoi(idBase)}
        /*
         * Nút phóng to BẬT LẠI từ đợt này. Nó từng bị tắt vì trên điện thoại bấm xong máy xoay
         * ngang mà lớp phủ không nổi lên; nguyên nhân là `ChartFullscreen` xin fullscreen cho
         * `<html>`, đẩy chính tổ tiên của `<dialog>` lên trên nó trong lớp trên cùng của trình
         * duyệt. Lời gọi ấy đã gỡ hẳn — xem docblock `ChartFullscreen`.
         */
        action={
          PHONG_TO_BAT ? (
            <ZoomButton
              onClick={() => {
                setZoomed(true);
              }}
            />
          ) : undefined
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
              variant={variant}
              onApplyPoint={canApplyPoint ? onApplyPoint : undefined}
            />
            {applyHint !== null && <ApplyHint state={applyHint} />}
          </>
        )}
      </ChartFrame>

      {PHONG_TO_BAT ? (
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
          variant={variant}
        />
      ) : null}
    </>
  );
}
