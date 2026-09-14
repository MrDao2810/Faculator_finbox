import Link from 'next/link';

import { ROUTES, type MessageKey } from '@/application';
import { T } from '@/ui/i18n/T';

import styles from './AboutScreen.module.css';

/**
 * Màn "Về chúng tôi" — WF chưa đánh số, dựng theo bản vẽ chủ dự án duyệt 14/09/2026.
 *
 * ── Vì sao là SERVER component ───────────────────────────────────────────────────────────────
 *
 * Màn này không có state, không đọc `localStorage`, không nghe sự kiện nào — nó là ~45 đoạn chữ
 * tĩnh và một ảnh. Để server dựng thì toàn bộ prose nằm sẵn trong `out/ve-chung-toi/index.html`
 * (đúng thứ bộ máy tìm kiếm đọc, FR-25) và gói máy khách không thêm một byte nào: `T` và
 * `next/link` đều đã nằm trong gói chung.
 *
 * Hệ quả bắt buộc: mọi chữ đi qua lá client `<T k="…" />` chứ không `useT()` — server component
 * không gọi hook được. Chữ trong THUỘC TÍNH thì không bọc `<T>` được, nên ảnh dùng `alt=""`
 * (xem chỗ khai) thay vì một câu mô tả phải dịch.
 *
 * ── Vì sao thân màn tự dựng <h1> ─────────────────────────────────────────────────────────────
 *
 * '/ve-chung-toi/' cố ý KHÔNG có tên trong `HEADER_TITLES`. Màn này mở bằng dải giới thiệu có
 * tiêu đề lớn của riêng nó; đẩy `<h1>` lên thanh trên thì từ 1024px nó thành `position: absolute`
 * và trang giới thiệu mất hẳn tiêu đề nhìn thấy được trên desktop. Lý do đầy đủ ở `routes.ts`.
 * `AboutScreen.test.tsx` gác đúng một `<h1>` để hai bên không cùng dựng.
 */

/** Ba thẻ nhỏ dưới đoạn mở đầu. Icon chung một hình — chúng là một bộ, không phải ba ý rời. */
const HERO_STATS: ReadonlyArray<{ name: MessageKey; note: MessageKey }> = [
  { name: 'aboutUs.stat.full', note: 'aboutUs.stat.fullNote' },
  { name: 'aboutUs.stat.fresh', note: 'aboutUs.stat.freshNote' },
  { name: 'aboutUs.stat.simple', note: 'aboutUs.stat.simpleNote' },
];

/** Sáu việc sản phẩm làm được. */
const CAPABILITIES: ReadonlyArray<{ name: MessageKey; note: MessageKey }> = [
  { name: 'aboutUs.can.lookup', note: 'aboutUs.can.lookupNote' },
  { name: 'aboutUs.can.instant', note: 'aboutUs.can.instantNote' },
  { name: 'aboutUs.can.chain', note: 'aboutUs.can.chainNote' },
  { name: 'aboutUs.can.fees', note: 'aboutUs.can.feesNote' },
  { name: 'aboutUs.can.data', note: 'aboutUs.can.dataNote' },
  { name: 'aboutUs.can.portfolio', note: 'aboutUs.can.portfolioNote' },
];

/** Bốn tầng, đúng thứ tự từ trên xuống của kiến trúc. Số thứ tự do `<ol>` mang nghĩa. */
const LAYERS: ReadonlyArray<{ name: MessageKey; note: MessageKey }> = [
  { name: 'aboutUs.arch.ui', note: 'aboutUs.arch.uiNote' },
  { name: 'aboutUs.arch.calc', note: 'aboutUs.arch.calcNote' },
  { name: 'aboutUs.arch.registry', note: 'aboutUs.arch.registryNote' },
  { name: 'aboutUs.arch.provider', note: 'aboutUs.arch.providerNote' },
];

/** Hai thẻ nói dữ liệu nằm ở đâu và số liệu lấy từ đâu. */
const DATA_NOTES: ReadonlyArray<{ name: MessageKey; note: MessageKey }> = [
  { name: 'aboutUs.yourData.noAccount', note: 'aboutUs.yourData.noAccountNote' },
  { name: 'aboutUs.yourData.sources', note: 'aboutUs.yourData.sourcesNote' },
];

/**
 * Bốn việc sản phẩm KHÔNG làm.
 *
 * Khối này không phải phần thừa của trang quảng bá — nó là phần làm trang quảng bá đáng tin, và
 * mục `aboutUs.not.advice` còn là chỗ nhắc lại tinh thần CON-11 bằng giọng của trang này.
 */
const NOT_A: ReadonlyArray<{ name: MessageKey; note: MessageKey }> = [
  { name: 'aboutUs.not.broker', note: 'aboutUs.not.brokerNote' },
  { name: 'aboutUs.not.realtime', note: 'aboutUs.not.realtimeNote' },
  { name: 'aboutUs.not.history', note: 'aboutUs.not.historyNote' },
  { name: 'aboutUs.not.advice', note: 'aboutUs.not.adviceNote' },
];

/** Hình cột biểu đồ của ba thẻ mở đầu. `currentColor` nên nó theo màu chữ của thẻ. */
function ChartGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 18v-5M12 18V7M18 18v-8" />
    </svg>
  );
}

/** Dấu nhân của khối "không phải là gì" — dấu hiệu hình khối, không chỉ dựa vào màu (NFR-USA-06). */
function CrossGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function AboutScreen() {
  return (
    <div className={styles.page}>
      {/* ── Dải mở đầu: chữ bên trái, hình bên phải ───────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>
            <T k="aboutUs.eyebrow" />
          </p>
          <h1 className={styles.title}>
            <T k="aboutUs.title" />
          </h1>
          <p className={styles.lead}>
            <T k="aboutUs.lead" />
          </p>

          <ul className={styles.stats}>
            {HERO_STATS.map((stat) => (
              <li key={stat.name} className={styles.stat}>
                <span className={styles.statIcon}>
                  <ChartGlyph />
                </span>
                <span className={styles.statText}>
                  <span className={styles.statName}>
                    <T k={stat.name} />
                  </span>
                  <span className={styles.statNote}>
                    <T k={stat.note} />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.heroArt}>
          {/*
           * `alt=""` — ảnh TRANG TRÍ, và đó là lựa chọn chứ không phải bỏ sót: nó minh hoạ lại
           * đúng những gì đoạn `aboutUs.lead` ngay bên cạnh đã nói, nên một câu mô tả chỉ khiến
           * trình đọc màn hình nghe cùng một ý hai lần. `alt=""` cũng gỡ ảnh khỏi cây trợ năng
           * nên `aria-hidden` là thừa.
           *
           * `<img>` trần chứ không `next/image`: bản build là `output: 'export'` với
           * `images.unoptimized`, nên `next/image` chỉ thêm runtime máy khách mà không tối ưu
           * được gì.
           *
           * `width`/`height` là THUỘC TÍNH HTML, không phải chỉ CSS — trình duyệt suy ra tỉ lệ
           * khung từ chúng và chừa sẵn chỗ ngay từ byte đầu, nên trang không giật khi ảnh về. Hai
           * số là kích thước THẬT của tệp (1040×716), không phải khổ hiển thị: khổ hiển thị do
           * `.heroImage` kẹp ở 520px, tức tệp đúng gấp đôi — vừa đủ nét trên màn retina mà không
           * phải gánh bản gốc 1344px.
           *
           * Không `loading="lazy"`: ảnh này nằm trên màn đầu và gần chắc là phần tử LCP.
           */}
          {/* eslint-disable-next-line @next/next/no-img-element -- xem chú thích ngay trên */}
          <img
            className={styles.heroImage}
            src="/about-hero.png"
            alt=""
            width={1040}
            height={716}
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </section>

      {/* ── Sản phẩm làm được gì ──────────────────────────────────────────────────────────── */}
      <section className={styles.block} aria-labelledby="about-can">
        <h2 className={styles.blockTitle} id="about-can">
          <T k="aboutUs.can.title" />
        </h2>
        <ul className={styles.cardGrid}>
          {CAPABILITIES.map((item) => (
            <li key={item.name} className={styles.card}>
              <h3 className={styles.cardTitle}>
                <T k={item.name} />
              </h3>
              <p className={styles.cardNote}>
                <T k={item.note} />
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Hai cột: kiến trúc bên trái, dữ liệu bên phải ─────────────────────────────────── */}
      <div className={styles.twoCol}>
        <section className={styles.block} aria-labelledby="about-arch">
          <h2 className={styles.blockTitle} id="about-arch">
            <T k="aboutUs.arch.title" />
          </h2>
          <ol className={styles.steps}>
            {LAYERS.map((layer, index) => (
              <li key={layer.name} className={styles.step}>
                {/*
                 * Số thứ tự vẽ tay và `aria-hidden`: `<ol>` đã mang nghĩa thứ tự cho trình đọc
                 * màn hình, nên đọc thêm "1" nữa là lặp. Ở đây nó thuần là hình.
                 */}
                <span className={styles.stepNum} aria-hidden="true">
                  {index + 1}
                </span>
                <span className={styles.stepText}>
                  <span className={styles.cardTitle}>
                    <T k={layer.name} />
                  </span>
                  <span className={styles.cardNote}>
                    <T k={layer.note} />
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.block} aria-labelledby="about-data">
          <h2 className={styles.blockTitle} id="about-data">
            <T k="aboutUs.yourData.title" />
          </h2>
          <ul className={styles.stack}>
            {DATA_NOTES.map((item) => (
              <li key={item.name} className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <T k={item.name} />
                </h3>
                <p className={styles.cardNote}>
                  <T k={item.note} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Không phải là gì ──────────────────────────────────────────────────────────────── */}
      <section className={styles.block} aria-labelledby="about-not">
        <h2 className={styles.blockTitle} id="about-not">
          <T k="aboutUs.not.title" />
        </h2>
        <ul className={styles.notGrid}>
          {NOT_A.map((item) => (
            <li key={item.name} className={styles.notCard}>
              <span className={styles.notIcon}>
                <CrossGlyph />
              </span>
              <span className={styles.notText}>
                <span className={styles.cardTitle}>
                  <T k={item.name} />
                </span>
                <span className={styles.cardNote}>
                  <T k={item.note} />
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Dải kêu gọi cuối trang ────────────────────────────────────────────────────────── */}
      <section className={styles.cta} aria-labelledby="about-cta">
        <p className={styles.ctaEyebrow}>
          <T k="aboutUs.cta.eyebrow" />
        </p>
        <h2 className={styles.ctaTitle} id="about-cta">
          <T k="aboutUs.cta.title" />
        </h2>
        <p className={styles.ctaNote}>
          <T k="aboutUs.cta.note" />
        </p>
        {/*
         * <Link> tạo dáng nút bằng CSS, KHÔNG dùng primitive <Button>: cái đó dựng ra <button>,
         * thứ không điều hướng được khi JavaScript chưa tải xong — mà đây là bản xuất tĩnh nên
         * thẻ <a> thật vẫn đi được ngay từ HTML đầu tiên.
         */}
        <Link className={styles.ctaAction} href={ROUTES.formulas}>
          <T k="aboutUs.cta.action" />
          {/* Mũi tên là hình, không phải chữ — để tên trợ năng của nút sạch và khỏi phải dịch. */}
          <span aria-hidden="true"> →</span>
        </Link>
      </section>
    </div>
  );
}
