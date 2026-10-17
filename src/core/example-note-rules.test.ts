import { describe, expect, it } from 'vitest';

import { exampleNoteDuplicates, exampleNoteProblems } from './example-note-rules';
import type { DocViDuInput } from './example-note-rules';
import { ALL_FORMULAS } from './formulas';

/**
 * Hàng "Đọc kết quả" của khối Ví dụ thực tế — luật ở `example-note-rules.ts`, chạy trên cả 111.
 *
 * Phần máy thấy được: khuôn "So với [mốc]: …", hai câu, độ dài, không gạch dài, không tự trỏ, không
 * chữ chuyên môn tả cơ chế, không chữ in hoa để nhấn, không lời khuyên mua/bán. Phần máy KHÔNG thấy
 * — con số đúng với `calc`, câu đầu thật sự đọc kết quả — đã được chạy lại và soát đối kháng lúc
 * viết (16/10/2026); đoạn mới cũng phải làm thế.
 */

function inputOf(spec: (typeof ALL_FORMULAS)[number]): DocViDuInput {
  const { note } = spec.example;
  if (note === undefined) throw new Error(`${spec.id}: ví dụ chưa có hàng Đọc kết quả`);
  return {
    id: spec.id,
    name: spec.name,
    title: spec.example.title,
    ...(spec.example.source === undefined ? {} : { source: spec.example.source }),
    note,
  };
}

describe('hàng "Đọc kết quả" của ví dụ', () => {
  it('cả 111 ví dụ đều có hàng này', () => {
    const thieu = ALL_FORMULAS.filter((spec) => spec.example.note === undefined).map((s) => s.id);
    expect(thieu).toEqual([]);
  });

  it('mọi đoạn theo khuôn "So với [mốc]: …"', () => {
    const loi = ALL_FORMULAS.flatMap((spec) => exampleNoteProblems(inputOf(spec)));
    expect(loi, loi.join('\n')).toEqual([]);
  });

  it('không hai ví dụ nào dùng chung một đoạn', () => {
    expect(exampleNoteDuplicates(ALL_FORMULAS.map(inputOf))).toEqual([]);
  });
});

describe('exampleNoteProblems() — bắt đúng bốn lỗi của đoạn chủ dự án khoanh', () => {
  const NEN = {
    id: 'ddm-hai-giai-doan',
    name: { vi: 'DDM hai giai đoạn', en: 'Two-stage dividend discount model' },
    title: { vi: 'FPT — cổ tức 2.000 ₫', en: 'FPT — dividend 2,000 ₫' },
  };

  it('đoạn cũ của DDM hai giai đoạn bị bắt: không mở bằng mốc, có gạch ngang dài', () => {
    const loi = exampleNoteProblems({
      ...NEN,
      note: {
        vi: 'Giai đoạn tăng nhanh lấy theo mức tăng lợi nhuận sau thuế nửa đầu 2026 của FPT. Phần lớn giá trị vẫn nằm ở giá trị cuối kỳ chứ không ở năm năm cổ tức đầu — sai một điểm phần trăm ở g vĩnh viễn làm kết quả xê dịch mạnh hơn sai năm điểm ở g giai đoạn đầu.',
        en: 'The fast-growth stage follows FPT’s net-profit growth in the first half of 2026. Most of the value still sits in the terminal value — being one point off moves the result more.',
      },
    });
    expect(loi.some((l) => l.includes('phải mở đầu bằng "So với "'))).toBe(true);
    expect(loi.some((l) => l.includes('gạch ngang dài'))).toBe(true);
  });

  it('mốc kết bằng chữ số bị bắt, vì "2026:" đọc thành ký hiệu tỷ lệ', () => {
    const loi = exampleNoteProblems({
      ...NEN,
      note: {
        vi: 'So với giá phiên 11/09/2026: 43.845 ₫ thấp hơn khoảng 40%, tức giá đang cao hơn mức cổ tức biện minh.',
        en: 'Compared with the 72,700 ₫ close: 43,845 ₫ is about 40% lower than the market price today.',
      },
    });
    expect(loi.some((l) => l.includes('kết bằng chữ số'))).toBe(true);
  });

  it('đoạn đúng khuôn thì không bị bắt', () => {
    expect(
      exampleNoteProblems({
        ...NEN,
        note: {
          vi: 'So với thị giá 72.700 ₫ của FPT: 43.845 ₫ thấp hơn khoảng 40%, tức chỉ tính riêng cổ tức thì giá đang cao hơn mức các giả định này biện minh được.',
          en: 'Compared with FPT’s 72,700 ₫ market price: 43,845 ₫ is about 40% lower, so on dividends alone the price is above what these assumptions can justify.',
        },
      }),
    ).toEqual([]);
  });
});
