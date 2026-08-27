'use client';

import { SAMPLE_DATA } from '@/application';
import type { Preset } from '@/application';
import { useT } from '@/application/preferences-context';
import { BottomSheet, Button } from '@/ui/primitives';

import styles from './PresetSheet.module.css';

export interface PresetSheetProps {
  open: boolean;
  onClose: () => void;
  /** Gọi khi người dùng bấm Nạp ở một mã. Sheet tự đóng sau đó. */
  onLoad: (preset: Preset) => void;
  /**
   * Mở sheet chọn mã toàn thị trường (`TickerPickerSheet`).
   *
   * Tuỳ chọn: nơi nào không có đường sang thì bỏ, sheet vẫn dùng được như cũ. Màn chi tiết
   * công thức thì luôn truyền — xem docblock ngay dưới.
   */
  onBrowseMarket?: () => void;
}

/**
 * Sheet nạp bộ số liệu mẫu — gói WBS 2.5.1, màn WF-10.
 *
 * FR-10: "nạp bộ số liệu mẫu có thật theo mã; sau khi nạp vẫn sửa được từng ô." Câu sau mới
 * là phần quan trọng: preset chỉ điền giá trị khởi đầu, không khoá ô nào lại. Component này
 * chỉ bắn `onLoad`, còn màn hình quyết định điền vào đâu — nên không có cách nào nó vô tình
 * khoá ô của người dùng.
 *
 * Số liệu đi qua `DataProvider` (FR-17).
 *
 * ── Vì sao KHÔNG còn ô tìm ở đây ────────────────────────────────────────────────────────────
 *
 * Sản phẩm có HAI kho mã, và sheet này chỉ là kho nhỏ:
 *
 * | | sheet này (`DataProvider`) | `TickerPickerSheet` (`MarketFeed`) |
 * | Số mã | 4 mã WF-10 | ~1.649 mã đang giao dịch |
 * | Chuỗi giá | 248 phiên OHLCV | ĐÚNG 1 phiên (`live-preset.ts`) |
 *
 * Bản trước có ô tìm cho đúng 4 dòng. Chủ dự án báo đúng mâu thuẫn mà nó tạo ra: gõ một mã
 * bất kỳ ngoài bốn mã ấy thì ra "không có mã nào khớp" — người dùng kết luận sản phẩm không
 * biết mã đó — rồi ngay sau khi nạp, thanh mã dưới tiêu đề lại mời "Đổi mã" và mở ra cả
 * 1.649 mã. Ô tìm hứa một kho mã mà kho ở đây chỉ có bốn.
 *
 * Nên: bỏ ô tìm (bốn dòng thì không có gì để tìm), nói thẳng đây là bộ mẫu và điểm mạnh
 * riêng của nó là CHUỖI PHIÊN GIÁ, rồi đặt ngay lối sang kho lớn. Một cửa vào, hai nhánh
 * gọi đúng tên mình.
 *
 * Bỏ ô tìm cũng gỡ luôn phần ghim chiều cao vùng kết quả bằng `getBoundingClientRect()`:
 * nó chỉ tồn tại vì lọc làm danh sách ngắn lại giữa lúc người dùng đang gõ, mà giờ danh
 * sách không co nữa.
 */
export function PresetSheet({ open, onClose, onLoad, onBrowseMarket }: PresetSheetProps) {
  const t = useT();

  /** Mảng hằng của `DataProvider` — cùng một tham chiếu mọi lượt render, không cần ghi nhớ. */
  const presets = SAMPLE_DATA.list();

  /* Cảnh báo bản thảo xét trên CẢ BỘ: nó nói về nguồn dữ liệu, không về mấy dòng đang hiện. */
  const anyDraft = presets.some((preset) => preset.isDraft);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t('preset.title')}
      subtitle={t('preset.subtitle')}
    >
      {anyDraft && (
        <p className={styles.draft} role="note">
          <strong>{t('preset.draftTitle')}</strong> {t('preset.draftDetail')}
        </p>
      )}

      <ul className={styles.list}>
        {presets.map((preset) => (
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
                onClose();
              }}
            >
              {t('preset.load')}
            </Button>
          </li>
        ))}
      </ul>

      {/*
        Lối sang kho mã lớn. Đặt DƯỚI danh sách chứ không thành ô tìm ở trên: bốn mã này là
        thứ dùng được ngay cho cả công thức chuỗi, còn kho lớn đổi lại độ phủ bằng chuỗi giá
        một phiên — nên nó là lối rẽ có điều kiện, không phải mặc định.
      */}
      {onBrowseMarket !== undefined && (
        <div className={styles.browse}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              onBrowseMarket();
            }}
          >
            {t('preset.browseMarket')}
          </Button>
          <p className={styles.browseNote}>{t('preset.browseMarketNote')}</p>
        </div>
      )}

      <p className={styles.footnote}>{t('preset.editableAfterLoad')}</p>
    </BottomSheet>
  );
}
