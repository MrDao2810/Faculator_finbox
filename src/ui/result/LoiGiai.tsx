'use client';

import { Fragment, useMemo } from 'react';
import type { ReactNode } from 'react';

import { usePreferences, useT } from '@/application/preferences-context';
import type { Nut } from '@/application/quiz-cay';

import { CongThucDien } from '../quiz/CongThucDien';

import styles from './LoiGiai.module.css';

/** Một đoạn chữ hai ngôn ngữ; `en` vắng thì lùi về tiếng Việt. */
interface Chu {
  vi: string;
  en?: string;
}

/**
 * Một dòng bảng ký hiệu của trang — dòng "Thay số" in ký hiệu bằng MathML của bảng (`html`, dựng lúc
 * build, cùng chuỗi thẻ Công thức in) và nghĩa `spec.symbols[].meaning`.
 */
export interface LoiGiaiKyHieu {
  latex: string;
  html: string;
  nghia: Chu;
}

/** Ký hiệu nào nhận con số nào — cùng hình `QuizGan`: đúng một trong `giaTri` / `moTa`. */
export interface LoiGiaiDong {
  kyHieu: string;
  giaTri?: Chu;
  moTa?: Chu;
}

export interface LoiGiaiProps {
  /**
   * Hình công thức của trang, dựng sẵn ở màn chi tiết (rê vào ký hiệu mở khung "cách tính"). Là một
   * NÚT React chứ không phải chuỗi: cả cơ chế khung nổi nằm ở `src/app/cong-thuc/[id]/`, nơi
   * `src/ui` không với tới.
   */
  hinh?: ReactNode;
  /** Bản chữ thay cho hình — chỉ Q088 của bài tập dùng, xem `QuizGiai.congThuc`. */
  ghiDe?: Chu;
  /** Đuôi "để tính …" — cụm danh từ, chữ đầu tự hạ thường khi đứng giữa câu. */
  tinh: Chu;
  /** Dòng "Thay số". Rỗng thì không dựng dòng ấy. */
  gan?: ReadonlyArray<LoiGiaiDong>;
  kyHieu?: ReadonlyArray<LoiGiaiKyHieu>;
  /**
   * Dòng "Áp vào công thức": các con số đặt vào hình, chỉ phép tính. Vắng thì không dựng dòng ấy —
   * chỉ khi hình công thức không có phép tính nào (xem `KHONG_CO_PHEP_TINH` ở `src/core/vi-du/kiem.ts`).
   */
  thaySo?: Chu;
  /**
   * Cây vẽ được của `thaySo`, theo từng ngôn ngữ (29/09/2026). Có thì dòng "Áp vào công thức" VẼ
   * phép tính bằng `CongThucDien` — căn có vạch trên, phân số xếp tầng, số mũ nổi lên — thay cho chữ
   * trơn "√(76,18 ÷ (54 − 1))", "^(9 ÷ 365)" mà chủ dự án chụp và gọi là lỗi. Vắng, hoặc `null` vì
   * dòng không đọc được, thì lùi về chữ.
   *
   * Bên gọi dựng cây, không phải thành phần này: khối Ví dụ nằm trong First Load JS của mọi trang
   * chi tiết, nên cây của nó dựng sẵn lúc build (`page.tsx`) và trình duyệt không phải tải bộ phân
   * tích; bài tập thì đã có bộ phân tích trong gói tải muộn của nó.
   */
  thaySoCay?: { vi: Nut | null; en?: Nut | null };
  /** Phần in sau phép tính của phương trình ẩn: "≈ 0 ₫" — xem `ViDuGiai.thaySoRa`. */
  thaySoRa?: ReactNode;
  /** Dòng "Kết quả", đã định dạng kèm đơn vị. */
  ketQua: ReactNode;
  /**
   * Dòng "Đọc kết quả" — chỉ khối Ví dụ thực tế có (chủ dự án 29/09/2026 giữ câu diễn giải của ví
   * dụ thành dòng cuối). Bài tập không có dòng này: lời giải của một câu hỏi dừng ở kết quả.
   */
  docKetQua?: ReactNode;
  /** Nội dung dòng Nguồn — bên gọi tự dựng: bài tập in link + câu trích, ví dụ in các link + tên nguồn. */
  nguon: ReactNode;
  className?: string;
}

/**
 * Hạ chữ hoa đầu một cụm danh từ để nó đứng được giữa câu: "để tính Biên an toàn" thành "để tính
 * biên an toàn". Chữ viết tắt thì giữ nguyên — chữ thứ hai cũng hoa ("P/E", "EPS") hoặc không phải
 * chữ cái ("P/E") nghĩa là cụm mở bằng một ký hiệu, và "p/E" là sai.
 */
function giuaCau(cum: string): string {
  const [dau, hai] = [...cum];
  if (dau === undefined || hai === undefined) return cum;
  const laChuThuong = hai.toLowerCase() === hai && hai.toUpperCase() !== hai;
  return laChuThuong ? dau.toLowerCase() + cum.slice(dau.length) : cum;
}

/**
 * Lời giải có CẤU TRÚC — dùng chung cho khối Bài tập và khối Ví dụ thực tế (29/09/2026).
 *
 * Chủ dự án đặt hai ảnh cạnh nhau — khối Ví dụ viết thành đoạn văn, khối Bài tập viết thành từng
 * dòng — và bảo "điều chỉnh lại cách giải thích cho phần Ví dụ thực tế cho giống với cách giải thích
 * trong phần bài tập". Hai khối nên dùng MỘT thành phần chứ không phải hai bản JSX giống nhau: bản
 * sao là thứ chắc chắn lệch sau vài lần sửa, và khi ấy "giống nhau" chỉ còn là lời hứa.
 *
 * Thứ tự dòng do chủ dự án đặt 25/09/2026 cho bài tập: "Công thức áp dụng … để tính Biên an toàn →
 * Thay số: 42500 là gì tương ứng với ký hiệu nào … → áp dụng vào công thức", rồi Kết quả, rồi Nguồn.
 * Khối Ví dụ chen thêm "Đọc kết quả" ngay trước Nguồn.
 *
 * Nhãn dùng chung khoá `quiz.giai.*` và `quiz.source` — chúng có trước khi khối Ví dụ dùng tới, và
 * đổi tên khoá chỉ để tên đẹp là sửa hai từ điển mà màn hình không đổi chữ nào.
 */
export function LoiGiai({
  hinh,
  ghiDe,
  tinh,
  gan = [],
  kyHieu,
  thaySo,
  thaySoCay,
  thaySoRa,
  ketQua,
  docKetQua,
  nguon,
  className,
}: LoiGiaiProps) {
  const t = useT();
  const { locale } = usePreferences();
  const chu = (value: Chu) => (locale === 'en' && value.en !== undefined ? value.en : value.vi);

  /*
   * `{ __html }` của từng ký hiệu dựng một lần — React so `dangerouslySetInnerHTML` theo danh tính
   * object, dựng lại là thay cây MathML mỗi lượt render.
   */
  const kyHieuInner = useMemo(
    () => new Map((kyHieu ?? []).map((k) => [k.latex, { __html: k.html }])),
    [kyHieu],
  );

  return (
    <dl className={[styles.giai, className].filter(Boolean).join(' ')}>
      <div className={styles.giaiHang}>
        <dt>{t('quiz.giai.congThuc')}</dt>
        <dd className={styles.giaiCongThuc}>
          {ghiDe === undefined ? (
            <div className={styles.giaiHinh}>{hinh}</div>
          ) : (
            <span className={styles.giaiGhiDe}>{chu(ghiDe)}</span>
          )}
          <span className={styles.giaiDeTinh}>
            {t('quiz.giai.deTinh').replace('{x}', giuaCau(chu(tinh)))}
          </span>
        </dd>
      </div>
      {gan.length > 0 && (
        <div className={styles.giaiHang}>
          <dt>{t('quiz.giai.thaySo')}</dt>
          <dd>
            {/*
              `<dl>` con: mỗi ký hiệu là một `<dt>`, con số và nghĩa là `<dd>` — "V: bằng 42.500, là
              giá trị nội tại…" đọc đúng thành một cặp với trình đọc màn hình. Ký hiệu có dòng trong
              bảng thì in MathML của bảng và nghĩa của bảng; cụm `\text{…}` tự nói nghĩa (bảng không có
              dòng riêng) thì in đúng chữ ấy.
            */}
            <dl className={styles.giaiThay}>
              {gan.map((dong) => {
                const dongBang = (kyHieu ?? []).find((k) => k.latex === dong.kyHieu);
                const chuTho = /^\\text\{([^{}]+)\}$/.exec(dong.kyHieu)?.[1];
                return (
                  <Fragment key={dong.kyHieu}>
                    {dongBang !== undefined ? (
                      <dt
                        className={styles.giaiKyHieu}
                        // eslint-disable-next-line react/no-danger -- MathML dựng lúc build, xem `notation-view.ts`
                        dangerouslySetInnerHTML={kyHieuInner.get(dong.kyHieu)}
                      />
                    ) : (
                      <dt className={styles.giaiKyHieuChu}>{chuTho ?? dong.kyHieu}</dt>
                    )}
                    <dd>
                      {/*
                        Con số trơn in "= 42.500"; câu mô tả in liền sau ký hiệu, không có dấu "=" —
                        "C_i của cả 3 đợt cùng bằng 12.000.000". Xem docblock `QuizGan.moTa`: dàn nhiều
                        số nối bằng "·" đã bị bác, vì "·" là dấu nhân trong chính các công thức.
                      */}
                      {dong.moTa !== undefined ? (
                        <span className={styles.giaiMoTa}>{chu(dong.moTa)}</span>
                      ) : (
                        <span className={styles.giaiGiaTri}>
                          = {dong.giaTri === undefined ? '' : chu(dong.giaTri)}
                        </span>
                      )}
                      {/*
                        Nghĩa từ bảng ký hiệu CHỈ đi với con số trơn. Câu mô tả tự nói nghĩa bằng lời
                        của chính bài: nghĩa trong bảng viết cho công thức tổng quát ("tiền mua đợt i"),
                        đặt cạnh một bài cụ thể thì chủ dự án đọc không ra (25/09/2026).
                      */}
                      {dongBang !== undefined && dong.moTa === undefined && (
                        <span className={styles.giaiNghia}>{chu(dongBang.nghia)}</span>
                      )}
                    </dd>
                  </Fragment>
                );
              })}
            </dl>
          </dd>
        </div>
      )}
      {thaySo !== undefined && (
        <div className={styles.giaiHang}>
          <dt>{t('quiz.giai.apVao')}</dt>
          <dd className={styles.giaiSo}>
            {(() => {
              const cay =
                thaySoCay === undefined
                  ? null
                  : locale === 'en' && thaySoCay.en !== undefined
                    ? thaySoCay.en
                    : thaySoCay.vi;
              return (
                <span className={styles.giaiSoDong}>
                  {cay === null ? (
                    <span>{chu(thaySo)}</span>
                  ) : (
                    /*
                      `role="math"` + `aria-label` là phép tính dạng chữ: cây vẽ bằng `<span>` xếp
                      tầng, trình đọc màn hình đọc nó ra thành một dãy số rời, mất phép chia, mất căn.
                    */
                    <span className={styles.giaiSoHinh} role="math" aria-label={chu(thaySo)}>
                      <CongThucDien
                        cay={cay}
                        oNhap={() => null}
                        xuongDong
                        {...(thaySoRa === undefined ? {} : { duoi: thaySoRa })}
                      />
                    </span>
                  )}
                  {cay === null && thaySoRa !== undefined && (
                    <span className={styles.giaiSoRa}>{thaySoRa}</span>
                  )}
                </span>
              );
            })()}
          </dd>
        </div>
      )}
      <div className={styles.giaiHang}>
        <dt>{t('quiz.giai.ketQua')}</dt>
        <dd className={styles.giaiKetQua}>{ketQua}</dd>
      </div>
      {docKetQua !== undefined && (
        <div className={styles.giaiHang}>
          <dt>{t('example.docKetQua')}</dt>
          <dd className={styles.giaiDoc}>{docKetQua}</dd>
        </div>
      )}
      {/*
        MỘT dòng Nguồn, nằm trong cùng lưới với các dòng trên để nhãn thẳng hàng. Nội dung do bên gọi
        dựng: bài tập in link rồi từng câu trích một dòng; ví dụ in các link rồi tên nguồn.
      */}
      <div className={styles.giaiHang}>
        <dt>{t('quiz.source')}</dt>
        <dd className={styles.giaiNguon}>{nguon}</dd>
      </div>
    </dl>
  );
}
