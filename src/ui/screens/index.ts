/**
 * Thân màn riêng của một số công thức — gói WBS 3.2.3 (WF-08) và 3.2.4 (WF-14).
 *
 * Khác `src/ui/result/`: những thứ trong đó là khối dùng chung cho mọi công thức, còn ở đây
 * là bố cục riêng của đúng một màn trong wireframe.
 */

export { DetailBody, DetailConfig, hasConfigBlock, hasCustomBody, ownsResult } from './DetailBody';
export type { DetailBodyProps } from './DetailBody';

export { FeeScheduleField } from './FeeScheduleField';

export { FeeTaxBody } from './FeeTaxBody';
export type { FeeTaxBodyProps } from './FeeTaxBody';

export { LoanScheduleBody } from './LoanScheduleBody';
export type { LoanScheduleBodyProps } from './LoanScheduleBody';
