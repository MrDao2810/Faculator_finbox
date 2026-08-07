'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { SAMPLE_DATA, t } from '@/application';
import type { Preset } from '@/application';
import { BottomSheet, Button } from '@/ui/primitives';

import styles from './PresetSheet.module.css';

export interface PresetSheetProps {
  open: boolean;
  onClose: () => void;
  /** Gọi khi người dùng bấm Nạp ở một mã. Sheet tự đóng sau đó. */
  onLoad: (preset: Preset) => void;
}

/**
 * Sheet nạp bộ số liệu mẫu — gói WBS 2.5.1, màn WF-10.
 *
 * FR-10: "nạp bộ số liệu mẫu có thật theo mã; sau khi nạp vẫn sửa được từng ô." Câu sau mới
 * là phần quan trọng: preset chỉ điền giá trị khởi đầu, không khoá ô nào lại. Component này
 * chỉ bắn `onLoad`, còn màn hình quyết định điền vào đâu — nên không có cách nào nó vô tình
 * khoá ô của người dùng.
 *
 * Số liệu đi qua `DataProvider` (FR-17), nên khi có nguồn thật thì sheet này không phải sửa gì.
 */
export function PresetSheet({ open, onClose, onLoad }: PresetSheetProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => SAMPLE_DATA.search(query), [query]);

  /*
   * Cảnh báo số liệu bản thảo xét trên CẢ BỘ, không phải trên phần đang lọc: nó nói về nguồn
   * dữ liệu chứ không nói về mấy dòng đang hiện. Xét theo phần lọc thì gõ một từ khoá không
   * khớp gì là câu cảnh báo biến mất — vừa sai nghĩa, vừa làm sheet co thêm một nấc.
   */
  const anyDraft = useMemo(() => SAMPLE_DATA.list().some((preset) => preset.isDraft), []);

  /*
   * ── Vì sao phải ghim chiều cao vùng kết quả ────────────────────────────────────────────
   *
   * Gõ vào ô tìm là danh sách ngắn lại, và sheet dán đáy màn hình nên nó co từ dưới lên: ô
   * tìm cùng mọi thứ bên trên **nhảy xuống** ngay giữa lúc người dùng đang gõ, có khi trượt
   * cả khỏi ngón tay. Cùng loại phiền với việc bố cục nhảy khi ảnh tải xong.
   *
   * Đo một lần lúc mở, khi danh sách còn ĐẦY ĐỦ — đó cũng là lúc vùng này cao nhất, vì lọc
   * chỉ bớt đi chứ không thêm vào. Từ đó sheet chỉ giãn ra chứ không bao giờ co lại.
   *
   * Đo bằng `useEffect` chứ không phải `useLayoutEffect`: `<dialog>` chưa gọi `showModal()`
   * thì còn `display: none` và đo ra 0. Effect thụ động của con (`BottomSheet`, nơi gọi
   * `showModal`) chạy trước effect thụ động của cha, nên tới lượt đo thì sheet đã hiện.
   *
   * Không viết cứng một số px: số bộ mẫu do `DataProvider` quyết, ngày có nguồn thật thì
   * khác ngay.
   */
  const resultsRef = useRef<HTMLDivElement>(null);
  const [floor, setFloor] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      // Đóng rồi thì bỏ ghim, để lần mở sau đo lại theo danh sách lúc đó.
      setFloor(null);
      return;
    }
    const height = resultsRef.current?.getBoundingClientRect().height ?? 0;
    if (height > 0) setFloor(height);
  }, [open]);

  /** Xoá luôn từ khoá khi đóng, để lần mở sau bắt đầu từ danh sách đầy đủ. */
  function close(): void {
    setQuery('');
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={t('preset.title')}
      subtitle={t('preset.subtitle')}
    >
      <label className="visually-hidden" htmlFor="preset-search">
        {t('preset.searchLabel')}
      </label>
      <input
        id="preset-search"
        className={styles.search}
        type="search"
        inputMode="search"
        autoComplete="off"
        placeholder={t('preset.searchPlaceholder')}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />

      {anyDraft && (
        <p className={styles.draft} role="note">
          <strong>{t('preset.draftTitle')}</strong> {t('preset.draftDetail')}
        </p>
      )}

      <div
        ref={resultsRef}
        className={styles.results}
        style={floor === null ? undefined : { minHeight: `${String(Math.round(floor))}px` }}
      >
        {results.length === 0 ? (
          <p className={styles.empty}>{t('preset.noMatch')}</p>
        ) : (
          <ul className={styles.list}>
            {results.map((preset) => (
              <li key={preset.code} className={styles.item}>
                {/*
                  Mã đứng riêng thành huy hiệu chữ đều: ở danh sách này người dùng dò theo MÃ
                  chứ không theo tên doanh nghiệp, nên mã phải là thứ mắt bắt được trước. Chỉ
                  có MỘT phần tử mang mã — nhân đôi thành huy hiệu + dòng chữ thì trình đọc màn
                  hình đọc mã hai lần.
                */}
                <span className={styles.badge}>{preset.code}</span>

                <span className={styles.info}>
                  <span className={styles.name}>{preset.name}</span>
                  <span className={styles.meta}>
                    {preset.meta}
                    {preset.isDraft && (
                      <span className={styles.draftTag}> · {t('preset.draftTag')}</span>
                    )}
                  </span>
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onLoad(preset);
                    close();
                  }}
                >
                  {t('preset.load')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className={styles.footnote}>{t('preset.editableAfterLoad')}</p>
    </BottomSheet>
  );
}
