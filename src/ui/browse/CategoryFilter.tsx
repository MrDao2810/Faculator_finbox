'use client';

import { CATEGORIES } from '@/application';
import type { ListParams, ListSort, SegmentFilter } from '@/application';
import { useT, usePick } from '@/application/preferences-context';
import { Button, Select, TabBar } from '@/ui/primitives';

import styles from './CategoryFilter.module.css';

const SEGMENTS: ReadonlyArray<{
  value: SegmentFilter;
  labelKey: 'filter.segment.all' | 'filter.segment.stock' | 'filter.segment.personal';
}> = [
  { value: 'all', labelKey: 'filter.segment.all' },
  { value: 'stock', labelKey: 'filter.segment.stock' },
  { value: 'personal', labelKey: 'filter.segment.personal' },
];

/**
 * Thứ tự trong `<select>` gom theo LOẠI tiêu chí, không theo thứ tự thêm vào: hai cách sắp bám
 * thói quen người dùng đứng cạnh nhau ngay sau mặc định, rồi tới cấp độ, cuối cùng là bảng chữ
 * cái. Người tìm "cái mình vừa xem" không phải quét qua A → Z mới thấy.
 */
const SORTS: ReadonlyArray<{
  value: ListSort;
  labelKey: 'sort.featured' | 'sort.recent' | 'sort.used' | 'sort.basic' | 'sort.az' | 'sort.za';
}> = [
  { value: 'featured', labelKey: 'sort.featured' },
  { value: 'recent', labelKey: 'sort.recent' },
  { value: 'used', labelKey: 'sort.used' },
  { value: 'basic', labelKey: 'sort.basic' },
  { value: 'az', labelKey: 'sort.az' },
  { value: 'za', labelKey: 'sort.za' },
];

export interface CategoryFilterProps {
  params: ListParams;
  onChange: (patch: Partial<ListParams>) => void;
  onReset: () => void;
  /** Số kết quả của từng nhóm, hiện trong danh sách chọn. */
  categoryCounts: ReadonlyMap<string, number>;
  /** Có đang lọc gì không — quyết định hiện nút Xoá bộ lọc. */
  showReset: boolean;
  /** id của vùng danh sách mà thanh mảng điều khiển — xem `SEGMENT_TABS_ID`. */
  panelId?: string;
}

/**
 * Tiền tố id của thanh tab mảng.
 *
 * Để ở đây chứ không ở màn: vùng danh sách bên `FormulaBrowser` cần `aria-labelledby` trỏ ngược
 * về đúng tab đang chọn, nên hai bên phải dựng id từ CÙNG một chỗ.
 */
export const SEGMENT_TABS_ID = 'mang';

/**
 * Bộ lọc mảng và nhóm — gói WBS 2.2.2.
 *
 * WF-02: ba mảng Tất cả · Chứng khoán · Cá nhân, kèm danh sách chọn 12 nhóm có số đếm.
 * Số đếm của nhóm KHÔNG bị chính nhóm đang chọn ảnh hưởng, để người dùng thấy chọn nhóm
 * khác thì còn bao nhiêu kết quả thay vì thấy toàn số 0.
 *
 * ── Ba mảng là TAB, không phải chip (chủ dự án chốt) ──────────────────────────────────────────
 *
 * Chip là khuôn của bộ lọc CỘNG DỒN: bấm thêm một cái thì lọc chặt thêm. Ba mảng này loại trừ
 * nhau, và mỗi lần bấm là thay hẳn danh sách bên dưới — đúng nghĩa tab. Cái sai không chỉ nằm ở
 * hình: `Chip` phát ra `aria-pressed`, tức trình đọc màn hình đọc ra "nút bật/tắt" chứ không đọc
 * ra "1 trong 3", và cả ba cùng "bật/tắt" độc lập trong khi thật ra chúng ràng buộc nhau.
 *
 * Danh sách chọn NHÓM thì giữ nguyên `<Select>`: 12 mục thì không thành hàng tab được ở 360px.
 *
 * ── Ba tab KHÔNG mang số đếm (chủ dự án chốt) ─────────────────────────────────────────────────
 *
 * Trước có: "Tất cả 111 · Chứng khoán 98 · Cá nhân 13". Bỏ hẳn, chỉ còn chữ. Dòng đếm ngay dưới
 * cụm tab đã nói số kết quả của mảng đang xem, nên ba con số kia chỉ trả lời một câu hỏi người
 * dùng chưa hỏi — mà lại chiếm chỗ đúng ở khổ 360px, nơi "Chứng khoán" đã là nhãn dài nhất.
 *
 * `TabBar.count` VẪN còn trong hợp đồng của primitive và vẫn có ca kiểm: `PortfolioScreen` có số
 * đếm trên tab, và nó là chỗ tiếp theo dùng primitive này. Bỏ ở đây là quyết định của MÀN.
 *
 * `countBySegmentFor()` ở Domain cũng giữ nguyên (còn ca kiểm riêng ở `search.test.ts`), chỉ là
 * tạm không còn nơi gọi — nó là câu trả lời sẵn cho lần muốn bày lại số đếm ở đâu đó.
 */
export function CategoryFilter({
  params,
  onChange,
  onReset,
  categoryCounts,
  showReset,
  panelId,
}: CategoryFilterProps) {
  const t = useT();
  const pick = usePick();
  const visibleCategories = CATEGORIES.filter(
    (category) => params.segment === 'all' || category.segment === params.segment,
  );

  return (
    <div className={styles.wrap}>
      <TabBar
        label={t('filter.segment.label')}
        idBase={SEGMENT_TABS_ID}
        panelId={panelId}
        value={params.segment}
        items={SEGMENTS.map((segment) => ({
          value: segment.value,
          label: t(segment.labelKey),
        }))}
        onChange={(segment) => {
          // Đổi mảng thì bỏ nhóm đang chọn — nhóm cũ có thể không thuộc mảng mới.
          onChange({ segment, categoryId: null });
        }}
      />

      <div className={styles.selects}>
        <Select
          className={styles.field}
          label={t('filter.category.label')}
          value={params.categoryId ?? ''}
          onChange={(event) => {
            onChange({ categoryId: event.target.value === '' ? null : event.target.value });
          }}
        >
          <option value="">{t('filter.category.all')}</option>
          {visibleCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {pick(category.name)} ({categoryCounts.get(category.id) ?? 0})
            </option>
          ))}
        </Select>

        <Select
          className={styles.field}
          label={t('sort.label')}
          value={params.sort}
          onChange={(event) => {
            onChange({ sort: event.target.value as ListSort });
          }}
        >
          {SORTS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {t(sort.labelKey)}
            </option>
          ))}
        </Select>
      </div>

      {showReset && (
        <Button variant="ghost" size="sm" className={styles.reset} onClick={onReset}>
          {t('filter.reset')}
        </Button>
      )}
    </div>
  );
}
