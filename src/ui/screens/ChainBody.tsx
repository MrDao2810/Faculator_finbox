'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formulaPath, variablesForLevel } from '@/application';
import type { ChainInputs, ChainOverrides, ChainResult, FormulaSpec, Level } from '@/application';
import { usePick, useT } from '@/application/preferences-context';
import { LinkedInput, VariableField, isWideControl } from '@/ui/inputs';
import { FlowChainStrip, InlineWarning } from '@/ui/result';
import type { FlowStatus } from '@/ui/result';

import { useCalcText } from '../i18n/units';
import styles from './ChainBody.module.css';

export interface ChainBodyProps {
  /** Mọi công thức của chuỗi, gồm cả công thức đang xem. */
  formulas: ReadonlyArray<FormulaSpec>;
  /** Chuỗi đã tính xong — màn chi tiết tính một lần rồi dùng chung cho cả khối này. */
  chain: ChainResult;
  currentId: string;
  inputs: ChainInputs;
  overrides: ChainOverrides;
  onInput: (formulaId: string, key: string, value: number) => void;
  onOverride: (formulaId: string, key: string, value: number | undefined) => void;
  mode: Level;
}

/**
 * Khối chuỗi công thức của màn nâng cao WF-04 — gói WBS 3.2.2.
 *
 * Đây là chỗ FR-15 hiện ra thành thứ người dùng nhìn thấy: dải luồng chỉ rõ thứ tự các bước,
 * mỗi bước trước/sau là một thẻ gập được có ô nhập riêng và kết quả riêng, và bước nào gãy thì
 * dải nói thẳng bước đó gãy.
 *
 * ── Vì sao khối này KHÔNG dựng lại ô nhập của công thức đang xem ────────────────────────────
 *
 * Ô của công thức đang xem đã nằm ở khối "Số liệu" phía trên, và ô móc nối của nó cũng dựng
 * ngay tại đó bằng `LinkedInput`. Bày lại lần hai ở đây là hai điều khiển cho cùng MỘT con số —
 * đúng lớp lỗi mà `ownsResult()` sinh ra để chặn ở WF-08 (kết quả hiện hai lần cách nhau một
 * khối). Khối này chỉ lo những bước **khác**.
 *
 * ── Trước / sau, suy từ thứ tự topo chứ không so bậc ────────────────────────────────────────
 *
 * `chainFor()` chỉ lấy tổ tiên và hậu duệ của công thức đang xem, không lấy nhánh song song.
 * Nên trong thứ tự topo, mọi bước đứng TRƯỚC công thức đang xem đều là thứ cấp số liệu cho nó,
 * và mọi bước đứng SAU đều là thứ tiêu thụ kết quả của nó. Không cần so `depth`.
 */
export function ChainBody({
  formulas,
  chain,
  currentId,
  inputs,
  overrides,
  onInput,
  onOverride,
  mode,
}: ChainBodyProps) {
  const specById = new Map(formulas.map((spec) => [spec.id, spec]));

  /*
   * Bước cấp số liệu trực tiếp cho công thức đang xem thì mở sẵn — đó là thứ người dùng bật chế
   * độ Nâng cao để sửa (đổi beta rồi xem suất chiết khấu đổi theo). Các bước còn lại gập lại,
   * nhưng dòng tóm tắt vẫn hiện kết quả nên không phải mở ra mới biết chuỗi đang chạy tới đâu.
   */
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(
    () => new Set(chain.byId.get(currentId)?.dependsOn ?? []),
  );
  const t = useT();
  const pick = usePick();
  const calcText = useCalcText();

  const currentIndex = chain.steps.findIndex((step) => step.formulaId === currentId);
  if (currentIndex === -1) return null;

  const statuses: Record<string, FlowStatus> = {};
  for (const step of chain.steps) {
    statuses[step.formulaId] = step.output.value === null ? 'error' : 'ok';
  }

  function toggle(id: string, open: boolean): void {
    setOpenIds((current) => {
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function theBuoc(index: number) {
    const step = chain.steps[index];
    if (step === undefined) return null;

    const spec = specById.get(step.formulaId);
    if (spec === undefined) return null;

    const linkedKeys = new Set(step.fields.map((field) => field.spec.key));
    const ownInputs = inputs[step.formulaId] ?? {};
    const ownOverrides = overrides[step.formulaId] ?? {};

    return (
      <details
        key={step.formulaId}
        className={styles.step}
        open={openIds.has(step.formulaId)}
        onToggle={(event) => {
          toggle(step.formulaId, event.currentTarget.open);
        }}
      >
        <summary className={styles.summary}>
          <span className={styles.stepName}>{pick(spec.name)}</span>
          <span
            className={
              step.output.value === null
                ? `${styles.stepValue} ${styles.stepFailed}`
                : styles.stepValue
            }
          >
            {calcText(step.output)}
          </span>
        </summary>

        <div className={styles.stepBody}>
          <div className={styles.fields}>
            {variablesForLevel(spec, mode).map((variable) => {
              const field = step.fields.find((f) => f.spec.key === variable.key);

              // Ô nhận giá trị từ bước trước: dựng LinkedInput để có nhãn nguồn, nút Ghi đè và
              // cảnh báo kế thừa (FR-15). Ô thường thì vẫn là điều khiển sinh từ VariableSpec.
              if (field !== undefined && linkedKeys.has(variable.key)) {
                return (
                  <LinkedInput
                    key={variable.key}
                    spec={variable}
                    upstream={field.upstream}
                    {...(field.override === undefined ? {} : { override: field.override })}
                    onOverrideChange={(value) => {
                      onOverride(step.formulaId, variable.key, value);
                    }}
                    mode={mode}
                    className={styles.fieldWide}
                  />
                );
              }

              return (
                <VariableField
                  key={variable.key}
                  spec={variable}
                  value={
                    ownInputs[variable.key] ?? ownOverrides[variable.key] ?? variable.defaultValue
                  }
                  onChange={(value) => {
                    onInput(step.formulaId, variable.key, value);
                  }}
                  mode={mode}
                  // Cùng luật với khối Số liệu: thanh trượt và nhóm nút chiếm trọn hàng. Thẻ bước
                  // còn hẹp hơn khối chính (thụt vào hai lần), nên bỏ luật này ở đây là ô lưới
                  // rơi xuống 143px — xem docblock của `isWideControl()`.
                  className={isWideControl(variable.type) ? styles.fieldWide : styles.field}
                />
              );
            })}
          </div>

          {/*
            Cảnh báo của bước này. Ô móc nối đã tự hiện cảnh báo của RIÊNG nó bên trong
            LinkedInput; dòng đây nói về cả bước — hai câu khác nhau, cố ý (xem `run-chain.ts`).
          */}
          {step.output.warning !== undefined && <InlineWarning warning={step.output.warning} />}

          <Link className={styles.openLink} href={formulaPath(step.formulaId)}>
            {t('chain.openStep')}
          </Link>
        </div>
      </details>
    );
  }

  const truoc = chain.steps.slice(0, currentIndex).map((_step, index) => theBuoc(index));
  const sau = chain.steps
    .slice(currentIndex + 1)
    .map((_step, index) => theBuoc(currentIndex + 1 + index));

  return (
    <section className={styles.wrap} aria-labelledby="khoi-chuoi">
      <h2 className={styles.title} id="khoi-chuoi">
        {t('chain.title')}
      </h2>
      <p className={styles.intro}>{t('chain.intro')}</p>

      <FlowChainStrip formulas={formulas} currentId={currentId} statuses={statuses} />

      {truoc.length > 0 && (
        <>
          <h3 className={styles.groupTitle}>{t('chain.upstreamHeading')}</h3>
          {truoc}
        </>
      )}

      {sau.length > 0 && (
        <>
          <h3 className={styles.groupTitle}>{t('chain.downstreamHeading')}</h3>
          {sau}
        </>
      )}
    </section>
  );
}
