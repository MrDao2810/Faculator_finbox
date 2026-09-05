'use client';

import { buildFeeBreakdown, formatNumber } from '@/application';
import type { CalcContext } from '@/application';
import { useT, usePick } from '@/application/preferences-context';
import { InlineWarning } from '@/ui/result';

import { useCalcText } from '../i18n/units';
import styles from './FeeTaxBody.module.css';

export interface FeeTaxBodyProps {
  inputs: Readonly<Record<string, number>>;
  ctx: CalcContext;
}

/**
 * Khối kết quả riêng của màn WF-08 Phí & thuế giao dịch — gói WBS 3.2.3.
 *
 * WBS gọi đây là "phép tính bán hàng của sản phẩm": nhà đầu tư cá nhân hay nhìn chênh lệch
 * giá trên bảng giá rồi tưởng đó là lãi. Bảng dưới đây bóc từng khoản ra, mỗi dòng hiện luôn
 * CÔNG THỨC bên dưới nhãn để người dùng tự kiểm chứng được, không phải tin suông.
 *
 * Toàn bộ phép tính nằm ở `buildFeeBreakdown()` bên tầng Domain và có test so tới từng đồng
 * với ví dụ wireframe; ở đây chỉ còn phần bày ra màn.
 */
export function FeeTaxBody({ inputs, ctx }: FeeTaxBodyProps) {
  const t = useT();
  const pick = usePick();
  const calcText = useCalcText();
  const breakdown = buildFeeBreakdown(inputs, ctx);

  return (
    <div className={styles.body}>
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>{t('fee.breakdown')}</h2>

        <div className={styles.table}>
          {breakdown.rows.map((row) => (
            <div key={row.key} className={styles.row}>
              <div className={styles.rowBody}>
                <span className={styles.rowLabel}>{pick(row.label)}</span>
                <span className={styles.rowFormula}>{pick(row.formula)}</span>
              </div>
              <span className={styles.rowValue}>{calcText(row.output)}</span>
            </div>
          ))}

          <div className={`${styles.row} ${styles.total}`}>
            <span className={styles.rowLabel}>{t('fee.totalCost')}</span>
            <span className={styles.rowValue}>{calcText(breakdown.totalCost)}</span>
          </div>
        </div>

        {/* Một dòng chưa nhập đủ thì nói rõ ngay dưới bảng chứ không để người dùng tự đoán. */}
        {breakdown.totalCost.warning !== undefined && (
          <InlineWarning warning={breakdown.totalCost.warning} />
        )}
      </section>

      {/* Giá hoà vốn: mốc quan trọng nhất của màn, và tính được ngay cả khi chưa nhập giá bán. */}
      <div className={styles.stat}>
        <div className={styles.statBody}>
          <span className={styles.statLabel}>{t('fee.breakEven')}</span>
          <span className={styles.statNote}>{t('fee.breakEvenNote')}</span>
        </div>
        <span className={styles.statValue}>
          {calcText(breakdown.breakEven, { maxDecimals: 0 })}
        </span>
      </div>

      {/*
        Thẻ lợi nhuận ròng — con số người dùng mở màn này để xem.
        Nền xanh đặc theo bản thiết kế. Dấu +/− do formatNumber({ signed }) lo, nên lãi và lỗ
        phân biệt được cả khi mất màu (NFR-USA-06); huy hiệu ROI cũng mang dấu của chính nó.
      */}
      <section className={styles.headline}>
        <span className={styles.headlineLabel}>{t('fee.netProfit')}</span>
        <span className={styles.headlineValue}>
          {breakdown.netProfit.value === null
            ? calcText(breakdown.netProfit)
            : `${formatNumber(breakdown.netProfit.value, { maxDecimals: 0, signed: true })} ₫`}
        </span>

        <span className={styles.headlineFoot}>
          <span className={roiClass(breakdown.netRoi.value, styles)}>
            <span className={styles.roiLabel}>{t('fee.netRoi')}</span>{' '}
            <span>
              {breakdown.netRoi.value === null
                ? calcText(breakdown.netRoi)
                : `${formatNumber(breakdown.netRoi.value, { minDecimals: 2, maxDecimals: 2, signed: true })} %`}
            </span>
          </span>
          <span className={styles.headlineNote}>
            {t('fee.grossProfit')} {calcText(breakdown.grossProfit, { maxDecimals: 0 })}
          </span>
        </span>
      </section>

      {breakdown.netProfit.warning !== undefined && (
        <InlineWarning warning={breakdown.netProfit.warning} />
      )}
    </div>
  );
}

/**
 * Màu huy hiệu ROI: xanh lá khi lãi, đỏ khi lỗ, trung tính khi chưa tính được.
 *
 * Chưa tính được KHÔNG rơi về nhánh "lỗ": một ô còn trống không phải là một khoản lỗ, và tô đỏ
 * nó lên là nói sai chuyện đang xảy ra (FR-06).
 */
function roiClass(value: number | null, styles: Record<string, string>): string {
  const tone = value === null ? styles.roiUnknown : value >= 0 ? styles.roiGain : styles.roiLoss;
  return `${styles.roi} ${tone ?? ''}`.trim();
}
