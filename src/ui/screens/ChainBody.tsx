'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';

import { formulaPath, variablesForLevel } from '@/application';
import type {
  ChainInputs,
  ChainOverrides,
  ChainResult,
  FormulaSpec,
  Level,
  VariableSpec,
} from '@/application';
import { usePick, useT } from '@/application/preferences-context';
import { LinkedInput, VariableField, isWideControl } from '@/ui/inputs';
import { InlineWarning } from '@/ui/result';

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
 * Đây là chỗ FR-15 hiện ra thành thứ người dùng nhìn thấy: mỗi bước trước/sau là một thẻ gập
 * được, có ô nhập riêng và kết quả riêng, nên sửa giả định của bước trước là thấy ngay kết quả
 * của công thức đang xem đổi theo.
 *
 * ── Khối này TỪNG có một sơ đồ ở đầu, đã bỏ 16/09/2026 ──────────────────────────────────────
 *
 * Bản hàng ngang rồi bản cây `FlowChainTree` đều vẽ quan hệ phụ thuộc thành hình. Chủ dự án nhìn
 * cả hai và hỏi cùng một câu — _"các ô này tượng trưng cho gì"_, rồi _"vẫn không thể hiểu được
 * tác dụng của phần này"_. Rà lại thì hình ấy KHÔNG giữ chức năng nào của riêng nó: tên bước,
 * kết quả từng bước, bước nào gãy, và đường đi tới màn riêng của bước — bốn thứ đó đều đã có sẵn
 * trên chính các thẻ ngay dưới nó. Nó chỉ nói lại bằng một ngôn ngữ phải học trước mới đọc được.
 *
 * Đừng dựng lại hình ấy dưới bất kỳ dạng nào. Thứ khiến quan hệ đọc được là CHỮ đứng cạnh đúng
 * con số nó nói tới, ở cả hai đầu của mỗi mối nối: dòng tóm tắt của thẻ gọi tên con số và nói nó
 * là kết quả của công thức nào, dùng cho công thức nào (mục ngay dưới); còn `LinkedInput` in nhãn
 * nguồn "↳ …" dưới ô nhận số.
 *
 * ── Thẻ gọi theo tên CON SỐ nó cấp, không theo tên công thức (17/09/2026) ──────────────────
 *
 * Bản trước ghi "CAPM — chi phí vốn chủ sở hữu … 17 %" và "Mô hình Gordon (DDM một giai đoạn) …
 * 17.500 ₫". Chủ dự án khoanh đỏ hai con số và nói người dùng không hiểu chúng "tự dưng có" từ
 * đâu. Ba lý do cộng lại:
 *   · con số đứng trần cạnh tên CÔNG THỨC, không chữ nào nói đó là kết quả của công thức ấy;
 *   · thẻ không nói con số dùng vào đâu. Chỉ đầu nhận ("↳ Mô hình Gordon") nói, mà ở khổ PC ô ấy
 *     nằm góc trên bên trái trong khi các thẻ nằm cuối trang;
 *   · ở khổ PC khối đứng ngay dưới "Ví dụ thực tế", nên các thẻ trông như một phần của ví dụ.
 *
 * Nay dòng đầu của thẻ là NHÃN CỦA Ô NHẬN SỐ, trùng từng chữ với ô ấy ("Giá trị nội tại ước tính
 * (V) … 25.925,93 ₫"), đúng khuôn nhãn và giá trị của mọi hàng số khác trên màn; dòng dưới ghi
 * "kết quả của Mô hình Gordon (DDM một giai đoạn), dùng cho Biên an toàn". Chủ dự án chọn cách này
 * thay vì giữ tên công thức rồi thêm một dòng chú thích: thứ đứng cạnh con số phải là tên của CON
 * SỐ. Vị trí khối ở khổ PC giữ nguyên, cũng do chủ dự án chọn.
 *
 * Dòng ấy đọc cạnh `dependsOn`, tức mối nối CỐ ĐỊNH, không đọc trạng thái ghi đè: ô nhận đã nhập
 * tay thì thẻ vẫn ghi "dùng cho …". Chuyện ô ấy đang không nhận số là việc của `LinkedInput`, nơi
 * nhãn "đã nhập tay" và nút Nhận tự động nằm ngay tại ô.
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
 * `openIds` quyết định thẻ nào đang mở, và có thể có nhiều thẻ mở cùng lúc — xem luật mở sẵn
 * theo khổ màn ở ngay trong thân component.
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

  /**
   * Ô nào, của công thức nào trong chuỗi, nhận kết quả của từng bước. Khoá là `formulaId` của
   * bước CẤP số.
   *
   * Đọc thẳng `dependsOn` chứ không đọc `chain.steps[].fields`: `fields` chỉ giữ nguồn THẮNG của
   * mỗi ô (xem `runChain()`), nên một ô hai nguồn sẽ làm nguồn dự phòng mất tên nơi nhận.
   */
  const noiNhan = new Map<string, Array<{ formula: FormulaSpec; variable: VariableSpec }>>();
  for (const spec of formulas) {
    for (const dependency of spec.dependsOn ?? []) {
      const variable = spec.variables.find((v) => v.key === dependency.variableKey);
      if (variable === undefined) continue;
      noiNhan.set(dependency.formulaId, [
        ...(noiNhan.get(dependency.formulaId) ?? []),
        { formula: spec, variable },
      ]);
    }
  }

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
  const t = useT();
  const pick = usePick();
  const calcText = useCalcText();

  const currentIndex = chain.steps.findIndex((step) => step.formulaId === currentId);
  if (currentIndex === -1) return null;

  function toggle(id: string, open: boolean): void {
    setOpenIds((current) => {
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function theBuoc(index: number) {
    const step = chain.steps[index];
    if (step === undefined) return null;

    const spec = specById.get(step.formulaId);
    if (spec === undefined) return null;

    const linkedKeys = new Set(step.fields.map((field) => field.spec.key));
    const ownInputs = inputs[step.formulaId] ?? {};
    const ownOverrides = overrides[step.formulaId] ?? {};

    /*
     * Tên con số và vai của nó, xem mục "Thẻ gọi theo tên CON SỐ nó cấp" ở docblock đầu file.
     *
     * Một bước cấp cho nhiều ô thì gọi đủ tên các ô. Trong một chuỗi của Registry hôm nay chưa có
     * ca ấy, nhưng `chainFor()` không cấm. Không tìm được ô nhận nào (Registry khai cạnh trỏ vào
     * một biến không có) thì lùi về tên công thức và bỏ dòng vai, thay vì in "dùng cho" rỗng.
     */
    const nhan = noiNhan.get(step.formulaId) ?? [];
    const tenSo =
      nhan.length === 0
        ? pick(spec.name)
        : [...new Set(nhan.map((n) => pick(n.variable.label)))].join(', ');
    const dungCho = [...new Set(nhan.map((n) => pick(n.formula.name)))].join(', ');

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
          <span className={styles.stepText}>
            <span className={styles.stepName}>{tenSo}</span>
            {nhan.length > 0 && (
              <span className={styles.stepRole}>
                {`${t('chain.resultOf')} ${pick(spec.name)}, ${t('chain.usedFor')} ${dungCho}`}
              </span>
            )}
          </span>
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

  /**
   * Thẻ của mọi bước CẤP SỐ LIỆU, theo thứ tự topo.
   *
   * Không có thẻ cho bước đứng sau: nửa "Bước sau" đã bỏ 16/09/2026 — xem docblock đầu file.
   * `chainFor()` nay cũng dừng ở tổ tiên, nên thực tế `currentIndex` luôn là bước cuối; lát cắt
   * này giữ nguyên để component không phụ thuộc vào điều đó.
   */
  const truoc = chain.steps.slice(0, currentIndex).map((_step, index) => theBuoc(index));

  /**
   * Hai cột thẻ bước ở khổ rộng. Cột không có thẻ nào thì không dựng, để một thẻ lẻ loi không kéo
   * theo một cột rỗng.
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
  function haiCot(cot: ReadonlyArray<{ key: string; cards: ReadonlyArray<ReactNode> }>) {
    const coThe = cot.filter((c) => c.cards.length > 0);
    const canBang = coThe.length === 2 && coThe[0]?.cards.length === coThe[1]?.cards.length;

    return (
      <div className={canBang ? `${styles.columns} ${styles.columnsEven}` : styles.columns}>
        {coThe.map((c) => (
          <div key={c.key} className={styles.column}>
            {c.cards}
          </div>
        ))}
      </div>
    );
  }

  /**
   * Bố cục hai cột của các thẻ bước, theo yêu cầu của chủ dự án ngày 10/09/2026 trên trang
   * `gia-tri-noi-tai-fcff`: _"ở màn web đang quá rộng… chẵn thì chia ra 2 cột lần lượt, lẻ thì cột
   * trái nhiều hơn cột phải 1"_. Đo ở 1500px: một thẻ trải 1357px, thanh trượt bên trong dài cả
   * màn. `Math.ceil(n / 2)` cho cột trái làm đúng cả hai ca.
   *
   * Luật "hai nhóm thì mỗi nhóm một cột" của bản trước đã hết đất dùng cùng nửa "Bước sau": nay
   * chỉ còn MỘT nhóm thẻ, luôn cắt đôi.
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
   * khổ hẹp hai cột chồng lên nhau thành đúng một danh sách như cũ, và trình đọc màn hình cùng
   * phím Tab đi theo mạch tính từ trên xuống.
   */
  function bocNhom(): ReactNode {
    if (truoc.length === 0) return null;

    const nuaTrai = Math.ceil(truoc.length / 2);
    return haiCot([
      { key: 'trai', cards: truoc.slice(0, nuaTrai) },
      { key: 'phai', cards: truoc.slice(nuaTrai) },
    ]);
  }

  return (
    <section className={styles.wrap} aria-labelledby="khoi-chuoi">
      {/*
        Tiêu đề khối nói thẳng các thẻ dưới nó là gì, nên không còn tiêu đề nhóm và cũng không
        còn dòng dẫn nào — xem docblock đầu file: ba bản dòng dẫn đã viết đều là để giải thích
        một hình vẽ nay không còn.
      */}
      <h2 className={styles.title} id="khoi-chuoi">
        {t('chain.title')}
      </h2>
      {bocNhom()}
    </section>
  );
}
