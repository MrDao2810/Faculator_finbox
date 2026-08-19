/**
 * Cửa gác cho `spec.usesConstants` — khai báo phải khớp thân hàm, cả hai chiều.
 *
 * Vì sao cần: khai báo này là thứ màn chi tiết đọc để bày nhãn, trị số và ngày hiệu lực của
 * hằng số MarketConfig mà công thức đang dùng. Khai thiếu thì người dùng lại không thấy con số
 * — đúng lỗ hổng mà gói này sinh ra để vá. Khai thừa thì màn hình bày một hằng số không liên
 * quan tới kết quả, tệ hơn là không bày.
 *
 * Hai chiều, hai cách kiểm khác nhau, cố ý không dùng chung một cơ chế:
 *
 *   1. QUÉT MÃ NGUỒN bắt khai THIẾU. Đọc ba file có gọi `constantOf`/`rateOf`, cắt theo từng
 *      `FormulaModule`, gom khoá trong mỗi khối rồi đối chiếu với `usesConstants` của chính
 *      công thức ấy. Quét nguồn vì lời gọi nào không chạy trong ca kiểm nào thì cách (2) không
 *      thấy — ví dụ một nhánh chỉ chạy khi người dùng bật một tuỳ chọn.
 *
 *   2. RÚT HẰNG SỐ bắt khai THỪA. Với mỗi khoá đã khai, dựng một biểu phí thiếu đúng khoá đó
 *      rồi chạy `calc`: kết quả BẮT BUỘC phải hỏng (`value === null`). Cách này không đọc chữ
 *      trong file nên không bị lừa bởi một khoá nằm trong comment hay trong chuỗi.
 *
 * Quét nguồn có giới hạn đã biết: nó chỉ hiểu khoá viết thẳng dạng chuỗi, `constantOf(ctx, k)`
 * với `k` là biến sẽ lọt. Hiện không có chỗ nào viết vậy, và ca (2) vẫn bắt được chiều ngược
 * lại. Nếu sau này cần khoá động thì phải đổi cách kiểm, đừng nới regex.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import type { CalcContext } from '../calc/types';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import type { FeeSchedule, MarketConstantKey } from '../market/types';
import { defaultInputs } from '../registry/build';
import { FORMULA_MODULES } from './index';

const AS_OF = '2026-08-04';
const HERE = fileURLToPath(new URL('.', import.meta.url));

/** Ba file duy nhất có công thức tra hằng số. Thêm file mới thì thêm vào đây. */
const FILE_CO_HANG_SO = ['derivatives.ts', 'fees.ts', 'planning.ts'];

/** Khoá viết thẳng trong lời gọi `constantOf(ctx, '…')` / `rateOf(ctx, '…')`. */
const LOI_GOI = /(?:constantOf|rateOf)\(ctx, '([^']+)'\)/g;

/** Cắt file thành từng khối FormulaModule. */
function khoaTheoCongThuc(noiDung: string): Map<string, Set<string>> {
  const ket = new Map<string, Set<string>>();
  const khoi = noiDung.split(/export const \w+: FormulaModule = \{/).slice(1);

  for (const phan of khoi) {
    const id = /id: '([^']+)'/.exec(phan)?.[1];
    if (id === undefined) continue;
    const khoa = new Set([...phan.matchAll(LOI_GOI)].map((m) => m[1] as string));
    if (khoa.size > 0) ket.set(id, khoa);
  }
  return ket;
}

/** Biểu phí mặc định nhưng bỏ hẳn một khoá — dùng để chứng minh công thức thật sự cần khoá ấy. */
function bieuPhiThieu(khoa: MarketConstantKey): FeeSchedule {
  const goc = scheduleOrDefault(MARKET_CONFIG);
  if (goc === undefined) throw new Error('không dựng được biểu phí mặc định');
  return { ...goc, constants: goc.constants.filter((c) => c.key !== khoa) };
}

describe('spec.usesConstants phải khớp thân hàm tính', () => {
  it('không lời gọi hằng số nào bị bỏ khai', () => {
    const thieu: string[] = [];

    for (const ten of FILE_CO_HANG_SO) {
      const noiDung = readFileSync(HERE + ten, 'utf8');

      for (const [id, khoa] of khoaTheoCongThuc(noiDung)) {
        const spec = FORMULA_MODULES.find((m) => m.spec.id === id)?.spec;
        if (spec === undefined) {
          thieu.push(`${ten}/${id}: có trong file nhưng không có trong Registry`);
          continue;
        }
        const daKhai = new Set(spec.usesConstants ?? []);
        for (const k of khoa) {
          if (!daKhai.has(k as MarketConstantKey)) thieu.push(`${id} tra '${k}' mà không khai`);
        }
      }
    }

    expect(thieu, thieu.join(' · ')).toEqual([]);
  });

  it('công thức nào tra hằng số thì file của nó phải nằm trong danh sách quét', () => {
    // Không có ca này thì thêm một file nhóm mới có `rateOf` là cửa gác trên im lặng bỏ qua.
    const khai = FORMULA_MODULES.filter((m) => (m.spec.usesConstants ?? []).length > 0).map(
      (m) => m.spec.id,
    );
    const quetThay = FILE_CO_HANG_SO.flatMap((ten) => [
      ...khoaTheoCongThuc(readFileSync(HERE + ten, 'utf8')).keys(),
    ]);

    expect([...khai].sort()).toEqual([...quetThay].sort());
  });

  it('rút một khoá đã khai ra khỏi biểu phí thì công thức phải hỏng, không được vẫn ra số', () => {
    const khaiThua: string[] = [];

    for (const { spec, calc } of FORMULA_MODULES) {
      for (const khoa of spec.usesConstants ?? []) {
        const ctx: CalcContext = { asOf: AS_OF, schedule: bieuPhiThieu(khoa) };
        const inputs = defaultInputs(spec);
        const ra = calc((k) => inputs[k] ?? 0, ctx);

        // FR-06: thiếu hằng số phải thành cảnh báo, tuyệt đối không phải một con số.
        if (ra.value !== null) {
          khaiThua.push(`${spec.id} khai '${khoa}' nhưng bỏ khoá đó đi vẫn ra ${String(ra.value)}`);
        }
      }
    }

    expect(khaiThua, khaiThua.join(' · ')).toEqual([]);
  });
});
