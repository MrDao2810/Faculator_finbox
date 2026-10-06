import { describe, expect, it } from 'vitest';

import { ALL_FORMULAS, findFormulaModule } from '../../formulas';
import { BAI_RIENG } from './items';
import type { BaiRieng } from './types';

/**
 * Cửa gác của kho chữ hướng dẫn riêng (chủ dự án giao 03/10/2026, rồi `guide-111.json` 05/10/2026).
 *
 * Kho này là chữ CHÉP TAY, khác hẳn phần còn lại của bài — vốn suy ra từ Registry. Nên thứ cần gác
 * cũng khác: không phải "suy có đúng không" mà là "chép có đủ, có khớp, và có giữ khuôn không".
 *
 * Đợt `guide-111.json` đổi trọng tâm của file này. Trước đó phần nặng nhất là gác phép tách chuỗi
 * " · " — hai ca kiểm chỉ tồn tại để đỡ cho một phép tách ở tầng hiện hình. Giờ chữ ô nhập đã có
 * KHOÁ, nên hai ca ấy biến mất và chỗ của chúng là một ca mạnh hơn hẳn: khoá trong kho phải là
 * `VariableSpec.key` thật, và phải phủ đủ cả 269 ô. Đó là cửa gác duy nhất bắt được một ô mới thêm
 * vào `spec.variables` mà chưa có câu, hoặc một ô bị đổi tên khoá.
 */

const MUC = Object.entries(BAI_RIENG);

/** Ba dòng viết cho CẢ BÀI. Chữ của từng ô nhập nằm ở `oNhap`, gác riêng bên dưới. */
const BA_DONG = ['deLamGi', 'docKetQua', 'deSai'] as const;

/** Mọi ô nhập của mọi công thức, đã ghép với mục tương ứng trong kho. */
const MOI_O = ALL_FORMULAS.flatMap((spec) =>
  spec.variables.map((bien) => ({
    id: spec.id,
    key: bien.key,
    bien,
    o: BAI_RIENG[spec.id]?.oNhap[bien.key],
  })),
);

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
   */
  it('phủ đúng 268 ô nhập của cả thư viện', () => {
    expect(MOI_O).toHaveLength(268);
    const soMucTrongKho = MUC.reduce((n, [, bai]) => n + Object.keys(bai.oNhap).length, 0);
    expect(soMucTrongKho).toBe(268);
  });

  it('mọi ô đều có câu "lấy số ở đâu", không câu nào rỗng', () => {
    for (const { id, key, o } of MOI_O) {
      expect(o?.layODau.vi.trim(), `${id}.${key}`).not.toBe('');
    }
  });

  /*
   * 163/268 ô có thêm một câu `luuY`. Con số này là một phép đếm, không phải một cái trần: thêm
   * lưu ý cho một ô là việc tốt. Ghim để thấy nó đi lên, và để không ai xoá bớt mà không ai biết.
   */
  it('163 ô có thêm câu lưu ý', () => {
    const coLuuY = MOI_O.filter(({ o }) => (o?.luuY?.vi ?? '').trim() !== '');
    expect(coLuuY).toHaveLength(163);
  });

  /*
   * Trần độ dài, đo trên chính kho rồi ghim ở mức vừa trên con số thật (cả hai đang là 87).
   *
   * Không phải thẩm mỹ: khung "?" rộng 32rem, và mỗi ô chiếm hai dòng (tên ô, rồi câu "lấy ở
   * đâu"). Một câu dài gấp đôi phần còn lại sẽ vắt bốn dòng, và công thức năm ô như `rut-truoc-han`
   * đẩy khung cao quá khung nhìn. Con số chỉ được phép đi XUỐNG.
   */
  it('không câu nào của ô nhập vượt trần độ dài', () => {
    for (const { id, key, o } of MOI_O) {
      expect(o?.layODau.vi.length, `${id}.${key}.layODau: ${o?.layODau.vi}`).toBeLessThanOrEqual(
        90,
      );
      if (o?.luuY === undefined) continue;
      expect(o.luuY.vi.length, `${id}.${key}.luuY: ${o.luuY.vi}`).toBeLessThanOrEqual(90);
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
   * Ba dòng cả bài và cả 269 câu `layODau` đều sạch — đo được, 0 chỗ. Riêng `luuY` còn 20 chỗ, và
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

describe('nợ bản tiếng Anh, đếm thành tiếng', () => {
  /*
   * Hai lần giao đều chỉ có tiếng Việt, nên cả kho đang nợ bản `en` và `pick()` rơi về tiếng Việt
   * IM LẶNG — cùng nếp ngân hàng câu hỏi (câu thông báo đã bỏ 30/09/2026).
   *
   * Đếm thành tiếng chứ không để lặng: hai con số này chỉ được phép đi XUỐNG, và ngày chúng về 0
   * thì ca kiểm đỏ, đúng lúc cần một người vào đổi nó thành lời khẳng định đã dịch xong.
   */
  it('111 mục chưa có bản tiếng Anh cho ba dòng cả bài', () => {
    const chuaDich = MUC.filter(([, bai]) =>
      BA_DONG.every((khoa) => (bai[khoa].en ?? '').trim() === ''),
    );
    expect(chuaDich).toHaveLength(111);
  });

  it('268 ô chưa có bản tiếng Anh cho câu "lấy số ở đâu"', () => {
    const chuaDich = MOI_O.filter(({ o }) => (o?.layODau.en ?? '').trim() === '');
    expect(chuaDich).toHaveLength(268);
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
    const thieuMoTa = MOI_O.filter(({ bien }) => (bien.description?.vi ?? '').trim() === '');
    expect(thieuMoTa).toHaveLength(20);
  });
});

/** Giúp TypeScript hiểu `bai[khoa]` ở trên là một `SongNgu`. */
function _kiemKieu(bai: BaiRieng): string {
  return bai.deLamGi.vi;
}
void _kiemKieu;
