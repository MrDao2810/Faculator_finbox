'use client';

import type { Bilingual } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

import { useValueText } from '../i18n/units';
import styles from './DerivedNote.module.css';

export interface DerivedNoteProps {
  /** Các chặng công thức tự tính ra — dựng bằng `derivedStages()` ở tầng Domain. */
  stages: ReadonlyArray<{ key: string; label: Bilingual; value: number }>;
  /** Đơn vị của kết quả: mọi chặng bóc tách đều cộng lại ra kết quả nên cùng đơn vị với nó. */
  unit: string;
}

/**
 * Những đại lượng công thức TỰ TÍNH RA từ các ô nhập — bày ngay dưới khối Số liệu.
 *
 * Anh em ruột của `ConstantsNote`, và sinh ra từ cùng một lớp lỗ hổng. Chủ dự án chỉ đúng chỗ trên
 * `fcfe` (16/09/2026): biểu đồ bóc tách có cột `Lãi vay sau thuế` cao 48 tỷ ₫, còn khối Số liệu chỉ
 * có `Chi phí lãi vay` 60 và `Thuế suất` 20% đứng rời nhau. Cái tên ấy và con số 48 không xuất hiện
 * ở bất kỳ đâu khác trên trang, nên người đọc thấy một đại lượng có tên, có cột vẽ, mà không tra
 * được nó từ đâu ra — đúng cảnh mà docblock `ConstantsNote` mô tả cho mức phí 0,15%.
 *
 * Vì sao KHÔNG chữa bằng cách đổi tên cột biểu đồ cho khớp ô nhập: cột ấy cao 48, còn ô `Chi phí
 * lãi vay` là 60. Gọi cột là 'Chi phí lãi vay' thì hai chỗ cùng một tên mà hai con số — tệ hơn hẳn
 * cảnh hiện tại. Thứ thiếu là một chỗ nói "48 ở đâu ra", không phải một cái tên khác.
 *
 * Vì sao KHÔNG nhét thành một dòng của khối Số liệu: khối ấy dựng TRỌN VẸN từ `spec.variables`
 * (FR-05), mỗi dòng là một ô gõ được. Thêm một dòng chỉ-đọc vào giữa là phá đúng lời hứa đó, và
 * phải sửa đường dựng ô của cả 111 công thức để phục vụ 9 công thức. Đứng riêng một khối ở cuối,
 * đúng chỗ `ConstantsNote` đã đứng, thì không đụng gì tới 102 công thức còn lại.
 *
 * Trị số bày theo ĐỘ LỚN, không mang dấu của chặng: `sign` là vai của chặng trong phép cộng, do
 * hình vẽ nói (cột trừ có viền đứt) chứ không phải dấu của chính đại lượng. In `−48` cạnh chữ
 * 'Lãi vay sau thuế' là nói rằng tiền lãi âm — thứ mà chính `calc` của `fcfe` chặn bằng
 * `MEANINGLESS`.
 */
export function DerivedNote({ stages, unit }: DerivedNoteProps) {
  const t = useT();
  const pick = usePick();
  const valueText = useValueText();
  if (stages.length === 0) return null;

  return (
    <section className={styles.block}>
      <h3 className={styles.title}>{t('detail.derivedInUse')}</h3>
      <dl className={styles.list}>
        {stages.map((stage) => (
          <div key={stage.key} className={styles.row}>
            <dt className={styles.label}>{pick(stage.label)}</dt>
            <dd className={styles.value}>{valueText(stage.value, unit)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
