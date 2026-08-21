'use client';

import { useId, type CSSProperties } from 'react';

import { formatValueWithUnit, isLockedForMode, snapToStep } from '@/application';
import type { Level, VariableSpec } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

import { InlineNumber } from './InlineNumber';
import styles from './SliderInput.module.css';

export interface SliderInputProps {
  spec: VariableSpec;
  value: number;
  onChange: (value: number) => void;
  mode?: Level;
  className?: string;
}

/** Giá trị có nằm đúng trên lưới bước của thanh trượt hay không. */
function onStepGrid(value: number, spec: VariableSpec): boolean {
  if (spec.step === undefined || spec.step <= 0) return true;
  return Math.abs(value - snapToStep(value, spec)) < 1e-9;
}

/**
 * Thanh trượt — gói WBS 2.3.2.
 *
 * WF-16: giá trị hiện ngay cạnh nhãn, và dưới thanh là ba mốc `min 0 · step 0,1` và `max 12`
 * đọc từ metadata chứ không viết cứng (FR-05). Validator của Registry đã bắt buộc biến kiểu
 * `slider` khai đủ min/max/step nên ở đây không phải phòng thủ thêm.
 *
 * NFR-USA-01 nói rõ "thanh trượt kéo được bằng ngón cái": vùng chạm của nút kéo đặt 28px và
 * cả hàng cao 44px, xem SliderInput.module.css.
 *
 * ── Vì sao con số cạnh nhãn GÕ ĐƯỢC ────────────────────────────────────────────────────────
 *
 * Chỗ này trước đây là một `<output>` chỉ để đọc, nên 97 biến kiểu `slider` trên toàn Registry
 * chỉ nhập được bằng cách kéo, và kéo thì bám lưới `step`. Hệ quả đo được: 39 trên 78 công thức
 * nhóm Cơ bản có ít nhất một ô như vậy, và người dùng muốn đưa số thật của một mã vào thì không
 * đưa được — lãi suất 12,37% không kéo tới được khi bước là 0,1; khoản vay 1.234.000.000 ₫ của
 * `tra-gop-nien-kim` càng không, vì bước ở đó là 10.000.000 ₫.
 *
 * Nên con số ấy giờ là một ô nhập thật, đứng đúng vị trí cũ. Hai điều theo sau:
 *
 *   · **Gõ thì KHÔNG bám lưới bước, kéo thì vẫn bám.** `step` là độ phân giải của ngón tay, không
 *     phải luật của con số. Gõ đi qua `commitValue()` nên vẫn bị kẹp về `[min, max]` — miền là
 *     luật thật, còn bước thì không.
 *   · **Thuộc tính `step` của thanh trượt hạ xuống `any` khi giá trị lệch lưới.** Thẻ `range` của
 *     HTML tự làm tròn `value` về bội của `step`, nên gõ 12,37 mà vẫn để `step="0.1"` thì nút kéo
 *     hiện ở 12,4 trong khi phép tính chạy 12,37 — hai chỗ nói hai số. Lúc đã nằm đúng lưới thì
 *     giữ nguyên `step` để phím mũi tên và cú kéo vẫn nhảy theo bước như cũ.
 */
export function SliderInput({
  spec,
  value,
  onChange,
  mode = 'advanced',
  className,
}: SliderInputProps) {
  const inputId = useId();
  const t = useT();
  const pick = usePick();
  const boxId = `${inputId}-box`;
  const labelId = `${inputId}-label`;
  const marksId = `${inputId}-marks`;
  const locked = isLockedForMode(spec, mode);

  const min = spec.min ?? 0;
  const max = spec.max ?? 100;
  const step = spec.step ?? 1;

  const classes = [styles.field, locked ? styles.locked : undefined, className]
    .filter(Boolean)
    .join(' ');

  /*
   * Phần rãnh đã tô, tính theo phần trăm để CSS vẽ bằng gradient.
   * Miền rộng bằng 0 (min trùng max) thì chia cho 0 — kẹp về 0% thay vì để `NaN%` lọt vào
   * thuộc tính CSS, chỗ đó trình duyệt bỏ qua im lặng và rãnh mất luôn phần tô.
   */
  const span = max - min;
  const fill = span > 0 ? Math.min(100, Math.max(0, ((value - min) / span) * 100)) : 0;

  return (
    <div className={classes}>
      <div className={styles.head}>
        {/*
          Nhãn trỏ vào Ô NHẬP, còn thanh trượt dùng lại đúng nhãn ấy qua `aria-labelledby`.
          Hai điều khiển cùng một tên là đúng — chúng sửa cùng một con số — và trình đọc màn hình
          phân biệt được bằng vai: một cái là `slider`, một cái là `textbox`.
        */}
        <label className={styles.label} id={labelId} htmlFor={boxId}>
          {pick(spec.label)}
        </label>

        <InlineNumber
          spec={spec}
          value={value}
          onChange={onChange}
          readOnly={locked}
          id={boxId}
          describedBy={marksId}
          className={styles.valueBox}
        />
      </div>

      <input
        id={inputId}
        className={styles.slider}
        style={{ '--fill': `${String(fill)}%` } as CSSProperties}
        type="range"
        min={min}
        max={max}
        step={onStepGrid(value, spec) ? step : 'any'}
        value={value}
        disabled={locked}
        aria-labelledby={labelId}
        aria-describedby={marksId}
        onChange={(event) => {
          // snapToStep kẹp về miền và làm tròn theo bước, tránh rác dấu phẩy động
          // kiểu 0,30000000000000004.
          onChange(snapToStep(Number(event.target.value), spec));
        }}
      />

      {/*
        Hai mốc dạt về hai đầu rãnh, đúng bản thiết kế — đọc được vị trí đang ở đâu trong miền.
        Bước nhảy vẫn nằm trong đoạn này nhưng chỉ dành cho trình đọc màn hình: nó là thông tin
        thật (aria-describedby trỏ vào đây) mà bản thiết kế không dành chỗ để bày ra.
      */}
      <p id={marksId} className={styles.marks}>
        <span>
          {t('input.sliderMin')} {formatValueWithUnit(min, spec.unit, { maxDecimals: 4 })}
        </span>
        <span className="visually-hidden">
          {t('input.sliderStep')} {formatValueWithUnit(step, spec.unit, { maxDecimals: 4 })}
        </span>
        <span>
          {t('input.sliderMax')} {formatValueWithUnit(max, spec.unit, { maxDecimals: 4 })}
        </span>
        {locked && <span className={styles.badge}>{t('input.lockedBadge')}</span>}
      </p>
    </div>
  );
}
