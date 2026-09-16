import type { Metadata } from 'next';

import { FORMULA_MODULES } from '@/application';

import { DailyShelf } from './DailyShelf';
import { FormulaListScreen } from './FormulaListScreen';

export const metadata: Metadata = {
  title: 'Công thức',
  description: `Thư viện ${String(FORMULA_MODULES.length)} công thức tài chính và chứng khoán Việt Nam — tra cứu, tính toán, giải thích; chia 12 nhóm.`,
};

/**
 * Màn Công thức — trang chủ WF-01 và danh sách WF-02 gộp làm một (chủ dự án chốt 15/09/2026).
 *
 * Đây là URL CHÍNH DANH và là màn MỞ ĐẦU của sản phẩm: `/` chuyển hướng về đây, sitemap khai
 * priority 1.0, và trạng thái lọc nằm trên URL nên chia sẻ được (FR-19). Màn tìm kiếm `/tim-kiem/`
 * là giao diện nhập truy vấn, cố ý đặt `noindex` để không trùng nội dung với trang này.
 *
 * ── Vì sao không còn `<Suspense fallback={<StaticFormulaList />}>` ────────────────────────────
 *
 * Bản trước bọc cả màn trong `<Suspense>` vì màn đọc bộ lọc bằng `useSearchParams()`, và với
 * `output: 'export'` Next bỏ toàn bộ cây ấy khỏi HTML tĩnh — nên phải dựng một bản danh sách tĩnh
 * riêng làm fallback. Màn nay giữ bộ lọc trong state và chỉ một component RỖNG đọc URL
 * (`ListUrlSync`), nên cả kệ lẫn danh sách dựng thẳng vào HTML — không còn cặp file nào phải giữ khớp
 * nhau từng pixel. Lý do đầy đủ ở `use-list-url-state.ts`; `verify-static.mjs` gác kết quả.
 *
 * KHÔNG có `<h1>` ở đây: tiêu đề "Công thức" do thanh trên dựng (`HeaderIdentity` +
 * `headerTitleKey()`). Trang vẫn đúng một `<h1>` — nó chỉ đổi chỗ.
 */
export default function FormulaListPage() {
  return <FormulaListScreen shelf={<DailyShelf />} />;
}
