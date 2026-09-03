'use client';

import { useSearchParams } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import {
  FORMULA_SUMMARIES,
  MAX_SERIES_ROWS,
  PRICE_SERIES_KEY,
  appendRow,
  checkSeries,
  emptyRow,
  formatNumber,
  formulaPath,
  parseStoredSeries,
  removeRow,
  serializeStoredSeries,
  toCsv,
  updateRow,
} from '@/application';
import type { PasteResult, Preset, SeriesRow } from '@/application';
import { useT } from '@/application/preferences-context';
import { NumberCell } from '@/ui/inputs';
import { BackLink } from '@/ui/navigation';
import { Button } from '@/ui/primitives';
import { PasteImportSheet, PresetSheet } from '@/ui/sheets';

import styles from './DataTableScreen.module.css';

/**
 * Màn WF-05 Bảng dữ liệu — gói WBS 3.3.1.
 *
 * Đây là chỗ chuỗi giá đi vào hệ thống. Beta, Sharpe, độ biến động và VaR đều cần nhiều phiên
 * (FR-12) mà `CalcContext.series` chỉ nhận một mảng số, nên phải có màn để người dùng nhập,
 * sửa và **nhìn thấy dòng nào sai** trước khi đưa vào công thức.
 *
 * Ba lối vào dữ liệu, cùng đổ về một bảng: nhập tay từng dòng · nạp bộ mẫu của DataProvider ·
 * dán từ Excel qua sheet WF-11 đã dựng ở đợt 6. Lối ra là CSV tải về.
 *
 * Bảng lưu ở localStorage chứ không gửi đi đâu (NFR-SEC-01, COM-03). Màn từng có một dòng ghi
 * chú nói đúng câu ấy ngay dưới bảng; chủ dự án cho bỏ ngày 25/08/2026 vì người dùng không cần
 * đọc nó. Bỏ được là vì màn này KHÔNG gọi mạng lần nào, nên chẳng có gì để cảnh báo — chỗ duy
 * nhất còn phải nói rõ là màn Danh mục, nơi mã cổ phiếu có rời máy thật (`portfolio.localOnly`,
 * có ca kiểm ghim nguyên văn). Đừng dựng lại dòng này ở đây.
 */

/** Sáu cột của bảng, đúng thứ tự wireframe. */
const COLUMNS = [
  { key: 'date', label: 'series.colDate' },
  { key: 'open', label: 'series.colOpen' },
  { key: 'high', label: 'series.colHigh' },
  { key: 'low', label: 'series.colLow' },
  { key: 'close', label: 'series.colClose' },
  { key: 'volume', label: 'series.colVolume' },
] as const;

/** Số phiên tối thiểu để Beta và Sharpe có ý nghĩa thống kê — cùng ngưỡng với cảnh báo WF-15. */
const MIN_USABLE_ROWS = 60;

interface SeriesRowFieldsProps {
  row: SeriesRow;
  index: number;
  /** Dòng có vấn đề hay không. Truyền boolean chứ KHÔNG truyền mảng issues: mảng được dựng
   *  lại sau mỗi lần gõ nên sẽ phá memo, và ở đây dòng chỉ cần biết có tô vàng hay không. */
  bad: boolean;
  onChange: (index: number, patch: Partial<SeriesRow>) => void;
  onRemove: (index: number) => void;
}

/**
 * Một dòng của bảng, **memo hoá**.
 *
 * Bộ mẫu 248 phiên là 1.488 ô nhập. Không memo thì mỗi phím gõ vào một ô sẽ render lại toàn
 * bộ chỗ còn lại: đo trên máy thật được 72 ms/phím, tức là gõ nhanh sẽ thấy chữ đuổi theo tay.
 * Memo cắt việc đó xuống còn đúng dòng đang sửa.
 */
const SeriesRowFields = memo(function SeriesRowFields({
  row,
  index,
  bad,
  onChange,
  onRemove,
}: SeriesRowFieldsProps) {
  const t = useT();
  return (
    <tr className={bad ? styles.badRow : undefined}>
      <td className={styles.flagCol}>
        {bad && (
          <span className={styles.flag} aria-hidden="true">
            !
          </span>
        )}
      </td>

      {COLUMNS.map((column) => (
        <td key={column.key}>
          {column.key === 'date' ? (
            <input
              className={`${styles.cell} ${styles.dateCell}`}
              inputMode="text"
              aria-label={`${t('series.rowLabel')} ${index + 1} · ${t(column.label)}`}
              value={row.date}
              onChange={(event) => {
                onChange(index, { date: event.target.value });
              }}
            />
          ) : (
            /* Năm cột số đi qua `NumberCell` — nó giữ chuỗi thô trong lúc gõ, nếu không thì dấu
               phẩy bị nuốt ngay khi vừa gõ và một lần chạm vào ô có thể nhân giá lên nghìn lần
               (lý do đầy đủ ở docblock của nó).

               Ô chưa điền hiện dấu gạch chứ không để trắng trơn: bốn cột Mở/Cao/Thấp/Khối lượng
               thường trống cả bảng (chuỗi minh hoạ chỉ có giá đóng cửa), mà trắng trơn thì đọc ra
               là ô khoá. Ký tự thuần nên không qua i18n — cùng loại với '×' của nút xoá và '!'
               của cờ báo lỗi ngay dưới. */
            <NumberCell
              className={styles.cell}
              ariaLabel={`${t('series.rowLabel')} ${index + 1} · ${t(column.label)}`}
              placeholder="—"
              value={row[column.key]}
              onChange={(next) => {
                onChange(index, { [column.key]: next });
              }}
            />
          )}
        </td>
      ))}

      <td className={styles.flagCol}>
        <button
          type="button"
          className={styles.removeButton}
          aria-label={`${t('series.removeRow')} ${index + 1}`}
          onClick={() => {
            onRemove(index);
          }}
        >
          ×
        </button>
      </td>
    </tr>
  );
});

export function DataTableScreen() {
  const t = useT();

  /*
   * Đến từ nút "Mở bảng dữ liệu" của một trang công thức thì nút quay lại phải về ĐÚNG trang đó,
   * không về danh sách chung — chủ dự án báo mất dấu công thức đang thao tác. Tham số `from` do
   * `FormulaDetail.tsx` gắn vào link; kiểm lại bằng `FORMULA_SUMMARIES` chứ không tin thẳng
   * chuỗi trên URL, để một tham số gõ bậy không dựng ra một link trỏ vào chỗ không tồn tại.
   *
   * Cố ý dùng `FORMULA_SUMMARIES` (chỉ mục nhẹ) chứ không `findFormulaModule()`/
   * `FORMULA_MODULES`: bảng dữ liệu là màn KHÔNG liên quan gì tới việc tính toán của riêng một
   * công thức, kéo cả Registry đầy đủ (111 hàm tính) vào chỉ để so một chuỗi id sẽ nặng thêm
   * hàng chục kB First Load JS một cách vô lý — đã đo thấy /du-lieu/ nhảy từ 131 kB lên 217 kB
   * khi thử bằng `findFormulaModule()`.
   */
  const fromId = useSearchParams().get('from');
  const fromFormula = fromId === null ? undefined : FORMULA_SUMMARIES.find((f) => f.id === fromId);

  const [code, setCode] = useState('');
  const [rows, setRows] = useState<ReadonlyArray<SeriesRow>>([]);
  const [sheet, setSheet] = useState<'preset' | 'paste' | null>(null);
  /**
   * Bảng hiện tại dựng từ một bộ số liệu mẫu BẢN THẢO.
   *
   * Cố ý KHÔNG lưu vào localStorage cùng bảng: cờ này nói về phiên làm việc hiện tại, còn dữ
   * liệu đã lưu thì lần mở sau người dùng có thể đã sửa tay. Nạp mẫu bật cờ, dán tay hay sửa
   * tay thì tắt — nó chỉ dùng để đính ghi chú vào file CSV tải về.
   */
  const [fromDraft, setFromDraft] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /*
   * Đọc localStorage trong effect, KHÔNG đọc lúc khởi tạo state: bản build là HTML tĩnh nên
   * lần render đầu ở máy khách phải giống hệt lúc build, nếu không lệch hydration (bài học đợt 2).
   */
  useEffect(() => {
    try {
      const stored = parseStoredSeries(window.localStorage.getItem(PRICE_SERIES_KEY));
      setCode(stored.code);
      setRows(stored.rows);
    } catch {
      // localStorage bị chặn (chế độ riêng tư của Safari) — màn vẫn dùng được, chỉ không nhớ.
    }
    setLoaded(true);
  }, []);

  // Ghi lại sau mỗi lần sửa. Chỉ ghi sau khi đã đọc xong, nếu không lần render đầu sẽ
  // đè bảng rỗng lên dữ liệu người dùng đã có.
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(PRICE_SERIES_KEY, serializeStoredSeries({ code, rows }));
    } catch {
      // Hết dung lượng hoặc bị chặn — không chặn thao tác đang làm.
    }
  }, [code, rows, loaded]);

  const check = useMemo(() => checkSeries(rows), [rows]);
  const issueByIndex = useMemo(
    () => new Map(check.rows.map((row) => [row.index, row.issues])),
    [check],
  );

  // Hai callback này phải ổn định qua các lần render, nếu không memo của từng dòng vô tác dụng.
  const setCell = useCallback((index: number, patch: Partial<SeriesRow>) => {
    setRows((current) => updateRow(current, index, patch));
  }, []);

  const dropRow = useCallback((index: number) => {
    setRows((current) => removeRow(current, index));
  }, []);

  /**
   * Nhận bộ mẫu từ sheet WF-10.
   *
   * Trước đợt 11b màn này có một `<select>` riêng chỉ liệt kê mã, nên người dùng chọn mã mà
   * không biết bộ đó là kỳ báo cáo nào, bao nhiêu phiên, hay số liệu còn là bản thảo — cảnh
   * báo R-01 chỉ có trong sheet. Nay hai chỗ nạp mẫu dùng chung một sheet, một cách nói.
   */
  const loadPreset = useCallback((preset: Preset) => {
    setCode(preset.code);
    // Ghi nhớ bảng này dựng từ bộ mẫu bản thảo, để dấu vết đi theo cả vào file CSV tải về.
    setFromDraft(preset.isDraft);
    setRows(
      preset.bars.slice(-MAX_SERIES_ROWS).map((bar) => ({
        date: bar.date,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
      })),
    );
  }, []);

  /** Nhận kết quả từ sheet WF-11. Dán ĐÈ bảng cũ chứ không nối thêm — nối thì sinh ngày trùng. */
  const importPaste = useCallback((result: PasteResult) => {
    setFromDraft(false);
    setRows(
      result.rows.slice(0, MAX_SERIES_ROWS).map((bar) => ({
        date: bar.date,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
      })),
    );
    setSheet(null);
  }, []);

  const downloadCsv = useCallback(() => {
    const blob = new Blob([`﻿${toCsv(rows, fromDraft ? t('preset.draftExport') : undefined)}`], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${code === '' ? 'chuoi-gia' : code.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [rows, code, fromDraft, t]);

  const clearAll = useCallback(() => {
    if (!window.confirm(t('series.clearConfirm'))) return;
    setRows([]);
  }, [t]);

  return (
    <div className={styles.screen}>
      <header className={styles.head}>
        {/*
          WF-18 xếp bảng dữ liệu trong luồng công thức, nên mặc định đường ra là về danh sách
          công thức — giống hệt trang chi tiết, và cùng nhớ bộ lọc người dùng vừa đặt.

          Ngoại lệ: vào từ nút "Mở bảng dữ liệu" của một trang công thức thì về ĐÚNG trang đó.
          `rememberOrigin={false}` vì lúc này không còn là "về màn gốc" nữa — đọc sessionStorage
          rồi ghi đè bằng href công thức chỉ tổ nhấp nháy một nhịp trước khi đúng.
        */}
        {fromFormula === undefined ? (
          <BackLink />
        ) : (
          <BackLink
            fallbackHref={formulaPath(fromFormula.id)}
            labelKey="nav.backToFormula"
            rememberOrigin={false}
          />
        )}

        <h1 className={styles.title}>{t('series.title')}</h1>
        <p className={styles.subtitle}>
          {code === '' ? t('series.codeLabel') : code} · {t('series.subtitle')}
        </p>
      </header>

      <div className={styles.actions}>
        <Button
          size="sm"
          onClick={() => {
            setRows((current) => appendRow(current, emptyRow()));
          }}
        >
          + {t('series.addRow')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSheet('preset');
          }}
        >
          {t('series.loadPreset')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSheet('paste');
          }}
        >
          {t('series.paste')}
        </Button>
        <Button variant="ghost" size="sm" onClick={downloadCsv} disabled={rows.length === 0}>
          ↓ {t('series.downloadCsv')}
        </Button>
        <Button variant="ghost" size="sm" onClick={clearAll} disabled={rows.length === 0}>
          {t('series.clear')}
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className={styles.empty}>{t('series.empty')}</p>
      ) : (
        <>
          {/* Khung cuộn ngang riêng — bảng 6 cột không thể vừa 360px, và cả trang thì
              KHÔNG được tràn ngang (bài học đợt 7 với bảng lịch trả nợ WF-14). */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.flagCol}>
                    <span className="visually-hidden">{t('series.rowLabel')}</span>
                  </th>
                  {COLUMNS.map((column) => (
                    <th key={column.key} scope="col">
                      {t(column.label)}
                    </th>
                  ))}
                  <th className={styles.flagCol}>
                    <span className="visually-hidden">{t('series.removeRow')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <SeriesRowFields
                    key={index}
                    row={row}
                    index={index}
                    bad={issueByIndex.has(index)}
                    onChange={setCell}
                    onRemove={dropRow}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Nêu TỪNG dòng sai kèm lý do, không gộp thành một câu "dữ liệu không hợp lệ" —
              người dùng phải dò được đúng dòng nào để sửa (cùng cách nghĩ với WF-11). */}
          {check.rows.length > 0 && (
            <ul className={styles.issues}>
              {check.rows.map((row) => (
                <li key={row.index} className={styles.issue}>
                  <span className={styles.issueFlag} aria-hidden="true">
                    !
                  </span>
                  <span>
                    <strong>
                      {t('series.rowLabel')} {row.index + 1}
                      {rows[row.index]?.date === '' ? '' : ` (${rows[row.index]?.date})`}:
                    </strong>{' '}
                    {row.issues.map((issue) => issue.message).join(' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p className={styles.summary}>
            {/* `formatNumber` khai trả `string` nên `?? check.usableCount` từng đứng đây không
                bao giờ chạy — một đường dự phòng giả, đọc vào tưởng có xử lý ca lỗi. */}
            {formatNumber(check.usableCount)} / {check.total} {t('series.usable')}
            {check.usableCount > 0 && check.usableCount < MIN_USABLE_ROWS
              ? ` — ${t('series.needMore')}`
              : ''}
          </p>
        </>
      )}

      {/* Hai sheet của gói 2.5. Sheet xuất file WF-12 KHÔNG có ở đây: nó xuất kết quả một công
          thức ra PDF/PNG, còn lối ra của bảng này là CSV — nút "Tải CSV" ngay trên. */}
      <PresetSheet
        open={sheet === 'preset'}
        onClose={() => {
          setSheet(null);
        }}
        onLoad={loadPreset}
      />

      <PasteImportSheet
        open={sheet === 'paste'}
        onClose={() => {
          setSheet(null);
        }}
        onImport={importPaste}
      />
    </div>
  );
}
