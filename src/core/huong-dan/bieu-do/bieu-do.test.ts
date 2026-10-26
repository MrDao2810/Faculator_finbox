import { describe, expect, it } from 'vitest';

import { resolveRepeat, runFormula } from '../../calc/run';
import type { CalcContext, FormulaModule } from '../../calc/types';
import { BREAKDOWN_KEY } from '../../chart/breakdown';
import { buildChartModel } from '../../chart/build';
import { HISTORY_KEY } from '../../chart/history';
import { COLUMNS_KEY } from '../../chart/columns';
import { COMPOSITION_KEY } from '../../chart/composition';
import { GAUGE_KEY } from '../../chart/gauge';
import { laHinhChuoiGia } from '../../chart/series-view';
import type { ChartModel } from '../../chart/types';
import { FORMULA_MODULES } from '../../formulas';
import { MARKET_CONFIG } from '../../market';
import { scheduleOrDefault } from '../../market/resolve';
import { defaultInputs } from '../../registry/build';
import { addRepeatGroup, fillRepeat, repeatKey, repeatLimits } from '../../registry/repeat';
import type { Level } from '../../types';
import { doHinh, keHoachBieuDo } from './ke-hoach';
import { bieuDoProblems, chieuDuyNhat } from './kiem';
import { mucBieuDo } from './muc';
import { BIEU_DO_RIENG } from './noi-dung';

/**
 * Cửa gác của mục "Đọc biểu đồ" (13/10/2026).
 *
 * Mục này sinh ra vì bản trước tả những hình màn tính không vẽ: 26 bài nói về nến, cột phân phối,
 * chấm hồi quy trong khi màn chỉ vẽ một đường theo thời gian, và 66 bài mang cái tên "Biểu đồ quét
 * độ nhạy" không có ở đâu trên màn. Mọi ca dưới đây chặn đúng một đường để lỗi ấy quay lại.
 *
 * Đợt hai cùng ngày thêm một bất biến nữa, và nó là bất biến của chính yêu cầu: khung "?" chỉ in
 * khối của hình ĐANG HIỆN, nên mục nào ô chọn "Xem kết quả đổi theo" bày ra cũng phải có khối chữ
 * mang đúng khoá của nó — xem ca "mục nào của ô chọn cũng có khối chữ".
 */

const CTX: CalcContext = { asOf: '2026-08-04', schedule: scheduleOrDefault(MARKET_CONFIG) };

/**
 * Một ngữ cảnh có chuỗi giá DỰNG. Không con số nào ở đây đi vào chữ của bài: các ca kiểm chỉ đọc
 * TÊN hình, việc có đường vẽ kèm hay không, và CHIỀU đi của đường.
 */
function ctxChuoi(
  gia: (i: number) => number,
  thiTruong: (i: number, gia: number) => number,
  khoiLuong: (i: number) => number,
  soPhien: number,
): CalcContext {
  const closes = Array.from({ length: soPhien }, (_, i) => Math.round(gia(i)));
  return {
    ...CTX,
    series: closes,
    marketSeries: closes.map((close, i) => Math.round(thiTruong(i, close))),
    bars: closes.map((close, i) => ({
      date: new Date(Date.UTC(2025, 0, 6 + i)).toISOString().slice(0, 10),
      open: close - 100,
      high: close + 200,
      low: close - 300,
      close,
      volume: Math.round(khoiLuong(i)),
    })),
  };
}

/** Chuỗi 120 phiên đi lên — đủ để mọi công thức ăn chuỗi vẽ được hình theo thời gian. */
const CTX_CHUOI = ctxChuoi(
  (i) => 20_000 + 40 * i + 1_500 * Math.sin(i / 5),
  (i, gia) => 1_200 + 0.01 * gia + 8 * Math.cos(i / 7),
  (i) => 1_000_000 + 1_000 * i,
  120,
);

/**
 * Bốn chuỗi KHÁC HẲN nhau — lên, xuống, đi ngang dao động, chữ V — dài 400 phiên để cả ô "Số phiên
 * gần nhất đưa vào tính" (tới 370) cũng có đủ dữ liệu. Chúng tồn tại cho đúng một ca: đoạn chữ nào
 * hứa một chiều cố định cho một trục ăn chuỗi giá thì chiều ấy phải đứng vững trên cả bốn.
 */
const CHUOI_THU: ReadonlyArray<CalcContext> = [
  CTX_CHUOI,
  ctxChuoi(
    (i) => 20_000 + 40 * i + 1_500 * Math.sin(i / 5),
    (i, gia) => 1_200 + 0.01 * gia + 8 * Math.cos(i / 7),
    (i) => 1_000_000 + 1_000 * i,
    400,
  ),
  ctxChuoi(
    (i) => 60_000 - 60 * i + 2_000 * Math.sin(i / 7),
    (i) => 1_300 - 0.2 * i + 15 * Math.sin(i / 11),
    (i) => 2_000_000 - 2_000 * i,
    400,
  ),
  ctxChuoi(
    (i) => 30_000 + 3_000 * Math.sin(i / 9) + 1_200 * Math.cos(i / 2.3),
    (i) => 1_250 + 20 * Math.sin(i / 9 + 1) + 6 * Math.cos(i / 3),
    (i) => 1_500_000 + 500_000 * Math.sin(i / 6),
    400,
  ),
  ctxChuoi(
    (i) => (i < 200 ? 40_000 - 80 * i : 24_000 + 90 * (i - 200)) + 800 * Math.sin(i / 3),
    (i, gia) => 1_200 + 0.004 * gia + 10 * Math.sin(i / 4),
    (i) => 1_000_000 + 300_000 * Math.cos(i / 5),
    400,
  ),
];

/** `FFB_BIEU_DO_IDS=pe,roe` thu hẹp các ca chữ về vài công thức trong lúc viết một nhóm. */
const CHI = (process.env.FFB_BIEU_DO_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter((id) => id !== '');
const TRONG_PHAM_VI = FORMULA_MODULES.filter(
  (formula) => CHI.length === 0 || CHI.includes(formula.spec.id),
);

function ve(formula: FormulaModule, ctx: CalcContext, level: Level, sweepKey?: string): ChartModel {
  const inputs = defaultInputs(formula.spec);
  return buildChartModel({
    formula,
    inputs,
    ctx,
    output: runFormula(formula, inputs, ctx),
    level,
    ...(sweepKey === undefined ? {} : { sweepKey }),
  });
}

describe('chữ "Đọc biểu đồ" nói đúng hình màn tính dựng', () => {
  it.each(TRONG_PHAM_VI.map((formula) => [formula.spec.id, formula] as const))(
    '%s',
    (_id, formula) => {
      const keHoach = keHoachBieuDo(formula, CTX);
      expect(bieuDoProblems(keHoach, BIEU_DO_RIENG[formula.spec.id])).toEqual([]);
    },
  );

  /*
   * Trục chỉ vẽ được trên chuỗi giá đã nạp thì lúc build không đo được chiều, nên `kiem.ts` không
   * đối chiếu chiều ở đó. Ca này làm nốt phần ấy: một đoạn CHỈ nhắc một chiều là đang hứa "chuỗi
   * nào cũng ra chiều này" (Sharpe theo lãi suất phi rủi ro bao giờ cũng đi xuống) — đem lời hứa ấy
   * thử trên bốn chuỗi dựng khác hẳn nhau, không chuỗi nào được đi ngược. Đoạn giải thích cả hai
   * chiều thì không hứa gì, và được bỏ qua.
   */
  it.each(TRONG_PHAM_VI.map((formula) => [formula.spec.id, formula] as const))(
    '%s — chiều hứa cho trục ăn chuỗi giá đứng vững trên mọi chuỗi thử',
    (_id, formula) => {
      const keHoach = keHoachBieuDo(formula, CTX);
      const rieng = BIEU_DO_RIENG[formula.spec.id];
      const sai: string[] = [];

      for (const truc of keHoach?.truc ?? []) {
        const chu = rieng?.truc?.[truc.khoa];
        if (truc.hinh !== undefined || chu === undefined) continue;

        const hua = chieuDuyNhat(chu.duong.vi, 'vi');
        if (hua !== chieuDuyNhat(chu.duong.en, 'en')) {
          sai.push(`${truc.khoa}: bản vi và bản en hứa hai chiều khác nhau`);
        }
        if (hua === null) continue;

        CHUOI_THU.forEach((ctx, i) => {
          const hinh = doHinh(ve(formula, ctx, 'advanced', truc.khoa), truc.khoa);
          if (hinh !== undefined && hinh.chieu !== 'ngang' && hinh.chieu !== hua) {
            sai.push(`${truc.khoa}: chữ hứa "${hua}" mà chuỗi thử ${String(i)} ra "${hinh.chieu}"`);
          }
        });
      }

      expect(sai).toEqual([]);
    },
  );

  it.skipIf(CHI.length > 0)('kho không có mục cho id nào ngoài Registry', () => {
    const ids = new Set(FORMULA_MODULES.map((formula) => formula.spec.id));
    expect(Object.keys(BIEU_DO_RIENG).filter((id) => !ids.has(id))).toEqual([]);
  });

  /*
   * "Không được làm đối phó" — lời chủ dự án khi giao việc. Máy không đo được một đoạn có hay hay
   * không, nhưng đo được dấu hiệu rõ nhất của việc chép: hai hình mang CÙNG một đoạn. Hai hình khác
   * nhau thì ít nhất tên ô nhập hoặc tên kết quả đã khác.
   */
  it.skipIf(CHI.length > 0)('không hai đoạn nào trùng nhau từng chữ', () => {
    const thay = new Map<string, string>();
    const trung: string[] = [];

    for (const [id, rieng] of Object.entries(BIEU_DO_RIENG)) {
      const doan = [
        ...Object.entries(rieng.truc ?? {}).flatMap(([khoa, hai]) => [
          [`${id}.${khoa}`, hai.duong] as const,
          [`${id}.${khoa}`, hai.cot] as const,
        ]),
        [`${id}.thoiGian`, rieng.thoiGian?.duong] as const,
        [`${id}.thoiGian`, rieng.thoiGian?.cot] as const,
        [`${id}.bocTach`, rieng.bocTach] as const,
      ];
      for (const [cho, mot] of doan) {
        if (mot === undefined) continue;
        for (const chu of [mot.vi, mot.en]) {
          const truoc = thay.get(chu);
          if (truoc !== undefined) trung.push(`${truoc} = ${cho}: ${chu.slice(0, 60)}…`);
          thay.set(chu, cho);
        }
      }
    }

    expect(trung).toEqual([]);
  });
});

describe.skipIf(CHI.length > 0)('kế hoạch đọc đúng thứ màn tính dựng', () => {
  const KE_HOACH = FORMULA_MODULES.map(
    (formula) => [formula, keHoachBieuDo(formula, CTX)] as const,
  );

  /*
   * Bảng phân bố ghim lại để một thay đổi ở bộ dựng biểu đồ (công thức đổi trục mặc định, thêm ô
   * nhập, thêm hình mới) làm ca này đỏ ĐÚNG LÚC cần viết thêm chữ — chứ không lặng lẽ để một mục
   * của ô chọn thiếu đoạn.
   */
  it('103 công thức có hình: 248 trục, 47 hình thời gian, 11 hình bóc tách', () => {
    const dem = {
      khongHinh: 0,
      moRaTheoONhap: 0,
      moRaBocTach: 0,
      moRaChoChuoi: 0,
      bocTachTrongOChon: 0,
      thoiGian: 0,
      truc: 0,
      trucChoChuoi: 0,
      trucNamNgang: 0,
      trucNangCao: 0,
      trucDaiKhac: 0,
      trucDaoChieu: 0,
    };

    for (const [, keHoach] of KE_HOACH) {
      if (keHoach === undefined) {
        dem.khongHinh += 1;
        continue;
      }
      if (keHoach.moRa === BREAKDOWN_KEY) dem.moRaBocTach += 1;
      else if (keHoach.moRa === HISTORY_KEY) dem.moRaChoChuoi += 1;
      else dem.moRaTheoONhap += 1;

      if (keHoach.bocTach?.macDinh === false) dem.bocTachTrongOChon += 1;
      if (keHoach.thoiGian !== undefined) dem.thoiGian += 1;

      for (const truc of keHoach.truc) {
        dem.truc += 1;
        if (truc.hinh === undefined) dem.trucChoChuoi += 1;
        if (truc.hinh?.chieu === 'ngang') dem.trucNamNgang += 1;
        if (truc.nangCao) dem.trucNangCao += 1;
        if (truc.dai === 'khac') dem.trucDaiKhac += 1;
        if (truc.daoChieu) dem.trucDaoChieu += 1;
      }
    }

    expect(dem).toEqual({
      khongHinh: 8,
      moRaTheoONhap: 63,
      moRaBocTach: 5,
      moRaChoChuoi: 35,
      bocTachTrongOChon: 6,
      thoiGian: 47,
      truc: 248,
      trucChoChuoi: 51,
      trucNamNgang: 4,
      trucNangCao: 10,
      trucDaiKhac: 6,
      trucDaoChieu: 26,
    });
  });

  /*
   * Chiều đi của một đường đo trên bộ số MẶC ĐỊNH, còn khung "?" thì mở cạnh hình của bộ số người
   * dùng đang gõ. Thẩm định chữ ngày 13/10/2026 bắt được đúng kiểu lệch ấy: nhập lợi nhuận âm thì
   * ROE theo Vốn chủ thôi đi xuống mà đi lên, trong khi đoạn chữ vẫn nói "Đường đi xuống". Nên kế
   * hoạch dò từng trục xem có bộ số gõ được nào đảo chiều nó không (`KeHoachTruc.daoChieu`), và cửa
   * kiểm đòi đoạn của 26 trục ấy nói cả hai chiều. Ca này giữ cho phép dò không lặng lẽ mù đi.
   */
  it('phép dò thấy đúng những trục mà một bộ số gõ được làm đường đi ngược lại', () => {
    const daoChieu = KE_HOACH.flatMap(([formula, keHoach]) =>
      (keHoach?.truc ?? [])
        .filter((truc) => truc.daoChieu)
        .map((truc) => `${formula.spec.id}.${truc.khoa}`),
    );

    // Lỗ thay cho lãi: mẫu số lớn lên thì mức lỗ trên mỗi đơn vị nhẹ đi, đường thôi xuống mà lên.
    expect(daoChieu).toEqual(
      expect.arrayContaining(['roe.equity', 'roa.totalAssets', 'eps-co-ban.sharesOutstanding']),
    );
    // Hai nguồn vốn đổi chỗ đắt rẻ cho nhau, lãi suất thấp hơn cổ tức, quay vòng thắng kỳ dài.
    expect(daoChieu).toEqual(
      expect.arrayContaining([
        'wacc.equity',
        'gia-ly-thuyet-vn30f.days',
        'gui-quay-vong.principal',
      ]),
    );
    // Đường phẳng không có chiều để mà ngược; trục chờ chuỗi giá thì chưa có hình mặc định nào.
    expect(daoChieu).not.toContain('gia-hoa-von.quantity');
    expect(daoChieu).not.toContain('ty-so-sharpe.riskFree');
    // Đường chỉ PHẲNG ra khi một thừa số về 0 (P/E theo EPS lúc giá bằng 0) thì không tính là đảo.
    expect(daoChieu).not.toContain('pe.eps');
  });

  it('công thức có khối biểu đồ nào cũng có ít nhất một hình để nói', () => {
    for (const [formula, keHoach] of KE_HOACH) {
      if (keHoach === undefined) continue;
      const coHinh =
        keHoach.truc.length > 0 || keHoach.thoiGian !== undefined || keHoach.bocTach !== undefined;
      expect(coHinh, formula.spec.id).toBe(true);
    }
  });

  /*
   * Tên của hình theo một ô nhập được DỰNG bằng `lineChartTitle()` chứ không đọc từ mô hình, vì 51
   * trục chưa có mô hình nào khi chưa nạp chuỗi giá. Ca này nạp một chuỗi dựng rồi so với mô hình
   * thật của TỪNG trục: tên phải trùng từng chữ, và "trục này cần chuỗi giá" phải khớp với việc màn
   * có vẽ được nó khi chưa nạp gì hay không.
   */
  it('tên và điều kiện vẽ của từng trục khớp mô hình thật', () => {
    for (const [formula, keHoach] of KE_HOACH) {
      for (const truc of keHoach?.truc ?? []) {
        const cho = `${formula.spec.id}.${truc.khoa}`;
        const chuaNap = ve(formula, CTX, 'advanced', truc.khoa);
        const veDuocNgay = chuaNap.kind === 'line' && chuaNap.sweepKey === truc.khoa;
        expect(truc.hinh !== undefined, cho).toBe(veDuocNgay);

        const coChuoi = ve(formula, CTX_CHUOI, 'advanced', truc.khoa);
        if (coChuoi.kind !== 'line') throw new Error(`${cho}: có chuỗi giá mà vẫn không ra đường`);
        expect(coChuoi.sweepKey, cho).toBe(truc.khoa);
        expect(coChuoi.title, cho).toEqual(truc.ten);
        // Đường theo một ô nhập không bao giờ vẽ kèm đường giá, nên luôn có nút Cột.
        expect(coChuoi.overlays ?? [], cho).toEqual([]);
        expect(coChuoi.options.find((option) => option.key === truc.khoa)?.label, cho).toEqual(
          truc.truc,
        );
      }
    }
  });

  /*
   * Tên hình theo thời gian được DỰNG bằng `lineChartTitle()` chứ không đọc từ một mô hình thật, vì
   * lúc build chưa có chuỗi giá nào. Ca này nạp một chuỗi dựng rồi so với mô hình thật: tên phải
   * trùng từng chữ, hình ấy phải là hình MẶC ĐỊNH khi đã có chuỗi, và "có nút Cột hay không" phải
   * khớp với việc hình có đường vẽ kèm hay không (`ChartBody` chỉ bật lối cột khi có đúng một chuỗi).
   */
  it('tên, vai mặc định và nút Cột của hình theo thời gian khớp mô hình thật', () => {
    for (const [formula, keHoach] of KE_HOACH) {
      /*
       * Công thức không có khối biểu đồ thì bỏ qua: `buildChartModel()` vẫn dựng được một đường cho
       * chúng (`phi-giao-dich-ban` có ô giá bán), nhưng màn tính không gọi nó — `chartType: 'none'`
       * nghĩa là không dựng cả `<section>` Biểu đồ.
       */
      if (keHoach === undefined) continue;

      const model = ve(formula, CTX_CHUOI, 'advanced');
      const veThoiGian = model.kind === 'line' && model.sweepKey === HISTORY_KEY;

      if (keHoach.thoiGian === undefined) {
        expect(veThoiGian, formula.spec.id).toBe(false);
        continue;
      }
      // Bóc tách mặc định thì vẫn là bóc tách khi có chuỗi — không công thức nào vừa có cả hai.
      expect(keHoach.bocTach?.macDinh, formula.spec.id).not.toBe(true);
      if (model.kind !== 'line') throw new Error(`${formula.spec.id}: phải ra đường`);

      expect(veThoiGian, formula.spec.id).toBe(true);
      expect(model.title, formula.spec.id).toEqual(keHoach.thoiGian.ten);
      expect((model.overlays ?? []).length === 0, formula.spec.id).toBe(keHoach.thoiGian.coCot);
      expect(
        (model.overlays ?? []).map((chuoi) => chuoi.label),
        formula.spec.id,
      ).toEqual(keHoach.thoiGian.chuoiPhu);
    }
  });

  it('hình màn mở ra đúng là hình bộ dựng tự chọn khi chưa ai chọn gì', () => {
    for (const [formula, keHoach] of KE_HOACH) {
      if (keHoach === undefined) continue;
      const capThap: Level = formula.spec.level === 'advanced' ? 'advanced' : 'basic';
      const chuaNap = ve(formula, CTX, capThap);

      if (chuaNap.kind === 'unavailable') {
        // Chờ chuỗi giá: hình đầu tiên người dùng thấy là hình bộ dựng chọn ngay khi có chuỗi.
        const coChuoi = ve(formula, CTX_CHUOI, capThap);
        expect('sweepKey' in coChuoi ? coChuoi.sweepKey : undefined, formula.spec.id).toBe(
          keHoach.moRa,
        );
        continue;
      }
      expect(chuaNap.sweepKey, formula.spec.id).toBe(keHoach.moRa);
    }
  });
});

describe.skipIf(CHI.length > 0)('mục của bài khớp ô chọn "Xem kết quả đổi theo"', () => {
  const MUC = FORMULA_MODULES.map((formula) => {
    const keHoach = keHoachBieuDo(formula, CTX);
    return [formula, keHoach, mucBieuDo(keHoach, BIEU_DO_RIENG[formula.spec.id])] as const;
  });

  /*
   * Bất biến của chính yêu cầu, lời chủ dự án: *"sau khi lựa chọn … thì mới hiển thị … với tất cả
   * các loại biểu đồ của tất cả công thức"*. Khung "?" tra khối chữ bằng `ChartModel.sweepKey` của
   * hình đang hiện, nên MỌI mục mà ô chọn bày ra — ở cả hai chế độ, trước và sau khi nạp chuỗi giá
   * — đều phải có một khối mang đúng khoá ấy. Thiếu một khối là có một lựa chọn trên màn mà bấm "?"
   * ra chữ của hình khác.
   */
  it('mục nào của ô chọn cũng có khối chữ mang đúng khoá của nó', () => {
    const thieu: string[] = [];

    for (const [formula, , muc] of MUC) {
      if (formula.spec.chartType === 'none') continue;
      const khoaCo = new Set(muc?.khoi.map((khoi) => khoi.khoa));

      for (const ctx of [CTX, CTX_CHUOI]) {
        for (const level of ['basic', 'advanced'] as const) {
          const model = ve(formula, ctx, level);
          const dangHien = 'sweepKey' in model ? [model.sweepKey] : [];
          for (const khoa of [
            ...(model.kind === 'unavailable' ? [] : model.options).map((option) => option.key),
            ...dangHien,
          ]) {
            /*
             * Hai mục theo chuỗi giá (21/10/2026), mục "Cơ cấu …" (hình tròn, 22/10/2026), mục cột
             * theo kỳ và mục thang đo (23/10/2026) chưa có chữ — chủ dự án chốt "hướng dẫn sử dụng thì chưa cần" — và khung "?" im với chúng
             * (`HinhDangXem.hinhChuoi`), nên không đòi khối.
             */
            if (
              laHinhChuoiGia(khoa) ||
              khoa === COMPOSITION_KEY ||
              khoa === COLUMNS_KEY ||
              khoa === GAUGE_KEY
            )
              continue;
            if (khoa !== undefined && !khoaCo.has(khoa)) {
              thieu.push(`${formula.spec.id}: mục "${khoa}" không có khối chữ`);
            }
          }
        }
      }
    }

    expect([...new Set(thieu)]).toEqual([]);
  });

  it('khối đầu là hình màn mở ra, các khối sau theo đúng thứ tự ô chọn', () => {
    for (const [formula, keHoach, muc] of MUC) {
      if (keHoach === undefined) {
        expect(muc, formula.spec.id).toBeUndefined();
        continue;
      }
      if (muc === undefined) throw new Error(`${formula.spec.id}: thiếu mục`);

      const theoOChon = [
        ...(keHoach.bocTach === undefined ? [] : [BREAKDOWN_KEY]),
        ...(keHoach.thoiGian === undefined ? [] : [HISTORY_KEY]),
        ...keHoach.truc.map((truc) => truc.khoa),
      ];
      expect(
        muc.khoi.map((khoi) => khoi.khoa),
        formula.spec.id,
      ).toEqual([keHoach.moRa, ...theoOChon.filter((khoa) => khoa !== keHoach.moRa)]);

      for (const khoi of muc.khoi) {
        const cho = `${formula.spec.id} · ${khoi.ten.vi}`;
        // Khối nào cũng có ít nhất một đoạn để in — không có khối chỉ mang cái tên.
        expect(khoi.duong ?? khoi.thanh, cho).toBeDefined();
        // Hình bóc tách chỉ có thanh; hình đường thì không bao giờ mang đoạn của thanh.
        expect(khoi.thanh !== undefined, cho).toBe(khoi.khoa === BREAKDOWN_KEY);
      }

      // Cờ "chỉ vẽ khi đã nạp chuỗi giá": hình thời gian luôn thế, trục thì theo số đo.
      for (const truc of keHoach.truc) {
        const khoi = muc.khoi.find((mot) => mot.khoa === truc.khoa);
        expect(khoi?.canChuoi, `${formula.spec.id}.${truc.khoa}`).toBe(truc.hinh === undefined);
        expect(khoi?.nangCao, `${formula.spec.id}.${truc.khoa}`).toBe(truc.nangCao);
      }
      expect(muc.khoi.find((khoi) => khoi.khoa === HISTORY_KEY)?.canChuoi ?? true).toBe(true);
    }
  });
});

/*
 * Luật của trục đảo chiều được, thử trên chính ca làm nó ra đời: ROE theo Vốn chủ sở hữu. Hai đoạn
 * "cũ" dưới đây giữ đúng cái lỗi của bản tới 13/10/2026 — đúng tên ô, đúng dải, đúng chiều mặc
 * định, và chỉ nói MỘT chiều — nên mọi luật khác đều qua, riêng luật này phải bắt.
 *
 * Ca kiểm gác cả hai dạng vì khung "?" chỉ in một dạng: câu rào ở đoạn Đường không che được đoạn Cột.
 */
describe.skipIf(CHI.length > 0)('trục đảo chiều được thì đoạn chữ phải nói cả hai chiều', () => {
  const roe = FORMULA_MODULES.find((formula) => formula.spec.id === 'roe');
  if (roe === undefined) throw new Error('Registry thiếu roe');
  const keHoach = keHoachBieuDo(roe, CTX);
  const rieng = BIEU_DO_RIENG.roe;
  if (rieng?.truc === undefined) throw new Error('kho thiếu roe');

  const voi = (equity: NonNullable<typeof rieng.truc>[string]) =>
    bieuDoProblems(keHoach, { ...rieng, truc: { ...rieng.truc, equity } });

  const DUONG_CU = {
    vi: 'Đường chạy theo ô Vốn chủ sở hữu, từ một nửa đến gấp rưỡi con số bạn đang nhập. Đây là phép thử, không phải diễn biến thị trường. Đường đi xuống và thoải dần: vốn chủ càng dày thì mỗi đồng vốn sinh lời càng ít.',
    en: 'The line runs along the Equity field, from half to one and a half times the figure you have entered. It is a what-if, not market history. The line falls and flattens: thicker equity means each unit of capital earns less.',
  };
  const COT_CU = {
    vi: 'Mỗi cột là ROE ở một mức vốn chủ, cột thấp dần về bên phải và cột tô đặc là mức bạn đang nhập. Cột cao bên trái là ít vốn chủ hơn.',
    en: 'Each bar is ROE at one equity level; bars shrink to the right and the solid one is the level you have entered. A tall bar on the left means less equity.',
  };

  it('ROE theo Vốn chủ là một trục như thế: lợi nhuận âm thì đường đi lên', () => {
    expect(keHoach?.truc.find((truc) => truc.khoa === 'equity')?.daoChieu).toBe(true);
  });

  it('đoạn chỉ nói một chiều bị bắt ở cả dạng Đường lẫn dạng Cột, cả hai thứ tiếng', () => {
    const loi = voi({ duong: DUONG_CU, cot: COT_CU });

    expect(loi).toHaveLength(4);
    expect(loi.filter((dong) => dong.includes('truc.equity.duong'))).toHaveLength(2);
    expect(loi.filter((dong) => dong.includes('truc.equity.cot'))).toHaveLength(2);
    expect(loi.every((dong) => dong.includes('có bộ số gõ được'))).toBe(true);
  });

  it('nêu thêm ca đảo thì qua; đoạn Cột không tả chiều nào cũng qua', () => {
    const duong = {
      vi: `${DUONG_CU.vi} Doanh nghiệp đang lỗ thì đường đi lên.`,
      en: `${DUONG_CU.en} For a loss-making company the line rises.`,
    };
    const haiCa = {
      vi: `${COT_CU.vi} Doanh nghiệp đang lỗ thì cột quay xuống dưới và ngắn dần.`,
      en: `${COT_CU.en} For a loss-making company the bars hang down and get shorter.`,
    };
    const khongTaChieu = {
      vi: 'Mỗi cột là ROE ở một mức vốn chủ, cột tô đặc là mức bạn đang nhập. Hãy đọc chiều cao cột cùng với hệ số nợ của doanh nghiệp.',
      en: 'Each bar is ROE at one equity level, and the solid one is the level you have entered. Read bar height together with the debt ratio.',
    };

    expect(voi({ duong, cot: haiCa })).toEqual([]);
    expect(voi({ duong, cot: khongTaChieu })).toEqual([]);
  });

  it('chữ đang nằm trong kho của trục ấy qua được luật', () => {
    expect(bieuDoProblems(keHoach, rieng)).toEqual([]);
  });
});

/*
 * Trục của NHÓM DO NGƯỜI DÙNG THÊM — đợt mua thứ tư, kỳ thứ tư trở đi (13/10/2026).
 *
 * Hai công thức có nhóm ô lặp (`spec.repeat`). Ô của nhóm thêm không nằm trong `spec.variables`, nên
 * 248 trục ghim ở trên không đếm chúng; nhưng bấm "Thêm đợt mua" là ô chọn "Xem kết quả đổi theo"
 * có ngay mục của chúng. Mỗi ô MẪU một đoạn chữ dùng chung cho mọi nhóm thêm, mang `{n}` ở chỗ số
 * thứ tự. Các ca dưới giữ ba điều: đúng những ô mẫu ấy có chữ, mục nào ô chọn bày ra sau khi thêm
 * nhóm cũng tìm được khối của nó, và chiều đi mà đoạn hứa là chiều thật trên một nhóm có số.
 */
describe.skipIf(CHI.length > 0)('trục của nhóm do người dùng thêm', () => {
  const CO_NHOM_LAP = FORMULA_MODULES.filter((formula) => formula.spec.repeat !== undefined);

  /** Bộ số sau khi thêm MỘT nhóm, nhóm mới chép số của nhóm đầu để hình vẽ được ngay. */
  function themMotNhom(formula: FormulaModule): { inputs: Record<string, number>; n: number } {
    const goc = defaultInputs(formula.spec);
    const inputs = addRepeatGroup(formula.spec, goc);
    if (inputs === null) throw new Error(`${formula.spec.id}: không thêm được nhóm`);

    const n = (repeatLimits(formula.spec)?.declared ?? 0) + 1;
    for (const mau of formula.spec.repeat?.fields ?? []) {
      inputs[repeatKey(mau.key, n)] = goc[repeatKey(mau.key, 1)] ?? mau.defaultValue;
    }
    return { inputs, n };
  }

  it('đúng ba ô mẫu có đoạn chữ: tiền và giá của một đợt mua, lợi suất của một kỳ', () => {
    const coChu = CO_NHOM_LAP.flatMap((formula) =>
      Object.keys(BIEU_DO_RIENG[formula.spec.id]?.trucLap ?? {}).map(
        (tienTo) => `${formula.spec.id}.${tienTo}`,
      ),
    );
    expect(coChu.sort()).toEqual([
      'gia-von-trung-binh-dca.amount',
      'gia-von-trung-binh-dca.price',
      'loi-suat-trung-binh-hinh-hoc.r',
    ]);

    // Không công thức nào khác mang chữ mẫu: `kiem.ts` chặn từng công thức, ca này chặn cả kho.
    const ngoai = FORMULA_MODULES.filter(
      (formula) =>
        formula.spec.repeat === undefined && BIEU_DO_RIENG[formula.spec.id]?.trucLap !== undefined,
    ).map((formula) => formula.spec.id);
    expect(ngoai).toEqual([]);
  });

  it('thêm một nhóm thì mục mới của ô chọn tìm được khối chữ của nó', () => {
    for (const formula of CO_NHOM_LAP) {
      const { inputs, n } = themMotNhom(formula);
      const moRong = resolveRepeat(formula, inputs);
      const muc = mucBieuDo(keHoachBieuDo(formula, CTX), BIEU_DO_RIENG[formula.spec.id]);
      const khoaCo = new Set(muc?.khoi.map((khoi) => khoi.khoa));
      const mauCo = new Set(muc?.khoiLap?.map((khoi) => repeatKey(khoi.tienTo, n)));

      const model = buildChartModel({
        formula: moRong,
        inputs,
        ctx: CTX,
        output: runFormula(moRong, inputs, CTX),
        level: 'advanced',
      });
      const muc4 = (model.kind === 'unavailable' ? [] : model.options).map((option) => option.key);

      // Ô chọn phải thật sự bày mục của nhóm vừa thêm, không thì ca này qua mà không thử gì.
      for (const mau of formula.spec.repeat?.fields ?? []) {
        expect(muc4, formula.spec.id).toContain(repeatKey(mau.key, n));
      }
      for (const khoa of muc4) {
        /* Mục cột theo kỳ ("Từng đợt mua", 23/10/2026) chưa có chữ — khung "?" im với nó. */
        if (khoa === COLUMNS_KEY) continue;
        expect(khoaCo.has(khoa) || mauCo.has(khoa), `${formula.spec.id}: mục "${khoa}"`).toBe(true);
      }
    }
  });

  it('điền số thứ tự xong thì đoạn mẫu không còn sót {n}, và gọi đúng tên ô của nhóm ấy', () => {
    for (const formula of CO_NHOM_LAP) {
      const { inputs, n } = themMotNhom(formula);
      const moRong = resolveRepeat(formula, inputs);
      const muc = mucBieuDo(keHoachBieuDo(formula, CTX), BIEU_DO_RIENG[formula.spec.id]);

      for (const khoi of muc?.khoiLap ?? []) {
        const bien = moRong.spec.variables.find((v) => v.key === repeatKey(khoi.tienTo, n));
        expect(bien, `${formula.spec.id}.${khoi.tienTo}`).toBeDefined();

        for (const doan of [khoi.ten, khoi.duong, ...(khoi.cot === undefined ? [] : [khoi.cot])]) {
          const dien = fillRepeat(doan, n);
          expect(dien.vi).not.toContain('{n}');
          expect(dien.en).not.toContain('{n}');
        }
        expect(fillRepeat(khoi.duong, n).vi).toContain(`ô ${bien?.label.vi ?? '@@'}`);
        expect(fillRepeat(khoi.duong, n).en).toContain(bien?.label.en ?? '@@');
      }
    }
  });

  /*
   * Cùng lẽ với trục chỉ vẽ được trên chuỗi giá: đoạn CHỈ nhắc một chiều là đang hứa chiều ấy. Thử
   * lời hứa trên một nhóm thứ tư mang số thật. Đoạn nêu cả hai chiều (tiền mua một đợt: lên hay
   * xuống tuỳ giá đợt ấy so với giá vốn) không hứa gì và được bỏ qua.
   */
  it('chiều mà đoạn mẫu hứa là chiều thật của đường trên một nhóm có số', () => {
    let daThu = 0;

    for (const formula of CO_NHOM_LAP) {
      const { inputs, n } = themMotNhom(formula);
      const moRong = resolveRepeat(formula, inputs);

      for (const [tienTo, chu] of Object.entries(BIEU_DO_RIENG[formula.spec.id]?.trucLap ?? {})) {
        const hua = chieuDuyNhat(chu.duong.vi, 'vi');
        expect(chieuDuyNhat(chu.duong.en, 'en'), `${formula.spec.id}.${tienTo}`).toBe(hua);
        if (hua === null) continue;

        const khoa = repeatKey(tienTo, n);
        const hinh = doHinh(
          buildChartModel({
            formula: moRong,
            inputs,
            ctx: CTX,
            output: runFormula(moRong, inputs, CTX),
            level: 'advanced',
            sweepKey: khoa,
          }),
          khoa,
        );
        expect(hinh?.chieu, `${formula.spec.id}.${khoa}`).toBe(hua);
        daThu += 1;
      }
    }

    // Lợi suất một kỳ là trục duy nhất hứa một chiều; về 0 nghĩa là ca này không còn thử gì.
    expect(daThu).toBe(1);
  });
});
