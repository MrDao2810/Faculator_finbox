import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES } from './index';

/*
 * Ô số nào được nhận số âm — một quyết định, không phải mặc định (16/11/2026).
 *
 * Chủ dự án chụp `lai-kep`: gõ -10000000 vào "Số tiền gốc (P)" và khối Kết quả in -22.196.402,35 ₫.
 * Từ ngày ấy ô có `min ≥ 0` chặn hẳn dấu trừ (`NumberInput`, `src/ui/inputs/mien-nhap.ts`), nên việc
 * một ô nhận số âm hay không giờ quyết định người dùng GÕ ĐƯỢC gì. Rà cả 111 công thức: mọi ô số
 * đều khai `min`; các ô dưới đây cho âm, và âm ở đó có nghĩa — lợi nhuận, EPS, vốn chủ sở hữu, EBIT,
 * EV, FCFF lỗ được; lợi suất, tăng trưởng, lạm phát, beta có thể âm. Doanh thu âm (P/S, EV/Sales)
 * cũng để lọt CÓ CHỦ Ý: số ấy tới từ báo cáo của một mã, và `calc` tự nói "số liệu sai" thay vì
 * chặn ở phím. Ô số mới cho phép âm thì phải thêm vào đây, tức là phải tự quyết.
 */
const DUOC_AM = [
  'pe.eps',
  'pb.bookValuePerShare',
  'eps-co-ban.netIncome',
  'bvps.equity',
  'roe.netIncome',
  'roe.equity',
  'roa.netIncome',
  'bien-loi-nhuan-rong.netIncome',
  'no-tren-von-chu.equity',
  'ty-le-chi-tra-co-tuc.eps',
  'ps.salesPerShare',
  'ev-ebitda.ev',
  'ev-ebitda.ebitda',
  'ev-sales.ev',
  'ev-sales.revenue',
  'peg.growth',
  'so-graham.eps',
  'so-graham.bvps',
  'ty-suat-loi-nhuan-tren-gia.eps',
  'gia-muc-tieu.eps',
  'capm.beta',
  'fcff.ebit',
  'fcff.nwcChange',
  'fcfe.fcff',
  'fcfe.netBorrowing',
  'gia-tri-noi-tai-fcff.fcff',
  'loi-suat-nam-hoa.periodReturn',
  'loi-suat-thuc.nominal',
  'loi-suat-thuc.inflation',
  'tong-loi-suat-tai-dau-tu.priceGrowth',
  'loi-suat-trung-binh-hinh-hoc.r1',
  'loi-suat-trung-binh-hinh-hoc.r2',
  'loi-suat-trung-binh-hinh-hoc.r3',
  'loi-suat-vuot-chuan.portfolioReturn',
  'loi-suat-vuot-chuan.benchmarkReturn',
  'do-lech-chuan-ban-phan.threshold',
  'ty-so-treynor.beta',
  'ty-so-thong-tin.benchmarkReturn',
  /* Hai ô từng là thanh trượt, thành ô số cùng ngày 16/11/2026: lãi suất âm, tăng trưởng âm có thật. */
  'gia-tri-tuong-lai.rate',
  'mo-hinh-gordon.growth',
  /*
   * Rà miền cả 111 công thức cùng ngày (chủ dự án: _"cần điều chỉnh lại toàn bộ công thức theo hướng
   * này"_): mức dưới phải là điều kiện của công thức, không phải mức tự đặt. Tăng trưởng của DDM hai
   * giai đoạn và của FCFF chỉ cần lớn hơn −100% (dòng tiền co dần vẫn tính được), nên cho âm.
   */
  'ddm-hai-giai-doan.growthStage1',
  'ddm-hai-giai-doan.growthTerminal',
  'gia-tri-noi-tai-fcff.growth',
];

const oSo = FORMULA_MODULES.flatMap((m) =>
  m.spec.variables
    .filter((v) => v.type === 'number')
    .map((v) => ({ ten: `${m.spec.id}.${v.key}`, v })),
);

describe('miền của ô số — ô nào được nhận số âm', () => {
  it('mọi ô số đều khai min, để luật chặn dấu trừ biết ô ấy có nhận âm không', () => {
    const thieu = oSo.filter(({ v }) => v.min === undefined).map(({ ten }) => ten);
    expect(thieu).toEqual([]);
  });

  it('danh sách ô cho phép âm khớp đúng bảng đã duyệt', () => {
    const am = oSo.filter(({ v }) => v.min !== undefined && v.min < 0).map(({ ten }) => ten);
    expect([...am].sort()).toEqual([...DUOC_AM].sort());
  });

  it('giá trị mặc định của ô không nhận âm thì không âm', () => {
    const sai = oSo
      .filter(({ v }) => v.min !== undefined && v.min >= 0 && v.defaultValue < 0)
      .map(({ ten }) => ten);
    expect(sai).toEqual([]);
  });
});
