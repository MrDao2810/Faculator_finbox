import Link from 'next/link';
import { memo } from 'react';

import { findCategory, formulaPath } from '@/application';
import type { FormulaSummary } from '@/application';

import { Pick } from '../i18n/Pick';
import { T } from '../i18n/T';
/*
 * Nhập THẲNG từ file chứ không qua barrel `@/ui/primitives`, cùng cách hai dòng trên nhập
 * `Pick`/`T`. Thẻ này được dựng từ CẢ hai phía — `FormulaBrowser` phía máy khách và
 * `StaticFormulaList` phía máy chủ — nên đi qua barrel là kéo theo `Button`, `Input`, `Select`,
 * `BottomSheet`, `Switch` (đều mang `'use client'`) vào đồ thị của trang chủ và của danh sách
 * tĩnh, chỉ để lấy một `<span>`. `Badge` không có `'use client'` và không gọi hook nào.
 */
import { Badge } from '../primitives/Badge';
import { CategoryIcon, toneClass } from './CategoryIcon';
import styles from './FormulaCard.module.css';

export interface FormulaCardProps {
  formula: FormulaSummary;
  /** Ẩn nhãn nhóm khi cả danh sách vốn đã thuộc một nhóm. */
  showCategory?: boolean;
  /**
   * `row` — một hàng ngang có icon nhóm, badge cấp độ, badge nhóm và mũi tên; dùng ở danh sách
   * WF-02 và WF-09. Ở khổ hàng thì cả bốn đều có chỗ, khác hẳn khổ ô 164px của trang chủ.
   * `tile` — ô vuông trong lưới hai cột của trang chủ WF-01: icon nhóm, tên, mô tả và badge
   * nhóm. Vẫn bỏ badge cấp độ và mũi tên, vì ở khổ ô 164px chúng chiếm chỗ của phần chữ mà
   * không nói thêm được gì.
   */
  variant?: 'row' | 'tile';
  /**
   * Gọi khi bấm vào thẻ — nơi gọi dùng để ghi "Tìm gần đây", cùng khuôn với `onSelect` của
   * `SearchResults`. Không truyền thì bấm vào chỉ điều hướng như thường.
   *
   * Cố tình KHÔNG truyền ở: kệ 18 ô của trang chủ lúc chưa gõ gì, và danh sách `/cong-thuc/`.
   * Lịch sử tìm chỉ được ghi khi người dùng bấm vào một KẾT QUẢ TÌM, không phải mỗi lần họ mở
   * một công thức — thứ sau đã có kho riêng (`ffb.usage.v1`) với mục đích khác hẳn.
   *
   * Nơi gọi phải bọc `useCallback`: thẻ này là `memo`, truyền hàm mới mỗi lượt gõ là cả lưới
   * dựng lại theo từng phím.
   */
  onSelect?: (formula: FormulaSummary) => void;
}

/**
 * Thẻ công thức — gói WBS 2.2.3.
 *
 * Dùng lại ở trang chủ (khối nổi bật), màn danh sách WF-02, và cột giữa của bố cục desktop
 * WF-07 — nên không tự quyết bố cục ngoài, chỉ lo phần bên trong thẻ.
 *
 * Hai biến thể ở chung một file thay vì tách component riêng, để chỗ dựng đường dẫn
 * (`formulaPath`) và chỗ tra nhóm chỉ có một bản.
 *
 * Cả thẻ là một thẻ <a> thật, không phải div bắt sự kiện: bấm được, mở tab mới được,
 * và điều hướng được cả khi JavaScript chưa tải xong.
 *
 * Badge cấp độ và tên/mô tả công thức/nhóm đều đi qua lá `<T>`/`<Pick>` chứ không `useT()`/
 * `usePick()` thẳng: file này được dựng ở CẢ HAI phía — client (FormulaBrowser, HomeSearchPanel)
 * lẫn server (StaticFormulaList, fallback SEO) — nên gọi hook thẳng sẽ ném lỗi ở lượt dựng
 * server. Hai lá này chạy được cả hai chỗ (xem docblock `Pick.tsx`).
 */
function FormulaCardBase({
  formula,
  showCategory = true,
  variant = 'row',
  onSelect,
}: FormulaCardProps) {
  const category = findCategory(formula.categoryId);
  const isBasic = formula.level === 'basic';

  /*
   * Chỉ là việc phụ bám theo cú bấm, KHÔNG chặn điều hướng: thẻ vẫn là `<a>` thật nên mở tab
   * mới, bấm giữa chuột hay Enter đều chạy đúng như trước.
   *
   * PHẢI là `undefined` khi không ai truyền `onSelect`, không được là một hàm luôn tồn tại gọi
   * `onSelect?.()` bên trong. Lý do là ranh giới RSC: file này KHÔNG mang `'use client'` và được
   * `StaticFormulaList` cùng `page.tsx` dựng ở phía SERVER, mà `<Link>` thì là client component —
   * nên một hàm gắn cứng vào `onClick` là hàm bị đẩy qua ranh giới, và Next dừng hẳn trang với
   * "Event handlers cannot be passed to Client Component props". Đã xảy ra thật ở trang chủ.
   * Không ca kiểm jsdom nào bắt được chuyện này vì chúng không dựng qua ranh giới RSC — chỉ
   * `npm run build` (hoặc mở dev server) mới thấy.
   */
  const handleClick =
    onSelect === undefined
      ? undefined
      : () => {
          onSelect(formula);
        };

  if (variant === 'tile') {
    /*
     * Lớp tông đặt trên chính thẻ, không đặt trên icon hay badge: nó chỉ rót hai khe
     * `--category-*`, còn hai phần bên trong đọc khe đó. Xem docblock `toneClass()`.
     */
    return (
      <Link
        href={formulaPath(formula.id)}
        className={`${styles.tile} ${toneClass()}`}
        onClick={handleClick}
      >
        {/*
          Icon đứng CÙNG DÒNG với tên — bản thiết kế Figma "FINBOX VERSION 2". Bản trước để icon
          một dòng riêng phía trên, nên ô cao thêm gần 40px mà không nói thêm gì; gộp lại thì lưới
          19 ô ở trang chủ ngắn hẳn đi.

          Icon nằm BÊN TRONG khối tên, không phải một ô flex đứng cạnh: có thế tên dài mới xuống
          dòng chạy hết bề ngang thẻ, đúng bản thiết kế — xem chú thích `.tileIcon`.
        */}
        <span className={styles.tileName}>
          <span className={styles.tileIcon} aria-hidden="true">
            {/* To hơn khổ mặc định 18px hai bậc — xem chú thích `.tileIcon` về mức trần 24px. */}
            <CategoryIcon id={formula.categoryId} size={24} />
          </span>
          <Pick value={formula.name} />
        </span>
        <span className={styles.tileDescription}>
          <Pick value={formula.description} />
        </span>
        {showCategory && category !== undefined && (
          <span className={styles.tileCategory}>
            <Pick value={category.shortName} />
          </span>
        )}
      </Link>
    );
  }

  /*
   * Lớp tông cũng đặt trên chính thẻ, y như nhánh ô — xem chú thích ở trên và docblock
   * `toneClass()`. Icon và badge nhóm bên trong chỉ đọc hai khe `--category-*`.
   */
  return (
    <Link
      href={formulaPath(formula.id)}
      className={`${styles.card} ${toneClass()}`}
      onClick={handleClick}
    >
      {/*
        Icon nhóm nằm TRONG `.body`, không đứng ngoài như một ô flex riêng — xem chú thích
        `.body`. Nó chỉ chiếm ô hàng-1/cột-1 của lưới, nên mô tả và nhãn nhóm bên dưới chạy
        thẳng ra mép trái thẻ thay vì để trống một cột suốt chiều cao còn lại.
      */}
      <div className={styles.body}>
        <span className={styles.rowIcon} aria-hidden="true">
          <CategoryIcon id={formula.categoryId} size={24} />
        </span>

        {/*
          Tên và huy hiệu nằm chung MỘT ô lưới, và bên trong ô đó không có flex nào: cả hai vẫn
          là hộp inline trong cùng một dòng chữ, nên huy hiệu bám ngay sau chữ cuối của tên và
          chỉ xuống dòng khi hết chỗ thật — xem chú thích `.levelBadge`.
        */}
        <span className={styles.heading}>
          <span className={styles.name}>
            <Pick value={formula.name} />
          </span>
          <Badge tone={isBasic ? 'basic' : 'advanced'} className={styles.levelBadge}>
            <T k={isBasic ? 'level.basic' : 'level.advanced'} />
          </Badge>
        </span>

        <p className={styles.description}>
          <Pick value={formula.description} />
        </p>

        {showCategory && category !== undefined && (
          <div className={styles.category}>
            <Pick value={category.name} />
          </div>
        )}
      </div>

      <svg
        className={styles.chevron}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  );
}

export const FormulaCard = memo(FormulaCardBase);
