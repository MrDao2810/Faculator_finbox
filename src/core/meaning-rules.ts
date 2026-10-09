/**
 * Tầng DOMAIN — luật về CON SỐ trong mục "Ý nghĩa" (`explanation.meaning`).
 *
 * ── Vì sao mục này mới có luật, muộn hơn ba mục kia ─────────────────────────────────────────
 *
 * Bốn mục diễn giải của FR-03 không được gác như nhau. `whenToUse` và `howToRead` đều có mô-đun
 * luật riêng từ 30/09/2026, và `howToRead` còn có hẳn một luật về con số (luật 8: chỉ 0, 1, 100
 * cộng danh sách quy ước có tên) — dựng ra vì lượt đo hôm ấy tìm thấy 5 đoạn trích con số của ví
 * dụ CŨ, trong đó CAPM ghi 13,1% trong khi màn hiện 11,92%. `commonMistakes` được
 * `prose-audit.test.ts` soi một phần. Riêng `meaning` chưa bao giờ được quét, nên đúng loại lỗi ấy
 * sống nguyên ở mục nằm NGAY TRÊN mục vừa dọn.
 *
 * Chủ dự án chỉ ra ngày 09/10/2026, trên `don-bay-hieu-dung`: *"ý nghĩa thì làm gì có chuyện có số
 * liệu cụ thể trong đó, nếu cho vào để dễ hiểu thì nó lại là ví dụ thực tế hoặc bài tập rồi … nếu
 * số liệu kia là mặc định sẽ áp dụng cho mọi trường hợp thì ok thôi đồng ý, nhưng bạn đang nói nó
 * là bịa ra thì làm sao đúng."*
 *
 * Câu bị chỉ: *"đòn bẩy 5 lần nghĩa là chỉ số nhúc nhích 1% thì vốn của bạn biến động khoảng 5%"*.
 * Ba con số, một chỗ hỏng. `L = (F × m × N) / E`, nên chỉ số đi 1% thì vốn đi đúng `L%` — quan hệ
 * ấy đúng với mọi tài khoản. Người viết đóng băng `L = 5`, và 5% tự rơi ra từ `1% × 5`. Tức cả câu
 * chỉ có MỘT con số bịa, nhưng nó kéo theo con số thứ hai và làm câu chỉ còn đúng với tài khoản
 * nào tình cờ có đòn bẩy bằng 5. Con số 5 không truy được về đâu: không có trong `latex`, không
 * phải hằng số thị trường, và ví dụ của chính trang ấy ra 5,7927 (ngày câu được viết, 07/08/2026,
 * ví dụ ra 4,27 — nên nó chưa khớp kể cả hôm đầu tiên).
 *
 * ── Luật, viết đúng theo tiêu chí chủ dự án nêu ─────────────────────────────────────────────
 *
 * Một con số chỉ được đứng trong mục Ý nghĩa khi nó "mặc định áp dụng cho mọi trường hợp". Ba
 * đường để đạt điều đó, xét theo thứ tự:
 *
 *   (a) là 0, 1 hoặc 100 — hai đầu thang, mốc toán học, hoặc mẫu số của phần trăm. Đúng ba con số
 *       `how-to-read-rules.ts` đang cho, giữ y vậy để hai mục không nói hai kiểu.
 *   (b) có mặt nguyên văn trong `latex` CỦA CHÍNH công thức ấy — tức nó là hằng số của công thức,
 *       người đọc nhìn thấy nó trong hình ngay bên cạnh. Vế này TỰ BẢO TRÌ: đổi hình thì tập số
 *       hợp lệ đổi theo, không ai phải nhớ cập nhật danh sách.
 *   (c) nằm trong `QUY_UOC` dưới đây, kèm lý do viết ra. Chỉ dành cho hằng số có thật của công
 *       thức mà hình không vẽ ra.
 *
 * Mọi con số khác là một minh hoạ bịa, và chỗ của nó là khối "Ví dụ thực tế" — nơi số bám vào ô
 * nhập thật và `formulas.test.ts` đối chiếu `expected` với `calc`, nên không bịa được.
 *
 * Luật KHÔNG thấy được: một câu khái quát nhưng sai về bản chất công thức. Sáu đoạn sửa ngày
 * 09/10/2026 đều đã đọc lại cùng `calc`; đoạn mới cũng phải được đọc như vậy.
 */

import { TEN_CO_SO } from './how-to-read-rules';
import type { Bilingual } from './types';

/** Mốc dùng được ở mọi công thức: hai đầu thang, mốc toán học, mẫu số của phần trăm. */
const SO_CHUNG: ReadonlySet<string> = new Set(['0', '1', '100']);

/**
 * Hằng số CÓ THẬT của công thức mà hình không vẽ ra. Thêm vào đây là một quyết định có ý thức:
 * con số phải đúng với mọi lần dùng công thức, không phải một giá trị mẫu của kết quả.
 */
export const QUY_UOC: Readonly<Record<string, readonly string[]>> = {
  /*
   * Hai giới hạn Graham công bố — P/E không quá 15 và P/B không quá 1,5. Tích của chúng CHÍNH LÀ
   * số 22,5 trong hình, nên hai số này là hằng số của công thức, chỉ là hình gộp chúng lại.
   */
  'so-graham': ['15', '1,5'],
  /*
   * Điểm giữa của thang 0 tới 100 mà chính công thức quy về: 50% là đường giữa dải Bollinger. Hai
   * đầu thang đã nằm trong `SO_CHUNG`, chỉ còn điểm giữa phải khai.
   */
  'phan-tram-b-bollinger': ['50'],
};

export interface YNghiaInput {
  id: string;
  /** Hình của chính công thức — nguồn của vế (b). */
  latex: string;
  meaning: Bilingual;
}

/**
 * Con số trong một đoạn văn, dạng chuỗi như tác giả viết ("1,5", "22.5", "365").
 *
 * Bỏ tên riêng có chữ số trước (VN30F1M, VN-Index), nếu không "30" của VN30 thành một con số phải
 * giải trình.
 */
function soTrong(doan: string): string[] {
  return [...doan.replace(TEN_CO_SO, '').matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => m[0]);
}

/**
 * Đưa hai lối viết số thập phân về một dạng để so: bản `vi` viết "1,5", bản `en` viết "1.5", còn
 * `latex` viết "22{,}5". Dấu phân nhóm hàng nghìn không xuất hiện trong mấy con số này nên không
 * phải lo chúng bị hiểu nhầm thành dấu thập phân.
 */
function chuan(so: string): string {
  return so.replace(',', '.');
}

/** Tập số hình vẽ ra — vế (b). `{` `}` của `22{,}5` phải bỏ trước khi dò. */
function soTrongHinh(latex: string): Set<string> {
  const phang = latex.replace(/[{}]/g, '');
  return new Set([...phang.matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => chuan(m[0])));
}

/**
 * Trả về danh sách lỗi của một công thức; rỗng là đạt.
 *
 * Soi CẢ hai ngôn ngữ: bản `en` viết lại cùng ý nên nó mang cùng con số, và đã có lần chỉ một bên
 * được sửa.
 */
export function meaningProblems(item: YNghiaInput): string[] {
  const loi: string[] = [];
  const choPhep = soTrongHinh(item.latex);
  const quyUoc = new Set((QUY_UOC[item.id] ?? []).map(chuan));

  for (const ngon of ['vi', 'en'] as const) {
    const doan = item.meaning[ngon];
    for (const so of soTrong(doan)) {
      const c = chuan(so);
      if (SO_CHUNG.has(c) || choPhep.has(c) || quyUoc.has(c)) continue;
      loi.push(
        `${item.id}.${ngon}: con số "${so}" không phải hằng số của công thức — hình không vẽ nó, ` +
          `và nó không nằm trong 0/1/100 hay QUY_UOC. Số liệu minh hoạ thuộc về khối Ví dụ thực tế, ` +
          `câu Ý nghĩa phải nói khái quát`,
      );
    }
  }

  return loi;
}
