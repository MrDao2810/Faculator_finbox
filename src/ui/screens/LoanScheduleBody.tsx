'use client';

import {
  SCHEDULE_GAP,
  amortisationFor,
  condenseWithGaps,
  findUnitScale,
  formatNumber,
  t,
} from '@/application';
import { usePreferences } from '@/application/preferences-context';
import { Table } from '@/ui/primitives';

import styles from './LoanScheduleBody.module.css';

export interface LoanScheduleBodyProps {
  inputs: Readonly<Record<string, number>>;
}

/** Thẻ tóm tắt luôn theo triệu đồng — hai con số ấy là để đọc lướt, không phải để so bảng. */
const MILLION = 1_000_000;

/** Số cột của bảng — hàng "…" phải trải đủ chừng này ô. */
const COLUMN_COUNT = 4;

/**
 * Số chữ số thập phân theo bậc đơn vị.
 * Ở bậc tỷ ₫ mà chỉ để 2 số lẻ thì kỳ đầu của khoản vay 800 triệu ra "0,01" — mất hết thông
 * tin. Bậc càng lớn thì càng cần nhiều số lẻ.
 */
const DECIMALS: Readonly<Record<string, number>> = { dong: 0, million: 2, billion: 4 };

/**
 * Khối kết quả riêng của màn WF-14 Vay nợ — gói WBS 3.2.4.
 *
 * Ba số lớn ở trên, rồi bảng lịch trả nợ. Bảng đầy đủ có 240 kỳ, nhưng chỉ dựng ra DOM phần
 * `condenseSchedule()` chọn: 12 kỳ đầu (giai đoạn người vay quan tâm nhất), mốc cuối mỗi năm,
 * và kỳ cuối. Phần chọn kỳ nào nằm ở tầng Domain nên test được bằng Node.
 *
 * Bảng đi qua primitive `Table` — nó đã có vùng cuộn ngang riêng, nên bốn cột không làm cả
 * trang cuộn ngang ở 360px (NFR-USA-02).
 */
export function LoanScheduleBody({ inputs }: LoanScheduleBodyProps) {
  /*
   * Bậc đơn vị của bảng lấy từ cài đặt (WF-13). Chỉ đổi cách BÀY con số — số kỳ, số tiền và
   * mọi phép tính vẫn tính bằng đồng ở tầng Domain.
   */
  const { unitScale } = usePreferences();
  const scale = findUnitScale(unitScale);
  const decimals = DECIMALS[scale.id] ?? 2;

  const rows = amortisationFor(inputs);

  if (rows === null || rows.length === 0) {
    // Kỳ hạn 0 — công thức đã báo lỗi ở khối kết quả phía trên, đây không nhắc lại lần nữa.
    return null;
  }

  const totalInterest = rows.reduce((sum, row) => sum + row.interest, 0);
  const totalPaid = rows.reduce((sum, row) => sum + row.payment, 0);
  const firstPayment = rows[0]?.payment ?? 0;
  const cells = condenseWithGaps(rows);
  const shownCount = cells.filter((cell) => cell !== SCHEDULE_GAP).length;
  const skipped = rows.length - shownCount;

  return (
    <div className={styles.body}>
      {/*
        Một thẻ gộp thay vì ba thẻ rời, đúng bản thiết kế: khoản trả hằng tháng là con số người
        vay quyết định theo, còn tổng lãi và tổng phải trả là hai con số bổ nghĩa cho nó.
      */}
      <section className={styles.summary}>
        <span className={styles.summaryLabel}>{t('loan.monthly')}</span>
        <span className={styles.summaryValue}>
          {formatNumber(firstPayment, { maxDecimals: 0 })} ₫
        </span>

        <div className={styles.subStats}>
          <div className={styles.subStat}>
            <span className={styles.subLabel}>{t('loan.totalInterest')}</span>
            <span className={styles.subValue}>
              {formatNumber(totalInterest / MILLION, { maxDecimals: 1 })} {t('loan.millionDong')}
            </span>
          </div>
          <div className={styles.subStat}>
            <span className={styles.subLabel}>{t('loan.totalPaid')}</span>
            <span className={styles.subValue}>
              {formatNumber(totalPaid / MILLION, { maxDecimals: 1 })} {t('loan.millionDong')}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.block}>
        <div className={styles.blockHead}>
          <h2 className={styles.blockTitle}>{t('loan.schedule')}</h2>
          <span className={styles.unitNote}>
            {t('loan.tableUnit')} {scale.label}
          </span>
        </div>

        <Table caption={t('loan.schedule')} hideCaption>
          <thead>
            <tr>
              <th scope="col">{t('loan.colPeriod')}</th>
              <th scope="col" className="numeric">
                {t('loan.colPrincipal')}
              </th>
              <th scope="col" className="numeric">
                {t('loan.colInterest')}
              </th>
              <th scope="col" className="numeric">
                {t('loan.colBalance')}
              </th>
            </tr>
          </thead>
          <tbody>
            {cells.map((cell, index) =>
              cell === SCHEDULE_GAP ? (
                /*
                  Hàng "…" đánh dấu chỗ đã bỏ bớt kỳ. Vị trí trong mảng là danh tính ổn định duy
                  nhất của nó — nó không có số kỳ nào cả. Trình đọc màn hình đọc câu tiếng Việt
                  chứ không đọc ba dấu chấm.
                */
                <tr key={`gap-${String(index)}`} className={styles.gapRow}>
                  <td colSpan={COLUMN_COUNT}>
                    <span aria-hidden="true">…</span>
                    <span className="visually-hidden">{t('loan.gapRow')}</span>
                  </td>
                </tr>
              ) : (
                <tr key={cell.period}>
                  <th scope="row" className={styles.period}>
                    {cell.period}
                  </th>
                  <td className="numeric">
                    {formatNumber(cell.principal / scale.factor, { maxDecimals: decimals })}
                  </td>
                  <td className="numeric">
                    {formatNumber(cell.interest / scale.factor, { maxDecimals: decimals })}
                  </td>
                  <td className="numeric">
                    {formatNumber(cell.balance / scale.factor, { maxDecimals: decimals })}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </Table>

        {/*
          Nói rõ đã rút gọn bao nhiêu kỳ. Cắt bớt mà im lặng thì người dùng tưởng khoản vay chỉ
          có bấy nhiêu kỳ — cùng nguyên tắc với dòng "đã cắt bớt" của sheet dán dữ liệu.
        */}
        {skipped > 0 && (
          <p className={styles.condensed}>
            {t('loan.condensed.before')} {shownCount}/{rows.length} {t('loan.condensed.after')}
          </p>
        )}
      </section>
    </div>
  );
}
