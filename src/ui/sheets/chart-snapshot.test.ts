// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';

import { chartSvgUrl, cloneChartSvg } from './chart-snapshot';

/**
 * Bản chép hình biểu đồ cho file xuất.
 *
 * Test dựng DOM bằng tay chứ không render cả cây biểu đồ thật: thứ đang kiểm là phép chép node,
 * và một `<svg>` viết tay nói rõ ĐÚNG những gì phép chép phải xử lý — hai bản cùng công thức
 * (trên trang và phóng to), `url(#…)` trỏ vào `<defs>`, và mấy node chỉ phục vụ chuột.
 * Buộc phải qua `ChartBody` thì mỗi lần đổi renderer là mỗi lần ca kiểm này đỏ oan.
 */

/** Hình như `LineChart` dựng: có `<defs>` được trỏ tới, có vùng bắt sự kiện, có dấu giá trị. */
function trang(idBase: string): string {
  return `
    <svg data-chart-svg="${idBase}" viewBox="0 0 320 200">
      <defs>
        <pattern id="${idBase}-hatch"><line /></pattern>
        <linearGradient id="${idBase}-area"><stop /></linearGradient>
      </defs>
      <rect class="gap" fill="url(#${idBase}-hatch)" />
      <path class="area" fill="url(#${idBase}-area)" d="M0 0" />
      <path class="line" d="M0 0" />
      <rect data-testid="${idBase}-hover-capture" />
      <g data-testid="${idBase}-hover"><line /></g>
      <g data-testid="chart-marker"><circle /></g>
    </svg>`;
}

afterEach(() => {
  document.body.innerHTML = '';
  for (const sheet of document.head.querySelectorAll('style')) sheet.remove();
});

/** Nạp một stylesheet vào trang, đúng chỗ `harvestCss` đi bốc luật. */
function dungStylesheet(css: string): void {
  const node = document.createElement('style');
  node.textContent = css;
  document.head.append(node);
}

/** Giải ngược data URL để đọc lại chuỗi SVG bên trong. */
function giaiMa(url: string): string {
  return decodeURIComponent(url.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
}

describe('cloneChartSvg()', () => {
  it('chép đúng hình trên trang, không lấy bản phóng to', () => {
    document.body.innerHTML = `${trang('chart-pe')}${trang('chart-pe-full')}`;

    const copy = cloneChartSvg('pe');

    expect(copy).not.toBeNull();
    // `-full` là bản phóng to; nó rời khỏi DOM khi lớp phủ đóng nên không được là thứ đi vào file.
    expect(copy?.querySelector('pattern')?.id).toBe('chart-pe-hatch-xuat');
  });

  it('công thức không có biểu đồ thì trả null chứ không dựng khung rỗng', () => {
    document.body.innerHTML = trang('chart-pe');

    expect(cloneChartSvg('roe')).toBeNull();
  });

  it('bỏ vùng bắt sự kiện và vệt dò, giữ dấu giá trị hiện tại', () => {
    document.body.innerHTML = trang('chart-pe');

    const copy = cloneChartSvg('pe');

    expect(copy?.querySelector('[data-testid$="-hover-capture"]')).toBeNull();
    expect(copy?.querySelector('[data-testid$="-hover"]')).toBeNull();
    // Dấu này LÀ con số công thức đang trả về, không phải trang trí theo con trỏ.
    expect(copy?.querySelector('[data-testid="chart-marker"]')).not.toBeNull();
  });

  it('đổi tên mọi id và sửa theo mọi chỗ url(#…) trỏ tới', () => {
    document.body.innerHTML = trang('chart-pe');

    const copy = cloneChartSvg('pe');

    expect(copy?.querySelector('linearGradient')?.id).toBe('chart-pe-area-xuat');
    expect(copy?.querySelector('.gap')?.getAttribute('fill')).toBe('url(#chart-pe-hatch-xuat)');
    expect(copy?.querySelector('.area')?.getAttribute('fill')).toBe('url(#chart-pe-area-xuat)');
  });

  it('không đụng vào hình gốc trên trang', () => {
    document.body.innerHTML = trang('chart-pe');
    cloneChartSvg('pe');

    const live = document.querySelector('svg[data-chart-svg="chart-pe"]');
    expect(live?.querySelector('pattern')?.id).toBe('chart-pe-hatch');
    expect(live?.querySelector('[data-testid="chart-pe-hover-capture"]')).not.toBeNull();
  });

  it('bản chép không còn mang dấu tìm kiếm — chụp lần hai vẫn lấy hình đang sống', () => {
    document.body.innerHTML = trang('chart-pe');

    const first = cloneChartSvg('pe');
    expect(first?.hasAttribute('data-chart-svg')).toBe(false);

    /*
     * Đặt bản chép vào chính tài liệu ấy — đúng cảnh vùng in đang làm. Không gỡ dấu thì
     * `querySelector` của lần sau lấy node ĐẦU trong thứ tự tài liệu; tuỳ vị trí vùng in mà đó
     * có thể là bản chép cũ, và file xuất đóng băng ở hình của lần trước.
     */
    if (first !== null) document.body.prepend(first);
    const second = cloneChartSvg('pe');

    expect(second?.querySelector('[data-testid="chart-pe-hover-capture"]')).toBeNull();
    expect(second?.querySelector('pattern')?.id).toBe('chart-pe-hatch-xuat');
  });
});

/**
 * Nửa PNG: bản chép phải TỰ CHỨA, vì ảnh nạp qua `<img>` là một tài liệu riêng, không thấy
 * stylesheet nào của trang.
 */
describe('chartSvgUrl()', () => {
  const PALETTE = `
    :root { --color-accent: #1d4ed8; --font-sans: Arial, sans-serif; }
    [data-theme='dark'] { --color-accent: #8ab4f8; }
    .line { stroke: var(--color-accent); }
    .khong-lien-quan { color: #ff00ff; }
  `;

  function hinh(): SVGSVGElement {
    document.body.innerHTML = trang('chart-pe');
    const copy = cloneChartSvg('pe');
    if (copy === null) throw new Error('không chép được hình mẫu');
    return copy;
  }

  it('nhúng luật của lớp bản chép đang dùng vào chính file SVG', () => {
    dungStylesheet(PALETTE);

    const svg = giaiMa(chartSvgUrl(hinh()) ?? '');

    expect(svg).toContain('stroke: var(--color-accent)');
    // Luật không liên quan tới lớp nào trong hình thì không đi theo — file xuất không phải bãi rác.
    expect(svg).not.toContain('#ff00ff');
  });

  it('luôn lấy bảng SÁNG, kể cả khi trang đang ở giao diện tối', () => {
    dungStylesheet(PALETTE);
    document.documentElement.dataset.theme = 'dark';

    const svg = giaiMa(chartSvgUrl(hinh()) ?? '');

    /*
     * Đây là bất biến quan trọng nhất của cả module: file xuất luôn nền sáng. Nó đúng theo CẤU
     * TẠO chứ không theo một cờ ai đó phải nhớ bật — khối `[data-theme='dark']` không phải
     * `:root` nên không bao giờ được bốc.
     */
    expect(svg).toContain('#1d4ed8');
    expect(svg).not.toContain('#8ab4f8');

    delete document.documentElement.dataset.theme;
  });

  it('nói rõ font-family — tài liệu ảnh không có <body> nào để thừa kế', () => {
    dungStylesheet(PALETTE);

    expect(giaiMa(chartSvgUrl(hinh()) ?? '')).toContain('font-family:var(--font-sans)');
  });

  it('đặt khổ thật theo viewBox và bỏ lớp bố cục của thẻ svg', () => {
    const url = chartSvgUrl(hinh());
    const svg = giaiMa(url ?? '');

    // 320×200 nhân 3 — xem hằng SCALE.
    expect(svg).toContain('width="960"');
    expect(svg).toContain('height="600"');
  });

  it('viewBox hỏng thì trả null chứ không đoán một khổ mặc định', () => {
    const copy = hinh();
    copy.setAttribute('viewBox', '0 0 0 rất-rộng');

    expect(chartSvgUrl(copy)).toBeNull();
  });
});
