'use client';

import Link from 'next/link';

import { ROUTES } from '@/application';
import { useT } from '@/application/preferences-context';

import styles from './SearchBoxLink.module.css';

/**
 * Ô tìm ở `/cong-thuc/` — trông như `SearchBox` nhưng KHÔNG gõ được, bấm vào là nhảy sang
 * `/tim-kiem/`, nơi mới thật sự gõ-lọc-tại-chỗ.
 *
 * Thay cho icon kính lúp từng đứng ở thanh trên (đợt đổi icon tìm kiếm thành icon đổi theme):
 * `/tim-kiem/` mất lối vào từ thanh trên, và chủ dự án chốt lối vào mới là chính ô tìm ở màn
 * duyệt danh sách, đúng chỗ người dùng đã quen bấm vào để tìm.
 *
 * CSS chép nhỏ từ `SearchBox.module.css` chứ không import chéo: file đó bị `radius.test.ts`
 * khoá cứng theo đúng lớp `.control` của riêng nó, import chéo sẽ khiến một sửa đổi tương lai
 * cho ô nhập thật vô tình đổi luôn hình dạng của link tĩnh này.
 */
export function SearchBoxLink() {
  const t = useT();

  return (
    <Link href={ROUTES.search} className={styles.control} aria-label={t('search.label')}>
      <svg
        className={styles.icon}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>

      <span className={styles.placeholder}>{t('search.placeholder')}</span>
    </Link>
  );
}
