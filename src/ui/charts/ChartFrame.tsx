'use client';

import { useId, type ReactNode } from 'react';

import { t } from '@/application';
import type { LineChart as LineChartModel } from '@/application';

import styles from './chart.module.css';

/**
 * Khung ngoài của biểu đồ: câu mô tả, hình vẽ, ghi chú, bảng số.
 *
 * Đây là chỗ khả năng tiếp cận được lo trọn (NFR-USA-06), và cách lo hơi khác thói thường nên
 * đáng ghi lại:
 *
 * **Bảng số HIỆN, không `.visually-hidden`.** Cách phổ biến là giấu một bảng chỉ cho trình đọc màn
 * hình. Ở đây không giấu, vì người sáng mắt cũng cần con số chính xác — mắt đọc một biểu đồ chỉ ra
 * được xu hướng, không ra được "15,21". Gói trong `<details>` nên nó không choán màn, và đúng nếp
 * dự án: nói rõ thay vì giấu.
 *
 * Hệ quả tốt cho việc kiểm: bảng này là hợp đồng CÔNG KHAI với người dùng, nên test bám vào nó
 * thay vì bám vào chuỗi `d` — chỉnh một pixel padding không làm đỏ ca kiểm nào.
 */

export interface ChartFrameProps {
  model: LineChartModel;
  /** Ô chọn biến trục X, đặt trên hình. */
  picker?: ReactNode;
  /**
   * Nút hành động đứng CẠNH ô chọn, hiện nay là nút phóng to.
   *
   * Khe riêng chứ không nhét vào `picker`: `SweepPicker` tự trả `null` khi công thức chỉ có một biến
   * quét được, và nút phóng to phải còn ở đúng những công thức ấy.
   */
  action?: ReactNode;
  children: ReactNode;
}

export function ChartFrame({ model, picker, action, children }: ChartFrameProps) {
  const captionId = `${useId()}-caption`;

  const rows = model.table.rows.length;

  return (
    /*
     * KHÔNG đặt `role="group"` ở đây. `<figure>` đã có role riêng và `<figcaption>` qua
     * `aria-labelledby` đã là tên của nó — ghi đè thành `group` vừa mất ngữ nghĩa hình minh hoạ,
     * vừa đụng với `<details>` bên dưới (thẻ đó cũng map sang role `group`), khiến cả trình đọc
     * màn hình lẫn bộ kiểm không phân biệt được hai vùng.
     */
    <figure className={styles.chart} aria-labelledby={captionId}>
      <figcaption className={styles.caption} id={captionId}>
        <strong className={styles.captionTitle}>{model.title}</strong>
        <span className={styles.captionText}>{model.summary}</span>
      </figcaption>

      {(picker !== undefined || action !== undefined) && (
        <div className={styles.controls}>
          {picker}
          {action}
        </div>
      )}

      {children}

      {model.note !== undefined && (
        <p className={styles.note} role="note">
          {model.note}
        </p>
      )}

      <details className={styles.data}>
        <summary className={styles.summary}>
          {t('chart.showData')} ({rows})
        </summary>

        <table className={styles.table}>
          {/*
            Tên bảng phải KHÁC tiêu đề hình, không phải bản sao của nó: hai phần tử mang y nguyên
            một chuỗi thì trình đọc màn hình đọc lại hai lần, và người dùng không biết mình đang ở
            hình hay ở bảng.
          */}
          <caption className="visually-hidden">Số liệu — {model.title}</caption>
          <thead>
            <tr>
              <th scope="col">{model.table.columns[0]}</th>
              <th scope="col">{model.table.columns[1]}</th>
            </tr>
          </thead>
          <tbody>
            {model.table.rows.map((row, index) =>
              row === null ? (
                // Dòng ngắt "…" — cùng nếp SCHEDULE_GAP của lịch trả nợ 240 kỳ.
                <tr key={`gap-${String(index)}`} className={styles.gapRow}>
                  <td colSpan={2}>…</td>
                </tr>
              ) : (
                <tr
                  key={`${row[0]}-${String(index)}`}
                  className={row[0] === currentLabel(model) ? styles.currentRow : undefined}
                >
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/**
 * Nhãn x của điểm "giá trị hiện tại", để tô đậm đúng dòng đó trong bảng.
 *
 * So bằng NHÃN chứ không bằng số: bảng đã rút gọn thành chuỗi ở Domain, và nhãn là thứ duy nhất
 * còn lại để nối một dòng bảng với một điểm trên hình. Nhãn sinh từ cùng một `formatValueWithUnit`
 * nên hai bên không thể lệch cách viết.
 */
function currentLabel(model: LineChartModel): string | undefined {
  return model.points.find((point) => point.marked === true)?.label;
}
