'use client';

import { findCategory } from '@/application';
import type { Category, FormulaSummary } from '@/application';

import { GroupCard } from './GroupCard';
import styles from './SearchResults.module.css';

export interface SearchResultsProps {
  formulas: ReadonlyArray<FormulaSummary>;
  /**
   * Chuỗi đang tìm, để tô sáng đoạn khớp.
   * Bỏ trống thì chữ hiện nguyên — khối "Có thể bạn cần" của trạng thái không-tìm-thấy dùng
   * chính component này mà không có gì để tô.
   */
  query?: string;
  /**
   * Gọi khi bấm vào một dòng kết quả — nơi gọi dùng để ghi "Tìm gần đây" (WF-09).
   * Không truyền thì không có gì thêm ngoài điều hướng bình thường; khối "Có thể bạn cần" của
   * trạng thái không-tìm-thấy cố tình không truyền, vì đó là gợi ý chứ không phải thứ vừa tìm ra.
   */
  onSelect?: (formula: FormulaSummary) => void;
  /**
   * Tổng số công thức của từng nhóm trong BỘ ĐANG TÌM, khoá theo `categoryId` — để đầu mỗi thẻ
   * in "7 / 13" và có link "Mở nhóm …". Phải đếm trên cùng `pool` với kết quả (xem `SearchScreen`):
   * hai con số trên một thẻ mà đếm hai bộ khác nhau là sai hiển nhiên.
   *
   * Khối "Có thể bạn cần" không truyền: gợi ý không phải kết quả đếm được.
   */
  totals?: ReadonlyMap<string, number>;
}

interface Group {
  category: Category;
  formulas: FormulaSummary[];
}

/**
 * Nhóm lạ (id chưa có trong `CATEGORIES`) vẫn phải hiện ra được, dù validator của Registry đã
 * chặn chuyện đó từ lúc kiểm — dựng một nhóm tạm mang chính id làm tên, không ném lỗi.
 */
function categoryOrFallback(id: string): Category {
  return (
    findCategory(id) ?? {
      id,
      segment: 'stock',
      name: { vi: id, en: id },
      shortName: { vi: id, en: id },
      description: { vi: '', en: '' },
      expectedCount: 0,
    }
  );
}

/**
 * Danh sách kết quả tìm kiếm gom theo nhóm — WF-09 trạng thái A (gói WBS 3.1.3).
 *
 * Mỗi nhóm là một `GroupCard`: dưới 1024px là danh sách gọn của bản điện thoại (dòng gọn, huy
 * hiệu cấp độ, mũi tên), từ 1024 là thẻ đóng khung xếp lưới — bản vẽ "Thư mục theo nhóm" cho
 * trạng thái đang gõ. Ở đây chỉ còn việc gom nhóm và trải lưới.
 *
 * Thứ tự nhóm bám theo thứ tự kết quả do `selectFormulas()` chấm điểm, KHÔNG sắp lại theo
 * bảng chữ cái — kết quả khớp nhất phải nằm trên cùng.
 */
export function SearchResults({ formulas, query = '', onSelect, totals }: SearchResultsProps) {
  const groups: Group[] = [];
  const byId = new Map<string, Group>();

  for (const formula of formulas) {
    let group = byId.get(formula.categoryId);
    if (group === undefined) {
      group = { category: categoryOrFallback(formula.categoryId), formulas: [] };
      byId.set(formula.categoryId, group);
      groups.push(group);
    }
    group.formulas.push(formula);
  }

  return (
    <div className={styles.groups}>
      {groups.map((group) => {
        const total = totals?.get(group.category.id);
        return (
          <GroupCard
            key={group.category.id}
            category={group.category}
            formulas={group.formulas}
            query={query}
            onSelect={onSelect}
            /*
              Câu mô tả nhóm chỉ hiện từ 1024 (CSS trong `GroupCard.module.css` ẩn nó ở dưới mốc
              ấy), nên truyền ở mọi khổ vẫn không đụng gì tới bản điện thoại đã duyệt. Bản vẽ có
              nó ở cả hai trạng thái — thẻ kết quả và thẻ thư mục là cùng một thẻ.
            */
            showDescription
            {...(total === undefined
              ? {}
              : { total, hits: group.formulas.length, footer: 'open' as const })}
          />
        );
      })}
    </div>
  );
}
