/**
 * Tầng DOMAIN — tiện ích dùng chung cho mọi nhóm công thức.
 *
 * Chỗ này giữ ba thứ lặp lại ở cả 21 công thức, để mỗi file nhóm chỉ còn phần toán:
 * tra hằng số thị trường, các trích dẫn nguồn hay dùng, và khuôn dựng `VariableSpec`.
 */

import { fail } from '../calc-output';
import type { MarketConstantKey, TypedMarketConstant } from '../market/types';
import { resolveConstant, resolveRate } from '../market/resolve';
import type { FormulaSource, FormulaSpec } from '../registry/types';
import type { Bilingual, CalcOutput, Level, VariableSpec } from '../types';
import { meaningless } from '../warnings';
import type { CalcContext } from '../calc/types';

/*
 * ── Tra hằng số thuế & phí ─────────────────────────────────────────────────────────────
 * LDR-03 · CON-10: công thức KHÔNG được viết thẳng mức phí vào thân hàm. Luật đổi thì thêm
 * một bản ghi mới trong MarketConfig, không phải đi sửa từng công thức.
 */

/** Cảnh báo dùng chung khi chưa chọn được biểu phí hoặc biểu phí thiếu khoản mục. */
export function missingConstant(unit: string, what: Bilingual): CalcOutput {
  return fail(
    unit,
    meaningless(
      {
        vi: `Biểu phí đang chọn không có mức ${what.vi} áp dụng tại ngày tra cứu.`,
        en: `The selected fee schedule has no ${what.en} rate in effect on the lookup date.`,
      },
      {
        vi: 'Chọn biểu phí khác ở màn Cài đặt, hoặc kiểm tra lại ngày áp dụng.',
        en: 'Choose a different fee schedule in Settings, or check the effective date.',
      },
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

/**
 * Những hằng số mà một công thức tra, đã giải theo `asOf` — để màn chi tiết bày nhãn, trị số,
 * đơn vị và ngày hiệu lực ngay cạnh ô nhập.
 *
 * Đặt ở đây chứ không ở `market/resolve.ts` vì nó cần cả `FormulaSpec` lẫn `CalcContext`: để bên
 * market thì tầng market phải với ngược lên registry, mà registry vừa trỏ xuống market để lấy
 * `MarketConstantKey` — thành vòng, dù chỉ là vòng kiểu.
 *
 * Khoá đã khai mà biểu phí đang chọn không có bản nào hiệu lực tại `asOf` thì BỎ QUA thay vì
 * dựng một dòng trống. Đúng lúc đó công thức cũng đã hỏng bằng `missingConstant()`, và khối
 * Kết quả mới là chỗ nói chuyện thiếu hằng số — hai chỗ cùng kêu một lỗi là nhiễu.
 */
export function constantsUsedBy(
  spec: Pick<FormulaSpec, 'usesConstants'>,
  ctx: CalcContext,
): ReadonlyArray<TypedMarketConstant> {
  const dung: TypedMarketConstant[] = [];
  for (const khoa of spec.usesConstants ?? []) {
    const ban = constantOf(ctx, khoa);
    if (ban !== undefined) dung.push(ban);
  }
  return dung;
}

/**
 * Giá trị SỐ HỌC của từng hằng số một công thức tra, theo biểu phí và ngày của `ctx` — thứ dải
 * thay số của màn tính đặt vào chỗ `{fee.brokerage.buy}` của mẫu (13/10/2026).
 *
 * "Số học" nghĩa là đúng con số `calc` đem nhân: hằng số phần trăm ra TỶ SỐ (0,15% → 0,0015, qua
 * chính `rateOf`), còn lại giữ nguyên trị số (0,27 ₫/CP/tháng, 100.000 ₫/điểm). Hai đường ấy cũng
 * là hai đường duy nhất `calc` tra hằng số — `rateOf()` và `constantOf().value` — nên ở đây không
 * có phép đổi đơn vị thứ ba nào để lệch.
 *
 * Vì sao là tỷ số chứ không phải "0,15%": hình công thức viết `r_{mua}` như một tỷ lệ (quy ước của
 * cả thư viện — tỷ lệ gõ bằng % thì vào hình ở dạng tỷ số, không kèm `÷ 100`), và 21 mẫu có sẵn đã
 * đặt mọi tỷ lệ người dùng gõ theo đúng kiểu ấy (`r = {rate} ÷ 100` → 0,06). Hai kiểu trong cùng
 * một dải là thứ khó đọc hơn cả.
 *
 * Khoá không tra được thì VẮNG khỏi bảng chứ không mang số 0 (FR-06): `datSoThaySo` thấy thiếu là
 * bỏ hẳn dải, và đúng lúc ấy `calc` cũng đã hỏng bằng `missingConstant()`.
 *
 * Cửa gác ở `formulas.test.ts` đổi mọi mức của biểu phí rồi đòi dải tính lại ra đúng số `calc` trả
 * về, nên một hằng số đi sai đường ở đây sẽ đỏ ngay — không dựa vào việc ai đó nhớ.
 */
export function substitutionConstants(
  spec: Pick<FormulaSpec, 'usesConstants'>,
  ctx: CalcContext,
): Readonly<Record<string, number>> {
  const giaTri: Record<string, number> = {};
  for (const khoa of spec.usesConstants ?? []) {
    const ban = constantOf(ctx, khoa);
    if (ban === undefined) continue;
    giaTri[khoa] = rateOf(ctx, khoa) ?? ban.value;
  }
  return giaTri;
}

/*
 * ── Nguồn tham khảo hay lặp (FR-04) ────────────────────────────────────────────────────
 */

export const SOURCE_CFA: FormulaSource = {
  label: {
    vi: 'Giáo trình phân tích đầu tư (CFA Institute)',
    en: 'Investment Analysis curriculum (CFA Institute)',
  },
};

export const SOURCE_VAS: FormulaSource = {
  label: {
    vi: 'Chuẩn mực kế toán Việt Nam (VAS)',
    en: 'Vietnamese Accounting Standards (VAS)',
  },
};

export const SOURCE_PIT_LAW: FormulaSource = {
  label: {
    vi: 'Luật Thuế thu nhập cá nhân 109/2025/QH15',
    en: 'Personal Income Tax Law 109/2025/QH15',
  },
};

/*
 * Sửa ở đợt 9: nhãn này còn trích Thông tư 128/2018/TT-BTC — văn bản đã bị Thông tư
 * 102/2021/TT-BTC thay từ 01/01/2022. Vòng đối chiếu 5.1.1 (Q1) đã sửa `legalBasis` của hai
 * hằng số phí môi giới trong `market/schedules.ts` nhưng bỏ sót nhãn dùng chung ở đây, nên khối
 * Nguồn của 5 trang công thức phí chỉ người dùng tới văn bản hết hiệu lực — trong khi con số
 * ngay trên màn tính từ hằng số mang căn cứ 102/2021. Một ca kiểm trong `market.test.ts` nay
 * giữ hai bên trích cùng một thông tư.
 */
export const SOURCE_FEE_CIRCULAR: FormulaSource = {
  label: {
    vi: 'Thông tư 102/2021/TT-BTC về giá dịch vụ trong lĩnh vực chứng khoán',
    en: 'Circular 102/2021/TT-BTC on securities service pricing',
  },
};

export const SOURCE_VSD: FormulaSource = {
  label: {
    vi: 'Biểu phí dịch vụ của Tổng công ty Lưu ký và Bù trừ chứng khoán Việt Nam (VSDC)',
    en: 'Service fee schedule of the Vietnam Securities Depository and Clearing Corporation (VSDC)',
  },
};

export const SOURCE_CORPORATE_FINANCE: FormulaSource = {
  label: {
    vi: 'Brealey, Myers & Allen — Principles of Corporate Finance',
    en: 'Brealey, Myers & Allen — Principles of Corporate Finance',
  },
};

/*
 * ── Khuôn dựng biến ────────────────────────────────────────────────────────────────────
 */

export interface NumberVarOptions {
  min?: number;
  max?: number;
  level?: Level;
  description?: Bilingual;
}

/** Ô nhập số thông thường. */
export function numberVar(
  key: string,
  label: Bilingual,
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
  label: Bilingual,
  unit: string,
  defaultValue: number,
  min: number,
  max: number,
  step: number,
  options: { level?: Level; description?: Bilingual } = {},
): VariableSpec {
  const { level = 'basic', description } = options;
  return { key, label, unit, type: 'slider', defaultValue, min, max, step, level, description };
}

/**
 * Ô dùng chung, mang thêm KÝ HIỆU của hình ở cuối nhãn: 'Khối lượng' thành 'Khối lượng (Q)'.
 *
 * Chủ dự án, 19/10/2026: ký hiệu trong hình công thức phải hiện cả ở ô nhập, như 'Giá trị nội tại ước
 * tính (V)' của Biên an toàn. Ký hiệu viết liền như trong hình (`P_{mua}` thành 'Pmua'), cùng kiểu
 * '(D0)', '(g1)' đã có. Biến khai chung giữ nhãn trơn vì cùng một ô có thể mang ký hiệu ở hình này mà
 * không ở hình kia: 'Thời gian nắm giữ' là M ở Phí lưu ký, nhưng ở Giá hoà vốn nó chỉ đi vào F_lk.
 * Mỗi công thức tự gọi hàm này cho đúng ô hình của nó vẽ thành ký hiệu.
 */
export function withSymbol(variable: VariableSpec, symbol: string): VariableSpec {
  return { ...variable, label: labelWithSymbol(variable.label, symbol) };
}

/**
 * Như `withSymbol`, cho một NHÃN dùng chung truyền thẳng vào `sliderVar`. Hằng nhãn gốc giữ trơn vì
 * nó còn đi vào câu cảnh báo ("Số phiên phải từ 1 trở lên"), nơi ký hiệu chỉ làm câu rối thêm.
 */
export function labelWithSymbol(label: Bilingual, symbol: string): Bilingual {
  return { vi: `${label.vi} (${symbol})`, en: `${label.en} (${symbol})` };
}
