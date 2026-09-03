'use client';

import { useMemo, useState } from 'react';

import { FORMULA_SUMMARIES, LIVE_PRESET_FORMULAS, scoreFormula, tokenize } from '@/application';
import type { Level } from '@/application';
import { usePick, useT } from '@/application/preferences-context';
import { BottomSheet } from '@/ui/primitives';

import styles from './FormulaForTickerSheet.module.css';

/**
 * Thứ tự hai nhóm, ghim bằng hằng chứ không suy ra từ thứ tự xuất hiện trong dữ liệu.
 *
 * `LIVE_PRESET_FORMULAS` xếp theo tỷ lệ ô điền được giảm dần, nên nhóm nào đứng trước là chuyện
 * tình cờ của dữ liệu. Chỉ cần một công thức nâng cao đổi `filled/total` là nhóm Nâng cao nhảy lên
 * đầu — một thay đổi số liệu không được phép đảo trật tự sư phạm "dễ trước, khó sau" của màn.
 */
const LEVELS: ReadonlyArray<Level> = ['basic', 'advanced'];

export interface FormulaForTickerSheetProps {
  open: boolean;
  onClose: () => void;
  /**
   * Nhận id công thức người dùng chọn. Sheet tự đóng sau đó.
   *
   * Sheet là bộ CHỌN, không phải một danh sách link. Bản trước mỗi dòng là `<Link>` đi thẳng tới
   * `/cong-thuc/<id>?ma=<mã>`, đúng khi nó được mở từ một mã đã nằm sẵn trong danh mục. Từ đợt gộp
   * luồng thêm mã, nó mở từ giữa form nhập — lúc ấy mã CHƯA được lưu, nên đi thẳng là bỏ rơi
   * những gì người dùng vừa gõ. Nay nó trả lại lựa chọn cho form, và chính form lưu xong mới điều
   * hướng.
   */
  onPick: (id: string) => void;
  /** Mã đang chọn. `null` khi chưa chọn mã nào. */
  code: string | null;
  /**
   * Mã này có tra được thị giá hay không.
   *
   * `false` thì 15 trên 31 công thức điền hụt đúng một ô, và 8 công thức không điền được ô nào —
   * xem `LivePresetFormula.priceFields`. Không truyền thì mặc định `true`, đúng ca thường gặp.
   */
  hasPrice?: boolean;
}

/**
 * Sheet "mã này tính được công thức nào" — chiều ngược của `PresetSheet`.
 *
 * Từ trước tới nay chỉ có một chiều: mở công thức trước, rồi bấm "Nạp mẫu" chọn mã. Sheet này
 * đi chiều còn lại — đứng ở một mã trong danh mục và hỏi "tính gì được với mã này".
 *
 * Không gọi mạng: danh sách công thức giống nhau với mọi mã (xem `LIVE_PRESET_FORMULAS`), còn
 * số liệu của mã thì trang công thức tự lấy khi mở link `?ma=…`. Nhờ vậy sheet mở tức thì và
 * không có trạng thái đang tải nào để lo.
 *
 * Dùng `FORMULA_SUMMARIES` chứ KHÔNG `findFormulaModule()`: ở đây chỉ cần tên công thức, mà kéo
 * cả Registry vào trang `/danh-muc/` đã đo được là +86 kB ở một màn khác (xem `DataTableScreen`).
 *
 * ── Chia nhóm Cơ bản / Nâng cao, nhưng KHÔNG lọc theo chế độ đang chọn ──────────────────────
 *
 * 24 công thức cấp Cơ bản, 7 cấp Nâng cao. Chia thành hai khối có tiêu đề thay vì gắn huy hiệu
 * vào từng dòng: huy hiệu lặp chữ "Cơ bản" 24 lần là nhiễu, và nhét mảnh thứ ba vào một dòng vốn
 * đã có tên công thức + tỷ lệ ô điền sẽ phải hy sinh chính tỷ lệ ấy ở khổ 360 px — mà đó là thứ
 * danh sách đang sắp theo.
 *
 * **Ở chế độ Cơ bản vẫn hiện đủ cả nhóm Nâng cao**, khác với ba màn duyệt (`FormulaBrowser`,
 * `HomeSearchPanel`, `SearchScreen`) vốn ẩn hẳn công thức nâng cao. Ba lý do:
 *
 * 1. Đây là **kệ ghim tay**, không phải danh sách duyệt — cùng loại với khối "Công thức dùng hằng
 *    ngày" của FR-20 ở trang chủ, chỗ đã được chủ dự án cho miễn lọc (xem TASK.md, mục "Hai chỗ
 *    cố tình KHÔNG làm"). Ba màn kia đều có `FormulaQuery`, facet và bộ đếm; sheet này không có
 *    truy vấn nào để `countHiddenByLevel()` bám vào.
 * 2. Lọc ở đây mất 7 trên 31 dòng — 23% — và mất đúng nhánh định giá DCF/cổ tức (`wacc`,
 *    `gia-tri-noi-tai-fcff`, `ddm-hai-giai-doan`, `mo-hinh-gordon`…), tức đúng thứ người đang
 *    đứng ở một mã cổ phiếu muốn tính. Kệ FR-20 chỉ mất 1 trên 18 thẻ mà đã được miễn.
 * 3. Ẩn khỏi danh sách chưa bao giờ là chặn: trang `/cong-thuc/<id>/` không có cửa gác cấp độ nào
 *    cả. Lọc ở đây chỉ giấu đi thứ vẫn mở được bình thường bằng một cú bấm khác.
 *
 * Nói cách khác, tiêu đề nhóm chính là cách màn này trả lời vế "hiện nhãn cấp độ" của FR-09.
 */
export function FormulaForTickerSheet({
  open,
  onClose,
  onPick,
  code,
  hasPrice = true,
}: FormulaForTickerSheetProps) {
  const t = useT();
  const pick = usePick();
  const [query, setQuery] = useState('');

  /**
   * 31 dòng, đã hiệu chỉnh theo việc mã có thị giá hay không.
   *
   * ── Vì sao phải hiệu chỉnh ──────────────────────────────────────────────────────────────────
   *
   * `LIVE_PRESET_FORMULAS.filled` đo trên một ảnh chụp ĐỦ cả giá lẫn số liệu cơ bản. Nhưng
   * `finbox/map.ts` đối chiếu hai thứ đó độc lập, nên một mã có thể có số liệu cơ bản hợp lệ mà
   * `priceVnd` vẫn `null` — và mã như thế vẫn nằm trong danh mục, vẫn có nút ƒ. Nếu cứ in con số
   * ghim ra thì sheet hứa "2/2 ô điền sẵn" cho P/E rồi mở ra trang chỉ điền được EPS.
   *
   * Trừ xong thì **bỏ hẳn dòng còn 0 ô** — cùng luật mà `live-preset.test.ts` đã đặt cho ca đủ
   * giá: một dòng không điền được ô nào là rác trong danh sách chọn.
   *
   * Sắp lại bằng ĐÚNG comparator đã sinh ra thứ tự ghim (tỷ lệ giảm dần, hoà thì theo id). Khi mã
   * có giá thì phép sắp này là no-op — thứ tự y hệt `LIVE_PRESET_FORMULAS`.
   */
  const rows = useMemo(
    () =>
      LIVE_PRESET_FORMULAS.map((entry) => {
        const summary = FORMULA_SUMMARIES.find((item) => item.id === entry.id);
        if (summary === undefined) return null;

        const filled = hasPrice ? entry.filled : entry.filled - entry.priceFields;
        return filled === 0 ? null : { ...entry, filled, summary };
      })
        .filter((row): row is NonNullable<typeof row> => row !== null)
        .sort((a, b) => b.filled / b.total - a.filled / a.total || a.id.localeCompare(b.id)),
    [hasPrice],
  );

  /**
   * Lọc bằng CHÍNH phép chấm điểm của ô tìm toàn cục (`scoreFormula` + `tokenize`), không viết
   * bản so chuỗi thứ hai.
   *
   * Nhờ vậy gõ ở đây khớp y hệt gõ ở màn Tìm kiếm: bỏ dấu ("dinh gia" ra "Định giá"), khớp theo
   * tiền tố, và tra cả `tags` chứ không chỉ tên — nên "pe" ra P/E dù tên đầy đủ là "P/E — hệ số
   * giá trên lợi nhuận".
   *
   * Cố ý KHÔNG sắp lại theo điểm liên quan: danh sách này đang xếp theo tỷ lệ ô điền được, và đó
   * là thứ người dùng chọn theo. Với nhiều nhất 31 dòng chia hai nhóm, sắp lại chỉ làm dòng nhảy
   * chỗ mỗi lần gõ thêm một chữ.
   */
  const filtered = useMemo(() => {
    const tokens = tokenize(query);
    if (tokens.length === 0) return rows;
    return rows.filter((row) => scoreFormula(row.summary, tokens) > 0);
  }, [rows, query]);

  /** Đóng thì xoá luôn từ khoá, để lần mở sau bắt đầu từ danh sách đầy đủ — cùng nếp PresetSheet. */
  function close(): void {
    setQuery('');
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={`${t('portfolio.formulasTitle')}${code === null ? '' : ` · ${code}`}`}
      subtitle={t('portfolio.formulasSubtitle')}
    >
      <label className="visually-hidden" htmlFor="formulas-for-ticker-search">
        {t('search.label')}
      </label>
      <input
        id="formulas-for-ticker-search"
        className={styles.search}
        type="search"
        inputMode="search"
        autoComplete="off"
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />

      {/*
        Nói ra vì sao danh sách ngắn hơn bình thường. Không có dòng này thì người dùng chỉ thấy
        một danh sách thiếu 8 công thức mà không hiểu tại sao — cùng kỷ luật FR-06 của màn Danh
        mục: thiếu thì nói thiếu, đừng lặng lẽ bớt đi.
      */}
      {!hasPrice && (
        <p className={styles.note} role="note">
          {t('portfolio.formulasNoPrice')}
        </p>
      )}

      {filtered.length === 0 && <p className={styles.state}>{t('list.empty.noMatch.title')}</p>}

      <div className={styles.groups}>
        {LEVELS.map((level) => {
          const group = filtered.filter((row) => row.summary.level === level);
          // Nhóm rỗng thì bỏ hẳn: một tiêu đề "NÂNG CAO" đứng trơ không có dòng nào đọc như màn hỏng.
          if (group.length === 0) return null;

          /*
           * `id` dẫn xuất từ chính tên cấp độ, không `useId()`. Ở đây có sẵn một khoá ổn định, mà
           * id do React sinh thì khác nhau giữa HTML tĩnh và lượt hydrate.
           */
          const headingId = `formulas-for-ticker-${level}`;

          return (
            <section key={level} className={styles.group} aria-labelledby={headingId}>
              {/* h3 chứ không h2: `BottomSheet` đã dùng h2 cho tiêu đề sheet. */}
              <h3 className={styles.groupName} id={headingId}>
                {t(level === 'basic' ? 'level.basic' : 'level.advanced')}
              </h3>

              <ul className={styles.list}>
                {group.map((row) => (
                  <li key={row.id} className={styles.item}>
                    <button
                      type="button"
                      className={styles.link}
                      onClick={() => {
                        onPick(row.id);
                        close();
                      }}
                    >
                      <span className={styles.name}>{pick(row.summary.name)}</span>
                      <span className={styles.fill}>
                        {row.filled}/{row.total} {t('portfolio.formulasFilled')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </BottomSheet>
  );
}
