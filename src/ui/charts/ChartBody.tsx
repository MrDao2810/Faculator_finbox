'use client';

import { useEffect, useMemo, useState } from 'react';

import { buildChartModel, dangVeCuaHinh, dangVeHieuLuc, laHinhChuoiGia } from '@/application';
import type {
  CalcContext,
  CalcInputs,
  CalcOutput,
  DangVe,
  FormulaModule,
  HinhDangXem,
  Level,
} from '@/application';
import { useT } from '@/application/preferences-context';
import { InlineWarning } from '@/ui/result';

import { ChartFrame } from './ChartFrame';
import { ChartFullscreen } from './ChartFullscreen';
import { ChartKindSelect } from './ChartKindSelect';
import { DonutChart } from './DonutChart';
import { HistogramChart } from './HistogramChart';
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
  /**
   * Báo lên hình ĐANG HIỆN mỗi khi nó đổi: mục đang chọn ở dòng "Xem kết quả đổi theo", dạng Đường
   * hay Cột đang vẽ, và hình có vẽ được hay khối đang hiện cảnh báo (13/10/2026).
   *
   * Khung hướng dẫn mở từ nút "?" cạnh tiêu đề khối đọc đúng thứ này để chỉ in chữ của hình đang
   * hiện — chủ dự án: *"sau khi lựa chọn một select mới từ đường thì mới hiển thị xem biểu đồ dạng
   * đường, tương tự khi click vào xem biểu đồ dạng cột"*. Trạng thái ấy sống ở đây, sau ranh giới
   * nạp trễ, còn nút "?" và khung thì ở màn chi tiết; một lời báo đi lên là mối nối rẻ nhất. Kéo
   * state lên màn chi tiết thì không được: trục MẶC ĐỊNH do `buildChartModel()` chọn, mà màn chi
   * tiết không được chạm vào bộ dựng biểu đồ (bất biến của `FormulaChart.tsx`).
   *
   * PHẢI có tham chiếu ổn định giữa các lượt render — prop này đi qua `memo(FormulaChart)`, và nó
   * còn là phụ thuộc của effect bên dưới.
   */
  onViewChange?: (hinh: HinhDangXem) => void;
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
  onViewChange,
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
   * Dạng vẽ người dùng chọn ở ô "Loại biểu đồ". Mặc định ĐƯỜNG, và giữ nguyên như thế qua mọi lần đổi trục.
   *
   * Không đặt lại về `'line'` khi người dùng đổi trục: lối vẽ là sở thích ĐỌC của họ, không phải
   * thuộc tính của trục đang xem. Bắt chọn lại cột sau mỗi lần đổi trục là bắt nói lại một ý đã nói.
   *
   * Mỗi dạng chỉ vẽ được khi hình mời nó — xem `dangVeCuaHinh()` bên Domain. State vẫn giữ dạng đã
   * chọn cả khi điều kiện tạm mất (đổi sang trục thời gian có đường giá chồng lên thì không còn Cột),
   * nên đổi về trục cũ là dạng ấy quay lại đúng như họ để. Hình bóc tách cũng vậy: chọn Vành khuyên,
   * sang một trục quét (về Đường), quay lại bóc tách là Vành khuyên trở lại.
   */
  const [kind, setKind] = useState<DangVe>('line');

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
         * Xin cả khi model hoá ra không vẽ cột được (nhiều chuỗi chẳng hạn) là vô hại: `kind` sống
         * qua mọi lần đổi trục nên cờ vẫn tới Domain, nhưng `buildChartModel` chỉ nới tới 0 khi
         * hình không có đường kèm — đúng điều kiện ô chọn mời Cột.
         */
        ...(kind === 'bar' ? { zeroBaseline: true } : {}),
        /*
         * Xin trục ôm giá cao và giá thấp của mọi phiên khi người dùng đang xem NẾN — cùng lẽ với
         * mốc 0 của Cột ngay trên, chi tiết ở `ChartArgs.candleRange`. Hình không có nến thì Domain
         * bỏ qua cờ này, nên đổi sang một trục quét mà `kind` còn là Nến vẫn ra đúng trục cũ.
         */
        ...(kind === 'candle' ? { candleRange: true } : {}),
      }),
    [formula, inputs, ctx, output, level, sweepKey, seriesLabel, kind],
  );

  /*
   * Những dạng hình đang mời, theo luật của `dangVeCuaHinh()` bên Domain (Cột chỉ khi một chuỗi,
   * Bậc thang chỉ ở trục rời rạc, Lãi/lỗ chỉ khi kết quả đổi dấu, Vành khuyên chỉ khi mọi
   * phần bóc tách đều cộng vào). Dạng không hợp thì VẮNG MẶT khỏi ô chọn chứ không bị làm mờ: một
   * lựa chọn không bao giờ chọn được ở hình này thì bày ra chỉ để người dùng thử rồi thất vọng.
   *
   * Tính ở ĐÂY, trước nhánh `unavailable`, vì effect báo hình ngay dưới cần nó và hook thì không
   * được đứng sau một lệnh `return` sớm.
   */
  const dangMoi = model.kind === 'unavailable' ? [] : dangVeCuaHinh(model, formula.spec);

  /* Dạng THẬT SỰ đang vẽ — `kind` là ý muốn, còn đây là ý muốn đã lọc qua điều kiện. */
  const variant: DangVe =
    model.kind === 'unavailable' ? 'line' : dangVeHieuLuc(model, kind, formula.spec);

  /*
   * Báo hình đang hiện lên màn chi tiết — xem `ChartBodyProps.onViewChange`.
   *
   * Khoá báo lên là `model.sweepKey`, tức mục mà ô chọn đang chỉ vào, kể cả khi chưa ai chọn gì và
   * trục do Domain tự quyết. Riêng lúc khối đang hiện cảnh báo thay cho hình thì chỉ báo lựa chọn
   * người dùng ĐÃ TỰ bấm (`sweepKey` của state, có thể là `null`): mô hình `unavailable` vẫn mang
   * một `sweepKey` — ô nhập mà bộ dựng thử đầu tiên — nhưng với 35 công thức đang chờ chuỗi giá thì
   * hình sẽ hiện ra khi nạp xong là hình theo thời gian, không phải hình của ô ấy. Báo `null` để
   * khung "?" nói về hình màn sẽ mở ra.
   *
   * Phụ thuộc là ba giá trị nguyên thuỷ, nên effect chỉ chạy khi hình thật sự đổi — không chạy theo
   * từng phím gõ ở khối Số liệu.
   */
  const daVe = model.kind !== 'unavailable';
  const khoaDangHien = model.kind === 'unavailable' ? sweepKey : model.sweepKey;
  /*
   * Các dạng thêm ngày 21/10/2026 chưa có đoạn "Đọc biểu đồ" riêng — chủ dự án chốt hướng dẫn cho
   * chúng "chưa cần". Nến, Điểm, Bậc thang và Lãi/lỗ vẽ đúng bộ điểm và trục của dạng Đường
   * (Nến chỉ thêm nến của phiên dưới đường ấy) nên khung "?" in đoạn Đường; Vành khuyên dùng chung
   * đoạn bóc tách, vốn không tách theo dạng.
   */
  const dangDangVe = variant === 'bar' ? 'cot' : 'duong';
  /* Hai mục theo chuỗi giá chưa có chữ hướng dẫn — khung "?" phải im (`HinhDangXem.hinhChuoi`). */
  const hinhChuoi = daVe && laHinhChuoiGia(khoaDangHien);
  useEffect(() => {
    onViewChange?.({ khoa: khoaDangHien, dang: dangDangVe, daVe, hinhChuoi });
  }, [onViewChange, khoaDangHien, dangDangVe, daVe, hinhChuoi]);

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
   * ── Dòng gợi ý dưới hình đã BỎ HẲN ─────────────────────────────────────────────────────────
   *
   * Ở đây từng có `chiDuongDoiTruc` + component `ApplyHint`, dựng câu "Trục đang là thời gian nên
   * bấm không ghi được gì — đổi mục 'Xem kết quả đổi theo' ở trên sang một biến số…". Chủ dự án
   * chốt bỏ ngày 14/09/2026; câu khẳng định đi cùng nó ("Bấm vào biểu đồ để áp dụng…") đã bỏ từ
   * một đợt trước, nên nay dưới hình không còn dòng gợi ý nào.
   *
   * Cái giá, ghi lại vì nó không hiện ra ở đâu khác: bấm vào hình khi trục X là THỜI GIAN vẫn
   * không ghi gì vào ô Số liệu, và nay không còn câu nào nói ra điều đó — người dùng bấm thử rồi
   * tự đoán. Tính năng KHÔNG bị gỡ: `canApplyPoint`, con trỏ và vạch dò giữ nguyên, đổi trục sang
   * một biến số thì bấm vẫn ăn như cũ.
   */

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
   * MỘT ô chọn trục và MỘT ô chọn dạng vẽ, dựng hai lần ở hai chỗ — cùng lý do đã ghi ngay dưới:
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
      <ChartKindSelect idBase={base} options={dangMoi} value={variant} onChange={setKind} />
    </>
  );

  /* Dạng của `LineChart` — hai dạng của hình bóc tách không bao giờ tới được nhánh đó. */
  const dangDuong = variant === 'waterfall' || variant === 'donut' ? 'line' : variant;

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
          variant === 'donut' ? (
            <DonutChart model={model} idBase={idBase} />
          ) : (
            <WaterfallChart model={model} idBase={idBase} />
          )
        ) : model.kind === 'histogram' ? (
          <HistogramChart model={model} idBase={idBase} />
        ) : (
          <LineChart
            model={model}
            idBase={idBase}
            variant={dangDuong}
            onApplyPoint={canApplyPoint ? onApplyPoint : undefined}
          />
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
          variant={variant}
        />
      ) : null}
    </>
  );
}
