'use client';

import { formatCalcOutput, isCalculated } from '@/application';
import type { CalcOutput } from '@/application';
import { useT } from '@/application/preferences-context';

import styles from './StatTile.module.css';

export interface StatTileProps {
  label: string;
  output: CalcOutput;
  /** Dòng phụ dưới con số, ví dụ 'so với đầu kỳ'. */
  note?: string;
  /** Số chữ số thập phân. Mặc định 2. */
  decimals?: number;
  /**
   * Hiện dòng chữ nhỏ "CHỈ SỐ" phía trên nhãn.
   * Tắt khi cả lưới toàn thẻ chỉ số — lúc đó nhắc lại bốn lần chỉ làm nhiễu, đúng như bản
   * thiết kế WF-06 vẽ.
   */
  showEyebrow?: boolean;
  className?: string;
}

/**
 * Thẻ chỉ số — gói WBS 2.4.7.
 *
 * Bốn thẻ đầu màn danh mục WF-06: tổng giá trị, beta danh mục, XIRR, số mã.
 * WBS xếp gói này ở bản "Sau v0.2" nên đây mới là component, màn dùng nó là gói 3.4.1.
 *
 * Không tính được thì hiện `— , —` qua `formatCalcOutput()` chứ không hiện 0 — một danh mục
 * chưa đủ dữ liệu để tính XIRR mà hiện '0%' là nói dối người dùng (FR-06).
 */
export function StatTile({
  label,
  output,
  note,
  decimals = 2,
  showEyebrow = true,
  className,
}: StatTileProps) {
  const t = useT();
  const classes = [styles.tile, isCalculated(output) ? undefined : styles.empty, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {showEyebrow && <span className={styles.eyebrow}>{t('stat.eyebrow')}</span>}
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{formatCalcOutput(output, { maxDecimals: decimals })}</span>
      {/* Không tính được thì lý do quan trọng hơn dòng phụ — thay chỗ luôn. */}
      {output.warning !== undefined ? (
        <span className={styles.warning}>{output.warning.message}</span>
      ) : (
        note !== undefined && <span className={styles.note}>{note}</span>
      )}
    </div>
  );
}
