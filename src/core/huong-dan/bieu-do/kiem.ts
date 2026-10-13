/**
 * Tầng DOMAIN — luật của chữ "Đọc biểu đồ", gom vào MỘT hàm.
 *
 * Cùng nếp `viDuProblems()` (`src/core/vi-du/kiem.ts`): ca kiểm chạy hàm này trên cả 111 công thức,
 * và người viết chữ cũng chạy đúng hàm này trên bản nháp, nên cửa gác với công cụ viết không thể nói
 * hai điều khác nhau.
 *
 * Mỗi luật ở đây chặn một kiểu "chữ nói khác hình" đã thấy thật ở bản cũ:
 *
 *   · tả một hình màn không vẽ (bài nói "nến" trong khi màn vẽ đường) → luật CẤU TRÚC: có đoạn nào
 *     là do `keHoachBieuDo()` quyết, không thừa không thiếu — từ đợt hai là cho TỪNG mục của ô chọn
 *     "Xem kết quả đổi theo", vì khung "?" tra chữ theo đúng mục đang chọn;
 *   · gọi hình bằng một cái tên không có trên màn ("quét độ nhạy") → cấm hẳn hai chữ ấy, và đoạn
 *     về một đường phải gọi đúng tên ô nhập đang nằm ở trục ngang;
 *   · nói sai chiều ("đi lên" trong khi đường đi xuống) → chiều đầu tiên đoạn chữ nhắc tới phải khớp
 *     chiều ĐO được trên `sweepPoints()`; đường đo ra phẳng thì đoạn phải nói nó nằm ngang;
 *   · chép số của bộ mẫu vào chữ → cấm chữ số, trừ mốc tham chiếu công thức tự khai và số 0. Hai đầu
 *     của đường đổi theo con số người dùng gõ, nên một con số cụ thể trong bài sai ngay lần gõ đầu.
 *
 * Trục CHỈ vẽ được sau khi nạp chuỗi giá (51 trục) thì không có gì để đo lúc build: ở đó luật đòi
 * đoạn chữ nói rõ hình tính trên chuỗi đã nạp và có nói đường lên hay xuống nghĩa là gì. Việc một
 * đoạn hứa MỘT chiều cố định có đúng không thì ca kiểm thử trên nhiều chuỗi dựng (`chieuDuyNhat()`).
 *
 * Thứ KHÔNG máy nào thấy: câu "xu thế ấy nghĩa là gì" có đúng với phép tính của công thức không.
 * Mỗi đoạn đã được đọc đối chiếu với `calc`; đoạn mới thêm cũng phải thế.
 */

import type { Bilingual } from '../../types';
import type {
  BieuDoRieng,
  HaiDang,
  KeHoachBieuDo,
  KeHoachBocTach,
  KeHoachThoiGian,
  KeHoachTruc,
} from './types';

/** Trần độ dài một đoạn, tính bằng ký tự. Quá mức này là đoạn đang kể thay vì chỉ cách đọc. */
export const DAI_TOI_DA = 600;
/** Sàn độ dài: ngắn hơn thế này thì không thể vừa nói đường đi đâu vừa nói nó nghĩa là gì. */
export const DAI_TOI_THIEU = 90;

type Ngon = 'vi' | 'en';

/** Cụm từ cố định của từng ngôn ngữ — luật dò đúng những cụm này, nên kho chữ phải dùng đúng chúng. */
const TU = {
  vi: {
    len: 'đi lên',
    xuong: 'đi xuống',
    ngang: 'nằm ngang',
    nua: 'một nửa',
    gapRuoi: 'gấp rưỡi',
    khongPhaiThiTruong: 'không phải diễn biến thị trường',
    daNap: 'đã nạp',
    gachCheo: 'gạch chéo',
    cot: 'cột',
    // Bốn cách một dãy cột đổi dần về bên phải: hai cách cho cột mọc lên, hai cho cột treo xuống.
    cotDoi: ['cao dần', 'thấp dần', 'dài dần', 'ngắn dần'],
    vach0: 'vạch 0',
    phienDau: 'phiên cũ nhất',
    phienCuoi: 'phiên gần nhất',
    thanh: 'thanh',
    cam: /quét|độ nhạy/i,
    oNhap: (ten: string) => `ô ${ten}`,
  },
  en: {
    len: 'rises',
    xuong: 'falls',
    ngang: 'flat',
    nua: 'half',
    gapRuoi: 'one and a half times',
    khongPhaiThiTruong: 'not market history',
    daNap: 'loaded',
    gachCheo: 'hatched',
    // "bar", không phải "column": nút của màn tính bản tiếng Anh tên là "Bars" (`chart.kindBar`).
    cot: 'bar',
    cotDoi: ['grow taller', 'shrink', 'grow longer', 'get shorter'],
    vach0: 'zero line',
    phienDau: 'oldest session',
    phienCuoi: 'most recent session',
    thanh: 'bar',
    cam: /sweep|sensitivit/i,
    oNhap: (ten: string) => ten,
  },
} as const;

const NGON: ReadonlyArray<Ngon> = ['vi', 'en'];

/** So không phân biệt hoa thường: câu tiếng Anh mở đầu bằng chữ hoa, cụm dò thì viết thường. */
function co(doan: string, cum: string): boolean {
  return doan.toLowerCase().includes(cum.toLowerCase());
}

/**
 * Chữ số còn lại trong đoạn sau khi đã bỏ những cái TÊN có sẵn chữ số ("Giá mua đợt 3", "VN30").
 *
 * Tên thì không phải số liệu: nó là chữ màn đang in, và đoạn phải được phép gọi đúng nó.
 */
function chuSoLa(doan: string, ten: ReadonlyArray<string>, choPhep: ReadonlySet<string>): string[] {
  let con = doan;
  // Tên dài trước, kẻo tên ngắn cắt mất một phần của tên dài.
  for (const t of [...ten].sort((a, b) => b.length - a.length)) {
    if (t !== '') con = con.split(t).join(' ');
  }
  con = con.replace(/VN30F?\d?M?/g, ' ').replace(/%[BK]/g, ' ');

  return (con.match(/\d+(?:[.,]\d+)*/g) ?? []).filter((so) => !choPhep.has(so));
}

/** Luật chung cho MỌI đoạn, ở một ngôn ngữ. */
function loiChung(
  cho: string,
  doan: string,
  ngon: Ngon,
  ten: ReadonlyArray<string>,
  soChoPhep: ReadonlySet<string>,
): string[] {
  const loi: string[] = [];
  const dau = `${cho} [${ngon}]`;
  const gon = doan.trim();

  if (gon === '') return [`${dau}: trống`];
  if (gon !== doan) loi.push(`${dau}: thừa khoảng trắng đầu/cuối`);
  if (gon.length > DAI_TOI_DA)
    loi.push(`${dau}: dài ${String(gon.length)} > ${String(DAI_TOI_DA)}`);
  if (gon.length < DAI_TOI_THIEU) {
    loi.push(`${dau}: ngắn ${String(gon.length)} < ${String(DAI_TOI_THIEU)}`);
  }
  if (/[—–]/.test(gon)) loi.push(`${dau}: có gạch ngang dài`);
  if (TU[ngon].cam.test(gon)) loi.push(`${dau}: dùng chữ "quét" / "độ nhạy"`);
  if (!/[.!?]$/.test(gon)) loi.push(`${dau}: không kết bằng dấu chấm câu`);

  const so = chuSoLa(gon, ten, soChoPhep);
  if (so.length > 0) loi.push(`${dau}: có con số cụ thể ${so.join(', ')}`);

  return loi;
}

/** Chiều ĐẦU TIÊN đoạn chữ nhắc tới — thứ người đọc sẽ gán cho đường đang nhìn. */
export function chieuDauTien(doan: string, ngon: Ngon): 'len' | 'xuong' | null {
  const thap = doan.toLowerCase();
  const iLen = thap.indexOf(TU[ngon].len);
  const iXuong = thap.indexOf(TU[ngon].xuong);
  if (iLen < 0 && iXuong < 0) return null;
  if (iXuong < 0) return 'len';
  if (iLen < 0) return 'xuong';
  return iLen < iXuong ? 'len' : 'xuong';
}

/**
 * Chiều mà đoạn chữ HỨA là cố định: đoạn chỉ nhắc đúng một trong hai chiều và không nói đường nằm
 * ngang. `null` khi đoạn giải thích cả hai chiều — tức nó không hứa gì về hình sẽ ra.
 *
 * Dùng cho trục chỉ vẽ được trên chuỗi giá đã nạp: ở đó chiều đi tuỳ chuỗi, trừ vài trục chiều do
 * chính phép tính quyết (Sharpe theo lãi suất phi rủi ro bao giờ cũng đi xuống). Một đoạn chỉ nhắc
 * một chiều là đang nói "chuỗi nào cũng ra chiều này", và ca kiểm thử đúng lời hứa ấy trên nhiều
 * chuỗi dựng.
 */
export function chieuDuyNhat(doan: string, ngon: Ngon): 'len' | 'xuong' | null {
  const coLen = co(doan, TU[ngon].len);
  const coXuong = co(doan, TU[ngon].xuong);
  if (coLen === coXuong || co(doan, TU[ngon].ngang)) return null;
  return coLen ? 'len' : 'xuong';
}

function loiTruc(cho: string, rieng: HaiDang, keHoach: KeHoachTruc): string[] {
  const loi: string[] = [];
  const ten = (ngon: Ngon) => [keHoach.truc[ngon], keHoach.ten[ngon]];
  const so0 = new Set(['0']);
  const { hinh } = keHoach;

  for (const ngon of NGON) {
    const tu = TU[ngon];
    const duong = rieng.duong[ngon];
    const dau = `${cho}.duong [${ngon}]`;
    loi.push(...loiChung(`${cho}.duong`, duong, ngon, ten(ngon), so0));

    if (!co(duong, tu.oNhap(keHoach.truc[ngon]))) {
      loi.push(`${dau}: không gọi tên trục "${tu.oNhap(keHoach.truc[ngon])}"`);
    }
    if (!co(duong, tu.khongPhaiThiTruong)) {
      loi.push(`${dau}: thiếu câu "${tu.khongPhaiThiTruong}"`);
    }

    const noiNuaGapRuoi = co(duong, tu.nua) && co(duong, tu.gapRuoi);
    if (keHoach.dai === 'nua-gap-ruoi' && !noiNuaGapRuoi) {
      loi.push(`${dau}: thiếu "${tu.nua}" … "${tu.gapRuoi}"`);
    }
    if (keHoach.dai === 'khac' && noiNuaGapRuoi) {
      loi.push(`${dau}: dải của trục này không phải "${tu.nua}" … "${tu.gapRuoi}"`);
    }

    if (hinh === undefined) {
      // Chưa nạp chuỗi giá thì trục này chưa vẽ được: không có chiều nào để đối chiếu.
      if (!co(duong, tu.daNap)) {
        loi.push(`${dau}: không nói hình này tính trên chuỗi "${tu.daNap}"`);
      }
      if (chieuDauTien(duong, ngon) === null) {
        loi.push(`${dau}: không nói đường "${tu.len}" hay "${tu.xuong}" nghĩa là gì`);
      }
    } else {
      if (hinh.chieu === 'ngang') {
        if (!co(duong, tu.ngang)) loi.push(`${dau}: đường đo ra phẳng mà không nói "${tu.ngang}"`);
      } else if (chieuDauTien(duong, ngon) !== hinh.chieu) {
        loi.push(`${dau}: chiều đầu tiên nhắc tới không phải "${tu[hinh.chieu]}"`);
      }
      if (hinh.coQuangTrong !== co(duong, tu.gachCheo)) {
        loi.push(
          hinh.coQuangTrong
            ? `${dau}: đường có quãng không tính được mà không nhắc vùng "${tu.gachCheo}"`
            : `${dau}: nhắc vùng "${tu.gachCheo}" trong khi đường tính được ở mọi điểm`,
        );
      }
      /*
       * Chiều đo ở trên là chiều của bộ số MẶC ĐỊNH. Trục nào có bộ số gõ được làm đường đi ngược
       * lại thì đoạn chỉ nói một chiều sẽ nói ngược hình ngay khi người dùng gõ bộ số ấy — nên ở
       * đó đoạn phải nêu cả hai: chiều nào trước thì luật trên đã giữ, chiều kia là ca đảo.
       */
      if (keHoach.daoChieu && !(co(duong, tu.len) && co(duong, tu.xuong))) {
        loi.push(
          `${dau}: có bộ số gõ được làm đường đi ngược lại, đoạn phải nói cả "${tu.len}" lẫn "${tu.xuong}"`,
        );
      }
    }

    if (rieng.cot === undefined) {
      loi.push(`${cho}.cot: thiếu — đường theo một ô nhập luôn có nút Cột`);
      continue;
    }
    const cot = rieng.cot[ngon];
    loi.push(...loiChung(`${cho}.cot`, cot, ngon, ten(ngon), so0));
    if (!co(cot, tu.cot)) loi.push(`${cho}.cot [${ngon}]: không nói tới "${tu.cot}"`);
    if (hinh !== undefined && hinh.catKhong !== co(cot, tu.vach0)) {
      loi.push(
        hinh.catKhong
          ? `${cho}.cot [${ngon}]: kết quả đổi dấu mà không nhắc "${tu.vach0}"`
          : `${cho}.cot [${ngon}]: nhắc "${tu.vach0}" trong khi kết quả không đổi dấu`,
      );
    }
    /*
     * Cùng lẽ với đoạn Đường, và phải gác riêng vì khung "?" chỉ in MỘT dạng: câu rào ở đoạn Đường
     * không che được đoạn Cột. Đoạn Cột của trục đảo chiều được thì hoặc không tả dãy cột đổi dần
     * theo hướng nào, hoặc tả ít nhất hai ca — nói đúng một ca là hứa một chiều.
     */
    if (keHoach.daoChieu && tu.cotDoi.filter((cum) => co(cot, cum)).length === 1) {
      loi.push(
        `${cho}.cot [${ngon}]: có bộ số gõ được làm dãy cột đổi ngược lại, mà đoạn chỉ tả một chiều`,
      );
    }
  }

  return loi;
}

function loiThoiGian(cho: string, rieng: HaiDang, keHoach: KeHoachThoiGian): string[] {
  const loi: string[] = [];

  for (const ngon of NGON) {
    const tu = TU[ngon];
    const ten = [
      keHoach.ten[ngon],
      ...keHoach.moc.map((moc) => moc.label[ngon]),
      ...keHoach.chuoiPhu.map((chuoi) => chuoi[ngon]),
    ];
    const so = new Set(['0', ...keHoach.moc.map((moc) => String(moc.value))]);

    const duong = rieng.duong[ngon];
    const dau = `${cho}.duong [${ngon}]`;
    loi.push(...loiChung(`${cho}.duong`, duong, ngon, ten, so));

    for (const cum of [tu.phienDau, tu.phienCuoi, tu.len, tu.xuong]) {
      if (!co(duong, cum)) loi.push(`${dau}: thiếu "${cum}"`);
    }
    for (const moc of keHoach.moc) {
      if (!new RegExp(`(^|\\D)${String(moc.value)}(\\D|$)`).test(duong)) {
        loi.push(`${dau}: không nhắc mốc ${String(moc.value)}`);
      }
    }
    for (const chuoi of keHoach.chuoiPhu) {
      if (!co(duong, chuoi[ngon])) loi.push(`${dau}: không nhắc đường vẽ kèm "${chuoi[ngon]}"`);
    }

    if (keHoach.coCot !== (rieng.cot !== undefined)) {
      loi.push(
        keHoach.coCot
          ? `${cho}.cot: thiếu — màn có nút Cột cho hình này`
          : `${cho}.cot: thừa — màn KHÔNG có nút Cột cho hình này`,
      );
    }
    if (rieng.cot !== undefined) {
      const cot = rieng.cot[ngon];
      loi.push(...loiChung(`${cho}.cot`, cot, ngon, ten, so));
      if (!co(cot, tu.cot)) loi.push(`${cho}.cot [${ngon}]: không nói tới "${tu.cot}"`);
    }
  }

  return loi;
}

function loiBocTach(cho: string, doan: Bilingual, keHoach: KeHoachBocTach): string[] {
  const loi: string[] = [];

  for (const ngon of NGON) {
    const nhan = [...keHoach.chang.map((chang) => chang[ngon]), keHoach.tong[ngon]];
    loi.push(...loiChung(cho, doan[ngon], ngon, [keHoach.ten[ngon], ...nhan], new Set(['0'])));

    if (!co(doan[ngon], TU[ngon].thanh)) {
      loi.push(`${cho} [${ngon}]: không nói tới "${TU[ngon].thanh}" — hình này là thanh nằm ngang`);
    }
    for (const mot of nhan) {
      if (!doan[ngon].includes(mot)) loi.push(`${cho} [${ngon}]: không gọi tên thanh "${mot}"`);
    }
  }

  return loi;
}

/**
 * Mọi chỗ chữ của một công thức nói khác hình của nó. Mảng rỗng là đạt.
 *
 * @param keHoach `undefined` với công thức không có khối biểu đồ — khi ấy kho KHÔNG được có mục.
 */
export function bieuDoProblems(
  keHoach: KeHoachBieuDo | undefined,
  rieng: BieuDoRieng | undefined,
): string[] {
  if (keHoach === undefined) {
    return rieng === undefined ? [] : ['có chữ trong khi công thức không có khối biểu đồ'];
  }
  if (rieng === undefined) return ['thiếu mục trong kho chữ'];

  const loi: string[] = [];
  /** Hình và chữ phải đi thành cặp: thiếu bên nào cũng là chữ nói khác màn. */
  const lechCap = (ten: string, coHinh: boolean, coChu: boolean): void => {
    if (coHinh && !coChu) loi.push(`${ten}: màn có hình này mà kho không có chữ`);
    if (!coHinh && coChu) loi.push(`${ten}: kho có chữ mà màn KHÔNG có hình này`);
  };

  /*
   * Từng mục của ô chọn "Xem kết quả đổi theo" một cặp. Duyệt theo KẾ HOẠCH trước để bắt mục thiếu
   * chữ, rồi duyệt kho để bắt chữ thừa — một khoá gõ sai (`sellprice` thay `sellPrice`) lộ ra ở cả
   * hai phía cùng lúc.
   */
  const khoaHinh = new Set(keHoach.truc.map((mot) => mot.khoa));
  for (const mot of keHoach.truc) {
    const chu = rieng.truc?.[mot.khoa];
    lechCap(`truc.${mot.khoa}`, true, chu !== undefined);
    if (chu !== undefined) loi.push(...loiTruc(`truc.${mot.khoa}`, chu, mot));
  }
  for (const khoa of Object.keys(rieng.truc ?? {})) {
    lechCap(`truc.${khoa}`, khoaHinh.has(khoa), true);
  }

  lechCap('thoiGian', keHoach.thoiGian !== undefined, rieng.thoiGian !== undefined);
  if (keHoach.thoiGian !== undefined && rieng.thoiGian !== undefined) {
    loi.push(...loiThoiGian('thoiGian', rieng.thoiGian, keHoach.thoiGian));
  }

  lechCap('bocTach', keHoach.bocTach !== undefined, rieng.bocTach !== undefined);
  if (keHoach.bocTach !== undefined && rieng.bocTach !== undefined) {
    loi.push(...loiBocTach('bocTach', rieng.bocTach, keHoach.bocTach));
  }

  return loi;
}
