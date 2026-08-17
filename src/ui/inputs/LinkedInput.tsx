'use client';

import Link from 'next/link';

import { formulaPath, resolveLinked, startOverrideValue } from '@/application';
import type { Level, LinkedUpstream, VariableSpec } from '@/application';
import { useT } from '@/application/preferences-context';
import { Button } from '@/ui/primitives';

import { InlineWarning } from '../result/InlineWarning';
import { NumberInput } from './NumberInput';
import styles from './LinkedInput.module.css';

export interface LinkedInputProps {
  spec: VariableSpec;
  /** Công thức thượng nguồn đang cấp giá trị. Không có thì đây chỉ là ô nhập tay. */
  upstream?: LinkedUpstream;
  /** Giá trị người dùng đã ghi đè. `undefined` nghĩa là chưa ghi đè. */
  override?: number;
  /** Ghi đè giá trị mới, hoặc `undefined` để hoàn tác về giá trị tự động. */
  onOverrideChange: (value: number | undefined) => void;
  mode?: Level;
  className?: string;
}

/**
 * Ô nhập móc nối — gói WBS 2.3.4, gói đắt nhất toàn dự án.
 *
 * FR-15 đòi bốn thứ cùng lúc: chỉ rõ nguồn, phân biệt ô tự động với ô nhập tay bằng viền và
 * NHÃN CHỮ (không chỉ màu), cho ghi đè và hoàn tác, và khi thượng nguồn lỗi thì hiện cảnh báo
 * kế thừa thay vì âm thầm cho ra số.
 *
 * Bốn trạng thái được quyết ở `resolveLinked()` tầng Domain nên test được bằng Node; ở đây
 * chỉ là phần vẽ. Điểm quan trọng nhất mà logic đó giữ: **ghi đè thắng cả khi thượng nguồn
 * đang lỗi** — nếu không thì dòng gợi ý "Mở Beta để sửa · hoặc ghi đè WACC tại đây" của WF-15
 * hoá ra lời hứa suông.
 */
export function LinkedInput({
  spec,
  upstream,
  override,
  onOverrideChange,
  mode = 'advanced',
  className,
}: LinkedInputProps) {
  const t = useT();
  const args = { spec, upstream, override };
  const linked = resolveLinked(args);

  const classes = [styles.wrap, styles[linked.mode], className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <NumberInput
        spec={spec}
        /*
         * Thượng nguồn lỗi thì chưa có số dùng được, nhưng ô nhập vẫn phải có một số hợp lệ
         * để không hiện NaN. Dùng `defaultValue` — đúng con số mà nút Ghi đè sẽ khởi đầu, nên
         * hai chỗ khớp nhau.
         *
         * Đây KHÔNG phá FR-06: bất biến đó cấm hiện số thay cho lỗi ở chỗ đáng ra là KẾT QUẢ.
         * Ở đây con số nằm trong ô nhập, còn lỗi hiện ngay dưới bằng InlineWarning kèm viền
         * trái đỏ. Giá trị đưa xuống công thức hạ nguồn vẫn là null — xem `linkedInputs()`.
         */
        value={linked.value ?? spec.defaultValue}
        mode={mode}
        // Chỉ ghi nguồn khi giá trị đang thật sự đến từ thượng nguồn. Đã ghi đè thì ô là của
        // người dùng, gắn '↳ CAPM' vào nữa sẽ sai.
        derivedFrom={linked.mode === 'linked' ? linked.sourceLabel : undefined}
        onChange={(value) => {
          // Sửa tay ngay trên ô cũng tính là ghi đè — không bắt phải bấm nút trước.
          onOverrideChange(value);
        }}
      />

      <div className={styles.footer}>
        <span className={styles.status}>
          {linked.mode === 'overridden' && (
            <>
              <span className={styles.overriddenTag}>{t('input.overridden')}</span>
              {linked.sourceLabel !== undefined && (
                <span className={styles.source}>
                  {' · '}
                  {t('input.autoFrom')} {linked.sourceLabel}
                </span>
              )}
            </>
          )}
          {upstream !== undefined && linked.mode !== 'overridden' && (
            <Link className={styles.upstreamLink} href={formulaPath(upstream.formulaId)}>
              {t('input.openUpstream')}
            </Link>
          )}
        </span>

        <span className={styles.actions}>
          {linked.canOverride && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onOverrideChange(startOverrideValue(args));
              }}
            >
              {t('input.override')}
            </Button>
          )}
          {linked.canRevert && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onOverrideChange(undefined);
              }}
            >
              {t('input.revert')}
            </Button>
          )}
        </span>
      </div>

      {linked.warning !== undefined && <InlineWarning warning={linked.warning} />}
    </div>
  );
}
