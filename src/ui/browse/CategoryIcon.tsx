import styles from './category-tone.module.css';

/**
 * Dấu hiệu thị giác của 12 nhóm công thức — HÌNH ICON. Màu thì mọi nhóm dùng chung một tông
 * xanh kể từ đợt đổi màu Finbox, nên hình và tên nhóm là hai thứ phân biệt chúng.
 *
 * Vì sao bản đồ này nằm ở tầng PRESENTATION chứ không ở Registry: `Category` trong Domain mô tả
 * NỘI DUNG của một nhóm (nó có bao nhiêu công thức, tên nó là gì), còn hình vẽ và màu là chuyện
 * của màn hình. Thêm `icon`/`color` vào Domain là buộc lớp tính toán phải biết đến bảng màu —
 * và CON-02 vốn cấm chiều ngược lại, `src/core` không được đọc gì từ trên xuống.
 *
 * NGUỒN HÌNH — chủ dự án chọn từng icon một trên Iconify, hình vector dưới đây CHÉP NGUYÊN từ
 * bộ gốc chứ không vẽ lại: một bản vẽ tay "trông na ná" là thứ đã bị trả lại một lần rồi. Muốn
 * đổi một icon thì tra lại `source` của nó tại `https://api.iconify.design/<prefix>/<name>.svg`
 * và chép đè, đừng nắn tay từng con số. Giấy phép của cả 10 bộ đang dùng là MIT hoặc Apache-2.0
 * (icons8 Windows 10, akar-icons, ic, tabler, boxicons, mdi, heroicons, fluent, charm,
 * griddy-icons) — đều cho phép nhúng, chỉ cần giữ dòng ghi nguồn này.
 *
 * Chép nguyên nghĩa là KHÔNG quy mọi hình về một khung 24×24: mỗi bộ vẽ trên lưới riêng (charm
 * 16, fluent 20, icons8 32), nên `viewBox` đi kèm từng hình. Ép chúng về cùng một khung là méo
 * hình — đúng cái lỗi mà việc chép nguyên sinh ra để tránh.
 *
 * Vẫn KHÔNG thêm thư viện icon, cùng lẽ với `TabIcon`: 12 hình nhúng thẳng thì nhẹ hơn hẳn một
 * gói phụ thuộc kéo theo cả bộ (NFR-PER-04). Dùng `currentColor` nên icon lấy màu của chỗ đặt nó.
 *
 * KHÔNG `'use client'` và KHÔNG hook: `FormulaCard` (nhánh ô vuông) và `CategoryGrid` phải dựng
 * được ở phía server — chúng đi vào trang chủ qua `children` của `HomeSearchPanel`, và một hook
 * ở đây sẽ kéo cả hai vào gói máy khách, làm `out/index.html` mất phần Google đang đọc.
 *
 * Nhóm lạ (id chưa khai) rơi về hình khối hộp, không ném lỗi: một nhóm mới chưa kịp vẽ icon vẫn
 * phải hiện ra được. `CategoryIcon.test.tsx` là chỗ bắt việc quên vẽ.
 */

interface IconPath {
  d: string;
  /**
   * Quy tắc tô `evenodd` cho riêng đường này.
   *
   * Chỉ khai khi bộ gốc có khai — hai thứ này không thay thế nhau được: đường viết theo lối
   * nonzero mà tô bằng `evenodd` thì các phần chồng nhau bị khoét rỗng, và ngược lại thì lỗ
   * (cửa sổ, mắt heo) bị bịt kín.
   */
  evenOdd?: boolean;
}

interface CategoryVisual {
  /** Khung vẽ GỐC của bộ icon. Mỗi bộ một cỡ — giữ nguyên, đừng quy hết về 24. */
  viewBox: string;
  /** Có mặt ⇒ hình vẽ bằng NÉT với bề rộng này (đơn vị của `viewBox`). Vắng ⇒ hình TÔ ĐẶC. */
  strokeWidth?: number;
  paths: readonly IconPath[];
  /** `<prefix>:<name>` trên Iconify — địa chỉ để tra lại bản gốc. */
  source: string;
}

/** Khoá là `Category['id']` của 12 nhóm trong Registry — xem `src/core/registry/categories.ts`. */
const VISUALS: Readonly<Record<string, CategoryVisual>> = {
  // Ba cột cao thấp — chỉ số của một doanh nghiệp.
  fundamentals: {
    source: 'icons8:bar-chart',
    viewBox: '0 0 32 32',
    paths: [{ d: 'M21 4v24h8V4zm2 2h4v20h-4zM3 10v18h8V10zm2 2h4v14H5zm7 4v12h8V16zm2 2h4v8h-4z' }],
  },
  // Đường xu hướng đi lên trong khung trục — lợi nhuận và cổ tức.
  returns: {
    source: 'akar-icons:statistic-up',
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: [{ d: 'M3 3v16a2 2 0 0 0 2 2h16' }, { d: 'm7 14l4-4l4 4l6-6' }, { d: 'M18 8h3v3' }],
  },
  // Cân thăng bằng — định giá là việc cân giá thị trường với giá trị.
  valuation: {
    source: 'ic:outline-balance',
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M13 7.83c.85-.3 1.53-.98 1.83-1.83H18l-3 7c0 1.66 1.57 3 3.5 3s3.5-1.34 3.5-3l-3-7h2V4h-6.17c-.41-1.17-1.52-2-2.83-2s-2.42.83-2.83 2H3v2h2l-3 7c0 1.66 1.57 3 3.5 3S9 14.66 9 13L6 6h3.17c.3.85.98 1.53 1.83 1.83V19H2v2h20v-2h-9zM20.37 13h-3.74l1.87-4.36zm-13 0H3.63L5.5 8.64zM12 6c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1',
      },
    ],
  },
  // Tam giác cảnh báo — rủi ro và danh mục.
  risk: {
    source: 'tabler:alert-triangle',
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    paths: [
      {
        d: 'M12 9v4m-1.637-9.409L2.257 17.125a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.87L13.637 3.59a1.914 1.914 0 0 0-3.274 0M12 16h.01',
      },
    ],
  },
  // Hai cây nến kèm bấc — phân tích kỹ thuật.
  technical: {
    source: 'boxicons:candlestick',
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M10 5H9V2H7v3H6c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h1v3h2v-3h1c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1M9 17H7V7h2zm9-10h-1V4h-2v3h-1c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h1v3h2v-3h1c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1m-1 8h-2V9h2z',
      },
    ],
  },
  // Tờ hợp đồng kèm hai mũi tên ngược chiều — hai vế mua bán của phái sinh.
  derivatives: {
    source: 'mdi:file-arrow-left-right-outline',
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M13.09 20c.12.72.37 1.39.72 2H6c-1.11 0-2-.89-2-2V4a2 2 0 0 1 2-2h8l6 6v5.09c-.33-.05-.66-.09-1-.09s-.67.04-1 .09V9h-5V4H6v16zM23 17l-3-2.5V16h-4v2h4v1.5zm-5 1.5L15 21l3 2.5V22h4v-2h-4z',
      },
    ],
  },
  // Hoá đơn mép răng cưa kèm dấu phần trăm — phí và thuế thị trường VN.
  'fees-tax': {
    source: 'heroicons:receipt-percent',
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    paths: [
      {
        d: 'm9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5l-3.75 1.5l-3.75-1.5l-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.5 48.5 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185M9.75 9h.008v.008H9.75zm.375 0a.375.375 0 1 1-.75 0a.375.375 0 0 1 .75 0m4.125 4.5h.008v.008h-.008zm.375 0a.375.375 0 1 1-.75 0a.375.375 0 0 1 .75 0',
      },
    ],
  },
  // Heo đất kèm đồng xu đang thả vào — tiết kiệm.
  savings: {
    source: 'fluent:savings-24-regular',
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M10.081 4.089c.53.366 1.037.607 1.454.66a5 5 0 0 0-.47 1.44c-.672-.149-1.311-.504-1.836-.866a10 10 0 0 1-.729-.557V7a.75.75 0 0 1-.47.695l-.006.003a3 3 0 0 0-.166.074c-.117.055-.287.14-.486.254A6.5 6.5 0 0 0 6.03 9.03c-.453.453-.733 1.063-.89 1.536c-.203.606-.719 1.165-1.453 1.288a.224.224 0 0 0-.187.22v1.754c0 .165.12.306.283.333c.624.104 1.115.512 1.392 1.006a8.4 8.4 0 0 0 1.355 1.802a5 5 0 0 0 1.585 1.039a5 5 0 0 0 .774.254l.005.002A.75.75 0 0 1 9.5 19v1.25c0 .138.112.25.25.25H11a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5h1.25a.25.25 0 0 0 .25-.25V18c0-.283.16-.542.412-.67l.013-.007l.07-.04c.065-.039.164-.1.285-.188c.242-.176.571-.449.9-.833c.653-.761 1.32-1.968 1.32-3.762c0-1.007-.188-1.82-.509-2.488a5 5 0 0 0 .798-1.576q.15.204.282.423c.604.999.929 2.204.929 3.64c0 2.207-.833 3.75-1.68 4.739A6.7 6.7 0 0 1 19 18.42v1.829A1.75 1.75 0 0 1 17.25 22H16a1.5 1.5 0 0 1-1.5-1.5h-2A1.5 1.5 0 0 1 11 22H9.75A1.75 1.75 0 0 1 8 20.25v-.683a7 7 0 0 1-.464-.175A6.5 6.5 0 0 1 5.47 18.03a10 10 0 0 1-1.605-2.131a.49.49 0 0 0-.329-.258A1.84 1.84 0 0 1 2 13.828v-1.753c0-.843.61-1.562 1.44-1.7c.087-.015.216-.102.277-.284c.192-.577.565-1.434 1.253-2.122a8 8 0 0 1 1.658-1.246q.206-.117.372-.2V3.67c0-.938 1.13-1.323 1.74-.716c.33.329.81.767 1.341 1.134m2.989 4.759c-.49-.203-.904-.589-1.002-1.11a4.002 4.002 0 0 1 7.627-2.27a4 4 0 0 1-1.436 4.834c-.438.299-1.003.279-1.493.076zm4.394.18a2.502 2.502 0 0 0-2.42-4.338a2.5 2.5 0 0 0-1.513 2.708l.021.016a.5.5 0 0 0 .092.048l3.696 1.53a.5.5 0 0 0 .124.035M9 10a1 1 0 1 1-2 0a1 1 0 0 1 2 0',
      },
    ],
  },
  // Mầm hai lá vươn khỏi chậu — tiền đem đi trồng.
  investing: {
    source: 'charm:plant-pot',
    viewBox: '0 0 16 16',
    strokeWidth: 1.5,
    paths: [
      {
        d: 'm8.75 6.75c0 1.25-.75 3-.75 3m.25-2.5s.75-2-1-3.5-4.5-1-4.5-1 0 2 1.5 3.5 4 1 4 1zm.5-1s-.75-2 1-3.5 4.5-1 4.5-1 0 2-1.5 3.5-4 1-4 1z',
      },
      { d: 'm4.75 9.75h6.5s.5 4.5-3.25 4.5-3.25-4.5-3.25-4.5z' },
    ],
  },
  // Bàn tay đỡ đồng xu — khoản vay trao tay.
  loans: {
    source: 'griddy-icons:loan',
    viewBox: '0 0 24 24',
    paths: [
      {
        evenOdd: true,
        d: 'M1.5 9.75c0 1.332.336 2.583.926 3.676a1.832 1.832 0 0 0-.58 2.981l4.326 4.325a3.75 3.75 0 0 0 3.147 1.066L15.3 21h3.2v1H22v-1.5h-2V13h2v-1.5h-3.5v1h-2.002A7.75 7.75 0 0 0 9.25 2A7.75 7.75 0 0 0 1.5 9.75M9.25 3.5a6.251 6.251 0 0 0-4.88 10.156l3.137 1.41a2.25 2.25 0 0 1 .993-1.687V13h-1v-1.5h2a.5.5 0 0 0 0-1H9a2 2 0 0 1-.5-3.937V5.5H10v1h1V8H9a.5.5 0 0 0 0 1h.5a2 2 0 0 1 .5 3.937V13h3.628l1.182-.394A6.25 6.25 0 0 0 9.25 3.5m-.442 13.794l-5.53-2.485a.332.332 0 0 0-.37.538l4.324 4.324a2.25 2.25 0 0 0 1.889.64l6.08-.811H18.5V14h-3.128l-1.5.5H9.75a.75.75 0 0 0 0 1.5h4.31l1.22 1.22l-1.06 1.06l-.78-.78H9.75c-.336 0-.656-.074-.942-.206',
      },
    ],
  },
  // Tờ khai kèm dấu phần trăm — thuế thu nhập cá nhân.
  'personal-tax': {
    source: 'fluent:document-percent-20-regular',
    viewBox: '0 0 20 20',
    paths: [
      {
        d: 'M5.5 10a4.5 4.5 0 1 1 0 9a4.5 4.5 0 0 1 0-9m5.086-8a1.5 1.5 0 0 1 1.06.44l3.914 3.914a1.5 1.5 0 0 1 .44 1.06V16a2 2 0 0 1-2 2H9.743q.382-.462.657-1H14a1 1 0 0 0 1-1V8h-3.5A1.5 1.5 0 0 1 10 6.5V3H6a1 1 0 0 0-1 1v5.022a5.5 5.5 0 0 0-1 .185V4a2 2 0 0 1 2-2zM7.5 15a1 1 0 1 0 0 2a1 1 0 0 0 0-2m.35-2.854a.5.5 0 0 0-.707 0l-3.997 3.997a.5.5 0 1 0 .708.707l3.996-3.997a.5.5 0 0 0 0-.707M3.5 12a1 1 0 1 0 0 2a1 1 0 0 0 0-2M11 6.5a.5.5 0 0 0 .5.5h3.293L11 3.207z',
      },
    ],
  },
  // Toà nhà văn phòng kèm khối phụ thấp — tài chính doanh nghiệp.
  'corporate-finance': {
    source: 'griddy-icons:building-alt-02',
    viewBox: '0 0 24 24',
    paths: [
      {
        evenOdd: true,
        d: 'M19.75 2h-9.5C9.56 2 9 2.56 9 3.25V10H5.75A2.755 2.755 0 0 0 3 12.75V22h18V3.25C21 2.56 20.44 2 19.75 2M4.5 20.5v-7.75c0-.69.56-1.25 1.25-1.25H9v9zm11.5 0h-2v-3h2zm3.5 0h-2V16h-5v4.5h-2v-17h9zM14 5.5h-1.5v2H14zm2 0h1.5v2H16zM14 9h-1.5v2H14zm2 0h1.5v2H16zm-2 3.5h-1.5v2H14zm2 0h1.5v2H16z',
      },
    ],
  },
};

/** Hình cho nhóm chưa khai — khối hộp trung tính, cùng dáng với dấu hiệu sản phẩm. */
const FALLBACK: CategoryVisual = {
  source: 'tự vẽ',
  viewBox: '0 0 24 24',
  paths: [{ evenOdd: true, d: 'M12 3 21 8V16L12 21 3 16V8ZM12 6.4 6.2 9.6 12 12.8 17.8 9.6Z' }],
};

function visualOf(id: string | undefined): CategoryVisual {
  if (id === undefined) return FALLBACK;
  return VISUALS[id] ?? FALLBACK;
}

/**
 * Lớp CSS rót tông của nhóm vào hai khe `--category-ink` / `--category-soft`.
 *
 * KHÔNG nhận `id`, và đó là cả nội dung của quyết định đơn sắc: mọi nhóm dùng chung một tông
 * xanh, việc phân biệt 12 nhóm dồn về HÌNH ICON và tên nhóm bằng chữ. Xem docblock
 * `category-tone.module.css` về lý do bỏ bảy tông, và về việc vì sao lớp này vẫn tồn tại dù
 * chỉ còn một giá trị.
 *
 * Gắn lớp này lên TỔ TIÊN (cả thẻ, cả ô lưới) rồi để các phần bên trong đọc `var(--category-ink)`
 * — không gắn thẳng lên phần tử đang tô màu. Lớp tông và lớp của component nằm ở hai file CSS
 * Module khác nhau nhưng cùng độ ưu tiên, nên nếu cả hai cùng gán `color` thì cái nào thắng phụ
 * thuộc thứ tự hai file trong gói CSS — thứ không đoán trước được.
 */
export function toneClass(): string {
  return styles.toneBrand ?? '';
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
  const veBangNet = visual.strokeWidth !== undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox={visual.viewBox}
      /*
       * Hai lối vẽ loại trừ nhau: bộ vẽ bằng nét phải để `fill="none"`, nếu không phần trong
       * đường khép kín bị tô kín và icon thành một mảng đặc. Bộ tô đặc thì ngược lại, không
       * được có `stroke` — nét thừa làm hình dày lên và các lỗ nhỏ (dấu %, cửa sổ) bịt lại.
       */
      fill={veBangNet ? 'none' : 'currentColor'}
      stroke={veBangNet ? 'currentColor' : undefined}
      strokeWidth={visual.strokeWidth}
      strokeLinecap={veBangNet ? 'round' : undefined}
      strokeLinejoin={veBangNet ? 'round' : undefined}
      aria-hidden="true"
    >
      {visual.paths.map((path) => (
        <path key={path.d} d={path.d} fillRule={path.evenOdd === true ? 'evenodd' : undefined} />
      ))}
    </svg>
  );
}
