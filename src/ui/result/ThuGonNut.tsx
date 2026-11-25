'use client';

import { useT } from '@/application/preferences-context';
import { Button } from '@/ui/primitives';

import styles from './ThuGonNut.module.css';

/** Số hàng luôn hiện khi danh sách biến bị thu gọn (bảng biến, dòng "Thay số"). */
export const SO_HANG_HIEN = 2;
/** Ẩn chỉ 1 hàng thì nút "Xem thêm 1 biến" không đáng một cú chạm: chỉ thu gọn khi ẩn từ 2 hàng. */
export const SO_HANG_AN_TOI_THIEU = 2;

/**
 * Số hàng sẽ ẩn khi danh sách `tong` hàng được thu gọn; 0 nghĩa là không thu gọn (ít quá).
 * Dùng chung cho bảng biến và dòng "Thay số" để hai nơi cùng một ngưỡng.
 */
export function soHangAn(tong: number): number {
  const an = Math.max(0, tong - SO_HANG_HIEN);
  return an >= SO_HANG_AN_TOI_THIEU ? an : 0;
}

export interface ThuGonNutProps {
  /** Đang mở hết. */
  moHet: boolean;
  /** Số hàng đang ẩn, in vào nhãn "Xem thêm N biến". */
  soAn: number;
  /** `id` của vùng nút điều khiển, cho `aria-controls`. */
  dieuKhien: string;
  onToggle: () => void;
}

/**
 * Nút "Xem thêm N biến" / "Thu gọn" — chữ nghiêng, xanh dương (`--color-accent`, màu liên kết) và
 * mũi tên xổ xuống, lật lên khi đã mở, để người dùng biết bấm được. Mọi cỡ màn hình.
 */
export function ThuGonNut({ moHet, soAn, dieuKhien, onToggle }: ThuGonNutProps) {
  const t = useT();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={styles.nut}
      aria-expanded={moHet}
      aria-controls={dieuKhien}
      onClick={onToggle}
    >
      {moHet ? t('result.showLess') : t('result.showMoreVars').replace('{n}', String(soAn))}
      <svg
        className={styles.muiTen}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </Button>
  );
}
