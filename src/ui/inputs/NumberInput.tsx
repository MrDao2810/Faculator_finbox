'use client';

import { useRef, useState, type ReactNode } from 'react';

import {
  INPUT_MAX_DECIMALS,
  commitValue,
  draftViNumber,
  englishNumberToVi,
  formatNumber,
  keepViNumberChars,
  parseViNumber,
  resolveInputState,
  unitLabel,
} from '@/application';
import type { InputState, Level, VariableSpec } from '@/application';
import { useT, usePick, usePreferences } from '@/application/preferences-context';
import { Input, type InputTone } from '@/ui/primitives';

import {
  filterTypedValue,
  guardFilteredDelete,
  rejectTypedValue,
  resetFilteredDelete,
} from './filtered-change';
import { cauLoiMien, cauSoAm, coDauTru, dayLenDuoc, khongNhanSoAm } from './mien-nhap';

export interface NumberInputProps {
  spec: VariableSpec;
  /** Giá trị hiện tại. Component không tự giữ state — màn hình mới là nơi giữ. */
  value: number;
  /**
   * Gọi mỗi khi giá trị đọc được từ ô thay đổi.
   *
   * Hai thời điểm, và chúng khác nhau ở chỗ có KẸP hay không:
   *
   * - **Từng phím gõ**, với giá trị thô chưa kẹp — để khối Kết quả đổi theo ngay trong lúc gõ.
   *   Gõ dở thành chuỗi chưa ra số (`''`, `'-'`, `'1,'`) thì KHÔNG gọi: giữ nguyên giá trị cũ còn
   *   hơn đẩy `null` hay `NaN` lên (FR-06).
   * - **Lúc chốt** (rời ô hoặc Enter), với giá trị đã kẹp về miền hợp lệ qua `commitValue()`.
   */
  onChange: (value: number) => void;
  /** Chế độ hiển thị hiện tại — quyết định ô có bị khoá không (FR-09). */
  mode?: Level;
  /** Tên công thức thượng nguồn nếu ô đang nhận giá trị tự động, ví dụ 'CAPM'. */
  derivedFrom?: string;
  /** Thay hẳn dòng phụ `↳ <nguồn>` bằng câu tự nói được nghĩa — xem `InputStateArgs`. */
  derivedNote?: string;
  /**
   * Ô bị khoá vì lý do NGOÀI chế độ hiển thị, kèm dòng phụ nói lý do ('AAA không có').
   *
   * Chuyền thẳng xuống `resolveInputState()`, nơi WF-16 đã có sẵn trạng thái `locked` — nên ô
   * này dùng đúng nền chìm, đúng `readOnly`, đúng `aria-readonly` như ô khoá theo chế độ. Không
   * dựng kiểu khoá thứ hai: hai kiểu khoá trông khác nhau là hai thứ người dùng phải học.
   */
  lockedNote?: string;
  /** Ẩn nhãn khi ô nằm trong bảng đã có tiêu đề cột. */
  hideLabel?: boolean;
  /** Bản thu gọn cho ô nhỏ của khối gộp — chuyền thẳng xuống primitive, xem `InputProps.compact`. */
  compact?: boolean;
  /** Con dấu nguồn của giá trị, chỉ hiện ở ô nhỏ — xem `InputProps.sourceMark`. */
  sourceMark?: ReactNode;
  /**
   * Câu điều kiện CỦA CÔNG THỨC mà con số trong ô đang vi phạm ("Giá bán phải lớn hơn Biến phí một
   * sản phẩm.") — lấy từ `CalcWarning.field` của kết quả (18/11/2026). Đi đường `error` như lỗi miền:
   * viền đỏ, dòng đỏ, `role="alert"`. Lỗi miền của chính ô và dấu trừ vừa bị chặn đứng trước nó,
   * vì con số ngoài miền chưa hề đi lên tới `calc`.
   */
  conditionError?: string;
  className?: string;
}

/** Ánh xạ trạng thái WF-16 sang sắc thái sẵn có của primitive Input. */
const TONE_BY_STATE: Readonly<Record<InputState, InputTone>> = {
  default: 'default',
  // 'editing' không cần tone riêng: primitive đã vẽ vòng focus bằng :focus-within.
  editing: 'default',
  derived: 'derived',
  outOfRange: 'invalid',
  locked: 'locked',
};

/**
 * Ô số — gói WBS 2.3.1.
 *
 * WF-16 chốt đúng năm trạng thái; bảng chuyển trạng thái nằm ở `resolveInputState()` tầng
 * Domain nên test được bằng Node, ở đây chỉ là phần vẽ.
 *
 * Năm điều dễ làm sai, đã xử ở đây:
 *
 * 1. **Không kẹp giá trị trong lúc gõ, nhưng số ngoài miền không đi lên màn.** Gõ 150 vào ô tối
 *    đa 100 thì ô hiện '150' kèm dòng đỏ "Số liệu lớn nhất là 100.", chứ không tự nhảy về 100
 *    giữa chừng — sửa giá trị dưới tay người đang gõ là cách nhanh nhất làm họ mất phương hướng.
 *    Kẹp chỉ xảy ra lúc chốt (rời ô, Enter, Enter của bàn phím ảo), qua `commitValue()`.
 *
 *    Mỗi phím gõ TRONG miền vẫn đẩy lên ngay (bản đầu chỉ gọi `onChange` lúc rời ô, trông y như
 *    màn bị treo). Từ 16/11/2026 số NGOÀI miền thì không: trước đó gõ -10000000 vào "Số tiền gốc
 *    (P)" là khối Kết quả in -22.196.402,35 ₫ — chủ dự án chụp màn báo lỗi. Ô có min ≥ 0 còn chặt
 *    hơn: dấu trừ không vào ô được (`rejectTypedValue`), dán '-100' bị từ chối nguyên chuỗi chứ
 *    không bóc thành '100', và dòng đỏ ghi "Số liệu không được âm." (`mien-nhap.ts`).
 * 2. **Ô giữ chuỗi thô khi đang gõ, giữ chuỗi đã định dạng khi rời ra.** Nếu định dạng ngay
 *    từng phím thì gõ '92000' sẽ bị chèn dấu chấm giữa chừng và con trỏ nhảy lung tung.
 * 3. **Dòng phụ đi qua `hint`/`error` của primitive** chứ không tự vẽ thẻ riêng — nhờ vậy nó
 *    được nối sẵn vào `aria-describedby`, và lỗi miền có `role="alert"`. Tự vẽ song song thì
 *    trình đọc màn hình sẽ không đọc được dòng đó.
 * 4. **Chữ cái không bao giờ xuất hiện trong ô.** Chặn ở `onChange` qua `keepViNumberChars()`,
 *    không phải bằng `type` — xem bình luận ở thuộc tính `type` bên dưới. Chỉ chặn KÝ TỰ; việc
 *    chuỗi ấy có phải một con số không thì vẫn là của `parseViNumber()`, y như trước.
 * 5. **Chạm vào ô mà không gõ thì KHÔNG có gì xảy ra cả** — không đổi chữ số đang hiện, không
 *    chốt giá trị. Hai vế, và cả hai đều là lỗi thật chủ dự án chụp màn ngày 29/09/2026:
 *
 *    · Vế hiển thị: `onFocus` từng dựng lại chuỗi bằng `rawViNumber(value)`, tức đủ độ chính
 *      xác của con số, trong khi lúc nghỉ ô chỉ hiện bốn chữ số thập phân. Ô "Suất sinh lời yêu
 *      cầu (r)" nhận 12,33291875 từ CAPM nên nghỉ thì hiện '12,3329', chạm vào thì nhảy thành
 *      '12,33291875'. Nay đi qua `draftViNumber()`, vốn lấy chính chuỗi trên màn rồi bỏ dấu
 *      ngăn nghìn — hai bên không thể lệch nhau vì chỉ có một chuỗi.
 *    · Vế giá trị: `onBlur` từng chốt vô điều kiện. Ghép với vế trên sau khi sửa, nó còn tệ hơn
 *      cũ — chạm vào ô rồi bấm ra chỗ khác sẽ ghi đè 12,33291875 bằng 12,3329 thật. Nên hai vế
 *      phải đi CÙNG NHAU; sửa một vế mà quên vế kia là biến một lỗi nhìn thấy được thành một
 *      lỗi mất số liệu âm thầm.
 *
 *    Ai đọc tới đây mà định bỏ cờ `edited`: nó không chỉ giữ con số. `LinkedInput` hiểu mọi lượt
 *    `onChange` là "người dùng ghi đè", nên không có cờ này thì chỉ nhìn một ô cũng đủ cắt nó
 *    khỏi công thức thượng nguồn.
 *
 * Không cần CSS Module: mọi khác biệt về hình đã nằm ở bốn sắc thái của primitive
 * (viền đứt cho ô nhận tự động, nền chìm cho ô khoá, viền đỏ cho ngoài miền).
 */
export function NumberInput({
  spec,
  value,
  onChange,
  mode = 'advanced',
  derivedFrom,
  derivedNote,
  lockedNote,
  hideLabel = false,
  compact = false,
  sourceMark,
  conditionError,
  className,
}: NumberInputProps) {
  const [focused, setFocused] = useState(false);
  /** Chuỗi thô trong lúc gõ. `null` nghĩa là đang hiện bản đã định dạng của `value`. */
  const [draft, setDraft] = useState<string | null>(null);
  /**
   * Người dùng đã GÕ gì vào ô kể từ lúc chạm vào nó chưa — xem quy tắc 5 ở docblock.
   *
   * `ref` chứ không `state`: không dòng nào trên màn đọc cờ này, nên đổi nó mà dựng lại cả ô là
   * dựng thừa. Đặt lại ở `onFocus` chứ không ở `onBlur`, để mỗi lần chạm vào ô là một lượt mới.
   */
  const edited = useRef(false);
  /**
   * Vừa có một lượt gõ hay dán mang dấu trừ bị chặn (ô có min ≥ 0) — giữ dòng "Số liệu không được
   * âm." trên màn tới lượt gõ hợp lệ kế tiếp hoặc tới lúc rời ô. Ô không đổi chữ số nào nên không có
   * giá trị nào khác để suy ra lỗi này.
   */
  const [chanAm, setChanAm] = useState(false);
  const t = useT();
  const pick = usePick();
  const { locale } = usePreferences();

  const raw = draft ?? formatNumber(value, { maxDecimals: INPUT_MAX_DECIMALS });
  /*
   * Chuỗi đem ĐỌC, không phải chuỗi đem HIỆN. Ở EN, `92,000` hay `1,500.5` đổi về lối Việt trước
   * khi đọc (`englishNumberToVi()`), còn ô vẫn giữ y nguyên thứ người dùng gõ — quy tắc 1 và 2 ở
   * docblock. Ba chỗ đọc chuỗi (trạng thái ô, từng phím, lúc chốt) đều đi qua đây.
   */
  const docDuoc = (text: string): string =>
    locale === 'en' ? englishNumberToVi(text, spec.unit) : text;
  const {
    state,
    note,
    value: soDangGo,
  } = resolveInputState({
    raw: docDuoc(raw),
    spec,
    focused,
    derivedFrom,
    derivedNote,
    mode,
    lockedNote,
  });

  const locked = state === 'locked';
  /*
   * Hai kiểu khoá, hai mức chặn khác nhau — và khác nhau là ĐÚNG, không phải thiếu nhất quán.
   *
   * · Khoá theo chế độ (FR-09): `readOnly`. Người dùng MỞ ĐƯỢC ngay tại chỗ — bật Nâng cao là
   *   gõ được — nên ô phải còn nhận tiêu điểm để bàn phím tới được và đọc được lời chỉ đường.
   * · Khoá theo mã: `disabled`. Ở đây không có gì để mở tại chỗ, và chủ dự án báo đúng triệu
   *   chứng: *"bên trên không thể nhập liệu thì … không cho bấm vào được ô đó mà hiện tại vẫn
   *   đang cho bấm vào được"*. `readOnly` vẫn nhận con trỏ nháy — mời gõ rồi nuốt mọi phím,
   *   tức là mời một thao tác rồi từ chối nó, đúng thứ đợt này đang dọn.
   */
  const lockedByTicker = locked && lockedNote !== undefined && lockedNote.trim() !== '';

  /*
   * `spec.description` CỐ Ý không hiện ở đây, dù ô nhập có chỗ cho nó.
   *
   * Cùng một câu mô tả biến đang hiện ở bảng biến ngay dưới cùng màn, nên để cả hai chỗ là đọc
   * hai lần một nội dung — đúng điều buổi test nội bộ phản ánh ("nhiều công thức đang bị hiển thị
   * lại phần giải thích tại mục Số liệu"). Bảng biến giữ vai trò tra nghĩa đầy đủ; khối Số liệu
   * chỉ giữ những dòng phụ THEO TRẠNG THÁI (`note`: ô đang khoá, ô nhận số từ công thức khác, ô
   * mang số của một mã) — thứ bảng biến không có.
   */
  // Ngoài miền là lỗi thật sự nên đi đường `error` (có role="alert"); các dòng phụ khác
  // chỉ là thông tin nên đi đường `hint`.
  const donVi = pick(unitLabel(spec.unit));
  /* Câu gọi đúng tên ô: "Số tiền vay lớn hơn 0." (`mien-nhap.ts`). */
  const nhanCau = { ten: pick(spec.label), donVi };
  const error =
    !locked && chanAm
      ? cauSoAm(spec, t, nhanCau)
      : state === 'outOfRange'
        ? (cauLoiMien(soDangGo, spec, t, nhanCau) ?? note)
        : conditionError !== undefined && conditionError !== ''
          ? conditionError
          : undefined;
  /*
   * Ô khoá theo chế độ: Domain trả dòng phụ `'nâng cao'` viết cứng (CON-02 cấm `src/core` đọc
   * i18n), nên ở đây thay bằng khoá dịch — cùng khoá `SliderInput`, `Toggle`, `RadioGroup` đang
   * dùng. Thiếu nó thì ở EN chế độ Cơ bản ô số khoá vẫn ghi "nâng cao".
   */
  const hint =
    error !== undefined || state === 'outOfRange'
      ? undefined
      : locked && !lockedByTicker
        ? t('input.lockedBadge')
        : note;

  return (
    <Input
      className={className}
      label={pick(spec.label)}
      hideLabel={hideLabel}
      compact={compact}
      sourceMark={sourceMark}
      // `Input` là primitive nhận chuỗi đã sẵn sàng hiển thị, nên đơn vị dịch ở đây.
      unit={donVi}
      tone={error !== undefined ? 'invalid' : TONE_BY_STATE[state]}
      hint={hint}
      error={error}
      // Bàn phím số trên điện thoại — WF-03 ghi 'bàn phím số · HW-02'.
      inputMode="decimal"
      // Không dùng type="number": nó chặn dấu phẩy thập phân kiểu Việt Nam, và nút tăng/giảm
      // mặc định của trình duyệt không đủ vùng chạm 44px. Việc chặn chữ cái mà `type="number"`
      // hay được dùng để làm thì `onChange` bên dưới lo, không mất gì.
      type="text"
      autoComplete="off"
      value={raw}
      readOnly={locked && !lockedByTicker}
      aria-readonly={(locked && !lockedByTicker) || undefined}
      disabled={lockedByTicker}
      title={locked && !lockedByTicker ? t('input.lockedHint') : undefined}
      onFocus={() => {
        setFocused(true);
        edited.current = false;
        /* Vào ô thì bỏ dấu ngăn nghìn cho dễ sửa: '92.000' thành '92000' — nhưng giữ NGUYÊN
           những chữ số đang hiện. `draftViNumber()` lấy chính chuỗi trên màn rồi bỏ dấu chấm,
           nên con số không nhảy khi người dùng chạm vào ô; lý do đầy đủ ở chính hàm ấy. */
        setDraft(draftViNumber(value));
      }}
      onChange={(event) => {
        /* Chữ cái rụng ngay tại đây, con trỏ giữ nguyên chỗ — quy tắc 4 ở docblock. */
        const loc = filterTypedValue(event, keepViNumberChars);
        /*
         * Ô không nhận số âm: lượt gõ hay dán có dấu trừ bị từ chối NGUYÊN, ô giữ chuỗi cũ và nói
         * vì sao. Không bóc dấu trừ ra rồi giữ phần số — dán '-100' thành '100' là đổi dấu âm thầm.
         */
        const biChan = khongNhanSoAm(spec) && coDauTru(loc);
        const next = biChan ? rejectTypedValue(event, raw) : loc;
        if (biChan) setChanAm(true);
        else if (next !== raw) setChanAm(false);
        /*
         * Chỉ tính là ĐÃ GÕ khi chuỗi thật sự đổi — không phải mỗi lần sự kiện `onChange` nổ ra.
         *
         * Một ký tự bị lọc sạch (chữ cái, hay dấu Backspace tự động của bộ gõ tiếng Việt khi ghép
         * dấu) khiến `filterTypedValue()` trả về đúng `raw` — ký tự gõ vào và ký tự bị loại triệt
         * tiêu nhau, ô không đổi một chữ số nào. Đặt `edited` vô điều kiện ở đây thì gõ một phím
         * KHÔNG LỌT vẫn bị coi là "đã sửa", và với `LinkedInput` thì chỉ một chữ gõ nhầm rồi rời ô
         * là đủ cắt đứt liên kết CAPM — lỗi thật, không phải giả định.
         */
        if (next !== raw) edited.current = true;
        setDraft(next);

        /*
         * Đẩy lên NGAY, không đợi rời ô — đây là thứ làm khối Kết quả sống theo tay gõ.
         *
         * `null` là chuỗi chưa ra số: ô vừa bị xoá trắng, mới gõ mỗi dấu trừ, hay đang dở
         * '1,'. Những lúc ấy giữ nguyên giá trị cũ, vì đẩy lên `null` thì phải quy nó thành 0
         * hoặc NaN — cả hai đều là thứ FR-06 cấm. Rời ô thì `commitValue()` lo nốt: trống
         * thì về `defaultValue` của chính biến đó.
         *
         * `parsed !== value` là cửa THỨ HAI, thiếu tới lúc rà lại đợt sửa 29/09/2026 — chỉ có ở
         * `InlineNumber` chứ không có ở đây. Thiếu nó thì đúng lượt gõ chữ cái bị lọc sạch mà cửa
         * `edited` ở trên vừa chặn lại LỌT QUA NGAY ĐƯỜNG NÀY: chuỗi không đổi nên `parsed` vẫn
         * bằng con số cũ, mà cửa cũ chỉ hỏi "có ra số không" chứ không hỏi "số có đổi không", nên
         * `onChange` vẫn nổ ngay TRONG lúc gõ — không cần đợi tới `onBlur` mà cờ `edited` canh.
         * Với ô nhập tay bình thường cửa này vô hại: `value` là con số đã đẩy ở phím trước, nên
         * mọi phím gõ thật đều cho ra số khác nó.
         */
        const parsed = parseViNumber(docDuoc(next));
        /* Ngoài miền thì không đẩy lên — quy tắc 1: khối Kết quả không được tính bằng số sai. */
        if (parsed !== null && parsed !== value && dayLenDuoc(parsed, spec)) onChange(parsed);
      }}
      onBlur={(event) => {
        resetFilteredDelete(event.currentTarget);
        setFocused(false);
        setDraft(null);
        setChanAm(false);
        /*
         * Chỉ chốt khi người dùng THẬT SỰ có gõ — quy tắc 5 ở docblock.
         *
         * Bản trước chốt vô điều kiện, nên chạm vào ô rồi bấm ra chỗ khác vẫn là một lượt
         * `onChange`. Với ô nhập thường thì vô hại (chốt lại đúng con số cũ), nhưng `LinkedInput`
         * đọc mọi lượt `onChange` là "người dùng ghi đè", nên chỉ NHÌN một ô đang nhận số từ
         * CAPM cũng đủ cắt đứt nó khỏi CAPM — dán nhãn "đã nhập tay" lên một con số không ai gõ.
         */
        if (edited.current) onChange(commitValue(docDuoc(raw), spec));
      }}
      onKeyDown={(event) => {
        /* Bù phím xoá cho ký tự vừa bị loại — bắt buộc đi kèm cửa lọc, xem docblock của nó. */
        guardFilteredDelete(event);
        if (event.key !== 'Enter') return;
        event.preventDefault();
        event.currentTarget.blur();
      }}
    />
  );
}
