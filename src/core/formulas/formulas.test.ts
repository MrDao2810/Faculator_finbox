/**
 * Bài test này là lưới an toàn của cả thư viện công thức.
 *
 * Nó KHÔNG liệt kê từng công thức: nó duyệt `FORMULA_MODULES` và chạy chính các ca kiểm thử
 * mà mỗi công thức tự khai trong `spec.tests`. Thêm công thức mới là ca của nó tự động vào đây,
 * không phải đăng ký ở đâu — đúng ý NFR-MNT-02, và không có chỗ nào để quên.
 */

import { describe, expect, it } from 'vitest';

import { clampToSpec } from '../calc-output';
import { runFormula } from '../calc/run';
import { formatFailures, runSpecTests } from '../calc/run-tests';
import type { CalcContext } from '../calc/types';
import type { CalcOutput } from '../types';
import type { FormulaSpec } from '../registry/types';
import {
  DASHES,
  blocksInLatex,
  equationsInLatex,
  equationsInText,
  expressionBlockProblems,
  expressionLines,
  numbersInLatex,
  numbersInText,
} from '../expression-rules';
import { formatNumber } from '../format';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { latexSymbolTokens } from '../latex-symbols';
import { evaluateWorked } from '../quiz/worked-line';
import { substitutionKeys } from '../substitution';
import { datSoDanXuat, datSoThaySo, giaTriChoDanXuat } from '../substitution-cay';
import { derivedStages } from '../chart/breakdown';
import { derivedShape, substitutionShape } from '../substitution-shape';
import { chuCuaCay, tinhCay } from '../quiz/nut';
import { createRegistry, defaultInputs } from '../registry/build';
import { errorsOnly, formatIssues } from '../registry/validate';
import { buildFeeBreakdown } from './fees';
import { ALL_FORMULAS, FORMULA_MODULES, findFormulaModule } from './index';
import {
  SCHEDULE_GAP,
  amortisationFor,
  buildAmortisation,
  condenseSchedule,
  condenseWithGaps,
} from './personal';
import { xirr } from './returns';

/**
 * Ngữ cảnh của VÍ DỤ một công thức — công thức ăn chuỗi/dòng tiền cần chúng mới ra số.
 *
 * Tách ra thành hàm vì hai chỗ cần: ca kiểm ví dụ khớp calc, và cửa gác điều khiển chết ở cuối file.
 */
function ctxCuaViDu(spec: FormulaSpec): CalcContext {
  const ex = spec.example;
  if (
    ex.series === undefined &&
    ex.bars === undefined &&
    ex.marketSeries === undefined &&
    ex.cashflows === undefined
  )
    return CTX;
  return {
    ...CTX,
    series: ex.series,
    bars: ex.bars,
    marketSeries: ex.marketSeries,
    cashflows: ex.cashflows,
  };
}

/** Ngày tra hằng số. Cố định để kết quả xác định (NFR-REL-03). */
const AS_OF = '2026-08-04';

const CTX: CalcContext = { asOf: AS_OF, schedule: scheduleOrDefault(MARKET_CONFIG) };

describe('mọi ca kiểm thử khai trong Registry đều phải đạt (NFR-MNT-02)', () => {
  for (const formula of FORMULA_MODULES) {
    it(`${formula.spec.id} — ${formula.spec.name.vi}`, () => {
      const failures = runSpecTests(formula, CTX);
      expect(formatFailures(failures)).toBe('');
    });
  }

  it('không công thức nào thiếu hàm tính, và tổng khớp tổng của 12 nhóm', () => {
    // KHÔNG viết cứng một con số: nhánh 5 đổ công thức theo từng đợt, con số cứng chỉ tạo ra
    // một chỗ phải sửa tay mỗi lần. Thứ đáng khoá là các BẤT BIẾN — spec luôn đi liền hàm
    // tính, và tổng không vượt trần SRS (ca riêng ở dưới).
    expect(FORMULA_MODULES.length).toBeGreaterThan(0);
    expect(ALL_FORMULAS).toHaveLength(FORMULA_MODULES.length);

    for (const spec of ALL_FORMULAS) {
      expect(findFormulaModule(spec.id), spec.id).toBeDefined();
    }
  });

  it('không trùng id — id đi thẳng vào URL nên trùng là hỏng route (FR-25)', () => {
    const ids = ALL_FORMULAS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Registry với toàn bộ công thức thật', () => {
  it('không còn lỗi nghiêm trọng nào', () => {
    const registry = createRegistry(ALL_FORMULAS);
    expect(formatIssues(errorsOnly(registry.issues))).toBe('');
  });

  it('mọi công thức đều có ít nhất một ca kiểm thử', () => {
    for (const spec of ALL_FORMULAS) {
      expect(spec.tests.length, spec.id).toBeGreaterThan(0);
    }
  });

  it('ví dụ trên màn chi tiết khớp đúng kết quả hàm tính (FR-02)', () => {
    for (const formula of FORMULA_MODULES) {
      const { id, example } = formula.spec;
      // Ví dụ của công thức chuỗi mang theo chuỗi giá riêng — bơm vào ctx thì mới kiểm được.
      const ctx: typeof CTX =
        example.series === undefined &&
        example.bars === undefined &&
        example.marketSeries === undefined &&
        example.cashflows === undefined
          ? CTX
          : {
              ...CTX,
              series: example.series,
              bars: example.bars,
              marketSeries: example.marketSeries,
              cashflows: example.cashflows,
            };
      const out = runFormula(formula, example.inputs, ctx);

      expect(out.value, `${id} — ví dụ phải tính được`).not.toBeNull();
      expect(Math.abs((out.value ?? 0) - example.expected), id).toBeLessThanOrEqual(1);
    }
  });

  /*
   * Dòng "thay số" của khối gộp (`spec.substitution`, 01/10/2026) — in ra thứ như
   * `92.000 ÷ 6.050 = 15,21` ngay dưới con số kết quả.
   *
   * Nó là một lời hứa: ai lấy máy tính bấm lại đúng dòng ấy phải ra đúng con số bên trên. Mẫu lại
   * viết tay (xem docblock `FormulaSpec.substitution`), nên chỗ duy nhất chặn được là tính lại —
   * cùng cách `worked` của bài tập và `thaySo` của ví dụ thực tế đang được gác.
   *
   * Thay số của `example.inputs` chứ không phải số mặc định: ví dụ đã có sẵn `expected` được ca
   * kiểm ngay trên đối chiếu với `calc`, nên chỉ cần một mốc là đủ cho cả hai đầu.
   */
  /*
   * Mẫu thay số KHÔNG được chép giá trị của một hằng số thị trường.
   *
   * Lỗi thật, bắt được khi rà tay 01/10/2026: 12 mẫu viết thẳng `× 0,15 ÷ 100` (phí giao dịch),
   * `× 5 ÷ 100` (thuế cổ tức), `× 100.000` (hệ số nhân hợp đồng VN30F). Ca kiểm tính lại ngay dưới
   * vẫn XANH — vì với biểu phí mặc định thì con số đúng. Nó chỉ sai khi mức phí đổi, hoặc ngay lập
   * tức với người dùng đã chọn biểu phí khác ở màn Cài đặt: dòng in ra nói 0,15% trong khi con số
   * bên cạnh nó tính theo mức khác.
   *
   * Đây đúng là thứ `ConstantsNote` tồn tại để chặn — khai KHOÁ, không khai giá trị, để mức phí
   * đổi thì màn đổi theo. Nên luật ở đây là luật cấu trúc, không phải luật số học: công thức nào
   * đọc hằng số thì chưa được có mẫu, cho tới khi mẫu tham chiếu được hằng số qua khoá.
   */
  it('mẫu thay số không chép giá trị hằng số thị trường', () => {
    const pham = ALL_FORMULAS.filter(
      (spec) => spec.substitution !== undefined && (spec.usesConstants?.length ?? 0) > 0,
    ).map((spec) => spec.id);

    expect(pham).toEqual([]);
  });

  /*
   * Ca này gác CHÍNH ĐƯỜNG MÀN ĐANG DÙNG, không gác một bản sao của nó (05/10/2026).
   *
   * Tới 05/10 nó chạy `fillSubstitution` — phép thay chữ sinh ra một DÒNG, rồi `evaluateWorked`
   * đọc lại dòng ấy. Màn nay không đi đường đó nữa: nó nhận CÂY dựng sẵn lúc build rồi đặt số lúc
   * chạy (`substitutionShape` → `datSoThaySo`). Gác đường cũ trong khi màn chạy đường mới là để
   * ngỏ đúng khoảng trống mà một ca kiểm sinh ra để bịt.
   *
   * Lời hứa được gác vẫn y nguyên: ai lấy máy tính bấm lại đúng thứ đang hiện trên màn phải ra
   * đúng con số khối Kết quả in. Khác ở chỗ "thứ đang hiện trên màn" giờ là một hình vẽ, nên phép
   * tính lại chạy trên chính cái cây được vẽ.
   */
  it('dòng thay số bấm lại ra đúng kết quả của ví dụ', () => {
    for (const formula of FORMULA_MODULES) {
      const { id, substitution, substitutionDerived, variables, example } = formula.spec;
      if (substitution === undefined) continue;

      const oNhap = new Set(variables.map((variable) => variable.key));
      const danXuat = Object.entries(substitutionDerived ?? {});

      /*
       * Khoá dẫn xuất trùng tên một ô nhập thì giá trị tính ra sẽ ĐÈ lên số người dùng gõ, lặng lẽ.
       * Không phép tính nào sai, chỉ con số trong hình là của người khác.
       */
      for (const [khoa] of danXuat) {
        expect(oNhap.has(khoa), `${id} — khoá dẫn xuất "${khoa}" trùng tên một ô nhập`).toBe(false);
      }

      /* Biểu thức dẫn xuất chỉ được nhắc ô nhập và khoá khai TRƯỚC nó — thứ tự khai là thứ tự tính. */
      const daKhai = new Set<string>();
      for (const [khoa, bieuThuc] of danXuat) {
        for (const key of substitutionKeys(bieuThuc)) {
          expect(
            oNhap.has(key) || daKhai.has(key),
            `${id}.${khoa} — nhắc tới "${key}", không phải ô nhập và cũng chưa khai trước đó`,
          ).toBe(true);
        }
        daKhai.add(khoa);
      }

      for (const key of substitutionKeys(substitution)) {
        expect(
          oNhap.has(key) || daKhai.has(key),
          `${id} — mẫu thay số nhắc tới "${key}", không phải ô nhập và cũng không khai dẫn xuất`,
        ).toBe(true);
      }

      const hinh = substitutionShape(formula.spec);
      expect(hinh, `${id} — không phân tích được mẫu thay số`).not.toBeNull();
      if (hinh === null) continue;

      const cay = datSoThaySo(hinh, { ...defaultInputs(formula.spec), ...example.inputs });
      expect(cay, `${id} — thiếu số cho một chỗ trống của mẫu thay số`).not.toBeNull();
      if (cay === null) continue;

      const again = tinhCay(cay);
      expect(again, `${id} — không tính lại được hình thay số`).not.toBeNull();
      expect(
        Math.abs((again ?? 0) - example.expected) / Math.max(Math.abs(example.expected), 1),
        `${id} — hình thay số ra ${String(again)}, ví dụ ra ${String(example.expected)}`,
      ).toBeLessThanOrEqual(0.005);

      /*
       * Nhãn `aria-label` của hình phải nói ĐÚNG phép tính mà hình vẽ ra.
       *
       * Hình gom bằng hình học — gạch phân số, vạch căn, chữ nhỏ nâng lên — còn chữ thì chỉ gom
       * được bằng dấu ngoặc. Lỗi thật đã gặp ngày 05/10/2026: nhãn của `tra-gop-nien-kim` đọc ra
       * `… ÷ (1 + i)^240 − 1`, tức mẫu số mất cặp ngoặc, nên người dùng bàn phím nghe một phép tính
       * khác hẳn thứ người dùng chuột đang nhìn. Không cửa gác nào khác thấy được: hình vẫn đúng,
       * con số vẫn đúng, chỉ cái nhãn là sai.
       *
       * Phép kiểm chặt nhất có thể: viết cây ra chữ rồi ĐỌC LẠI bằng bộ phân tích, hai con số phải
       * trùng nhau tới từng chữ số — đây là cùng một biểu thức nên không có chỗ cho dung sai.
       */
      const chu = chuCuaCay(cay);
      const docLai = evaluateWorked(chu);
      expect(docLai, `${id} — không đọc lại được nhãn chữ của hình: ${chu}`).not.toBeNull();
      expect(
        Math.abs((docLai ?? 0) - (again ?? 0)) / Math.max(Math.abs(again ?? 1), 1),
        `${id} — nhãn chữ ra ${String(docLai)} còn hình ra ${String(again)}: ${chu}`,
      ).toBeLessThanOrEqual(1e-9);
    }
  });

  /*
   * Công thức tính của từng đại lượng khối "Từ các ô trên, công thức tính ra" bày (05/10/2026).
   *
   * Chủ dự án nhìn hai dòng "Gốc kỳ đầu 1.123.716,17" và "Lãi kỳ đầu 6.333.333,33" trên
   * `tra-gop-nien-kim` rồi hỏi *"nếu được tính ra thì công thức để tính đâu? tại sao chưa cho vào"*.
   *
   * Mẫu viết tay, nên gác đúng cách đã gác mọi chữ viết tay khác của dự án: TÍNH LẠI. Mẫu phải dẫn
   * tới chính con số `calc` trả về trong `extras` — tức con số in ngay cạnh nó. Không có đường nào
   * để một mẫu sai mà vẫn xanh.
   */
  it('công thức của đại lượng dẫn xuất tính ra đúng con số đứng cạnh nó', () => {
    /*
     * Đếm thành tiếng, để ca kiểm không xanh vì rỗng: 14 trên 17 đại lượng có mẫu. Ba chỗ còn
     * trống là `thue-tncn-dau-tu` (hai, đọc hằng số thuế) và `ddm-hai-giai-doan.pvStage1` (một
     * tổng Σ qua n kỳ) — lý do từng chỗ ở docblock `FormulaSpec.derivedSubstitution`.
     *
     * Từ 12 lên 14 ngày 06/10/2026: `rut-truoc-han` khai hai chặng, để ô "Lãi suất hợp đồng / năm"
     * thôi là một thanh trượt kéo mà màn không đổi gì.
     */
    const soMau = ALL_FORMULAS.reduce(
      (n, spec) => n + Object.keys(spec.derivedSubstitution ?? {}).length,
      0,
    );
    expect(soMau).toBe(14);

    for (const formula of FORMULA_MODULES) {
      const { id, derivedSubstitution, example } = formula.spec;
      if (derivedSubstitution === undefined) continue;

      const inputs = { ...defaultInputs(formula.spec), ...example.inputs };
      const out = runFormula(formula, inputs, CTX);
      const hinhChinh = substitutionShape(formula.spec);
      const bang = giaTriChoDanXuat(hinhChinh, inputs, out.extras, out.value);
      const hinh = derivedShape(formula.spec);

      for (const khoa of Object.keys(derivedSubstitution)) {
        const that = out.extras?.[khoa];
        expect(that, `${id}.${khoa} — calc không trả về extras này`).toBeDefined();

        const cay = datSoDanXuat(
          hinh[khoa] as NonNullable<(typeof hinh)[string]>,
          bang,
          hinhChinh?.danXuat ?? [],
        );
        expect(cay, `${id}.${khoa} — thiếu số cho một chỗ trống`).not.toBeNull();
        if (cay === null) continue;

        /*
         * Dung sai 0,01%, CHẶT HƠN HẲN ngưỡng 0,5% của dòng thay số, và con số ấy là giá của một
         * lỗi đã lọt: với 0,5%, mẫu `Lãi kỳ đầu = 800.000.000 × 0,0079` vẫn XANH — nó ra 6.320.000
         * cạnh con số in 6.333.333,33, lệch 0,21%. Khác dòng thay số ở chỗ dòng ấy đứng một mình,
         * còn ở đây công thức và con số của nó đứng SÁT NHAU trên cùng một hàng, nên một chữ số
         * lệch là đọc ra ngay.
         */
        const ra = tinhCay(cay);
        expect(
          Math.abs((ra ?? 0) - (that ?? 0)) / Math.max(Math.abs(that ?? 1), 1),
          `${id}.${khoa} — mẫu ra ${String(ra)}, calc ra ${String(that)}: ${chuCuaCay(cay)}`,
        ).toBeLessThanOrEqual(0.0001);
      }
    }
  });

  it('ví dụ có chuỗi giá phải khai báo dataset', () => {
    for (const formula of FORMULA_MODULES) {
      const { id, example } = formula.spec;
      const hasSeries = example.series !== undefined || example.bars !== undefined;
      if (hasSeries) {
        expect(example.dataset, `${id} thiếu dataset`).toBeDefined();
      }
    }
  });

  /*
   * Lỗi thật đã gặp: bốn công thức thiếu `expression` nên màn chi tiết rơi về hiện LaTeX THÔ —
   * người dùng nhìn thấy `L_{rong} = Q\,(P_{ban} - P_{mua})`. Chỉ lộ ra khi mở màn ra nhìn,
   * không test nào bắt được. Hai ca dưới đây khoá lại.
   */
  it('mọi công thức có dòng công thức viết bằng chữ để hiện khi KaTeX còn hoãn', () => {
    for (const spec of ALL_FORMULAS) {
      expect(spec.expression?.vi.trim(), spec.id).toBeTruthy();
    }
  });

  /*
   * Đo trên TỪNG DÒNG, không trên cả chuỗi (18/09/2026): từ khi hình nhiều vế được đọc thành nhiều
   * dòng, một chuỗi như 'A = B\nmẩu chữ rời' vẫn có dấu bằng nên bản cũ cho qua, mà dòng thứ hai
   * không phải công thức. `expressionBlockProblems()` gộp luật 1 tới 3 cho từng dòng, thêm luật 6:
   * dòng không rỗng, không thừa khoảng trắng hai đầu, và không nhồi hai vế vào một dòng.
   */
  it('mỗi dòng của dòng chữ là một công thức đọc được, không lẫn ký hiệu LaTeX', () => {
    const sai = ALL_FORMULAS.flatMap((spec) =>
      (['vi', 'en'] as const).flatMap((ngon) =>
        expressionBlockProblems(spec.expression?.[ngon] ?? '').map(
          (loi) => `${spec.id} · ${ngon}: ${loi}`,
        ),
      ),
    );
    expect(sai, sai.join('\n')).toEqual([]);
  });

  /*
   * Lỗi thật đã gặp: `thoi-gian-nhan-doi` nối phần xấp xỉ bằng gạch ngang dài — "ln(2) ÷ ln(1 +
   * Lợi suất năm) — xấp xỉ nhanh bằng 72 ÷ Lợi suất" — và chủ dự án đọc thành phép trừ. Trong một
   * dòng công thức, gạch ngang (— hay –) đứng giữa hai vế trông y như dấu trừ `−` mà cả 111 dòng
   * đều dùng. Phần phụ nối bằng dấu phẩy, như `, làm tròn xuống`. Quét cả `en` vì màn tiếng Anh
   * hiện đúng chuỗi ấy.
   */
  it('dòng đó không dùng gạch ngang — dễ đọc nhầm thành dấu trừ', () => {
    for (const spec of ALL_FORMULAS) {
      for (const text of [spec.expression?.vi ?? '', spec.expression?.en ?? '']) {
        expect(text, `${spec.id} có gạch ngang trong dòng công thức`).not.toMatch(DASHES);
      }
    }
  });

  /*
   * Lỗi thật đã gặp: `sut-giam-hien-tai` có hình `DD_t = (P_max − P_t) / P_max` mà dòng chữ ngay dưới
   * lại "… ÷ Đỉnh cao nhất trong cửa sổ × 100" — chủ dự án hỏi "tại sao trên công thức không nhân
   * 100 mà bên dưới lại nhân 100" (17/09/2026). Quét ra 11 công thức cùng họ: bốn công thức thiếu
   * `× 100` trong hình, ba dòng chữ thừa `÷ 100` so với hình, ba hình thừa `100`/`1200`, và hai dòng
   * chữ kể ý bỏ mất `365`/`1200`. Dòng chữ là hình đọc thành lời, nên HẰNG SỐ của hai bên phải là
   * một: số khác 0, 1, 2 (luật số của `latexSymbolTokens()`) có ở bên này thì phải có ở bên kia, ở
   * cả `vi` lẫn `en`.
   *
   * Quy ước mà các lần sửa bám theo: ô nhập gõ theo % (lãi suất, tỷ lệ ký quỹ) thì hình viết dạng
   * tỷ lệ, không `÷ 100` — như `1 + r`, `r − g`; kết quả là tỷ số của hai lượng tiền/giá mà đọc ra
   * phần trăm thì hình ghi `× 100` — như ROE, ROI, sụt giảm.
   */
  it('dòng chữ nêu đúng các hằng số có trong hình, và ngược lại', () => {
    // Hai hàm đếm số sống ở `expression-rules.ts`: dòng chữ của từng bước "cách tính" chịu đúng
    // luật này, nên thước đo phải là một, không chép thành hai bản.
    for (const spec of ALL_FORMULAS) {
      const trongHinh = numbersInLatex(spec.latex);
      for (const ngon of ['vi', 'en'] as const) {
        const trongChu = numbersInText(spec.expression?.[ngon] ?? '', ngon);
        expect(trongChu, `${spec.id} · ${ngon}: hằng số trong dòng chữ khác trong hình`).toEqual(
          trongHinh,
        );
      }
    }
  });

  /*
   * Lỗi thật đã gặp: hình của `ty-so-sortino` vẽ HAI vế — tỷ số, rồi cách tính độ lệch chuẩn phần
   * giảm — mà dòng chữ dưới hình chỉ đọc vế đầu. Chủ dự án: "tại sao lại có 2 công thức mà bên dưới
   * chỉ có giải thích cho 1 công thức?" (18/09/2026). Quét cả 111 thì còn `rsi-wilder` (vế RS bị gộp
   * vào trong ngoặc) và `don-bay-tong-hop` (bỏ phần giữa `DOL × DFL` của hình).
   *
   * Cửa gác hằng số ngay trên KHÔNG thấy được lỗi này: vế bị bỏ quên chẳng mang con số lạ nào. Đây
   * là thước đo cấu trúc, đếm số vế — hình ba vế thì dòng chữ cũng phải ba vế.
   */
  it('dòng chữ đọc đủ số vế của hình', () => {
    const lech = ALL_FORMULAS.flatMap((spec) => {
      const trongHinh = equationsInLatex(spec.latex);
      return (['vi', 'en'] as const)
        .map((ngon) => ({ ngon, so: equationsInText(spec.expression?.[ngon] ?? '') }))
        .filter(({ so }) => so !== trongHinh)
        .map(
          ({ ngon, so }) =>
            `${spec.id} · ${ngon}: hình ${String(trongHinh)} vế, dòng chữ ${String(so)} vế`,
        );
    });
    expect(lech, `hình và dòng chữ khác số vế:\n${lech.join('\n')}`).toEqual([]);
  });

  /*
   * Luật 6. Ca luật 5 ngay trên chỉ đếm dấu bằng, nên bản vá đầu tiên của `ty-so-sortino` — hai vế
   * nối bằng ", với …" trong MỘT dòng — vẫn xanh, và chủ dự án bác đúng chỗ ấy: "cần xuống dòng
   * giải thích công thức thứ 2 thay vì dùng dấu phẩy khó nhìn như này" (18/09/2026).
   *
   * Thước đo lấy thẳng từ hình, không phải danh sách id chép tay: `\quad`, `\qquad` và `\\` là chỗ
   * HÌNH tự ngắt, nên dòng chữ ngắt đúng bấy nhiêu lần. Năm công thức có ngắt (`ty-so-sortino`,
   * `rsi-wilder`, `ema-n-phien`, `atr-dao-dong-thuc`, `diem-hoa-von`); `don-bay-tong-hop` KHÔNG,
   * vì `DTL = DOL × DFL = …` là đẳng thức dây chuyền trong một khối — cắt ra là đẻ một dòng mở đầu
   * bằng dấu bằng. Hai ca cộng lại ép luôn `vi` và `en` cùng số dòng.
   */
  it('hình ngắt ở đâu thì dòng chữ xuống dòng ở đó', () => {
    const lech = ALL_FORMULAS.flatMap((spec) => {
      const khoi = blocksInLatex(spec.latex);
      return (['vi', 'en'] as const)
        .map((ngon) => ({ ngon, so: expressionLines(spec.expression?.[ngon] ?? '').length }))
        .filter(({ so }) => so !== khoi)
        .map(
          ({ ngon, so }) =>
            `${spec.id} · ${ngon}: hình ${String(khoi)} khối, dòng chữ ${String(so)} dòng`,
        );
    });
    expect(lech, `hình và dòng chữ khác số dòng:\n${lech.join('\n')}`).toEqual([]);
  });

  /*
   * ── Bảng ký hiệu (`spec.symbols`) — ba luật, xem docblock của trường ấy ────────────────────────
   *
   * Chủ dự án chỉ vào hình `L = max{k : r_{t+1} < 0, …}` và nói "không hiểu các giá trị"
   * (16/09/2026): mọi chữ trong hình phải được gọi tên ngay cạnh hình, ở CẢ 111 công thức. Bộ tách
   * `latexSymbolTokens()` là thước chung cho hình và cho từng mục của bảng, nên "phủ hết" là một
   * phép bao hàm tập hợp, không phải cảm tính.
   */
  /*
   * `FFB_SYMBOL_IDS=id1,id2` thu bốn ca dưới về vài công thức — cho người đang viết bảng của MỘT file
   * nhóm chạy cửa gác mà không bị công thức của file khác che mất kết quả. CI không đặt biến này.
   */
  const chiKiem = process.env.FFB_SYMBOL_IDS?.split(',').map((id) => id.trim());
  const canKiemKyHieu =
    chiKiem === undefined ? ALL_FORMULAS : ALL_FORMULAS.filter((s) => chiKiem.includes(s.id));

  it('mọi công thức có bảng ký hiệu', () => {
    for (const spec of canKiemKyHieu) {
      expect(spec.symbols?.length ?? 0, `${spec.id} chưa có bảng ký hiệu`).toBeGreaterThan(0);
    }
  });

  it('mỗi ký hiệu chép nguyên văn từ latex, và bảng phủ hết mọi chữ trong hình', () => {
    for (const spec of canKiemKyHieu) {
      const symbols = spec.symbols ?? [];
      const trongHinh = latexSymbolTokens(spec.latex);
      const trongBang = new Set(symbols.flatMap((s) => latexSymbolTokens(s.latex)));

      for (const symbol of symbols) {
        expect(
          spec.latex,
          `${spec.id}: "${symbol.latex}" không có nguyên văn trong latex`,
        ).toContain(symbol.latex);
      }
      const thieu = trongHinh.filter((token) => !trongBang.has(token));
      expect(thieu, `${spec.id}: bảng ký hiệu thiếu ${thieu.join(', ')}`).toEqual([]);

      const trung = symbols.map((s) => s.latex).filter((x, i, all) => all.indexOf(x) !== i);
      expect(trung, `${spec.id}: ký hiệu lặp ${trung.join(', ')}`).toEqual([]);
    }
  });

  it('nghĩa của ký hiệu là một cụm ngắn, đủ hai ngôn ngữ, không chấm cuối', () => {
    for (const spec of canKiemKyHieu) {
      for (const symbol of spec.symbols ?? []) {
        for (const ngon of ['vi', 'en'] as const) {
          const text = symbol.meaning[ngon].trim();
          const where = `${spec.id} · ${symbol.latex} · ${ngon}`;
          expect(text.length, `${where}: cụt`).toBeGreaterThanOrEqual(3);
          expect(
            text.length,
            `${where}: dài quá một cụm (${String(text.length)} ký tự)`,
          ).toBeLessThanOrEqual(90);
          expect(text, `${where}: không kết bằng dấu chấm`).not.toMatch(/\.$/);
        }
      }
    }
  });

  /*
   * Lỗi thật đã gặp: bảng của `var-lich-su` ghi "độ tin cậy, 95% hay 99% — nên 1 − α là 5% hay 1%",
   * và chủ dự án hỏi "tại sao lại có - dài và - ngắn" (17/09/2026). Gạch ngang dài đứng cạnh dấu trừ
   * của chính phép tính thì người đọc không phân biệt nổi cái nào là trừ. Đúng lỗi đã chặn ở dòng
   * công thức phía trên, nhưng bảng ký hiệu làm sau nên lọt. Bảng này là chỗ tra ký hiệu toán, nên
   * loại gạch duy nhất được có mặt là dấu trừ `−`. Chỗ nối viết bằng chữ và dấu phẩy (", tức …",
   * ", nên …"), khoảng số viết "từ 0 đến 100". Quét cả `en` vì màn tiếng Anh hiện đúng chuỗi ấy.
   */
  it('nghĩa của ký hiệu không dùng gạch ngang — dễ đọc nhầm thành dấu trừ', () => {
    const coGach = canKiemKyHieu.flatMap((spec) =>
      (spec.symbols ?? []).flatMap((symbol) =>
        (['vi', 'en'] as const)
          .filter((ngon) => DASHES.test(symbol.meaning[ngon]))
          .map((ngon) => `${spec.id} · ${symbol.latex} · ${ngon}: "${symbol.meaning[ngon]}"`),
      ),
    );
    expect(coGach, `bảng ký hiệu có gạch ngang:\n${coGach.join('\n')}`).toEqual([]);
  });

  /*
   * Cửa gác của chuỗi phụ thuộc (FR-15).
   *
   * `validate.ts` đã kiểm cạnh trỏ tới công thức có thật và biến có thật. Thứ nó KHÔNG kiểm được
   * là đơn vị: khai `fcff ──► gia-tri-hien-tai.futureValue` thì validator cho qua, mà chuỗi sẽ
   * đổ con số "300" đơn vị **tỷ ₫** vào một ô đơn vị **₫** — sai 9 chữ số, không cảnh báo nào,
   * không ca kiểm nào đỏ. Đúng loại lỗi mà FR-06 sinh ra để chặn, chỉ khác là nó ra một con số
   * trông hợp lệ thay vì NaN.
   */
  it('mọi cạnh dependsOn nối hai đầu CÙNG đơn vị (FR-15)', () => {
    const byId = new Map(ALL_FORMULAS.map((spec) => [spec.id, spec]));

    for (const spec of ALL_FORMULAS) {
      for (const dependency of spec.dependsOn ?? []) {
        const upstream = byId.get(dependency.formulaId);
        const variable = spec.variables.find((v) => v.key === dependency.variableKey);
        const canh = `${dependency.formulaId} → ${spec.id}.${dependency.variableKey}`;

        expect(upstream, `${canh}: không có công thức thượng nguồn`).toBeDefined();
        expect(variable, `${canh}: không có biến nhận`).toBeDefined();
        expect(variable?.unit, `${canh}: lệch đơn vị`).toBe(upstream?.resultUnit);
      }
    }
  });

  it('giá trị mặc định của thượng nguồn nằm trong miền của ô nhận', () => {
    // Không phải luật cứng — chuỗi cố ý KHÔNG kẹp giá trị thượng nguồn (xem `run-chain.ts`).
    // Nhưng nếu ngay bộ số mặc định đã lọt ra ngoài miền thì người dùng gặp ô đỏ ở lượt mở màn
    // đầu tiên, tức cạnh khai sai chỗ chứ không phải người dùng nhập sai.
    for (const formula of FORMULA_MODULES) {
      for (const dependency of formula.spec.dependsOn ?? []) {
        const upstream = findFormulaModule(dependency.formulaId);
        const variable = formula.spec.variables.find((v) => v.key === dependency.variableKey);
        if (upstream === undefined || variable === undefined) continue;

        const out = runFormula(upstream, defaultInputs(upstream.spec), CTX);
        const canh = `${dependency.formulaId} → ${formula.spec.id}.${dependency.variableKey}`;

        expect(out.value, `${canh}: thượng nguồn không tính được với số mặc định`).not.toBeNull();
        if (variable.min !== undefined) {
          expect(out.value ?? 0, `${canh}: dưới min`).toBeGreaterThanOrEqual(variable.min);
        }
        if (variable.max !== undefined) {
          expect(out.value ?? 0, `${canh}: trên max`).toBeLessThanOrEqual(variable.max);
        }
      }
    }
  });

  it('không nhóm nào vượt số công thức dự kiến của SRS 3.8', () => {
    const registry = createRegistry(ALL_FORMULAS);
    for (const category of registry.categories) {
      const count = registry.byCategory.get(category.id)?.length ?? 0;
      expect(count, category.name.vi).toBeLessThanOrEqual(category.expectedCount);
    }
  });
});

describe('WF-08 — bảng bóc tách phí & thuế khớp từng đồng với wireframe', () => {
  const WF08 = { quantity: 1_000, months: 5, buyPrice: 92_000, sellPrice: 97_000 };

  it('bốn dòng chi phí đúng bằng con số wireframe dựng sẵn', () => {
    const { rows } = buildFeeBreakdown(WF08, CTX);

    expect(rows.map((r) => r.output.value)).toEqual([138_000, 145_500, 97_000, 1_350]);
  });

  it('chuỗi công thức hiện trong dòng đúng khuôn WF-08', () => {
    const { rows } = buildFeeBreakdown(WF08, CTX);

    expect(rows[0]?.formula.vi).toBe('0,15% × 92.000.000 ₫');
    expect(rows[2]?.formula.vi).toBe('0,10% × 97.000.000 ₫');
    expect(rows[3]?.formula.vi).toContain('0,27 ₫/CP/tháng × 1.000 × 5');
  });

  it('tổng chi phí, giá hoà vốn, lãi ròng và ROI ròng đều khớp', () => {
    const b = buildFeeBreakdown(WF08, CTX);

    expect(b.totalCost.value).toBe(381_850);
    expect(b.breakEven.value).toBeCloseTo(92_370.28, 1);
    expect(b.grossProfit.value).toBe(5_000_000);
    expect(b.netProfit.value).toBe(4_618_150);
    expect(b.netRoi.value).toBeCloseTo(5.01, 2);
  });

  it('thiếu giá bán thì chỉ dòng liên quan báo thiếu, các dòng khác vẫn tính', () => {
    // Đúng câu WF-15: “Nhập giá bán để xem lợi nhuận ròng. Các ô còn lại đã đủ.”
    const b = buildFeeBreakdown({ quantity: 1_000, months: 5, buyPrice: 92_000 }, CTX);

    expect(b.rows[0]?.output.value).toBe(138_000);
    expect(b.rows[3]?.output.value).toBe(1_350);
    expect(b.rows[1]?.output.warning?.code).toBe('INCOMPLETE_INPUT');
    expect(b.netProfit.warning?.code).toBe('INCOMPLETE_INPUT');
    expect(b.netProfit.warning?.message.vi).toContain('Giá bán');
  });

  it('giá hoà vốn không cần giá bán — mốc này phải hiện được trước khi bán', () => {
    const b = buildFeeBreakdown({ quantity: 1_000, months: 5, buyPrice: 92_000 }, CTX);
    expect(b.breakEven.value).toBeCloseTo(92_370.28, 1);
  });

  it('không có biểu phí thì báo lỗi chứ không lặng lẽ tính bằng 0', () => {
    const b = buildFeeBreakdown(WF08, { asOf: AS_OF });

    expect(b.rows.every((r) => r.output.value === null)).toBe(true);
    expect(b.totalCost.value).toBeNull();
  });
});

describe('WF-14 — lịch trả nợ', () => {
  const WF14 = { amount: 800_000_000, rate: 9.5, years: 20, method: 1 };

  it('dư nợ kỳ cuối về đúng 0, không để lại vài đồng lẻ', () => {
    const rows = amortisationFor(WF14) ?? [];

    expect(rows).toHaveLength(240);
    expect(rows[rows.length - 1]?.balance).toBe(0);
  });

  it('tổng gốc đã trả đúng bằng số tiền vay', () => {
    const rows = amortisationFor(WF14) ?? [];
    const principal = rows.reduce((s, r) => s + r.principal, 0);

    expect(principal).toBeCloseTo(800_000_000, 2);
  });

  it('niên kim trả đều nhau ở mọi kỳ trừ kỳ cuối', () => {
    const rows = amortisationFor(WF14) ?? [];
    const first = rows[0]?.payment ?? 0;

    for (const row of rows.slice(0, -1)) {
      expect(Math.abs(row.payment - first)).toBeLessThan(0.01);
    }
  });

  it('gốc đều thì phần gốc bằng nhau và khoản trả giảm dần', () => {
    const rows = buildAmortisation(800_000_000, 9.5, 20, 'equalPrincipal') ?? [];

    expect(rows[0]?.principal).toBeCloseTo(rows[100]?.principal ?? 0, 6);
    expect(rows[0]?.payment ?? 0).toBeGreaterThan(rows[239]?.payment ?? 0);
  });

  it('gốc đều tổng lãi thấp hơn niên kim ở cùng kỳ hạn', () => {
    const sumInterest = (m: 'annuity' | 'equalPrincipal'): number =>
      (buildAmortisation(800_000_000, 9.5, 20, m) ?? []).reduce((s, r) => s + r.interest, 0);

    expect(sumInterest('equalPrincipal')).toBeLessThan(sumInterest('annuity'));
  });

  it('kỳ hạn 0 thì trả null chứ không lặp vô hạn', () => {
    expect(buildAmortisation(800_000_000, 9.5, 0, 'annuity')).toBeNull();
  });

  it('rút gọn giữ 12 kỳ đầu, mốc cuối mỗi năm và kỳ cuối', () => {
    const rows = amortisationFor(WF14) ?? [];
    const shown = condenseSchedule(rows);
    const periods = shown.map((r) => r.period);

    expect(periods.slice(0, 12)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(periods).toContain(24);
    expect(periods).toContain(240);
    expect(shown.length).toBeLessThan(rows.length);
  });

  it('lịch ngắn hơn số kỳ giữ lại thì không rút gọn gì', () => {
    const rows = buildAmortisation(100_000_000, 8, 1, 'annuity') ?? [];
    expect(condenseSchedule(rows, 12)).toHaveLength(12);
  });

  it('đánh dấu ĐÚNG những chỗ đã bỏ bớt kỳ, không đánh dấu chỗ liền mạch', () => {
    const rows = amortisationFor(WF14) ?? [];
    const cells = condenseWithGaps(rows);

    // 12 kỳ đầu liền mạch nên không được chèn dấu nào vào giữa.
    expect(cells.slice(0, 12).every((cell) => cell !== SCHEDULE_GAP)).toBe(true);

    // Giữa kỳ 12 và kỳ 24 có 11 kỳ bị bỏ — phải đúng một dấu ở đó.
    expect(cells[12]).toBe(SCHEDULE_GAP);
    expect(cells[13]).toMatchObject({ period: 24 });

    // Số kỳ thật giữ nguyên như bản không có dấu; dấu chỉ là thứ thêm vào để hiện.
    const real = cells.filter((cell) => cell !== SCHEDULE_GAP);
    expect(real).toHaveLength(condenseSchedule(rows).length);
  });

  it('lịch không bị rút gọn thì không có dấu bỏ bớt nào', () => {
    const rows = buildAmortisation(100_000_000, 8, 1, 'annuity') ?? [];
    expect(condenseWithGaps(rows, 12)).not.toContain(SCHEDULE_GAP);
  });

  it('lịch rỗng thì trả mảng rỗng chứ không trả một dấu bơ vơ', () => {
    expect(condenseWithGaps([])).toEqual([]);
  });
});

describe('xirr() — phần toán đã xong, chờ bảng dòng tiền của gói 3.3.1', () => {
  it('một khoản chi và một khoản thu sau đúng một năm', () => {
    const rate = xirr([
      { date: '2025-01-01', amount: -100_000_000 },
      { date: '2026-01-01', amount: 110_000_000 },
    ]);

    expect(rate).not.toBeNull();
    expect((rate ?? 0) * 100).toBeCloseTo(10, 1);
  });

  it('chuỗi góp đều rồi rút một lần', () => {
    const rate = xirr([
      { date: '2025-01-01', amount: -10_000_000 },
      { date: '2025-04-01', amount: -10_000_000 },
      { date: '2025-07-01', amount: -10_000_000 },
      { date: '2026-01-01', amount: 32_000_000 },
    ]);

    expect(rate).not.toBeNull();
    expect(rate ?? 0).toBeGreaterThan(0);
  });

  it('lỗ thì suất sinh lợi âm', () => {
    const rate = xirr([
      { date: '2025-01-01', amount: -100_000_000 },
      { date: '2026-01-01', amount: 80_000_000 },
    ]);

    expect(rate ?? 0).toBeLessThan(0);
  });

  it('toàn dòng tiền cùng dấu thì không có nghiệm — trả null chứ không trả 0', () => {
    expect(
      xirr([
        { date: '2025-01-01', amount: 100_000 },
        { date: '2026-01-01', amount: 200_000 },
      ]),
    ).toBeNull();
  });

  it('dưới hai dòng tiền thì không tính được', () => {
    expect(xirr([{ date: '2025-01-01', amount: -100_000 }])).toBeNull();
  });

  it('ngày sai định dạng thì trả null, không ném lỗi', () => {
    expect(
      xirr([
        { date: 'hôm qua', amount: -100_000 },
        { date: '2026-01-01', amount: 200_000 },
      ]),
    ).toBeNull();
  });

  it('không phụ thuộc thứ tự dòng tiền truyền vào', () => {
    const flows = [
      { date: '2026-01-01', amount: 110_000_000 },
      { date: '2025-01-01', amount: -100_000_000 },
    ];
    expect((xirr(flows) ?? 0) * 100).toBeCloseTo(10, 1);
  });
});

/*
 * ── Khối "Từ các ô trên, công thức tính ra" đọc được TUẦN TỰ (05/10/2026) ────────────────────
 *
 * Chủ dự án chỉ trên `tra-gop-nien-kim`: khối bày "Gốc kỳ đầu" trước, mà công thức của nó là
 * `Trả hằng tháng − Lãi kỳ đầu` — dùng một con số chưa ai giới thiệu, rồi hàng DƯỚI mới tính con số
 * ấy. *"Lãi kỳ đầu tự dưng lôi đâu ra 21 triệu? xong bên dưới mới tính lãi kỳ đầu? phi logic?"*
 *
 * Thứ tự cũ là thứ tự cột của biểu đồ bóc tách — đúng cho hình vẽ, sai cho một danh sách đọc từ
 * trên xuống. Ca này gác chiều ngược, và gác cho MỌI công thức chứ không riêng cái bị chỉ.
 */
describe('đại lượng dẫn xuất bày theo thứ tự tính được', () => {
  it('không chặng nào dùng một chặng chỉ xuất hiện ở hàng dưới', () => {
    const sai: string[] = [];

    for (const formula of FORMULA_MODULES) {
      const { id, derivedSubstitution } = formula.spec;
      if (derivedSubstitution === undefined) continue;

      const inputs = { ...defaultInputs(formula.spec), ...formula.spec.example.inputs };
      const thuTu = derivedStages(formula.spec, inputs, runFormula(formula, inputs, CTX)).map(
        (s) => s.key,
      );

      thuTu.forEach((khoa, i) => {
        const nhacToi = [...(derivedSubstitution[khoa] ?? '').matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(
          (m) => m[1] ?? '',
        );
        for (const can of nhacToi) {
          const j = thuTu.indexOf(can);
          if (j > i) sai.push(`${id}: "${khoa}" (hàng ${i + 1}) dùng "${can}" ở hàng ${j + 1}`);
        }
      });
    }

    expect(sai, sai.join('\n')).toEqual([]);
  });

  /*
   * Biểu đồ GIỮ thứ tự khai, và đó là chủ ý chứ không phải sót: cột chồng đọc từ dưới lên nên gốc
   * đứng trước lãi, còn danh sách đọc từ trên xuống nên lãi phải đứng trước gốc. Hai thứ tự trả lời
   * hai câu hỏi khác nhau. Ca này ghim để không ai "sửa cho đồng bộ".
   */
  it('biểu đồ vẫn giữ thứ tự khai của `spec.breakdown`', () => {
    const nienKim = FORMULA_MODULES.find((f) => f.spec.id === 'tra-gop-nien-kim');
    expect(nienKim?.spec.breakdown?.map((s) => s.key)).toEqual(['firstPrincipal', 'firstInterest']);

    const inputs = defaultInputs(nienKim!.spec);
    const bay = derivedStages(nienKim!.spec, inputs, runFormula(nienKim!, inputs, CTX));
    expect(bay.map((s) => s.key)).toEqual(['firstInterest', 'firstPrincipal']);
  });
});

/*
 * ── Không ô nhập nào là một điều khiển CHẾT ────────────────────────────────────────────────
 *
 * Chủ dự án kéo thanh trượt "Suất sinh lợi khởi điểm" của `xirr` rồi hỏi (06/10/2026):
 * *"sao kéo thả thông số trong ô khoanh đỏ thấy % thay đổi mà sao chả có gì thay đổi ở xung
 * quanh vậy? kiểm tra lại các phần có thanh slider tương tự xem có lỗi không để sửa"*.
 *
 * Quét cả 269 ô lúc ấy: đúng 2 ô kéo mà màn không đổi gì. Một là ô kia — chết theo thiết kế, đã
 * bỏ. Một là `sut-giam-hien-tai.lookback`, chết theo DỮ LIỆU của ví dụ chứ không theo thiết kế,
 * nên ghim tên vào dưới đây kèm bằng chứng.
 *
 * So bằng số ĐÃ LÀM TRÒN như khối Kết quả in, không phải trị số thô: lệch ở chữ số thứ mười hai
 * thì người kéo thanh trượt vẫn thấy một con số đứng yên, mà đó mới là thứ ca kiểm này gác. Đo
 * bằng trị số thô thì ô `guess` của `xirr` LỌT.
 */
const O_KHONG_DOI_THEO_DU_LIEU: ReadonlyArray<string> = [
  /*
   * Cửa sổ nhìn lại của "Mức sụt giảm hiện tại". Ô này SỐNG: nó cắt `lookback` phiên cuối, nên
   * đổi cửa sổ là đổi đỉnh. Chuỗi 57 phiên của ví dụ tình cờ có đỉnh nằm trong 30 phiên cuối —
   * mà 30 là sàn `MIN_DRAWDOWN_BARS` — nên cắt ngắn hay dài đều ra một đáp số.
   *
   * Bằng chứng ô ấy sống: công thức anh em `sut-giam-sau-nhat` dùng ĐÚNG ô ấy trên ĐÚNG chuỗi ấy
   * và cho 6 kết quả khác nhau khi kéo 30 → 60 (4,87 · 7,3 · 8,53 · 11,77 · 13,73 · 15,03).
   */
  'sut-giam-hien-tai.lookback',
];

describe('không ô nhập nào là một điều khiển chết', () => {
  /** Thứ NGƯỜI DÙNG thấy: con số đã làm tròn như khối Kết quả in, cộng cảnh báo và các số phụ. */
  /**
   * Khoá `extras` nào THẬT SỰ hiện ra màn — phần còn lại tính vào là nói dối.
   *
   * Bản đầu của ca kiểm này (06/10/2026) đếm MỌI khoá `extras`, và vì thế **bỏ sót đúng ô chủ dự
   * án hỏi tiếp ngay sau đó**: `rut-truoc-han.contractRate` chỉ nuôi hai khoá `extras` mà không
   * khối nào trên trang đọc, nên kéo thanh trượt thì `extras` đổi mà màn đứng im. Ca kiểm thấy
   * `extras` đổi và kết luận ô ấy sống.
   *
   * Hai đường duy nhất đưa `extras` ra màn, đã rà lại trong mã:
   *   · `spec.breakdown` → `DerivedNote` (và cột của hình bóc tách) — chỉ các khoá khai thành chặng
   *   · thân riêng ở `ui/screens/DetailBody.tsx` — ba công thức, chúng tự bày lấy
   * `ResultBlock` chỉ in `value` và đơn vị. Điều này đã ghi sẵn ở `REVIEW-2.md`.
   */
  const THAN_RIENG: ReadonlySet<string> = new Set(['loi-nhuan-rong', 'lich-tra-no', 'xirr']);

  const manThayCua = (spec: FormulaSpec): ((o: CalcOutput) => string) => {
    const hien = THAN_RIENG.has(spec.id)
      ? null
      : new Set((spec.breakdown ?? []).map((chang) => chang.key));
    return (o) => {
      const so = o.value === null ? 'null' : formatNumber(o.value);
      const phu = Object.entries(o.extras ?? {})
        .filter(([k]) => hien === null || hien.has(k))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${formatNumber(v)}`)
        .join('|');
      return `${so}#${o.warning?.code ?? '-'}#${phu}`;
    };
  };

  it('kéo ô nào thì màn cũng phải đổi theo, trừ danh sách đã ghim', () => {
    const chet: string[] = [];
    for (const formula of FORMULA_MODULES) {
      const spec = formula.spec;
      const ctx = ctxCuaViDu(spec);
      const goc: Record<string, number> = { ...spec.example.inputs };
      const manThay = manThayCua(spec);
      const chuan = manThay(runFormula(formula, goc, ctx));

      for (const bien of spec.variables) {
        /* 11 điểm chứ 7: ô có ngưỡng hẹp (`rut-truoc-han.monthsHeld`) dễ lọt qua lưới thưa. */
        const thu =
          bien.options !== undefined && bien.options.length > 0
            ? bien.options.map((o) => o.value)
            : [0, 0.05, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 0.95, 1].map((t) => {
                const min = bien.min ?? 0;
                return min + ((bien.max ?? min + 100) - min) * t;
              });

        const doi = thu.some(
          (x) =>
            manThay(runFormula(formula, { ...goc, [bien.key]: clampToSpec(x, bien) }, ctx)) !==
            chuan,
        );
        if (!doi) chet.push(`${spec.id}.${bien.key}`);
      }
    }

    expect(
      chet.filter((o) => !O_KHONG_DOI_THEO_DU_LIEU.includes(o)),
      `ô kéo mà màn không đổi gì:\n${chet.join('\n')}`,
    ).toEqual([]);
    /* Chiều ngược: tên ghim mà nay đã sống thì phải gỡ khỏi danh sách, không để nó mục ở đó. */
    expect(O_KHONG_DOI_THEO_DU_LIEU.filter((o) => !chet.includes(o))).toEqual([]);
  });
});
