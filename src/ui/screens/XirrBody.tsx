'use client';

import { checkCashflowSeries, emptyCashflowRow } from '@/application';
import type { CalcOutput, CashflowIssueCode, CashflowRow } from '@/application';
import { useT, usePick } from '@/application/preferences-context';
import { DateCell, NumberCell } from '@/ui/inputs';
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

/** Lỗi mà chính ô trống đã cho thấy — không in thành câu dưới bảng. Xem `issueLines`. */
const SELF_EVIDENT: ReadonlySet<CashflowIssueCode> = new Set(['MISSING_DATE', 'MISSING_AMOUNT']);

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
  /*
   * BẮT BUỘC cho câu lỗi từng dòng: `CashflowRowIssue.message` là `Bilingual` (`{vi, en}`), không
   * phải chuỗi. Nối thẳng một object vào chuỗi thì JavaScript cho ra `[object Object]` — và đó là
   * đúng thứ đã hiện trên màn: *"Dòng 1: [object Object] [object Object]"*.
   *
   * TypeScript không bắt được: `Array.join()` khai trả `string` với MỌI kiểu phần tử. Chỉ khi
   * dựng thẳng object vào JSX nó mới báo, mà `join()` thì đã kịp nuốt mất lỗi ấy.
   *
   * Bảng chuỗi giá (`DataTableScreen`) không dính vì `RowIssue.message` bên đó là `string` thuần.
   * Hai bảng trông giống nhau nhưng hai kiểu khác nhau — đừng chép qua lại mà không xem kiểu.
   */
  const pick = usePick();

  const check = checkCashflowSeries(rows);
  const issueByIndex = new Map(check.rows.map((row) => [row.index, row.issues]));
  /*
   * Danh sách lỗi dưới bảng chỉ in lý do mà ô không tự cho thấy. "Thiếu ngày" / "Thiếu số tiền"
   * không in nữa (chủ dự án, 15/10/2026 — "đoạn text dư thừa"): bảng mở ra với hai dòng trống nên
   * hai câu ấy hiện ngay cho từng dòng, nhắc lại đúng điều ô trống đã nói. Dòng thiếu vẫn mang cờ
   * "!" và vẫn bị loại khỏi phép tính, vì mã lỗi của nó còn nguyên trong `checkCashflowSeries`.
   *
   * Dòng đếm "N / M dòng tiền dùng được" dưới bảng cũng bỏ cùng ngày, theo yêu cầu riêng của chủ dự
   * án ("không cần chú thích"): cờ "!" trên từng dòng đã chỉ ra dòng nào chưa dùng được.
   */
  const issueLines = check.rows.flatMap((row) => {
    const shown = row.issues.filter((issue) => !SELF_EVIDENT.has(issue.code));
    return shown.length === 0 ? [] : [{ index: row.index, issues: shown }];
  });

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
                    {/* Ô chữ in ngày/tháng/năm, không phải `type="date"`: ô của trình duyệt in theo
                        ngôn ngữ của trình duyệt (tháng/ngày/năm trên Chrome tiếng Anh), lệch với
                        mọi chỗ khác của sản phẩm — xem `DateInput.tsx`. */}
                    <DateCell
                      className={`${styles.cell} ${styles.dateCell}`}
                      ariaLabel={`${t('xirr.rowLabel')} ${String(index + 1)} · ${t('xirr.colDate')}`}
                      value={row.date}
                      onChange={(next) => {
                        setCell(index, { date: next });
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
        {issueLines.length > 0 && (
          <ul className={styles.issues}>
            {issueLines.map((row) => (
              <li key={row.index} className={styles.issue}>
                <span className={styles.issueFlag} aria-hidden="true">
                  !
                </span>
                <span>
                  <strong>
                    {t('xirr.rowLabel')} {row.index + 1}:
                  </strong>{' '}
                  {row.issues.map((issue) => pick(issue.message)).join(' ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ResultBlock output={output} />
    </div>
  );
}
