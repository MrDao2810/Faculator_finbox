'use client';

import type { ReactNode } from 'react';

import { formatCalcOutput, isCalculated } from '@/application';
import type { CalcOutput } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

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
  /**
   * Icon nhỏ ở góc trên thẻ — bản thiết kế đợt 12. Luôn là SVG `aria-hidden`: nhãn chữ mới là
   * thứ trình đọc màn hình đọc, và `textContent` của thẻ không được đổi.
   */
  icon?: ReactNode;
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
  icon,
  className,
}: StatTileProps) {
  const t = useT();
  const pick = usePick();
  const classes = [styles.tile, isCalculated(output) ? undefined : styles.empty, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {/*
        Icon là con TRỰC TIẾP của thẻ, không bọc chung với nhãn vào một khối đầu thẻ.
        `PortfolioScreen.test.tsx` dò giá trị bằng `findByText(nhãn).parentElement` — gộp icon và
        nhãn vào một `<div>` là `parentElement` của nhãn không còn chứa con số nữa, và bốn ca ở
        đó đỏ mà không nói được lý do thật.
      */}
      {icon !== undefined && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {showEyebrow && <span className={styles.eyebrow}>{t('stat.eyebrow')}</span>}
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{formatCalcOutput(output, { maxDecimals: decimals })}</span>
      {/* Không tính được thì lý do quan trọng hơn dòng phụ — thay chỗ luôn. */}
      {output.warning !== undefined ? (
        <span className={styles.warning}>{pick(output.warning.message)}</span>
      ) : (
        note !== undefined && <span className={styles.note}>{note}</span>
      )}
    </div>
  );
}
