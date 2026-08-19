/**
 * Tầng DOMAIN — chạy chính các ca kiểm thử khai trong `FormulaSpec.tests` (NFR-MNT-02).
 *
 * Trường `tests` đã có trong schema từ gói 1.3.1 và validator bắt buộc mỗi công thức có ít nhất
 * một ca — nhưng **chưa có gì chạy chúng**, nên tới giờ đó mới chỉ là metadata nằm im. File này
 * làm cho nó chạy thật: một bài test Vitest duyệt toàn bộ Registry và gọi hàm dưới đây, nên
 * thêm công thức mới là ca kiểm thử của nó tự động được chạy, không phải đăng ký ở đâu nữa.
 *
 * Không ném lỗi: trả danh sách ca hỏng để bài test in ra một lượt, giống cách `validateRegistry()`
 * trả `RegistryIssue[]`.
 */

import type { FormulaTestCase } from '../registry/types';
import { runFormula } from './run';
import type { CalcContext, FormulaModule } from './types';

/** Sai số mặc định khi so kết quả — NFR-MNT-03. */
export const DEFAULT_TOLERANCE = 0.01;

export interface SpecTestFailure {
  formulaId: string;
  testName: string;
  /** Câu tiếng Việt nêu rõ mong đợi gì và nhận được gì. */
  reason: string;
}

/** Chạy mọi ca kiểm thử của một công thức. Mảng rỗng nghĩa là đạt hết. */
export function runSpecTests(formula: FormulaModule, ctx: CalcContext): SpecTestFailure[] {
  const failures: SpecTestFailure[] = [];

  for (const testCase of formula.spec.tests) {
    const reason = checkCase(formula, testCase, ctx);
    if (reason !== null) {
      failures.push({ formulaId: formula.spec.id, testName: testCase.name, reason });
    }
  }

  return failures;
}

/** Chạy ca kiểm thử của cả một danh sách công thức. */
export function runAllSpecTests(
  formulas: ReadonlyArray<FormulaModule>,
  ctx: CalcContext,
): SpecTestFailure[] {
  return formulas.flatMap((formula) => runSpecTests(formula, ctx));
}

/** Gộp danh sách ca hỏng thành một khối chữ đọc được trong log CI. */
export function formatFailures(failures: ReadonlyArray<SpecTestFailure>): string {
  return failures.map((f) => `${f.formulaId} · ${f.testName} — ${f.reason}`).join('\n');
}

function checkCase(
  formula: FormulaModule,
  testCase: FormulaTestCase,
  ctx: CalcContext,
): string | null {
  // Ca nào khai chuỗi giá riêng thì bơm vào ctx của đúng ca đó — công thức chuỗi (FR-12)
  // không kiểm được bằng ctx chung vốn không có chuỗi nào.
  const caseCtx: CalcContext =
    testCase.series === undefined &&
    testCase.bars === undefined &&
    testCase.marketSeries === undefined &&
    testCase.cashflows === undefined
      ? ctx
      : {
          ...ctx,
          series: testCase.series ?? ctx.series,
          bars: testCase.bars ?? ctx.bars,
          marketSeries: testCase.marketSeries ?? ctx.marketSeries,
          cashflows: testCase.cashflows ?? ctx.cashflows,
        };

  const out = runFormula(formula, testCase.inputs, caseCtx);

  // expected === null nghĩa là ca này PHẢI ra cảnh báo chứ không ra số (FR-06).
  if (testCase.expected === null) {
    if (out.value !== null) {
      return `mong đợi không tính được nhưng lại ra ${out.value}`;
    }
    if (out.warning === undefined) {
      return 'không tính được nhưng thiếu cảnh báo giải thích';
    }
    if (testCase.expectedWarning !== undefined && out.warning.code !== testCase.expectedWarning) {
      return `mong đợi cảnh báo ${testCase.expectedWarning} nhưng nhận ${out.warning.code}`;
    }
    return null;
  }

  if (out.value === null) {
    const why = out.warning?.message ?? 'không rõ lý do';
    return `mong đợi ${testCase.expected} nhưng không tính được — ${why}`;
  }

  const tolerance = testCase.tolerance ?? DEFAULT_TOLERANCE;
  const gap = Math.abs(out.value - testCase.expected);
  if (gap > tolerance) {
    return `mong đợi ${testCase.expected} (±${tolerance}) nhưng nhận ${out.value}`;
  }

  return null;
}
