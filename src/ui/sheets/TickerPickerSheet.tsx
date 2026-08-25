'use client';

import { useMemo, useState } from 'react';

import { normalizeVi, useTickerList } from '@/application';
import type { TickerRef } from '@/application';
import { useT } from '@/application/preferences-context';
import { BottomSheet, Button } from '@/ui/primitives';

import styles from './TickerPickerSheet.module.css';

/**
 * Số dòng dựng tối đa một lượt.
 *
 * ── Vì sao cắt bớt thay vì ảo hoá bằng `VirtualList` ────────────────────────────────────────
 *
 * `VirtualList` (`src/ui/browse/`) tính cửa sổ hiển thị từ `window.scroll` — nó cố ý KHÔNG tạo
 * khung cuộn lồng, xem docblock của nó. Nhưng thân `BottomSheet` lại chính là một khung cuộn
 * lồng (`overflow-y: auto`), nên cuộn trong sheet không hề làm `window.scrollY` nhúc nhích và
 * danh sách sẽ đứng im ở 40 mục đầu. Dùng nó ở đây là sai chỗ, không phải tiết kiệm.
 *
 * Cắt bớt hợp với cách người ta dùng ô này hơn: không ai duyệt 1.649 mã, họ gõ mã họ đã biết.
 * Điều kiện là **phải nói rõ đã cắt** — dòng "60/1.649 mã" ngay dưới danh sách, không im lặng
 * để người dùng tưởng thị trường chỉ có bấy nhiêu mã.
 */
const MAX_ROWS = 60;

export interface TickerPickerSheetProps {
  open: boolean;
  onClose: () => void;
  /** Gọi khi người dùng chọn một mã. Sheet tự đóng sau đó. */
  onPick: (ticker: TickerRef) => void;
}

/**
 * Sheet chọn mã trong toàn thị trường — gói "Danh mục dùng số liệu thật".
 *
 * Thay cho `<Select>` cũ chỉ có 4 mã mẫu. Cùng khuôn `PresetSheet` (WF-10) để hai ô chọn mã của
 * sản phẩm trông và dùng giống nhau, nhưng nguồn khác hẳn: `PresetSheet` đọc `DataProvider`
 * đồng bộ, còn ở đây là `MarketFeed` bất đồng bộ nên có thêm ba trạng thái đang tải / lỗi / cũ.
 */
export function TickerPickerSheet({ open, onClose, onPick }: TickerPickerSheetProps) {
  const t = useT();
  const [query, setQuery] = useState('');

  // Chỉ chạm mạng khi sheet thật sự mở — xem docblock `useTickerList`.
  const { items, status, failure, stale, reload } = useTickerList(open);

  /**
   * Lọc bỏ dấu, và **mã khớp đầu chuỗi đứng trước**.
   *
   * Gõ "vn" mà kết quả đầu là một công ty có chữ "vận" trong tên thì ô này vô dụng: người dùng
   * gõ mã, nên thứ khớp mã phải lên trước tên doanh nghiệp.
   */
  const results = useMemo(() => {
    const needle = normalizeVi(query).trim();
    if (needle === '') return items;

    const byCode: TickerRef[] = [];
    const byName: TickerRef[] = [];

    for (const item of items) {
      const code = normalizeVi(item.code);
      if (code.startsWith(needle)) byCode.push(item);
      else if (code.includes(needle) || normalizeVi(item.name).includes(needle)) byName.push(item);
    }

    return [...byCode, ...byName];
  }, [items, query]);

  const shown = results.slice(0, MAX_ROWS);

  function close(): void {
    setQuery('');
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={t('ticker.title')}
      subtitle={t('ticker.subtitle')}
    >
      <label className="visually-hidden" htmlFor="ticker-search">
        {t('ticker.searchLabel')}
      </label>
      <input
        id="ticker-search"
        className={styles.search}
        type="search"
        inputMode="search"
        autoComplete="off"
        placeholder={t('ticker.searchPlaceholder')}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        // Không tắt ô lúc đang tải: người dùng gõ sẵn mã rồi danh sách về là lọc luôn.
        disabled={status === 'error'}
      />

      {stale && (
        <p className={styles.stale} role="note">
          {t('ticker.stale')}
        </p>
      )}

      {status === 'loading' && <p className={styles.state}>{t('ticker.loading')}</p>}

      {status === 'error' && (
        <div className={styles.state} role="alert">
          <p className={styles.errorText}>
            {failure === 'network' ? t('ticker.errorNetwork') : t('ticker.errorSource')}
          </p>
          <Button variant="secondary" size="sm" onClick={reload}>
            {t('ticker.retry')}
          </Button>
        </div>
      )}

      {status === 'ready' && (
        <>
          {shown.length === 0 ? (
            <p className={styles.state}>{t('ticker.noMatch')}</p>
          ) : (
            <ul className={styles.list}>
              {shown.map((ticker) => (
                <li key={ticker.code} className={styles.item}>
                  {/* Mã đứng riêng thành huy hiệu — cùng lý do như PresetSheet: mắt dò theo mã. */}
                  <span className={styles.badge}>{ticker.code}</span>
                  <span className={styles.name}>{ticker.name}</span>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onPick(ticker);
                      close();
                    }}
                  >
                    {t('ticker.pick')}
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {/* Đã cắt bớt thì phải nói ra — im lặng sẽ thành "thị trường chỉ có 60 mã". */}
          {results.length > shown.length && (
            <p className={styles.footnote}>
              {shown.length}/{results.length} {t('ticker.capped')}
            </p>
          )}
        </>
      )}
    </BottomSheet>
  );
}
