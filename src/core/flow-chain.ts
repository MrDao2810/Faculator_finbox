/**
 * Tầng DOMAIN — sắp thứ tự chuỗi công thức móc nối theo `dependsOn` (gói WBS 2.4.6).
 *
 * Thứ tự KHÔNG viết cứng ở đây: nó suy ra từ `dependsOn` của từng FormulaSpec, nên thêm một bước
 * vào giữa chuỗi chỉ là khai thêm một cạnh (NFR-MNT-01).
 *
 * Nay chỉ còn MỘT nơi gọi: `runChain()` (FR-15) hỏi thứ tự để biết tính công thức nào trước.
 * Nơi gọi thứ hai — hình vẽ của khối chuỗi WF-04 — đã bỏ ngày 16/09/2026, kéo theo hàm dựng cây
 * `layoutFlowChain()` và `flowDepth()`; lý do ở docblock `ui/screens/ChainBody.tsx`.
 */

import type { FormulaSpec } from './registry/types';
import type { Bilingual } from './types';

export interface FlowStep {
  formulaId: string;
  /** Tên công thức, để nơi gọi gọi đúng tên bước trong câu cảnh báo. */
  label: Bilingual;
  /** Các bước đứng ngay trước bước này. */
  dependsOn: ReadonlyArray<string>;
  /** Bậc trong chuỗi: 0 là bước không phụ thuộc ai. `ChainStep` chép lại trường này. */
  depth: number;
}

export interface FlowChain {
  steps: ReadonlyArray<FlowStep>;
  /**
   * Các công thức nằm trong một vòng phụ thuộc, không sắp thứ tự được.
   * Rỗng là bình thường. Không rỗng nghĩa là Registry khai sai — nhưng phần lành vẫn chạy được,
   * không làm hỏng cả màn.
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
 * Registry, không phải toàn bộ 111 công thức.
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

function labelOf(formulas: ReadonlyArray<FormulaSpec>, id: string): Bilingual {
  return formulas.find((formula) => formula.id === id)?.name ?? { vi: id, en: id };
}
