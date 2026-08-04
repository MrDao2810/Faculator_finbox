import { formatValueWithUnit, t } from '@/application';
import type { FormulaSpec } from '@/application';

import styles from './ExampleBlock.module.css';

export interface ExampleBlockProps {
  formula: FormulaSpec;
  className?: string;
}

/**
 * Khối ví dụ thực tế — gói WBS 2.4.5.
 *
 * WF-03 khối 8: 'FPT — Giá 92.000đ, EPS 6.050đ → P/E ≈ 15,2 lần.'
 * Số liệu lấy từ `formula.example` của Registry (FR-02) và định dạng qua cùng bộ format với
 * khối kết quả, để hai chỗ không hiện số theo hai kiểu.
 *
 * Nhãn của từng đầu vào tra ngược từ `variables` theo key — nếu Registry khai một key không
 * có trong danh sách biến thì hiện thẳng key, để lỗi lộ ra chứ không im lặng bỏ qua.
 */
export function ExampleBlock({ formula, className }: ExampleBlockProps) {
  const { example } = formula;
  const classes = [styles.block, className].filter(Boolean).join(' ');

  const inputs = Object.entries(example.inputs).map(([key, value]) => {
    const variable = formula.variables.find((v) => v.key === key);
    return {
      key,
      label: variable?.label ?? key,
      text: formatValueWithUnit(value, variable?.unit ?? ''),
    };
  });

  return (
    <section className={classes}>
      <h2 className={styles.title}>{t('example.title')}</h2>
      <p className={styles.subtitle}>{example.title}</p>

      <dl className={styles.inputs}>
        {inputs.map((input) => (
          <div key={input.key} className={styles.pair}>
            <dt className={styles.term}>{input.label}</dt>
            <dd className={styles.value}>{input.text}</dd>
          </div>
        ))}
      </dl>

      <p className={styles.result}>
        <span aria-hidden="true">→ </span>
        {formula.name.vi} ≈{' '}
        <strong>{formatValueWithUnit(example.expected, formula.resultUnit)}</strong>
      </p>

      {example.note !== undefined && <p className={styles.note}>{example.note}</p>}
    </section>
  );
}
