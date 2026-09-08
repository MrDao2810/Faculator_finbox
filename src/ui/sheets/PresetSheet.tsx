'use client';

import type { FormulaSpec, Preset, PresetPick } from '@/application';
import { useT, usePick } from '@/application/preferences-context';
import { Badge, BottomSheet, Button } from '@/ui/primitives';

import { useCalcText, useValueText } from '../i18n/units';
import styles from './PresetSheet.module.css';

export interface PresetSheetProps {
  open: boolean;
  onClose: () => void;
  /** Gọi khi người dùng bấm Nạp ở một mã. Sheet tự đóng sau đó. */
  onLoad: (preset: Preset) => void;
  /**
   * Bốn mã đã chọn cho CÔNG THỨC ĐANG XEM, kèm kết quả của từng mã — xem `pickPresetsFor()`.
   *
   * Sheet không tự chọn: phép chọn phải chạy thật công thức với từng mã trong kho, tức cần
   * `FormulaModule` (spec + hàm tính), thứ chỉ màn chi tiết mới cầm. Tầng UI nhận kết quả đã tính
   * và chỉ lo bày ra.
   */
  picks: ReadonlyArray<PresetPick>;
  /**
   * Công thức đang xem — cần `variables` để gọi đúng tên và đơn vị của từng con số.
   *
   * `undefined` khi sheet mở ra mà KHÔNG có công thức nào: màn bảng dữ liệu (WF-05) dùng sheet
   * này để lấy một chuỗi phiên giá vào bảng. Ở đó không có gì để xếp hạng và cũng không có câu
   * dẫn nào đúng, nên sheet lùi về đúng hình dạng cũ — mã, tên, dòng nguồn.
   */
  spec?: FormulaSpec;
  /**
   * Công thức này có ăn chuỗi phiên giá hay không.
   *
   * Quyết định câu dẫn ở đầu sheet khi KHÔNG xếp hạng được: "chỉ dùng chuỗi giá" và "không dùng
   * số liệu của mã nào" là hai chuyện khác hẳn nhau, mà từ `picks` không phân biệt được — cả hai
   * đều cho `filled` rỗng.
   */
  wantsSeries?: boolean;
  /**
   * Mở sheet chọn mã toàn thị trường (`TickerPickerSheet`).
   *
   * Tuỳ chọn: nơi nào không có đường sang thì bỏ, sheet vẫn dùng được như cũ. Màn chi tiết
   * công thức thì luôn truyền — xem docblock ngay dưới.
   */
  onBrowseMarket?: () => void;
}

/** Số ô nhiều nhất kể ra ở một dòng. Quá ba thì dòng dài hơn khung điện thoại và mất tác dụng. */
const MAX_FIELDS_SHOWN = 3;

/**
 * Nhãn biến rút về phần TÊN, bỏ phần giải nghĩa sau gạch ngang.
 *
 * Registry đặt nhãn theo khuôn `'EPS — lợi nhuận trên mỗi cổ phiếu'`: vế sau là lời giải thích,
 * đúng chỗ ở bảng biến và cạnh ô nhập, nhưng ở đây nó chiếm hai dòng để nói một điều người dùng
 * đang không hỏi. Nhãn không có gạch ngang thì giữ nguyên xi.
 */
function tenNgan(label: string): string {
  return label.split(/\s+[—–]\s+/)[0] ?? label;
}

/**
 * Sheet nạp bộ số liệu mẫu — gói WBS 2.5.1, màn WF-10.
 *
 * FR-10: "nạp bộ số liệu mẫu có thật theo mã; sau khi nạp vẫn sửa được từng ô." Câu sau mới
 * là phần quan trọng: preset chỉ điền giá trị khởi đầu, không khoá ô nào lại. Component này
 * chỉ bắn `onLoad`, còn màn hình quyết định điền vào đâu — nên không có cách nào nó vô tình
 * khoá ô của người dùng.
 *
 * Số liệu đi qua `DataProvider` (FR-17).
 *
 * ── Vì sao mỗi dòng nói SỐ của mã, không nói NGUỒN ──────────────────────────────────────────
 *
 * Bản trước in `preset.meta` dưới mỗi mã, tức chuỗi `BCTC Q2/2026 · 248 phiên giá`. Chuỗi đó
 * dựng từ kỳ báo cáo và một hằng số, mà mọi mã lấy cùng một lượt nên cùng một kỳ — nghĩa là nó
 * **không thể khác nhau giữa các dòng**. Chủ dự án báo đúng triệu chứng: "4 mẫu ví dụ đang bị
 * trùng thông số". Số bên dưới thì khác nhau hẳn (EPS 5.867 / 2.750 / 5.246 / 6.667 ₫), chỉ là
 * không con số nào lọt lên màn — sheet đang mô tả CÁI NGUỒN thay vì mô tả CÁI MẪU.
 *
 * Nay mỗi dòng in đúng những ô mã ấy điền được cho công thức đang xem, rồi in kết quả. Bốn dòng
 * hết trùng nhau vì chúng thật sự khác nhau, và người dùng chọn mã theo thứ họ sắp thấy chứ
 * không theo tên doanh nghiệp.
 *
 * ── Vì sao KHÔNG còn ô tìm ở đây ────────────────────────────────────────────────────────────
 *
 * Sản phẩm có HAI kho mã, và sheet này chỉ là kho nhỏ:
 *
 * | | sheet này (`DataProvider`) | `TickerPickerSheet` (`MarketFeed`) |
 * | Số mã | kho mẫu 24 mã, bày 4 mã hợp công thức | ~1.649 mã đang giao dịch |
 * | Chuỗi giá | 248 phiên OHLCV | ĐÚNG 1 phiên (`live-preset.ts`) |
 *
 * Bản trước có ô tìm cho đúng 4 dòng. Chủ dự án báo đúng mâu thuẫn mà nó tạo ra: gõ một mã
 * bất kỳ ngoài bốn mã ấy thì ra "không có mã nào khớp" — người dùng kết luận sản phẩm không
 * biết mã đó — rồi ngay sau khi nạp, thanh mã dưới tiêu đề lại mời "Đổi mã" và mở ra cả
 * 1.649 mã. Ô tìm hứa một kho mã mà kho ở đây chỉ có bốn.
 *
 * Nên: bỏ ô tìm (bốn dòng thì không có gì để tìm), nói thẳng đây là bộ mẫu và điểm mạnh
 * riêng của nó là CHUỖI PHIÊN GIÁ, rồi đặt ngay lối sang kho lớn. Một cửa vào, hai nhánh
 * gọi đúng tên mình.
 *
 * Bỏ ô tìm cũng gỡ luôn phần ghim chiều cao vùng kết quả bằng `getBoundingClientRect()`:
 * nó chỉ tồn tại vì lọc làm danh sách ngắn lại giữa lúc người dùng đang gõ, mà giờ danh
 * sách không co nữa.
 */
export function PresetSheet({
  open,
  onClose,
  onLoad,
  picks,
  spec,
  wantsSeries = false,
  onBrowseMarket,
}: PresetSheetProps) {
  const t = useT();
  const pick = usePick();
  const calcText = useCalcText();
  const valueText = useValueText();

  /* Cảnh báo bản thảo xét trên CẢ BỘ: nó nói về nguồn dữ liệu, không về mấy dòng đang hiện. */
  const anyDraft = picks.some((item) => item.preset.isDraft);

  /*
   * Nhãn bản thảo trên TỪNG DÒNG chỉ có nghĩa khi các dòng khác nhau ở điểm đó.
   *
   * Cả bộ mẫu đều `isDraft` nên dán nhãn lên bốn dòng là in cùng một chuỗi bốn lần, ngay dưới một
   * khối vàng vừa nói đúng điều ấy dài hơn — tức dựng lại đúng cái vẻ trùng lặp mà đợt này gỡ đi.
   * Giữ nhánh chứ không xoá hẳn: sheet còn nhận preset lấy lúc chạy (`isDraft: false`), và lúc bộ
   * mã trộn hai loại thì nhãn mới là thứ phân biệt.
   */
  const mixedDraft = anyDraft && picks.some((item) => !item.preset.isDraft);

  /*
   * Có xếp hạng hay không quyết định cả câu dẫn lẫn việc in kết quả.
   *
   * Xếp hạng chỉ chạy khi số liệu của mã thật sự đi vào công thức. Không có thì bốn dòng cho ra
   * đúng một con số, và in nó bốn lần là dựng lại đúng cái vẻ trùng lặp vừa gỡ đi.
   */
  const ranked = picks.some((item) => item.filled.length > 0);

  /**
   * Dòng phụ khi mã KHÔNG điền được ô nào — ba ca, ba câu trả lời khác nhau.
   *
   * Đây là chỗ dòng `preset.meta` (`BCTC <kỳ> · 248 phiên giá`) từng đứng cho mọi ca, và là đúng
   * chuỗi trùng lặp mà đợt này gỡ. Nó chỉ còn ở ca không có công thức nào, vì ở đó nguồn dữ liệu
   * thật sự là điều duy nhất đáng nói.
   */
  function dongPhu(preset: Preset): string | null {
    if (spec === undefined) return preset.meta;

    if (wantsSeries) {
      // Công thức ăn chuỗi: thứ khác nhau giữa các mã là MỨC GIÁ, nên nói ra mức giá.
      const cuoi = preset.bars[preset.bars.length - 1]?.close;
      if (cuoi === undefined) return null;
      return `${t('preset.lastPrice')} ${valueText(cuoi, '₫')} · ${valueText(preset.bars.length, 'phiên')}`;
    }

    /*
     * Mã không góp một con số nào vào công thức này. Câu dẫn ở đầu sheet đã nói rõ, nên in thêm
     * dòng nguồn ở đây chỉ là bốn dòng chữ y hệt nhau — tên và ngành phía trên đã đủ phân biệt.
     */
    return null;
  }

  /** Tên và đơn vị của một ô — tra từ spec, không đoán từ khoá. */
  function labelOf(key: string): { label: string; unit: string } {
    const variable = spec?.variables.find((item) => item.key === key);
    return {
      label: variable === undefined ? key : tenNgan(pick(variable.label)),
      unit: variable?.unit ?? '',
    };
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t('preset.title')}
      subtitle={t('preset.subtitle')}
    >
      {anyDraft && (
        <p className={styles.draft} role="note">
          <strong>{t('preset.draftTitle')}</strong> {t('preset.draftDetail')}
        </p>
      )}

      {/*
        Câu dẫn nói vì sao đúng bốn mã NÀY. Ba trạng thái, ba câu khác hẳn nhau — gộp lại thì
        câu chung phải mờ đến mức không nói được gì, mà đây đúng chỗ người dùng cần biết mình
        sắp nạp cái gì vào.
      */}
      {spec !== undefined && (
        <p className={styles.lead}>
          {ranked
            ? t('preset.rankedNote')
            : wantsSeries
              ? t('preset.seriesOnlyNote')
              : t('preset.noTickerNote')}
        </p>
      )}

      {/*
        `data-ma` trên mỗi dòng là chỗ bám ổn định cho ca kiểm và cho `check:chrome`. Cần vì thứ
        tự bốn dòng nay do CÔNG THỨC quyết, không đếm theo vị trí được nữa; còn dò mã bằng cách
        đọc chữ trong dòng thì vớ nhầm nhãn ô ("EPS" trông y hệt một mã ba chữ cái).
      */}
      <ul className={styles.list}>
        {picks.map(({ preset, output, filled }) => (
          <li key={preset.code} className={styles.item} data-ma={preset.code}>
            {/*
              Mã đứng riêng thành huy hiệu chữ đều: ở danh sách này người dùng dò theo MÃ
              chứ không theo tên doanh nghiệp, nên mã phải là thứ mắt bắt được trước. Chỉ
              có MỘT phần tử mang mã — nhân đôi thành huy hiệu + dòng chữ thì trình đọc màn
              hình đọc mã hai lần.
            */}
            <Badge tone="code">{preset.code}</Badge>

            <span className={styles.info}>
              <span className={styles.name}>
                {preset.name}
                {preset.industry !== undefined && (
                  <span className={styles.industry}> · {preset.industry}</span>
                )}
              </span>

              {/*
                Không điền được ô nào thì quay về dòng nguồn — nó vẫn đúng, chỉ là không phân
                biệt được các dòng với nhau; và ở đúng ca này thì các dòng KHÔNG khác nhau thật.
              */}
              <span className={styles.meta}>
                {filled.length === 0
                  ? dongPhu(preset)
                  : filled.slice(0, MAX_FIELDS_SHOWN).map(({ key, value }, index) => {
                      const { label, unit } = labelOf(key);
                      return (
                        /*
                          Mỗi ô là MỘT span `nowrap`: ghép thành một chuỗi dài thì đơn vị bị tách
                          xuống dòng riêng ("EPS 19.436" rồi "₫"), đo được ở khổ 390px.
                        */
                        <span key={key} className={styles.field}>
                          {index > 0 && ' · '}
                          {label} {valueText(value, unit)}
                        </span>
                      );
                    })}
                {mixedDraft && preset.isDraft && (
                  <span className={styles.draftTag}> · {t('preset.draftTag')}</span>
                )}
              </span>

              {ranked && (
                <span className={styles.result}>
                  {output.value === null ? (
                    <span className={styles.noResult}>{t('preset.cannotCompute')}</span>
                  ) : (
                    <>
                      <span aria-hidden="true">→ </span>
                      {calcText(output)}
                    </>
                  )}
                </span>
              )}
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onLoad(preset);
                onClose();
              }}
            >
              {t('preset.load')}
            </Button>
          </li>
        ))}
      </ul>

      {/*
        Lối sang kho mã lớn. Đặt DƯỚI danh sách chứ không thành ô tìm ở trên: bốn mã này là
        thứ dùng được ngay cho cả công thức chuỗi, còn kho lớn đổi lại độ phủ bằng chuỗi giá
        một phiên — nên nó là lối rẽ có điều kiện, không phải mặc định.
      */}
      {onBrowseMarket !== undefined && (
        <div className={styles.browse}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              onBrowseMarket();
            }}
          >
            {t('preset.browseMarket')}
          </Button>
          <p className={styles.browseNote}>{t('preset.browseMarketNote')}</p>
        </div>
      )}

      <p className={styles.footnote}>{t('preset.editableAfterLoad')}</p>
    </BottomSheet>
  );
}
