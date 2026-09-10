'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';

import { formulaPath, variablesForLevel } from '@/application';
import type { ChainInputs, ChainOverrides, ChainResult, FormulaSpec, Level } from '@/application';
import { usePick, useT } from '@/application/preferences-context';
import { LinkedInput, VariableField, isWideControl } from '@/ui/inputs';
import { FlowChainStrip, InlineWarning } from '@/ui/result';
import type { FlowStatus } from '@/ui/result';

import { useCalcText } from '../i18n/units';
import styles from './ChainBody.module.css';

export interface ChainBodyProps {
  /** Mọi công thức của chuỗi, gồm cả công thức đang xem. */
  formulas: ReadonlyArray<FormulaSpec>;
  /** Chuỗi đã tính xong — màn chi tiết tính một lần rồi dùng chung cho cả khối này. */
  chain: ChainResult;
  currentId: string;
  inputs: ChainInputs;
  overrides: ChainOverrides;
  onInput: (formulaId: string, key: string, value: number) => void;
  onOverride: (formulaId: string, key: string, value: number | undefined) => void;
  mode: Level;
}

/**
 * Khối chuỗi công thức của màn nâng cao WF-04 — gói WBS 3.2.2.
 *
 * Đây là chỗ FR-15 hiện ra thành thứ người dùng nhìn thấy: dải luồng chỉ rõ thứ tự các bước,
 * mỗi bước trước/sau là một thẻ gập được có ô nhập riêng và kết quả riêng, và bước nào gãy thì
 * dải nói thẳng bước đó gãy.
 *
 * ── Vì sao khối này KHÔNG dựng lại ô nhập của công thức đang xem ────────────────────────────
 *
 * Ô của công thức đang xem đã nằm ở khối "Số liệu" phía trên, và ô móc nối của nó cũng dựng
 * ngay tại đó bằng `LinkedInput`. Bày lại lần hai ở đây là hai điều khiển cho cùng MỘT con số —
 * đúng lớp lỗi mà `ownsResult()` sinh ra để chặn ở WF-08 (kết quả hiện hai lần cách nhau một
 * khối). Khối này chỉ lo những bước **khác**.
 *
 * ── Trước / sau, suy từ thứ tự topo chứ không so bậc ────────────────────────────────────────
 *
 * `chainFor()` chỉ lấy tổ tiên và hậu duệ của công thức đang xem, không lấy nhánh song song.
 * Nên trong thứ tự topo, mọi bước đứng TRƯỚC công thức đang xem đều là thứ cấp số liệu cho nó,
 * và mọi bước đứng SAU đều là thứ tiêu thụ kết quả của nó. Không cần so `depth`.
 *
 * ── Pill trên dải bấm được, trỏ thẳng xuống khối tương ứng ──────────────────────────────────
 *
 * `moToiBuoc()` là `onStepClick` của `FlowChainStrip`: bấm một bước KHÁC bước đang xem thì mở
 * khối `<details>` của bước đó (id `chain-step-<formulaId>`, đặt ở `theBuoc()`) rồi cuộn tới —
 * không thì dải chỉ để xem, người bấm không biết khối tương ứng nằm chỗ nào trong hai danh sách
 * trước/sau. Bước đang xem không có pill bấm được vì nó không có khối nào ở đây để cuộn tới.
 *
 * `activeId` là state RIÊNG, tách khỏi `openIds`: dải luôn tô xanh đúng MỘT pill — bước vừa bấm,
 * hoặc bước đang xem khi chưa bấm gì (`activeId ?? currentId` bên trong `FlowChainStrip`). Còn
 * `openIds` quyết định khối nào đang mở, và có thể có nhiều khối mở cùng lúc. Gộp chung một state
 * thì bước cấp trực tiếp (mở sẵn từ đầu) cùng mọi bước đã từng bấm qua sẽ xanh cùng lúc mãi mãi,
 * đúng cái cảnh "hai nút cùng xanh, nhìn như nút cũ chưa tắt" mà chủ dự án đã báo.
 */
/**
 * Mốc "màn đủ rộng để bày hết bước trước", khớp `@media (min-width: 1024px)` trong
 * `ChainBody.module.css` — chính mốc các thẻ chuyển sang xếp hai cột.
 *
 * Một con số ở hai nơi là một nguy cơ lệch, nhưng CSS không đọc được hằng số TS và ngược lại —
 * cùng cảnh với `WIDE_QUERY` ở `use-chart-size.ts`, và cách xử lý cũng giống: đổi mốc này thì
 * PHẢI đổi cả bên kia. Lệch nhau thì có khổ màn mở sẵn mọi thẻ mà vẫn xếp một cột, đúng cảnh dài
 * dòng mà việc chia hai cột sinh ra để tránh.
 */
const MAN_RONG_QUERY = '(min-width: 1024px)';

/**
 * Màn có đang ở khổ rộng không.
 *
 * `matchMedia` canh bằng `typeof` chứ không gọi thẳng: jsdom không cài nó, mà `ChainBody.test.tsx`
 * dựng component này trực tiếp. Vắng `matchMedia` thì coi như khổ hẹp — đúng nếp cũ, nên mọi ca
 * kiểm sẵn có giữ nguyên hành vi chúng đang gác.
 */
function manRong(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(MAN_RONG_QUERY).matches
  );
}

export function ChainBody({
  formulas,
  chain,
  currentId,
  inputs,
  overrides,
  onInput,
  onOverride,
  mode,
}: ChainBodyProps) {
  const specById = new Map(formulas.map((spec) => [spec.id, spec]));

  /*
   * Bước nào mở sẵn khi khối vừa dựng — và câu trả lời khác nhau theo khổ màn.
   *
   * **Màn rộng: MỌI bước trước đều mở.** Chủ dự án chốt 10/09/2026: _"mặc định ở màn web thì các
   * phần nằm trong 'Bước trước — cấp số liệu cho công thức đang xem' đều được mặc định là bật"_.
   * Từ khổ 1024 các thẻ đã xếp hai cột (xem `haiCot()`), nên bày hết ra tốn ít chiều dọc hơn hẳn
   * và người dùng thấy trọn mạch tính mà không phải bấm từng thẻ.
   *
   * **Màn hẹp: chỉ bước cấp số liệu TRỰC TIẾP.** Giữ nguyên nếp cũ, và lý do cũ vẫn đúng: đó là
   * thứ người dùng bật chế độ Nâng cao để sửa (đổi beta rồi xem suất chiết khấu đổi theo). Ở một
   * cột, mở hết là đẩy khối Nguồn tham khảo xuống rất xa; dòng tóm tắt của thẻ gập vẫn hiện kết
   * quả nên không phải mở ra mới biết chuỗi chạy tới đâu.
   *
   * Bước SAU không đổi: chúng chưa bao giờ nằm trong `dependsOn` nên vẫn gập, ở cả hai khổ.
   *
   * ── Vì sao ĐƯỢC đọc `matchMedia` ngay trong thân component ở đây ─────────────────────────────
   *
   * `use-chart-size.ts` cấm đúng việc này và cấm có lý: thư mục biểu đồ được dựng sẵn vào HTML
   * tĩnh, nên lần render đầu ở máy khách phải khớp hệt HTML ấy — đo màn lúc render là một đường
   * lệch hydration.
   *
   * Khối này KHÔNG ở trong cảnh đó. Nó chỉ dựng khi `mode === 'advanced'`, mà chế độ mặc định là
   * Cơ bản, nên nó không hề có mặt trong HTML tĩnh — `verify:static` ghim đúng điều đó ("khối
   * chuỗi WF-04 không rò vào HTML tĩnh"). Lần render đầu của nó luôn là render ở máy khách, sau
   * khi `PreferencesProvider` đã đọc xong preferences. Không có HTML nào để lệch.
   *
   * Và phải đọc ngay lúc render chứ không hoãn vào `useEffect`: hoãn thì thẻ mở BẬT RA sau khi
   * khối đã vẽ xong, tức một cú nhảy bố cục ngay trước mắt người dùng.
   */
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => {
    const trucTiep = chain.byId.get(currentId)?.dependsOn ?? [];
    if (!manRong()) return new Set(trucTiep);

    const moc = chain.steps.findIndex((step) => step.formulaId === currentId);
    return new Set(moc === -1 ? trucTiep : chain.steps.slice(0, moc).map((s) => s.formulaId));
  });
  /** Bước vừa bấm gần nhất trên `FlowChainStrip` — chỉ MỘT pill tô xanh tại một thời điểm. */
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const t = useT();
  const pick = usePick();
  const calcText = useCalcText();

  const currentIndex = chain.steps.findIndex((step) => step.formulaId === currentId);
  if (currentIndex === -1) return null;

  const statuses: Record<string, FlowStatus> = {};
  for (const step of chain.steps) {
    statuses[step.formulaId] = step.output.value === null ? 'error' : 'ok';
  }

  function toggle(id: string, open: boolean): void {
    setOpenIds((current) => {
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  /**
   * Bấm một pill khác trên `FlowChainStrip` thì mở khối của bước đó ra (kể cả đang gập) rồi cuộn
   * tới — không thì người bấm chỉ thấy khối bật mở ở ngoài tầm mắt, dưới rất xa dải.
   *
   * Cùng khuôn `matchMedia`/`scrollIntoView` với `scrollToExample()` trong `FormulaDetail.tsx`:
   * kiểm `typeof` trước khi gọi cả hai vì jsdom (môi trường test) không cài `matchMedia`.
   */
  function moToiBuoc(formulaId: string): void {
    toggle(formulaId, true);
    setActiveId(formulaId);

    const target = document.getElementById(`chain-step-${formulaId}`);
    if (target === null || typeof target.scrollIntoView !== 'function') return;
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function theBuoc(index: number) {
    const step = chain.steps[index];
    if (step === undefined) return null;

    const spec = specById.get(step.formulaId);
    if (spec === undefined) return null;

    const linkedKeys = new Set(step.fields.map((field) => field.spec.key));
    const ownInputs = inputs[step.formulaId] ?? {};
    const ownOverrides = overrides[step.formulaId] ?? {};

    return (
      <details
        key={step.formulaId}
        id={`chain-step-${step.formulaId}`}
        className={styles.step}
        open={openIds.has(step.formulaId)}
        onToggle={(event) => {
          toggle(step.formulaId, event.currentTarget.open);
        }}
      >
        <summary className={styles.summary}>
          <span className={styles.stepName}>{pick(spec.name)}</span>
          <span
            className={
              step.output.value === null
                ? `${styles.stepValue} ${styles.stepFailed}`
                : styles.stepValue
            }
          >
            {calcText(step.output)}
          </span>
        </summary>

        <div className={styles.stepBody}>
          <div className={styles.fields}>
            {variablesForLevel(spec, mode).map((variable) => {
              const field = step.fields.find((f) => f.spec.key === variable.key);

              // Ô nhận giá trị từ bước trước: dựng LinkedInput để có nhãn nguồn, cảnh báo kế
              // thừa (FR-15) và nút Nhận tự động khi đã ghi đè. Ô thường thì vẫn là điều khiển
              // sinh từ VariableSpec.
              if (field !== undefined && linkedKeys.has(variable.key)) {
                return (
                  <LinkedInput
                    key={variable.key}
                    spec={variable}
                    upstream={field.upstream}
                    {...(field.override === undefined ? {} : { override: field.override })}
                    onOverrideChange={(value) => {
                      onOverride(step.formulaId, variable.key, value);
                    }}
                    mode={mode}
                    className={styles.fieldWide}
                  />
                );
              }

              return (
                <VariableField
                  key={variable.key}
                  spec={variable}
                  value={
                    ownInputs[variable.key] ?? ownOverrides[variable.key] ?? variable.defaultValue
                  }
                  onChange={(value) => {
                    onInput(step.formulaId, variable.key, value);
                  }}
                  mode={mode}
                  // Cùng luật với khối Số liệu: thanh trượt và nhóm nút chiếm trọn hàng. Thẻ bước
                  // còn hẹp hơn khối chính (thụt vào hai lần), nên bỏ luật này ở đây là ô lưới
                  // rơi xuống 143px — xem docblock của `isWideControl()`.
                  className={isWideControl(variable.type) ? styles.fieldWide : styles.field}
                />
              );
            })}
          </div>

          {/*
            Cảnh báo của bước này. Ô móc nối đã tự hiện cảnh báo của RIÊNG nó bên trong
            LinkedInput; dòng đây nói về cả bước — hai câu khác nhau, cố ý (xem `run-chain.ts`).
          */}
          {step.output.warning !== undefined && <InlineWarning warning={step.output.warning} />}

          <Link className={styles.openLink} href={formulaPath(step.formulaId)}>
            {t('chain.openStep')}
          </Link>
        </div>
      </details>
    );
  }

  const truoc = chain.steps.slice(0, currentIndex).map((_step, index) => theBuoc(index));
  const sau = chain.steps
    .slice(currentIndex + 1)
    .map((_step, index) => theBuoc(currentIndex + 1 + index));

  /**
   * Hai cột thẻ bước ở khổ rộng — mỗi cột là tiêu đề nhóm (nếu cột LÀ một nhóm) rồi các thẻ xếp
   * dọc. Cột không có thẻ nào thì không dựng, để một thẻ lẻ loi không kéo theo một cột rỗng.
   *
   * ── `columnsEven`: khi nào thẻ đang mở được nở ra cho hai cột cùng mép dưới ──────────────────
   *
   * Chỉ khi hai cột giữ BẰNG NHAU số thẻ. Chủ dự án chỉ lỗi này bằng ảnh trang
   * `gia-tri-noi-tai-fcff` (cột trái CAPM + FCFF, cột phải mỗi WACC): luật nở áp cả ở đó thì thẻ
   * WACC phải một mình cao bằng hai thẻ bên trái, và phần dư — đúng bằng nguyên một thẻ — thành
   * một mảng trống mênh mông dưới dòng "Mở màn riêng của bước này".
   *
   * Lệch số thẻ thì chênh lệch chiều cao TÍNH BẰNG THẺ, không phải bằng vài chục px, nên không có
   * cách nào lấp cho đẹp — để hai cột kết thúc ở đúng chỗ nội dung của chúng hết là câu trả lời
   * thật thà. Bằng số thẻ thì chênh lệch chỉ là do số ô nhập trong từng thẻ, và lấp nó lại chính
   * là điều chủ dự án yêu cầu ở trang `wacc` (1 | 1).
   */
  function haiCot(
    cot: ReadonlyArray<{ key: string; title?: string; cards: ReadonlyArray<ReactNode> }>,
  ) {
    const coThe = cot.filter((c) => c.cards.length > 0);
    const canBang = coThe.length === 2 && coThe[0]?.cards.length === coThe[1]?.cards.length;

    return (
      <div className={canBang ? `${styles.columns} ${styles.columnsEven}` : styles.columns}>
        {coThe.map((c) => (
          <div key={c.key} className={styles.column}>
            {c.title !== undefined && <h3 className={styles.groupTitle}>{c.title}</h3>}
            {c.cards}
          </div>
        ))}
      </div>
    );
  }

  /**
   * Bố cục hai cột của các thẻ bước — hai luật, theo hai lần chủ dự án chỉ (10/09/2026).
   *
   * Lần một, trang `gia-tri-noi-tai-fcff` (ba bước trước, không bước sau): _"ở màn web đang quá
   * rộng… chẵn thì chia ra 2 cột lần lượt, lẻ thì cột trái nhiều hơn cột phải 1"_. Đo ở 1500px:
   * một thẻ trải 1357px, thanh trượt bên trong dài cả màn. → CHỈ MỘT nhóm thì cắt thẻ của nhóm đó
   * làm đôi: nửa đầu cột trái, nửa sau cột phải, `Math.ceil(n / 2)` cho cột trái làm đúng cả hai ca.
   *
   * Lần hai, trang `wacc` (một bước trước, một bước sau): _"tôi vẫn thấy chưa chia thành 2 cột vẫn
   * 1 cột"_ — vì mỗi nhóm một thẻ, cắt đôi từng nhóm cho ra hai thẻ nửa bề ngang chồng lên nhau ở
   * nửa trái. → CÓ CẢ HAI nhóm thì mỗi nhóm là một cột: Bước trước bên trái, Bước sau bên phải, tiêu
   * đề nhóm đứng đầu cột của mình. Trong Registry hiện tại ca này luôn là 1 | 1 (`wacc`,
   * `mo-hinh-gordon`); nhóm nhiều thẻ thì thẻ xếp dọc trong cột.
   *
   * Cùng lần hai: _"height của các phần này cần bằng nhau khi bật lên để xem chi tiết các bước"_ —
   * luật ấy nằm ở CSS (`.column > .step[open]` nở ra lấp phần cột còn dư), và nó CHỈ bật khi hai cột
   * bằng nhau số thẻ; xem `haiCot()` ngay trên cùng `ChainBody.module.css`.
   *
   * ── Vì sao là hai cột flex thật, không phải lưới hai cột hay `columns: 2` ────────────────────
   *
   * Thẻ bước là `<details>` — cao 44px khi gập, vài trăm px khi mở, và bước cấp trực tiếp mở sẵn.
   * Lưới CSS xếp thẻ theo HÀNG chung: thẻ gập đứng cạnh thẻ mở là thẻ kế tiếp cùng cột rơi xuống
   * dưới một khoảng trống bằng cả thẻ kia. `columns: 2` thì cân lại mỗi lần một thẻ đổi chiều cao,
   * tức bấm mở thẻ này là thẻ khác NHẢY sang cột bên. Hai cột flex độc lập không mắc cả hai: mỗi
   * cột tự xếp thẻ của mình, và thẻ nào ở cột nào là cố định.
   *
   * Cắt LIỀN KỀ (nửa đầu trái, nửa sau phải) chứ không so le, để thứ tự DOM vẫn là thứ tự topo:
   * khổ hẹp hai cột chồng lên nhau thành đúng một danh sách như cũ, trình đọc màn hình và phím Tab
   * đi theo mạch tính từ trên xuống, và `moToiBuoc()` cuộn tới đúng thẻ dù thẻ ở cột nào.
   */
  function bocNhom(): ReactNode {
    const coTruoc = truoc.length > 0;
    const coSau = sau.length > 0;

    if (coTruoc && coSau) {
      return haiCot([
        { key: 'truoc', title: t('chain.upstreamHeading'), cards: truoc },
        { key: 'sau', title: t('chain.downstreamHeading'), cards: sau },
      ]);
    }
    if (!coTruoc && !coSau) return null;

    const cards = coTruoc ? truoc : sau;
    const nuaTrai = Math.ceil(cards.length / 2);
    return (
      <>
        <h3 className={styles.groupTitle}>
          {t(coTruoc ? 'chain.upstreamHeading' : 'chain.downstreamHeading')}
        </h3>
        {haiCot([
          { key: 'trai', cards: cards.slice(0, nuaTrai) },
          { key: 'phai', cards: cards.slice(nuaTrai) },
        ])}
      </>
    );
  }

  return (
    <section className={styles.wrap} aria-labelledby="khoi-chuoi">
      <h2 className={styles.title} id="khoi-chuoi">
        {t('chain.title')}
      </h2>
      {/*
        Dòng dẫn "Kết quả mỗi bước chảy thẳng vào ô của bước sau…" đã BỎ — chủ dự án chốt
        10/09/2026, cùng đợt với dòng "Sửa được ngay tại đây" của khối Ví dụ.

        Đừng dựng lại: điều nó nói ra thì dải `FlowChainStrip` ngay dưới đã VẼ ra, và vẽ rõ hơn —
        các bước nối nhau bằng mũi tên, bước đang đứng nổi lên. Một câu văn lặp lại thứ hình vẽ đã
        nói là câu người dùng đọc đúng một lần rồi bỏ qua mãi mãi.
      */}

      <FlowChainStrip
        formulas={formulas}
        currentId={currentId}
        statuses={statuses}
        onStepClick={moToiBuoc}
        activeId={activeId}
      />

      {bocNhom()}
    </section>
  );
}
