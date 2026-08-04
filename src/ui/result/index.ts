/**
 * Hiển thị kết quả & diễn giải — gói WBS 2.4.
 *
 * Bất biến của nhánh này: không màn nào tự vẽ lấy trạng thái lỗi. Kết quả không tính được thì
 * `ResultBlock` giao cho `ErrorState`, và khuôn `— , —` + nguyên nhân + gợi ý sửa của WF-15
 * chỉ có MỘT chỗ định nghĩa. Nhờ vậy FR-06 không phụ thuộc việc người viết màn có nhớ kiểm
 * `value === null` hay không — cùng cách nghĩ với `ok()` ở tầng Domain.
 *
 * Gói 2.4.3 (FormulaLatex, render LaTeX bằng KaTeX) đang hoãn — xem việc còn lại ở TASK.md.
 */

export { ResultBlock } from './ResultBlock';
export type { ResultBlockProps } from './ResultBlock';

export { ErrorState } from './ErrorState';
export type { ErrorStateProps } from './ErrorState';

export { InlineWarning } from './InlineWarning';
export type { InlineWarningProps } from './InlineWarning';

export { ExplanationAccordion } from './ExplanationAccordion';
export type { ExplanationAccordionProps } from './ExplanationAccordion';

export { VariableTable } from './VariableTable';
export type { VariableTableProps } from './VariableTable';

export { ExampleBlock } from './ExampleBlock';
export type { ExampleBlockProps } from './ExampleBlock';

export { SourceBlock } from './SourceBlock';
export type { SourceBlockProps } from './SourceBlock';

export { FlowChainStrip } from './FlowChainStrip';
export type { FlowChainStripProps } from './FlowChainStrip';

export { StatTile } from './StatTile';
export type { StatTileProps } from './StatTile';
