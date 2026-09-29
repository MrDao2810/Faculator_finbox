'use client';

import type { ReactNode } from 'react';

import type { FormulaSpec, ViDuGiai } from '@/application';
import type { Nut } from '@/application/quiz-cay';
import { usePick, useT } from '@/application/preferences-context';

import { useValueText } from '../i18n/units';
import { shortUrl } from '../quiz/short-url';
import styles from './ExampleBlock.module.css';
import { LoiGiai } from './LoiGiai';
import type { LoiGiaiKyHieu } from './LoiGiai';

export interface ExampleBlockProps {
  formula: FormulaSpec;
  /**
   * Lời giải có cấu trúc của ví dụ — đọc lúc build ở `page.tsx` (`@/application/vi-du`) rồi truyền
   * xuống. Vắng thì khối lùi về hình chỉ-để-đọc cũ: một công thức mới thêm vào Registry chưa có lời
   * giải ngay, và một khối trống thì tệ hơn một bảng số.
   */
  giai?: ViDuGiai;
  /** Hình công thức của trang, dựng sẵn ở màn chi tiết — xem `LoiGiaiProps.hinh`. */
  hinhCongThuc?: ReactNode;
  /** Bảng ký hiệu của trang, cho dòng "Thay số". */
  kyHieu?: ReadonlyArray<LoiGiaiKyHieu>;
  /**
   * Cây vẽ được của dòng "Áp vào công thức", dựng SẴN lúc build ở `page.tsx` — khối này nằm trong
   * First Load JS của mọi trang chi tiết, nên trình duyệt không được phải tải bộ phân tích để dựng
   * nó. Xem `LoiGiaiProps.thaySoCay`.
   */
  thaySoCay?: { vi: Nut | null; en: Nut | null };
  className?: string;
}

/**
 * Khối ví dụ thực tế — gói WBS 2.4.5, viết lại ngày 29/09/2026.
 *
 * Chủ dự án đặt ảnh khối này (một đoạn văn, một dòng nguồn chữ trơn, rồi bảng số) cạnh ảnh lời giải
 * của khối Bài tập và bảo: "điều chỉnh lại cách giải thích cho phần Ví dụ thực tế cho giống với cách
 * giải thích trong phần bài tập. thêm nữa nguồn của phần ví dụ thực tế nên đưa về kiểu link để người
 * dùng click vào về trang nguồn". Nên khối nay in ĐÚNG các dòng của lời giải bài tập, bằng chính
 * thành phần ấy (`LoiGiai`):
 *
 *   FPT — giá 72.700 ₫ phiên 11/09/2026, EPS bốn quý gần nhất 5.867 ₫        ← `example.title`
 *   Công thức áp dụng   P/E = P / EPS   để tính hệ số P/E của FPT phiên 11/09/2026
 *   Thay số             P    là giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫
 *                       EPS  là lợi nhuận bốn quý gần nhất trên một cổ phiếu FPT…: 5.867 ₫
 *   Áp vào công thức    72.700 ÷ 5.867
 *   Kết quả             12,39 lần                                               ← `example.expected`
 *   Đọc kết quả         <example.note>
 *   Nguồn               cafef.vn/… · fpt.com.vn/…  +  <example.source>
 *
 * ── KHÔNG còn gõ được tại chỗ (29/09/2026) ──────────────────────────────────────────────────────
 *
 * Từ 10/09/2026 dòng số của ví dụ là ô nhập nối thẳng vào state của màn. Chủ dự án bỏ khi chuyển
 * sang hình lời giải: "không cho gõ được vào ví dụ thực tế nữa". Một lời giải mẫu phải đứng yên —
 * dòng "Áp vào công thức" in đúng các con số của ví dụ, và nếu ô bên trên đổi được con số thì dòng ấy
 * nói dối. Muốn thử số khác thì gõ ở khối Số liệu, hoặc bấm "Xem ví dụ minh hoạ" để nạp bộ số này
 * vào đó. `InlineNumber` vẫn còn, `SliderInput` dùng nó.
 */
export function ExampleBlock({
  formula,
  giai,
  hinhCongThuc,
  kyHieu,
  thaySoCay,
  className,
}: ExampleBlockProps) {
  const t = useT();
  const pick = usePick();
  const valueText = useValueText();
  const { example } = formula;
  const classes = [styles.block, className].filter(Boolean).join(' ');
  const ketQua = valueText(example.expected, formula.resultUnit);

  /*
   * Phương trình ẩn (XIRR, IRR niên kim): dòng "Áp vào công thức" giữ đúng hình của trang và ra một
   * con số KHÁC kết quả — tổng dòng tiền ≈ 0 ₫, hay đúng khoản vay P. In con số ấy cuối dòng, để người
   * đọc thấy nghiệm ở dòng Kết quả làm phương trình đứng được. Xem `ViDuGiai.thaySoRa`.
   */
  const thaySoRa =
    giai?.thaySoRa === undefined
      ? undefined
      : `≈ ${valueText(giai.thaySoRa.giaTri, giai.thaySoRa.donVi)}`;

  return (
    <section className={classes} aria-labelledby="khoi-vi-du">
      <h2 className={styles.title} id="khoi-vi-du">
        {t('example.title')}
      </h2>
      <p className={styles.subtitle}>{pick(example.title)}</p>

      {giai !== undefined ? (
        <LoiGiai
          hinh={hinhCongThuc}
          tinh={giai.tinh}
          gan={giai.gan}
          {...(kyHieu === undefined ? {} : { kyHieu })}
          {...(giai.thaySo === undefined ? {} : { thaySo: giai.thaySo })}
          {...(thaySoCay === undefined ? {} : { thaySoCay })}
          {...(thaySoRa === undefined ? {} : { thaySoRa })}
          ketQua={ketQua}
          {...(example.note === undefined ? {} : { docKetQua: pick(example.note) })}
          nguon={
            <>
              {/*
                Mỗi link một dòng, trước link là nhãn nói nó cho con số nào ("Giá FPT phiên
                11/09/2026") — ví dụ ghép hai nguồn thì hai link trỏ hai trang khác nhau, và người
                đọc phải biết bấm cái nào để kiểm con số nào. Chữ của link là đường dẫn rút gọn,
                `title` giữ đường dẫn đầy đủ — cùng nếp dòng Nguồn của bài tập.

                Tên nguồn cũ (`example.source`) vẫn đứng dưới cùng: nó nói nguồn là GÌ và lấy lúc nào
                ("báo cáo tài chính quý 2/2026"), thứ đường dẫn không nói. Ví dụ không tìm được trang
                nào chứa đúng con số thì chỉ còn dòng này — không bịa link.
              */}
              {giai.nguon.map((n) => (
                <span key={n.url} className={styles.nguonDong}>
                  {n.nhan !== undefined && (
                    <span className={styles.nguonNhan}>{pick(n.nhan)}: </span>
                  )}
                  <a href={n.url} target="_blank" rel="noreferrer noopener" title={n.url}>
                    {shortUrl(n.url)}
                  </a>
                </span>
              ))}
              {example.source !== undefined && (
                <span className={styles.nguonTen}>{pick(example.source)}</span>
              )}
            </>
          }
        />
      ) : (
        <>
          {example.note !== undefined && <p className={styles.note}>{pick(example.note)}</p>}
          {example.source !== undefined && (
            <p className={styles.source}>
              {t('example.source')} {pick(example.source)}
            </p>
          )}
          <dl className={styles.inputs}>
            {Object.entries(example.inputs).map(([key, value]) => {
              const variable = formula.variables.find((v) => v.key === key);
              return (
                <div key={key} className={styles.pair}>
                  <dt className={styles.term}>
                    {variable !== undefined ? pick(variable.label) : key}
                  </dt>
                  <dd className={styles.value}>{valueText(value, variable?.unit ?? '')}</dd>
                </div>
              );
            })}
          </dl>
          <p className={styles.result}>
            <span aria-hidden="true">→ </span>
            {pick(formula.name)} ≈ <strong>{ketQua}</strong>
          </p>
        </>
      )}
    </section>
  );
}
