'use client';

import type { CSSProperties, ReactNode } from 'react';

import type { Nut } from '@/application/quiz-math';
import { chieuCao } from '@/application/quiz-math';

import styles from './QuizBody.module.css';

/**
 * Vẽ dòng công thức của câu điền số, với Ô NHẬP nằm ngay trong công thức.
 *
 * ## Vì sao không phải MathML
 *
 * Khối này từng sinh MathML (`<mfrac>`, `<msqrt>`) rồi nhét vào bằng `dangerouslySetInnerHTML`, và
 * cách ấy chết ngay khi chủ dự án chốt hình mới: ô trống chuyển từ ĐÁP SỐ sang các SỐ LIỆU nằm
 * giữa công thức, mà MathML không cho nhúng `<input>` vào bất kỳ chỗ nào trong cây của nó — kể cả
 * `<mtext>`. Một ô nhập nằm trong tử số của phân số thì chỉ có một đường: tự vẽ.
 *
 * `font-family: math` (CSS generic, Chrome/Safari/Firefox đều có) giữ đúng phông toán mà MathML
 * dùng, nên hình mới không "quê" hơn hình cũ. Phân số là một `<span>` xếp cột với gạch `border-top`
 * — đúng thứ trình duyệt vẽ cho `<mfrac>`.
 *
 * ## Vì sao cây đã cài sẵn dấu ngoặc
 *
 * `workedShape` ở Domain chạy `themNgoac` trước khi trao cây sang, nên ở đây không có một dòng nào
 * biết luật ưu tiên toán học. Cố ý: giữ một bản sao bảng ưu tiên trong tầng giao diện là thứ chắc
 * chắn sẽ lệch với bộ tính sau vài lần sửa, mà lệch kiểu ấy thì hình vẽ và con số được chấm nói hai
 * điều khác nhau.
 *
 * ## Vì sao chiều cao tính trên cây, không đo lúc chạy
 *
 * Dấu ngoặc và dấu căn phải cao bằng thứ chúng bọc. CSS không tự biết một `<span>` cao mấy tầng,
 * còn đo bằng JS lúc chạy thì lượt dựng đầu tiên trên trình duyệt sẽ khác HTML tĩnh — đúng lớp lỗi
 * hydration mà cả thư mục này phải tránh (xem `useId` trong docblock `QuizPanel`). `chieuCao()` là
 * hàm thuần trên cây nên máy chủ và trình duyệt luôn ra cùng một con số, và CSS kéo dãn glyph bằng
 * `scaleY(var(--cao))`.
 */

export interface CongThucDienProps {
  cay: Nut;
  /** Dựng ô nhập thứ `thuTu`. Trả về cả `<input>` lẫn phần trang trí quanh nó. */
  oNhap: (thuTu: number, dap: string) => ReactNode;
}

export function CongThucDien({ cay, oNhap }: CongThucDienProps) {
  return (
    <span className={styles.congThuc} data-cong-thuc>
      {ve(cay, oNhap)}
    </span>
  );
}

/** Glyph kéo dãn theo số tầng nó phải bọc — dùng cho dấu ngoặc, vạch trị tuyệt đối và dấu căn. */
function Glyph({ cao, chu, lop }: { cao: number; chu: string; lop: string | undefined }) {
  return (
    <span className={lop} style={{ '--cao': cao } as CSSProperties} aria-hidden="true">
      {chu}
    </span>
  );
}

function ve(nut: Nut, oNhap: CongThucDienProps['oNhap']): ReactNode {
  switch (nut.t) {
    case 'so':
      return <span className={styles.ctSo}>{nut.raw}</span>;

    case 'o':
      return oNhap(nut.thuTu, nut.dap);

    case 'ngoac':
      return (
        <span className={styles.ctBoc}>
          <Glyph cao={chieuCao(nut.a)} chu="(" lop={styles.ctNgoac} />
          {ve(nut.a, oNhap)}
          <Glyph cao={chieuCao(nut.a)} chu=")" lop={styles.ctNgoac} />
        </span>
      );

    case 'tri':
      return (
        <span className={styles.ctBoc}>
          <Glyph cao={chieuCao(nut.a)} chu="|" lop={styles.ctNgoac} />
          {ve(nut.a, oNhap)}
          <Glyph cao={chieuCao(nut.a)} chu="|" lop={styles.ctNgoac} />
        </span>
      );

    case 'am':
      return (
        <span className={styles.ctBoc}>
          <span className={styles.ctDauLien}>−</span>
          {ve(nut.a, oNhap)}
        </span>
      );

    case 'can':
      return (
        <span className={styles.ctCan}>
          <Glyph cao={chieuCao(nut.a)} chu="√" lop={styles.ctCanDau} />
          <span className={styles.ctCanThan}>{ve(nut.a, oNhap)}</span>
        </span>
      );

    case 'ln':
      return (
        <span className={styles.ctBoc}>
          <span className={styles.ctHam}>ln</span>
          <Glyph cao={chieuCao(nut.a)} chu="(" lop={styles.ctNgoac} />
          {ve(nut.a, oNhap)}
          <Glyph cao={chieuCao(nut.a)} chu=")" lop={styles.ctNgoac} />
        </span>
      );

    /*
     * Phân số: hai tầng xếp dọc, gạch ngang là `border-top` của mẫu số. Đây là hình mà chủ dự án
     * chỉ vào ảnh `β = Cov(Rᵢ, Rₘ) / Var(Rₘ)` và đòi: "trình bày trên dưới có gạch phân rõ như
     * công thức kìa thì mới hiểu."
     */
    case 'chia':
      return (
        <span className={styles.ctPhanSo} data-phan-so>
          <span className={styles.ctTu}>{ve(nut.a, oNhap)}</span>
          <span className={styles.ctMau}>{ve(nut.b, oNhap)}</span>
        </span>
      );

    case 'luythua':
      return (
        <span className={styles.ctBoc}>
          {ve(nut.a, oNhap)}
          <sup className={styles.ctMu}>{ve(nut.b, oNhap)}</sup>
        </span>
      );

    default:
      return (
        <span className={styles.ctBoc}>
          {ve(nut.a, oNhap)}
          <span className={styles.ctDau}>{DAU[nut.t]}</span>
          {ve(nut.b, oNhap)}
        </span>
      );
  }
}

/** Dấu phép tính in ra màn — dấu trừ và dấu nhân là ký tự TOÁN, không phải gạch nối và chữ x. */
const DAU: Readonly<Record<'cong' | 'tru' | 'nhan' | 'chiaDong', string>> = {
  cong: '+',
  tru: '−',
  nhan: '×',
  /* Phép chia nằm TRONG một phân số viết ngang — xem `themNgoac`: chỉ một tầng gạch phân số. */
  chiaDong: '÷',
};
