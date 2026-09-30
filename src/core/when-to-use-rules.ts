/**
 * Tầng DOMAIN — luật của mục "Khi nào dùng" (`explanation.whenToUse`).
 *
 * Chủ dự án (30/09/2026): _"phần khi nào dùng đang quá khó hiểu và vẫn chưa nhận biết rõ ràng là
 * nên sử dụng khi nào"_. Đo trên 111 câu cũ: chỉ 4 câu nói với người đọc, còn lại tả một thao tác
 * trừu tượng ("So sánh nhanh định giá giữa các doanh nghiệp cùng ngành…"). 11 câu nói công thức là
 * "đầu vào" của công thức khác, đúng điều chủ dự án từng dặn không viết. 27 câu mượn thuật ngữ người
 * mới chưa biết, 6 câu dạy cách đọc kết quả, 14 câu dài quá 140 ký tự. Chủ dự án chọn MỘT câu theo
 * khuôn "Dùng khi bạn …", không kèm dòng "Không hợp khi …".
 *
 * Mỗi luật dưới đây giữ một điều của khuôn ấy:
 *
 * 1. Mở đầu đúng "Dùng khi bạn " / "Use it when you ": câu tả một lúc người đọc tự nhận ra trong
 *    việc đầu tư của chính mình, không tả một thao tác trừu tượng.
 * 2. Đúng một câu: kết thúc bằng dấu chấm, không có câu thứ hai, không `;`, `:`, xuống dòng.
 * 3. Độ dài có trần, vì câu dài là câu đang nhồi thêm việc của mục khác.
 * 4. Không gạch ngang dài (`—`, `–`): chủ dự án đã hai lần đọc nó thành dấu trừ.
 * 5. Không tả công thức là đầu vào của công thức khác ("đầu vào", "mẫu số", "suất chiết khấu"…).
 * 6. Không mượn tên công thức KHÁC làm lý do dùng. Tên của chính nó thì được.
 * 7. Không ngưỡng, không `%`: đọc con số là việc của mục "Cách đọc kết quả".
 * 8. Không ra lệnh mua/bán (CON-11, FR-24). Đây là BẢN SAO rút gọn của `RA_LENH_*` trong
 *    `prose-audit.test.ts`, để bản nháp vấp ngay lúc soạn; cửa gác chính vẫn là file ấy.
 * 9. Bản tiếng Anh không lẫn chữ tiếng Việt.
 *
 * Luật KHÔNG thấy được: câu có hứa một công dụng mà công thức không làm được hay không (ví dụ tả
 * "góp tiền hằng tháng" cho một công thức chỉ nhận một khoản gửi một lần). Việc ấy phải đọc `calc`
 * mà đối chiếu bằng mắt.
 *
 * Không import gì lúc chạy — dùng được ở Node, trong test lẫn trong công cụ soạn.
 */

import type { Bilingual } from './types';

export const KHI_NAO_MO_DAU = { vi: 'Dùng khi bạn ', en: 'Use it when you ' } as const;

/** Luật 3. Trần của bản Việt đo trên câu mẫu: một tình huống cộng một vế "để biết…" là ~150. */
export const KHI_NAO_TOI_DA = { vi: 170, en: 230 } as const;

/** Sàn: `prose-audit.test.ts` đòi mọi mục diễn giải dài hơn 40 ký tự; ở đây chặt hơn một chút. */
export const KHI_NAO_TOI_THIEU = 50;

/** Luật 2: dấu kết câu đứng GIỮA câu, hoặc dấu nối hai vế thành hai câu. */
const HAI_CAU = /[.!?](?=\s)|[;:\n]/;

/** Luật 4. */
const GACH_DAI = /[–—]/;

/** Luật 5. */
const VAI_TRO: Readonly<Record<'vi' | 'en', RegExp>> = {
  vi: /(đầu vào|mẫu số|nguyên liệu|viên gạch|suất chiết khấu|dòng tiền gốc|tham số)/i,
  en: /\b(input (?:to|for)|denominator|discount rate|building block|ingredient)\b/i,
};

/**
 * Luật 6: tên viết tắt của các công thức trong thư viện. Được dùng khi nó nằm trong TÊN của chính
 * công thức đang viết (RSI được nói "RSI"), cấm khi mượn tên công thức khác.
 */
const TEN_CONG_THUC = [
  'DCF',
  'FCFF',
  'FCFE',
  'CAPM',
  'WACC',
  'DDM',
  'NPV',
  'IRR',
  'XIRR',
  'CAGR',
  'HPR',
  'ROE',
  'ROA',
  'ROI',
  'EPS',
  'BVPS',
  'P/E',
  'P/B',
  'P/S',
  'PEG',
  'EV',
  'EBITDA',
  'NCAV',
  'Graham',
  'Gordon',
  'Sharpe',
  'Sortino',
  'Treynor',
  'Calmar',
  'MACD',
  'SMA',
  'EMA',
  'RSI',
  'ATR',
  'VWAP',
  'VaR',
  'CVaR',
  'Bollinger',
  'Stochastic',
] as const;

/** Luật 7: con số theo sau "trên / dưới / vượt / quá / từ" rồi "là / thì / trở / nghĩa". */
const NGUONG = /(?:trên|dưới|vượt|quá|từ|above|below|over|under)\s+-?\d/i;

/** Luật 8 — bản sao rút gọn của `RA_LENH_VI` / `RA_LENH_EN` trong `prose-audit.test.ts`. */
const RA_LENH: Readonly<Record<'vi' | 'en', readonly RegExp[]>> = {
  vi: [
    /(?:khuyến nghị|gợi ý|khuyên)\s+(?:mua|bán)/i,
    /(?:bạn|nhà đầu tư|người dùng|nhà giao dịch)\s+nên\s+(?:mua|bán|giải ngân|vào lệnh|xuống tiền)/i,
    /nên\s+(?:mua|bán)\s+(?:ngay|vào|ra|thêm)/i,
    /đáng\s+(?:mua|đầu tư|giải ngân|xuống tiền)/i,
    /cơ hội\s+(?:đầu tư|mua vào|giải ngân)/i,
    /chắc chắn\s+(?:tăng|lãi|sinh lời|thắng)/i,
  ],
  en: [
    /(?:suggests?|recommends?|advises?)\s+(?:a\s+)?(?:buy|sell|buying|selling)/i,
    /you should\s+(?:buy|sell)/i,
    /worth\s+(?:buying|investing in)/i,
  ],
};

/** Luật 9. */
const CHU_VIET = /[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i;

function coTen(text: string, ten: string): boolean {
  const thoat = ten.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}])${thoat}(?![\\p{L}\\p{N}])`, 'u').test(text);
}

export interface KhiNaoInput {
  id: string;
  name: Bilingual;
  whenToUse: Bilingual;
}

/** Mọi chỗ một câu "Khi nào dùng" lệch khuôn. Rỗng là đạt. */
export function whenToUseProblems({ id, name, whenToUse }: KhiNaoInput): string[] {
  const loi: string[] = [];

  for (const ngon of ['vi', 'en'] as const) {
    const cau = whenToUse[ngon];
    const nhan = `${id}.${ngon}`;

    if (!cau.startsWith(KHI_NAO_MO_DAU[ngon])) {
      loi.push(`${nhan}: phải mở đầu bằng "${KHI_NAO_MO_DAU[ngon]}"`);
    }
    if (!cau.endsWith('.')) loi.push(`${nhan}: phải kết thúc bằng dấu chấm`);
    if (HAI_CAU.test(cau.slice(0, -1))) {
      loi.push(`${nhan}: chỉ được một câu (không ". ", "?", "!", ";", ":" hay xuống dòng ở giữa)`);
    }
    if (cau.length > KHI_NAO_TOI_DA[ngon]) {
      loi.push(`${nhan}: dài ${String(cau.length)} ký tự, trần ${String(KHI_NAO_TOI_DA[ngon])}`);
    }
    if (cau.length < KHI_NAO_TOI_THIEU) {
      loi.push(`${nhan}: ngắn ${String(cau.length)} ký tự, sàn ${String(KHI_NAO_TOI_THIEU)}`);
    }
    if (GACH_DAI.test(cau)) loi.push(`${nhan}: có gạch ngang dài (— hoặc –)`);

    const vaiTro = VAI_TRO[ngon].exec(cau);
    if (vaiTro !== null)
      loi.push(`${nhan}: tả công thức là đầu vào của công thức khác ("${vaiTro[0]}")`);

    for (const ten of TEN_CONG_THUC) {
      if (coTen(cau, ten) && !coTen(name.vi, ten) && !coTen(name.en, ten)) {
        loi.push(`${nhan}: mượn tên công thức khác ("${ten}")`);
      }
    }

    if (cau.includes('%')) loi.push(`${nhan}: có "%" — con số là việc của mục Cách đọc kết quả`);
    const nguong = NGUONG.exec(cau);
    if (nguong !== null) loi.push(`${nhan}: có ngưỡng ("${nguong[0]}")`);

    for (const mau of RA_LENH[ngon]) {
      const lenh = mau.exec(cau);
      if (lenh !== null) loi.push(`${nhan}: ra lệnh mua/bán ("${lenh[0]}")`);
    }
  }

  if (CHU_VIET.test(whenToUse.en)) loi.push(`${id}.en: lẫn chữ tiếng Việt`);

  return loi;
}

/** Hai công thức không được dùng chung một câu — người đọc sẽ không phân biệt được chúng. */
export function whenToUseDuplicates(items: ReadonlyArray<KhiNaoInput>): string[] {
  const loi: string[] = [];
  for (const ngon of ['vi', 'en'] as const) {
    const gap = new Map<string, string>();
    for (const item of items) {
      const khoa = item.whenToUse[ngon].trim().toLowerCase();
      const truoc = gap.get(khoa);
      if (truoc !== undefined) loi.push(`${item.id}.${ngon}: trùng nguyên câu với ${truoc}`);
      else gap.set(khoa, item.id);
    }
  }
  return loi;
}
