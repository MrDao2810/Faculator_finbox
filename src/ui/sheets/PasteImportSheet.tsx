'use client';

import { useId, useMemo, useState } from 'react';

import { formatNumber, parsePaste, summarizeSkipped } from '@/application';
import type { ColumnKind, MessageKey, PasteResult, PriceBar } from '@/application';
import { useT } from '@/application/preferences-context';
import { BottomSheet, Button } from '@/ui/primitives';

import styles from './PasteImportSheet.module.css';

/**
 * Nhãn HIỂN THỊ của từng vai trò cột, tra theo locale. Bản gốc tiếng Việt là `COLUMN_LABELS`
 * ở Domain (đúng chữ WF-11) — ca kiểm trong i18n.test.ts giữ khoá vi khớp từng chữ với nó.
 * Từ vựng ĐOÁN cột từ header dán vào (`HEADER_WORDS`) vẫn ở Domain, không dính gì tới locale.
 */
const COLUMN_LABEL_KEYS: Readonly<Record<ColumnKind, MessageKey>> = {
  date: 'paste.col.date',
  open: 'paste.col.open',
  high: 'paste.col.high',
  low: 'paste.col.low',
  close: 'paste.col.close',
  volume: 'paste.col.volume',
  ignore: 'paste.col.ignore',
};

export interface PasteImportSheetProps {
  open: boolean;
  onClose: () => void;
  /** Gọi khi người dùng bấm Nạp. Nhận nguyên kết quả đã đọc, kể cả danh sách dòng bỏ qua. */
  onImport: (result: PasteResult) => void;
}

/** Thứ tự trong danh sách chọn của ô "Gán cột". */
const ASSIGNABLE: ReadonlyArray<ColumnKind> = [
  'date',
  'open',
  'high',
  'low',
  'close',
  'volume',
  'ignore',
];

/**
 * Số dòng hiện trong khung xem trước.
 *
 * Đủ để nhận ra "cột Cao và cột Thấp bị đảo" hay "ngày đọc thành 15/07 mà mình dán 07/15" mà
 * không biến sheet thành bảng thứ hai — bảng thật nằm ở màn WF-05, và người dùng sắp thấy nó
 * ngay sau khi bấm Nạp.
 */
const PREVIEW_ROWS = 5;

/** Sáu cột của khung xem trước, đúng thứ tự bảng WF-05. */
const PREVIEW_COLUMNS: ReadonlyArray<{ kind: Exclude<ColumnKind, 'ignore'>; key: keyof PriceBar }> =
  [
    { kind: 'date', key: 'date' },
    { kind: 'open', key: 'open' },
    { kind: 'high', key: 'high' },
    { kind: 'low', key: 'low' },
    { kind: 'close', key: 'close' },
    { kind: 'volume', key: 'volume' },
  ];

/** Ô trong khung xem trước. Chưa có số thì để dấu gạch, KHÔNG hiện 0 (FR-06). */
function previewCell(bar: PriceBar, key: keyof PriceBar): string {
  const value = bar[key];
  if (typeof value === 'string') return value;
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return formatNumber(value);
}

interface ColumnChipProps {
  index: number;
  kind: ColumnKind;
  onChange: (kind: ColumnKind) => void;
}

/**
 * Một chip "Gán cột".
 *
 * Nhìn là chip theo bản thiết kế, nhưng bên dưới vẫn là `<select>` gốc chứ không phải menu tự
 * dựng: trên điện thoại nó mở bánh xe chọn quen thuộc, bàn phím và trình đọc màn hình xử đúng
 * sẵn, và không tốn thêm dung lượng gói. Chip mà bấm để đảo vòng qua bảy vai trò thì gán cột
 * thứ sáu mất tới sáu lần chạm và không có cách nào biết trước còn những lựa chọn nào.
 *
 * `<select>` nằm phủ kín chip ở dạng trong suốt, nên vùng chạm là cả con chip — phần chữ nhìn
 * thấy chỉ là lớp trang trí bên dưới.
 */
function ColumnChip({ index, kind, onChange }: ColumnChipProps) {
  const id = useId();
  const t = useT();
  const assigned = kind !== 'ignore';

  return (
    <span className={assigned ? `${styles.chip} ${styles.chipOn}` : styles.chip}>
      <label className="visually-hidden" htmlFor={id}>
        {t('paste.column')} {index + 1}
      </label>

      <span className={styles.chipIndex} aria-hidden="true">
        {index + 1}
      </span>
      <span className={styles.chipText} aria-hidden="true">
        {t(COLUMN_LABEL_KEYS[kind])}
      </span>
      <span className={styles.chipCaret} aria-hidden="true">
        ▾
      </span>

      <select
        id={id}
        className={styles.chipSelect}
        value={kind}
        onChange={(event) => {
          onChange(event.target.value as ColumnKind);
        }}
      >
        {ASSIGNABLE.map((option) => (
          <option key={option} value={option}>
            {t(COLUMN_LABEL_KEYS[option])}
          </option>
        ))}
      </select>
    </span>
  );
}

/**
 * Sheet dán dữ liệu từ Excel / CSV — gói WBS 2.5.2, màn WF-11.
 *
 * FR-11 · SW-03. Đây là cơ chế giữ được Beta, Sharpe, Sortino, MaxDD và VaR trong bản đầu
 * dù chưa có nguồn giá thời gian thực (FR-12).
 *
 * Toàn bộ phần đọc dữ liệu nằm ở `parsePaste()` tầng Domain, đã test 41 ca bằng Node; ở đây
 * chỉ là vùng dán, chip gán cột, khung xem trước và hai khối báo cáo. Người dùng thấy kết quả
 * kiểm tra NGAY khi dán, trước khi bấm Nạp — đúng yêu cầu "kiểm tra hợp lệ trước khi nạp".
 */
export function PasteImportSheet({ open, onClose, onImport }: PasteImportSheetProps) {
  const [text, setText] = useState('');
  /** Người dùng gán lại cột thì ghi đè phỏng đoán. `null` nghĩa là đang dùng phỏng đoán. */
  const [override, setOverride] = useState<ColumnKind[] | null>(null);

  const result = useMemo(() => parsePaste(text, override ?? undefined), [text, override]);
  const problems = useMemo(() => summarizeSkipped(result.skipped), [result.skipped]);
  const t = useT();

  const hasText = text.trim() !== '';
  const canImport = result.rows.length > 0;
  const preview = result.rows.slice(0, PREVIEW_ROWS);

  function reset() {
    setText('');
    setOverride(null);
  }

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={t('paste.title')}
      subtitle={t('paste.subtitle')}
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            {t('paste.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!canImport}
            onClick={() => {
              onImport(result);
              reset();
              onClose();
            }}
          >
            {canImport
              ? `${t('paste.import')} ${formatNumber(result.rows.length)} ${t('paste.rows')}`
              : t('paste.import')}
          </Button>
        </>
      }
    >
      <label className={styles.label} htmlFor="paste-area">
        {t('paste.areaLabel')}
      </label>
      <textarea
        id="paste-area"
        className={styles.area}
        rows={6}
        spellCheck={false}
        placeholder={t('paste.placeholder')}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          // Dán bộ dữ liệu khác thì phỏng đoán cũ không còn đúng nữa.
          setOverride(null);
        }}
      />

      {hasText && result.columns.length > 0 && (
        <div className={styles.columns}>
          <span className={styles.sectionLabel}>{t('paste.assignColumns')}</span>
          <div className={styles.chips}>
            {result.columns.map((kind, index) => (
              <ColumnChip
                // Vị trí cột là danh tính ổn định ở đây; vai trò thì người dùng đổi được.
                key={index}
                index={index}
                kind={kind}
                onChange={(next) => {
                  const columns = [...result.columns];
                  columns[index] = next;
                  setOverride(columns);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/*
        Khung xem trước. Con số cuối cùng nói "42 dòng hợp lệ" vẫn không cho biết cột nào đã vào
        đâu — đây là chỗ duy nhất người dùng đối chiếu được phần mình dán với phần máy đọc ra,
        TRƯỚC khi nó đè lên bảng đang có.
      */}
      {preview.length > 0 && (
        <div className={styles.previewWrap}>
          <span className={styles.sectionLabel}>{t('paste.previewLabel')}</span>

          {/* Bảng sáu cột không vừa 360px — cuộn ngang trong khung riêng, cả sheet không tràn. */}
          <div className={styles.previewScroll}>
            <table className={styles.preview}>
              <caption className="visually-hidden">{t('paste.previewCaption')}</caption>
              <thead>
                <tr>
                  {PREVIEW_COLUMNS.map((column) => (
                    <th key={column.kind} scope="col">
                      {t(COLUMN_LABEL_KEYS[column.kind])}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((bar) => (
                  <tr key={bar.line}>
                    {PREVIEW_COLUMNS.map((column) => (
                      <td key={column.kind}>{previewCell(bar, column.key)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.rows.length > preview.length && (
            <p className={styles.previewMore}>
              {formatNumber(result.rows.length - preview.length)} {t('paste.previewMore')}
            </p>
          )}
        </div>
      )}

      {hasText && (
        <div className={styles.report} aria-live="polite">
          {/*
            Hai khối tách hẳn nhau: xanh cho phần nạp được, vàng cho phần bỏ qua. Trước đợt này
            cả hai là mấy dòng chữ liền nhau, nên "42 dòng hợp lệ" và "3 dòng bỏ qua" đọc như
            cùng một mức quan trọng. Dấu ✓ và ! vẫn đứng trước chữ để không phụ thuộc màu
            (NFR-USA-06).
          */}
          <p className={result.rows.length > 0 ? styles.ok : styles.none}>
            <span aria-hidden="true">{result.rows.length > 0 ? '✓ ' : '! '}</span>
            {formatNumber(result.rows.length)} {t('paste.validRows')}
          </p>

          {(problems.length > 0 || result.truncated > 0) && (
            <div className={styles.problems}>
              {problems.map((line) => (
                <p key={line} className={styles.problem}>
                  <span aria-hidden="true">! </span>
                  {formatNumber(result.skipped.length)} {t('paste.skippedRows')}: {line}
                </p>
              ))}

              {result.truncated > 0 && (
                <p className={styles.problem}>
                  <span aria-hidden="true">! </span>
                  {t('paste.truncated')} {formatNumber(result.truncated)} {t('paste.rows')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
