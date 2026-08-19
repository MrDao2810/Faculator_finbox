'use client';

import dynamic from 'next/dynamic';

import type { CalcContext, CalcOutput, CashflowRow } from '@/application';

import { FeeScheduleField } from './FeeScheduleField';

/**
 * Khối kết quả riêng của một số công thức — gói WBS 3.2.1 ("tải trễ khối nặng").
 *
 * Phần lớn trong 108 công thức chỉ cần khối kết quả chung của WF-03. Vài công thức có màn
 * riêng trong wireframe: WF-08 bóc tách phí & thuế, WF-14 lịch trả nợ 240 kỳ.
 *
 * Vì sao KHÔNG tách thành route riêng như `/phi-thue/`:
 * giữ một lược đồ URL `/cong-thuc/<id>/` cho cả 108 công thức thì sitemap, `formulaPath()`
 * và mọi link nội bộ không phải xử lý ngoại lệ (FR-25). Ở đây chỉ là thân màn khác nhau.
 *
 * `next/dynamic` để hai khối này chỉ tải khi đúng công thức đó được mở, chứ không nằm trong
 * gói chung của cả 21 trang chi tiết.
 */

const FeeTaxBody = dynamic(async () => (await import('./FeeTaxBody')).FeeTaxBody);
const LoanScheduleBody = dynamic(async () => (await import('./LoanScheduleBody')).LoanScheduleBody);
const XirrBody = dynamic(async () => (await import('./XirrBody')).XirrBody);

/** id công thức có thân riêng. Công thức không nằm trong đây dùng khối kết quả chung. */
const CUSTOM_BODIES = ['loi-nhuan-rong', 'lich-tra-no', 'xirr'] as const;

/**
 * id công thức có khối cấu hình riêng ĐẶT TRÊN ô nhập.
 *
 * Tách khỏi `CUSTOM_BODIES` vì hai khối nằm ở hai chỗ khác nhau trên màn, và một công thức có
 * thể cần khối này mà không cần khối kia. Nhờ cặp `hasConfigBlock` + `DetailConfig`, màn chi
 * tiết vẫn không biết công thức nào cần gì — nó chỉ hỏi theo id, đúng như với `DetailBody`.
 */
const CONFIG_BLOCKS = ['loi-nhuan-rong'] as const;

/**
 * id công thức mà THÂN RIÊNG đã bày ra chính kết quả của công thức — khối kết quả chung sẽ là
 * bản sao thứ hai của đúng con số ấy.
 *
 * Chỉ WF-08: `netProfit` trong bảng bóc tách chính là kết quả của `loi-nhuan-rong`, nên trước
 * đợt 10 màn hiện 4.618.150 ₫ hai lần cách nhau một khối.
 *
 * WF-14 KHÔNG thuộc nhóm này: kết quả công thức là tổng lãi cả kỳ hạn (989.691.880 ₫) còn thẻ
 * đầu thân riêng là khoản trả hằng tháng (7.457.050 ₫) — hai con số khác nhau, đều đáng hiện.
 *
 * Cảnh báo vẫn đi đường cũ: thân riêng dựng `InlineWarning`, vốn nêu đủ nhãn lỗi, nguyên nhân
 * và câu gợi ý sửa như `ErrorState` — bỏ khối chung không làm mất thông tin lỗi nào (FR-06).
 *
 * `xirr` cũng thuộc nhóm này nhưng vì lý do khác: khối chung không đọc được bảng dòng tiền
 * (`ctx.cashflows` không phải một biến của `spec.variables`), nên nó luôn hiện đúng con số —
 * không phải nguy cơ hiện HAI con số như WF-08, mà là khối chung sẽ hiện đúng nhưng KHÔNG cho
 * sửa được bảng dòng tiền ngay tại đó.
 */
const OWN_RESULT = ['loi-nhuan-rong', 'xirr'] as const;

export function hasCustomBody(id: string): boolean {
  return (CUSTOM_BODIES as ReadonlyArray<string>).includes(id);
}

export function hasConfigBlock(id: string): boolean {
  return (CONFIG_BLOCKS as ReadonlyArray<string>).includes(id);
}

export function ownsResult(id: string): boolean {
  return (OWN_RESULT as ReadonlyArray<string>).includes(id);
}

export interface DetailBodyProps {
  id: string;
  inputs: Readonly<Record<string, number>>;
  ctx: CalcContext;
  /**
   * Kết quả đã tính ở `FormulaDetail` — `XirrBody` bày thẳng thay vì tính lại, vì `ctx` truyền
   * xuống đây với `cashflowRows` hiện tại đã đủ để `FormulaDetail` ra đúng con số rồi; tính lại
   * là hai chỗ cùng tính một phép, đúng loại lỗi "hai chỗ nói hai chuyện" dự án đã né chỗ khác.
   */
  output?: CalcOutput;
  /**
   * Bảng dòng tiền của XIRR — sống ở `FormulaDetail` (cùng lý do `bars` sống ở đó), thân riêng
   * chỉ đọc và báo thay đổi qua `onCashflowRowsChange`. Công thức khác bỏ qua ba props này.
   */
  cashflowRows?: ReadonlyArray<CashflowRow>;
  onCashflowRowsChange?: (rows: ReadonlyArray<CashflowRow>) => void;
}

export function DetailBody({
  id,
  inputs,
  ctx,
  output,
  cashflowRows,
  onCashflowRowsChange,
}: DetailBodyProps) {
  if (id === 'loi-nhuan-rong') return <FeeTaxBody inputs={inputs} ctx={ctx} />;
  if (id === 'lich-tra-no') return <LoanScheduleBody inputs={inputs} />;
  if (
    id === 'xirr' &&
    output !== undefined &&
    cashflowRows !== undefined &&
    onCashflowRowsChange !== undefined
  ) {
    return <XirrBody output={output} rows={cashflowRows} onRowsChange={onCashflowRowsChange} />;
  }
  return null;
}

/**
 * Khối cấu hình đặt trên ô nhập. Công thức không có thì không dựng gì.
 *
 * Không nạp trễ như hai khối kết quả: ô chọn biểu phí chỉ là một `Select` trên
 * `MARKET_CONFIG.schedules`, mà cấu hình ấy đã nằm sẵn trong gói vì màn chi tiết nào cũng gọi
 * `scheduleOrDefault()`. Nạp trễ ở đây không tiết kiệm được gì, đổi lại ô nhập nháy một nhịp
 * mới hiện — và làm khối này không kiểm được bằng một phép render đồng bộ.
 */
export function DetailConfig({ id }: { id: string }) {
  if (id === 'loi-nhuan-rong') return <FeeScheduleField />;
  return null;
}
