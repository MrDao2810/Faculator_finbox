import { describe, expect, it } from 'vitest';

import type { CalcContext } from '../calc/types';
import { FORMULA_MODULES, findFormulaModule } from '../formulas';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { baiHuongDan } from './bai';
import { THU_TU_MUC } from './types';

/**
 * Cửa gác của bài hướng dẫn từng công thức (WF-21).
 *
 * Bài được SUY RA từ Registry chứ không viết tay, nên ca kiểm ở đây canh đúng hai thứ mà phép suy
 * có thể làm hỏng: bài nói sai so với Registry, và bài nói THỪA những thứ Registry không có.
 *
 * ── Đợt 5 (03/10/2026): ba ca kiểm BỊ XOÁ ───────────────────────────────────────────────────
 *
 * Trước đợt ấy có một ca tên "ba câu diễn giải chép NGUYÊN VĂN, không cắt không nối" — nó ghim
 * rằng `dungKhiNao`/`cachDoc`/`saiLam` phải `toEqual` `spec.explanation.*`. Ca ấy XANH suốt, và
 * chính nó là bằng chứng của khuyết điểm chủ dự án chỉ ra: bài in lại đúng ba câu khối "Giải thích
 * cho người mới" đang in trên cùng màn. Hai ca về bảng ô nhập cũng đi theo bảng ấy.
 *
 * ── Đợt 8 (05/10/2026): MƯỜI ca kiểm nữa bị xoá, và lý do khác hẳn ───────────────────────────
 *
 * Đợt 5 xoá ca vì chúng gác một lời hứa đã thu hồi. Đợt 8 xoá ca vì thứ chúng gác KHÔNG CÒN TỒN
 * TẠI: chủ dự án chốt bài chỉ được mang chữ trong `guide-111.json` (*"câu thừa trước đó thì bỏ đi,
 * chỉ để lại những câu đã tạo trong file tôi gửi thôi"*), nên mười cờ của `BaiHuongDan` mất chỗ
 * dùng và mất luôn. Mười ca đi theo:
 *
 *   · mục "Đọc hình công thức" (2 ca) — cả mục đi, vì file không có chữ nào cho nó;
 *   · `coBocTach` (1), `coTrucThoiGian` (1), `soPhienToiThieu` (3), `duongNapSo` (2) — bốn cờ của
 *     mục Nhập số và mục Biểu đồ;
 *   · `hangSo` (1), `ghiChuPhamVi` (1), `coONangCao` (1), `oNhanTuCongThuc` (3).
 *
 * Mấy ca ấy đo được những thứ không dễ đo lại — `soPhienToiThieu` chạy `calc` tới 300 lượt cho mỗi
 * công thức chuỗi; `coTrucThoiGian` đối chiếu khớp `historyPlan()` 111/111. `git log` giữ nguyên
 * chúng. Đừng dựng lại ca trước khi dựng lại cờ, và đừng dựng lại cờ trước khi có câu cho nó.
 *
 * Các con số ghim là tripwire, không phải chỉ tiêu: thêm công thức thứ 112 làm ca này đỏ, đúng
 * điều mong muốn — ai thêm phải đọc `docs/wf21/README.md` trước.
 */

const CTX: CalcContext = { asOf: '2026-08-04', schedule: scheduleOrDefault(MARKET_CONFIG) };

const BAI = FORMULA_MODULES.map((formula) => baiHuongDan(formula, CTX));

/** Công thức có khối biểu đồ trên màn — 111 trừ 9 công thức `chartType: 'none'`. */
const SO_CT_CO_BIEU_DO = 102;

describe('bài hướng dẫn dựng được cho cả thư viện', () => {
  it('mọi công thức đều có bài, không ca nào ném lỗi', () => {
    expect(BAI).toHaveLength(FORMULA_MODULES.length);
    expect(BAI.length).toBe(111);
  });

  it('mục lục luôn theo đúng thứ tự đã chốt, không bài nào tự đảo', () => {
    for (const bai of BAI) {
      const dung = THU_TU_MUC.filter((muc) => bai.mucCo.includes(muc));
      expect(bai.mucCo, bai.id).toEqual(dung);
    }
  });

  /*
   * Hai mục luôn có, và cả hai vì cùng một lẽ: chúng chạy bằng chữ riêng của công thức, thứ cả 111
   * công thức đều có đủ (`noi-dung.test.ts` gác). Hai mục còn lại thì có điều kiện — biểu đồ theo
   * `chartType`, kết quả trống theo ca hỏng `calc` phát ra được.
   *
   * Đợt 5 ca này nói "ba mục": mục `hieu-cong-thuc` khi ấy cũng luôn có, vì nó chạy bằng chữ dùng
   * chung. Nó đi ở đợt 8 cùng chữ ấy.
   */
  it('hai mục luôn có vì cả 111 công thức đều có chữ riêng cho chúng', () => {
    for (const bai of BAI) {
      expect(bai.mucCo, bai.id).toContain('nhap-so');
      expect(bai.mucCo, bai.id).toContain('doc-ket-qua');
      expect(bai.mucCo, bai.id).not.toContain('hieu-cong-thuc');
    }
  });

  /*
   * Ca này là cửa gác của lời phê đợt 5. Nó không đọc được "câu này có phải chữ thao tác không" —
   * máy không đọc được điều đó — nhưng nó đọc được điều kề bên và đủ: bài KHÔNG CÒN MANG chữ nội
   * dung nào của `explanation`. Mất cả bốn trường ấy khỏi `BaiHuongDan` thì không có đường nào để
   * một câu diễn giải lọt lại vào bài mà không ai thấy.
   *
   * Đợt 8 ghim thêm mười cờ đã bỏ, cùng một cách và cùng một lý do: thêm lại một trường mà KHÔNG
   * dùng thì không gì đỏ cả, trừ ca này.
   *
   * Viết bằng `Object.keys` chứ bằng typecheck: thêm lại `dungKhiNao` là lỗi biên dịch ở
   * `GuideBody`, nhưng thêm nó mà không dùng thì lặng im.
   */
  it('bài không mang theo trường diễn giải hay cờ nào đã bỏ', () => {
    const khoa = Object.keys(BAI[0] ?? {});

    for (const bo of ['dungKhiNao', 'cachDoc', 'saiLam', 'oNhap', 'donViKetQua']) {
      expect(
        khoa,
        `trường "${bo}" đã bỏ ở đợt 5 — bài nói việc, không in lại diễn giải`,
      ).not.toContain(bo);
    }

    for (const bo of [
      'coKhungCachTinh',
      'hinhNhieuDong',
      'duongNapSo',
      'soPhienToiThieu',
      'oNhanTuCongThuc',
      'coONangCao',
      'hangSo',
      'ghiChuPhamVi',
      'coBieuDo',
      'coBocTach',
      'coTrucThoiGian',
    ]) {
      expect(
        khoa,
        `cờ "${bo}" đã bỏ ở đợt 8 — không còn câu dùng chung nào để nó bật tắt`,
      ).not.toContain(bo);
    }
  });
});

describe('mục "Khi kết quả hiện _ _" lấy MÃ bằng cách chạy calc thật', () => {
  /*
   * Bài in câu của `guide-111.json` theo mã, nhưng MÃ NÀO có mặt thì do chạy `calc` quyết định —
   * đó là phần không thể viết tay, và là phần ca này gác.
   *
   * Trước đợt 8 ca này ghim nguyên văn câu `calc` viết ("Chưa tính được P/E vì EPS bằng 0." và câu
   * "cách sửa"). Câu ấy nay không vào bài nữa; nó vẫn sống trong `calc` và vẫn hiện trên màn tính
   * khi lỗi xảy ra thật, nơi `formulas.test.ts` gác nó.
   */
  it('P/E phát ra đúng hai mã, đúng thứ tự WF-15', () => {
    const pe = findFormulaModule('pe');
    expect(pe).toBeDefined();
    const bai = baiHuongDan(pe!, CTX);

    expect(bai.ketQuaTrong).toEqual(['DIVIDE_BY_ZERO', 'MEANINGLESS']);
  });

  /*
   * `INCOMPLETE_INPUT` xảy ra với cả 111 công thức mỗi khi còn một ô trống, và `runFormula` dựng nó
   * trước cả khi gọi `calc` — một mục liệt kê nó là mục ai cũng có và không ai cần.
   */
  it('không bài nào liệt kê "chưa nhập đủ", và không mã nào lặp', () => {
    for (const bai of BAI) {
      expect(bai.ketQuaTrong, bai.id).not.toContain('INCOMPLETE_INPUT');
      expect(new Set(bai.ketQuaTrong).size, bai.id).toBe(bai.ketQuaTrong.length);
    }
  });

  /*
   * Công thức không khai ca hỏng nào thì bài KHÔNG có mục ấy — nhóm phí, thuế, trả góp gần như
   * không hỏng được. Thiếu mục là đúng; bịa mới là sai. Con số này chỉ được phép đi LÊN.
   */
  it('số công thức có mục "Khi kết quả hiện _ _"', () => {
    const co = BAI.filter((bai) => bai.mucCo.includes('ket-qua-trong'));
    expect(co.length).toBe(100);
    for (const bai of co) expect(bai.ketQuaTrong.length, bai.id).toBeGreaterThan(0);
    for (const bai of BAI.filter((b) => !b.mucCo.includes('ket-qua-trong'))) {
      expect(bai.ketQuaTrong, bai.id).toEqual([]);
    }
  });
});

describe('mục "Đọc biểu đồ" chỉ có khi màn thật có khối biểu đồ', () => {
  /*
   * 9 công thức `chartType: 'none'` không dựng cả `<section>` lẫn `<h2>Biểu đồ</h2>` — `showChart`
   * chặn sớm ở `FormulaDetail`. Một mục dạy đọc hình ở đó là dạy đọc một thứ không có trên màn, và
   * nút "?" của khối biểu đồ cũng không tồn tại để mở nó.
   */
  it('đúng 102 bài có mục, và 9 bài không có là 9 công thức không có biểu đồ', () => {
    const co = BAI.filter((bai) => bai.mucCo.includes('doc-bieu-do'));
    expect(co).toHaveLength(SO_CT_CO_BIEU_DO);

    const khong = BAI.filter((bai) => !bai.mucCo.includes('doc-bieu-do')).map((bai) => bai.id);
    expect(khong.sort()).toEqual(
      [
        'basis-vn30f',
        'loi-suat-vuot-chuan',
        'phi-giao-dich-ban',
        'phi-giao-dich-mua',
        'phi-luu-ky',
        'rut-truoc-han',
        'thue-chuyen-nhuong',
        'thue-co-tuc',
        'xirr',
      ].sort(),
    );
  });

  /*
   * `kieuBieuDo` là thứ chọn đoạn chữ cho mục, nên nó phải khớp `spec.chartType` từng công thức —
   * lệch một bài là bài ấy dạy đọc một loại hình khác với hình nó đang vẽ.
   *
   * Đợt 8 đổi trường này từ cờ `coBieuDo: boolean` sang LOẠI, vì `guide-111.json` viết một đoạn
   * riêng cho mỗi loại thay cho bảy câu nói cho mọi loại.
   */
  it('kiểu biểu đồ trong bài khớp `spec.chartType`, và vắng đúng ở 9 công thức không có hình', () => {
    for (const formula of FORMULA_MODULES) {
      const bai = baiHuongDan(formula, CTX);
      if (formula.spec.chartType === 'none') {
        expect(bai.kieuBieuDo, formula.spec.id).toBeUndefined();
        expect(bai.mucCo, formula.spec.id).not.toContain('doc-bieu-do');
      } else {
        expect(bai.kieuBieuDo, formula.spec.id).toBe(formula.spec.chartType);
      }
    }
  });

  /*
   * Mỗi loại hình đang dùng phải có đoạn chữ của nó, nên ca này ghim BẢNG PHÂN BỐ: tám loại, và số
   * công thức mỗi loại. Một loại thứ chín xuất hiện làm ca đỏ, đúng lúc cần thêm hai khoá
   * `guide.chartKind.<loại>.*` — `heatmap` và `tornado` đã có sẵn khoá chờ, chưa công thức nào vẽ.
   */
  it('tám loại hình đang dùng, đúng số công thức mỗi loại', () => {
    const dem: Record<string, number> = {};
    for (const bai of BAI) {
      if (bai.kieuBieuDo === undefined) continue;
      dem[bai.kieuBieuDo] = (dem[bai.kieuBieuDo] ?? 0) + 1;
    }

    expect(dem).toEqual({
      sensitivity: 66,
      candlestick: 11,
      histogram: 9,
      stackedBar: 6,
      waterfall: 4,
      underwater: 4,
      scatter: 2,
    });
  });
});

describe('chữ riêng của công thức đi vào bài, đủ và đúng ô', () => {
  it('cả 111 bài đều có chữ riêng', () => {
    for (const bai of BAI) {
      expect(bai.rieng, bai.id).toBeDefined();
      expect(bai.rieng?.deLamGi.vi.trim(), bai.id).not.toBe('');
      expect(bai.rieng?.docKetQua.vi.trim(), bai.id).not.toBe('');
      expect(bai.rieng?.deSai.vi.trim(), bai.id).not.toBe('');
    }
  });

  /*
   * Ô trong bài phải đúng thứ tự `spec.variables`, vì bài liệt kê ô theo đúng thứ tự khối Số liệu
   * bày chúng — mắt người đọc đi từ trên xuống phải khớp với màn.
   *
   * `bai.ts` duyệt `spec.variables` rồi mới tra kho, chính là để thứ tự này không cần ai nhớ giữ;
   * ca này gác điều ấy không bị đảo ngược.
   */
  it('ô nhập trong bài đúng thứ tự và đủ số ô của `spec.variables`', () => {
    for (const formula of FORMULA_MODULES) {
      const bai = baiHuongDan(formula, CTX);
      expect(
        bai.rieng?.oNhap.map((o) => o.key),
        formula.spec.id,
      ).toEqual(formula.spec.variables.map((bien) => bien.key));
    }
  });

  /*
   * Nhãn và cờ Nâng cao lấy từ `spec`, kho chữ không khai lại — nên chúng không thể lệch. Ca này
   * gác rằng phép ghép ấy không bị thay bằng một bản sao trong kho.
   */
  it('nhãn ô và cờ Nâng cao là bản thật của Registry, không phải bản sao', () => {
    for (const formula of FORMULA_MODULES) {
      const bai = baiHuongDan(formula, CTX);
      for (const [i, bien] of formula.spec.variables.entries()) {
        const o = bai.rieng?.oNhap[i];
        expect(o?.nhan, `${formula.spec.id}.${bien.key}`).toEqual(bien.label);
        expect(o?.nangCao, `${formula.spec.id}.${bien.key}`).toBe(bien.level === 'advanced');
      }
    }
  });

  /* 12/269 ô chỉ hiện ở chế độ Nâng cao — con số này ghim để dấu trong bài không lặng lẽ lệch. */
  it('đúng 12 ô mang cờ Nâng cao', () => {
    const nangCao = BAI.flatMap((bai) =>
      (bai.rieng?.oNhap ?? []).filter((o) => o.nangCao).map((o) => `${bai.id}.${o.key}`),
    );
    expect(nangCao).toHaveLength(12);
  });
});
