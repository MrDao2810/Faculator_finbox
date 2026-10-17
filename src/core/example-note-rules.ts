/**
 * Tầng DOMAIN — luật của hàng "Đọc kết quả" trong khối Ví dụ thực tế (`example.note`).
 *
 * Chủ dự án (16/10/2026) khoanh hàng này ở `ddm-hai-giai-doan`: _"cách đọc kết quả đang sai và rất
 * khó hiểu. rà xoát lại toàn bộ câu ví dụ thực tế để sửa những lỗi đọc kết quả như này"_. Đoạn ấy
 * sai bốn chỗ cùng lúc: không đọc con số 43.845 ₫ (thấp hơn thị giá 72.700 ₫ khoảng 40%), câu đầu
 * nhắc lại nguồn của g đã có ở hàng Thay số, dùng chữ màn không định nghĩa ("giá trị cuối kỳ"), và
 * một phép so độ nhạy NGƯỢC với `calc`. Đo trên 111 đoạn: khoảng 40 đoạn chỉ tả cơ chế công thức mà
 * không đọc con số của ví dụ, 46 đoạn có gạch ngang dài, và khoảng 15 đoạn mang số hay khẳng định sai
 * mà `formulas/REVIEW-2.md` đã bắt từ 17/09/2026.
 *
 * Chủ dự án chọn khuôn của mục "Cách đọc kết quả" (`how-to-read-rules.ts`), áp vào ĐÚNG con số của
 * ví dụ: câu đầu đặt kết quả cạnh một mốc ("So với thị giá 72.700 ₫ của FPT: …"), câu thứ hai (nếu
 * có) chỉ dành cho một lưu ý làm đổi cách đọc con số ấy. Khác mục kia ở một điểm: ở đây con số cụ
 * thể là chính nội dung, nên không có luật hạn chế số.
 *
 * 1. Mở đầu "So với " / "Compared with ", câu đầu có đúng một ":" tách mốc khỏi phần đọc, và mốc
 *    không kết bằng chữ số (cùng lý do "1:" ở `how-to-read-rules.ts`).
 * 2. Tối đa hai câu, kết bằng dấu chấm, không ";" hay xuống dòng.
 * 3. Độ dài có trần và sàn.
 * 4. Không gạch ngang dài.
 * 5. Không tự trỏ vào khối ví dụ hay phần khác của màn.
 * 6. Không tả cơ chế bằng chữ chuyên môn ("mẫu số", "tử số", "đầu vào", "tham số").
 * 7. Không chữ in hoa để nhấn. Viết tắt hợp lệ là bảng của `how-to-read-rules.ts`, cộng mọi chữ in
 *    hoa đã có trong tiêu đề hay dòng nguồn của chính ví dụ (mã cổ phiếu, tên quỹ, mã hợp đồng).
 * 8. Không ra lệnh mua/bán.
 * 9. Bản tiếng Anh không lẫn chữ tiếng Việt.
 *
 * Luật KHÔNG thấy được: con số trong câu có đúng với `calc` và với nguồn hay không, và câu đầu có
 * thật sự đọc kết quả hay không. Lượt viết lại 16/10/2026 kiểm hai việc ấy bằng chạy lại `calc` và
 * một lượt soát đối kháng; đoạn mới cũng phải làm vậy.
 */

import { RA_LENH, CHU_VIET, coTen } from './when-to-use-rules';
import { CACH_DOC_MO_DAU, TEN_CO_SO, TU_IN_HOA, VIET_TAT } from './how-to-read-rules';
import type { Bilingual } from './types';

/** Luật 3. Câu mốc mang thêm con số cụ thể nên dài hơn trần 260/340 của mục "Cách đọc kết quả". */
export const DOC_VI_DU_TOI_DA = { vi: 320, en: 400 } as const;

/** Luật 3, sàn. */
export const DOC_VI_DU_TOI_THIEU = 60;

/** Viết tắt dùng được riêng ở hàng này: tên quỹ, chỉ số, cơ quan và khoản mục báo cáo. */
const VIET_TAT_VI_DU: ReadonlySet<string> = new Set([
  'CPI',
  'GDP',
  'ESOP',
  'VSDC',
  'ATC',
  'ATO',
  'LNST',
  'TNDN',
  'TNCN',
  'BCTC',
  'VESAF',
  'ATR',
]);

const KET_CAU = /[.!?](?=\s)/;
const GACH_DAI = /[–—]/;

const TU_TRO: Readonly<Record<'vi' | 'en', RegExp>> = {
  vi: /(ví dụ|trên màn|bên dưới|phía dưới|bên trên|phía trên|biểu đồ|thay số)/i,
  // "above"/"below" KHÔNG cấm: trong câu so sánh chúng là "cao hơn"/"thấp hơn", không phải vị trí.
  en: /\b(example|on (?:the )?screen|chart)\b/i,
};

const CO_CHE: Readonly<Record<'vi' | 'en', RegExp>> = {
  vi: /(mẫu số|tử số|đầu vào|tham số)/i,
  en: /\b(numerator|denominator|input to|input for|parameter)\b/i,
};

const MOC_KET_BANG_SO = /\d$/;

export interface DocViDuInput {
  id: string;
  name: Bilingual;
  /** Tiêu đề và dòng nguồn của ví dụ: chữ in hoa có ở đó (mã, tên quỹ) thì dùng được ở đây. */
  title: Bilingual;
  source?: Bilingual;
  note: Bilingual;
}

/** Mọi chỗ một đoạn "Đọc kết quả" của ví dụ lệch khuôn. Rỗng là đạt. */
export function exampleNoteProblems({ id, name, title, source, note }: DocViDuInput): string[] {
  const loi: string[] = [];

  for (const ngon of ['vi', 'en'] as const) {
    const doan = note[ngon];
    const nhan = `${id}.${ngon}`;
    const nen = `${title[ngon]} ${source?.[ngon] ?? ''} ${name[ngon]}`;

    if (!doan.startsWith(CACH_DOC_MO_DAU[ngon])) {
      loi.push(`${nhan}: phải mở đầu bằng "${CACH_DOC_MO_DAU[ngon]}"`);
    }
    if (!doan.endsWith('.')) loi.push(`${nhan}: phải kết thúc bằng dấu chấm`);

    const cau = doan.slice(0, -1).split(KET_CAU);
    if (cau.length > 2) loi.push(`${nhan}: ${String(cau.length)} câu, tối đa 2`);
    if (/[;\n]/.test(doan)) loi.push(`${nhan}: không dùng ";" hay xuống dòng`);
    const haiCham = (doan.match(/:/g) ?? []).length;
    if (haiCham !== 1 || !(cau[0] ?? '').includes(':')) {
      loi.push(`${nhan}: câu đầu phải có đúng một ":" tách mốc so sánh khỏi phần đọc`);
    }

    const viTri = doan.indexOf(':');
    if (viTri !== -1) {
      const moc = doan.slice(CACH_DOC_MO_DAU[ngon].length, viTri).trim();
      if (MOC_KET_BANG_SO.test(moc)) {
        loi.push(`${nhan}: mốc "${moc}" kết bằng chữ số — đặt đơn vị hay danh từ SAU con số`);
      }
    }

    if (doan.length > DOC_VI_DU_TOI_DA[ngon]) {
      loi.push(`${nhan}: dài ${String(doan.length)} ký tự, trần ${String(DOC_VI_DU_TOI_DA[ngon])}`);
    }
    if (doan.length < DOC_VI_DU_TOI_THIEU) {
      loi.push(`${nhan}: ngắn ${String(doan.length)} ký tự, sàn ${String(DOC_VI_DU_TOI_THIEU)}`);
    }
    if (GACH_DAI.test(doan)) loi.push(`${nhan}: có gạch ngang dài (— hoặc –)`);

    const tro = TU_TRO[ngon].exec(doan);
    if (tro !== null)
      loi.push(`${nhan}: tự trỏ vào khối ví dụ hay phần khác của màn ("${tro[0]}")`);
    const coChe = CO_CHE[ngon].exec(doan);
    if (coChe !== null) loi.push(`${nhan}: tả cơ chế bằng chữ chuyên môn ("${coChe[0]}")`);

    for (const tu of doan.replace(TEN_CO_SO, '').match(TU_IN_HOA) ?? []) {
      if (!VIET_TAT.has(tu) && !VIET_TAT_VI_DU.has(tu) && !coTen(nen, tu)) {
        loi.push(`${nhan}: chữ in hoa để nhấn ("${tu}")`);
      }
    }

    for (const mau of RA_LENH[ngon]) {
      const lenh = mau.exec(doan);
      if (lenh !== null) loi.push(`${nhan}: ra lệnh mua/bán ("${lenh[0]}")`);
    }
  }

  if (CHU_VIET.test(note.en)) loi.push(`${id}.en: lẫn chữ tiếng Việt`);

  return loi;
}

/** Hai ví dụ không được dùng chung một đoạn "Đọc kết quả". */
export function exampleNoteDuplicates(items: ReadonlyArray<DocViDuInput>): string[] {
  const loi: string[] = [];
  for (const ngon of ['vi', 'en'] as const) {
    const gap = new Map<string, string>();
    for (const item of items) {
      const khoa = item.note[ngon].trim().toLowerCase();
      const truoc = gap.get(khoa);
      if (truoc !== undefined) loi.push(`${item.id}.${ngon}: trùng nguyên đoạn với ${truoc}`);
      else gap.set(khoa, item.id);
    }
  }
  return loi;
}
