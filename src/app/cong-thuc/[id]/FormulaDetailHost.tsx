'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, ReactNode } from 'react';

import type { FormulaGroupKey, FormulaModule } from '@/application';

import { FormulaDetail, type FormulaDetailProps } from './FormulaDetail';

/**
 * Vỏ của màn chi tiết: nạp ĐÚNG MỘT nhóm công thức rồi mới dựng `FormulaDetail` (28/10/2026).
 *
 * Trước đó `FormulaDetail` nhập `FORMULA_MODULES`, nên mọi trang chi tiết chở cả 111 công thức —
 * chunk route 875 kB thô / 234,6 kB gzip, trong đó 764 kB là 17 file nhóm. Đo trên bản thử (bản
 * sao, CPU hãm 4×, mạng 150 ms / 1,6 Mbps): First Load JS của pe 454 → 251 kB gzip, hydrate xong
 * 3,6 → 2,5 s.
 *
 * Vì sao `next/dynamic` chứ không 17 lá client do `page.tsx` chọn: với Next 15, mọi tham chiếu
 * client của một trang dùng chung nhóm chunk của entry trang ấy, nên 17 lá tĩnh vẫn kéo đủ 17
 * nhóm (thí nghiệm đã thấy trong RSC). Mỗi dòng `dynamic()` dưới đây là một `import()` TĨNH, để
 * Next biết chunk của nhóm mà gắn `<link rel="preload">` vào HTML của đúng trang ấy lúc build.
 *
 * Không có khung Suspense nào được thêm: `ssr: true` (mặc định) và không truyền `loading`, nên
 * `next/dynamic` bọc bằng Fragment (`lazy-dynamic/loadable.js`). Lúc hydrate, React giữ nguyên HTML
 * tĩnh tới khi chunk nhóm về; lúc chuyển trang phía client, router giữ màn cũ trong transition —
 * không có khung trắng.
 *
 * Cái giá đã đo: chuyển trang client sang một công thức mà chunk nhóm chưa có trong máy phải chờ
 * thêm chunk ấy, vì nó không nằm trong RSC nên router không prefetch nó như các chunk khác.
 *
 * Thêm một nhóm: khoá ở `FORMULA_GROUPS`, file cửa `src/application/formula-groups/<khoá>.ts`, và
 * một dòng ở bảng dưới; `formula-groups.test.ts` đỏ nếu thiếu một trong ba.
 */

interface NhomProps {
  readonly render: (modules: ReadonlyArray<FormulaModule>) => ReactNode;
}

/** Dựng component của một nhóm từ mảng module của nó — gọi đúng một lần mỗi nhóm, khi chunk về. */
function laNhom(modules: ReadonlyArray<FormulaModule>): ComponentType<NhomProps> {
  function NhomCongThuc({ render }: NhomProps) {
    return render(modules);
  }
  return NhomCongThuc;
}

const NHOM: Readonly<Record<FormulaGroupKey, ComponentType<NhomProps>>> = {
  multiples: dynamic(async () =>
    laNhom((await import('@/application/formula-groups/multiples')).GROUP_MODULES),
  ),
  fundamentals: dynamic(async () =>
    laNhom((await import('@/application/formula-groups/fundamentals')).GROUP_MODULES),
  ),
  'valuation-multiples': dynamic(async () =>
    laNhom((await import('@/application/formula-groups/valuation-multiples')).GROUP_MODULES),
  ),
  'valuation-dcf': dynamic(async () =>
    laNhom((await import('@/application/formula-groups/valuation-dcf')).GROUP_MODULES),
  ),
  fees: dynamic(async () =>
    laNhom((await import('@/application/formula-groups/fees')).GROUP_MODULES),
  ),
  returns: dynamic(async () =>
    laNhom((await import('@/application/formula-groups/returns')).GROUP_MODULES),
  ),
  performance: dynamic(async () =>
    laNhom((await import('@/application/formula-groups/performance')).GROUP_MODULES),
  ),
  risk: dynamic(async () =>
    laNhom((await import('@/application/formula-groups/risk')).GROUP_MODULES),
  ),
  'risk-drawdown': dynamic(async () =>
    laNhom((await import('@/application/formula-groups/risk-drawdown')).GROUP_MODULES),
  ),
  'risk-volatility': dynamic(async () =>
    laNhom((await import('@/application/formula-groups/risk-volatility')).GROUP_MODULES),
  ),
  'risk-ratios': dynamic(async () =>
    laNhom((await import('@/application/formula-groups/risk-ratios')).GROUP_MODULES),
  ),
  'technical-trend': dynamic(async () =>
    laNhom((await import('@/application/formula-groups/technical-trend')).GROUP_MODULES),
  ),
  'technical-volatility': dynamic(async () =>
    laNhom((await import('@/application/formula-groups/technical-volatility')).GROUP_MODULES),
  ),
  derivatives: dynamic(async () =>
    laNhom((await import('@/application/formula-groups/derivatives')).GROUP_MODULES),
  ),
  personal: dynamic(async () =>
    laNhom((await import('@/application/formula-groups/personal')).GROUP_MODULES),
  ),
  planning: dynamic(async () =>
    laNhom((await import('@/application/formula-groups/planning')).GROUP_MODULES),
  ),
  corporate: dynamic(async () =>
    laNhom((await import('@/application/formula-groups/corporate')).GROUP_MODULES),
  ),
};

export type FormulaDetailHostProps = Omit<FormulaDetailProps, 'spec' | 'modules'> & {
  /** Id công thức. Spec lấy từ chính module của nhóm — không đi qua RSC, xem docblock bên dưới. */
  readonly id: string;
  readonly group: FormulaGroupKey;
};

/**
 * `spec` không còn là prop từ `page.tsx`: trước đó nó được tuần tự hoá vào RSC của cả 111 trang
 * (TB 3,96 kB gzip mỗi trang, 8–12 kB ở 12 trang chuỗi giá vì bộ dữ liệu ví dụ 250 phiên đi theo)
 * trong khi chunk nhóm vốn đã mang đúng object ấy.
 */
export function FormulaDetailHost({ id, group, ...props }: FormulaDetailHostProps) {
  const Nhom = NHOM[group];
  return (
    <Nhom
      render={(modules) => {
        const found = modules.find((m) => m.spec.id === id);
        if (found === undefined) {
          throw new Error(`Không thấy công thức "${id}" trong nhóm "${group}".`);
        }
        return <FormulaDetail {...props} spec={found.spec} modules={modules} />;
      }}
    />
  );
}
