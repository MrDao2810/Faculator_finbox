'use client';

import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import type { QuizChoiceKey, QuizItem, QuizText } from '@/application';
import { formatNumber, hasChoices, keepViNumberChars } from '@/application';
import { usePreferences, useT } from '@/application/preferences-context';
import { workedShape } from '@/application/quiz-math';
import { filterTypedValue, guardFilteredDelete, resetFilteredDelete } from '@/ui/inputs';

import { CongThucDien } from './CongThucDien';
import { laDungCua, oDungChua } from './cham';
import styles from './QuizBody.module.css';
import { quoteParts } from './quote-parts';
import { shortUrl } from './short-url';

/**
 * Một câu hỏi — đề bài, số liệu, lựa chọn (hoặc ô điền số), lời giải và nguồn.
 *
 * Tách khỏi `QuizBody` ngày 24/09/2026, khi câu đã trả lời bắt đầu hiện lại ở dải lịch sử phía
 * trên câu đang hỏi: cùng một câu phải dựng y hệt nhau ở hai chỗ, và chép JSX ra hai bản là chỗ
 * chắc chắn sẽ lệch sau vài lần sửa.
 *
 * `readOnly` là khác biệt DUY NHẤT giữa hai chỗ gọi: câu trong lịch sử không nhận thêm thao tác
 * nào nữa. Ô nhập vẫn dựng (để người xem lại thấy mình đã gõ gì) nhưng bị khoá.
 */

const CHOICE_KEYS: ReadonlyArray<QuizChoiceKey> = ['a', 'b', 'c', 'd'];

/**
 * Ngưỡng độ dài để bốn đáp án xếp HAI CỘT, theo từng khổ màn.
 *
 * Đo ở đây chứ không đo bằng CSS: CSS không biết độ dài chữ, còn đo bằng JS lúc chạy thì lượt
 * dựng đầu tiên trên trình duyệt sẽ khác HTML tĩnh — đúng lớp lỗi hydration mà cả thư mục này
 * phải tránh. Đếm ký tự là hàm thuần của chính câu hỏi nên máy chủ và trình duyệt luôn ra cùng
 * một kết quả.
 *
 * HAI ngưỡng chứ không một, vì chỗ chứa của một ô đổi theo khổ màn. Đo bằng Chrome trên chính
 * trang chi tiết (canvas `measureText` với đúng phông, đúng bề ngang ô sau khi trừ nút radio,
 * nhãn A/B/C/D và padding):
 *
 * | Khổ màn | Bề ngang chữ của một ô | Vừa một dòng |
 * | ------- | ---------------------- | ------------ |
 * | 1024    | 347px                  | 55 ký tự     |
 * | 1280    | 475px                  | 77 ký tự     |
 * | 1440    | 539px                  | 86 ký tự     |
 * | 1600+   | 619px                  | 98 ký tự     |
 *
 * Con số cũ là MỘT ngưỡng 48, đặt hồi khối Bài tập còn bị bó `max-width: 60rem`. Khối ấy nay
 * trải hết khung trang, nên 48 bỏ sót gần một nửa chỗ thật sự có: chủ dự án chụp một câu có ba
 * đáp án rất ngắn kèm một đáp án 59 ký tự và hỏi tại sao nó vẫn một cột (24/09/2026). Đo trên cả
 * ngân hàng: ngưỡng 48 cho 149/389 câu hai cột; hai ngưỡng dưới đây cho 173 câu từ khổ 1024 và
 * 254 câu từ khổ 1280.
 *
 * Trên 1280 KHÔNG thêm bậc nữa dù chỗ chứa còn rộng ra (86 rồi 98 ký tự): đáp án dài quá 78 ký
 * tự thì một cột vẫn đọc hơn, vì hai cột lúc ấy là hai khối chữ dày đặc đứng cạnh nhau.
 */
const HAI_COT_HEP = 55;
const HAI_COT_RONG = 78;

/**
 * Khổ màn NHỎ NHẤT mà bốn đáp án này còn xếp hai cột được, trả về dạng chuỗi để CSS bắt bằng bộ
 * chọn thuộc tính: '1024', '1280', hoặc '0' nếu không khổ nào đủ.
 *
 * Đo theo đáp án DÀI NHẤT: lưới chia hai cột bằng nhau, nên chính nó quyết định có vỡ dòng hay
 * không.
 */
function khoHaiCot(dais: ReadonlyArray<number>): '1024' | '1280' | '0' {
  const dai = Math.max(...dais);
  if (dai <= HAI_COT_HEP) return '1024';
  if (dai <= HAI_COT_RONG) return '1280';
  return '0';
}

/** Nhãn A/B/C/D in trước mỗi lựa chọn — cố định, không theo locale. */
const CHOICE_LABEL: Readonly<Record<QuizChoiceKey, string>> = {
  a: 'A',
  b: 'B',
  c: 'C',
  d: 'D',
};

/**
 * Bề ngang một ô trống, tính theo số ký tự của đáp án.
 *
 * Đo theo đáp án chứ không cố định: một ô 5 ký tự đứng cạnh một ô 13 ký tự (`2.123.907.166`) mà
 * cùng bề ngang thì hoặc ô ngắn thừa chỗ, hoặc ô dài phải cuộn ngang ngay giữa công thức. Sàn 4
 * ký tự để ô một chữ số vẫn bấm được bằng ngón tay, trần 13 để một con số khổng lồ không đẩy cả
 * công thức tràn khỏi thẻ.
 */
function beNgangO(dap: string): number {
  return Math.min(13, Math.max(4, dap.length));
}

export interface QuizQuestionProps {
  item: QuizItem;
  /**
   * Hình công thức của trang, dựng sẵn ở màn chi tiết — dòng "Công thức" của khối lời giải in nó
   * ra. Là một NÚT React chứ không phải chuỗi: rê vào ký hiệu mở khung "cách tính" của thẻ Công
   * thức, và cả cơ chế ấy (hook, khung, CSS) nằm ở `src/app/cong-thuc/[id]/`, nơi `src/ui` không
   * với tới. Màn chi tiết dựng sẵn rồi đưa xuống; thư mục này chỉ đặt nó vào đúng ô.
   */
  hinhCongThuc?: ReactNode;
  /** Gốc id, để `name` của radio và `id` của ô nhập không đụng câu khác trên cùng trang. */
  namePrefix: string;
  picked: ReadonlyArray<QuizChoiceKey>;
  /** Chữ người học gõ vào từng ô trống của công thức, theo thứ tự trái sang phải. */
  typed: ReadonlyArray<string>;
  answered: boolean;
  /** Câu trong dải lịch sử: xem lại được, không thao tác được nữa. */
  readOnly?: boolean;
  onPick?: (key: QuizChoiceKey) => void;
  onType?: (thuTu: number, value: string) => void;
}

export function QuizQuestion({
  item,
  hinhCongThuc,
  namePrefix,
  picked,
  typed,
  answered,
  readOnly = false,
  onPick,
  onType,
}: QuizQuestionProps) {
  const t = useT();
  const { locale } = usePreferences();

  /**
   * Chữ theo locale. `en` vắng nghĩa là câu chưa dịch — lùi về tiếng Việt thay vì hiện chuỗi
   * rỗng. Điền một bản tiếng Anh tạm cho hợp kiểu chính là bịa nội dung.
   */
  const chu = (value: { vi: string; en?: string }) =>
    locale === 'en' && value.en !== undefined ? value.en : value.vi;

  /** Chỉ các đoạn TRONG ngoặc kép của lời giải — câu trích nguyên văn của nguồn. */
  const trichDan = quoteParts(chu(item.explain))
    .filter((part) => part.quoted)
    .map((part) => part.text);

  /*
   * Dòng "Công thức": câu nào ghi đè thì in bản chữ của câu ấy, không thì in HÌNH công thức của
   * trang. Câu ghi đè không mang hình: Q088 in "Khoảng tin cậy = Beta báo cáo ± 2 × Sai số chuẩn",
   * còn hình của trang là β = Cov ÷ Var — rê vào ký hiệu của nó là giải nghĩa thứ dòng không nói.
   */
  const ghiDe = item.giai?.congThuc;
  const coHinh = ghiDe === undefined && hinhCongThuc !== undefined;

  const laDung = laDungCua(item, picked, typed);
  const khoa = readOnly || answered;

  /**
   * Cây công thức, phân tích MỘT LẦN cho mỗi câu và mỗi ngôn ngữ.
   *
   * `useMemo` ở đây không phải để tiết kiệm mấy micro-giây phân tích chuỗi: cây này là `key` của cả
   * cụm `<input>` bên trong, nên dựng lại nó sau mỗi phím gõ sẽ thay node ngay dưới con trỏ và ô
   * nhập mất tiêu điểm giữa lúc gõ.
   */
  const hinh = useMemo(() => {
    if (hasChoices(item)) return null;
    return workedShape(chu(item.worked));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `chu` đọc `locale`, đã có trong deps
  }, [item, locale]);

  return (
    <>
      {/*
        KHÔNG còn hàng chip nào ở đầu câu — cả ba chip phân loại đều bỏ trong ngày 24/09/2026:
        `source.kind` ("Chuyên gia", "Tài liệu chuẩn"…), `kind` ("D1 · Đọc kết quả" …
        "D5 · Hậu quả bằng tiền"), rồi `evidence` ("Ngộ nhận có ghi chép"…). Cả ba tả câu hỏi
        THUỘC LOẠI GÌ, thứ người soạn nội dung cần để soi độ phủ, chứ người đang làm bài thì
        không làm gì với nó.

        Riêng `evidence` từng được giữ lại một vòng vì tưởng nó nuôi hai thứ khác. Không phải:
        tiêu đề hộp lời giải đọc thẳng `item.evidence` ở dưới, và hai cửa gác ở `quiz.test.ts`
        đọc thẳng dữ liệu — cái CHIP không nuôi thứ nào cả. Cả ba trường vẫn còn nguyên trong
        dữ liệu của 411 câu; chỉ thôi hiện lên màn.
      */}
      {item.facts !== undefined && (
        <dl className={styles.facts}>
          {item.facts.map((fact) => (
            <div className={styles.fact} key={fact.label.vi}>
              <dt>{chu(fact.label)}</dt>
              <dd>{chu(fact.value)}</dd>
            </div>
          ))}
        </dl>
      )}

      {hasChoices(item) ? (
        <fieldset className={styles.choices}>
          <legend className={styles.prompt}>{chu(item.prompt)}</legend>
          {/*
            Câu chọn nhiều phải nói TRƯỚC rằng có nhiều đáp án. Hình tròn đổi thành hình vuông là
            tín hiệu của trình duyệt, nhưng chỉ người quen mới đọc ra — và đọc ra sau khi đã bấm
            nhầm thì muộn rồi.
          */}
          {item.format === 'chon-nhieu' && !answered && (
            <p className={styles.note}>{t('quiz.pickAll')}</p>
          )}
          {/*
            Bốn lựa chọn nằm trong một LƯỚI riêng, không phải con trực tiếp của `<fieldset>`.
            Ở khổ PC lưới chia hai cột cho đỡ thừa chỗ (24/09/2026, chủ dự án), mà `<legend>` thì
            không chịu được `display: grid` của cha một cách nhất quán giữa các trình duyệt — nên
            lưới phải là một lớp bọc riêng bên trong.
          */}
          <div
            className={styles.choiceGrid}
            data-hai-cot={khoHaiCot(CHOICE_KEYS.map((key) => chu(item.choices[key]).length))}
          >
            {CHOICE_KEYS.map((key) => {
              const isAnswer =
                item.format === 'trac-nghiem' ? key === item.answer : item.answers.includes(key);
              const isPicked = picked.includes(key);
              const state = !answered
                ? ''
                : isPicked && isAnswer
                  ? styles.choiceRight
                  : isPicked
                    ? styles.choiceWrong
                    : isAnswer
                      ? styles.choiceReveal
                      : styles.choiceDim;
              return (
                <label className={`${styles.choice} ${state}`.trim()} key={key}>
                  <input
                    type={item.format === 'chon-nhieu' ? 'checkbox' : 'radio'}
                    name={`${namePrefix}-${item.id}`}
                    value={key}
                    checked={isPicked}
                    disabled={khoa}
                    onChange={() => onPick?.(key)}
                  />
                  <span className={styles.choiceLabel}>{CHOICE_LABEL[key]}.</span>
                  <span className={styles.choiceText}>{chu(item.choices[key])}</span>
                  {answered && isPicked && (
                    <span className={styles.verdict}>
                      {isAnswer ? t('quiz.right') : t('quiz.wrong')}
                    </span>
                  )}
                  {/*
                    Ô đáp án đúng mà người dùng KHÔNG chọn mang đúng nhãn "Đúng" như ô chọn
                    trúng, không phải "Đáp án đúng" (chủ dự án 24/09/2026). Nhãn nằm ngay trong
                    ô nên vị trí đã nói nó thuộc ô nào; thêm chữ "Đáp án" là nói lại thứ mắt đã
                    thấy. Phân biệt ô nào do NGƯỜI DÙNG chọn thì đã có nút radio và viền đặc
                    (`.choiceRight`) so với viền đứt (`.choiceReveal`) lo.
                  */}
                  {answered && !isPicked && isAnswer && (
                    <span className={styles.verdict}>{t('quiz.right')}</span>
                  )}
                </label>
              );
            })}
          </div>
          {/*
            Dạng chọn nhiều PHẢI có dòng phán quyết chung. Huy hiệu trên từng ô chỉ nói ô ẤY có nằm
            trong đáp án không — chọn thiếu một ô thì ô đã chọn vẫn mang huy hiệu "Đúng", và người
            dùng đọc thành đã trả lời đúng cả câu. Dạng một đáp án không cần: ở đó huy hiệu của ô
            đã chọn CHÍNH LÀ phán quyết chung.
          */}
          {answered && item.format === 'chon-nhieu' && (
            <p className={laDung ? styles.markRight : styles.markWrong} data-verdict>
              {laDung ? t('quiz.right') : t('quiz.wrong')}
            </p>
          )}
        </fieldset>
      ) : (
        /*
          Câu ĐIỀN SỐ — WF-19C · S10–S12, dựng lại lần thứ hai 24/09/2026.

          Bài tập là ĐẶT SỐ LIỆU VÀO ĐÚNG CHỖ, không phải bấm ra đáp số. Chủ dự án: "điền đúng chỗ
          số liệu vào công thức thì kiểm tra xem đúng chưa chứ không phải hỏi xem kết quả là như
          nào." Nên ô trống mọc ở các số liệu bên trong công thức:

              Beta điều chỉnh = ▢ × ▢ + ▢ × 1

          và người học lấy số từ bảng "Số liệu" ngay trên đặt vào từng ô. Bảng ấy cố ý có cả số gây
          nhiễu, nên đặt đúng chỗ là một phép kiểm thật.

          Dựng bằng `<input>` trần chứ không qua `Input`: `Input` là ô nhập có NHÃN Ở TRÊN, mà một
          nhãn đặt giữa công thức thì phá nát công thức. Vai trò của nhãn do chính vị trí của ô
          trong công thức đảm nhiệm, còn người dùng bộ đọc màn hình nhận nó qua `aria-label`. `id`
          truyền tường minh vì khối này nằm sau ranh giới `next/dynamic`, nơi chuỗi `useId()` lệch
          giữa HTML tĩnh và lượt hydrate.
        */
        <div className={styles.numberAsk}>
          <p className={styles.prompt}>{chu(item.prompt)}</p>
          {/*
            KHỐI CÔNG THỨC: tên đại lượng, dấu `=`, rồi công thức có ô trống. Phân số vẽ trên dưới
            với gạch phân — chủ dự án chỉ vào ảnh `β = Cov(Rᵢ, Rₘ) / Var(Rₘ)`: "trình bày trên dưới
            có gạch phân rõ như công thức kìa thì mới hiểu."

            Vẽ bằng React + CSS chứ không bằng MathML: ô nhập phải nằm TRONG tử số, mà MathML không
            cho nhúng `<input>` vào cây của nó — xem docblock `CongThucDien.tsx`.
          */}
          {hinh !== null && (
            <div className={styles.worked}>
              <span className={styles.workedName}>{hinh.ten}</span>
              <span className={styles.workedEquals} aria-hidden="true">
                =
              </span>
              <span className={styles.workedExpr}>
                <CongThucDien
                  cay={hinh.cay}
                  oNhap={(thuTu, dap) => {
                    const dung = oDungChua(item, typed, thuTu);
                    return (
                      <input
                        key={thuTu}
                        id={`${namePrefix}-${item.id}-o${thuTu}`}
                        className={styles.blankInput}
                        style={{ '--rong': beNgangO(dap) } as CSSProperties}
                        aria-label={t('quiz.slotLabel').replace('{n}', String(thuTu + 1))}
                        value={typed[thuTu] ?? ''}
                        disabled={khoa}
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="?"
                        data-ket-qua={answered ? (dung === true ? 'dung' : 'sai') : undefined}
                        /*
                          Ba móc dưới đây là bộ ba BẮT BUỘC của mọi ô mở bàn phím số (chủ dự án chốt
                          14/09/2026: "không được có sự xuất hiện của chữ cái"), và
                          `numeric-gate.test.ts` ghim tên file này để nhắc.
                        */
                        onChange={(e) => onType?.(thuTu, filterTypedValue(e, keepViNumberChars))}
                        onKeyDown={guardFilteredDelete}
                        onBlur={(e) => {
                          resetFilteredDelete(e.currentTarget);
                        }}
                      />
                    );
                  }}
                />
              </span>
            </div>
          )}
          {/*
            Kết quả LỘ RA sau khi chấm, không hiện sẵn. Người học không phải tính nó — nó là chỗ
            khép lại ví dụ, cho thấy bộ số vừa đặt chạy ra con số nào. Đặt sai thì in kèm đáp án
            đúng của từng ô, theo thứ tự trái sang phải, để người học soi lại được mình lệch ô nào.
          */}
          {answered && (
            <p className={laDung ? styles.markRight : styles.markWrong}>
              {laDung ? t('quiz.right') : t('quiz.wrong')}
              {' · '}
              {t('quiz.workedResult')}: {formatNumber(item.expected, { maxDecimals: 4 })}{' '}
              {chu(item.unit)}
              {!laDung && hinh !== null && (
                <>
                  {' · '}
                  {t('quiz.correctSlots')}: {hinh.dapAn.join(' · ')}
                </>
              )}
            </p>
          )}
        </div>
      )}

      <div aria-live={readOnly ? 'off' : 'polite'}>
        {answered && (
          <div className={`${styles.explain} ${laDung ? '' : styles.explainWarn}`.trim()}>
            {/*
              Câu dựa trên QUY ĐỊNH không có "vì sao" (WF-19D · S16): không có ngộ nhận để bác, chỉ
              có điều đúng là gì — nên hộp mang tiêu đề "Quy định hiện hành" dù trả lời đúng hay
              sai. Khoá theo `evidence` chứ không theo `kind`.
            */}
            <p className={styles.explainTitle}>
              {item.evidence === 'quy-dinh'
                ? t('quiz.rule')
                : laDung
                  ? t('quiz.whyRight')
                  : t('quiz.whyWrong')}
            </p>
            {/*
              Lời giải có CẤU TRÚC, bốn dòng — chủ dự án 24/09/2026: "chỉ cần ghi là câu hỏi trên
              là loại công thức để tính thứ gì → sẽ áp dụng công thức → đưa ra công thức → sau đó
              áp dụng số liệu bên trên vào → kết quả cuối cùng là xong… không sáng tạo thêm hay
              thêm lời vô nghĩa."

              Đây là vòng thứ HAI trong ngày. Vòng một viết lời giải thành ba khối văn xuôi, có
              cả phần "vì sao ba đáp án kia sai"; chủ dự án xem rồi bác vì dài. Nên khối này
              KHÔNG nhắc tới đáp án sai — đừng dựng lại.

              Dòng "Công thức" là HÌNH công thức của chính trang này (`hinhCongThuc`, bản MathML
              thẻ Công thức đầu màn đang dùng), chứ không phải một chuỗi khai trong câu hỏi: một bản
              sao trong dữ liệu câu hỏi sẽ lệch khỏi thẻ ấy đúng lúc không ai nhìn.

              Câu nào chưa có `giai` thì vẫn dựng đoạn văn cũ — 412 câu không chuyển hết trong
              một lần được, và một khối rỗng thì tệ hơn một đoạn văn dài.
            */}
            {item.giai !== undefined && (ghiDe !== undefined || coHinh) ? (
              <dl className={styles.giai}>
                <div className={styles.giaiHang}>
                  <dt>{t('quiz.giai.tinh')}</dt>
                  <dd>{chu(item.giai.tinh)}</dd>
                </div>
                <div className={styles.giaiHang}>
                  <dt>{t('quiz.giai.congThuc')}</dt>
                  {ghiDe === undefined ? (
                    <dd className={styles.giaiHinh}>{hinhCongThuc}</dd>
                  ) : (
                    <dd className={styles.giaiGhiDe}>{chu(ghiDe)}</dd>
                  )}
                </div>
                <div className={styles.giaiHang}>
                  <dt>{t('quiz.giai.thaySo')}</dt>
                  <dd className={styles.giaiSo}>{chu(item.giai.thaySo)}</dd>
                </div>
                <div className={styles.giaiHang}>
                  <dt>{t('quiz.giai.ketQua')}</dt>
                  <dd className={styles.giaiKetQua}>{chu(item.giai.ketQua)}</dd>
                </div>
                {/*
                  Câu trích nguyên văn của nguồn, nếu câu hỏi có. Chủ dự án chỉ đòi "bên dưới
                  cùng ghi nguồn", và ĐÂY LÀ nguồn: đường dẫn nói nguồn ở đâu, câu trích nói
                  nguồn viết gì. Bỏ nó đi là lấy mất của người đọc khả năng mở trang gốc ra đối
                  chiếu — thứ mà `quiz.test.ts` bắt mọi câu `ngo-nhan` phải có bằng được.

                  Chỉ lấy phần TRONG ngoặc kép, không lấy cả đoạn văn: đoạn văn chính là thứ
                  vừa bị bác vì dài.
                */}
                {/*
                  MỘT dòng Nguồn, nằm trong cùng lưới với bốn dòng trên để nhãn thẳng hàng. Bản
                  đầu dựng câu trích thành một dòng "Nguồn" RIÊNG rồi vẫn giữ dòng "Nguồn" có
                  link ở dưới — hai dòng cùng tên, chụp ra là thấy ngay.

                  Mỗi câu trích một dòng (`.giaiTrich` là khối): hai đoạn trích đứng liền nhau
                  trên một dòng thì dấu đóng của đoạn trước dính vào dấu mở của đoạn sau.
                */}
                <div className={styles.giaiHang}>
                  <dt>{t('quiz.source')}</dt>
                  <dd className={styles.giaiNguon}>
                    <span>
                      <a
                        href={item.source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        title={item.source.url}
                      >
                        {shortUrl(item.source.url)}
                      </a>
                      {item.source.effectiveFrom !== undefined && (
                        <span className={styles.effective}>
                          {' · '}
                          {t('quiz.effectiveFrom')} {item.source.effectiveFrom}
                        </span>
                      )}
                    </span>
                    {trichDan.map((doan, i) => (
                      <q className={`${styles.quote} ${styles.giaiTrich}`} key={i}>
                        {doan}
                      </q>
                    ))}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className={styles.explainBody}>
                {quoteParts(chu(item.explain)).map((part, i) =>
                  part.quoted ? (
                    <q className={styles.quote} key={i}>
                      {part.text}
                    </q>
                  ) : (
                    <span key={i}>{part.text}</span>
                  ),
                )}
              </p>
            )}
            {/*
              Chữ của link là đường dẫn rút gọn (WF-19D · S14): người đọc thấy mình sắp đi đâu
              trước khi bấm. `title` giữ đường dẫn đầy đủ.

              KHÔNG còn chip loại nguồn ("Chuyên gia", "Tài liệu chuẩn"…) — chủ dự án bỏ ngày
              24/09/2026. Nhãn ấy nói về NGƯỜI nói chứ không giúp người học quyết định gì, mà lại
              chiếm chỗ ngay cạnh thứ họ cần bấm. Phân loại vẫn còn trong dữ liệu (`source.kind`)
              cho đội nội dung, chỉ thôi hiện ra màn.
            */}
            {item.giai === undefined && (
              <p className={styles.source}>
                <span>{t('quiz.source')}</span>
                <a
                  href={item.source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={item.source.url}
                >
                  {shortUrl(item.source.url)}
                </a>
                {item.source.effectiveFrom !== undefined && (
                  <span className={styles.effective}>
                    {t('quiz.effectiveFrom')} {item.source.effectiveFrom}
                  </span>
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
