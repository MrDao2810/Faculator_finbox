/**
 * Tầng DOMAIN — chạy MỘT CHUỖI công thức nối nhau (gói WBS 5.2.3, vế còn lại của FR-15).
 *
 * `runFormula()` chạy một công thức đứng riêng. File này chạy cả một nhánh của đồ thị phụ thuộc:
 * sắp thứ tự theo `dependsOn`, đổ kết quả bước trước vào ô nhập bước sau, và khi một bước lỗi thì
 * mọi bước dưới nó **kế thừa cảnh báo** chứ không âm thầm cho ra số.
 *
 * Cho tới đợt này FR-15 mới chỉ có hạ tầng: `dependsOn` khai ở hai chỗ, `inherited()` không công
 * thức nào gọi, `ctx.upstream` không ai đọc và cũng **không ai ghi**. Đây là chỗ ghi nó.
 *
 * ── Vì sao KHÔNG sửa `runFormula()` mà bọc thêm một lớp ─────────────────────────────────────
 *
 * `runFormula()` chặn ô thiếu bằng `INCOMPLETE_INPUT` TRƯỚC khi gọi hàm tính (xem `run.ts`).
 * Nếu chuỗi cứ để ô móc nối trống rồi gọi thẳng vào đó, người dùng sẽ nhận "Còn thiếu: Suất sinh
 * lợi yêu cầu (r)" cho một ô họ **không hề bỏ trống** — sai nguyên nhân, và ngược đúng lời hứa
 * của WF-15. Nên mạch bị cắt ở ĐÂY: thượng nguồn lỗi thì trả `inherited()` ngay, không gọi
 * `runFormula()` lượt đó. Đổi lại, cổng chung của cả 108 công thức không phải sửa một dòng nào.
 *
 * ── Hai loại cảnh báo, cố ý khác nhau ───────────────────────────────────────────────────────
 *
 * · **Ô nhập** giữ nguyên mã lỗi GỐC của thượng nguồn (`resolveLinked()` lo) — nó trả lời câu
 *   "vì sao ô này chưa có số", mà nguyên nhân thật là chia cho 0 ở CAPM chứ không phải "kế thừa".
 * · **Kết quả bước dưới** dùng mã `INHERITED` (`inherited()` lo) — nó trả lời câu "vì sao bước
 *   này chưa ra số", và câu trả lời đúng là "vì bước trước đang lỗi".
 *
 * Hai câu bổ sung nhau chứ không mâu thuẫn; màn hình hiện cả hai.
 *
 * ── Một ô có thể có NHIỀU nguồn ─────────────────────────────────────────────────────────────
 *
 * Giá trị nội tại đến từ mô hình Gordon HOẶC từ chiết khấu FCFF — hai cạnh cùng đổ vào một biến.
 * Luật: ô lấy nguồn **cấp được số** đầu tiên theo thứ tự khai trong `dependsOn`; chỉ khi **mọi**
 * nguồn của ô đó đều hỏng thì bước mới kế thừa lỗi.
 *
 * Bản đầu của hàm này duyệt theo CẠNH nên sai hai chỗ cùng lúc: chặn ngay ở cạnh hỏng đầu tiên dù
 * nguồn kia đang có số dùng được, và để cạnh sau ghi đè giá trị của cạnh trước mà không ai hay.
 * Registry hôm nay chưa có ô nào hai nguồn, nên lỗi ấy chưa bao giờ chạy — nhưng nó nằm đúng trên
 * đường đi của bước kế tiếp, và ca kiểm dựng bằng fixture đã khoá lại cả hai chiều.
 *
 * ── Không kẹp giá trị thượng nguồn vào miền của ô nhận ──────────────────────────────────────
 *
 * CAPM có thể ra 35% trong khi thanh trượt "Suất sinh lợi yêu cầu" khai `max: 30`. Kẹp xuống 30
 * là **âm thầm tính sai** — con số hiện ra không còn là kết quả của chuỗi nữa. `runFormula()`
 * cũng không kẹp gì; giữ đúng một luật cho cả hai. Có ca kiểm chốt lựa chọn này để nó là quyết
 * định chứ không phải sơ suất.
 */

import { inherited } from '../calc-output';
import { buildFlowChain } from '../flow-chain';
import type { LinkedResult, LinkedUpstream } from '../linked-input';
import { resolveLinked } from '../linked-input';
import type { FormulaDependency, FormulaSpec } from '../registry/types';
import type { Bilingual, CalcOutput, VariableSpec } from '../types';
import { runFormula } from './run';
import type { CalcContext, CalcInputs, FormulaModule } from './types';

/** Giá trị của từng công thức trong chuỗi, khoá ngoài là `formulaId`. */
export type ChainInputs = Readonly<Record<string, CalcInputs>>;

/**
 * Giá trị người dùng ghi đè lên ô móc nối, khoá ngoài là `formulaId`.
 * Không có mục nào nghĩa là ô đó vẫn đang nhận tự động.
 */
export type ChainOverrides = Readonly<Record<string, Readonly<Record<string, number>>>>;

/** Một ô móc nối của một bước — đủ để giao diện dựng `LinkedInput` mà không phải tự suy lại. */
export interface ChainField {
  /** Biến tại bước này đang nhận giá trị. */
  spec: VariableSpec;
  upstream: LinkedUpstream;
  /** Giá trị người dùng đã ghi đè, `undefined` nghĩa là chưa ghi đè. */
  override?: number;
  /** Bốn trạng thái của ô, do `resolveLinked()` quyết. */
  linked: LinkedResult;
}

/** Một bước của chuỗi, đã tính xong. */
export interface ChainStep {
  formulaId: string;
  /** Tên công thức — dùng cho dải luồng và câu cảnh báo. */
  label: Bilingual;
  /** Bậc trong luồng: 0 là bước không phụ thuộc ai. */
  depth: number;
  /** Các bước đứng ngay trước bước này (chỉ tính bước có mặt trong chuỗi). */
  dependsOn: ReadonlyArray<string>;
  output: CalcOutput;
  /** Các ô móc nối của bước này. Bước không nhận gì từ ai thì mảng rỗng. */
  fields: ReadonlyArray<ChainField>;
}

export interface ChainResult {
  /** Các bước theo đúng thứ tự tính. */
  steps: ReadonlyArray<ChainStep>;
  /** Tra nhanh theo id. */
  byId: ReadonlyMap<string, ChainStep>;
  /**
   * Công thức nằm trong vòng phụ thuộc nên không tính được.
   * Rỗng là bình thường; không rỗng nghĩa là Registry khai sai — phần lành vẫn có kết quả.
   */
  cyclic: ReadonlyArray<string>;
}

export interface ChainArgs {
  /** Các công thức tạo nên chuỗi. Cạnh trỏ ra ngoài danh sách này bị bỏ qua. */
  modules: ReadonlyArray<FormulaModule>;
  inputs: ChainInputs;
  overrides?: ChainOverrides;
  ctx: CalcContext;
}

/**
 * Tính cả chuỗi.
 *
 * Thứ tự suy từ `dependsOn` bằng `buildFlowChain()` — cùng hàm mà dải luồng WF-04 dùng để vẽ,
 * nên thứ tự TÍNH và thứ tự BÀY RA không thể lệch nhau.
 */
export function runChain(args: ChainArgs): ChainResult {
  const { modules, inputs, overrides = {}, ctx } = args;

  // Tên biến tránh `module`: ESLint của Next chặn gán vào định danh đó (no-assign-module-variable).
  const modulesById = new Map(modules.map((formula) => [formula.spec.id, formula]));
  const chain = buildFlowChain(modules.map((formula) => formula.spec));

  const steps: ChainStep[] = [];
  const byId = new Map<string, ChainStep>();

  for (const flowStep of chain.steps) {
    const formula = modulesById.get(flowStep.formulaId);
    if (formula === undefined) continue;

    const { spec } = formula;
    const ownInputs = inputs[spec.id] ?? {};
    const ownOverrides = overrides[spec.id] ?? {};

    const fields: ChainField[] = [];
    const upstreamOutputs: Record<string, CalcOutput> = {};
    const resolved: Record<string, number> = {};

    /** Ô nhận đầu tiên không có nguồn nào cấp được số. */
    let blockedBy: { label: Bilingual; variable: VariableSpec } | undefined;

    for (const [variableKey, dependencies] of groupByVariable(spec.dependsOn ?? [])) {
      const variable = variableOf(spec, variableKey);
      if (variable === undefined) continue;

      const override = ownOverrides[variableKey];

      /** Nguồn đầu tiên cấp được số, và nguồn đầu tiên đang lỗi — để biết bày cái nào ra ô. */
      let usable: ChainField | undefined;
      let broken: ChainField | undefined;

      for (const dependency of dependencies) {
        const upstreamStep = byId.get(dependency.formulaId);
        if (upstreamStep === undefined) continue;

        upstreamOutputs[dependency.formulaId] = upstreamStep.output;

        const upstream: LinkedUpstream = {
          formulaId: dependency.formulaId,
          label: upstreamStep.label,
          output: upstreamStep.output,
        };
        const linkedArgs = {
          spec: variable,
          upstream,
          ...(override === undefined ? {} : { override }),
        };
        const field: ChainField = {
          spec: variable,
          upstream,
          ...(override === undefined ? {} : { override }),
          linked: resolveLinked(linkedArgs),
        };

        if (field.linked.value === null) broken ??= field;
        else usable ??= field;
      }

      // Ô lấy nguồn CẤP ĐƯỢC SỐ nếu có; mọi nguồn hỏng thì mới bày cái hỏng đầu tiên ra.
      const winner = usable ?? broken;
      if (winner === undefined) continue;

      fields.push(winner);

      if (winner.linked.value === null) {
        blockedBy ??= { label: winner.upstream.label, variable };
      } else {
        resolved[variableKey] = winner.linked.value;
      }
    }

    const output =
      blockedBy === undefined
        ? runFormula(
            formula,
            { ...ownInputs, ...resolved },
            Object.keys(upstreamOutputs).length === 0 ? ctx : { ...ctx, upstream: upstreamOutputs },
          )
        : inherited(spec.resultUnit, blockedBy.label, blockedBy.variable.label);

    const step: ChainStep = {
      formulaId: spec.id,
      label: flowStep.label,
      depth: flowStep.depth,
      dependsOn: flowStep.dependsOn,
      output,
      fields,
    };

    steps.push(step);
    byId.set(spec.id, step);
  }

  return { steps, byId, cyclic: chain.cyclic };
}

/**
 * Các công thức thuộc cùng một nhánh với `formulaId` — tổ tiên và hậu duệ của nó.
 *
 * Dùng để biết màn chi tiết của một công thức phải bày ra chuỗi nào. Lấy TỔ TIÊN + HẬU DUỆ chứ
 * không lấy cả thành phần liên thông: hai công thức chỉ chung một tổ tiên (WACC và Gordon cùng
 * nhận từ CAPM) là hai nhánh song song, gộp vào một dải sẽ vẽ mũi tên nói sai quan hệ.
 *
 * Trả về mảng rỗng nếu công thức không dính cạnh nào — nơi gọi hiểu là "không có chuỗi để bày".
 */
export function chainFor(
  specs: ReadonlyArray<FormulaSpec>,
  formulaId: string,
): ReadonlyArray<FormulaSpec> {
  const byId = new Map(specs.map((spec) => [spec.id, spec]));
  if (!byId.has(formulaId)) return [];

  const parentsOf = (id: string): ReadonlyArray<string> =>
    (byId.get(id)?.dependsOn ?? []).map((d) => d.formulaId).filter((parent) => byId.has(parent));

  const childrenOf = (id: string): ReadonlyArray<string> =>
    specs
      .filter((spec) => (spec.dependsOn ?? []).some((d) => d.formulaId === id))
      .map((spec) => spec.id);

  const picked = new Set<string>([formulaId]);
  walk(formulaId, parentsOf, picked);
  walk(formulaId, childrenOf, picked);

  if (picked.size < 2) return [];

  // Giữ đúng thứ tự của `specs` để `buildFlowChain()` xếp tất định (NFR-REL-03).
  return specs.filter((spec) => picked.has(spec.id));
}

/** Duyệt theo một chiều, dừng ở nút đã gặp nên đồ thị có vòng cũng không lặp vô hạn. */
function walk(
  from: string,
  nextOf: (id: string) => ReadonlyArray<string>,
  seen: Set<string>,
): void {
  for (const next of nextOf(from)) {
    if (seen.has(next)) continue;
    seen.add(next);
    walk(next, nextOf, seen);
  }
}

function variableOf(spec: FormulaSpec, key: string): VariableSpec | undefined {
  return spec.variables.find((variable) => variable.key === key);
}

/**
 * Gom cạnh theo BIẾN NHẬN, không theo cạnh.
 *
 * Một biến có thể có nhiều nguồn — giá trị nội tại đến từ mô hình Gordon HOẶC từ chiết khấu FCFF.
 * Duyệt theo cạnh thì hai chuyện hỏng cùng lúc: bước bị chặn ngay ở cạnh hỏng ĐẦU TIÊN dù nguồn
 * kia đang có số dùng được, và `resolved[key]` để cạnh sau ghi đè cạnh trước không ai hay.
 *
 * `Map` giữ thứ tự chèn nên thứ tự ưu tiên chính là thứ tự khai trong `dependsOn` — tất định
 * (NFR-REL-03), và người biên soạn Registry đọc từ trên xuống là biết nguồn nào được ưu tiên.
 */
function groupByVariable(
  dependencies: ReadonlyArray<FormulaDependency>,
): ReadonlyMap<string, ReadonlyArray<FormulaDependency>> {
  const grouped = new Map<string, FormulaDependency[]>();

  for (const dependency of dependencies) {
    const existing = grouped.get(dependency.variableKey);
    if (existing === undefined) grouped.set(dependency.variableKey, [dependency]);
    else existing.push(dependency);
  }

  return grouped;
}
