import styles from './category-tone.module.css';

/**
 * Dấu hiệu thị giác của 12 nhóm công thức — icon và tông màu (bản thiết kế đợt 12).
 *
 * Vì sao bản đồ này nằm ở tầng PRESENTATION chứ không ở Registry: `Category` trong Domain mô tả
 * NỘI DUNG của một nhóm (nó có bao nhiêu công thức, tên nó là gì), còn hình vẽ và màu là chuyện
 * của màn hình. Thêm `icon`/`color` vào Domain là buộc lớp tính toán phải biết đến bảng màu —
 * và CON-02 vốn cấm chiều ngược lại, `src/core` không được đọc gì từ trên xuống.
 *
 * Vẽ tay bằng SVG thay vì thêm thư viện icon, cùng lẽ với `TabIcon`: 12 hình đơn giản không đáng
 * đánh đổi dung lượng gói (NFR-PER-04). Dùng `currentColor` nên icon lấy màu của chỗ đặt nó.
 *
 * KHÔNG `'use client'` và KHÔNG hook: `FormulaCard` (nhánh ô vuông) và `CategoryGrid` phải dựng
 * được ở phía server — chúng đi vào trang chủ qua `children` của `HomeSearchPanel`, và một hook
 * ở đây sẽ kéo cả hai vào gói máy khách, làm `out/index.html` mất phần Google đang đọc.
 *
 * Nhóm lạ (id chưa khai) rơi về hình khối hộp và tông trung tính, không ném lỗi: một nhóm mới
 * chưa kịp vẽ icon vẫn phải hiện ra được. `CategoryIcon.test.tsx` là chỗ bắt việc quên vẽ.
 */

/**
 * Bảy tông cho 12 nhóm.
 *
 * Trang chủ bày các nhóm ở HAI lưới rời nhau — Chứng khoán 7 nhóm, Cá nhân 5 nhóm — nên bảy tông
 * đủ để trong cùng một lưới không có hai ô trùng màu. Thứ phân biệt thật là hình icon (12 hình
 * khác nhau) cộng tên nhóm bằng chữ; màu chỉ là lớp thứ hai, đúng NFR-USA-06.
 */
export type CategoryTone = 'blue' | 'teal' | 'green' | 'red' | 'violet' | 'gold' | 'neutral';

interface CategoryVisual {
  tone: CategoryTone;
  /** Nét chính của hình, trong khung 24×24. */
  path: string;
  /** Nét phụ vẽ chồng lên, cho hình cần hai mảnh rời. */
  extra?: string;
}

/** Khoá là `Category['id']` của 12 nhóm trong Registry — xem `src/core/registry/categories.ts`. */
const VISUALS: Readonly<Record<string, CategoryVisual>> = {
  // Cân thăng bằng — định giá là việc cân giá thị trường với giá trị.
  valuation: {
    tone: 'blue',
    path: 'M12 5v14M7 19h10M4 9h16',
    extra: 'M6 9l-2.5 5h5L6 9ZM18 9l-2.5 5h5L18 9Z',
  },
  // Toà nhà — chỉ số của một doanh nghiệp.
  fundamentals: {
    tone: 'teal',
    path: 'M4 21V6l7-3v18M11 21h9V10h-9',
    extra: 'M7 9h1M7 13h1M7 17h1M14 13h3M14 17h3',
  },
  // Mũi tên đi lên — lợi nhuận.
  returns: { tone: 'green', path: 'M4 17l5-5 3 3 7-7', extra: 'M15 8h5v5' },
  // Tam giác cảnh báo — rủi ro.
  risk: { tone: 'red', path: 'M12 4 2.5 20h19L12 4Z', extra: 'M12 10v4M12 16.8v.2' },
  // Hai cây nến — phân tích kỹ thuật.
  technical: {
    tone: 'violet',
    path: 'M7 4v3M7 15v5M4.5 7h5v8h-5V7Z',
    extra: 'M17 4v5M17 17v3M14.5 9h5v8h-5V9Z',
  },
  // Hai mũi tên ngược chiều — hợp đồng có hai vế mua và bán.
  derivatives: { tone: 'gold', path: 'M4 8h15M4 16h15', extra: 'M15 4l4 4-4 4M8 12l-4 4 4 4' },
  // Hoá đơn có mép răng cưa — phí và thuế.
  'fees-tax': {
    tone: 'neutral',
    path: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3Z',
    extra: 'M9.5 8h5M9.5 12h5',
  },
  // Chồng đồng xu — tiết kiệm.
  savings: {
    tone: 'green',
    path: 'M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z',
    extra: 'M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  },
  // Mầm cây — tiền đem đi trồng.
  investing: {
    tone: 'blue',
    path: 'M12 20v-7M7 20h10',
    extra: 'M12 13c0-3 2.5-5 5.5-5 0 3-2.5 5-5.5 5ZM12 13c0-2.5-2-4.5-4.5-4.5 0 2.5 2 4.5 4.5 4.5Z',
  },
  // Tờ khế ước — vay nợ.
  loans: { tone: 'gold', path: 'M5 3h9l5 5v13H5V3Z', extra: 'M14 3v5h5M9 13h6M9 17h4' },
  // Dấu phần trăm — thuế thu nhập cá nhân.
  'personal-tax': {
    tone: 'neutral',
    path: 'M4 4h16v16H4V4Z',
    extra:
      'M15 9l-6 6M9.5 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM17.5 15.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z',
  },
  // Biểu đồ cột trong khung — tài chính doanh nghiệp.
  'corporate-finance': {
    tone: 'teal',
    path: 'M3 3v18h18',
    extra: 'M7.5 17v-4M12 17V8M16.5 17v-7',
  },
};

/** Hình cho nhóm chưa khai — khối hộp trung tính, cùng dáng với dấu hiệu sản phẩm. */
const FALLBACK: CategoryVisual = {
  tone: 'neutral',
  path: 'M12 3 21 8v8l-9 5-9-5V8l9-5Z',
  extra: 'M3 8l9 5 9-5M12 13v8',
};

/** Lớp CSS ứng với từng tông. Ánh xạ tay để tên lớp băm của CSS Module không bị gọi động. */
const TONE_CLASS: Readonly<Record<CategoryTone, string>> = {
  blue: styles.toneBlue ?? '',
  teal: styles.toneTeal ?? '',
  green: styles.toneGreen ?? '',
  red: styles.toneRed ?? '',
  violet: styles.toneViolet ?? '',
  gold: styles.toneGold ?? '',
  neutral: styles.toneNeutral ?? '',
};

function visualOf(id: string | undefined): CategoryVisual {
  if (id === undefined) return FALLBACK;
  return VISUALS[id] ?? FALLBACK;
}

/** Tông của một nhóm. Id lạ hoặc thiếu thì trả `'neutral'`. */
export function toneOf(id: string | undefined): CategoryTone {
  return visualOf(id).tone;
}

/**
 * Lớp CSS rót tông của nhóm vào hai khe `--category-ink` / `--category-soft`.
 *
 * Gắn lớp này lên TỔ TIÊN (cả thẻ, cả ô lưới) rồi để các phần bên trong đọc `var(--category-ink)`
 * — không gắn thẳng lên phần tử đang tô màu. Lớp tông và lớp của component nằm ở hai file CSS
 * Module khác nhau nhưng cùng độ ưu tiên, nên nếu cả hai cùng gán `color` thì cái nào thắng phụ
 * thuộc thứ tự hai file trong gói CSS — thứ không đoán trước được.
 */
export function toneClass(id: string | undefined): string {
  return TONE_CLASS[toneOf(id)];
}

/** Danh sách id đã có hình riêng — `CategoryIcon.test.tsx` đối chiếu với Registry. */
export function drawnCategoryIds(): string[] {
  return Object.keys(VISUALS);
}

export interface CategoryIconProps {
  /** `Category['id']`, hoặc `undefined` khi chưa tra được nhóm. */
  id?: string;
  /** Cạnh của khung vẽ, tính bằng px. */
  size?: number;
}

export function CategoryIcon({ id, size = 18 }: CategoryIconProps) {
  const visual = visualOf(id);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={visual.path} />
      {visual.extra !== undefined && <path d={visual.extra} />}
    </svg>
  );
}
