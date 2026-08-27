'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * `t as tVi`: vùng in PDF phía dưới là MỘT PHẦN CỦA FILE XUẤT — tài liệu tiếng Việt trọn vẹn
 * (nội dung từ `buildExportContent` ở tầng Domain, miễn trừ tiếng Việt), nên câu chờ biểu đồ
 * trong đó phải giữ bản build-time chứ không đổi theo locale — một câu Anh giữa tài liệu Việt
 * là tài liệu hỏng. Khung sheet (nút, nhãn, lỗi) thì theo locale qua `useT()` như mọi màn.
 */
import { buildExportContent, exportFileName, t as tVi } from '@/application';
import type { CalcOutput, ExportFormat, FormulaSpec, Level } from '@/application';
import { useT } from '@/application/preferences-context';
import { BottomSheet, Button, Switch } from '@/ui/primitives';

import styles from './ExportSheet.module.css';

/** Hai định dạng xuất, đúng thứ tự WF-12. */
const FORMATS: ReadonlyArray<{
  id: ExportFormat;
  nameKey: 'export.pdf' | 'export.png';
  hintKey: 'export.pdfHint' | 'export.pngHint';
}> = [
  { id: 'pdf', nameKey: 'export.pdf', hintKey: 'export.pdfHint' },
  { id: 'png', nameKey: 'export.png', hintKey: 'export.pngHint' },
];

/**
 * Biểu tượng của thẻ định dạng.
 *
 * Vẽ tay bằng SVG ăn theo `currentColor` chứ không nhúng file ảnh: đổi bảng màu lần sau là
 * biểu tượng đổi theo, và không tốn thêm một lượt tải nào (NFR-PER-04) — cùng cách `BrandMark`
 * và bộ icon thanh dưới đã làm ở đợt 8b.
 *
 * `aria-hidden` vì tên định dạng nằm ngay dưới bằng chữ; đọc thêm biểu tượng chỉ làm ồn.
 */
function FormatIcon({ format }: { format: ExportFormat }) {
  return (
    <svg
      className={styles.formatIcon}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {format === 'pdf' ? (
        <>
          {/* Tờ giấy có góc gấp — khổ A4 in ra. */}
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h4" />
        </>
      ) : (
        <>
          {/* Khung ảnh có núi và mặt trời — thẻ chia sẻ nhanh. */}
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
        </>
      )}
    </svg>
  );
}

export interface ExportSheetProps {
  open: boolean;
  onClose: () => void;
  formula: FormulaSpec;
  output: CalcOutput;
  inputs: Readonly<Record<string, number>>;
  interpretation?: string;
  mode?: Level;
  /**
   * Người dùng đang dùng bộ số liệu mẫu (bản thảo) cho các ô nhập.
   * File xuất ra rời khỏi ứng dụng nên phải tự nói được điều đó — người nhận không có cách
   * nào khác để biết. Xem `ExportOptions.fromDraftData`.
   */
  fromDraftData?: boolean;
}

/**
 * Sheet xuất PDF / PNG — gói WBS 2.5.3, màn WF-12.
 *
 * FR-22 · FR-24. Hai điều đáng nói về cách làm:
 *
 * 1. **Không thêm thư viện xuất file.** PDF đi qua `window.print()` với khổ A4 đặt bằng
 *    `@page` — trình duyệt nào cũng có sẵn mục "Lưu thành PDF", và bản in ra đúng bằng
 *    những gì CSS in mô tả. PNG thì vẽ tay bằng Canvas. Cộng lại tiết kiệm khoảng 400 kB so
 *    với jsPDF + html2canvas, đáng kể với một trang tĩnh (NFR-PER-04).
 * 2. **Miễn trừ không có công tắc.** Nội dung file dựng bằng `buildExportContent()` ở tầng
 *    Domain, mà hàm đó luôn điền `disclaimer`. Trên màn cũng không vẽ ô tick nào cho nó —
 *    đúng câu WF-12: "Không thể tắt — mọi file xuất ra đều mang tuyên bố miễn trừ."
 */
export function ExportSheet({
  open,
  onClose,
  formula,
  output,
  inputs,
  interpretation,
  mode = 'advanced',
  fromDraftData = false,
}: ExportSheetProps) {
  const t = useT();
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [includeChart, setIncludeChart] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  /*
   * Giữ CỜ chứ không giữ chuỗi đã dịch: nhét `t('export.failed')` vào state là đóng băng câu
   * lỗi ở ngôn ngữ lúc nó xảy ra, nên đổi sang EN rồi mở lại sheet vẫn thấy câu tiếng Việt cũ
   * nằm giữa toàn nhãn tiếng Anh. Dịch lúc dựng thì câu luôn theo ngôn ngữ đang xem.
   */
  const [failed, setFailed] = useState(false);

  const content = buildExportContent(
    formula,
    output,
    inputs,
    { format, includeChart, includeDetails, mode, fromDraftData },
    interpretation,
  );

  /*
   * Vùng in nhận bản CHÉP của hình biểu đồ đang hiện trên trang, đặt vào bằng tay chứ không dựng
   * bằng JSX — xem docblock của `chart-snapshot.ts` về việc vì sao chép node thay vì vẽ lại.
   *
   * React không dựng con nào vào `<div ref={chartSlot}>`, nên `replaceChildren()` ở đây không
   * giẫm lên thứ gì React đang quản. Câu dự phòng thì NGƯỢC LẠI — nó là JSX thật, và CSS tự ẩn
   * nó đi khi khe bên cạnh đã có `<svg>` (`:has()` trong globals.css). Cách ấy tránh hẳn việc
   * sờ vào node React sở hữu, và tránh luôn một state chỉ để nói "đã có hình hay chưa" — state
   * ấy sẽ không kịp được React ghi ra DOM trước lúc `window.print()` chạy, vì `print()` chặn
   * luồng ngay tại chỗ.
   */
  const chartSlot = useRef<HTMLDivElement>(null);
  const cloneChart = useRef<((formulaId: string) => SVGSVGElement | null) | null>(null);

  const fillChart = useCallback(() => {
    const slot = chartSlot.current;
    const clone = cloneChart.current;
    if (slot === null || clone === null) return;
    const svg = clone(formula.id);
    if (svg === null) slot.replaceChildren();
    else slot.replaceChildren(svg);
  }, [formula.id]);

  /*
   * Nạp bộ chụp khi sheet mở, không phải lúc dựng trang: `import()` trần nên chunk sinh ra không
   * bị Next ghi vào HTML của 111 trang chi tiết — cùng lối `draw-card` đã đi, xem chú thích trong
   * `run()`.
   */
  useEffect(() => {
    if (!open || !includeChart) return;

    let huy = false;
    void import('./chart-snapshot')
      .then(({ cloneChartSvg }) => {
        if (huy) return;
        cloneChart.current = cloneChartSvg;
        fillChart();
      })
      .catch(() => {
        // Không nạp được thì vùng in giữ câu dự phòng — không có gì để báo lỗi ở đây.
      });

    return () => {
      huy = true;
    };
  }, [open, includeChart, fillChart]);

  /**
   * Hình biểu đồ cho tấm thẻ PNG, hoặc `null` khi không có gì để vẽ.
   *
   * Nuốt lỗi có chủ đích, và đây là chỗ duy nhất trong hàm `run()` làm thế: một trình duyệt từ
   * chối rasterise SVG không phải lý do để chặn cả file xuất — tấm thẻ vẫn mang kết quả, bảng đầu
   * vào và câu miễn trừ, tức vẫn là một tài liệu đủ nghĩa. Đổi lại, lúc ấy thẻ in ra khung nét đứt
   * kèm câu "công thức này không có biểu đồ", giống hệt trường hợp công thức thật sự không vẽ hình
   * — hai cảnh khác nhau nói cùng một câu. Chấp nhận được vì cảnh thứ hai gần như không xảy ra, và
   * vì câu sai duy nhất nó gây ra là về SỰ TỒN TẠI của hình, không phải về con số nào.
   */
  async function chartForCard(): Promise<HTMLImageElement | null> {
    if (!includeChart) return null;

    try {
      const { chartImage, chartSvgUrl, cloneChartSvg } = await import('./chart-snapshot');
      const svg = cloneChartSvg(formula.id);
      if (svg === null) return null;

      const url = chartSvgUrl(svg);
      if (url === null) return null;

      return await chartImage(url);
    } catch {
      return null;
    }
  }

  async function run() {
    setFailed(false);
    try {
      if (format === 'png') {
        /*
         * Nạp trễ bộ vẽ Canvas — nó chỉ chạy khi người dùng bấm đúng nút này.
         *
         * Trước đợt này `draw-card` được import tĩnh, nên toàn bộ mã vẽ Canvas nằm trong gói cơ
         * sở của cả 111 trang chi tiết dù đa số người dùng không bao giờ xuất PNG. Dùng `import()`
         * trần chứ không `next/dynamic`: chunk sinh ra KHÔNG được ghi vào HTML, nên nó rời hẳn
         * khỏi "First Load JS" mà cửa kiểm NFR-PER-04 đo — khác `next/dynamic`, thứ vẫn bị tính.
         */
        const { downloadCardPng } = await import('./draw-card');
        await downloadCardPng(content, exportFileName(formula, 'png'), await chartForCard());
      } else {
        /*
         * Chụp lại NGAY TRƯỚC khi in, dù effect ở trên đã chụp một lần lúc mở sheet: người dùng
         * có thể đã đổi trục X hoặc nạp mã khác trong khoảng giữa, và hình cũ nằm im trong vùng
         * in thì file xuất ra là một tờ nói sai.
         */
        fillChart();
        // Vùng in nằm sẵn trong DOM dưới đây; CSS in ở globals.css lo phần ẩn những chỗ khác.
        window.print();
      }
      onClose();
    } catch {
      // Trình duyệt chặn canvas hoặc chặn tải file — nói rõ chứ không im lặng.
      setFailed(true);
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t('export.title')}
      footer={
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            void run();
          }}
        >
          {format === 'pdf' ? t('export.doPdf') : t('export.doPng')}
        </Button>
      }
    >
      <div className={styles.formats} role="group" aria-label={t('export.formatLabel')}>
        {FORMATS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={format === option.id ? `${styles.format} ${styles.selected}` : styles.format}
            aria-pressed={format === option.id}
            onClick={() => {
              setFormat(option.id);
            }}
          >
            <FormatIcon format={option.id} />
            <span className={styles.formatName}>{t(option.nameKey)}</span>
            <span className={styles.formatHint}>{t(option.hintKey)}</span>
          </button>
        ))}
      </div>

      <div className={styles.options}>
        <Switch
          checked={includeChart}
          onChange={setIncludeChart}
          label={t('export.withChart')}
          hint={t('export.withChartHint')}
        />
        <Switch
          checked={includeDetails}
          onChange={setIncludeDetails}
          label={t('export.withDetails')}
          hint={t('export.withDetailsHint')}
        />
      </div>

      {/* Không phải ô tick — là thông báo. Người dùng không có cách nào bỏ nó ra (FR-24). */}
      <div className={styles.locked} role="note">
        <span className={styles.lockedTitle}>
          <span aria-hidden="true">! </span>
          {t('export.disclaimerLocked')}
        </span>
        <span className={styles.lockedDetail}>{t('export.disclaimerLockedDetail')}</span>
      </div>

      {failed && (
        <p className={styles.error} role="alert">
          {t('export.failed')}
        </p>
      )}

      {/*
       * Vùng chỉ hiện khi in. Nằm trong DOM sẵn nên window.print() bắt được ngay, còn trên màn
       * thì lớp .print-region ở globals.css giấu đi.
       */}
      <div className="print-region" aria-hidden="true">
        <h1>{content.title}</h1>
        <p>{content.subtitle}</p>
        <p className="print-result">{content.result}</p>
        {content.interpretation !== undefined && <p>{content.interpretation}</p>}

        {/* Bản build-time (tVi) có chủ đích — xem chú thích ở khối import. */}
        {content.includeChart && (
          <div className="print-chart">
            <div className="print-chart-plot" ref={chartSlot} />
            <span className="print-chart-note">{tVi('export.chartNone')}</span>
          </div>
        )}

        <table>
          <caption>Giá trị đầu vào</caption>
          <tbody>
            {content.inputs.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {content.variables.length > 0 && (
          <table>
            <caption>Bảng biến</caption>
            <tbody>
              {content.variables.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {content.explanation.map((row) => (
          <div key={row.label}>
            <h2>{row.label}</h2>
            <p>{row.value}</p>
          </div>
        ))}

        {content.sources.length > 0 && (
          <p className="print-sources">Nguồn: {content.sources.join('; ')}</p>
        )}

        {content.draftNote !== undefined && <p className="print-draft-note">{content.draftNote}</p>}
        <p className="print-disclaimer">{content.disclaimer}</p>
      </div>
    </BottomSheet>
  );
}
