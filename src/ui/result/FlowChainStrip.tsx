'use client';

import { buildFlowChain } from '@/application';
import type { FormulaSpec } from '@/application';
import { useT } from '@/application/preferences-context';

import styles from './FlowChainStrip.module.css';

/** Trạng thái một bước, dùng để chỉ ra chỗ chuỗi đang gãy. */
export type FlowStatus = 'ok' | 'error';

export interface FlowChainStripProps {
  /** Các công thức của luồng. Thứ tự hiển thị suy từ `dependsOn`, không từ thứ tự mảng này. */
  formulas: ReadonlyArray<FormulaSpec>;
  /** id công thức đang xem — được tô đậm trong dải. */
  currentId?: string;
  /**
   * Bước nào đang ra số, bước nào đang lỗi. Khoá là id công thức.
   * Không truyền thì dải chỉ vẽ thứ tự, không nói gì về trạng thái.
   */
  statuses?: Readonly<Record<string, FlowStatus>>;
  /**
   * Xếp dọc từ 1024px trở lên — dành cho cột phải của bố cục desktop WF-07.
   *
   * Mặc định TẮT, và đó là lựa chọn có lý do: nơi gọi thật đầu tiên là màn chi tiết, vốn một
   * cột chạy hết bề ngang. Bật dọc ở đó thì trên desktop dải xổ thành một cột pill cao lêu nghêu
   * giữa trang, trong khi dải ngang cuộn được vẫn đọc tốt ở mọi bề ngang.
   */
  column?: boolean;
  className?: string;
}

/**
 * Dải luồng móc nối — gói WBS 2.4.6, nối dây thật ở gói 5.2.3.
 *
 * WF-04: Beta → CAPM·Re → WACC → FCFF·PV → EV → Giá mục tiêu → Biên AT.
 * Thứ tự KHÔNG viết cứng ở đây — `buildFlowChain()` sắp topo từ `dependsOn` của Registry,
 * nên thêm một bước vào giữa luồng chỉ là khai thêm một cạnh (NFR-MNT-01, FR-16).
 *
 * ── Mũi tên chỉ vẽ khi có quan hệ thật ──────────────────────────────────────────────────────
 *
 * Bản đầu chèn `→` giữa MỌI cặp bước liên tiếp. Với chuỗi thẳng thì đúng, nhưng đồ thị phụ thuộc
 * có rẽ nhánh: CAPM cấp cho cả WACC lẫn Mô hình Gordon. Sắp topo xong hai nhánh ấy nằm cạnh nhau,
 * và mũi tên giữa chúng nói ra một quan hệ **không tồn tại** — WACC không cấp gì cho Gordon.
 *
 * Nay mũi tên chỉ hiện khi bước sau thật sự khai bước ngay trước nó trong `dependsOn`; hai nhánh
 * song song ngăn nhau bằng dấu chấm giữa. Dữ liệu để biết điều đó đã có sẵn trong `FlowStep`,
 * không phải hỏi thêm ai.
 *
 * Đồ thị khai sai (có vòng) thì vẫn vẽ phần lành và nói rõ phần kẹt, không làm trắng cả màn.
 */
export function FlowChainStrip({
  formulas,
  currentId,
  statuses,
  column = false,
  className,
}: FlowChainStripProps) {
  const t = useT();
  const chain = buildFlowChain(formulas);
  if (chain.steps.length === 0 && chain.cyclic.length === 0) return null;

  const classes = [styles.wrap, column ? styles.column : '', className].filter(Boolean).join(' ');

  return (
    <section className={classes} aria-label={t('flow.title')}>
      <ol className={styles.list}>
        {chain.steps.map((step, index) => {
          const current = step.formulaId === currentId;
          const status = statuses?.[step.formulaId];
          const previous = chain.steps[index - 1];
          const noiTiep = previous !== undefined && step.dependsOn.includes(previous.formulaId);

          const stepClasses = [
            styles.step,
            current ? styles.current : '',
            status === 'error' ? styles.error : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <li key={step.formulaId} className={styles.item}>
              {index > 0 &&
                (noiTiep ? (
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                ) : (
                  /* Nhánh song song: ngăn bằng dấu chấm, và nói rõ bằng chữ cho trình đọc màn hình. */
                  <span className={styles.branch}>
                    <span aria-hidden="true">·</span>
                    <span className="visually-hidden">{t('flow.branch')}</span>
                  </span>
                ))}

              <span className={stepClasses} aria-current={current ? 'step' : undefined}>
                {step.label}
                {/*
                  Trạng thái lỗi phải đọc được bằng CHỮ, không chỉ bằng màu và viền (NFR-USA-06).
                  Đây cũng là thứ khiến dải có ích trên màn nâng cao: nó chỉ thẳng vào bước đang
                  làm gãy chuỗi, thay vì bắt người dùng dò từng công thức.
                */}
                {status === 'error' && <span className={styles.tag}>{t('flow.stepError')}</span>}
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
