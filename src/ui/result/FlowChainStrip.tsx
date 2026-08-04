import { buildFlowChain, t } from '@/application';
import type { FormulaSpec } from '@/application';

import styles from './FlowChainStrip.module.css';

export interface FlowChainStripProps {
  /** Các công thức của luồng. Thứ tự hiển thị suy từ `dependsOn`, không từ thứ tự mảng này. */
  formulas: ReadonlyArray<FormulaSpec>;
  /** id công thức đang xem — được tô đậm trong dải. */
  currentId?: string;
  className?: string;
}

/**
 * Dải luồng móc nối — gói WBS 2.4.6.
 *
 * WF-04: Beta → CAPM·Re → WACC → FCFF·PV → EV → Giá mục tiêu → Biên AT.
 * Thứ tự KHÔNG viết cứng ở đây — `buildFlowChain()` sắp topo từ `dependsOn` của Registry,
 * nên thêm một bước vào giữa luồng chỉ là khai thêm một cạnh (NFR-MNT-01, FR-16).
 *
 * Một bản đánh dấu duy nhất, hai cách bày: hàng ngang cuộn được trên điện thoại, cột dọc từ
 * 1024px cho cột phải của bố cục desktop WF-07. Chuyển bằng CSS chứ không render hai lần.
 *
 * Đồ thị khai sai (có vòng) thì vẫn vẽ phần lành và nói rõ phần kẹt, không làm trắng cả màn.
 */
export function FlowChainStrip({ formulas, currentId, className }: FlowChainStripProps) {
  const chain = buildFlowChain(formulas);
  if (chain.steps.length === 0 && chain.cyclic.length === 0) return null;

  const classes = [styles.wrap, className].filter(Boolean).join(' ');

  return (
    <section className={classes} aria-label={t('flow.title')}>
      <ol className={styles.list}>
        {chain.steps.map((step, index) => {
          const current = step.formulaId === currentId;
          return (
            <li key={step.formulaId} className={styles.item}>
              {index > 0 && (
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              )}
              <span
                className={current ? `${styles.step} ${styles.current}` : styles.step}
                aria-current={current ? 'step' : undefined}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      {chain.cyclic.length > 0 && (
        <p className={styles.cyclic} role="status">
          {t('flow.cyclicWarning')} {chain.cyclic.join(', ')}
        </p>
      )}
    </section>
  );
}
