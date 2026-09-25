import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext } from '../calc/types';
import { findFormulaModule } from '../formulas/index';
import { FORMULA_SUMMARIES } from '../formulas/summaries.generated';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { arithmeticOf, blanksOf, evaluateWorked, workedProblems } from './worked-line';
import {
  QUIZ_CHOICE_KEYS,
  QUIZ_ITEMS,
  hasChoices,
  isAccepted,
  isTranslated,
  quizCoverage,
  quizFor,
} from './index';
import type { QuizItem } from './types';

/**
 * Bất biến của ngân hàng câu hỏi.
 *
 * Ca kiểm ở đây không kiểm nội dung đúng hay sai — chuyện ấy do nguồn chịu trách nhiệm. Nó gác
 * đúng một thứ: **không câu nào được vào ngân hàng mà thiếu chỗ để kiểm chứng**. Thiếu đường
 * dẫn, thiếu ngoặc kép, hay id công thức không có thật đều là dấu hiệu ai đó vừa nghĩ ra một
 * câu hỏi thay vì tìm được nó.
 */

const ID_CONG_THUC = new Set(FORMULA_SUMMARIES.map((s) => s.id));
const NGOAC_KEP = /“[^”]+”/;

/**
 * Ngày tra hằng số cho cửa gác câu tính toán — cùng mốc `formulas.test.ts` đang dùng.
 *
 * Cố định chứ không lấy ngày hôm nay: biểu phí và thuế có `effectiveFrom`, nên một ca kiểm lấy
 * ngày chạy sẽ tự đỏ vào đúng hôm một biểu phí mới có hiệu lực, mà chẳng ai vừa sửa gì.
 */
const CTX: CalcContext = { asOf: '2026-08-04', schedule: scheduleOrDefault(MARKET_CONFIG) };

/**
 * Số câu BÁC BỎ NGỘ NHẬN giải thích bằng lời thay vì trích nguyên văn — GHIM ở 5.
 *
 * Năm câu này vẫn có nguồn, chỉ là người soạn tóm ý thay vì chép nguyên câu, thường vì nguồn
 * trình bày bằng bảng hoặc số liệu rời (biên độ dao động ba sàn, rào cản arbitrage VN30). Ghim
 * con số để lần sau thêm câu kiểu ấy thì ca kiểm đỏ và người thêm phải cân nhắc, thay vì tỷ lệ
 * diễn giải cứ trôi lên mà không ai nhận ra.
 *
 * Câu `quy-dinh` không bị ràng buộc này: dẫn tên điều khoản đã đủ để tra lại.
 */
const SO_CAU_DIEN_GIAI = 5;

/**
 * Ghim để lần sau thêm hay bớt đều phải sửa ca kiểm một cách có ý thức.
 *
 * 206 → 229 → 240 → 282 → 313 → 345 → 367 ngày 23–24/09/2026: lô 1 (23 câu, 6 công thức,
 * Q207–Q229), lô 2 (11 câu, 3 công thức nhóm phân tích kỹ thuật, Q230–Q240), lô 3 (42 câu, 17
 * công thức nhóm rủi ro, Q241–Q282), lô 4 (31 câu, 12 công thức còn lại của nhóm phân tích kỹ
 * thuật, Q283–Q313, đóng trọn nhóm technical), lô 5 (32 câu, 10 công thức nhóm bội số định giá,
 * Q314–Q345). Xem docblock của ca "phân bố" bên dưới về việc vì sao đợt này được phép đẩy số câu
 * lên.
 *
 * 345 → 411 là nhóm câu TÍNH TOÁN (Q346–Q411, 66 công thức, 24/09/2026) — chủ dự án: "toàn bộ
 * bài kiểm tra đang chỉ có liên quan đến lý thuyết mà không có thực hành". 66 là ĐÚNG số công
 * thức tính được từ ô nhập mà chưa có câu tính toán nào; 35 công thức còn lại ăn chuỗi giá nên
 * `verify` không tả đủ đề bài, và 10 công thức đã có sẵn câu tính toán từ trước. Nhóm này có cửa
 * gác riêng ở dưới, chạy thật `calc` để đối chiếu từng đáp số; xem `items/tinh-toan.ts`.
 *
 * 411 → 453 là nhóm câu THỰC HÀNH điền số (Q412–Q453, 42 công thức, 24/09/2026) — chủ dự án:
 * "vẫn có nhiều câu có quá nhiều lý thuyết trong khi tôi muốn người dùng làm quen và sử dụng
 * được công thức". Đo lúc ấy: chỉ 105/411 câu (25,5%) bắt người đọc cầm số mà làm. Q412 soạn
 * tay làm khuôn; 41 câu còn lại soạn bằng agent có tìm tình huống thật trên mạng, qua đủ cửa
 * gác máy của file này, rồi soát tay từng dòng công thức với `latex` và hàm `calc` của trang.
 * Vòng đối chiếu đối kháng tự động bị ngắt giữa chừng (giới hạn phiên), nên phần nó phải làm
 * — mở lại URL, soi công thức — đã làm bằng tay; hai URL không trả 200 cho `fetch` trần đã mở
 * lại bằng trình đọc trang và khớp đúng số liệu. 47 công thức còn lại CHƯA có câu điền số.
 * Xem `items/thuc-hanh.ts`.
 *
 * 453 → 473 là 20 câu điền số cho 20 trong 21 công thức CHƯA có câu tính toán nào (Q454–Q473,
 * 25/09/2026) — phần lớn ăn chuỗi giá: SMA, RSI, MACD, Bollinger, Sharpe, Sortino, VaR, CVaR…
 * Chủ dự án chọn chạy workflow: 7 agent soạn, mỗi agent ba công thức, tìm số liệu thật (giá
 * VN-Index, VIC, GAS, HPG… trên các trang dữ liệu giá, bài giảng có ví dụ tính tay); 7 agent đối
 * chiếu mở lại từng URL, tính lại bằng chính `worked-line.ts`, và soát bảng `gan`. 14 agent, 0 lỗi
 * hạ tầng. Công thức thứ 21, `chuoi-phien-giam-dai-nhat`, bị bỏ có lý do: hình của trang là một
 * phép ĐẾM rồi lấy lớn nhất, không có phép tính nào để đặt số vào mà không vẽ một công thức khác.
 */
const TONG_SO_CAU = 473;

/**
 * Số câu dẫn văn bản quy định (`source.kind: 'quy-dinh'`) CHƯA có ngày hiệu lực — GHIM ở 17.
 *
 * Con số này chỉ được đi XUỐNG, và mỗi lần xuống là một lần đọc văn bản gốc: `effectiveFrom` là
 * ngày văn bản có hiệu lực, không điền từ trí nhớ — một ngày sai trông y hệt một ngày đúng, và ca
 * kiểm định dạng ở dưới không phân biệt được. Cùng nếp 7 hằng số thuế/phí ở `schedules.ts`: đối
 * chiếu với bản gốc rồi mới gỡ nhãn bản thảo (17/08/2026). Danh sách 16 câu, kèm văn bản mỗi câu
 * nêu tên, nằm ở TASK.md mục "Đợt 3".
 */
const SO_CAU_QUY_DINH_CHUA_CO_NGAY = 16;

/**
 * Số ô trống nhiều nhất cho phép trên một dòng công thức.
 *
 * Không phải giới hạn kỹ thuật mà là giới hạn của người học: quá ngần này ô thì câu hỏi thành bài
 * chép chính tả, và dòng công thức tràn ngang ở khổ điện thoại. Câu dài hơn thì bỏ trống ÍT đại
 * lượng hơn chứ không bỏ trống lẻ tẻ vài chỗ trong cùng một đại lượng — xem luật "một đại lượng
 * xuất hiện mấy lần thì bỏ trống hết, hoặc không lần nào" ở `worked-line.ts`.
 */
const O_TRONG_TOI_DA = 5;

/**
 * Danh sách câu ĐIỀN SỐ — ghim từng mã, không chỉ đếm.
 *
 * Bất biến mà danh sách này gác: **dòng `worked` phải vẽ CHÍNH công thức của trang mà câu hỏi nằm
 * trên**. Từ 24/09/2026 ô trống nằm TRONG công thức, nên khối câu hỏi vẽ công thức nào là đang nói
 * với người học rằng trang này có công thức ấy.
 *
 * Chủ dự án bắt được lỗi này trên trang `beta`: công thức của trang là `β = Cov(Rᵢ,Rₘ) ÷ Var(Rₘ)`,
 * còn câu hỏi vẽ `Beta điều chỉnh = 0,67 × β + 0,33 × 1` — quy ước beta điều chỉnh của Bloomberg,
 * có nguồn hẳn hoi nhưng KHÔNG có ở đâu trên trang ấy. _"công thức nào thì chỉ làm bài tập của công
 * thức đó thôi chứ."_ Rà cả bộ thì có 14 câu như vậy, và cả 14 đã chuyển sang `trac-nghiem`: nội
 * dung có nguồn giữ nguyên, chỉ thôi vẽ một công thức lạ. Hình cũ không mắc lỗi này vì dòng gợi ý
 * khi ấy chỉ là gợi ý, còn câu hỏi thì hỏi ra một con số.
 *
 * Không máy nào kiểm được "công thức vẽ ra có phải công thức của trang không" — so `latex` với
 * dòng `worked` cần hiểu đại số, và một danh sách miễn trừ sẽ dài hơn chính luật. Nên cửa gác là
 * DANH SÁCH: thêm một câu điền số mới thì ca này đỏ, và người thêm phải đọc đoạn trên trước khi
 * sửa nó.
 */
const CAU_DIEN_SO: ReadonlyArray<string> = [
  'Q231',
  'Q240',
  'Q244',
  'Q253',
  'Q255',
  'Q261',
  'Q265',
  'Q274',
  'Q276',
  'Q283',
  'Q289',
  'Q300',
  'Q303',
  'Q308',
  'Q313',
  'Q316',
  'Q321',
  'Q332',
  'Q333',
  'Q337',
  'Q340',
  'Q344',
  /*
   * Q412–Q453: nhóm thực hành điền số, 24/09/2026. Mỗi câu đã soát tay dòng `worked` với `latex`
   * và `calc` của chính trang — xem docblock `TONG_SO_CAU`.
   */
  'Q412',
  'Q413',
  'Q414',
  'Q415',
  'Q416',
  'Q417',
  'Q418',
  'Q419',
  'Q420',
  'Q421',
  'Q422',
  'Q423',
  'Q424',
  'Q425',
  'Q426',
  'Q427',
  'Q428',
  'Q429',
  'Q430',
  'Q431',
  'Q432',
  'Q433',
  'Q434',
  'Q435',
  'Q436',
  'Q437',
  'Q438',
  'Q439',
  'Q440',
  'Q441',
  'Q442',
  'Q443',
  'Q444',
  'Q445',
  'Q446',
  'Q447',
  'Q448',
  'Q449',
  'Q450',
  'Q451',
  'Q452',
  'Q453',
  // Q454–Q473: 20 công thức chưa có câu tính toán nào — xem docblock `TONG_SO_CAU`.
  'Q454',
  'Q455',
  'Q456',
  'Q457',
  'Q458',
  'Q459',
  'Q460',
  'Q461',
  'Q462',
  'Q463',
  'Q464',
  'Q465',
  'Q466',
  'Q467',
  'Q468',
  'Q469',
  'Q470',
  'Q471',
  'Q472',
  'Q473',
  // Q346–Q411: 66 câu tính toán đổi từ bốn lựa chọn sang điền số (25/09/2026) — chủ dự án: "việc đưa
  // ra các ô để nhập vào giống như tôi yêu cầu thì bạn chưa sửa, vẫn để chọn các số liệu ABCD". Mọi
  // câu vẽ đúng công thức của chính trang (đặc tả đã đối chiếu từng dòng với `latex`), và giữ
  // `verify` để `calc` của sản phẩm vẫn đối chiếu đáp số. Xem docblock `items/tinh-toan.ts`.
  'Q346',
  'Q347',
  'Q348',
  'Q349',
  'Q350',
  'Q351',
  'Q352',
  'Q353',
  'Q354',
  'Q355',
  'Q356',
  'Q357',
  'Q358',
  'Q359',
  'Q360',
  'Q361',
  'Q362',
  'Q363',
  'Q364',
  'Q365',
  'Q366',
  'Q367',
  'Q368',
  'Q369',
  'Q370',
  'Q371',
  'Q372',
  'Q373',
  'Q374',
  'Q375',
  'Q376',
  'Q377',
  'Q378',
  'Q379',
  'Q380',
  'Q381',
  'Q382',
  'Q383',
  'Q384',
  'Q385',
  'Q386',
  'Q387',
  'Q388',
  'Q389',
  'Q390',
  'Q391',
  'Q392',
  'Q393',
  'Q394',
  'Q395',
  'Q396',
  'Q397',
  'Q398',
  'Q399',
  'Q400',
  'Q401',
  'Q402',
  'Q403',
  'Q404',
  'Q405',
  'Q406',
  'Q407',
  'Q408',
  'Q409',
  'Q410',
  'Q411',
];

function thieuNgoacKep(item: QuizItem): boolean {
  return !NGOAC_KEP.test(item.explain.vi);
}

describe('ngân hàng câu hỏi kiểm tra hiểu bài', () => {
  it('có đúng số câu đã ghim và mã câu không trùng', () => {
    expect(QUIZ_ITEMS).toHaveLength(TONG_SO_CAU);
    const ids = QUIZ_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('mọi câu trỏ tới một công thức có thật trong Registry', () => {
    const la = QUIZ_ITEMS.filter((item) => !ID_CONG_THUC.has(item.formulaId));
    expect(la.map((item) => `${item.id}:${item.formulaId}`)).toEqual([]);
  });

  it('mọi câu có đường dẫn nguồn dùng được', () => {
    for (const item of QUIZ_ITEMS) {
      expect(item.source.url, item.id).toMatch(/^https:\/\/[^\s]+$/);
    }
  });

  it('câu có lựa chọn thì đủ bốn ô khác nhau, và đáp án nằm trong số đó', () => {
    for (const item of QUIZ_ITEMS) {
      if (!hasChoices(item)) continue;
      const texts = QUIZ_CHOICE_KEYS.map((key) => item.choices[key].vi.trim());
      expect(
        texts.filter((text) => text !== ''),
        item.id,
      ).toHaveLength(4);
      expect(new Set(texts).size, item.id).toBe(4);
      if (item.format === 'trac-nghiem') {
        expect(QUIZ_CHOICE_KEYS, item.id).toContain(item.answer);
      } else {
        /*
         * Chọn nhiều: hai hoặc ba đáp án. Một thì đã là trắc nghiệm, bốn thì câu hỏi vô nghĩa
         * vì chọn hết là xong. Trùng khoá cũng chặn — 'a','a' trông như hai đáp án mà chỉ là một.
         */
        expect(item.answers.length, item.id).toBeGreaterThanOrEqual(2);
        expect(item.answers.length, item.id).toBeLessThanOrEqual(3);
        expect(new Set(item.answers).size, item.id).toBe(item.answers.length);
        for (const key of item.answers) expect(QUIZ_CHOICE_KEYS, item.id).toContain(key);
      }
    }
  });

  /*
   * Câu điền số phải tự đứng được: người ta không gõ ra con số nếu đề bài không đưa đủ số liệu,
   * và một sai số bằng 0 thì chỉ nhận đúng một giá trị dấu phẩy động — gần như không ai trúng.
   */
  it('câu điền số có đủ số liệu đề bài, đáp án hữu hạn và sai số dương', () => {
    for (const item of QUIZ_ITEMS) {
      if (item.format !== 'dien-so') continue;
      expect(Number.isFinite(item.expected), item.id).toBe(true);
      expect(item.tolerance.value, item.id).toBeGreaterThan(0);
      expect(item.unit.vi.trim(), item.id).not.toBe('');
      expect((item.facts ?? []).length, item.id).toBeGreaterThan(0);
      // Chính đáp án phải được chấp nhận — bắt lỗi khai sai kiểu sai số.
      expect(isAccepted(item, item.expected), item.id).toBe(true);
    }
  });

  /**
   * Dòng công thức của câu điền số, bóc ngoặc vuông ra, phải RA ĐÚNG đáp số — máy tính lại, không
   * phải người soát bằng mắt.
   *
   * Người học đặt số liệu vào các ô trống, nên dòng này là một lời hứa: đặt đúng thì ra đúng.
   * Người soạn thay nhầm một chữ số thì ô ấy chấm SAI một vị trí đúng — và người học sẽ tin là
   * mình sai chứ không tin dòng công thức sai. Không cửa gác nào khác thấy được: `expected` vẫn
   * đúng, lời giải vẫn trôi chảy. Xem docblock `worked-line.ts`.
   *
   * KHÔNG còn danh sách ngoại lệ "gợi ý bằng lời". Ba câu từng nằm trong danh sách ấy (chọn quan
   * sát xếp hạng thứ mấy — Q248, làm tròn free-float lên bậc 5% — Q329, chọn cặp đỉnh–đáy cuốn
   * chiếu — Q244) viết bằng lời vì thay số vào là xoá mất chính bước đang kiểm. Hình mới nuốt gọn
   * cả ba: bước ấy giờ CHÍNH LÀ ô trống. Nên luật siết lại thành "mọi dòng đều phải vẽ được", và
   * `workedProblems` trả về lỗi nếu không.
   */
  /*
   * Ghim đúng những câu nào được phép là dạng điền số — xem docblock `CAU_DIEN_SO` về bất biến
   * "công thức vẽ ra phải là công thức của chính trang ấy", thứ không máy nào kiểm hộ được.
   */
  it('đúng những câu đã ghim mới là dạng điền số', () => {
    const dienSo = QUIZ_ITEMS.filter((item) => item.format === 'dien-so').map((item) => item.id);
    expect(dienSo.slice().sort()).toEqual(CAU_DIEN_SO.slice().sort());
  });

  it('dòng công thức của câu điền số tính lại ra đúng đáp số', () => {
    for (const item of QUIZ_ITEMS) {
      if (item.format !== 'dien-so') continue;

      expect(workedProblems(item.worked.vi), `${item.id}.vi`).toEqual([]);

      const doan = arithmeticOf(item.worked.vi);
      const gia = doan === null ? null : evaluateWorked(doan);
      expect(gia, `${item.id}: bóc ngoặc ra không còn tính lại được`).not.toBeNull();
      if (gia === null) continue;

      expect(
        isAccepted(item, gia),
        `${item.id}: dòng công thức tính ra ${gia}, đáp số khai là ${item.expected}`,
      ).toBe(true);

      const oTrong = blanksOf(item.worked.vi);
      expect(oTrong.length, `${item.id}: không có ô trống nào`).toBeGreaterThan(0);
      expect(oTrong.length, `${item.id}: quá nhiều ô trống`).toBeLessThanOrEqual(O_TRONG_TOI_DA);

      if (item.worked.en !== undefined) {
        expect(workedProblems(item.worked.en), `${item.id}.en`).toEqual([]);

        /*
         * Bản tiếng Anh phải có ĐÚNG NGẦN ẤY ô trống, theo đúng thứ tự — người học gõ vào một mảng
         * duy nhất, mà việc chấm luôn so với bản `vi`, nên lệch một ô là chấm ô này bằng đáp án ô
         * kia.
         */
        expect(blanksOf(item.worked.en).length, `${item.id}: số ô trống hai bản lệch nhau`).toBe(
          oTrong.length,
        );

        /*
         * KHÔNG dấu ngăn nghìn trong bản tiếng Anh. Dấu phẩy ngăn nghìn của tiếng Anh trùng với
         * dấu thập phân của tiếng Việt, nên người đọc bản `en` gõ lại '36,000' sẽ bị `parseViNumber`
         * đọc thành 36 rồi chấm sai. Viết liền chữ số là cách duy nhất không mập mờ.
         */
        expect(item.worked.en, `${item.id}: bản en còn dấu ngăn nghìn`).not.toMatch(/\d,\d/);

        const demChuSo = (line: string) => (line.match(/[0-9]/g) ?? []).length;
        expect(demChuSo(item.worked.en), `${item.id}: số chữ số hai bản lệch nhau`).toBe(
          demChuSo(item.worked.vi),
        );
      }
    }
  });

  it('câu bác bỏ ngộ nhận thì trích nguyên văn, trừ đúng năm câu diễn giải', () => {
    const dienGiai = QUIZ_ITEMS.filter((item) => item.evidence === 'ngo-nhan').filter(
      thieuNgoacKep,
    );
    expect(dienGiai).toHaveLength(SO_CAU_DIEN_GIAI);
  });

  /**
   * Câu TÍNH TOÁN phải ra đúng con số mà máy tính của sản phẩm ra.
   *
   * Đây là cửa gác đắt nhất của ngân hàng và cũng là cửa duy nhất kiểm NỘI DUNG chứ không kiểm
   * chỗ-để-kiểm-chứng: nó chạy thật `calc` của công thức với bộ số liệu đề bài. Lý do nằm ở
   * docblock `QuizVerify` — một đáp số soạn nhầm sẽ dạy sai ngay bên dưới chính công thức đúng.
   *
   * Nó cũng bắt luôn trường hợp đề bài thiếu ô: `runFormula` trả `INCOMPLETE_INPUT` chứ không
   * ném lỗi, nên thiếu một biến là `value` bằng null và ca này đỏ.
   */
  it('câu tính toán ra đúng con số mà calc của công thức ra', () => {
    for (const item of QUIZ_ITEMS) {
      if (item.format === 'chon-nhieu' || item.verify === undefined) continue;
      const formula = findFormulaModule(item.formulaId);
      expect(formula, item.id).toBeDefined();
      if (formula === undefined) continue;

      const out = runFormula(formula, item.verify.inputs, CTX);
      expect(out.warning?.code ?? null, `${item.id}: ${out.warning?.message.vi ?? ''}`).toBeNull();
      expect(out.value, item.id).not.toBeNull();
      if (out.value === null) continue;
      expect(
        Math.abs(out.value - item.verify.expected),
        `${item.id}: calc ra ${out.value}`,
      ).toBeLessThanOrEqual(item.verify.tolerance);
    }
  });

  it('chỉ câu quy định mới mang ngày hiệu lực', () => {
    for (const item of QUIZ_ITEMS) {
      if (item.source.effectiveFrom === undefined) continue;
      expect(item.source.kind, item.id).toBe('quy-dinh');
      expect(item.source.effectiveFrom, item.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  /*
   * Chiều ngược của ca trên. Ca trên chỉ nói "có ngày thì phải là câu quy định"; ca này ghim số
   * câu quy định CHƯA có ngày, để một câu quy định mới thêm vào mà quên ngày thì đỏ, và để việc
   * điền ngày là việc có ý thức chứ không phải chuyện để đó.
   */
  it('câu dẫn văn bản quy định mà chưa có ngày hiệu lực — ghim 16, chỉ được giảm', () => {
    const thieu = QUIZ_ITEMS.filter(
      (item) => item.source.kind === 'quy-dinh' && item.source.effectiveFrom === undefined,
    );
    expect(thieu.map((item) => item.id)).toHaveLength(SO_CAU_QUY_DINH_CHUA_CO_NGAY);
  });

  it('khối số liệu của đề bài không có ô trống', () => {
    for (const item of QUIZ_ITEMS) {
      for (const fact of item.facts ?? []) {
        expect(fact.label.vi.trim(), item.id).not.toBe('');
        expect(fact.value.vi.trim(), item.id).not.toBe('');
      }
    }
  });
});

describe('phủ sóng 111 công thức', () => {
  const cover = quizCoverage(FORMULA_SUMMARIES.map((s) => s.id));

  /*
   * Phủ ĐỦ 111 từ 23/09/2026. `tiet-kiem-muc-tieu` từng là công thức duy nhất trống, vì đợt soạn
   * đầu không tìm ra nguồn nào bàn về chỗ người dùng hiểu sai nó. Lô 1 của đợt mở rộng gỡ được
   * bằng cách đổi góc tìm: tách công thức thành bốn giả định ngầm — lãi suất giữ nguyên suốt n kỳ,
   * khoản gửi rơi vào cuối kỳ, lãi suất điền vào là lãi suất sản phẩm gửi góp thật, số tiền mục
   * tiêu đứng yên — rồi tìm nguồn cho TỪNG giả định. Mỗi giả định đều có nguồn thật nói nó hỏng
   * ở đâu. Phương pháp ấy đáng dùng lại cho công thức nào khác cũng bí nguồn.
   */
  it('phủ đủ 111 trên 111 công thức', () => {
    const trong = [...cover.entries()].filter(([, n]) => n === 0).map(([id]) => id);
    expect(trong).toEqual([]);
  });

  it('`quizFor` trả mảng rỗng cho id không có thật, không ném lỗi', () => {
    expect(quizFor('khong-ton-tai')).toEqual([]);
  });

  /**
   * Ca kiểm này ghi lại phát hiện khiến khuôn "5 câu mỗi công thức" bị bỏ: ngân hàng câu hỏi
   * KHÔNG đều, và không thể đều, vì tư liệu thật không đều.
   *
   * ── 23/09/2026: chủ dự án đảo quyết định, và đây là lần ca kiểm đỏ đúng như nó được dựng ra ──
   *
   * Chủ dự án chốt "hoàn thiện những công thức chưa đủ 5 câu", cho phép tìm nguồn bằng ngôn ngữ
   * khác. Điều ấy KHÔNG mâu thuẫn với lý do bỏ khuôn 5 câu, vì nó thêm ĐẦU VÀO MỚI chứ không nới
   * tiêu chuẩn: bất biến `source.url` giữ nguyên, và 5 là ĐÍCH NHẮM chứ không phải sàn bắt buộc —
   * công thức nào tư liệu cạn trước 5 câu thì dừng ở đó.
   *
   * Lô 1 chứng minh cả hai vế. Sáu công thức, mỗi công thức nhắm 4–5 câu mới: 25 câu soạn ra, một
   * vòng phản biện mở lại từng URL đối chiếu nguyên văn đã LOẠI 2 câu — một câu trích đúng nhưng
   * trang chỉ định nghĩa công thức chứ không bàn tới ngộ nhận, một câu đúng theo trang nhưng sai
   * theo luật hiện hành. Nếu 5 là sàn bắt buộc thì hai câu ấy đã phải giữ lại.
   *
   * Con số dưới đây vì thế chỉ được đổi KÈM một lô có hồ sơ như vậy. Ai đó độn cho đủ mà không
   * có vòng phản biện thì ca kiểm vẫn đỏ, và vẫn phải giải trình.
   *
   * Lô 2 (11 câu, 3 công thức nhóm phân tích kỹ thuật) đi tiếp cùng nếp: workflow soạn 11 câu,
   * phản biện tự động chết giữa chừng vì hết hạn mức phiên (không phải vì nội dung sai), nên vòng
   * đối chiếu được LÀM LẠI THỦ CÔNG — mở lại cả 7 URL bằng WebFetch, so nguyên văn, và một PDF
   * (nghiên cứu S&P 1500) phải tải về bóc bằng `pdftotext` vì WebFetch không giải nén được luồng
   * PDF của nó. Cả 11 câu đạt. Phép kiểm thủ công vẫn phải giữ tinh thần "mặc định là loại" của
   * vòng agent: câu nào không đối chiếu được thì không đưa vào ngân hàng.
   *
   * Lô 3 (42 câu, 17 công thức nhóm rủi ro) chạy trọn vẹn với vòng phản biện tự động: 67 agent,
   * 0 lỗi, và phản biện LOẠI 9 trên 51 câu soạn ra — trích sai một chữ, tính sai một phép chia,
   * nguồn chỉ định nghĩa chứ không bàn ngộ nhận. Tỷ lệ loại gần 1/6 là bằng chứng khác cho việc
   * 5 vẫn là đích nhắm chứ không phải sàn: nhiều công thức nhắm 4 câu chỉ về đích 2–3.
   *
   * Lô 4 (31 câu, 12 công thức còn lại của nhóm phân tích kỹ thuật) đóng trọn nhóm `technical` —
   * mọi công thức kỹ thuật giờ có ít nhất 2 câu. 47 agent, 0 lỗi hạ tầng; phản biện loại 4/35 câu
   * soạn ra vì hai câu `chon-nhieu` sai thực chất (nguồn không xác nhận đúng tập đáp án đã khai)
   * và hai câu nguồn chỉ định nghĩa.
   *
   * ── Mốc 23/09/2026: "phần lớn 1–2 câu" hết đúng, sau bốn lô — tên ca đổi để nói đúng sự thật ──
   *
   * 26 + 29 = 55 trên 111, tức 49,5% — lần đầu tiên KHÔNG còn là đa số. Đây không phải lý do nới
   * ngưỡng cho qua; nó là đúng thứ đợt mở rộng nhắm tới, và ca kiểm phải đổi theo để tiếp tục nói
   * thật, không phải để dễ xanh. Tên cũ ("phần lớn... chỉ có một hoặc hai câu") giờ sai nghĩa đen.
   *
   * Lô 5 (32 câu, 10 công thức nhóm bội số định giá) đi tiếp cùng hướng: 44 agent, 0 lỗi hạ tầng,
   * loại 2/34 câu soạn ra vì nguồn chỉ định nghĩa. 21 + 24 = 45/111 (40,5%) — tiếp tục giảm.
   *
   * ── Mốc 24/09/2026: nhóm TÍNH TOÁN, và `mot` về 0 ───────────────────────────────────────────
   *
   * Q346–Q411 thêm một câu tính toán cho 66 công thức. Không công thức nào còn đúng MỘT câu nữa,
   * nên ngưỡng `> một phần ba` mà ca này mang từ đầu hết đúng, và cách xử lý trung thực là ghim
   * con số thật chứ không nới ngưỡng cho qua.
   *
   * Phân bố đầy đủ lúc này: 24 công thức 2 câu, 27 công thức 3 câu, 23 công thức 4 câu, 32 công
   * thức 5 câu, 5 công thức 6 câu. Đạt đích 5 câu: 37/111. Sàn của cả thư viện là 2 câu.
   *
   * Nhóm này KHÔNG đi qua vòng phản biện nguồn như năm lô trước, vì bằng chứng của nó khác hẳn:
   * đáp số do chính `calc` của sản phẩm tính ra và có ca kiểm đối chiếu ở trên. Đổi lại nó nhận
   * một ràng buộc mà năm lô kia không có — sai một con số là ca kiểm đỏ ngay.
   *
   * ── Mốc 24/09/2026 (chiều): nhóm THỰC HÀNH điền số, `hai` từ 24 xuống 14 ──────────────────
   *
   * Q412–Q453 thêm một câu điền số cho 42 công thức. Mười công thức trong số đó đang có đúng
   * hai câu, nên nay có ba. Giảm vì có thêm INPUT thật — tình huống có số liệu, công thức của
   * chính trang — chứ không phải vì hạ ngưỡng. Sàn vẫn là 2.
   *
   * ── Mốc 25/09/2026: 20 công thức chưa có câu tính toán nào, `hai` từ 14 xuống 12 ────────────
   *
   * Q454–Q473 thêm một câu điền số cho 20 công thức, phần lớn ăn chuỗi giá. Hai trong số đó đang
   * có đúng hai câu. Cùng lý do như trên: thêm INPUT có nguồn, không hạ ngưỡng.
   */
  it('không công thức nào còn một câu, nhưng ngân hàng vẫn chưa đều', () => {
    const mot = [...cover.values()].filter((n) => n === 1).length;
    const hai = [...cover.values()].filter((n) => n === 2).length;
    expect(mot).toBe(0);
    expect(hai).toBe(12);
    // Sàn của thư viện là 2 câu. Ghim thẳng con số thay cho ngưỡng cũ — xem docblock.
    expect(Math.min(...cover.values())).toBe(2);
  });
});

describe('đa ngôn ngữ (FR-08)', () => {
  /**
   * Thước đo tiến độ, không phải lỗi cần vá bằng chuỗi tạm: điền một bản tiếng Anh tạm cho hợp
   * kiểu chính là bịa nội dung.
   *
   * 0 → 23 → 34 → 76 → 107 → 139 → 205 → 247 → 267 ngày 23–25/09/2026. Từ lô 1 trở đi MỌI câu mới đều soạn
   * song ngữ ngay từ đầu, nên con số này bằng đúng số câu của đợt mở rộng; 139 → 205 là 66 câu
   * tính toán Q346–Q411; 205 → 247 là 42 câu thực hành điền số Q412–Q453; 247 → 267 là 20 câu điền
   * số Q454–Q473 cho các công thức chưa có câu tính toán nào (25/09/2026). 206 câu của đợt đầu vẫn chỉ có `explain` song ngữ (đợt sửa
   * 24/09/2026 thêm `explain.en` cho 93 câu), còn đề bài và lựa chọn thì chưa — dịch nốt chúng là
   * một đợt riêng, chưa làm.
   *
   * Đoạn TRÍCH NGUYÊN VĂN giữ nguyên ngôn ngữ của nguồn ở CẢ hai bản, kể cả khi bản tiếng Anh
   * phải mang một câu tiếng Việt: trích đúng từng chữ là thứ cho người học mở nguồn đối chiếu,
   * dịch nó đi là mất khả năng kiểm chứng. Lời văn quanh nó nói lại ý bằng ngôn ngữ của bản ấy.
   */
  it('đếm số câu đã dịch đủ hai ngôn ngữ', () => {
    const daDich = QUIZ_ITEMS.filter(isTranslated).length;
    expect(daDich).toBe(267);
  });

  /**
   * Lời giải tiếng Việt phải TỰ NÓI ĐỦ Ý, không được chỉ là một đoạn trích tiếng Anh.
   *
   * Chủ dự án bấm Kiểm tra và thấy hộp "Vì sao đúng" hiện ra bằng tiếng Anh (24/09/2026). Đo lại
   * thì 64 trên 345 câu có `explain.vi` gồm gần như chỉ một câu trích tiếng Anh, kiểu "Nguồn:
   * “…”." — người đọc không biết tiếng Anh thì bấm Kiểm tra xong vẫn không hiểu vì sao mình sai.
   *
   * Cách sửa KHÔNG phải là bỏ đoạn trích: trích đúng từng chữ là thứ cho người học mở nguồn đối
   * chiếu, và ca "trích nguyên văn" ở trên vẫn bắt buộc mọi câu bác ngộ nhận phải có `“…”`. Cách
   * sửa là viết câu tiếng Việt DẪN Ý trước, rồi mới dẫn nguyên văn làm bằng chứng — đúng nếp Q275
   * đã soạn sẵn. Bản tiếng Anh của lời giải (`explain.en`) mang đoạn trích y hệt, lời văn quanh
   * nó đổi sang tiếng Anh.
   *
   * Ngưỡng 120 ký tự là con số đo được sau đợt sửa: câu mỏng nhất còn 120 ký tự tiếng Việt ngoài
   * ngoặc kép. Nó chỉ chặn được cái sàn, không chặn được lời văn nhạt — nhưng cái sàn ấy đúng là
   * chỗ lỗi đã xảy ra, và nó chỉ được đi LÊN.
   */
  it('lời giải tiếng Việt không được chỉ là một đoạn trích tiếng Anh', () => {
    const CO_DAU = /[àáảãạăâđèéẻẽẹêìíỉĩịòóỏõọôơùúủũụỳýỷỹỵ]/i;
    const mong = QUIZ_ITEMS.filter((item) => {
      const trich = [...item.explain.vi.matchAll(/“([^”]*)”/g)].map((m) => m[1] ?? '');
      const coTrichAnh = trich.some((s) => s.length > 25 && !CO_DAU.test(s));
      if (!coTrichAnh) return false;
      return item.explain.vi.replace(/“[^”]*”/g, '').trim().length < 120;
    });
    expect(mong.map((item) => item.id)).toEqual([]);
  });

  /**
   * Lời giải KHÔNG tự ghi nhãn "Nguồn:" / "Source:" (25/09/2026).
   *
   * Hộp lời giải đã có dòng Nguồn riêng ở đáy (nhãn `quiz.source` + đường dẫn), nên một lời giải mở
   * đầu bằng "Nguồn: “…”" in chữ Nguồn HAI lần trong cùng một hộp. Chủ dự án khoanh đúng chỗ ấy và
   * bảo bỏ chữ bên trên, giữ dòng bên dưới. 87 nhãn đã gỡ (68 bản tiếng Việt, 19 bản tiếng Anh);
   * đoạn trích vẫn nằm nguyên trong `“…”`. Cùng quy tắc với `FormulaExample.source` trong
   * `registry/types.ts`: nhãn là việc của giao diện, dữ liệu không lặp lại nó.
   *
   * Gỡ nhãn làm Q279 tụt dưới sàn 120 ký tự của ca trên — nó mở đầu bằng nguyên đoạn tiếng Anh, chỉ
   * có "Nguồn:" đứng trước. Nó được viết lại cho câu tiếng Việt dẫn ý trước, KHÔNG hạ sàn.
   */
  it('lời giải không tự ghi nhãn Nguồn/Source — dòng Nguồn ở đáy hộp đã có', () => {
    const coNhan = QUIZ_ITEMS.filter((item) =>
      [item.explain.vi, item.explain.en ?? ''].some((s) => /(?:Nguồn|Source):/.test(s)),
    );
    expect(coNhan.map((item) => item.id)).toEqual([]);
  });
});

/**
 * Dòng "Thay số" của lời giải — ký hiệu nào nhận con số nào (`QuizGiai.gan`, 25/09/2026).
 *
 * Chủ dự án đọc "Thứ tự đúng: 42.500 · 33.850 · 42.500" rồi hỏi 42.500 là V hay P. Dòng `gan` trả
 * lời đúng câu ấy, nên nó chỉ có ích khi nó ĐÚNG — một ký hiệu bịa ra, hay một con số không có trong
 * đề, là dạy sai ngay dưới lời giải. Bốn điều máy kiểm được đều ở đây. Điều thứ năm thì không: gán
 * nhầm hai số cùng đơn vị (giá trị nội tại vào `P`, thị giá vào `V`) vẫn qua cả bốn — chỗ ấy chỉ
 * có người đọc nghĩa của ký hiệu mới thấy, và mỗi lô đều phải soát tay.
 */
describe('Thay số — ký hiệu nào nhận con số nào', () => {
  /** Mọi con số trong một chuỗi, giữ nguyên cách viết: "42.500", "0,15", "12.5". */
  const soTrong = (text: string): string[] => text.match(/\d[\d.,]*\d|\d/g) ?? [];
  const coGiaiHinh = QUIZ_ITEMS.filter(
    (item) => item.giai !== undefined && item.giai.congThuc === undefined,
  );

  /** Ký hiệu hợp lệ của một công thức: dòng bảng ký hiệu, hoặc cụm `\text{…}` có trong hình. */
  const kyHieuHopLe = (formulaId: string, kyHieu: string): boolean => {
    const spec = findFormulaModule(formulaId)?.spec;
    if (spec === undefined) return false;
    if ((spec.symbols ?? []).some((row) => row.latex === kyHieu)) return true;
    return /^\\text\{[^{}]+\}$/.test(kyHieu) && spec.latex.includes(kyHieu);
  };

  /*
   * Đuôi "để tính …" đứng NGAY CẠNH hình công thức, và gạch ngang dài ở đó bị đọc thành dấu trừ — lỗi
   * chủ dự án đã bắt ở dòng chữ dưới hình (16/09) và ở bảng ký hiệu (17/09/2026). 15 câu từng chép
   * nguyên tên công thức ("FCFE — dòng tiền tự do của cổ đông") vào đây.
   */
  it('đuôi "để tính …" không mang gạch ngang dài', () => {
    const sai = QUIZ_ITEMS.filter((item) =>
      [item.giai?.tinh.vi ?? '', item.giai?.tinh.en ?? ''].some((s) => /[—–]/.test(s)),
    );
    expect(sai.map((item) => item.id)).toEqual([]);
  });

  it('mọi lời giải in hình công thức đều có dòng Thay số', () => {
    const thieu = coGiaiHinh.filter((item) => (item.giai?.gan ?? []).length === 0);
    expect(thieu.map((item) => item.id)).toEqual([]);
  });

  it('ký hiệu nào cũng có thật trong hình công thức của chính trang ấy', () => {
    const sai = coGiaiHinh.flatMap((item) =>
      (item.giai?.gan ?? [])
        .filter((dong) => !kyHieuHopLe(item.formulaId, dong.kyHieu))
        .map((dong) => `${item.id} (${item.formulaId}): "${dong.kyHieu}"`),
    );
    expect(sai, sai.join('\n')).toEqual([]);
  });

  /*
   * Con số phải có NGUYÊN VĂN trong đề: bảng Số liệu, lời đề, hoặc dòng công thức (hằng số như
   * `0,15` của phí môi giới chỉ nằm ở đó). Bản tiếng Anh kiểm với bản tiếng Anh của cùng mấy chỗ ấy.
   */
  it('mọi con số trong dòng Thay số đều có nguyên văn trong đề', () => {
    const sai: string[] = [];
    for (const item of coGiaiHinh) {
      for (const ngon of ['vi', 'en'] as const) {
        const nguon = [
          ...(item.facts ?? []).flatMap((f) => [f.value[ngon] ?? '', f.label[ngon] ?? '']),
          item.prompt[ngon] ?? '',
          item.format === 'dien-so' ? (item.worked[ngon] ?? '') : '',
          item.giai?.thaySo[ngon] ?? '',
        ];
        const co = new Set(nguon.flatMap(soTrong));
        for (const dong of item.giai?.gan ?? []) {
          const giaTri = (dong.giaTri ?? dong.moTa)?.[ngon];
          if (giaTri === undefined) {
            if (ngon === 'en' && item.prompt.en !== undefined)
              sai.push(`${item.id}: "${dong.kyHieu}" thiếu bản en`);
            continue;
          }
          for (const so of soTrong(giaTri)) {
            if (!co.has(so))
              sai.push(`${item.id} [${ngon}]: "${so}" của "${dong.kyHieu}" không có trong đề`);
          }
        }
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  /*
   * Dòng "Áp vào công thức" của câu điền số phải ĐÚNG BẰNG dòng công thức đã bóc ngoặc — nó là
   * phép tính người học vừa điền, lộ ra sau khi chấm. Viết nó bằng tay là mở chỗ cho hai bản lệch
   * nhau: người học đặt đúng mà lời giải lại in một phép tính khác.
   */
  it('câu điền số: dòng "Áp vào công thức" đúng bằng dòng công thức đã bóc ngoặc', () => {
    const sai: string[] = [];
    for (const item of coGiaiHinh) {
      if (item.format !== 'dien-so') continue;
      for (const ngon of ['vi', 'en'] as const) {
        const dong = item.worked[ngon];
        if (dong === undefined) continue;
        if (item.giai?.thaySo[ngon] !== arithmeticOf(dong)) sai.push(`${item.id} [${ngon}]`);
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  /*
   * Không còn câu tính toán nào bắt CHỌN đáp số — chủ dự án 25/09/2026: "việc đưa ra các ô để nhập
   * vào giống như tôi yêu cầu thì bạn chưa sửa, vẫn để chọn các số liệu ABCD". 66 câu Q346–Q411 đổi
   * sang điền số và giữ nguyên `verify`. Câu nào khai `verify` mà lại có lựa chọn là lệch khỏi
   * quyết định ấy. (14 câu trắc nghiệm vẽ công thức KHÁC trang vẫn chọn đáp án — xem `CAU_DIEN_SO`;
   * chúng không khai `verify`.)
   */
  it('không còn câu tính toán nào bắt chọn đáp số', () => {
    const conChon = QUIZ_ITEMS.filter(
      (item) => item.format === 'trac-nghiem' && item.verify !== undefined,
    ).map((item) => item.id);
    expect(conChon).toEqual([]);
  });

  /*
   * Mỗi dòng Thay số có đúng MỘT trong `giaTri` / `moTa`, và mỗi ký hiệu chỉ một dòng. Hai dòng
   * cùng ký hiệu là cách cũ — giao diện gộp chúng thành "12.000.000 · 12.000.000 · 12.000.000", chủ
   * dự án đọc không hiểu, và "·" lại là dấu nhân. Ký hiệu nhận nhiều số thì nói bằng một câu `moTa`.
   */
  it('mỗi ký hiệu một dòng Thay số, với đúng một trong giá trị hoặc câu mô tả', () => {
    const sai: string[] = [];
    for (const item of coGiaiHinh) {
      const gan = item.giai?.gan ?? [];
      const trung = gan.filter((d, i) => gan.findIndex((x) => x.kyHieu === d.kyHieu) !== i);
      for (const d of trung) sai.push(`${item.id}: "${d.kyHieu}" khai hai lần`);
      for (const d of gan) {
        if ((d.giaTri === undefined) === (d.moTa === undefined))
          sai.push(`${item.id}: "${d.kyHieu}" phải có đúng một trong giaTri/moTa`);
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  it('câu điền số: ô trống nào cũng có ký hiệu ở dòng Thay số', () => {
    const sai: string[] = [];
    for (const item of coGiaiHinh) {
      if (item.format !== 'dien-so') continue;
      const daGan = new Set(
        (item.giai?.gan ?? []).flatMap((dong) => soTrong((dong.giaTri ?? dong.moTa)?.vi ?? '')),
      );
      for (const o of new Set(blanksOf(item.worked.vi))) {
        if (!daGan.has(o.replace(/^[−-]/, '')))
          sai.push(`${item.id} (${item.formulaId}): ô "${o}" chưa có ký hiệu`);
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });
});
