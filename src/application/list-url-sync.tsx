'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

export interface ListUrlSyncProps {
  /** Nhận chuỗi truy vấn mới nhất mỗi khi URL đổi — nối vào `applySearch` của `useListUrlState`. */
  onSearch: (search: string) => void;
}

/**
 * Cầu nối URL → màn Công thức. Không dựng ra gì.
 *
 * ── Vì sao là một component rỗng có `<Suspense>` riêng ──────────────────────────────────────────
 *
 * `useSearchParams()` là cách duy nhất Next cho biết truy vấn đổi khi trang KHÔNG gắn lại — bấm lại
 * mục "Công thức" lúc đang lọc, hay Lùi/Tới giữa hai trạng thái của cùng một trang. Nhưng với
 * `output: 'export'`, cây nào gọi hook ấy phải nằm trong `<Suspense>` và bị bỏ khỏi HTML tĩnh.
 *
 * Nên cây gọi hook được thu về nhỏ nhất có thể: đúng component này, không dựng ra một nút DOM nào.
 * Ranh giới bị bỏ khỏi HTML tĩnh là ranh giới rỗng — kệ và danh sách của màn nằm NGOÀI nó và vẫn
 * có đủ trong `out/cong-thuc/index.html`. `verify-static.mjs` gác vế ấy.
 *
 * `Suspense` nằm TRONG file này chứ không để nơi dùng tự bọc: quên bọc thì `next build` hỏng, và
 * một ràng buộc mà mỗi nơi gọi phải tự nhớ là ràng buộc sẽ có ngày bị quên.
 */
export function ListUrlSync({ onSearch }: ListUrlSyncProps) {
  return (
    <Suspense fallback={null}>
      <SearchWatcher onSearch={onSearch} />
    </Suspense>
  );
}

function SearchWatcher({ onSearch }: ListUrlSyncProps) {
  const search = useSearchParams().toString();

  useEffect(() => {
    onSearch(search);
  }, [search, onSearch]);

  return null;
}
