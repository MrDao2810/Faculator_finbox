'use client';

import { CATEGORIES } from '@/application';
import type { ListParams, ListSort, SegmentFilter } from '@/application';
import { useT, usePick } from '@/application/preferences-context';
import { Button, Chip, Select } from '@/ui/primitives';

import styles from './CategoryFilter.module.css';

const SEGMENTS: ReadonlyArray<{
  value: SegmentFilter;
  labelKey: 'filter.segment.all' | 'filter.segment.stock' | 'filter.segment.personal';
}> = [
  { value: 'all', labelKey: 'filter.segment.all' },
  { value: 'stock', labelKey: 'filter.segment.stock' },
  { value: 'personal', labelKey: 'filter.segment.personal' },
];

const SORTS: ReadonlyArray<{ value: ListSort; labelKey: 'sort.featured' | 'sort.az' | 'sort.za' }> =
  [
    { value: 'featured', labelKey: 'sort.featured' },
    { value: 'az', labelKey: 'sort.az' },
    { value: 'za', labelKey: 'sort.za' },
  ];

export interface CategoryFilterProps {
  params: ListParams;
  onChange: (patch: Partial<ListParams>) => void;
  onReset: () => void;
  /** Số kết quả của từng mảng, hiện ngay trên chip. */
  segmentCounts: Readonly<Record<'all' | 'stock' | 'personal', number>>;
  /** Số kết quả của từng nhóm, hiện trong danh sách chọn. */
  categoryCounts: ReadonlyMap<string, number>;
  /** Có đang lọc gì không — quyết định hiện nút Xoá bộ lọc. */
  showReset: boolean;
}

/**
 * Bộ lọc mảng và nhóm — gói WBS 2.2.2.
 *
 * WF-02: ba chip Tất cả · Chứng khoán · Cá nhân, kèm danh sách chọn 12 nhóm có số đếm.
 * Số đếm của nhóm KHÔNG bị chính nhóm đang chọn ảnh hưởng, để người dùng thấy chọn nhóm
 * khác thì còn bao nhiêu kết quả thay vì thấy toàn số 0.
 */
export function CategoryFilter({
  params,
  onChange,
  onReset,
  segmentCounts,
  categoryCounts,
  showReset,
}: CategoryFilterProps) {
  const t = useT();
  const pick = usePick();
  const visibleCategories = CATEGORIES.filter(
    (category) => params.segment === 'all' || category.segment === params.segment,
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.chips} role="group" aria-label={t('filter.segment.label')}>
        {SEGMENTS.map((segment) => (
          <Chip
            key={segment.value}
            label={t(segment.labelKey)}
            count={segmentCounts[segment.value === 'all' ? 'all' : segment.value]}
            selected={params.segment === segment.value}
            onClick={() => {
              // Đổi mảng thì bỏ nhóm đang chọn — nhóm cũ có thể không thuộc mảng mới.
              onChange({ segment: segment.value, categoryId: null });
            }}
          />
        ))}
      </div>

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
