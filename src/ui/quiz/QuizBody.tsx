'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { QuizChoiceKey, QuizItem, QuizProgress, QuizText } from '@/application';
import { usePreferences, useT } from '@/application/preferences-context';
import { Button } from '@/ui/primitives';

import { laDungCua, traLoiDuoc as traLoiDuocCua } from './cham';
import styles from './QuizBody.module.css';
import { QuizQuestion } from './QuizQuestion';

/**
 * Khối "Kiểm tra hiểu bài" — WF-19, WF-19B và WF-19D, gói 23/09/2026.
 *
 * Đặt cuối màn chi tiết, sau khối Ví dụ thực tế và khối Nguồn. Người dùng đọc xong công thức
 * rồi mới tự soát, nên khối này là điểm dừng chứ không phải thứ chen ngang.
 *
 * ── Năm quyết định đã chốt, đừng dựng lại ────────────────────────────────────────────────────
 *
 * 1. **Không có khuôn "5 câu mỗi công thức".** Số câu đi theo tư liệu. Khối tự đổi hình theo số
 *    câu nó nhận được — dưới `minForProgress` thì giấu hẳn thanh tiến độ, vì một thanh hai vạch
 *    trông như lỗi hiển thị. Trạng thái rỗng vẫn phải giữ, dù hiện không công thức nào còn trống:
 *    mất nó thì lần sau thêm một công thức mới là màn hỏng.
 * 2. **Khối nguồn là bắt buộc, không phải trang trí.** Mỗi câu hiện đường dẫn tới chỗ đọc được
 *    điều nó kiểm tra. Đây là thứ giữ cho đội nội dung không soạn câu theo cảm tính.
 * 3. **Trả lời xong thì khoá lựa chọn.** Không cho đổi đáp án. Đổi đáp án sau khi đã thấy lời
 *    giải là tự chấm điểm cho mình.
 * 4. **Ba dạng câu, KHÔNG có Đúng/Sai.** `trac-nghiem` · `chon-nhieu` · `dien-so` — xem docblock
 *    `QuizFormat` ở Domain, gồm cả lý do dạng Đúng/Sai của WF-19C · S13 bị bỏ.
 * 5. **Câu đã làm KHÔNG biến mất.** Từ 24/09/2026 mỗi câu vừa trả lời co lại thành một dòng gọn
 *    nằm ngay trên câu mới, bấm vào thì mở lại nguyên câu cũ kèm lời giải. Trước đó người dùng
 *    bấm "Câu tiếp" là mất hẳn câu vừa đọc, muốn xem lại phải đi hết bài rồi mới thấy ở tổng kết.
 *
 * Bàn phím: lựa chọn là radio hoặc checkbox THẬT trong một `<fieldset>`, nên mũi tên lên/xuống và
 * phím cách chạy sẵn theo hành vi trình duyệt. Ô điền số mở bàn phím số trên điện thoại. Kết quả
 * đúng/sai đọc qua vùng `aria-live`.
 */

export interface QuizBodyProps {
  /** Id công thức đang mở — đi vào kết quả lưu trên máy. */
  formulaId: string;
  /** Câu hỏi của đúng công thức ấy, do `page.tsx` cắt sẵn lúc build. */
  items: ReadonlyArray<QuizItem>;
  /**
   * Hình công thức của chính trang này, dựng sẵn ở `FormulaDetail` (rê vào ký hiệu thì mở khung
   * "cách tính" như thẻ Công thức) — dòng "Công thức" của khối lời giải có cấu trúc. Không câu hỏi
   * nào chép lại công thức, nên nó không lệch được khỏi thẻ ấy.
   */
  hinhCongThuc?: ReactNode;
  /** Kết quả lần gần nhất đọc từ máy, `null` nếu chưa làm bao giờ. */
  saved?: QuizProgress | null;
  /** Gọi khi làm xong, để màn chi tiết ghi vào localStorage. */
  onFinish?: (result: { right: number; total: number; wrong: string[] }) => void;
  /**
   * Dưới ngưỡng này thì khối đổi sang trạng thái "công thức mới có ít câu" (WF-19D · S18): không
   * hiện thanh tiến độ, không chấm điểm, chỉ mời làm thử.
   *
   * BA — vì một thanh tiến độ hai vạch trông như lỗi hiển thị, còn "1/2" thì không đáng gọi là
   * bài kiểm tra. Rất nhiều công thức rơi vào khoảng này, nên đây là trạng thái THƯỜNG GẶP.
   *
   * Con số sống ở ĐÂY, không ở Domain: tầng giao diện không import được `@/core/quiz` (CON-03),
   * nên một hằng bên ấy chỉ là con số thứ hai không ai đọc.
   */
  minForProgress?: number;
  className?: string;
}

type Phase = 'idle' | 'asking' | 'summary';

/** Một câu đã trả lời xong, giữ lại đủ để dựng lại y hệt lúc người dùng vừa làm. */
interface DaLam {
  item: QuizItem;
  picked: ReadonlyArray<QuizChoiceKey>;
  typed: ReadonlyArray<string>;
  laDung: boolean;
  boQua: boolean;
}

export function QuizBody({
  formulaId,
  items,
  hinhCongThuc,
  saved = null,
  onFinish,
  minForProgress = 3,
  className,
}: QuizBodyProps) {
  const t = useT();
  const { locale } = usePreferences();

  /**
   * Gốc id dựng từ `formulaId`, KHÔNG phải `useId()`.
   *
   * Khối này nằm sau ranh giới `next/dynamic` của `QuizPanel`, chỗ mà chuỗi `useId()` sinh ra
   * lúc dựng HTML tĩnh khác chuỗi sinh ra lúc React gắn lại trên trình duyệt — cùng lớp lỗi đã
   * đo được ở cây biểu đồ (5 cảnh báo hydration mỗi trang; xem bất biến "không `useId()`" của
   * `src/ui/charts/`). Và id ấy đi thẳng vào HTML của mọi trang có câu hỏi, vì `<h2>` dưới đây
   * dựng ngay cả khi người dùng chưa bấm bắt đầu.
   */
  const groupId = `quiz-${formulaId}`;

  const [phase, setPhase] = useState<Phase>('idle');
  /** Chỉ số câu đang hỏi trong `queue`. */
  const [index, setIndex] = useState(0);
  /**
   * Ô đang chọn. MẢNG chứ không phải một khoá, để `trac-nghiem` và `chon-nhieu` dùng chung một
   * đường: dạng một đáp án thì mảng luôn có 0 hoặc 1 phần tử.
   */
  const [picked, setPicked] = useState<ReadonlyArray<QuizChoiceKey>>([]);
  /**
   * Chữ người dùng gõ vào TỪNG ô trống của công thức ở câu `dien-so`, theo thứ tự trái sang phải.
   *
   * Giữ nguyên dạng CHỮ, chỉ đọc thành số lúc chấm — người đang gõ dở '1,' chưa có số nào, mà đổi
   * chuỗi dưới tay họ là điều `NumberInput` cấm. Mảng thưa cũng được: ô chưa đụng tới thì phần tử
   * là `undefined`, và `traLoiDuoc` coi đó là chưa trả lời xong.
   */
  const [typed, setTyped] = useState<ReadonlyArray<string>>([]);
  const [answered, setAnswered] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  /**
   * Mã những câu người dùng BỎ QUA — tập con của `wrongIds`.
   *
   * Bỏ qua vẫn đi vào `wrongIds`, vì nó cũng là câu cần ôn lại và vì kho chỉ có một danh sách
   * (`QuizProgress.wrong`). Nhưng màn tổng kết phải phân biệt được: đánh dấu ✕ cho câu người ta
   * chưa hề trả lời là báo sai — họ không chọn nhầm, họ không chọn.
   */
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [rightCount, setRightCount] = useState(0);
  /**
   * Bộ câu của lượt hiện tại. "Ôn lại câu sai" chạy lại đúng những câu đã sai chứ không chạy
   * lại cả bài — người vừa trả lời đúng bốn câu không cần làm lại bốn câu ấy.
   */
  const [queue, setQueue] = useState<ReadonlyArray<QuizItem>>(items);
  /** Dải câu đã làm của lượt này, cũ nhất trước — xem quyết định 5 ở docblock đầu file. */
  const [daLam, setDaLam] = useState<ReadonlyArray<DaLam>>([]);
  /** Mã câu trong dải lịch sử đang được mở ra xem lại; `null` là tất cả đang co lại. */
  const [dangMo, setDangMo] = useState<string | null>(null);

  const chu = useCallback(
    (value: QuizText) => (locale === 'en' && value.en !== undefined ? value.en : value.vi),
    [locale],
  );

  /*
   * Soi ĐỦ mọi đoạn chữ của câu, không riêng đề bài: câu dịch nửa vời — có `prompt.en` nhưng
   * thiếu `explain.en` — vẫn rơi về tiếng Việt ở phần giải thích, nên vẫn phải nói là chưa dịch.
   */
  const chuaDich =
    locale === 'en' &&
    items.some((entry) =>
      [entry.prompt, entry.explain].some(
        (value) => value.en === undefined || value.en.trim() === '',
      ),
    );

  const item = queue[index];
  const total = queue.length;
  const showProgress = total >= minForProgress;

  const traLoiDuoc = traLoiDuocCua(item, picked, typed);
  const laDung = laDungCua(item, picked, typed);

  const batDauLai = useCallback((list: ReadonlyArray<QuizItem>) => {
    setQueue(list);
    setIndex(0);
    setPicked([]);
    setTyped([]);
    setAnswered(false);
    setWrongIds([]);
    setSkippedIds([]);
    setRightCount(0);
    setDaLam([]);
    setDangMo(null);
  }, []);

  const start = useCallback(
    (list: ReadonlyArray<QuizItem>) => {
      batDauLai(list);
      setPhase('asking');
    },
    [batDauLai],
  );

  /**
   * Thoát giữa bài — WF-19 · S2.
   *
   * Về hẳn trạng thái nghỉ và xoá tiến trình dở, kể cả những câu đã trả lời đúng. KHÔNG ghi gì
   * xuống kho: một bài làm nửa chừng không nói lên người ta nắm tới đâu, và `recordQuizResult`
   * ghi đè theo id nên ghi nó xuống là xoá mất kết quả đầy đủ của lần trước.
   *
   * Trả `queue` về cả bộ câu, vì có thể vừa thoát khỏi một lượt "Ôn lại câu sai" — lần bấm Bắt
   * đầu sau đó phải là cả bài chứ không phải tập con còn sót lại.
   */
  const exit = useCallback(() => {
    batDauLai(items);
    setPhase('idle');
  }, [batDauLai, items]);

  const check = useCallback(() => {
    if (item === undefined || !traLoiDuoc) return;
    setAnswered(true);
    if (laDung) setRightCount((n) => n + 1);
    else setWrongIds((list) => [...list, item.id]);
  }, [item, laDung, traLoiDuoc]);

  /**
   * Đóng lượt làm bài.
   *
   * Nhận `wrong` và `right` TƯỜNG MINH thay vì đọc state, vì `skip()` vừa ghi thêm một mã sai vừa
   * đóng lượt trong CÙNG một lượt bấm — `wrongIds` trong closure lúc ấy còn là bản cũ, nên bỏ qua
   * đúng câu cuối sẽ rơi mất khỏi kết quả ghi xuống kho.
   *
   * CHỈ ghi khi lượt vừa rồi chạy hết bộ câu. "Ôn lại câu sai" chạy lại một TẬP CON, nên ghi nó
   * xuống là `recordQuizResult` ghi đè bản cũ theo id: làm 3/5 rồi ôn đúng cả 2 câu sai thành 2/2
   * trong kho — điểm đẹp lên một cách sai lệch. Lượt ôn là để học, không phải để chấm.
   */
  const finish = useCallback(
    (wrong: string[], right: number) => {
      setPhase('summary');
      if (total === items.length) onFinish?.({ right, total, wrong });
    },
    [items.length, onFinish, total],
  );

  /** Cất câu vừa xong vào dải lịch sử rồi dọn ô cho câu sau. */
  const sangCauSau = useCallback((xong: DaLam) => {
    setDaLam((list) => [...list, xong]);
    setDangMo(null);
    setIndex((i) => i + 1);
    setPicked([]);
    setTyped([]);
    setAnswered(false);
  }, []);

  const next = useCallback(() => {
    if (item === undefined) return;
    const xong: DaLam = { item, picked, typed, laDung, boQua: false };
    if (index + 1 < total) {
      sangCauSau(xong);
      return;
    }
    setDaLam((list) => [...list, xong]);
    finish(wrongIds, rightCount);
  }, [finish, index, item, laDung, picked, rightCount, sangCauSau, total, typed, wrongIds]);

  /**
   * Bỏ qua câu này — WF-19 · S2.
   *
   * Tính là CHƯA NẮM: mã câu vào `wrongIds` để nút "Ôn lại câu sai" hỏi lại được, và không cộng
   * vào `rightCount`. Nhưng nó cũng vào `skippedIds`, để màn tổng kết đánh dấu khác câu trả lời
   * sai — xem docblock của state ấy.
   */
  const skip = useCallback(() => {
    if (item === undefined) return;
    const wrong = [...wrongIds, item.id];
    setWrongIds(wrong);
    setSkippedIds((list) => [...list, item.id]);
    const xong: DaLam = { item, picked: [], typed: [], laDung: false, boQua: true };
    if (index + 1 < total) {
      sangCauSau(xong);
      return;
    }
    setDaLam((list) => [...list, xong]);
    finish(wrong, rightCount);
  }, [finish, index, item, rightCount, sangCauSau, total, wrongIds]);

  const wrongItems = useMemo(
    () => queue.filter((entry) => wrongIds.includes(entry.id)),
    [queue, wrongIds],
  );

  // ── Công thức chưa có câu nào — WF-19B · S9 ──────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <section className={`${styles.block} ${styles.empty} ${className ?? ''}`.trim()}>
        <h2 className={styles.label}>{t('quiz.title')}</h2>
        <p className={styles.emptyTitle}>{t('quiz.empty.title')}</p>
        <p className={styles.lead}>{t('quiz.empty.body')}</p>
      </section>
    );
  }

  return (
    <section
      className={`${styles.block} ${className ?? ''}`.trim()}
      aria-labelledby={`${groupId}-title`}
    >
      {/*
        Hàng tiêu đề mang NHÃN KHỐI và chỗ đếm câu; lúc đang làm bài nó mang thêm vị trí trong
        bài, thanh tiến độ và nút Thoát — chủ dự án 24/09/2026, có ảnh chụp kèm.

        Nghỉ:      BÀI TẬP  5 câu                               Bắt đầu kiểm tra »
        Đang làm:  BÀI TẬP  Câu 2 / 5  ▬▬ ▭ ▭ ▭ ▭                            Thoát

        Chủ dự án chốt hình này sau bốn vòng trong cùng một ngày. Trạng thái nghỉ nay là ĐÚNG
        một hàng — câu mời "Không chấm điểm, chỉ để bạn tự soát lại." bị bỏ, cho dựng lại, rồi bỏ
        hẳn ngay sau khi nhìn thấy nó đứng dưới hàng tiêu đề. Đo được: khối nghỉ 78px. Lối vào là
        nút CHỮ (`ghost`), không phải nút đặc: một khối màu cạnh một nhãn nhỏ viết hoa sẽ nặng
        hơn chính nội dung nó dẫn vào.

        `.intro` bên dưới chỉ dựng khi thật sự có gì để nói — bài dưới ba câu, hoặc đã có điểm
        lần trước. Không còn dòng nào dựng vô điều kiện ở trạng thái nghỉ.

        Hàng này KHÔNG dùng `space-between`. Nhãn và số đếm thuộc về nhau nên đứng sát nhau bên
        trái; chỉ nút bên phải tự đẩy mình ra mép bằng `.headAction`. Có `space-between` thì số
        đếm bị ném ra tận mép phải của một khung 1600px, cách nhãn gần cả bề ngang trang.
      */}
      <div className={styles.head}>
        <h2 className={styles.label} id={`${groupId}-title`}>
          {t('quiz.title')}
        </h2>
        {phase === 'idle' && (
          <>
            <span className={styles.count}>
              {total} {t('quiz.countUnit')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={styles.headAction}
              onClick={() => start(items)}
            >
              {showProgress ? t('quiz.start') : t('quiz.startFew')}
              {/*
                Mũi tên dựng ở ĐÂY chứ không nhét vào chuỗi i18n: nó là trang trí, và nó phải theo
                cả hai nhãn (`quiz.start` lẫn `quiz.startFew`) — để trong từ điển thì thành bốn chỗ
                phải nhớ sửa thay vì một. Cùng khuôn `GroupCard.tsx`. `aria-hidden` vì bộ đọc màn
                hình đọc "»" ra thành tên ký tự, không thêm nghĩa gì cho nhãn nút.
              */}
              <span className={styles.startIcon} aria-hidden="true">
                »
              </span>
            </Button>
          </>
        )}
        {/*
          Cụm tiến độ dựng ở ĐÂY chứ không ở đầu thẻ câu hỏi như trước: một dòng riêng chỉ để đếm
          câu là dòng thứ hai nói cùng chuyện với nhãn khối nằm ngay trên nó.

          Nút Thoát dựng cả khi bài dưới ba câu, lúc không có thanh tiến độ (WF-19 · S2) — thiếu
          nó thì vào làm bài là không còn lối ra nào ngoài việc đi hết bài.
        */}
        {phase === 'asking' && (
          <>
            {showProgress && (
              <>
                <span className={styles.step}>
                  {t('quiz.step')
                    .replace('{n}', String(index + 1))
                    .replace('{total}', String(total))}
                </span>
                <span className={styles.bars} aria-hidden="true">
                  {queue.map((entry, i) => (
                    <span
                      key={entry.id}
                      className={[
                        styles.bar,
                        i < index ? styles.barDone : '',
                        i === index ? styles.barNow : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  ))}
                </span>
              </>
            )}
            <Button variant="ghost" size="sm" className={styles.headAction} onClick={exit}>
              {t('quiz.exit')}
            </Button>
          </>
        )}
      </div>

      {chuaDich && <p className={styles.note}>{t('quiz.notTranslated')}</p>}

      {phase === 'idle' && (!showProgress || saved !== null) && (
        <div className={styles.intro}>
          {!showProgress && <p className={styles.note}>{t('quiz.few.body')}</p>}
          {saved !== null && (
            <p className={styles.lastTime}>
              {t('quiz.lastTime')}: {saved.right}/{saved.total}
            </p>
          )}
        </div>
      )}

      {phase === 'asking' && item !== undefined && (
        <>
          {/*
            Dải câu đã làm — quyết định 5 ở docblock đầu file.
            Mỗi câu co thành MỘT dòng bấm được: dấu kết quả, số thứ tự, đề bài cắt ngắn. Bấm thì
            câu cũ mở ra nguyên vẹn ngay tại chỗ, không nhảy trang và không mất câu đang làm.
            Chỉ mở MỘT câu tại một thời điểm — mở nhiều câu cùng lúc thì câu đang hỏi bị đẩy khỏi
            màn, đúng thứ dải này sinh ra để tránh.
          */}
          {daLam.length > 0 && (
            <ul className={styles.history}>
              {daLam.map((xong, i) => {
                const mo = dangMo === xong.item.id;
                return (
                  <li key={xong.item.id} className={styles.historyRow}>
                    <button
                      type="button"
                      className={styles.historyHead}
                      aria-expanded={mo}
                      onClick={() => setDangMo(mo ? null : xong.item.id)}
                    >
                      <span
                        className={
                          xong.boQua
                            ? styles.markSkipped
                            : xong.laDung
                              ? styles.markRight
                              : styles.markWrong
                        }
                        aria-hidden="true"
                      >
                        {xong.boQua ? '?' : xong.laDung ? '✓' : '✕'}
                      </span>
                      <span className={styles.historyStep}>{i + 1}</span>
                      <span className={styles.historyPrompt}>{chu(xong.item.prompt)}</span>
                      <span className={styles.historyChevron} aria-hidden="true">
                        {mo ? '▴' : '▾'}
                      </span>
                    </button>
                    {mo && (
                      <div className={styles.historyBody}>
                        <QuizQuestion
                          item={xong.item}
                          hinhCongThuc={hinhCongThuc}
                          namePrefix={`${groupId}-ls`}
                          picked={xong.picked}
                          typed={xong.typed}
                          answered
                          readOnly
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className={styles.card}>
            <QuizQuestion
              item={item}
              hinhCongThuc={hinhCongThuc}
              namePrefix={groupId}
              picked={picked}
              typed={typed}
              answered={answered}
              onPick={(key) =>
                setPicked((list) =>
                  item.format === 'trac-nghiem'
                    ? [key]
                    : list.includes(key)
                      ? list.filter((k) => k !== key)
                      : [...list, key],
                )
              }
              onType={(thuTu, value) =>
                setTyped((list) => {
                  /* Mảng CÓ THỂ thưa: ô số 3 gõ trước ô số 1 thì hai ô đầu vẫn chưa tồn tại. */
                  const moi = [...list];
                  while (moi.length <= thuTu) moi.push('');
                  moi[thuTu] = value;
                  return moi;
                })
              }
            />

            {/*
              Hai nút đứng CẠNH NHAU, không đẩy nút phụ sang mép phải — chủ dự án 24/09/2026:
              "sửa lại 2 button Kiểm tra và Bỏ qua câu này cho gần nhau thay vì cách nhau quá xa
              như kia". Đảo lại quyết định sáng cùng ngày (đẩy "Bỏ qua" sang phải cho thẳng mép
              với nút "Thoát" ở dòng đầu): thẳng mép thì đẹp trên bản vẽ, nhưng trên màn rộng
              1440px hai nút cách nhau gần cả bề ngang thẻ và không còn đọc ra là một cặp.

              Dòng gợi ý "Chọn một đáp án để mở nút Kiểm tra" đã BỎ HẲN cùng lần ấy — nút xám và
              không bấm được đã nói đúng điều đó rồi, thêm một câu nữa là thừa.
            */}
            <div className={styles.actions}>
              {!answered ? (
                <>
                  <Button onClick={check} disabled={!traLoiDuoc}>
                    {t('quiz.check')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={skip}>
                    {t('quiz.skip')}
                  </Button>
                </>
              ) : (
                <Button onClick={next}>
                  {index + 1 < total ? t('quiz.next') : t('quiz.seeResult')}
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {phase === 'summary' && (
        <div className={styles.card}>
          <p className={styles.label}>{t('quiz.result')}</p>
          <p className={styles.score}>
            {rightCount} / {total}
          </p>
          <ul className={styles.review}>
            {queue.map((entry) => {
              const boQua = skippedIds.includes(entry.id);
              const sai = wrongIds.includes(entry.id);
              return (
                <li className={styles.reviewRow} key={entry.id}>
                  <span
                    className={
                      boQua ? styles.markSkipped : sai ? styles.markWrong : styles.markRight
                    }
                  >
                    {boQua ? '?' : sai ? '✕' : '✓'}
                  </span>
                  <span>{chu(entry.prompt)}</span>
                </li>
              );
            })}
          </ul>
          {/*
            Dòng giải nghĩa dấu `?`, chỉ hiện khi có câu bỏ qua — cùng nếp `portfolio.weightNote`
            và `ConstantsNote`: một ô rộng bằng một ký tự không mang nổi mệnh đề.
          */}
          {skippedIds.length > 0 && <p className={styles.note}>{t('quiz.skippedNote')}</p>}
          <div className={styles.actions}>
            {wrongItems.length > 0 && (
              <Button
                onClick={() => {
                  start(wrongItems);
                }}
              >
                {t('quiz.reviewWrong')}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                start(items);
              }}
            >
              {t('quiz.retry')}
            </Button>
          </div>
          {/*
            KHÔNG còn dòng "Kết quả lưu trên máy bạn, không gửi đi đâu…" — chủ dự án bỏ ngày
            24/09/2026. Đây là câu thứ ba cùng loại bị gỡ khỏi sản phẩm, sau `portfolio.localOnly`
            (dải "CỤC BỘ") và `settings.data.note` ngày 09/09/2026: cùng một quyết định, bỏ LỜI
            chứ không bỏ VIỆC.

            Việc thì không đổi một dòng nào: `recordQuizResult` vẫn chỉ ghi vào `localStorage`,
            `public/_headers` vẫn khoá `connect-src` ở một origin, và không có backend nào để gửi
            đi (SRS mục 3). Nên LDR-04 · NFR-SEC-01 nay tựa vào HÀNH VI và `_headers`, không tựa
            vào câu nào người dùng đọc được — y như COM-03 ở màn Danh mục. Đừng dựng lại câu này
            mà không hỏi: nó đã bị gỡ có chủ đích, không phải xoá nhầm.
          */}
        </div>
      )}
    </section>
  );
}
