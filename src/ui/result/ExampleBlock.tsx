'use client';

import { formatCalcOutput, formatValueWithUnit } from '@/application';
import type { CalcInputs, CalcOutput, FormulaSpec } from '@/application';
import { useT } from '@/application/preferences-context';
import { InlineNumber } from '@/ui/inputs';
import { Button } from '@/ui/primitives';

import styles from './ExampleBlock.module.css';

export interface ExampleBlockProps {
  formula: FormulaSpec;
  /**
   * Giá trị đang nằm ở các ô nhập của màn. Truyền vào thì dòng số của ví dụ **gõ được tại chỗ**;
   * không truyền thì khối chỉ bày số của ví dụ để đọc.
   */
  inputs?: CalcInputs;
  /** Kết quả đang hiện ở khối Kết quả — để dòng "→" nói đúng con số ấy. */
  output?: CalcOutput;
  /** Sửa một ô. Cùng đường với ô nhập ở khối Số liệu, nên không sinh ra state thứ hai. */
  onChange?: (key: string, value: number) => void;
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
 *
 * ── Vì sao dòng số ở đây gõ được, mà vẫn KHÔNG có hai kết quả ────────────────────────────────
 *
 * Khối này bày một bộ số hoàn chỉnh nhưng trước đây là ngõ cụt: người đọc thấy "Giá 92.000 ₫, EPS
 * 6.050 ₫" rồi phải tự cuộn lên gõ lại từng ô mới thấy biểu đồ vẽ theo bộ số ấy.
 *
 * Cách tránh cái bẫy "hai bộ ô nói hai kết quả": ô ở đây **không giữ state riêng**. Chúng đọc
 * `inputs` và bắn `onChange` của chính màn chi tiết, tức là cùng một biến state với ô ở khối Số
 * liệu. Gõ ở đây hay gõ ở trên là một việc; hai chỗ luôn hiện cùng con số vì chúng LÀ cùng con số.
 *
 * Còn con số của ví dụ trong Registry thì vẫn phải giữ được — nó là tài liệu (FR-02), và với 17
 * công thức thì ví dụ cố ý dùng chu kỳ ngắn hơn mặc định để tính tay kiểm được. Nên khi giá trị
 * đang nhập lệch khỏi ví dụ, khối hiện thêm một dòng "Ví dụ gốc" kèm nút quay về. Không bao giờ có
 * hai con số cùng đứng mà không nói rõ cái nào là cái nào.
 */
export function ExampleBlock({ formula, inputs, output, onChange, className }: ExampleBlockProps) {
  const t = useT();
  const { example } = formula;
  const classes = [styles.block, className].filter(Boolean).join(' ');

  /** Gõ được khi màn có truyền cả giá trị hiện tại lẫn đường ghi lại. */
  const editable = inputs !== undefined && onChange !== undefined;

  const rows = Object.entries(example.inputs).map(([key, exampleValue]) => {
    const variable = formula.variables.find((v) => v.key === key);
    const current = inputs?.[key] ?? exampleValue;
    return { key, variable, label: variable?.label ?? key, exampleValue, current };
  });

  /** Số đang nhập có còn đúng bộ của ví dụ hay không. */
  const onExample = rows.every((row) => row.current === row.exampleValue);

  return (
    /*
      Vùng CÓ TÊN, không phải một `<section>` trơn. Khối này bày cùng những giá trị mà khối Số liệu
      bày, nên ô hai bên mang cùng tên — đúng nghĩa, vì đó là một con số chứ không phải hai. Tên
      vùng là thứ giúp người dùng biết mình đang gõ ở đâu.
    */
    <section className={classes} aria-labelledby="khoi-vi-du">
      <h2 className={styles.title} id="khoi-vi-du">
        {t('example.title')}
      </h2>
      <p className={styles.subtitle}>{example.title}</p>

      <dl className={styles.inputs}>
        {rows.map((row) => (
          <div key={row.key} className={styles.pair}>
            <dt className={styles.term}>
              {/*
                Nhãn của ô nằm ở cột `<dt>` chứ không phải một `<label>`, nên ô nhận tên qua
                `aria-label`. Nếu bọc `<label>` quanh `<dt>` thì HTML không hợp lệ.
              */}
              {row.label}
            </dt>
            <dd className={styles.value}>
              {editable && row.variable !== undefined ? (
                <InlineNumber
                  spec={row.variable}
                  value={row.current}
                  onChange={(next) => {
                    onChange(row.key, next);
                  }}
                  ariaLabel={row.label}
                />
              ) : (
                formatValueWithUnit(row.exampleValue, row.variable?.unit ?? '')
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className={styles.result}>
        <span aria-hidden="true">→ </span>
        {formula.name.vi} ≈{' '}
        <strong>
          {editable && output !== undefined
            ? formatCalcOutput(output)
            : formatValueWithUnit(example.expected, formula.resultUnit)}
        </strong>
      </p>

      {example.note !== undefined && <p className={styles.note}>{example.note}</p>}

      {editable && !onExample && (
        <div className={styles.action}>
          <p className={styles.note}>
            {t('example.original')} {formatValueWithUnit(example.expected, formula.resultUnit)}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              for (const row of rows) onChange(row.key, row.exampleValue);

              /*
               * Khối Ví dụ nằm cuối trang, khối Số liệu — nơi con số vừa đổi thật sự hiện ra —
               * nằm trên đầu. Bấm xong mà không cuộn thì người dùng không thấy gì đổi, phải tự
               * cuộn lên tìm; chủ dự án báo đúng chỗ này khi tự thử. `khoi-so-lieu` là id cố định
               * của khối đó trong `FormulaDetail.tsx` — nơi DUY NHẤT dựng `ExampleBlock` có state.
               *
               * Kiểm `typeof` trước khi gọi cả `matchMedia` lẫn `scrollIntoView`: jsdom (môi
               * trường test) không cài `matchMedia` — gọi thẳng ném `TypeError`, và ca kiểm bấm
               * đúng nút này vẫn xanh nhưng vitest báo "Uncaught Exception" riêng, đúng loại lỗi
               * âm thầm mà bộ kiểm không bắt được nếu không nhìn kỹ. Trình duyệt thật luôn có cả
               * hai nên nhánh else không bao giờ chạy ở đó — hai dòng an toàn này chỉ để test sạch.
               */
              const target = document.getElementById('khoi-so-lieu');
              if (target !== null && typeof target.scrollIntoView === 'function') {
                const reduceMotion =
                  typeof window.matchMedia === 'function' &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                target.scrollIntoView({
                  behavior: reduceMotion ? 'auto' : 'smooth',
                  block: 'start',
                });
              }
            }}
          >
            {t('example.reset')}
          </Button>
        </div>
      )}

      {editable && onExample && <p className={styles.note}>{t('example.editHint')}</p>}
    </section>
  );
}
