/** Tìm kiếm & duyệt — gói WBS 2.2. */

export { SearchBox } from './SearchBox';
export type { SearchBoxProps } from './SearchBox';

/* Ô tìm ở /cong-thuc/ — không gõ được, bấm là nhảy sang /tim-kiem/. */
export { SearchBoxLink } from './SearchBoxLink';

export { CategoryFilter } from './CategoryFilter';
export type { CategoryFilterProps } from './CategoryFilter';

export { FormulaCard } from './FormulaCard';
export type { FormulaCardProps } from './FormulaCard';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

/* Chế độ Cơ bản / Nâng cao lọc danh sách — FR-09. */
export { HiddenByLevelNote } from './HiddenByLevelNote';
export type { HiddenByLevelNoteProps } from './HiddenByLevelNote';

/* Trang chủ WF-01 — gói WBS 3.1.1. */
export { CategoryGrid } from './CategoryGrid';
export type { CategoryGridProps } from './CategoryGrid';

/* Dấu hiệu thị giác của 12 nhóm — bản thiết kế đợt 12. */
export { CategoryIcon, toneClass, drawnCategoryIds } from './CategoryIcon';
export type { CategoryIconProps } from './CategoryIcon';

/* Danh sách WF-02 — gói WBS 3.1.2. */
export { VirtualList } from './VirtualList';
export type { VirtualListProps } from './VirtualList';

/* Tìm kiếm WF-09 — gói WBS 3.1.3. */
export { SearchResults } from './SearchResults';
export type { SearchResultsProps } from './SearchResults';

export { Highlight } from './Highlight';
export type { HighlightProps } from './Highlight';

export { RecentSearches } from './RecentSearches';
export type { RecentSearchesProps } from './RecentSearches';

export { HotCategories } from './HotCategories';
export type { HotCategoriesProps } from './HotCategories';
