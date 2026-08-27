/**
 * Tầng PRESENTATION — chụp lại hình biểu đồ đang hiện trên trang, để đem vào file xuất.
 *
 * Vì sao CHÉP NODE thay vì dựng lại một biểu đồ thứ ba:
 *
 * 1. **Không tốn thêm một byte nào của động cơ biểu đồ.** Toàn bộ mã vẽ (`buildChartModel`, hai
 *    renderer SVG, bộ chia vạch) nằm sau ranh giới `next/dynamic` của `FormulaChart` — xem bất
 *    biến viết hoa ở đầu file ấy. `ExportSheet` thì được import TĨNH bởi màn chi tiết, nên một
 *    dòng import chạm `@/core/chart` từ đây là kéo cả động cơ vào gói cơ sở của 111 trang.
 *    Chép node thì chỗ này chỉ biết tới DOM, không biết biểu đồ là gì.
 * 2. **Đúng hình người dùng đang nhìn.** Trục X họ vừa chọn, mã họ vừa nạp, dấu "giá trị hiện
 *    tại" ở đúng chỗ. Dựng lại từ model là dựng lại cả cây quyết định ấy, và hai bản sẽ lệch
 *    nhau vào ngày ai đó đổi mặc định ở một bên.
 *
 * Module này KHÔNG được import tĩnh từ `ExportSheet` — nạp bằng `import()` trần đúng như
 * `draw-card`, để chunk sinh ra không bị Next ghi vào HTML và không tính vào cửa kiểm NFR-PER-04.
 */

/** Thuộc tính đánh dấu hình trên trang. Cùng chuỗi với `LineChart` và `WaterfallChart`. */
const MARKER = 'data-chart-svg';

/**
 * Những node CHỈ phục vụ tương tác, không mang thông tin — bỏ khỏi bản chép.
 *
 * Vùng bắt sự kiện là một `<rect>` trong suốt phủ kín vùng vẽ: trên giấy nó vô hình nhưng vẫn
 * là một node thừa, và trong tấm PNG thì `fill: transparent` của nó đến từ CSS Module không đi
 * theo file — tức nó có thể hoá thành một mảng đen phủ kín hình. Vệt dò thì đang bám con trỏ
 * chuột lúc bấm nút Xuất, không phải một phần của kết quả.
 *
 * Dấu "giá trị hiện tại" (`chart-marker`) thì GIỮ — nó chính là con số công thức đang trả về.
 */
const INTERACTIVE = ['[data-testid$="-hover-capture"]', '[data-testid$="-hover"]'];

/**
 * Tìm hình biểu đồ đang hiện trên trang của công thức này và trả về một bản chép rời.
 *
 * `null` khi công thức không có biểu đồ (`chartType: 'none'`), khi khối biểu đồ chưa nạp xong
 * (nó nằm sau `next/dynamic` và dưới nếp gấp), hoặc khi biểu đồ không vẽ được nên màn chỉ hiện
 * cảnh báo. Nơi gọi phải xử lý được `null` — không có gì đảm bảo hình đã ở đó.
 *
 * Bản chép rời hẳn khỏi React: nó không nằm trong cây nào React đang quản, nên nơi gọi tự do
 * `appendChild` nó vào đâu tuỳ ý.
 */
export function cloneChartSvg(
  formulaId: string,
  root: ParentNode = document,
): SVGSVGElement | null {
  const live = root.querySelector(`svg[${MARKER}="chart-${formulaId}"]`);
  if (live === null) return null;

  const copy = live.cloneNode(true) as SVGSVGElement;

  for (const selector of INTERACTIVE) {
    for (const node of copy.querySelectorAll(selector)) node.remove();
  }

  renameIds(copy);

  /*
   * Gỡ chính cái dấu vừa dùng để tìm: bản chép nằm cùng tài liệu với bản gốc, nên để lại là
   * lần chụp sau có hai node cùng trả lời một câu hỏi — và `querySelector` lấy node ĐẦU, tức
   * bản chép cũ, tức file xuất đóng băng ở hình của lần trước.
   */
  copy.removeAttribute(MARKER);

  return copy;
}

/**
 * Bội số phóng khi rasterise sang PNG.
 *
 * `viewBox` của biểu đồ rộng 320 đơn vị, còn tấm thẻ PNG rộng 1080 — vẽ đúng 320 rồi kéo giãn là
 * hình rỗ. Nhân 3 cho ra 960, xấp xỉ bề ngang trong lề của tấm thẻ (936), nên trình duyệt gần như
 * không phải nội suy.
 */
const SCALE = 3;

/**
 * Đóng bản chép thành một SVG TỰ CHỨA, trả về data URL nạp được vào `<img>`.
 *
 * Đây là chỗ khác hẳn đường in. Bản in nằm cùng tài liệu với trang, nên lớp CSS Module của nó vẫn
 * được stylesheet ngoài áp vào như thường. Ảnh nạp qua `<img>` thì KHÔNG: nó là một tài liệu riêng,
 * không thấy stylesheet nào của trang, nên một bản chép trần sẽ ra hình đen trắng không nét.
 *
 * Cách lấy CSS: bốc thẳng từ `document.styleSheets` những luật có nhắc tới lớp mà bản chép đang
 * dùng, cộng nguyên khối `:root`. Hai điều rơi ra từ cách ấy, cả hai đều là thứ mong muốn:
 *
 * - **Luôn là bảng SÁNG, theo cấu tạo.** Khối `[data-theme='dark']` không phải `:root` nên không
 *   được bốc; không có cờ nào để quên bật, không có bản chép mã màu nào để lệch. Cùng lời hứa mà
 *   `CARD_COLORS` của `draw-card.ts` và `.print-region` của globals.css đang giữ.
 * - **Luôn là bản gốc của luật, không phải bản chép tay.** Đổi màu đường quét trong
 *   `chart.module.css` là ảnh PNG đổi theo, không cần ai nhớ sửa chỗ thứ hai.
 *
 * Luật trong `@media` bị bỏ qua (chỉ nhận `CSSStyleRule` ở tầng ngoài) — cố ý: ảnh xuất ra phải
 * giống nhau bất kể cửa sổ trình duyệt đang rộng bao nhiêu lúc bấm nút.
 *
 * Trả `null` khi `viewBox` không đọc được — không đoán một khổ mặc định, vì đoán sai là ảnh méo.
 */
export function chartSvgUrl(copy: SVGSVGElement): string | null {
  const size = viewBoxSize(copy);
  if (size === null) return null;

  const self = copy.cloneNode(true) as SVGSVGElement;

  /*
   * Bỏ lớp của chính thẻ `<svg>`: `.svg` khai `width: 100%` và `aspect-ratio`, tức luật BỐ CỤC
   * trên trang. Trong một tài liệu ảnh đứng một mình thì khổ phải đến từ `width`/`height` thật,
   * còn `width: 100%` ở đó là 100% của chính nó — một vòng luẩn quẩn.
   */
  self.removeAttribute('class');
  self.setAttribute('width', String(size.w * SCALE));
  self.setAttribute('height', String(size.h * SCALE));

  const style = self.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = harvestCss(self);
  self.insertBefore(style, self.firstChild);

  const text = new XMLSerializer().serializeToString(self);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
}

/** Nạp data URL thành ảnh đã sẵn sàng vẽ lên canvas. */
export async function chartImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => {
      resolve();
    };
    image.onerror = () => {
      reject(new Error('Không nạp được ảnh biểu đồ.'));
    };
  });

  return image;
}

/** Bề ngang và bề cao theo `viewBox`. `null` khi thuộc tính thiếu hoặc hỏng. */
function viewBoxSize(copy: SVGSVGElement): { w: number; h: number } | null {
  const parts = (copy.getAttribute('viewBox') ?? '')
    .trim()
    .split(/[\s,]+/)
    .map(Number);

  const w = parts[2];
  const h = parts[3];
  if (w === undefined || h === undefined) return null;
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;

  return { w, h };
}

/** Gom các luật CSS mà bản chép cần, từ chính stylesheet trang đang dùng. */
function harvestCss(copy: SVGSVGElement): string {
  const classes = new Set<string>();
  for (const node of copy.querySelectorAll('[class]')) {
    for (const name of node.classList) classes.add(name);
  }

  /*
   * Chữ trong SVG thừa kế `font-family` từ `<body>` khi ở trên trang; tài liệu ảnh không có
   * `<body>` nào để thừa kế, nên phải nói thẳng. `--font-sans` đến từ khối `:root` bốc ngay dưới.
   */
  const out = ['svg{font-family:var(--font-sans)}'];

  const sheets = document.styleSheets;
  for (let i = 0; i < sheets.length; i += 1) {
    const sheet = sheets[i];
    if (sheet === undefined) continue;

    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      // Stylesheet khác nguồn — trình duyệt không cho đọc. Bỏ qua, không phải lỗi.
      continue;
    }

    for (let j = 0; j < rules.length; j += 1) {
      const rule = rules[j];
      if (!(rule instanceof CSSStyleRule)) continue;

      const selector = rule.selectorText;
      const canDung =
        selector === ':root' || [...classes].some((name) => selector.includes(`.${name}`));
      if (canDung) out.push(rule.cssText);
    }
  }

  return out.join('\n');
}

/**
 * Đổi tên mọi `id` trong bản chép, và sửa theo mọi chỗ trỏ tới chúng.
 *
 * Bắt buộc, không phải dọn dẹp cho gọn: `<pattern>` (vùng gạch chéo) và `<linearGradient>` (dải
 * tô dưới đường) được tham chiếu bằng `url(#id)`, mà `id` phải duy nhất trong CẢ tài liệu. Bản
 * chép nằm trong vùng in của cùng trang ấy, nên không đổi tên là hai node trùng `id`; trình duyệt
 * lấy node ĐẦU trong thứ tự tài liệu — bản trên trang. Trên màn hình không thấy gì sai, nhưng
 * `.print-region` ẩn hẳn phần còn lại lúc in, nên node được trỏ tới lại là node đang bị ẩn.
 *
 * Đây đúng là lý do `ChartBody` gắn hậu tố `-full` cho bản phóng to; bản chép là bản THỨ BA.
 *
 * Quét MỌI thuộc tính chứ không chỉ `fill`/`stroke`: `clip-path`, `mask`, `filter` và `marker-*`
 * đều mang `url(#…)`, và danh sách viết tay sẽ thiếu đúng cái được thêm vào ngày mai.
 */
function renameIds(copy: SVGSVGElement): void {
  const renamed = new Map<string, string>();

  for (const node of copy.querySelectorAll('[id]')) {
    const from = node.id;
    if (from === '') continue;
    const to = `${from}-xuat`;
    renamed.set(from, to);
    node.id = to;
  }

  if (renamed.size === 0) return;

  for (const node of copy.querySelectorAll('*')) {
    for (const attr of node.attributes) {
      const next = replaceRefs(attr.value, renamed);
      if (next !== attr.value) node.setAttribute(attr.name, next);
    }
  }
}

/** Thay mọi `url(#cũ)` trong một giá trị thuộc tính bằng tên mới. */
function replaceRefs(value: string, renamed: ReadonlyMap<string, string>): string {
  if (!value.includes('url(#')) return value;

  return value.replace(/url\(#([^)"']+)\)/g, (whole, id: string) => {
    const to = renamed.get(id);
    return to === undefined ? whole : `url(#${to})`;
  });
}
