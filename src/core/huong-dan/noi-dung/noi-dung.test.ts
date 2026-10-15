import { describe, expect, it } from 'vitest';

import { ALL_FORMULAS, findFormulaModule } from '../../formulas';
import { isLaterRepeatSlot } from '../../registry/repeat';
import type { FormulaSpec } from '../../registry/types';
import { choTrongCua, dienCau, laKieuChoTrong, type ThongSoO } from './cho-trong';
import { BAI_RIENG } from './items';
import type { BaiRieng } from './types';

/** Thông số của MỌI ô của một công thức — đủ để điền bất kỳ chỗ trống nào ở số mặc định. */
function thongSoTu(spec: FormulaSpec): Record<string, ThongSoO> {
  return Object.fromEntries(
    spec.variables.map((bien) => [
      bien.key,
      {
        macDinh: bien.defaultValue,
        ...(bien.min === undefined ? {} : { min: bien.min }),
        ...(bien.max === undefined ? {} : { max: bien.max }),
      },
    ]),
  );
}

/**
 * Cửa gác của kho chữ hướng dẫn riêng (chủ dự án giao 03/10/2026, rồi `guide-111.json` 05/10/2026).
 *
 * Kho này là chữ CHÉP TAY, khác hẳn phần còn lại của bài — vốn suy ra từ Registry. Nên thứ cần gác
 * cũng khác: không phải "suy có đúng không" mà là "chép có đủ, có khớp, và có giữ khuôn không".
 *
 * Đợt `guide-111.json` đổi trọng tâm của file này. Trước đó phần nặng nhất là gác phép tách chuỗi
 * " · " — hai ca kiểm chỉ tồn tại để đỡ cho một phép tách ở tầng hiện hình. Giờ chữ ô nhập đã có
 * KHOÁ, nên hai ca ấy biến mất và chỗ của chúng là một ca mạnh hơn hẳn: khoá trong kho phải là
 * `VariableSpec.key` thật, và phải phủ đủ mọi ô bài kể (263 trên 269 ô của Registry). Đó là cửa gác duy nhất bắt được một ô mới thêm
 * vào `spec.variables` mà chưa có câu, hoặc một ô bị đổi tên khoá.
 */

const MUC = Object.entries(BAI_RIENG);

/** Ba dòng viết cho CẢ BÀI. Chữ của từng ô nhập nằm ở `oNhap`, gác riêng bên dưới. */
const BA_DONG = ['deLamGi', 'docKetQua', 'deSai'] as const;

/** Mọi ô nhập khai trong `spec.variables` của mọi công thức — phía REGISTRY, đã ghép với kho. */
const MOI_O_REGISTRY = ALL_FORMULAS.flatMap((spec) =>
  spec.variables.map((bien) => ({
    id: spec.id,
    key: bien.key,
    bien,
    o: BAI_RIENG[spec.id]?.oNhap[bien.key],
    sauNhom1: isLaterRepeatSlot(spec, bien.key),
  })),
);

/**
 * Ô mà bài hướng dẫn KỂ, tức mọi ô trừ ô của nhóm lặp thứ hai trở đi (`isLaterRepeatSlot`, 14/10/2026:
 * chủ dự án bỏ câu của đợt 2, 3 và kỳ 2, 3). Mọi ca kiểm về chữ trong kho đếm trên danh sách này.
 */
const MOI_O = MOI_O_REGISTRY.filter(({ sauNhom1 }) => !sauNhom1);

describe('kho phủ đúng thư viện, không thiếu không thừa', () => {
  it('đủ 111 mục, mỗi id một mục', () => {
    expect(MUC).toHaveLength(ALL_FORMULAS.length);
    expect(MUC).toHaveLength(111);
  });

  /*
   * Một id lạ trong kho là chữ không bao giờ hiện ra — tệ hơn thiếu, vì nó trông như đã làm xong.
   * Ca này bắt cả hai chiều: id kho không có trong Registry, và công thức Registry không có mục.
   */
  it('mọi id đều là công thức thật, và mọi công thức đều có mục', () => {
    for (const [id] of MUC) {
      expect(findFormulaModule(id), `id lạ trong kho: ${id}`).toBeDefined();
    }
    for (const spec of ALL_FORMULAS) {
      expect(BAI_RIENG[spec.id], `công thức chưa có chữ riêng: ${spec.id}`).toBeDefined();
    }
  });
});

describe('chữ của ô nhập gắn vào ĐÚNG ô, và phủ đủ mọi ô', () => {
  /*
   * Ca kiểm NẶNG NHẤT của file, và là lý do đợt này tồn tại.
   *
   * Trước `guide-111.json`, chữ "lấy số ở đâu" là một chuỗi dài ngăn nhau bằng " · " — chạy được
   * nhưng không gắn vào ô nào, và 74/111 công thức có số cụm khác số ô. Hai hệ quả đo được: không
   * đặt được một nút "?" cạnh MỘT ô mà chỉ hiện phần của ô đó, và đổi tên một khoá biến thì chuỗi
   * hướng dẫn trôi khỏi biến mà không gì đỏ.
   *
   * Giờ khoá là `VariableSpec.key`, nên cả hai chiều đều bắt được:
   *
   *   · khoá lạ trong kho → chữ không bao giờ hiện ra (`bai.ts` im lặng bỏ qua khoá nó không tìm
   *     thấy trong `spec.variables`, nên đây là chỗ DUY NHẤT thấy được);
   *   · ô thật chưa có chữ → bài kê thiếu một ô mà người đọc vẫn phải điền.
   */
  it('mọi khoá trong kho là một ô thật, và mọi ô thật đều có chữ', () => {
    for (const [id, bai] of MUC) {
      const spec = findFormulaModule(id)?.spec;
      if (spec === undefined) continue;
      const oThat = spec.variables.map((bien) => bien.key);
      for (const khoa of Object.keys(bai.oNhap)) {
        expect(oThat, `${id}: khoá lạ "${khoa}", không có ô nào tên thế`).toContain(khoa);
        // Ô nhóm lặp thứ hai trở đi không vào bài, nên câu của nó không bao giờ hiện ra.
        expect(isLaterRepeatSlot(spec, khoa), `${id}.${khoa}: câu không bao giờ hiện`).toBe(false);
      }
    }
    for (const { id, key, o } of MOI_O) {
      expect(o, `${id}.${key}: ô thật chưa có chữ "lấy số ở đâu"`).toBeDefined();
    }
  });

  /*
   * 268 ô, đếm thành tiếng. Con số này là tổng ô nhập của cả thư viện và nó chỉ đổi khi Registry
   * đổi — ghim để một ô thêm vào hay bỏ đi không lặng lẽ kéo kho lệch theo.
   *
   * Từ 269 xuống 268 ngày 06/10/2026: bỏ ô `guess` của `xirr`, một thanh trượt không đổi được kết
   * quả ở bất kỳ giá trị nào. Xem docblock mục 5 ở `src/core/formulas/returns.ts`.
   *
   * Lên lại 269 ngày 13/10/2026: `gia-von-trung-binh-dca` thêm biến đếm `lots` ("Số đợt mua") khi
   * số đợt thành thứ người dùng thêm bớt được. Ô của đợt thứ tư trở đi KHÔNG nằm trong con số này:
   * chúng sinh từ mẫu `spec.repeat`, không khai trong `spec.variables`.
   *
   * Kho xuống 263 ngày 14/10/2026: bỏ câu của sáu ô nhóm lặp thứ hai, thứ ba (đợt 2, 3 của
   * `gia-von-trung-binh-dca`, kỳ 2, 3 của `loi-suat-trung-binh-hinh-hoc`). Registry vẫn 269 ô.
   */
  it('Registry có 269 ô nhập; bài kể 263 ô, và kho có đúng 263 câu', () => {
    expect(MOI_O_REGISTRY).toHaveLength(269);
    const sauNhom1 = MOI_O_REGISTRY.filter((o) => o.sauNhom1).map(({ id, key }) => `${id}.${key}`);
    expect(sauNhom1.sort()).toEqual(
      [
        'gia-von-trung-binh-dca.amount2',
        'gia-von-trung-binh-dca.amount3',
        'gia-von-trung-binh-dca.price2',
        'gia-von-trung-binh-dca.price3',
        'loi-suat-trung-binh-hinh-hoc.r2',
        'loi-suat-trung-binh-hinh-hoc.r3',
      ].sort(),
    );
    expect(MOI_O).toHaveLength(263);
    const soMucTrongKho = MUC.reduce((n, [, bai]) => n + Object.keys(bai.oNhap).length, 0);
    expect(soMucTrongKho).toBe(263);
  });

  it('mọi ô đều có câu "lấy số ở đâu", không câu nào rỗng', () => {
    for (const { id, key, o } of MOI_O) {
      expect(o?.layODau.vi.trim(), `${id}.${key}`).not.toBe('');
    }
  });

  /*
   * 159/263 ô có thêm một câu `luuY`. Con số này là một phép đếm, không phải một cái trần: thêm
   * lưu ý cho một ô là việc tốt. Ghim để thấy nó đi lên, và để không ai xoá bớt mà không ai biết.
   *
   * Từ 163 xuống 159 ngày 14/10/2026: bốn trong sáu ô nhóm lặp bị bỏ câu có lưu ý (giá đợt 2, 3 và
   * kỳ 2, 3).
   */
  it('159 ô có thêm câu lưu ý', () => {
    const coLuuY = MOI_O.filter(({ o }) => (o?.luuY?.vi ?? '').trim() !== '');
    expect(coLuuY).toHaveLength(159);
  });

  /*
   * Trần độ dài, đo trên chính kho rồi ghim ở mức vừa trên con số thật (cả hai đang là 87).
   *
   * Không phải thẩm mỹ: khung "?" rộng 32rem, và mỗi ô chiếm hai dòng (tên ô, rồi câu "lấy ở
   * đâu"). Một câu dài gấp đôi phần còn lại sẽ vắt bốn dòng, và công thức năm ô như `rut-truoc-han`
   * đẩy khung cao quá khung nhìn. Con số chỉ được phép đi XUỐNG.
   */
  /*
   * Đo CÂU ĐÃ ĐIỀN ở số mặc định, không đo chuỗi thô: chỗ trống `{sessions|thoiGian}` dài 19 ký tự
   * mà in ra "3 tháng" có 7, nên đo chuỗi thô là phạt một câu vì cú pháp chứ không vì thứ khung
   * phải bày (14/10/2026).
   */
  it('không câu nào của ô nhập vượt trần độ dài', () => {
    for (const { id, key, o } of MOI_O) {
      const spec = findFormulaModule(id)?.spec;
      if (spec === undefined || o === undefined) continue;
      const thongSo = thongSoTu(spec);
      const layODau = dienCau(o.layODau.vi, thongSo);
      expect(layODau.length, `${id}.${key}.layODau: ${layODau}`).toBeLessThanOrEqual(90);
      if (o.luuY === undefined) continue;
      const luuY = dienCau(o.luuY.vi, thongSo);
      expect(luuY.length, `${id}.${key}.luuY: ${luuY}`).toBeLessThanOrEqual(90);
    }
  });
});

describe('giữ đúng khuôn của tài liệu', () => {
  /*
   * *"Mỗi công thức đúng bốn dòng. Không công thức nào được dài hơn."* — câu đầu tiên của tài liệu
   * 03/10. `guide-111.json` giữ nguyên ba dòng viết cho cả bài và thay dòng thứ tư bằng `oNhap`,
   * nên khuôn vẫn là bốn trường, chỉ khác hình. Khuôn vỡ thì bài dài ngắn thất thường và khung bật
   * tại nút mất dáng.
   */
  it('đủ bốn trường, không dòng nào rỗng, không trường lạ', () => {
    for (const [id, bai] of MUC) {
      expect(Object.keys(bai).sort(), id).toEqual([...BA_DONG, 'oNhap'].sort());
      for (const khoa of BA_DONG) {
        expect(bai[khoa].vi.trim(), `${id}.${khoa}`).not.toBe('');
      }
    }
  });

  /*
   * Trần độ dài của ba dòng cả bài — đo trên chính kho, ghim vừa trên con số thật. Trần cũ của
   * `canNhap` (260) đi cùng dòng ấy; chữ ô nhập nay có trần riêng, chặt hơn, ở `describe` trên.
   */
  it('không dòng nào vượt trần độ dài', () => {
    const tran: Record<(typeof BA_DONG)[number], number> = {
      deLamGi: 130,
      docKetQua: 190,
      deSai: 160,
    };
    for (const [id, bai] of MUC) {
      for (const khoa of BA_DONG) {
        expect(bai[khoa].vi.length, `${id}.${khoa}: ${bai[khoa].vi}`).toBeLessThanOrEqual(
          tran[khoa],
        );
      }
    }
  });

  /*
   * KHÔNG gạch ngang dài, cùng luật đã chốt cho bảng ký hiệu và dòng biểu thức: chủ dự án đọc "—"
   * cạnh con số thành dấu trừ, và đã nhắc hai lần. Bài hướng dẫn đầy số nên luật ấy áp ở đây nữa.
   *
   * Ba dòng cả bài và cả 263 câu `layODau` đều sạch — đo được, 0 chỗ. Riêng `luuY` còn 20 chỗ, và
   * chúng được GHIM chứ không cấm: xem ca kiểm cuối file.
   */
  it('không dòng nào mang gạch ngang dài', () => {
    for (const [id, bai] of MUC) {
      for (const khoa of BA_DONG) {
        expect(/[–—]/.test(bai[khoa].vi), `${id}.${khoa}: ${bai[khoa].vi}`).toBe(false);
      }
    }
    for (const { id, key, o } of MOI_O) {
      expect(/[–—]/.test(o?.layODau.vi ?? ''), `${id}.${key}: ${o?.layODau.vi}`).toBe(false);
    }
  });

  /*
   * "Dễ sai" là ĐÚNG MỘT lỗi — luật của tài liệu. Máy không đọc được "một lỗi", nhưng đọc được
   * dấu hiệu của một danh sách: dòng nào mang " · " là đang liệt kê, và lúc ấy phải có người xem.
   */
  it('dòng "Dễ sai" không liệt kê — một lỗi, không phải một danh sách', () => {
    for (const [id, bai] of MUC) {
      expect(bai.deSai.vi.includes(' · '), `${id}: ${bai.deSai.vi}`).toBe(false);
    }
  });
});

/*
 * ── Mộ chí: hai ca kiểm của phép tách " · " ─────────────────────────────────────────────────
 *
 * "mọi cụm đều có nội dung, không cụm nào là mảnh vỡ" và "bản tiếng Anh, khi có, chia đúng số cụm
 * như bản tiếng Việt" đã BỎ ngày 05/10/2026. Cả hai chỉ tồn tại để đỡ cho `tachCum()` ở
 * `GuideBody` — một phép tách chuỗi ở tầng hiện hình. Chuỗi ấy không còn trong kho, nên không còn
 * gì để tách và không còn gì để gác. Đừng dựng lại: ca kiểm "mọi khoá trong kho là một ô thật"
 * gác đúng việc ấy, và gác chặt hơn hẳn.
 */

/*
 * ── Bản tiếng Anh: đủ, và mang đúng những gì bản Việt mang ──────────────────────────────────
 *
 * Mộ chí: hai ca "nợ bản tiếng Anh, đếm thành tiếng" (111 mục, 263 ô chưa dịch) đã về 0 ngày
 * 15/10/2026 — chủ dự án chọn "dịch nháp rồi duyệt" và cả 755 chuỗi đã có `en`. Đúng như lời hẹn
 * của chính hai ca ấy, chúng đổi thành lời khẳng định đã dịch xong, kèm những gì máy kiểm được.
 *
 * Máy KHÔNG kiểm được nghĩa: một câu dịch đảo chiều ("cao là tốt" thành "thấp là tốt") hay đổi chỗ
 * hai con số cùng đơn vị vẫn xanh ở đây. Bản dịch đang chờ chủ dự án đọc, như mọi chữ chưa duyệt.
 */
describe('bản tiếng Anh của kho', () => {
  const VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  /** Chỗ trống, xếp lại — tiếng Anh được đổi thứ tự câu, không được thêm bớt chỗ trống. */
  const choTrong = (cau: string) => [...choTrongCua(cau)].map((c) => `${c.khoa}|${c.kieu}`).sort();
  /** Con số viết bằng chữ số, bỏ chỗ trống ra — giữ đúng ký tự, kể cả dấu `.` `,` kiểu Việt. */
  const conSo = (cau: string) =>
    (cau.replace(/\{[^}]*\}/g, ' ').match(/\d+(?:[.,]\d+)*/g) ?? []).sort();

  /** Mọi cặp vi/en của kho, kèm trần độ dài riêng của từng loại dòng. */
  const MOI_CAP = [
    ...MUC.flatMap(([id, bai]) =>
      BA_DONG.map((khoa) => ({
        nhan: `${id}.${khoa}`,
        id,
        cau: bai[khoa],
        tran: { deLamGi: 140, docKetQua: 200, deSai: 170 }[khoa],
      })),
    ),
    ...MOI_O.flatMap(({ id, key, o }) =>
      o === undefined
        ? []
        : [
            { nhan: `${id}.${key}.layODau`, id, cau: o.layODau, tran: 100 },
            ...(o.luuY === undefined
              ? []
              : [{ nhan: `${id}.${key}.luuY`, id, cau: o.luuY, tran: 100 }]),
          ],
    ),
  ];

  it('đủ 755 chuỗi, chuỗi nào cũng có bản tiếng Anh', () => {
    expect(MOI_CAP).toHaveLength(755);
    for (const { nhan, cau } of MOI_CAP) {
      expect((cau.en ?? '').trim(), nhan).not.toBe('');
    }
  });

  it('bản tiếng Anh không còn chữ có dấu tiếng Việt, không gạch ngang dài', () => {
    for (const { nhan, cau } of MOI_CAP) {
      const en = cau.en ?? '';
      expect(VI.test(en), `${nhan}: ${en}`).toBe(false);
      expect(/[–—]/.test(en), `${nhan}: ${en}`).toBe(false);
      // "Dễ sai" là MỘT lỗi ở cả hai ngôn ngữ — cùng luật với bản Việt ở trên.
      if (nhan.endsWith('.deSai')) expect(en.includes(' · '), `${nhan}: ${en}`).toBe(false);
    }
  });

  /*
   * Chỗ trống và con số phải KHỚP bản Việt: thiếu một chỗ trống là câu tiếng Anh đứng chết trong
   * khi câu Việt đi theo ô — đúng lỗi 14/10/2026 quay lại qua cửa dịch. Số giữ đúng ký tự kiểu Việt
   * vì giao diện EN vẫn in số kiểu Việt (quyết định 15/10/2026), nên số trong câu khớp số trong ô.
   */
  it('chỗ trống và con số khớp bản Việt', () => {
    for (const { nhan, cau } of MOI_CAP) {
      const en = cau.en ?? '';
      expect(choTrong(en), `${nhan}: ${en}`).toEqual(choTrong(cau.vi));
      expect(conSo(en), `${nhan}: ${en}`).toEqual(conSo(cau.vi));
    }
  });

  it('điền ở số mặc định thì không vượt trần độ dài và không sót dấu ngoặc', () => {
    for (const { nhan, id, cau, tran } of MOI_CAP) {
      const spec = findFormulaModule(id)?.spec;
      if (spec === undefined) continue;
      const ra = dienCau(cau.en ?? '', thongSoTu(spec), undefined, 'en');
      expect(ra.length, `${nhan}: ${ra}`).toBeLessThanOrEqual(tran);
      expect(ra, `${nhan}: ${ra}`).not.toMatch(/[{}]/);
    }
  });
});

describe('những chỗ TÀI LIỆU TỰ NHẬN còn mở', () => {
  /*
   * Tài liệu, mục "Việc cần làm tiếp": *"Ngưỡng số trong dòng Đọc kết quả (ROE 15%, RSI 70/30, D/E
   * 2 lần, Sharpe 1) nên chốt lại với chủ dự án, vì chúng là quy ước chứ không phải chuẩn bắt
   * buộc."*
   *
   * Đây là một XUNG ĐỘT có thật với luật sẵn có, và ca kiểm này tồn tại để nó không bị quên:
   * `how-to-read-rules.ts` CẤM ngưỡng tự đặt trong `explanation.howToRead` (số chỉ được là 0/1/100
   * cộng một danh sách quy ước thị trường có tên — RSI 70/30/50, Stochastic 80/20). Chữ ở kho này
   * KHÔNG đi qua cửa gác ấy, nên sáu ngưỡng dưới đây đang sống ở bài mà không sống được ở Registry.
   *
   * Giữ nguyên là quyết định có chủ ý: đây là chữ chủ dự án giao, và cắt ngưỡng đi thì dòng "Đọc
   * kết quả" mất gần hết giá trị. `guide-111.json` giao lại y nguyên sáu dòng ấy, nên vẫn chờ chốt.
   * Ca này GHIM danh sách để khi chốt thì có đúng một chỗ để sửa, và để không ai lặng lẽ thêm cái
   * thứ bảy.
   */
  it('đúng SÁU công thức mang ngưỡng tự đặt, chưa chốt với chủ dự án', () => {
    /*
     * Đo được, và phép đo phải tách HAI LOẠI SỐ mà tài liệu trộn chung — tài liệu tự đoán có bốn
     * chỗ, đo thật ra sáu, và ba chỗ tài liệu kể tên lại không thuộc nhóm này:
     *
     *   · NGƯỠNG ĐÁNH GIÁ — "trên 15% thường là doanh nghiệp tốt". Một con số nói tốt hay xấu.
     *     Đây mới là thứ `how-to-read-rules.ts` cấm, và là thứ cần chốt.
     *   · SỐ MINH HOẠ — "25% nghĩa là cứ 100 đồng vốn lãi thêm 25 đồng". Một con số dạy ĐỌC ĐƠN
     *     VỊ, không phán xét gì. Loại này chủ dự án đã duyệt từ trước, nguyên văn luật đã chốt:
     *     *"'Cách đọc kết quả' là dạy đọc con số, không tả cơ chế; số cụ thể chỉ nêu dạng minh
     *     hoạ"*. 11 công thức dùng nó và không chỗ nào phải sửa.
     *
     * Mốc 0, 1 và 100 không tính: chúng là mỏ neo tự nhiên (sổ sách, hoà vốn, trả hết lãi), đúng
     * ngoại lệ mà `how-to-read-rules.ts` cũng chừa. Quy ước thị trường CÓ TÊN cũng không tính —
     * RSI 70/30/50 và Stochastic 80/20 đã nằm trong `QUY_UOC` của luật ấy.
     */
    const QUY_UOC_CO_TEN = ['rsi-wilder', 'stochastic-k'];
    const MOC = /(trên|dưới|quanh)\s+(\d+(?:,\d+)?)/gi;
    const PHAN_XET = /(tốt|khá|hợp lý|an toàn|bình thường|đắt|đòn bẩy cao|quay nhanh|căng thẳng)/i;

    const nguongTuDat = MUC.filter(([id, bai]) => {
      if (QUY_UOC_CO_TEN.includes(id)) return false;
      const cau = bai.docKetQua.vi;
      if (!PHAN_XET.test(cau)) return false;
      return [...cau.matchAll(MOC)].some((m) => !['0', '1', '100'].includes(m[2] ?? ''));
    });

    expect(nguongTuDat.map(([id]) => id).sort()).toEqual(
      [
        'no-tren-von-chu',
        'peg',
        'roe',
        'ty-so-sharpe',
        'ty-so-sortino',
        'vong-quay-tong-tai-san',
      ].sort(),
    );
  });

  /*
   * 20 câu `luuY` viết khoảng bằng gạch en: "3–5% là vùng hợp lý", "thường 7–9%", "1–2% là mức
   * quản trị rủi ro thông dụng".
   *
   * Chúng mâu thuẫn với luật gạch ngang ở trên, và được GIỮ NGUYÊN VĂN có chủ ý: đây là chữ chủ dự
   * án vừa giao, và đợt này là chép vào, không phải biên tập lại. Nhưng mâu thuẫn thì phải thấy
   * được, vì đây đúng loại chỗ đã bị nhắc hai lần — một khoảng "3–5%" nằm ngay cạnh dấu "%" đọc
   * thành "3 trừ 5%". Lối ra có sẵn và là một dòng mỗi chỗ: luật dự án đã chốt cách nối bằng chữ
   * ("từ 3 đến 5%"), đúng như bảng ký hiệu đã làm.
   *
   * Ca này ghim ĐÚNG 20 chỗ. Con số chỉ được phép đi XUỐNG, và chỗ thứ 21 làm đỏ ngay.
   */
  it('đúng 20 câu lưu ý còn viết khoảng bằng gạch en, chờ chủ dự án chốt', () => {
    const coGach = MOI_O.filter(({ o }) => /[–—]/.test(o?.luuY?.vi ?? '')).map(
      ({ id, key }) => `${id}.${key}`,
    );

    expect(coGach.sort()).toEqual(
      [
        'capm.erp',
        'capm.riskFree',
        'co-lenh-rui-ro.riskPercent',
        'co-vi-the-phai-sinh.riskPercent',
        'gia-ly-thuyet-vn30f.dividendYield',
        'gia-tri-noi-tai-fcff.growth',
        'lai-kep.rate',
        'lai-tien-gui.rate',
        'lich-tra-no.rate',
        'loi-suat-thuc.inflation',
        'mo-hinh-gordon.growth',
        'rut-truoc-han.demandRate',
        'so-hop-dong-toi-da.marginRatio',
        'so-ky-dca.rate',
        'tiet-kiem-muc-tieu.rate',
        'tra-gop-goc-deu.rate',
        'tra-gop-nien-kim.rate',
        'ty-so-thang-thua.threshold',
        'wacc.costDebt',
        'wacc.costEquity',
      ].sort(),
    );
  });

  /*
   * Câu `layODau` KHÔNG ô nào trùng từng chữ với `variables[].description` — đo được, 0/269.
   *
   * Đây là bằng chứng máy đọc được cho lời phê đợt 5 (*"không phải viết lại thông tin của phần
   * đó"*). Hai trường trả lời hai câu khác nhau: `description` nói ô LÀ GÌ, `layODau` nói lấy số ấy
   * Ở ĐÂU. Ngày nào một câu bị chép sang câu kia thì ca này đỏ, trước khi nó kịp lên màn.
   */
  it('không câu "lấy số ở đâu" nào là bản chép của mô tả ô', () => {
    for (const { id, key, bien, o } of MOI_O) {
      const moTa = (bien.description?.vi ?? '').trim();
      if (moTa === '') continue;
      expect(o?.layODau.vi.trim(), `${id}.${key}: chép lại mô tả ô`).not.toBe(moTa);
    }
  });

  /*
   * 20 ô mà `spec.variables[].description` còn trống — bảng biến ở cuối trang tính đang in "—" ở
   * đúng 20 chỗ ấy, và `REVIEW.md` đã ghi đó là việc viết nội dung còn nợ.
   *
   * Kho này KHÔNG lấp chỗ nợ đó: `layODau` nói "lấy ở đâu", không nói "ô này là gì", nên bảng biến
   * vẫn trống như cũ. Ghim con số để đừng ai tưởng đợt này đã đóng nó.
   */
  it('20 ô vẫn chưa có mô tả trong Registry — việc còn lại, kho này không lấp', () => {
    // Nợ của REGISTRY (bảng biến in mọi ô, cả đợt 2, 3), nên đếm trên mọi ô chứ không trên ô của bài.
    const thieuMoTa = MOI_O_REGISTRY.filter(
      ({ bien }) => (bien.description?.vi ?? '').trim() === '',
    );
    expect(thieuMoTa).toHaveLength(20);
  });
});

/*
 * ── Số minh hoạ đi theo ô, số quy ước đứng yên (14/10/2026) ──────────────────────────────────
 *
 * Chủ dự án chụp thanh trượt ở 55 phiên dưới khung "?" ghi "60 phiên là khoảng ba tháng", rồi chốt:
 * số dùng để ví dụ trong hướng dẫn phải đổi theo khi người dùng đổi thông số hay nạp mã. Phép điền
 * ở `./cho-trong.ts`; ba ca dưới gác KHO CHỮ: chỗ trống trỏ đúng ô thật, danh sách câu đã thành
 * mẫu, và — ca quan trọng nhất — không câu nào lặng lẽ mang lại một con số cứng trùng số mặc định
 * của chính ô ấy mà không ai xếp loại nó.
 */
describe('số trong câu của ô nhập: đi theo ô hay đứng yên có chủ ý', () => {
  /** Mọi câu của ô nhập, kèm thông số của công thức để điền. */
  const MOI_CAU = MOI_O.flatMap(({ id, key, bien, o }) => {
    if (o === undefined) return [];
    const ra = [{ id, key, bien, truong: 'layODau', cau: o.layODau }];
    if (o.luuY !== undefined) ra.push({ id, key, bien, truong: 'luuY', cau: o.luuY });
    return ra;
  });

  it('mọi chỗ trống trỏ vào một ô THẬT của chính công thức, với một kiểu đã biết', () => {
    for (const { id, key, truong, cau } of MOI_CAU) {
      const spec = findFormulaModule(id)?.spec;
      if (spec === undefined) continue;
      for (const ngonNgu of [cau.vi, cau.en ?? '']) {
        for (const { khoa, kieu } of choTrongCua(ngonNgu)) {
          const nhan = `${id}.${key}.${truong}: {${khoa}|${kieu}}`;
          const bien = spec.variables.find((item) => item.key === khoa);
          expect(bien, `${nhan} — không có ô nào khoá "${khoa}"`).toBeDefined();
          expect(laKieuChoTrong(kieu), `${nhan} — kiểu lạ`).toBe(true);
          if (kieu === 'min') expect(bien?.min, `${nhan} — ô không khai min`).toBeDefined();
          if (kieu === 'max') expect(bien?.max, `${nhan} — ô không khai max`).toBeDefined();
        }
      }
    }
  });

  it('điền ở số mặc định thì không còn dấu ngoặc nào sót lại', () => {
    for (const { id, key, truong, cau } of MOI_CAU) {
      const spec = findFormulaModule(id)?.spec;
      if (spec === undefined) continue;
      const ra = dienCau(cau.vi, thongSoTu(spec));
      expect(ra, `${id}.${key}.${truong}: ${ra}`).not.toMatch(/[{}]/);
    }
  });

  /*
   * 17 câu đã thành mẫu. Đếm thành tiếng để một câu bị "sửa ngược" về số cứng thì đỏ ngay — đó
   * đúng là lỗi vừa sửa.
   */
  it('đúng 17 câu có chỗ trống', () => {
    const coChoTrong = MOI_CAU.filter(({ cau }) => choTrongCua(cau.vi).length > 0).map(
      ({ id, key, truong }) => `${id}.${key}.${truong}`,
    );
    expect(coChoTrong.sort()).toEqual(
      [
        // Số phiên của ô → thời gian lịch.
        'bien-do-dao-dong-lon-nhat.sessions.luuY',
        'chuoi-phien-giam-dai-nhat.sessions.luuY',
        'do-bien-dong-nam-hoa.sessions.luuY',
        'do-lech-chuan-ban-phan.sessions.luuY',
        'do-lech-chuan-loi-suat-phien.sessions.luuY',
        'he-so-bien-thien.sessions.luuY',
        'do-bien-dong-lich-su.sample.luuY',
        'cvar-lich-su.lookback.luuY',
        'sut-giam-hien-tai.lookback.luuY',
        'sut-giam-sau-nhat.lookback.luuY',
        'var-lich-su.lookback.luuY',
        'vwap.period.luuY',
        // Số cổ phiếu của ô → cách đọc theo tỷ/triệu.
        'gia-tri-noi-tai-fcff.shares.luuY',
        'ncav-tren-co-phieu.shares.luuY',
        'von-hoa-thi-truong.shares.luuY',
        // Cận của ô → đi theo MÃ, không theo số đang nhập.
        'beta.sessions.luuY',
        'loi-suat-trung-binh-hinh-hoc.periods.luuY',
      ].sort(),
    );
  });

  /*
   * Ca chặn lỗi QUAY LẠI. Một con số đứng cứng trong câu của ô X mà trùng đúng số mặc định của ô X
   * là dấu hiệu mạnh nhất của loại câu vừa sửa: câu viết quanh số mặc định, và ô sẽ rời số ấy ngay
   * khi người dùng kéo hay nạp mã.
   *
   * Nhưng không phải số nào như thế cũng sai: "12 là mặc định phổ biến" dưới ô chu kỳ nhanh của
   * MACD là một QUY ƯỚC, mặc định của ô được chọn theo đúng quy ước ấy, và cho nó chạy theo ô thì
   * thành "10 là mặc định phổ biến" — một câu sai. Nên ca này không cấm; nó bắt XẾP LOẠI. Mỗi câu
   * trùng số mặc định mà không phải chỗ trống phải nằm trong một trong ba nhóm dưới, mỗi nhóm một
   * lý do. Ba nhóm cộng lại 43 câu; câu thứ 44 làm đỏ, và người thêm nó phải chọn: thành chỗ
   * trống, hay ghi vào một nhóm.
   *
   * 0, 1 và 100 không tính: chúng là mốc tự nhiên ("để 0 nếu chưa có"), không phải số minh hoạ.
   */
  it('mọi con số cứng trùng số mặc định của chính ô đều đã được xếp loại', () => {
    /** Quy ước thị trường hay kỹ thuật: mặc định của ô được CHỌN theo nó. */
    const QUY_UOC = [
      'atr-dao-dong-thuc.period.luuY',
      'cvar-lich-su.confidence.luuY',
      'dai-bollinger-duoi.k.luuY',
      'dai-bollinger-duoi.period.luuY',
      'dai-bollinger-tren.k.luuY',
      'dai-bollinger-tren.period.luuY',
      'ddm-hai-giai-doan.years.luuY',
      'do-rong-dai-bollinger.k.luuY',
      'do-rong-dai-bollinger.period.luuY',
      'gui-quay-vong.shortMonths.luuY',
      'khoang-cach-gia-so-sma.period.luuY',
      'macd-duong-chinh.fastPeriod.luuY',
      'macd-duong-chinh.slowPeriod.luuY',
      'macd-duong-tin-hieu.fastPeriod.luuY',
      'macd-duong-tin-hieu.signalPeriod.luuY',
      'macd-duong-tin-hieu.slowPeriod.luuY',
      'phan-tram-b-bollinger.k.luuY',
      'phan-tram-b-bollinger.period.luuY',
      'rsi-wilder.period.luuY',
      'sma-n-phien.period.luuY',
      'stochastic-k.period.luuY',
      'ty-le-khoi-luong.period.luuY',
      'var-lich-su.confidence.luuY',
      'co-lenh-rui-ro.riskPercent.luuY',
      'co-vi-the-phai-sinh.riskPercent.luuY',
    ];
    /** Sự thật về thị trường hay luật Việt Nam — đúng bất kể người dùng nhập gì. */
    const SU_THAT = [
      'do-bien-dong-nam-hoa.tradingDays.luuY',
      'fcfe.taxRate.luuY',
      'fcff.taxRate.luuY',
      'wacc.taxRate.luuY',
      'loi-suat-thuc.inflation.luuY',
      'mo-hinh-gordon.growth.luuY',
      'lai-kep.rate.luuY',
      'so-ky-dca.rate.luuY',
      'tiet-kiem-muc-tieu.rate.luuY',
      'rut-truoc-han.demandRate.luuY',
      'so-hop-dong-toi-da.marginRatio.luuY',
      'ty-so-calmar.sessionsPerYear.luuY',
      'ty-so-sharpe.sessionsPerYear.luuY',
      'ty-so-sortino.sessionsPerYear.luuY',
      'ty-so-thong-tin.sessionsPerYear.luuY',
      'ty-so-treynor.sessionsPerYear.luuY',
    ];
    /** Cách điền: một phép đổi hay một bảng tra, đúng với mọi số trong ô. */
    const CACH_DIEN = ['irr-nien-kim.periods.luuY', 'loi-suat-nam-hoa.periodsPerYear.luuY'];

    const SO = /(?<![\p{L}\p{N}])\d+(?:[.,]\d+)*(?![\p{L}\p{N}])/gu;
    const docSo = (chu: string) => Number(chu.replace(/\./g, '').replace(',', '.'));

    const trungMacDinh = MOI_CAU.filter(({ bien, cau }) => {
      const conLai = cau.vi.replace(/\{[^}]*\}/g, ' ');
      return [...conLai.matchAll(SO)]
        .map((m) => docSo(m[0]))
        .some((so) => ![0, 1, 100].includes(so) && so === bien.defaultValue);
    }).map(({ id, key, truong }) => `${id}.${key}.${truong}`);

    expect(trungMacDinh.sort()).toEqual([...QUY_UOC, ...SU_THAT, ...CACH_DIEN].sort());
  });
});

/** Giúp TypeScript hiểu `bai[khoa]` ở trên là một `SongNgu`. */
function _kiemKieu(bai: BaiRieng): string {
  return bai.deLamGi.vi;
}
void _kiemKieu;
