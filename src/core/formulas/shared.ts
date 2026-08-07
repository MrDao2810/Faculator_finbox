/**
 * Tầng DOMAIN — tiện ích dùng chung cho mọi nhóm công thức.
 *
 * Chỗ này giữ ba thứ lặp lại ở cả 21 công thức, để mỗi file nhóm chỉ còn phần toán:
 * tra hằng số thị trường, các trích dẫn nguồn hay dùng, và khuôn dựng `VariableSpec`.
 */

import { fail } from '../calc-output';
import type { MarketConstantKey, TypedMarketConstant } from '../market/types';
import { resolveConstant, resolveRate } from '../market/resolve';
import type { FormulaSource } from '../registry/types';
import type { CalcOutput, Level, VariableSpec } from '../types';
import { meaningless } from '../warnings';
import type { CalcContext } from '../calc/types';

/*
 * ── Tra hằng số thuế & phí ─────────────────────────────────────────────────────────────
 * LDR-03 · CON-10: công thức KHÔNG được viết thẳng mức phí vào thân hàm. Luật đổi thì thêm
 * một bản ghi mới trong MarketConfig, không phải đi sửa từng công thức.
 */

/** Cảnh báo dùng chung khi chưa chọn được biểu phí hoặc biểu phí thiếu khoản mục. */
export function missingConstant(unit: string, what: string): CalcOutput {
  return fail(
    unit,
    meaningless(
      `Biểu phí đang chọn không có mức ${what} áp dụng tại ngày tra cứu.`,
      'Chọn biểu phí khác ở màn Cài đặt, hoặc kiểm tra lại ngày áp dụng.',
    ),
  );
}

/** Hệ số nhân của một hằng số phần trăm (0,15% → 0,0015). Không tra được thì trả null. */
export function rateOf(ctx: CalcContext, key: MarketConstantKey): number | null {
  if (ctx.schedule === undefined) return null;
  return resolveRate(ctx.schedule, key, ctx.asOf);
}

/** Bản ghi hằng số đầy đủ — cần khi phải hiện cả nhãn và đơn vị trong bảng bóc tách WF-08. */
export function constantOf(
  ctx: CalcContext,
  key: MarketConstantKey,
): TypedMarketConstant | undefined {
  if (ctx.schedule === undefined) return undefined;
  return resolveConstant(ctx.schedule, key, ctx.asOf);
}

/*
 * ── Nguồn tham khảo hay lặp (FR-04) ────────────────────────────────────────────────────
 */

export const SOURCE_CFA: FormulaSource = {
  label: 'Giáo trình phân tích đầu tư (CFA Institute)',
};

export const SOURCE_VAS: FormulaSource = {
  label: 'Chuẩn mực kế toán Việt Nam (VAS)',
};

export const SOURCE_PIT_LAW: FormulaSource = {
  label: 'Luật Thuế thu nhập cá nhân 109/2025/QH15',
};

export const SOURCE_FEE_CIRCULAR: FormulaSource = {
  label: 'Thông tư 128/2018/TT-BTC về giá dịch vụ trong lĩnh vực chứng khoán',
};

export const SOURCE_VSD: FormulaSource = {
  label: 'Biểu phí dịch vụ của Tổng công ty Lưu ký và Bù trừ chứng khoán Việt Nam (VSDC)',
};

export const SOURCE_CORPORATE_FINANCE: FormulaSource = {
  label: 'Brealey, Myers & Allen — Principles of Corporate Finance',
};

/*
 * ── Khuôn dựng biến ────────────────────────────────────────────────────────────────────
 */

export interface NumberVarOptions {
  min?: number;
  max?: number;
  level?: Level;
  description?: string;
}

/** Ô nhập số thông thường. */
export function numberVar(
  key: string,
  label: string,
  unit: string,
  defaultValue: number,
  options: NumberVarOptions = {},
): VariableSpec {
  const { level = 'basic', ...rest } = options;
  return { key, label, unit, type: 'number', defaultValue, level, ...rest };
}

/** Thanh trượt. Validator bắt buộc đủ min, max và step nên ba tham số này không tuỳ chọn. */
export function sliderVar(
  key: string,
  label: string,
  unit: string,
  defaultValue: number,
  min: number,
  max: number,
  step: number,
  options: { level?: Level; description?: string } = {},
): VariableSpec {
  const { level = 'basic', description } = options;
  return { key, label, unit, type: 'slider', defaultValue, min, max, step, level, description };
}
