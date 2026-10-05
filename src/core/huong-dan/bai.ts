/**
 * Tầng DOMAIN — dựng bài hướng dẫn của một công thức từ Registry (WF-21).
 *
 * Hàm THUẦN: cùng một công thức và cùng một `ctx` thì luôn ra cùng một bài. Nó không đọc ngày hệ
 * thống (NFR-REL-03) — `asOf` đi vào qua `ctx`, đúng như mọi lối gọi `calc` khác.
 *
 * Từ đợt 5 (03/10/2026) file này chỉ còn suy CỜ, không suy chữ: lý do đầy đủ ở docblock
 * `./types.ts` mục "ĐẢO HƯỚNG NỘI DUNG". Hệ quả thấy ngay trong code — không dòng nào còn đọc
 * `spec.explanation.*`.
 */

import { runFormula } from '../calc/run';
import type { CalcContext, FormulaModule } from '../calc/types';
import { FORMULA_SUMMARIES } from '../formulas/summaries.generated';
import type { FormulaSpec } from '../registry/types';
import type { WarningCode } from '../types';
import { BAI_RIENG, songNgu } from './noi-dung';
import type { BaiHuongDan, BaiRiengDaChuan, MucId, ONhapHuongDan } from './types';
import { THU_TU_MUC } from './types';

/**
 * Mã cảnh báo KHÔNG đưa vào mục "Khi kết quả hiện _ _".
 *
 * `INCOMPLETE_INPUT` xảy ra với cả 111 công thức, mỗi khi còn một ô trống — nó không nói gì riêng
 * về công thức đang đọc, và `runFormula()` dựng nó trước cả khi gọi `calc`. Một mục liệt kê nó là
 * một mục ai cũng có và không ai cần, đúng loại chữ thừa năm đợt vừa rồi đi cắt.
 */
const BO_QUA: ReadonlyArray<WarningCode> = ['INCOMPLETE_INPUT'];

/**
 * Thứ tự in các mã trong mục "Khi kết quả hiện _ _" — thứ tự của WF-15, cố định cho cả 111 bài.
 *
 * `INCOMPLETE_INPUT` có mặt trong mảng này dù `BO_QUA` loại nó: mảng là một BẢNG THỨ TỰ của sáu mã
 * WF-15, không phải danh sách mã được in. Tách hai việc ra để thêm mã thứ bảy chỉ phải sửa một chỗ.
 */
const THU_TU_MA: ReadonlyArray<WarningCode> = [
  'INCOMPLETE_INPUT',
  'MISSING_SERIES',
  'DIVIDE_BY_ZERO',
  'MEANINGLESS',
  'MODEL_VIOLATION',
  'INHERITED',
];

/*
 * ── Mộ chí: `TuyChonBai` ───────────────────────────────────────────────────────────────────
 *
 * Bốn tuỳ chọn `coMaChungKhoan` · `coNapMau` · `nguonONhap` · `coKhungCachTinh` đã BỎ ngày
 * 05/10/2026, cùng cả giao diện mang chúng, nên `baiHuongDan()` nay chỉ nhận công thức và ngữ cảnh.
 *
 * Cả bốn tồn tại để trả lời những câu Domain không tự biết: màn có bày nút "Nạp mẫu" không, ô này
 * có công thức riêng trong thư viện không, thẻ Công thức có khung "cách tính" không. Mỗi câu trả
 * lời bật tắt một CÂU DÙNG CHUNG trong i18n, và những câu ấy đã đi theo yêu cầu đợt 8.
 *
 * `coNapMau` đáng nhắc riêng vì nó từng là một lỗi THẬT đã sửa: thiếu nó, bài dạy 38 công thức bấm
 * một nút không có trên màn của họ. Bài giờ không dạy bấm nút nào, nên lỗi ấy không còn cửa quay
 * lại — nhưng ngày nào có câu nói về nút bấm thì cờ này phải sống lại cùng nó.
 */

/*
 * ── Mộ chí: phép DÒ số phiên tối thiểu ────────────────────────────────────────────────────
 *
 * `soPhienToiThieu()`, `chuoiThu()`, `phienThu()` và `TRAN_PHIEN` đã BỎ ngày 05/10/2026.
 *
 * Chúng chạy `calc` tới 300 lượt cho mỗi công thức chuỗi để tìm ngưỡng phiên THẬT, thay vì tin một
 * con số khai tay — một phép đo tốt, và không có cách nào rẻ hơn để lấy nó. Chúng đi vì thứ duy
 * nhất đọc kết quả ấy là câu `guide.input.needsSeries` ("Cần ít nhất {n} phiên giá đóng cửa…"), và
 * câu ấy không có trong `guide-111.json`.
 *
 * Cần lại thì `git log` còn nguyên, kể cả lý do dò TUYẾN TÍNH chứ không nhị phân.
 */

/**
 * Những MÃ cảnh báo công thức phát ra được, lấy từ chính các ca kiểm có `expectedWarning`.
 *
 * CHẠY LẠI `runFormula` với đúng bộ số của ca kiểm rồi đọc mã của cảnh báo THẬT, thay vì tin mã
 * khai trong ca: `expectedWarning` là điều ca kiểm MONG ĐỢI, còn thứ bài in phải là điều `calc`
 * LÀM. Hai thứ ấy lệch nhau được, và `formulas.test.ts` chỉ bắt lệch ở chiều của nó.
 *
 * Trước 05/10/2026 hàm này trả nguyên `CalcWarning` để bài in câu `calc` viết. Nay `guide-111.json`
 * có câu riêng cho từng mã, nên bài chỉ cần biết mã nào có mặt — xem `BaiHuongDan.ketQuaTrong`.
 * Giữ phép chạy thật vì nó quyết định mã nào xuất hiện, và đó là một sự thật chứ không phải câu chữ.
 *
 * Trả về theo thứ tự `WarningCode` của WF-15, không theo thứ tự ca kiểm: thứ tự ca kiểm là tình cờ,
 * và hai công thức cùng tập mã sẽ in ra hai thứ tự khác nhau mà không ai giải thích được vì sao.
 */
export function caKetQuaTrong(
  formula: FormulaModule,
  ctx: CalcContext,
): ReadonlyArray<WarningCode> {
  const thay = new Set<WarningCode>();

  for (const ca of formula.spec.tests) {
    if (ca.expectedWarning === undefined) continue;

    const ketQua = runFormula(formula, ca.inputs, {
      ...ctx,
      series: ca.series,
      bars: ca.bars,
      marketSeries: ca.marketSeries,
      cashflows: ca.cashflows,
    });

    const canhBao = ketQua.warning;
    if (canhBao === undefined || BO_QUA.includes(canhBao.code)) continue;
    thay.add(canhBao.code);
  }

  return THU_TU_MA.filter((ma) => thay.has(ma));
}

/** Tối đa bốn công thức "nên xem cùng": thượng nguồn trước, rồi cùng nhóm. */
function congThucLienQuan(formula: FormulaModule): ReadonlyArray<string> {
  const { id, categoryId, dependsOn } = formula.spec;
  const ra: string[] = [];

  for (const canh of dependsOn ?? []) {
    if (!ra.includes(canh.formulaId)) ra.push(canh.formulaId);
  }

  for (const tom of FORMULA_SUMMARIES) {
    if (ra.length >= 4) break;
    if (tom.id === id || tom.categoryId !== categoryId || ra.includes(tom.id)) continue;
    ra.push(tom.id);
  }

  return ra.slice(0, 4);
}

/**
 * Chữ riêng của công thức, chuẩn hoá về `Bilingual`.
 *
 * `undefined` khi kho chưa có mục cho id ấy. Từ 05/10/2026 đó là một trạng thái NGHÈO chứ không
 * còn vô hại: bài không còn mục nào chạy bằng chữ dùng chung, nên thiếu kho chữ là bài gần như
 * trống. `noi-dung.test.ts` gác đủ 111 mục, nên nó không xảy ra trong thư viện hiện tại — nhưng
 * công thức thứ 112 sẽ cần người viết chữ cho nó trước khi bài của nó có gì để đọc.
 *
 * Phép ghép ô nhập duyệt `spec.variables` RỒI MỚI tra kho, không duyệt kho. Ba thứ đi theo chiều
 * ấy mà không phải viết thêm luật nào:
 *
 *   · thứ tự ô trong bài bằng đúng thứ tự khối Số liệu bày chúng;
 *   · nhãn và cờ Nâng cao luôn là bản thật của `spec`, không có bản sao nào để lệch;
 *   · một ô mới thêm vào `spec.variables` mà kho chưa có câu thì nó chỉ VẮNG khỏi bài, không làm
 *     bài hỏng — còn `noi-dung.test.ts` đỏ lên để nhắc viết. Chiều ngược lại (kho có khoá mà
 *     `spec` không có ô) thì ở đây im lặng bỏ qua, nên cửa gác ấy là chỗ duy nhất bắt được.
 */
function baiRiengCua(spec: FormulaSpec): BaiRiengDaChuan | undefined {
  const muc = BAI_RIENG[spec.id];
  if (muc === undefined) return undefined;

  const oNhap: ONhapHuongDan[] = [];
  for (const bien of spec.variables) {
    const o = muc.oNhap[bien.key];
    if (o === undefined) continue;
    oNhap.push({
      key: bien.key,
      nhan: bien.label,
      layODau: songNgu(o.layODau),
      ...(o.luuY === undefined ? {} : { luuY: songNgu(o.luuY) }),
      nangCao: bien.level === 'advanced',
    });
  }

  return {
    deLamGi: songNgu(muc.deLamGi),
    oNhap,
    docKetQua: songNgu(muc.docKetQua),
    deSai: songNgu(muc.deSai),
  };
}

/** Dựng bài hướng dẫn của một công thức. */
export function baiHuongDan(formula: FormulaModule, ctx: CalcContext): BaiHuongDan {
  const { spec } = formula;

  const ketQuaTrong = caKetQuaTrong(formula, ctx);
  const coBieuDo = spec.chartType !== 'none';
  const rieng = baiRiengCua(spec);

  /*
   * Mục "Đọc biểu đồ" chỉ có khi màn thật có khối biểu đồ: 9 công thức `chartType: 'none'` không
   * dựng cả `<section>` lẫn `<h2>Biểu đồ</h2>`, nên một mục dạy đọc hình ở đó là dạy đọc một thứ
   * không có trên màn. Mục "Khi kết quả hiện _ _" theo cùng một luật, với 11 công thức không khai
   * ca hỏng nào.
   */
  const mucCo: ReadonlyArray<MucId> = THU_TU_MUC.filter((muc) => {
    if (muc === 'doc-bieu-do') return coBieuDo;
    if (muc === 'ket-qua-trong') return ketQuaTrong.length > 0;
    return true;
  });

  return {
    id: spec.id,
    ten: spec.name,
    moTaNgan: spec.description,
    nhomId: spec.categoryId,
    muc: spec.level,

    ...(coBieuDo ? { kieuBieuDo: spec.chartType } : {}),
    ketQuaTrong,
    ...(rieng === undefined ? {} : { rieng }),
    mucCo,
    lienQuan: congThucLienQuan(formula),
  };
}
