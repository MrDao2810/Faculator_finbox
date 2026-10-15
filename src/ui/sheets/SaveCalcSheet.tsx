'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { savedCalcsPath, suggestCalcNames } from '@/application';
import { useT } from '@/application/preferences-context';
import { BottomSheet, Button, Input } from '@/ui/primitives';

import styles from './SaveCalcSheet.module.css';

export interface SaveCalcSheetProps {
  open: boolean;
  onClose: () => void;
  /** Tên công thức đã chọn theo ngôn ngữ đang xem. */
  formulaName: string;
  /** Kết quả đã định dạng, ví dụ '12,3 lần'. */
  resultText: string;
  /** Mã cổ phiếu gắn kèm, nếu phép tính đến từ `?ma=` hoặc từ một bộ mẫu. */
  code?: string;
  /** Tên các phép tính đã lưu — dùng để né trùng và để báo lỗi khi gõ trùng tay. */
  existingNames: ReadonlyArray<string>;
  /** Kho đã đầy trần hay chưa. */
  full: boolean;
  /** Kết quả đang lỗi thì không cho lưu (xem docblock). */
  hasResult: boolean;
  /** Mốc lưu, mili giây kể từ epoch — màn truyền vào để gợi ý tên có ngày. */
  savedAt: number;
  /** Trả về `true` khi ghi thành công; `false` khi trình duyệt chặn localStorage. */
  onSave: (name: string) => boolean;
}

/** So tên không phân biệt hoa thường và khoảng trắng thừa — cùng luật `suggestCalcNames()`. */
function key(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Sheet "Lưu vào danh mục" — lối đi từ màn chi tiết công thức sang tab Công thức của WF-06.
 *
 * Trước sheet này, quan hệ giữa hai màn chỉ có MỘT chiều: tab Danh mục mở
 * `/cong-thuc/<id>/?ma=<MÃ>`, còn số liệu người dùng vừa nhập ở màn công thức thì không có chỗ
 * nào giữ lại — đóng trang là mọi ô về `defaultInputs(spec)`.
 *
 * Hai điều sheet này KHÔNG làm, và cả hai đều có lý do:
 *
 * · **Không lưu khi kết quả đang lỗi** (`hasResult === false`). Một con số sai nằm trong tab
 *   Danh mục còn nguy hơn nằm ở màn công thức: ngoài đó không có ô nhập nào để người dùng nhìn
 *   ra nguyên nhân, chỉ còn cái tên do chính họ đặt bảo chứng cho nó. Đúng thứ FR-06 chặn.
 *
 * · **Không tự đặt tên rồi lưu ngay.** Ba mươi mục tên 'P/E', 'P/E (1)', 'P/E (2)' thì vô dụng
 *   đúng bằng không lưu gì. Ô tên được ĐIỀN SẴN một cái tên ghép từ mã và tên công thức, đã né
 *   trùng — bấm Lưu ngay là được, mà cái tên vẫn là của họ vì sửa được tại chỗ.
 *
 * ── Hàng "Gợi ý tên" đã BỎ (13/10/2026) ─────────────────────────────────────────────────────
 *
 * Dưới ô tên từng có một hàng chip bày mọi cái tên `suggestCalcNames()` dựng ra (mã · tên, tên ·
 * kết quả, tên · ngày…), bấm chip nào là điền tên ấy. Chủ dự án: *"bỏ phần gợi ý tên khi lưu công
 * thức đi, để gọn gàng hơn"*. Sheet nay chỉ còn khối tóm tắt, một ô tên và nút Lưu.
 *
 * Thứ KHÔNG bỏ là việc điền sẵn gợi ý ĐẦU TIÊN vào ô, và nó không chỉ là tiện tay: tab Công thức
 * của màn Danh mục nhận ra "đây là tên tự sinh" bằng cách dựng lại chính `suggestCalcNames()`
 * (`displayCalcName()`), rồi mới quyết định ô tên in gì và dịch được hay không. Bỏ luôn việc điền
 * sẵn là mọi phép tính lưu về sau thành tên gõ tay, và người dùng phải gõ một cái tên cho mỗi lần
 * lưu. Một ca trong `SaveCalcSheet.test.tsx` ghim hàng chip KHÔNG còn; muốn dựng lại thì hỏi trước.
 */
export function SaveCalcSheet({
  open,
  onClose,
  formulaName,
  resultText,
  code,
  existingNames,
  full,
  hasResult,
  savedAt,
  onSave,
}: SaveCalcSheetProps) {
  const t = useT();

  const [name, setName] = useState('');
  /** Đã chạm vào ô tên chưa — chưa chạm thì không mắng người dùng vì một ô họ chưa gõ. */
  const [touched, setTouched] = useState(false);
  const [saved, setSaved] = useState(false);
  /** Giữ CỜ chứ không giữ câu lỗi đã dịch: đổi ngôn ngữ sẽ đóng băng bản dịch cũ (xem ExportSheet). */
  const [failed, setFailed] = useState(false);

  /** Cái tên điền sẵn vào ô — gợi ý ĐẦU TIÊN, đã né tên đang có. Xem docblock về hàng chip đã bỏ. */
  const suggestedName = useMemo(
    () =>
      suggestCalcNames({
        formulaName,
        ...(code === undefined || code === '' ? {} : { code }),
        ...(resultText === '' ? {} : { resultText }),
        savedAt,
        existing: existingNames,
      })[0] ?? '',
    [formulaName, code, resultText, savedAt, existingNames],
  );

  /*
   * Điền sẵn gợi ý đầu mỗi lần MỞ sheet, không phải mỗi lần render: gợi ý phụ thuộc `savedAt`
   * và kết quả, mà kết quả đổi theo từng phím gõ ở màn ngoài — nối thẳng vào state sẽ giật lại
   * cái tên người dùng đang sửa dở.
   */
  useEffect(() => {
    if (!open) return;
    setName(suggestedName);
    setTouched(false);
    setSaved(false);
    setFailed(false);
    // Cố ý chỉ phụ thuộc `open`: xem docblock ngay trên.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const trimmed = name.trim();
  const duplicate = existingNames.some((existing) => key(existing) === key(trimmed));

  /** Lý do chặn, xét theo thứ tự nặng dần: kho đầy và kết quả lỗi chặn từ trước khi gõ tên. */
  const blocked = ((): string | null => {
    if (!hasResult) return t('save.errNoResult');
    if (full) return t('save.errFull');
    if (trimmed === '') return touched ? t('save.errEmpty') : null;
    if (duplicate) return t('save.errDuplicate');
    return null;
  })();

  const canSave = hasResult && !full && trimmed !== '' && !duplicate;

  function submit(): void {
    setTouched(true);
    if (!canSave) return;

    if (onSave(trimmed)) {
      setSaved(true);
      setFailed(false);
    } else {
      setFailed(true);
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t('save.title')}
      // Không phụ đề, ô tên không dòng gợi ý — chủ dự án xoá cả hai câu 15/10/2026, xem `vi.ts`.
      // Chỉ một ô tên — ở khổ web tấm 720px là loãng, xem `BottomSheetProps.width`.
      width="narrow"
      footer={
        saved ? (
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('portfolio.formCancel')}
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={submit} disabled={!canSave}>
            {t('save.submit')}
          </Button>
        )
      }
    >
      {/*
        Tóm tắt thứ sắp được cất. Kết quả nằm ở đây chứ không chỉ ở màn ngoài: sheet che mất
        khối Kết quả, và người ta đặt tên theo con số họ vừa thấy.
      */}
      <div className={styles.summary}>
        <span className={styles.formula}>
          {code === undefined || code === '' ? formulaName : `${code} · ${formulaName}`}
        </span>
        <span className={styles.result}>{resultText}</span>
      </div>

      {saved ? (
        <p className={styles.done} role="status">
          {t('save.done')}{' '}
          {/*
            Màn chi tiết đã tự chuyển sang Danh mục ngay sau khi ghi (xem `saveCalc()` ở
            `FormulaDetail`), nên link này chỉ hiện trong nhịp chuyển trang. Vẫn giữ: nó là đường
            đi tay khi điều hướng chậm, và nó từng trỏ vào `?tab=cong-thuc` — một tab đã bỏ — nên
            nay trỏ đúng neo của khối "Phép tính đã lưu".
          */}
          <Link className={styles.link} href={savedCalcsPath()}>
            {t('save.goToPortfolio')}
          </Link>
        </p>
      ) : (
        <>
          <Input
            label={t('save.nameLabel')}
            className={styles.nameField}
            value={name}
            maxLength={60}
            disabled={!hasResult || full}
            {...(blocked === null ? {} : { error: blocked })}
            onChange={(event) => {
              setName(event.target.value);
              setTouched(true);
            }}
          />

          {failed && (
            <p className={styles.failed} role="alert">
              {t('save.failed')}
            </p>
          )}
        </>
      )}
    </BottomSheet>
  );
}
