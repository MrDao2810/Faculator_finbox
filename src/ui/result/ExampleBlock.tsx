'use client';

import type { CalcInputs, CalcOutput, FormulaSpec } from '@/application';
import { usePick, useT } from '@/application/preferences-context';
import { InlineNumber } from '@/ui/inputs';

import { useCalcText, useValueText } from '../i18n/units';
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
  const pick = usePick();
  const calcText = useCalcText();
  const valueText = useValueText();
  const { example } = formula;
  const classes = [styles.block, className].filter(Boolean).join(' ');

  /** Gõ được khi màn có truyền cả giá trị hiện tại lẫn đường ghi lại. */
  const editable = inputs !== undefined && onChange !== undefined;

  const rows = Object.entries(example.inputs).map(([key, exampleValue]) => {
    const variable = formula.variables.find((v) => v.key === key);
    const current = inputs?.[key] ?? exampleValue;
    return {
      key,
      variable,
      label: variable !== undefined ? pick(variable.label) : key,
      exampleValue,
      current,
    };
  });

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
      <p className={styles.subtitle}>{pick(example.title)}</p>

      {/*
        Mô tả đứng NGAY dưới tiêu đề, trước cả bộ số — người đọc phải thấy "chuyện gì đã xảy ra"
        trong tầm mắt đầu tiên, không phải cuộn qua hết bộ số và dòng kết quả mới tới.

        Trích dẫn (`example.source`) tách thành DÒNG RIÊNG ngay dưới, không lẫn vào câu mô tả:
        một câu kể chuyện, một dòng ghi nguồn — gộp chung từng đọc rối, vừa mô tả vừa dẫn nguồn
        trong cùng một câu. Chỉ khoảng một phần ba công thức neo ví dụ vào một trường hợp có thật
        mới có dòng này; phần còn lại không hiện.
      */}
      {example.note !== undefined && <p className={styles.note}>{pick(example.note)}</p>}
      {example.source !== undefined && (
        <p className={styles.source}>
          {t('example.source')} {pick(example.source)}
        </p>
      )}

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
                valueText(row.exampleValue, row.variable?.unit ?? '')
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className={styles.result}>
        <span aria-hidden="true">→ </span>
        {pick(formula.name)} ≈{' '}
        <strong>
          {editable && output !== undefined
            ? calcText(output)
            : valueText(example.expected, formula.resultUnit)}
        </strong>
      </p>

      {/*
        Dòng "Sửa được ngay tại đây — thay bằng số thật của mã bạn đang xem." đã BỎ — chủ dự án
        chốt 10/09/2026.

        Nó là câu hướng dẫn cách dùng, và nó đứng ở đúng chỗ người dùng đã tự làm được việc ấy: ô
        nhập nằm ngay trên, sửa vào là kết quả đổi theo từng phím. Câu này chỉ còn nghĩa với lần mở
        màn ĐẦU TIÊN, mà nó thì hiện ở cả 111 màn, mọi lần.

        `styles.note` vẫn còn dùng — nó là luật của `example.note`, ghi chú riêng của từng công
        thức, thứ khác hẳn và vẫn hiện.
      */}
    </section>
  );
}
