/**
 * Tầng DOMAIN — so khớp CỤM cho ô tìm kiếm (16/10/2026).
 *
 * Bản trước cắt chuỗi gõ thành từ rời, vứt mọi ký hiệu, rồi cho từng từ khớp TIỀN TỐ của bất kỳ
 * từ nào trong tên, thẻ hay mô tả, không cần đúng thứ tự. Chủ dự án gõ "%b" ở màn Công thức và
 * nhận 96 kết quả: "%" bị vứt, "b" khớp "bao nhiêu", "bình quân", "biến động"… trong mô tả của
 * gần cả thư viện. Đo cùng ngày: "p/e" ra 52 (38 chỉ khớp mô tả), "p/b" ra 85.
 *
 * File này giữ ba thứ bản cũ làm rơi:
 * - **Ký hiệu có nghĩa** (`KY_HIEU`) là một mảnh của chuỗi, không phải dấu ngăn: "%b" phải có dấu
 *   "%" ngay trước chữ "b", nên không còn khớp "P/B" hay "Beta".
 * - **Thứ tự và độ liền**: các mảnh phải đứng liên tiếp đúng thứ tự gõ. Ký hiệu trong chuỗi đích
 *   mà người dùng không gõ thì được bỏ qua, nên "p e" vẫn ra "P/E" như WBS yêu cầu.
 * - **Độ dính**: hai mảnh gõ liền nhau ("%b") chỉ khớp hai mảnh cũng liền nhau trong chuỗi đích,
 *   nên "%b" không khớp "100% bán".
 *
 * Mỗi mảnh nhớ vị trí trong chuỗi GỐC, để phần tô màu tô đúng chỗ đã khớp mà không phải dò lại
 * bằng một luật thứ hai: luật tô và luật khớp là một hàm.
 */

/**
 * Bỏ dấu tiếng Việt và hạ chữ thường.
 *
 * NFD tách nguyên âm khỏi dấu thanh rồi xoá phần dấu; riêng chữ 'đ' không tách được bằng NFD
 * nên phải đổi tay.
 */
export function normalizeVi(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Ký hiệu được giữ như một mảnh của chuỗi tìm, không coi là dấu ngăn.
 *
 * Chọn theo tên 111 công thức: "%B", "Stochastic %K", "Cỡ lệnh theo % rủi ro" (`%`); "P/E",
 * "EV/EBITDA", "Lãi/lỗ" (`/`); "phí & thuế" (`&`); "DOL × DFL" (`×`); `+` cho chuỗi người dùng
 * hay gõ. Mọi dấu khác — chấm, phẩy, gạch nối, gạch ngang dài, ngoặc, nháy — vẫn là dấu ngăn như
 * cũ, vì chúng chỉ là cách viết, không phải một phần của tên.
 */
const KY_HIEU = /[%/&+×]/;
const CHU_SO = /[a-z0-9]/;

/** Một mảnh của chuỗi: một từ `[a-z0-9]+` đã bỏ dấu, hoặc một ký hiệu trong `KY_HIEU`. */
export interface Term {
  text: string;
  kyHieu: boolean;
  /** Dính liền mảnh đứng trước, không có dấu cách hay dấu ngăn ở giữa. */
  dinh: boolean;
  /** Vị trí trong chuỗi GỐC; `end` là vị trí ngay sau ký tự cuối. */
  start: number;
  end: number;
}

/**
 * Cắt chuỗi thành mảnh, giữ đường về chuỗi gốc.
 *
 * Bỏ dấu TỪNG ký tự một chứ không cả chuỗi: `normalize('NFD')` tách một ký tự thành nhiều ký tự,
 * nên chỉ số của chuỗi đã bỏ dấu lệch khỏi chuỗi gốc ngay từ chữ có dấu đầu tiên. Duyệt theo điểm
 * mã (`for...of`) để ký tự ngoài mặt phẳng cơ bản không bị cắt đôi.
 */
export function terms(text: string): Term[] {
  const out: Term[] = [];
  /** Ký tự đã bỏ dấu đứng ngay trước có thuộc một mảnh không — quyết `dinh` của mảnh kế. */
  let truocLaManh = false;
  let offset = 0;

  for (const char of text) {
    const piece = normalizeVi(char);
    const end = offset + char.length;

    // Dấu thanh rời (chuỗi gốc ở dạng NFD) bỏ dấu ra rỗng: nó thuộc về chữ đứng trước.
    const truoc = out[out.length - 1];
    if (piece === '' && truoc !== undefined && truocLaManh) truoc.end = end;

    for (const c of piece) {
      const last = out[out.length - 1];
      if (CHU_SO.test(c)) {
        if (last !== undefined && truocLaManh && !last.kyHieu) {
          last.text += c;
          last.end = end;
        } else {
          out.push({ text: c, kyHieu: false, dinh: truocLaManh, start: offset, end });
        }
        truocLaManh = true;
      } else if (KY_HIEU.test(c)) {
        out.push({ text: c, kyHieu: true, dinh: truocLaManh, start: offset, end });
        truocLaManh = true;
      } else {
        truocLaManh = false;
      }
    }

    offset = end;
  }

  return out;
}

/**
 * Cụm `q` có bắt đầu ĐÚNG ở mảnh `i` của `f` không — trả về chỉ số ngay sau mảnh cuối đã khớp,
 * hoặc -1.
 *
 * Từ cuối của `q` được khớp theo tiền tố (người dùng đang gõ dở) khi nó dài ít nhất `tienTo` ký
 * tự; mọi từ khác phải khớp trọn. Ký hiệu luôn khớp trọn.
 */
function khopTai(
  f: ReadonlyArray<Term>,
  q: ReadonlyArray<Term>,
  i: number,
  tienTo: number,
): number {
  let k = i;

  for (let j = 0; j < q.length; j += 1) {
    const qt = q[j];
    if (qt === undefined) return -1;

    // Ký hiệu trong chuỗi đích mà người dùng không gõ thì bước qua: "p e" khớp "P/E". Chỉ giữa
    // hai mảnh đã gõ, và chỉ khi mảnh đã gõ không dính mảnh trước nó.
    if (j > 0 && !qt.kyHieu && !qt.dinh) {
      while (f[k]?.kyHieu === true) k += 1;
    }

    const ft = f[k];
    if (ft === undefined || ft.kyHieu !== qt.kyHieu) return -1;
    if (j > 0 && qt.dinh && !ft.dinh) return -1;

    const cuoi = j === q.length - 1;
    const khop =
      !qt.kyHieu && cuoi && qt.text.length >= tienTo
        ? ft.text.startsWith(qt.text)
        : ft.text === qt.text;
    if (!khop) return -1;

    k += 1;
  }

  return k;
}

/** Một chỗ khớp, tính bằng chỉ số mảnh: `[from, to)`. */
export interface PhraseHit {
  from: number;
  to: number;
  /** Mảnh cuối khớp trọn chứ không chỉ phần đầu. */
  tron: boolean;
}

/**
 * Mọi chỗ cụm `q` xuất hiện trong `f`, không chồng lên nhau, từ trái sang.
 *
 * @param tienTo từ cuối dài từ ngần này ký tự trở lên mới được khớp theo tiền tố
 */
export function phraseHits(
  f: ReadonlyArray<Term>,
  q: ReadonlyArray<Term>,
  tienTo: number,
): PhraseHit[] {
  if (q.length === 0) return [];
  const hits: PhraseHit[] = [];

  let i = 0;
  while (i < f.length) {
    const to = khopTai(f, q, i, tienTo);
    if (to < 0) {
      i += 1;
      continue;
    }
    const cuoiF = f[to - 1];
    const cuoiQ = q[q.length - 1];
    hits.push({ from: i, to, tron: cuoiF !== undefined && cuoiF.text === cuoiQ?.text });
    i = to;
  }

  return hits;
}

/** Tổng số ký tự có nghĩa của một chuỗi đã cắt — "b" là 1, "%b" là 2, "lai kep" là 6. */
export function doDai(q: ReadonlyArray<Term>): number {
  return q.reduce((sum, t) => sum + t.text.length, 0);
}
