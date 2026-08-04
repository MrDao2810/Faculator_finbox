import type { Metadata } from 'next';

import { Showcase } from './Showcase';

export const metadata: Metadata = {
  title: 'Màn thử component',
  description: 'Trang nội bộ để nhìn bộ component của gói WBS 2.3 và 2.4 chạy thật.',
  // Không cho công cụ tìm kiếm lập chỉ mục: đây là trang nội bộ, không phải nội dung sản phẩm.
  robots: { index: false, follow: false },
};

/**
 * Màn thử component — TẠM, thuộc đợt 5 (gói WBS 2.3 + 2.4).
 *
 * Vì sao có màn này: `FORMULAS` còn rỗng cho tới nhánh 5, nên không component nào của hai gói
 * trên được vẽ ra để nhìn. Đợt 3 đã vấp đúng chỗ đó — FormulaCard qua typecheck và lint nhưng
 * không ai thấy nó chạy, phải ghi vào việc còn lại. Màn này để không lặp lại chuyện ấy.
 *
 * Không nằm trong sitemap.xml và đặt robots noindex, nên không lộ ra như một trang sản phẩm.
 *
 * XOÁ cả thư mục này khi gói 3.2.1 dựng màn WF-03 thật bằng công thức trong Registry.
 */
export default function ShowcasePage() {
  return (
    <>
      <h1>Màn thử component</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 'var(--space-1)' }}>
        Trang tạm của đợt 5 — gói WBS 2.3 (nhập liệu) và 2.4 (hiển thị kết quả). Số liệu dựng tay
        theo ví dụ P/E của WF-03, không phải dữ liệu thật. Gói 3.2.1 sẽ thay bằng màn WF-03.
      </p>

      <div style={{ marginTop: 'var(--space-5)' }}>
        <Showcase />
      </div>
    </>
  );
}
