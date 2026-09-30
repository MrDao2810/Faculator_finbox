/**
 * Tầng DOMAIN — luật của mục "Cách đọc kết quả" (`explanation.howToRead`).
 *
 * Chủ dự án (30/09/2026) hỏi mục này "cần đọc như nào cho hợp lý". Đo trên 111 đoạn cũ:
 *
 * - 5 đoạn trích "ví dụ trên" bằng con số của ví dụ CŨ (CAPM ghi 13,1% trong khi màn hiện 11,92%);
 * - 5 đoạn phí và thuế chép số tính sẵn từ biểu phí, đúng điều `usesConstants` cấm;
 * - 13 đoạn không có câu nào dạy đọc con số, chỉ tả tính chất hay độ nhạy của công thức;
 * - khoảng 20 đoạn không nêu mốc so sánh nào ("P/E cao nghĩa là…" nhưng cao so với gì);
 * - 53 đoạn có gạch ngang dài, dài từ 75 tới 407 ký tự.
 *
 * Chủ dự án chọn khuôn "mốc so sánh + giá trị đặc biệt", và bỏ hẳn những câu bị cắt ra. Chữ đứng
 * yên trong khi con số đổi theo ô nhập, nên đoạn văn phải là một QUY TẮC đúng với mọi con số, không
 * phải lời tả một con số cụ thể. Con số của ví dụ đã có hàng "Đọc kết quả" riêng trong khối Ví dụ
 * thực tế.
 *
 * Mỗi luật dưới đây giữ một điều của khuôn ấy:
 *
 * 1. Mở đầu đúng "So với " / "Compared with ", và câu đầu có đúng một dấu ":" tách mốc khỏi phần
 *    "cao hơn nghĩa là…, thấp hơn nghĩa là…".
 * 2. Tối đa hai câu. Câu thứ hai chỉ dành cho giá trị dễ đọc sai (âm, 0, vượt 100%, làm tròn…).
 * 3. Độ dài có trần.
 * 4. Không gạch ngang dài (`—`, `–`): chủ dự án đã hai lần đọc nó thành dấu trừ.
 * 5. Không trỏ vào ví dụ, biểu đồ hay kết quả phụ: con số ở đó đổi, còn câu này thì không.
 * 6. Không tả cơ chế ("mẫu số", "tử số", "đầu vào", "tham số").
 * 7. Không mượn tên công thức KHÁC làm mốc. Tên của chính nó thì được.
 * 8. Chỉ các số 0, 1, 100: mốc toán học. Quy ước có tên (RSI 70/30) được miễn theo từng công thức ở
 *    `QUY_UOC`, kèm lý do. Ngưỡng tự đặt như "ROE trên 15%" thì không.
 * 9. Không chữ in hoa để nhấn ("MẤT", "NẾU").
 * 10. Không ra lệnh mua/bán (CON-11, FR-24), dùng chung mẫu với `when-to-use-rules.ts`.
 * 11. Bản tiếng Anh không lẫn chữ tiếng Việt.
 *
 * Luật KHÔNG thấy được: giá trị đặc biệt nêu ra có thật do `calc` trả về hay không. P/E âm chẳng
 * hạn thì `calc` từ chối và đã có cảnh báo riêng, nên câu "P/E âm nghĩa là…" sẽ không bao giờ khớp
 * màn hình. Việc ấy phải đọc `calc` mà đối chiếu bằng mắt.
 */

import type { Bilingual } from './types';
import { CHU_VIET, RA_LENH, TEN_CONG_THUC, coTen } from './when-to-use-rules';

export const CACH_DOC_MO_DAU = { vi: 'So với ', en: 'Compared with ' } as const;

/** Luật 3. Câu mốc so sánh ~180 ký tự, cộng một câu giá trị đặc biệt ngắn. */
export const CACH_DOC_TOI_DA = { vi: 260, en: 340 } as const;

/** Sàn: `prose-audit.test.ts` đòi mọi mục diễn giải dài hơn 40 ký tự; ở đây chặt hơn một chút. */
export const CACH_DOC_TOI_THIEU = 50;

/** Luật 2: dấu kết câu đứng giữa đoạn. */
const KET_CAU = /[.!?](?=\s)/;

/** Luật 4. */
const GACH_DAI = /[–—]/;

/** Luật 5. */
const TRO_VI_DU: Readonly<Record<'vi' | 'en', RegExp>> = {
  vi: /(ví dụ|trên màn|bên dưới|phía dưới|biểu đồ|kết quả phụ)/i,
  en: /\b(example|on (?:the )?screen|chart|secondary result)\b/i,
};

/** Luật 6. */
const CO_CHE: Readonly<Record<'vi' | 'en', RegExp>> = {
  vi: /(mẫu số|tử số|đầu vào|tham số)/i,
  en: /\b(numerator|denominator|input to|input for|parameter)\b/i,
};

/** Luật 8: mốc toán học dùng được ở mọi công thức. */
const SO_CHUNG: ReadonlySet<string> = new Set(['0', '1', '100']);

/**
 * Luật 8: quy ước có tên, miễn theo từng công thức. Thêm vào đây là một quyết định có ý thức: con
 * số phải là quy ước được dạy rộng rãi kèm chính chỉ báo ấy, không phải ngưỡng ai đó tự đặt.
 */
export const QUY_UOC: Readonly<Record<string, readonly string[]>> = {
  /* Wilder đặt 70 và 30 khi công bố RSI (1978); 50 là đường giữa của thang 0–100. */
  'rsi-wilder': ['70', '30', '50'],
  /* Lane đặt 80 và 20 cho %K; mọi phần mềm biểu đồ vẽ sẵn hai đường này. */
  'stochastic-k': ['80', '20'],
};

/** Tên riêng có chữ số, bỏ ra trước khi đếm số. */
const TEN_CO_SO = /VN30F?\w*|VN-?Index/gi;

const SO = /\d+(?:[.,]\d+)*/g;

/** Luật 9: viết tắt in hoa hợp lệ. Mọi từ in hoa khác (≥ 2 chữ) bị coi là chữ nhấn. */
const VIET_TAT: ReadonlySet<string> = new Set([
  ...TEN_CONG_THUC.filter((ten) => ten === ten.toUpperCase() && !ten.includes('/')),
  'VN',
  'VN30',
  'HOSE',
  'HNX',
  'NAV',
  'CCQ',
  'USD',
  'VND',
  'TPCP',
  'CP',
  'HĐ',
  'ETF',
  'DCA',
  'EAR',
  'ROC',
  'EBIT',
]);

const TU_IN_HOA = /(?<![\p{L}\p{N}])\p{Lu}[\p{Lu}\p{N}]+(?![\p{L}\p{N}])/gu;

export interface CachDocInput {
  id: string;
  name: Bilingual;
  howToRead: Bilingual;
}

/** Mọi chỗ một đoạn "Cách đọc kết quả" lệch khuôn. Rỗng là đạt. */
export function howToReadProblems({ id, name, howToRead }: CachDocInput): string[] {
  const loi: string[] = [];
  const quyUoc = new Set(QUY_UOC[id] ?? []);

  for (const ngon of ['vi', 'en'] as const) {
    const doan = howToRead[ngon];
    const nhan = `${id}.${ngon}`;

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

    if (doan.length > CACH_DOC_TOI_DA[ngon]) {
      loi.push(`${nhan}: dài ${String(doan.length)} ký tự, trần ${String(CACH_DOC_TOI_DA[ngon])}`);
    }
    if (doan.length < CACH_DOC_TOI_THIEU) {
      loi.push(`${nhan}: ngắn ${String(doan.length)} ký tự, sàn ${String(CACH_DOC_TOI_THIEU)}`);
    }
    if (GACH_DAI.test(doan)) loi.push(`${nhan}: có gạch ngang dài (— hoặc –)`);

    const viDu = TRO_VI_DU[ngon].exec(doan);
    if (viDu !== null) loi.push(`${nhan}: trỏ vào ví dụ hay biểu đồ ("${viDu[0]}")`);
    const coChe = CO_CHE[ngon].exec(doan);
    if (coChe !== null) loi.push(`${nhan}: tả cơ chế ("${coChe[0]}")`);

    for (const ten of TEN_CONG_THUC) {
      if (coTen(doan, ten) && !coTen(name.vi, ten) && !coTen(name.en, ten)) {
        loi.push(`${nhan}: mượn tên công thức khác ("${ten}")`);
      }
    }

    for (const so of doan.replace(TEN_CO_SO, '').match(SO) ?? []) {
      if (!SO_CHUNG.has(so) && !quyUoc.has(so)) {
        loi.push(`${nhan}: số "${so}" không phải mốc 0, 1, 100 hay quy ước có tên`);
      }
    }

    for (const tu of doan.replace(TEN_CO_SO, '').match(TU_IN_HOA) ?? []) {
      if (!VIET_TAT.has(tu) && !coTen(name.vi, tu) && !coTen(name.en, tu)) {
        loi.push(`${nhan}: chữ in hoa để nhấn ("${tu}")`);
      }
    }

    for (const mau of RA_LENH[ngon]) {
      const lenh = mau.exec(doan);
      if (lenh !== null) loi.push(`${nhan}: ra lệnh mua/bán ("${lenh[0]}")`);
    }
  }

  if (CHU_VIET.test(howToRead.en)) loi.push(`${id}.en: lẫn chữ tiếng Việt`);

  return loi;
}

/** Hai công thức không được dùng chung một đoạn — người đọc sẽ không phân biệt được chúng. */
export function howToReadDuplicates(items: ReadonlyArray<CachDocInput>): string[] {
  const loi: string[] = [];
  for (const ngon of ['vi', 'en'] as const) {
    const gap = new Map<string, string>();
    for (const item of items) {
      const khoa = item.howToRead[ngon].trim().toLowerCase();
      const truoc = gap.get(khoa);
      if (truoc !== undefined) loi.push(`${item.id}.${ngon}: trùng nguyên đoạn với ${truoc}`);
      else gap.set(khoa, item.id);
    }
  }
  return loi;
}
