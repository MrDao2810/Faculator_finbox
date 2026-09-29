'use client';

import type { CSSProperties, ReactNode } from 'react';

import { isCalculated } from '@/application';
import type { CalcOutput } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

import { useCalcText } from '../i18n/units';
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
  /**
   * In câu lý do dưới "_ _" khi không tính được. Mặc định có.
   *
   * Tắt ở ô Beta và ô XIRR của màn Danh mục — chủ dự án bỏ 29/09/2026 ("không cần phải có đoạn
   * giải thích này"). Hai ô ấy gần như LUÔN ở "_ _" với người mới: beta phải nhập tay cho từng mã,
   * XIRR đòi ngày mua ở mọi mã. Nên câu lý do thành một đoạn cố định kể lại danh sách mã. Tắt câu
   * không đổi hành vi: ô vẫn "_ _" viền đứt, không bao giờ hiện 0 (FR-06).
   */
  showReason?: boolean;
  className?: string;
}

/**
 * Con số với một chỗ ngắt dòng sau mỗi dấu chấm phân nhóm.
 *
 * Số khổng lồ co tới cỡ sàn mà vẫn không vừa thẻ thì phải xuống dòng. Không có chỗ ngắt nào thì
 * `overflow-wrap: anywhere` cắt ngay giữa một nhóm ("…713.00" / "0 ₫"). `<wbr>` không thêm ký tự,
 * nên `textContent` giữ nguyên. Dấu chấm luôn là dấu phân nhóm: `format.ts` khoá cứng 'vi-VN'.
 */
function coChoNgat(text: string): ReactNode[] {
  return text.split('.').flatMap((nhom, i) => (i === 0 ? [nhom] : ['.', <wbr key={i} />, nhom]));
}

/**
 * Thẻ chỉ số — gói WBS 2.4.7.
 *
 * Bốn thẻ đầu màn danh mục WF-06: tổng giá trị, beta danh mục, XIRR, số mã.
 * WBS xếp gói này ở bản "Sau v0.2" nên đây mới là component, màn dùng nó là gói 3.4.1.
 *
 * Không tính được thì hiện `_ _` qua `formatCalcOutput()` chứ không hiện 0 — một danh mục
 * chưa đủ dữ liệu để tính XIRR mà hiện '0%' là nói dối người dùng (FR-06).
 */
export function StatTile({
  label,
  output,
  note,
  decimals = 2,
  showEyebrow = true,
  icon,
  showReason = true,
  className,
}: StatTileProps) {
  const t = useT();
  const pick = usePick();
  const calcText = useCalcText();
  const classes = [styles.tile, isCalculated(output) ? undefined : styles.empty, className]
    .filter(Boolean)
    .join(' ');
  const text = calcText(output, { maxDecimals: decimals });

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
      {/*
        `--ky-tu` là số ký tự của con số, để CSS co cỡ chữ cho vừa bề ngang thẻ — xem `.value`
        trong `StatTile.module.css`. Đếm trên CHUỖI lúc dựng chứ không đo lúc chạy: đo thì lượt dựng
        đầu ở máy khách lệch HTML tĩnh.
      */}
      <span className={styles.value} style={{ '--ky-tu': text.length } as CSSProperties}>
        {coChoNgat(text)}
      </span>
      {/*
        Không tính được thì lý do quan trọng hơn dòng phụ — thay chỗ luôn. Ô tắt lý do
        (`showReason={false}`) cũng không in dòng phụ: dòng phụ nói về một con số không có ở đây.
      */}
      {output.warning !== undefined
        ? showReason && <span className={styles.warning}>{pick(output.warning.message)}</span>
        : note !== undefined && <span className={styles.note}>{note}</span>}
    </div>
  );
}
