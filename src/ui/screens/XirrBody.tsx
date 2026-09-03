'use client';

import { cashflowsOf, checkCashflowSeries, emptyCashflowRow } from '@/application';
import type { CalcOutput, CashflowRow } from '@/application';
import { useT } from '@/application/preferences-context';
import { NumberCell } from '@/ui/inputs';
import { Button, Table } from '@/ui/primitives';
import { ResultBlock } from '@/ui/result';

import styles from './XirrBody.module.css';

export interface XirrBodyProps {
  output: CalcOutput;
  rows: ReadonlyArray<CashflowRow>;
  onRowsChange: (rows: ReadonlyArray<CashflowRow>) => void;
}

/** Trần số dòng — XIRR đọc vài giao dịch, không phải chuỗi giá hàng trăm phiên như WF-05. */
const MAX_ROWS = 200;

/**
 * Thân riêng của XIRR — công thức duy nhất trong Registry mà đầu vào chính là một BẢNG có độ
 * dài tuỳ ý, không phải vài ô `VariableSpec` (gói WBS 3.3.1, phần "màn dòng tiền có ngày").
 *
 * Đặt vào đúng chỗ khối Kết quả thường đứng (`ownsResult` ở `DetailBody.tsx`): bảng dòng tiền
 * đọc như phần tiếp của khối Số liệu — nơi đó chỉ có một ô "Suất sinh lợi khởi điểm", sẽ trông
 * dở dang nếu thiếu bảng này — rồi `ResultBlock` tự vẽ khối Kết quả chuẩn ngay dưới, dùng đúng
 * `output` mà `FormulaDetail` đã tính (không tính lại — xem docblock ở `DetailBodyProps.output`).
 */
export function XirrBody({ output, rows, onRowsChange }: XirrBodyProps) {
  const t = useT();

  const check = checkCashflowSeries(rows);
  const issueByIndex = new Map(check.rows.map((row) => [row.index, row.issues]));

  const setCell = (index: number, patch: Partial<CashflowRow>) => {
    onRowsChange(rows.map((row, position) => (position === index ? { ...row, ...patch } : row)));
  };

  const removeCell = (index: number) => {
    onRowsChange(rows.filter((_, position) => position !== index));
  };

  const addCell = () => {
    if (rows.length >= MAX_ROWS) return;
    onRowsChange([...rows, emptyCashflowRow()]);
  };

  return (
    <div className={styles.body}>
      <section className={styles.block}>
        <div className={styles.blockHead}>
          <h2 className={styles.blockTitle}>{t('xirr.tableTitle')}</h2>
          <Button size="sm" onClick={addCell} disabled={rows.length >= MAX_ROWS}>
            + {t('xirr.addRow')}
          </Button>
        </div>

        <p className={styles.hint}>{t('xirr.hint')}</p>

        <Table caption={t('xirr.tableTitle')} hideCaption>
          <thead>
            <tr>
              <th className={styles.flagCol}>
                <span className="visually-hidden">{t('xirr.rowLabel')}</span>
              </th>
              <th scope="col" className={styles.dateCol}>
                {t('xirr.colDate')}
              </th>
              <th scope="col" className="numeric">
                {t('xirr.colAmount')}
              </th>
              <th className={styles.flagCol}>
                <span className="visually-hidden">{t('xirr.removeRow')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const bad = issueByIndex.has(index);
              return (
                <tr key={index} className={bad ? styles.badRow : undefined}>
                  <td className={styles.flagCol}>
                    {bad && (
                      <span className={styles.flag} aria-hidden="true">
                        !
                      </span>
                    )}
                  </td>
                  <td>
                    <input
                      className={`${styles.cell} ${styles.dateCell}`}
                      type="date"
                      aria-label={`${t('xirr.rowLabel')} ${String(index + 1)} · ${t('xirr.colDate')}`}
                      value={row.date}
                      onChange={(event) => {
                        setCell(index, { date: event.target.value });
                      }}
                    />
                  </td>
                  <td>
                    {/* Cùng `NumberCell` với bảng WF-05 — dòng tiền có số lẻ nhiều hơn cả chuỗi
                        giá, nên đây đúng là chỗ lỗi "nuốt dấu phẩy" cắn đau nhất. */}
                    <NumberCell
                      className={styles.cell}
                      ariaLabel={`${t('xirr.rowLabel')} ${String(index + 1)} · ${t('xirr.colAmount')}`}
                      value={row.amount}
                      onChange={(next) => {
                        setCell(index, { amount: next });
                      }}
                    />
                  </td>
                  <td className={styles.flagCol}>
                    <button
                      type="button"
                      className={styles.removeButton}
                      aria-label={`${t('xirr.removeRow')} ${String(index + 1)}`}
                      onClick={() => {
                        removeCell(index);
                      }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {/* Nêu TỪNG dòng sai kèm lý do — cùng cách nghĩ với bảng chuỗi giá WF-05. */}
        {check.rows.length > 0 && (
          <ul className={styles.issues}>
            {check.rows.map((row) => (
              <li key={row.index} className={styles.issue}>
                <span className={styles.issueFlag} aria-hidden="true">
                  !
                </span>
                <span>
                  <strong>
                    {t('xirr.rowLabel')} {row.index + 1}:
                  </strong>{' '}
                  {row.issues.map((issue) => issue.message).join(' ')}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className={styles.summary}>
          {cashflowsOf(rows).length} / {rows.length} {t('xirr.usable')}
        </p>
      </section>

      <ResultBlock output={output} />
    </div>
  );
}
