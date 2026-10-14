'use client';

import { type ReactNode } from 'react';

import type { DrawableChart } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

import styles from './chart.module.css';

/**
 * Khung ngoài của biểu đồ: tên hình, hình vẽ, ghi chú, bảng số.
 *
 * Đây là chỗ khả năng tiếp cận được lo trọn (NFR-USA-06), và cách lo hơi khác thói thường nên
 * đáng ghi lại:
 *
 * **Câu mô tả (`model.summary`) KHÔNG còn hiện trên màn từ 14/10/2026.** Nó từng đứng ngay dưới tên
 * hình, hai tới ba dòng chữ nhỏ: "Quét Giá trị doanh nghiệp (EV) từ 5.750 tỷ ₫ tới 17.250 tỷ ₫ qua
 * 41 mức. EV/EBITDA chạy trong khoảng 3,97 lần tới 11,9 lần. Ở giá trị hiện tại 11.500 tỷ ₫, kết
 * quả là 7,93 lần. Mọi mức đều tính được." Chủ dự án chép đúng câu ấy và bảo xoá *"để tối ưu không
 * gian"*: mọi con số trong câu đã nằm trên hình (hai đầu trục, dấu giá trị hiện tại) và trong bảng
 * số bên dưới. Đo trên `ev-ebitda`: thẻ biểu đồ thấp đi 42px ở 1440 và 76px ở 390.
 *
 * Câu ấy vẫn ở trong `<figcaption>` dưới lớp `visually-hidden`, và đó là phần KHÔNG được gỡ theo:
 * `<svg>` mang `aria-hidden` (xem docblock `LineChart`), nên với trình đọc màn hình thì câu này và
 * bảng số là toàn bộ biểu đồ — hai đường mốc 30 và 70 của RSI, chuỗi vẽ kèm, "19 phiên đầu chưa đủ
 * dữ liệu" đều chỉ được NÓI ra ở đây. Ẩn khỏi mắt thì không tốn một pixel nào; gỡ khỏi DOM là lấy
 * biểu đồ khỏi tay người không nhìn được hình. Đừng dựng lại bản hiện trên màn mà không hỏi.
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
  model: DrawableChart;
  /** Gốc để ghép `id` của `<figcaption>`. Xem docblock của `ChartBody` về việc vì sao không `useId()`. */
  idBase: string;
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

export function ChartFrame({ model, idBase, picker, action, children }: ChartFrameProps) {
  const t = useT();
  const pick = usePick();
  const captionId = `${idBase}-caption`;

  const rows = model.table.rows.length;

  return (
    /*
     * KHÔNG đặt `role="group"` ở đây. `<figure>` đã có role riêng và `<figcaption>` qua
     * `aria-labelledby` đã là tên của nó — ghi đè thành `group` vừa mất ngữ nghĩa hình minh hoạ,
     * vừa đụng với `<details>` bên dưới (thẻ đó cũng map sang role `group`), khiến cả trình đọc
     * màn hình lẫn bộ kiểm không phân biệt được hai vùng.
     */
    <figure className={styles.chart} aria-labelledby={captionId}>
      {/*
        Nút phóng to đứng cùng hàng với tiêu đề, ô chọn trục xuống hàng riêng — bản thiết kế
        đợt 12. Trước đó cả hai chung một hàng `.controls`, và ở khổ 360 chúng xuống dòng thành
        hai tầng điều khiển ngay trên hình, đẩy hình xuống quá nếp gấp.
      */}
      <div className={styles.captionRow}>
        <figcaption className={styles.caption} id={captionId}>
          <strong className={styles.captionTitle}>{pick(model.title)}</strong>
          {/*
            Ẩn khỏi mắt, còn cho trình đọc màn hình — lý do ở docblock đầu file. Dấu cách đứng
            trước là để tên của `<figure>` (ghép từ chữ của cả `<figcaption>`) không dính liền tên
            hình với câu mô tả: "…(EV)Quét Giá trị…".
          */}{' '}
          <span className="visually-hidden">{pick(model.summary)}</span>
        </figcaption>
        {action}
      </div>

      {picker !== undefined && <div className={styles.controls}>{picker}</div>}

      {children}

      {model.note !== undefined && (
        <p className={styles.note} role="note">
          {pick(model.note)}
        </p>
      )}

      <details className={styles.data}>
        <summary className={styles.summary}>
          {t('chart.showData')} ({rows})
        </summary>

        {/*
          Vùng cuộn ngang riêng, cùng nếp với primitive `Table` — bảng nhiều chữ không được kéo cả
          trang cuộn ngang (NFR-USA-02). `tabIndex` để lăn được bằng bàn phím; `role="group"` +
          `aria-label` để trình đọc màn hình biết vừa bước vào vùng cuộn của bảng nào.
        */}
        <div
          className={styles.tableScroll}
          tabIndex={0}
          role="group"
          aria-label={`${t('chart.tableCaption')} — ${pick(model.title)}`}
        >
          <table className={styles.table}>
            {/*
              Tên bảng phải KHÁC tiêu đề hình, không phải bản sao của nó: hai phần tử mang y nguyên
              một chuỗi thì trình đọc màn hình đọc lại hai lần, và người dùng không biết mình đang ở
              hình hay ở bảng.
            */}
            <caption className="visually-hidden">
              {t('chart.tableCaption')} — {pick(model.title)}
            </caption>
            {/*
              Cột dựng theo MẢNG chứ không viết cứng hai cột: từ đợt nhiều-chuỗi, mỗi chuỗi phụ
              thêm một cột. Biểu đồ một chuỗi vẫn ra đúng hai cột như trước — `columns` của nó vẫn
              đúng hai phần tử, không phải "hai cột được suy ra".
            */}
            <thead>
              <tr>
                {model.table.columns.map((column, index) => (
                  <th key={`col-${String(index)}`} scope="col">
                    {pick(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {model.table.rows.map((row, index) => {
                if (row === null) {
                  // Dòng ngắt "…" — cùng nếp SCHEDULE_GAP của lịch trả nợ 240 kỳ.
                  return (
                    <tr key={`gap-${String(index)}`} className={styles.gapRow}>
                      <td colSpan={model.table.columns.length}>…</td>
                    </tr>
                  );
                }
                const [head, ...values] = row;
                const label = pick(head);
                return (
                  <tr
                    key={`${label}-${String(index)}`}
                    className={label === currentLabel(model) ? styles.currentRow : undefined}
                  >
                    <td>{label}</td>
                    {values.map((value, cell) => (
                      <td key={`cell-${String(cell)}`}>{value}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
function currentLabel(model: DrawableChart): string | undefined {
  // Thác nước không có "điểm hiện tại" — mọi cột đều là số hiện tại, không cột nào được tô riêng.
  if (model.kind !== 'line') return undefined;
  return model.points.find((point) => point.marked === true)?.label;
}
