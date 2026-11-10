import { laLinkDuLieuTho } from '../source-link';
import { CHU_VIET, RA_LENH } from '../when-to-use-rules';
import type { CauHoiThuongGap } from './types';

/**
 * Luật của khối "Câu hỏi thường gặp" — MỘT bộ, dùng cho cả `hoi-dap.test.ts` lẫn lúc soạn dữ liệu,
 * để công cụ soạn và cổng kiểm không bao giờ lệch nhau (cùng khuôn `viDuProblems()`).
 *
 * Máy chỉ thấy được nửa hình thức. Nửa còn lại — câu hỏi có thật ở link ấy không, có đúng công thức
 * không, câu trả lời có đúng với `calc` không — được kiểm bằng cách MỞ LẠI từng link, ở lượt phản
 * biện khi soạn. Câu mới phải được kiểm lại y như vậy.
 */

/** Trần độ dài, đo trên dữ liệu đợt đầu cộng khoảng dư. */
export const HOI_TOI_DA = { vi: 220, en: 280 } as const;
export const TRA_LOI_TOI_DA = { vi: 480, en: 620 } as const;

/** Gạch dài, gạch ngắn kiểu Word, và " - " đứng một mình: cạnh con số đều đọc thành dấu trừ. */
const GACH = /[–—]|\s-\s/;

/** Chuẩn hoá để so trùng: chữ thường, bỏ dấu câu, gộp khoảng trắng. */
export function chuanHoaHoi(text: string): string {
  return text
    .normalize('NFC')
    .toLocaleLowerCase('vi')
    .replace(/[?!.,;:"“”'‘’()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function loiLink(url: string, noi: string): string[] {
  const loi: string[] = [];
  let u: URL | undefined;
  try {
    u = new URL(url);
  } catch {
    return [`${noi}: link không đọc được "${url}"`];
  }
  if (u.protocol !== 'https:') loi.push(`${noi}: link phải là https "${url}"`);
  if (u.pathname === '/' && u.search === '' && u.hash === '')
    loi.push(`${noi}: link trỏ trang chủ, phải trỏ đúng chỗ có câu hỏi "${url}"`);
  if (laLinkDuLieuTho(url)) loi.push(`${noi}: link dữ liệu thô "${url}"`);
  return loi;
}

function loiChu(text: string, noi: string): string[] {
  const loi: string[] = [];
  if (text.trim() !== text) loi.push(`${noi}: thừa khoảng trắng đầu/cuối`);
  if (GACH.test(text)) loi.push(`${noi}: có gạch dài hoặc " - " (đọc thành dấu trừ)`);
  // Cụm cấm của sản phẩm (chữ "nhập" + "tay") đã có cổng chung trong `i18n.test.ts` quét mọi file.
  return loi;
}

/** Mọi lỗi của danh sách câu hỏi của MỘT công thức. Rỗng là đạt. */
export function hoiDapProblems(id: string, items: ReadonlyArray<CauHoiThuongGap>): string[] {
  const loi: string[] = [];
  const daThay = new Map<string, number>();
  const daThayGoc = new Map<string, number>();

  items.forEach((item, i) => {
    const o = `${id} #${String(i + 1)}`;

    for (const lang of ['vi', 'en'] as const) {
      const hoi = item.hoi[lang];
      if (hoi.trim() === '') {
        loi.push(`${o}: thiếu hoi.${lang}`);
        continue;
      }
      if (!hoi.endsWith('?')) loi.push(`${o}: hoi.${lang} phải kết thúc bằng "?"`);
      if (hoi.length > HOI_TOI_DA[lang])
        loi.push(`${o}: hoi.${lang} dài ${String(hoi.length)} > ${String(HOI_TOI_DA[lang])}`);
      loi.push(...loiChu(hoi, `${o} hoi.${lang}`));
    }
    if (CHU_VIET.test(item.hoi.en)) loi.push(`${o}: hoi.en còn chữ tiếng Việt có dấu`);

    if (item.tuSoan === true) {
      if (item.nguon !== undefined || item.nguyenVan !== undefined)
        loi.push(`${o}: câu tự soạn không có nguon / nguyenVan`);
      if (item.traLoi === undefined) loi.push(`${o}: câu tự soạn bắt buộc có traLoi`);
      if (item.nguonTraLoi !== undefined) loi.push(`${o}: câu tự soạn không có nguonTraLoi`);
    } else if (item.nguon === undefined || (item.nguyenVan ?? '').trim() === '') {
      loi.push(`${o}: câu thật phải có nguon và nguyenVan`);
    } else {
      loi.push(...loiLink(item.nguon.url, `${o} nguon`));
      if (item.nguon.ten.trim() === '') loi.push(`${o}: thiếu nguon.ten`);
      loi.push(...loiChu(item.nguon.ten, `${o} nguon.ten`));
    }

    if (item.traLoi !== undefined) {
      for (const lang of ['vi', 'en'] as const) {
        const tl = item.traLoi[lang];
        if (tl.trim() === '') {
          loi.push(`${o}: traLoi.${lang} rỗng (vắng thì bỏ hẳn traLoi)`);
          continue;
        }
        if (tl.length > TRA_LOI_TOI_DA[lang])
          loi.push(
            `${o}: traLoi.${lang} dài ${String(tl.length)} > ${String(TRA_LOI_TOI_DA[lang])}`,
          );
        loi.push(...loiChu(tl, `${o} traLoi.${lang}`));
        for (const mau of RA_LENH[lang])
          if (mau.test(tl)) loi.push(`${o}: traLoi.${lang} có lời khuyên mua/bán (${String(mau)})`);
      }
      if (CHU_VIET.test(item.traLoi.en)) loi.push(`${o}: traLoi.en còn chữ tiếng Việt có dấu`);
    } else if (item.nguonTraLoi !== undefined) {
      loi.push(`${o}: có nguonTraLoi mà không có traLoi`);
    }

    for (const n of item.nguonTraLoi ?? []) {
      loi.push(...loiLink(n.url, `${o} nguonTraLoi`));
      if (n.ten.trim() === '') loi.push(`${o}: nguonTraLoi thiếu ten`);
      loi.push(...loiChu(n.ten, `${o} nguonTraLoi.ten`));
    }

    const khoa = chuanHoaHoi(item.hoi.vi);
    const truoc = daThay.get(khoa);
    if (truoc !== undefined) loi.push(`${o}: trùng câu #${String(truoc + 1)}`);
    else daThay.set(khoa, i);

    if (item.nguon !== undefined && item.nguyenVan !== undefined) {
      const khoaGoc = `${item.nguon.url}\n${chuanHoaHoi(item.nguyenVan)}`;
      const truocGoc = daThayGoc.get(khoaGoc);
      if (truocGoc !== undefined)
        loi.push(`${o}: cùng nguồn, cùng nguyên văn với câu #${String(truocGoc + 1)}`);
      else daThayGoc.set(khoaGoc, i);
    }
  });

  return loi;
}
