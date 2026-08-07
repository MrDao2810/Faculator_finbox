'use client';

import { useState } from 'react';

import { buildExportContent, exportFileName, t } from '@/application';
import type { CalcOutput, ExportFormat, FormulaSpec, Level } from '@/application';
import { BottomSheet, Button, Switch } from '@/ui/primitives';

import { downloadCardPng } from './draw-card';
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
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [includeChart, setIncludeChart] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const content = buildExportContent(
    formula,
    output,
    inputs,
    { format, includeChart, includeDetails, mode, fromDraftData },
    interpretation,
  );

  async function run() {
    setError(null);
    try {
      if (format === 'png') {
        await downloadCardPng(content, exportFileName(formula, 'png'));
      } else {
        // Vùng in nằm sẵn trong DOM dưới đây; CSS in ở globals.css lo phần ẩn những chỗ khác.
        window.print();
      }
      onClose();
    } catch {
      // Trình duyệt chặn canvas hoặc chặn tải file — nói rõ chứ không im lặng.
      setError(t('export.failed'));
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

      {error !== null && (
        <p className={styles.error} role="alert">
          {error}
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

        {content.includeChart && <div className="print-chart">{t('export.chartPending')}</div>}

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
