/**
 * Vẽ một `ExportDocument` thành file PDF A4 bằng pdf-lib (17/11/2026).
 *
 * Không đụng DOM: nhận sẵn byte của font và ảnh, trả byte của file — nên chạy được trong vitest
 * (môi trường node) với font thật. Việc chụp ảnh, tải font và lưu file thuộc `xuat-pdf.ts`.
 *
 * Module này chỉ được nạp bằng `import()` trần lúc bấm "Xuất PDF": pdf-lib + fontkit nặng vài trăm
 * kB, không được vào First Load JS (NFR-PER-04).
 *
 * ── Font ──
 * Noto Sans (thường + đậm) có đủ dấu tiếng Việt và chữ Hy Lạp, nhưng THIẾU một số ký hiệu toán
 * (√ ≈ ≤ Σ ⌊ ⌋ →). Ký tự nào font chính không có thì vẽ bằng Noto Sans Math — chia mỗi dòng thành
 * từng đoạn theo font có glyph (`chiaDoan`). Font toán chỉ cần khi tài liệu thật sự có ký tự ấy.
 * Xem `vePdf()` về chuyện tắt bước ghép glyph để chữ trong file copy và tìm kiếm được.
 *
 * ── Màu ──
 * Luôn bảng sáng, như file xuất trước đây: file là tài liệu đứng riêng, không theo giao diện tối.
 */

import { PDFDocument, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import * as fontkitNs from '@pdf-lib/fontkit';

import type { ExportBlock, ExportColumn, ExportDocument } from '@/application';

/** Gói ES của fontkit chỉ có `export default`; bản CJS (vitest) có cả hai. */
type Fontkit = typeof fontkitNs;
const fontkit: Fontkit = (fontkitNs as unknown as { default?: Fontkit }).default ?? fontkitNs;

export interface PdfFontBytes {
  regular: Uint8Array;
  bold: Uint8Array;
  /** Chỉ cần khi tài liệu có ký tự font chính không vẽ được (`canFontToan`). */
  math?: Uint8Array;
}

export interface PdfImage {
  png: Uint8Array;
  /** Kích thước HIỂN THỊ (đơn vị tuỳ ý, chỉ tỷ lệ là quan trọng) — ảnh chụp thường ở ×3. */
  width: number;
  height: number;
}

export interface PdfImages {
  formula?: PdfImage | null;
  chart?: PdfImage | null;
}

/* ── Khổ giấy ─────────────────────────────────────────────────────────────── */
const A4: [number, number] = [595.28, 841.89];
const LE = 42;
const LE_DUOI = 54;
const RONG = A4[0] - LE * 2;

/** Các tính năng OpenType bị tắt khi dựng chữ — xem lý do ở `vePdf()`. */
const KHONG_GHEP = {
  ccmp: false,
  locl: false,
  mark: false,
  mkmk: false,
  liga: false,
  rlig: false,
  calt: false,
  kern: false,
};

const MAU = {
  ink: rgb(0.067, 0.094, 0.153),
  muted: rgb(0.294, 0.333, 0.388),
  accent: rgb(0.114, 0.306, 0.847),
  border: rgb(0.78, 0.8, 0.84),
  headFill: rgb(0.945, 0.953, 0.965),
  resultFill: rgb(0.937, 0.965, 1),
  quoteBar: rgb(0.75, 0.8, 0.9),
  warnFill: rgb(1, 0.973, 0.906),
  warnBorder: rgb(0.89, 0.78, 0.5),
};

/** Chiều cao tối đa của hình biểu đồ trong file, điểm. */
const CAO_BIEU_DO = 320;

/** Khổ vẽ của một ảnh: vừa bề ngang trang, không cao quá `maxH`, giữ tỷ lệ. */
function khoAnh(img: PdfImage, maxH: number): { w: number; h: number } {
  const ratio = img.height / img.width;
  let w = Math.min(RONG, img.width);
  let h = w * ratio;
  if (h > maxH) {
    h = maxH;
    w = h / ratio;
  }
  return { w, h };
}

/** Chữ của mọi khối, để quyết định có cần nạp font toán không. */
export function chuCuaTaiLieu(doc: ExportDocument): string {
  const parts: string[] = [doc.title];
  for (const b of doc.blocks) {
    switch (b.kind) {
      case 'formula':
        parts.push(b.fallback, ...b.expression);
        break;
      case 'result':
        parts.push(b.label, b.value);
        break;
      case 'table':
        parts.push(...b.columns.map((c) => c.title));
        for (const row of b.rows) parts.push(...row);
        break;
      case 'choice':
        parts.push(b.key, b.text);
        break;
      case 'chart':
        if (b.title !== undefined) parts.push(b.title);
        break;
      default:
        parts.push(b.text);
    }
  }
  return parts.join('\n');
}

/** Tài liệu có ký tự mà font chính không có glyph → cần nạp font toán. */
export function canFontToan(doc: ExportDocument, regular: Uint8Array): boolean {
  const font = fontkit.create(regular);
  for (const ch of chuCuaTaiLieu(doc)) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp < 32) continue;
    if (!font.hasGlyphForCodePoint(cp)) return true;
  }
  return false;
}

interface BoFont {
  regular: PDFFont;
  bold: PDFFont;
  math: PDFFont | null;
  /** Bảng glyph của font chính / font toán, để chia đoạn. */
  coChinh: (cp: number) => boolean;
  coToan: (cp: number) => boolean;
}

interface Doan {
  text: string;
  font: PDFFont;
}

/** Chia một dòng thành các đoạn liền nhau cùng font. */
function chiaDoan(text: string, chinh: PDFFont, fonts: BoFont): Doan[] {
  const out: Doan[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    const font = fonts.coChinh(cp) || fonts.math === null || !fonts.coToan(cp) ? chinh : fonts.math;
    const cuoi = out[out.length - 1];
    if (cuoi !== undefined && cuoi.font === font) cuoi.text += ch;
    else out.push({ text: ch, font });
  }
  return out;
}

function doRong(text: string, chinh: PDFFont, size: number, fonts: BoFont): number {
  let w = 0;
  for (const d of chiaDoan(text, chinh, fonts)) w += d.font.widthOfTextAtSize(d.text, size);
  return w;
}

/** Ngắt một đoạn chữ thành các dòng vừa `maxW`. Từ dài hơn cả dòng thì cắt theo ký tự. */
function ngatDong(
  text: string,
  chinh: PDFFont,
  size: number,
  maxW: number,
  fonts: BoFont,
): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(/ +/).filter((w) => w.length > 0);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let cur = '';
    for (const word of words) {
      const thu = cur.length === 0 ? word : `${cur} ${word}`;
      if (doRong(thu, chinh, size, fonts) <= maxW) {
        cur = thu;
        continue;
      }
      if (cur.length > 0) lines.push(cur);
      if (doRong(word, chinh, size, fonts) <= maxW) {
        cur = word;
        continue;
      }
      // Từ quá dài (đường dẫn, chuỗi số): cắt theo ký tự.
      cur = '';
      for (const ch of word) {
        if (cur.length > 0 && doRong(cur + ch, chinh, size, fonts) > maxW) {
          lines.push(cur);
          cur = ch;
        } else cur += ch;
      }
    }
    if (cur.length > 0) lines.push(cur);
  }
  return lines;
}

class BoDan {
  private page: PDFPage;
  private y: number;
  readonly pages: PDFPage[] = [];

  constructor(
    private readonly pdf: PDFDocument,
    readonly fonts: BoFont,
  ) {
    this.page = this.trangMoi();
    this.y = A4[1] - LE;
  }

  private trangMoi(): PDFPage {
    const p = this.pdf.addPage(A4);
    this.pages.push(p);
    this.y = A4[1] - LE;
    return p;
  }

  /** Bảo đảm còn `h` điểm chiều cao; không đủ thì sang trang. Trả về có sang trang không. */
  canCho(h: number): boolean {
    if (this.y - h < LE_DUOI) {
      this.page = this.trangMoi();
      return true;
    }
    return false;
  }

  khoang(h: number): void {
    if (this.y < A4[1] - LE) this.y -= h;
  }

  /** Viết một dòng chữ tại `x`, đường chân chữ cách đỉnh dòng `size`. */
  private vietDong(
    text: string,
    x: number,
    top: number,
    font: PDFFont,
    size: number,
    color: RGB,
  ): void {
    let cx = x;
    for (const d of chiaDoan(text, font, this.fonts)) {
      this.page.drawText(d.text, { x: cx, y: top - size, size, font: d.font, color });
      cx += d.font.widthOfTextAtSize(d.text, size);
    }
  }

  doanVan(
    text: string,
    opts: { font?: PDFFont; size?: number; color?: RGB; indent?: number; leading?: number } = {},
  ): void {
    const font = opts.font ?? this.fonts.regular;
    const size = opts.size ?? 10.5;
    const indent = opts.indent ?? 0;
    const lh = size * (opts.leading ?? 1.45);
    for (const line of ngatDong(text, font, size, RONG - indent, this.fonts)) {
      this.canCho(lh);
      this.vietDong(line, LE + indent, this.y - (lh - size) / 2, font, size, opts.color ?? MAU.ink);
      this.y -= lh;
    }
  }

  /** @param giuCung chiều cao khối ngay sau, phải nằm cùng trang với tiêu đề (mặc định vài dòng). */
  tieuDeMuc(text: string, giuCung = 40): void {
    this.khoang(14);
    this.canCho(20 + giuCung); // tiêu đề không bao giờ đứng trơ cuối trang, tách khỏi nội dung của nó
    this.doanVan(text, { font: this.fonts.bold, size: 13, color: MAU.accent, leading: 1.3 });
    this.page.drawLine({
      start: { x: LE, y: this.y + 1 },
      end: { x: LE + RONG, y: this.y + 1 },
      thickness: 0.6,
      color: MAU.border,
    });
    this.y -= 6;
  }

  tieuDePhu(text: string): void {
    this.khoang(6);
    this.canCho(36);
    this.doanVan(text, { font: this.fonts.bold, size: 11, leading: 1.35 });
    this.y -= 1;
  }

  trichDan(text: string): void {
    const size = 9.5;
    const lh = size * 1.45;
    const lines = ngatDong(text, this.fonts.regular, size, RONG - 12, this.fonts);
    for (const line of lines) {
      this.canCho(lh);
      this.page.drawRectangle({ x: LE, y: this.y - lh, width: 2, height: lh, color: MAU.quoteBar });
      this.vietDong(line, LE + 10, this.y - (lh - size) / 2, this.fonts.regular, size, MAU.muted);
      this.y -= lh;
    }
  }

  ketQua(label: string, value: string): void {
    const pad = 8;
    const lines = ngatDong(value, this.fonts.bold, 15, RONG - pad * 2 - 70, this.fonts);
    const h = pad * 2 + Math.max(1, lines.length) * 15 * 1.3;
    this.khoang(4);
    this.canCho(h);
    const top = this.y;
    this.page.drawRectangle({
      x: LE,
      y: top - h,
      width: RONG,
      height: h,
      color: MAU.resultFill,
      borderColor: MAU.accent,
      borderWidth: 0.8,
    });
    this.vietDong(label, LE + pad, top - pad - 3, this.fonts.bold, 10.5, MAU.accent);
    let ly = top - pad;
    for (const line of lines) {
      const w = doRong(line, this.fonts.bold, 15, this.fonts);
      this.vietDong(line, LE + RONG - pad - w, ly, this.fonts.bold, 15, MAU.ink);
      ly -= 15 * 1.3;
    }
    this.y = top - h - 6;
  }

  anh(img: PdfImage, embed: Awaited<ReturnType<PDFDocument['embedPng']>>, maxH: number): void {
    const { w, h } = khoAnh(img, maxH);
    this.canCho(h + 8);
    this.page.drawImage(embed, { x: LE + (RONG - w) / 2, y: this.y - h, width: w, height: h });
    this.y -= h + 8;
  }

  bang(
    columns: ReadonlyArray<ExportColumn>,
    rows: ReadonlyArray<ReadonlyArray<string>>,
    boldLast = 0,
  ): void {
    const size = rows.length > 40 ? 8.5 : 9.5;
    const lh = size * 1.35;
    const padX = 4;
    const padY = 3.5;
    const tong = columns.reduce((s, c) => s + c.weight, 0);
    const widths = columns.map((c) => (RONG * c.weight) / tong);

    const veHang = (cells: ReadonlyArray<string>, font: PDFFont, fill: RGB | null): void => {
      const wrapped = cells.map((cell, i) =>
        ngatDong(cell, font, size, (widths[i] ?? 0) - padX * 2, this.fonts),
      );
      const h = padY * 2 + Math.max(1, ...wrapped.map((l) => l.length)) * lh;
      if (this.canCho(h) && fill === null)
        veHang(
          columns.map((c) => c.title),
          this.fonts.bold,
          MAU.headFill,
        );
      const top = this.y;
      let x = LE;
      wrapped.forEach((lines, i) => {
        const w = widths[i] ?? 0;
        this.page.drawRectangle({
          x,
          y: top - h,
          width: w,
          height: h,
          borderColor: MAU.border,
          borderWidth: 0.5,
          ...(fill === null ? {} : { color: fill }),
        });
        let ly = top - padY - (lh - size) / 2;
        for (const line of lines) {
          const tw = doRong(line, font, size, this.fonts);
          const lx = columns[i]?.align === 'right' ? x + w - padX - tw : x + padX;
          this.vietDong(line, lx, ly, font, size, MAU.ink);
          ly -= lh;
        }
        x += w;
      });
      this.y = top - h;
    };

    this.khoang(2);
    this.canCho(lh * 3 + padY * 4);
    veHang(
      columns.map((c) => c.title),
      this.fonts.bold,
      MAU.headFill,
    );
    rows.forEach((row, i) => {
      const dam = i >= rows.length - boldLast;
      veHang(row, dam ? this.fonts.bold : this.fonts.regular, null);
    });
    this.y -= 8;
  }

  mienTru(text: string): void {
    const size = 9.5;
    const pad = 8;
    const lines = ngatDong(text, this.fonts.bold, size, RONG - pad * 2, this.fonts);
    const h = pad * 2 + lines.length * size * 1.4;
    this.khoang(14);
    this.canCho(h);
    const top = this.y;
    this.page.drawRectangle({
      x: LE,
      y: top - h,
      width: RONG,
      height: h,
      color: MAU.warnFill,
      borderColor: MAU.warnBorder,
      borderWidth: 0.8,
    });
    let ly = top - pad;
    for (const line of lines) {
      this.vietDong(line, LE + pad, ly, this.fonts.bold, size, MAU.ink);
      ly -= size * 1.4;
    }
    this.y = top - h;
  }

  chanTrang(title: string): void {
    const n = this.pages.length;
    this.pages.forEach((p, i) => {
      const size = 8;
      const trai = `Faculator Finbox · ${title}`;
      const phai = `Trang ${i + 1}/${n}`;
      const wPhai = doRong(phai, this.fonts.regular, size, this.fonts);
      const maxTrai = RONG - wPhai - 16;
      let traiCat = trai;
      while (
        traiCat.length > 4 &&
        doRong(traiCat, this.fonts.regular, size, this.fonts) > maxTrai
      ) {
        traiCat = `${traiCat.slice(0, -2)}…`;
      }
      p.drawLine({
        start: { x: LE, y: LE_DUOI - 14 },
        end: { x: LE + RONG, y: LE_DUOI - 14 },
        thickness: 0.5,
        color: MAU.border,
      });
      const cu = this.page;
      this.page = p;
      this.vietDong(traiCat, LE, LE_DUOI - 18, this.fonts.regular, size, MAU.muted);
      this.vietDong(phai, LE + RONG - wPhai, LE_DUOI - 18, this.fonts.regular, size, MAU.muted);
      this.page = cu;
    });
  }
}

/** Dựng file PDF. */
export async function vePdf(
  doc: ExportDocument,
  fontBytes: PdfFontBytes,
  images: PdfImages = {},
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(doc.title);
  pdf.setCreator('Faculator Finbox');
  pdf.setProducer('Faculator Finbox');
  pdf.setLanguage('vi-VN');

  /*
   * Tắt các bước ghép glyph (`ccmp`, `mark`, `liga`…) của fontkit. Bật thì chữ vẫn VẼ đúng, nhưng
   * glyph sau khi ghép mang sai mã Unicode trong bảng ToUnicode, nên copy hay tìm kiếm trong file ra
   * ký tự loạn — đo 17/11/2026: "Nắm" chép ra "NBm", "vốn" ra "vઌn", cả khi nhúng nguyên font. Chữ
   * Việt ở đây luôn là dạng dựng sẵn (NFC, một glyph có sẵn trong font), nên không cần ghép gì.
   * Tắt rồi thì nhúng `subset` được: file chỉ mang những glyph đã dùng (~8 kB thay vì ~330 kB mỗi font).
   */
  const nhung = { subset: true, features: KHONG_GHEP };
  const regular = await pdf.embedFont(fontBytes.regular, nhung);
  const bold = await pdf.embedFont(fontBytes.bold, nhung);
  const math = fontBytes.math === undefined ? null : await pdf.embedFont(fontBytes.math, nhung);
  const fkChinh = fontkit.create(fontBytes.regular);
  const fkToan = fontBytes.math === undefined ? null : fontkit.create(fontBytes.math);
  const fonts: BoFont = {
    regular,
    bold,
    math,
    coChinh: (cp) => cp < 32 || fkChinh.hasGlyphForCodePoint(cp),
    coToan: (cp) => fkToan?.hasGlyphForCodePoint(cp) ?? false,
  };

  const formulaImg =
    images.formula === undefined || images.formula === null
      ? null
      : { img: images.formula, embed: await pdf.embedPng(images.formula.png) };
  const chartImg =
    images.chart === undefined || images.chart === null
      ? null
      : { img: images.chart, embed: await pdf.embedPng(images.chart.png) };

  const dan = new BoDan(pdf, fonts);
  doc.blocks.forEach((block, i) => {
    /*
     * Tiêu đề ngay trước hình biểu đồ phải sang trang CÙNG hình: hình cao tới 320 điểm, nên mức giữ
     * mặc định của tiêu đề để nó đứng trơ cuối trang còn hình nhảy sang trang sau (đo trên `capm`).
     */
    const sau = doc.blocks[i + 1];
    if (block.kind === 'heading' && sau?.kind === 'chart' && chartImg !== null) {
      // + một dòng tên hình (11pt × 1,35 + 2) khi có, để tên không tách khỏi ảnh của nó.
      const tenHinh = sau.title !== undefined && sau.title !== '' ? 18 : 0;
      dan.tieuDeMuc(block.text, khoAnh(chartImg.img, CAO_BIEU_DO).h + 8 + tenHinh);
      return;
    }
    veKhoi(dan, block, formulaImg, chartImg);
  });
  dan.chanTrang(doc.title);

  return pdf.save();
}

function veKhoi(
  dan: BoDan,
  block: ExportBlock,
  formulaImg: { img: PdfImage; embed: Awaited<ReturnType<PDFDocument['embedPng']>> } | null,
  chartImg: { img: PdfImage; embed: Awaited<ReturnType<PDFDocument['embedPng']>> } | null,
): void {
  const { fonts } = dan;
  switch (block.kind) {
    case 'title':
      dan.doanVan(block.text, { font: fonts.bold, size: 20, leading: 1.25 });
      dan.khoang(2);
      return;
    case 'subtitle':
      dan.doanVan(block.text, { size: 10.5, color: MAU.muted });
      return;
    case 'heading':
      dan.tieuDeMuc(block.text);
      return;
    case 'subheading':
      dan.tieuDePhu(block.text);
      return;
    case 'paragraph':
      if (block.tone === 'quote') dan.trichDan(block.text);
      else
        dan.doanVan(block.text, {
          ...(block.tone === 'strong' ? { font: fonts.bold } : {}),
          ...(block.tone === 'muted' ? { color: MAU.muted, size: 10 } : {}),
        });
      dan.khoang(3);
      return;
    case 'formula':
      if (formulaImg !== null) dan.anh(formulaImg.img, formulaImg.embed, 140);
      else dan.doanVan(block.fallback, { font: fonts.bold, size: 13, leading: 1.5 });
      for (const line of block.expression) dan.doanVan(line, { size: 10, color: MAU.muted });
      dan.khoang(4);
      return;
    case 'result':
      dan.ketQua(block.label, block.value);
      return;
    case 'table':
      dan.bang(block.columns, block.rows, block.boldLast ?? 0);
      return;
    case 'chart':
      // Tên hình đứng ngay trên ảnh, như tiêu đề `<figcaption>` trên màn: không có nó thì người đọc
      // không biết hình đang vẽ theo mục "Xem theo" nào.
      if (block.title !== undefined && block.title !== '') {
        dan.doanVan(block.title, { font: fonts.bold, size: 11, leading: 1.35 });
        dan.khoang(2);
      }
      if (chartImg !== null) dan.anh(chartImg.img, chartImg.embed, CAO_BIEU_DO);
      else dan.doanVan('Không chụp được hình biểu đồ.', { color: MAU.muted, size: 10 });
      return;
    case 'choice':
      dan.doanVan(`${block.key}) ${block.text}`, { indent: 14 });
      return;
    case 'disclaimer':
      dan.mienTru(block.text);
      return;
  }
}
