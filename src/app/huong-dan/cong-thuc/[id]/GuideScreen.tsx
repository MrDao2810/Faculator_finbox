import Link from 'next/link';

import { FORMULA_SUMMARIES, findCategory, formulaPath, type BaiHuongDan } from '@/application';
import { GuideBody, GuideToc } from '@/ui/guide/GuideBody';
import { Pick } from '@/ui/i18n/Pick';
import { T } from '@/ui/i18n/T';

import styles from './GuideScreen.module.css';

/**
 * Bài "Hướng dẫn sử dụng" của một công thức — WF-21, trang đầy đủ `/huong-dan/cong-thuc/<id>/`.
 *
 * ── Vì sao là SERVER component ───────────────────────────────────────────────────────────────
 *
 * Cùng lẽ với `AboutScreen`: màn này không có state, không đọc `localStorage`, không nghe sự kiện
 * nào. Server dựng thì toàn bộ bài nằm sẵn trong `out/huong-dan/cong-thuc/<id>/index.html` — đọc
 * được khi mất mạng (vỏ service worker), in được, và bộ máy tìm kiếm đọc được (FR-25). Đó không
 * phải chi tiết kỹ thuật: *"hướng dẫn mà cần mạng thì đúng lúc cần nhất lại không có"*.
 *
 * Hệ quả bắt buộc: mọi chữ đi qua lá client `<T k="…" />` (chữ giao diện) hoặc `<Pick value={…} />`
 * (chữ nội dung khai song ngữ ở Domain) — server component không gọi hook được.
 *
 * ── Màn này chỉ còn là KHUNG ─────────────────────────────────────────────────────────────────
 *
 * Từ đợt 2 (02/10/2026) sáu mục của bài nằm ở `@/ui/guide/GuideBody`, dùng chung với panel mở tại
 * chỗ trên màn công thức. Ở đây chỉ còn phần riêng của TRANG: dải tiêu đề, lưới hai cột, và cột
 * phải (mục lục bám dính, ba lối ra, công thức liên quan) — những thứ panel không có vì nó đã
 * đứng sẵn trong màn thật rồi.
 *
 * ── Mục lục là link thật, không phải JavaScript ──────────────────────────────────────────────
 *
 * Yêu cầu gốc: *"trong hướng dẫn sử dụng có link để bấm vào các phần"*. Ở trang này nó đúng nghĩa
 * đen — `GuideToc` không nhận `onPick` nên mỗi mục là một `<a href="#neo">`, bấm được ngay cả khi
 * JS chưa tải xong, copy được từ thanh địa chỉ. Phần "mục đang đọc tự sáng theo cuộn" cần
 * `IntersectionObserver`, tức một lá client; nó chưa có, và bài vẫn chạy đủ nếu không bao giờ có.
 *
 * ── Thân màn tự dựng `<h1>` ──────────────────────────────────────────────────────────────────
 *
 * '/huong-dan/' cố ý KHÔNG có tên trong `HEADER_TITLES`: mỗi bài có tiêu đề riêng mang tên công
 * thức, mà thanh trên thì bày nút "‹ Quay lại công thức" (xem `backLinkFor()`). Một trang vẫn đúng
 * một `<h1>`, chỉ là nó nằm trong thân.
 */
export function GuideScreen({ bai }: { bai: BaiHuongDan }) {
  const nhom = findCategory(bai.nhomId);
  const duongDan = formulaPath(bai.id);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        {/*
          Nhãn nhỏ đứng TRÊN tên công thức, không ghép vào tiêu đề: phần lớn tên công thức đã mang
          sẵn một dấu "—" ("P/E — hệ số giá trên lợi nhuận"), nên "… — cách dùng" sẽ cho ra hai
          gạch dài trong một dòng. Cùng cái bẫy gạch dài mà bảng ký hiệu đã gặp.
        */}
        <p className={styles.eyebrow}>
          <T k="guide.howToUse" />
        </p>
        <h1 className={styles.title}>
          <Pick value={bai.ten} />
        </h1>
        {/*
          Dải mở đầu in `deLamGi` — câu "Để làm gì" viết RIÊNG cho bài, không phải `spec.description`
          của khối Ý nghĩa. Hai câu gần nhau về nội dung, nên in cả hai là nói một điều hai lần;
          chọn câu của bài vì trang này là bài, và vì nó nói "mở màn này ra thì biết được gì" —
          giọng của một hướng dẫn, không phải một định nghĩa.

          `moTaNgan` ở lại trong `BaiHuongDan` chứ không gỡ: khung bật tại nút dùng nó ở `aria`, và
          công thức chưa có bốn dòng riêng vẫn phải có một câu dẫn.
        */}
        <p className={styles.lead}>
          <Pick value={bai.rieng?.deLamGi ?? bai.moTaNgan} />
        </p>
        <p className={styles.meta}>
          {nhom !== undefined && (
            <>
              <Pick value={nhom.name} />
              <span aria-hidden="true"> · </span>
            </>
          )}
          <T k={bai.muc === 'advanced' ? 'level.advanced' : 'level.basic'} />
        </p>
      </header>

      <div className={styles.body}>
        <GuideBody bai={bai} />

        <aside className={styles.rail}>
          <nav className={styles.card} aria-labelledby="muc-luc">
            <h2 className={styles.blockTitle} id="muc-luc">
              <T k="guide.toc" />
            </h2>
            <GuideToc mucCo={bai.mucCo} />
          </nav>

          <section className={styles.card} aria-labelledby="mo-man-that">
            <h2 className={styles.blockTitle} id="mo-man-that">
              <T k="guide.openScreen" />
            </h2>
            <ul className={styles.linkList}>
              <li>
                <Link className={styles.railLink} href={`${duongDan}#khoi-so-lieu`}>
                  <span aria-hidden="true">↗ </span>
                  <T k="guide.openCalc" />
                </Link>
              </li>
              <li>
                <Link className={styles.railLink} href={`${duongDan}#khoi-vi-du`}>
                  <span aria-hidden="true">↗ </span>
                  <T k="guide.openExample" />
                </Link>
              </li>
              <li>
                <Link className={styles.railLink} href={`${duongDan}#quiz-${bai.id}-title`}>
                  <span aria-hidden="true">↗ </span>
                  <T k="guide.openQuiz" />
                </Link>
              </li>
            </ul>
          </section>

          {bai.lienQuan.length > 0 && (
            <section className={styles.card} aria-labelledby="lien-quan">
              <h2 className={styles.blockTitle} id="lien-quan">
                <T k="guide.related" />
              </h2>
              <ul className={styles.linkList}>
                {bai.lienQuan.map((id) => {
                  const ten = FORMULA_SUMMARIES.find((tom) => tom.id === id)?.name;
                  if (ten === undefined) return null;
                  return (
                    <li key={id}>
                      <Link className={styles.railLink} href={formulaPath(id)}>
                        <Pick value={ten} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
