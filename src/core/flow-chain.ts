/**
 * Tầng DOMAIN — sắp thứ tự dải luồng móc nối (gói WBS 2.4.6).
 *
 * WF-04 chốt dải: Beta → CAPM·Re → WACC → FCFF·PV → EV → Giá mục tiêu → Biên AT.
 * Thứ tự đó KHÔNG viết cứng ở đây: nó suy ra từ `dependsOn` của từng FormulaSpec, nên thêm
 * một bước vào giữa luồng chỉ là khai thêm một cạnh, không phải sửa component (NFR-MNT-01).
 *
 * Gói 5.3.1 (đồ thị phụ thuộc, FR-15) dùng lại đúng hàm này để biết tính công thức nào trước.
 */

import type { FormulaSpec } from './registry/types';
import type { Bilingual } from './types';

export interface FlowStep {
  formulaId: string;
  /** Nhãn hiện trên dải, lấy tên công thức. */
  label: Bilingual;
  /** Các bước đứng ngay trước bước này. */
  dependsOn: ReadonlyArray<string>;
  /** Bậc trong luồng: 0 là bước không phụ thuộc ai. Dùng để vẽ cột ở bản dọc desktop. */
  depth: number;
}

export interface FlowChain {
  steps: ReadonlyArray<FlowStep>;
  /**
   * Các công thức nằm trong một vòng phụ thuộc, không sắp thứ tự được.
   * Rỗng là bình thường. Không rỗng nghĩa là Registry khai sai — nhưng dải vẫn vẽ được
   * phần lành, không làm trắng cả màn.
   */
  cyclic: ReadonlyArray<string>;
}

/**
 * Sắp topo các công thức theo cạnh `dependsOn`.
 *
 * Dùng thuật toán Kahn. Hai điểm quan trọng:
 *
 * · **Xác định** (NFR-REL-03): khi nhiều bước cùng sẵn sàng thì lấy theo đúng thứ tự xuất
 *   hiện trong mảng đầu vào, không theo thứ tự duyệt Map. Cùng đầu vào luôn ra cùng thứ tự.
 * · **Không lặp vô hạn**: đồ thị có chu trình thì phần còn lại được trả về ở `cyclic` chứ
 *   không treo vòng lặp. Registry khai sai không được làm hỏng cả màn.
 *
 * Cạnh trỏ ra ngoài danh sách truyền vào bị bỏ qua — dải luồng thường chỉ vẽ một nhánh của
 * Registry, không phải toàn bộ 108 công thức.
 */
export function buildFlowChain(formulas: ReadonlyArray<FormulaSpec>): FlowChain {
  const order = new Map<string, number>();
  formulas.forEach((formula, index) => {
    if (!order.has(formula.id)) order.set(formula.id, index);
  });

  /** Chỉ giữ cạnh trỏ vào công thức có mặt trong danh sách, và bỏ cạnh trùng. */
  const edges = new Map<string, string[]>();
  for (const formula of formulas) {
    const parents = (formula.dependsOn ?? [])
      .map((dependency) => dependency.formulaId)
      .filter((id) => order.has(id) && id !== formula.id);
    edges.set(formula.id, [...new Set(parents)]);
  }

  const remaining = new Set(order.keys());
  const done = new Set<string>();
  const depths = new Map<string, number>();
  const steps: FlowStep[] = [];

  // Mỗi vòng lấy ra mọi bước đã đủ điều kiện. Vòng nào không lấy được gì nghĩa là còn chu trình.
  while (remaining.size > 0) {
    const ready = [...remaining]
      .filter((id) => (edges.get(id) ?? []).every((parent) => done.has(parent)))
      .sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));

    if (ready.length === 0) break;

    for (const id of ready) {
      const parents = edges.get(id) ?? [];
      const depth =
        parents.length === 0
          ? 0
          : Math.max(...parents.map((parent) => (depths.get(parent) ?? 0) + 1));

      depths.set(id, depth);
      steps.push({
        formulaId: id,
        label: labelOf(formulas, id),
        dependsOn: parents,
        depth,
      });
    }

    for (const id of ready) {
      remaining.delete(id);
      done.add(id);
    }
  }

  const cyclic = [...remaining].sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));

  return { steps, cyclic };
}

/** Bậc sâu nhất của dải — bản dọc ở desktop dùng để biết cần bao nhiêu hàng. */
export function flowDepth(chain: FlowChain): number {
  return chain.steps.reduce((max, step) => Math.max(max, step.depth), 0);
}

function labelOf(formulas: ReadonlyArray<FormulaSpec>, id: string): Bilingual {
  return formulas.find((formula) => formula.id === id)?.name ?? { vi: id, en: id };
}
