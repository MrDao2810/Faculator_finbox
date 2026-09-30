'use client';

import type { Explanation, MessageKey } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

import styles from './ExplanationAccordion.module.css';

export interface ExplanationAccordionProps {
  explanation: Explanation;
  /**
   * Mở sẵn **cả bốn mục**. Mặc định BẬT, và màn chi tiết không truyền gì để đè lên nó.
   *
   * Hai bước đã đi qua, ghi lại để không ai vô tình cuộn về: bản đầu gập hết ở chế độ Nâng cao cho
   * gọn màn (FR-09); bản sau mở sẵn mục đầu. Cả hai đều để người đọc phải bấm mới thấy phần giải
   * thích — mà FR-03 bắt buộc bốn mục ấy có mặt chính là để đọc, nên chủ dự án chốt mở hết.
   *
   * Vẫn dùng `<details>` chứ không đổi sang thẻ thường: người đọc GẬP LẠI được từng mục khi đã hiểu,
   * và đó là chiều đúng — mặc định là thấy, thu gọn là lựa chọn.
   */
  defaultOpen?: boolean;
  /**
   * Dựng mục đầu "Công thức này nói lên điều gì". Mặc định có.
   *
   * Màn chi tiết công thức tắt nó — chủ dự án chốt 30/09/2026. Màn ấy đã in đúng câu
   * `explanation.meaning` ở khối "Ý nghĩa" ngay dưới tên công thức, nên cả 111 trang lặp nguyên một
   * đoạn hai lần. Giữ bản ở đầu màn chứ không giữ bản ở đây: trên điện thoại khối này nằm dưới cả
   * Kết quả lẫn Biểu đồ, còn câu "công thức này là gì" phải đến trước ô nhập.
   */
  showMeaning?: boolean;
  /**
   * Dựng mục "Cách đọc kết quả". Mặc định có.
   *
   * Màn chi tiết công thức tắt nó — cùng đợt và cùng lý do với `showMeaning`. Câu
   * `explanation.howToRead` nay in ngay dưới con số ở khối Kết quả (`ResultBlock.interpretation`),
   * để LUÔN đứng cạnh con số nó giải thích ở MỌI khổ màn hình — khối Giải thích này, ở điện
   * thoại, từng bị đẩy xuống dưới cả Biểu đồ, tức câu ấy tách rất xa khỏi con số.
   */
  showHowToRead?: boolean;
  className?: string;
}

/** Bốn mục bắt buộc của FR-03, đúng thứ tự wireframe. */
const SECTIONS: ReadonlyArray<{ key: keyof Explanation; labelKey: MessageKey }> = [
  { key: 'meaning', labelKey: 'explain.meaning' },
  { key: 'whenToUse', labelKey: 'explain.whenToUse' },
  { key: 'howToRead', labelKey: 'explain.howToRead' },
  { key: 'commonMistakes', labelKey: 'explain.commonMistakes' },
];

/**
 * Diễn giải bốn mục — gói WBS 2.4.4.
 *
 * FR-03 bắt buộc đủ bốn mục cho người mới (F0), và validator của Registry đã chặn công thức
 * nào thiếu. Ở đây chỉ việc vẽ theo đúng thứ tự wireframe.
 *
 * Dùng `<details>/<summary>` gốc chứ không tự dựng accordion bằng state: gập/mở được cả khi
 * JavaScript chưa tải xong, bàn phím và trình đọc màn hình xử đúng sẵn, và không tốn thêm
 * dung lượng gói — cùng lý do với thẻ `<a>` thật của FormulaCard.
 */
export function ExplanationAccordion({
  explanation,
  defaultOpen = true,
  showMeaning = true,
  showHowToRead = true,
  className,
}: ExplanationAccordionProps) {
  const t = useT();
  const pick = usePick();
  const classes = [styles.wrap, className].filter(Boolean).join(' ');
  const sections = SECTIONS.filter(
    (section) =>
      (showMeaning || section.key !== 'meaning') && (showHowToRead || section.key !== 'howToRead'),
  );

  return (
    <section className={classes}>
      <h2 className={styles.title}>{t('explain.title')}</h2>

      {sections.map((section) => (
        <details key={section.key} className={styles.item} open={defaultOpen}>
          <summary className={styles.summary}>{t(section.labelKey)}</summary>
          <p className={styles.body}>{pick(explanation[section.key])}</p>
        </details>
      ))}
    </section>
  );
}
