'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  FORMULA_SUMMARIES,
  FORMULA_USAGE_KEY,
  INPUT_DRAFT_KEY,
  MARKET_CONFIG,
  PORTFOLIO_KEY,
  PREFERENCES_STORAGE_KEY,
  PRICE_CACHE_KEY,
  PRICE_SERIES_KEY,
  RECENT_SEARCHES_KEY,
  SAVED_CALCS_KEY,
  TICKER_LIST_KEY,
  formatNumber,
} from '@/application';
import { usePick, usePreferences, useT } from '@/application/preferences-context';
import { UnitSwitcher } from '@/ui/inputs';
import { Button, Select } from '@/ui/primitives';
import { ModeToggle, ThemePicker } from '@/ui/navigation';

import styles from './SettingsScreen.module.css';

/**
 * Mọi thứ app này lưu trên máy người dùng, đúng thứ tự "hay động tới nhất" trước.
 *
 * LDR-04 · NFR-SEC-01 · COM-03: mọi thứ ở đây nằm trên thiết bị và không gửi đi đâu. Nói ra
 * được thì phải xoá được — người dùng không có cách nào khác để lấy lại quyền với dữ liệu của
 * mình, vì không có tài khoản nào để đăng xuất.
 *
 * Thêm một kho mới mà quên thêm dòng vào đây là dựng ra đúng thứ danh sách này tồn tại để chặn:
 * dữ liệu nằm trên máy người dùng mà họ không có nút nào để xoá. Chuyện đó đã xảy ra thật hai
 * lần — `ffb.tickers.v1` và `ffb.prices.v1` nằm ngoài danh sách này kể từ gói "Danh mục dùng số
 * liệu thật" cho tới khi được vá cùng đợt cá nhân hoá trang chủ. Nay có ca kiểm quét mọi hằng
 * `'ffb.…'` trong `src/application` để không có lần thứ ba; xem `SettingsScreen.test.tsx`.
 */
/** Nhãn của một kho. Union chứ không phải `MessageKey` trần — chỉ chín câu này hợp nghĩa ở đây. */
type StorageLabelKey =
  | 'data.prefs'
  | 'data.recent'
  | 'data.usage'
  | 'data.series'
  | 'data.portfolio'
  | 'data.saved'
  | 'data.drafts'
  | 'data.tickers'
  | 'data.prices';

const STORAGE_ITEMS: ReadonlyArray<{
  key: string;
  labelKey: StorageLabelKey;
}> = [
  { key: PREFERENCES_STORAGE_KEY, labelKey: 'data.prefs' },
  { key: RECENT_SEARCHES_KEY, labelKey: 'data.recent' },
  // Hai kho "lịch sử" đứng cạnh nhau: cùng loại dữ liệu, cùng lý do người dùng muốn xoá.
  { key: FORMULA_USAGE_KEY, labelKey: 'data.usage' },
  { key: PRICE_SERIES_KEY, labelKey: 'data.series' },
  { key: PORTFOLIO_KEY, labelKey: 'data.portfolio' },
  { key: SAVED_CALCS_KEY, labelKey: 'data.saved' },
  /*
   * Bản nháp ô nhập đứng NGAY SAU phép tính đã lưu, vì người dùng dễ nhầm hai thứ này với nhau.
   * Khác nhau ở chỗ chủ động: "Phép tính đã lưu" là thứ họ tự bấm nút lưu và tự đặt tên; kho này
   * ghi lặng lẽ mỗi lần họ gõ, chỉ để số không bốc hơi khi rời màn, và tự hết hạn sau bảy ngày.
   */
  { key: INPUT_DRAFT_KEY, labelKey: 'data.drafts' },
  // Hai kho tạm của tab Danh mục. Xoá chỉ mất bộ nhớ đệm, lần mở sau tự lấy lại từ nguồn.
  { key: TICKER_LIST_KEY, labelKey: 'data.tickers' },
  { key: PRICE_CACHE_KEY, labelKey: 'data.prices' },
];

/**
 * Icon của bốn khối và của nút xoá — bản thiết kế đợt 12.
 *
 * BA ràng buộc phải giữ, nếu không `SettingsScreen.test.tsx` đỏ (ca đó so `textContent` của bốn
 * thẻ `<h2>` với đúng bốn chuỗi):
 *   1. Icon phải là SVG thuần — không ký tự, không emoji, chúng đi thẳng vào `textContent`.
 *   2. Tuyệt đối không `<title>`/`<desc>` bên trong, vì chúng cũng vào `textContent`.
 *   3. Viết icon và chuỗi trên hai dòng JSX riêng, để JSX cắt hết nút text khoảng trắng.
 */
function SectionIcon({ d }: { d: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const SECTION_ICONS = {
  /* Mặt trời — chế độ hiển thị. */
  mode: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  /* Thước — đơn vị và biểu thị. */
  units: 'M3 8h18v8H3V8ZM7 8v3M11 8v5M15 8v3M19 8v5',
  /* Ổ khoá — dữ liệu nằm trên máy. */
  data: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5v-9Z',
  /* Dấu hỏi trong vòng tròn — về sản phẩm. */
  about:
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.5.2-.7.6-.7 1.1v.5M12 16.8v.2',
  /* Thùng rác — nút xoá từng kho. */
  remove: 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6',
} as const;

/**
 * Cửa sổ hoàn tác sau khi xoá một kho, tính bằng giây.
 *
 * Là hằng số chứ không phải state khởi tạo bằng phép tính: ca kiểm FR-06 của màn này quét
 * `textContent` tìm `NaN`/`Infinity`/`undefined`, mà con số này được in thẳng ra màn.
 */
const UNDO_SECONDS = 5;

/** Bản sao của kho vừa xoá, đủ để ghi lại nguyên vẹn. */
interface UndoState {
  key: string;
  labelKey: StorageLabelKey;
  /** Chuỗi thô đọc được NGAY TRƯỚC khi xoá. */
  raw: string;
}

/** Cỡ một mục trong localStorage, tính bằng ký tự. `null` nghĩa là chưa có gì. */
function sizeOf(key: string): number | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : raw.length;
  } catch {
    // Trình duyệt chặn localStorage (chế độ riêng tư của Safari) — coi như chưa lưu gì.
    return null;
  }
}

/**
 * Màn WF-13 Cài đặt — gói WBS 3.6.1.
 *
 * Bốn khối đúng thứ tự wireframe: chế độ hiển thị · đơn vị & biểu phí · dữ liệu cục bộ ·
 * về sản phẩm. Trước đợt này màn là một khung tạm chỉ liệt kê tên biểu phí.
 *
 * Mọi thứ đọc `localStorage` đều đọc trong `useEffect`, và lần render đầu phải giống hệt HTML
 * dựng lúc build — bản build là HTML tĩnh nên đọc sớm là lệch hydration (bài học đợt 2).
 */
export function SettingsScreen() {
  const { feeScheduleId, setFeeScheduleId, unitScale, setUnitScale } = usePreferences();
  const t = useT();
  const pick = usePick();

  const [sizes, setSizes] = useState<ReadonlyArray<number | null>>(() =>
    STORAGE_ITEMS.map(() => null),
  );

  const refreshSizes = useCallback(() => {
    setSizes(STORAGE_ITEMS.map((item) => sizeOf(item.key)));
  }, []);

  useEffect(refreshSizes, [refreshSizes]);

  const stored = sizes.filter((size) => size !== null).length;

  /*
   * ── Hoàn tác sau khi xoá một kho ────────────────────────────────────────────
   *
   * Chủ dự án báo: bấm nút xoá xong "không thấy có gì thay đổi". Dòng CÓ đổi (chữ phụ thành
   * "chưa lưu gì", nút mờ đi) nhưng cả hai đổi ở chỗ mắt vừa rời đi, và nút vừa bấm thành
   * `disabled` nên trình duyệt ném tiêu điểm về `<body>` — không còn điểm neo nào.
   *
   * Ba quyết định:
   *
   * 1. **Xoá THẬT ngay, giữ bản sao trong state.** Không hoãn xoá 5 giây: `localStorage` là thứ
   *    mọi màn khác đọc thẳng, nên một kho "đã xoá trên màn nhưng còn trên đĩa" là hai nguồn sự
   *    thật lệch nhau trong đúng 5 giây đó — và một lượt reload giữa chừng sẽ giữ lại thứ người
   *    dùng tưởng đã bỏ đi.
   * 2. **Dòng KHÔNG biến mất.** Danh sách tám dòng là một bản kiểm kê "app này lưu gì trên máy
   *    bạn" (xem docblock `STORAGE_ITEMS`), không phải danh sách việc: dòng mất đi đọc thành
   *    "kho này không tồn tại", khác hẳn "kho này đang rỗng". Đây cũng là điều kiện của cửa gác
   *    ở `SettingsScreen.test.tsx` — nó dựng màn với localStorage rỗng rồi đòi thấy đủ tám khoá.
   * 3. **Chỉ cho từng dòng, không cho "Xoá toàn bộ".** Nút ấy đã hỏi lại bằng `confirm()` rồi
   *    `location.reload()`, mà reload giết sạch state React nên thanh này không sống nổi qua đó.
   *    Nhờ vậy câu `data.clearConfirm` ("không hoàn tác được") vẫn đúng nguyên văn.
   */
  const [undo, setUndo] = useState<UndoState | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(UNDO_SECONDS);
  const undoButtonRef = useRef<HTMLButtonElement>(null);

  /* Đếm ngược. Đặt lại từ đầu mỗi khi có kho mới bị xoá, vì `undo` đổi tham chiếu. */
  useEffect(() => {
    if (undo === null) return undefined;

    const timer = window.setInterval(() => {
      setSecondsLeft((left) => Math.max(0, left - 1));
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [undo]);

  /*
   * Hết giờ thì đóng thanh. Tách khỏi effect trên chứ không gọi `setUndo(null)` bên trong hàm
   * cập nhật của `setSecondsLeft`: React được phép chạy hàm cập nhật hai lần (StrictMode), nên
   * đặt tác dụng phụ vào đó là đặt cược vào thứ React không hứa.
   */
  useEffect(() => {
    if (undo !== null && secondsLeft <= 0) setUndo(null);
  }, [undo, secondsLeft]);

  /*
   * Đưa tiêu điểm sang nút Hoàn tác. Nút vừa bấm thành `disabled` ngay trong cùng nhịp dựng lại,
   * và trình duyệt bỏ tiêu điểm khỏi một nút bị vô hiệu hoá — người dùng bàn phím mất chỗ đứng
   * giữa danh sách. Đây là nửa còn lại của "không thấy gì thay đổi", nửa mà mắt không thấy.
   */
  useEffect(() => {
    if (undo !== null) undoButtonRef.current?.focus();
  }, [undo]);

  function remove(key: string, labelKey: StorageLabelKey): void {
    let raw: string | null = null;
    try {
      // Đọc TRƯỚC khi xoá — `sizeOf()` chỉ giữ độ dài, không giữ nội dung.
      raw = window.localStorage.getItem(key);
      window.localStorage.removeItem(key);
    } catch {
      // Xoá không được thì con số trên màn vẫn phải nói đúng sự thật — nên đọc lại ngay dưới.
    }
    refreshSizes();

    // Không đọc được gì thì không có gì để hoàn tác: đừng mời một nút không làm được việc.
    setSecondsLeft(UNDO_SECONDS);
    setUndo(raw === null ? null : { key, labelKey, raw });
  }

  function restore(): void {
    if (undo === null) return;
    try {
      window.localStorage.setItem(undo.key, undo.raw);
    } catch {
      // Hết chỗ hoặc bị chặn — đọc lại ngay dưới nên con số trên màn vẫn nói đúng sự thật.
    }
    setUndo(null);
    refreshSizes();
  }

  function removeAll(): void {
    if (!window.confirm(t('data.clearConfirm'))) return;
    for (const item of STORAGE_ITEMS) {
      try {
        window.localStorage.removeItem(item.key);
      } catch {
        // Bỏ qua từng mục hỏng, vẫn xoá tiếp các mục còn lại.
      }
    }
    // Bản sao đang giữ để hoàn tác nay trỏ vào một kho vừa bị xoá lần thứ hai — bỏ đi.
    setUndo(null);
    refreshSizes();
    // Tải lại để mọi màn đọc lại tuỳ chọn mặc định — nếu không thì trên màn vẫn là bộ cũ.
    window.location.reload();
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.h1}>{t('page.settings.title')}</h1>

      {/* ── 1. Chế độ hiển thị — FR-09 ───────────────────────────────────── */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>
          <SectionIcon d={SECTION_ICONS.mode} />
          {t('settings.mode.title')}
        </h2>

        <div className={styles.row}>
          <span className={styles.rowText}>
            <span className={styles.rowLabel}>{t('settings.mode.label')}</span>
            <span className={styles.rowHint}>{t('settings.mode.hint')}</span>
          </span>
          {/* Dùng lại đúng nút của thanh trên, không dựng bản thứ hai — một nguồn sự thật. */}
          <ModeToggle />
        </div>

        {/*
          Bảng màu ở cùng khối với chế độ Cơ bản/Nâng cao: cả hai đều là "trang này bày ra như
          thế nào", và cả hai đều chỉ nằm trên máy người dùng.

          Ở đây là bản có CHỮ (`ThemePicker`), không phải nút icon của thanh trên: màn Cài đặt là
          chỗ người ta tới để ĐỌC xem mình đang đặt gì, một icon đơn lẻ bắt đoán. Hai hình khác
          nhau nhưng cùng đọc/ghi qua `usePreferences` — một nguồn sự thật.

          Nút trên thanh chỉ hiện từ 1024px, nên hàng này là lối vào DUY NHẤT trên điện thoại.
        */}
        <div className={styles.row}>
          <span className={styles.rowText}>
            <span className={styles.rowLabel}>{t('settings.theme.label')}</span>
            <span className={styles.rowHint}>{t('settings.theme.hint')}</span>
          </span>
          <ThemePicker />
        </div>
      </section>

      {/* ── 2. Đơn vị & biểu thị ─────────────────────────────────────────── */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>
          <SectionIcon d={SECTION_ICONS.units} />
          {t('settings.units.title')}
        </h2>

        <div className={styles.row}>
          <span className={styles.rowText}>
            <span className={styles.rowLabel}>{t('settings.units.scale')}</span>
            <span className={styles.rowHint}>{t('settings.units.scaleHint')}</span>
          </span>
          <UnitSwitcher value={unitScale} onChange={setUnitScale} />
        </div>

        <div className={styles.stack}>
          <Select
            label={t('settings.units.schedule')}
            hint={t('settings.units.scheduleHint')}
            value={feeScheduleId}
            onChange={(event) => {
              setFeeScheduleId(event.target.value);
            }}
          >
            {/*
              Chỉ hiện tên biểu phí. Không ghép thêm "— mặc định": tên trong MarketConfig đã là
              "Mặc định HOSE 2026", ghép nữa thì ra "Mặc định HOSE 2026 — mặc định".
            */}
            {MARKET_CONFIG.schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {pick(schedule.name)}
              </option>
            ))}
          </Select>
        </div>
      </section>

      {/* ── 3. Dữ liệu cục bộ — LDR-04, NFR-SEC-01 ───────────────────────── */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>
          <SectionIcon d={SECTION_ICONS.data} />
          {t('settings.data.title')}
        </h2>
        <p className={styles.note}>{t('settings.data.note')}</p>

        <ul className={styles.dataList}>
          {STORAGE_ITEMS.map((item, index) => {
            const size = sizes[index] ?? null;
            return (
              <li key={item.key} className={styles.dataRow}>
                <span className={styles.rowText}>
                  <span className={styles.rowLabel}>{t(item.labelKey)}</span>
                  <span className={styles.rowHint}>
                    <code className={styles.key}>{item.key}</code>
                    {size === null
                      ? ` · ${t('data.empty')}`
                      : ` · ${formatNumber(size)} ${t('data.chars')}`}
                  </span>
                </span>

                {/*
                  Nút xoá chỉ còn icon thùng rác trên nền đỏ nhạt — bản thiết kế đợt 12.

                  `aria-label` PHẢI đúng chuỗi `data.remove` ('Xoá'): tên khả truy cập của nút là
                  thứ `SettingsScreen.test.tsx` dò để kiểm tám nút này có bị vô hiệu hoá đúng lúc
                  kho rỗng hay không, và cũng là thứ trình đọc màn hình đọc lên.

                  Dựng `<button>` tay thay vì `Button variant="danger"` + lớp đè: hai lớp cùng độ
                  ưu tiên (0,1,0) nên cái nào thắng phụ thuộc thứ tự hai file CSS Module trong gói
                  — thứ không đoán trước được. Vòng focus vẫn có, do luật `:focus-visible` chung
                  trong globals.css.
                */}
                <button
                  type="button"
                  className={styles.removeButton}
                  aria-label={t('data.remove')}
                  disabled={size === null}
                  onClick={() => {
                    remove(item.key, item.labelKey);
                  }}
                >
                  <SectionIcon d={SECTION_ICONS.remove} />
                </button>
              </li>
            );
          })}
        </ul>

        {/*
          Vùng thông báo LUÔN có mặt, rỗng khi chưa xoá gì.

          Sinh một `role="status"` cùng lúc với nội dung của nó thì trình đọc màn hình không đọc
          lên — nó chỉ theo dõi những vùng đã có sẵn từ trước. Bài học này đã ghim ở
          `HomeSearchPanel`; trước đợt này màn Cài đặt không có vùng live nào.

          Đặt NGOÀI `<ul>` chứ không thành một `<li>` thứ chín: danh sách kia là bản kiểm kê tám
          kho, và ca kiểm cửa gác duyệt từng `listitem` để đọc `<code>` bên trong.
        */}
        <div className={styles.undoSlot} role="status" aria-live="polite">
          {undo !== null && (
            <p className={styles.undoBar}>
              <span className={styles.undoText}>
                {t('data.removed')} {t(undo.labelKey)} · {t('data.undoIn')} {secondsLeft}{' '}
                {t('data.seconds')}
              </span>
              <Button ref={undoButtonRef} variant="secondary" size="sm" onClick={restore}>
                {t('data.undo')}
              </Button>
            </p>
          )}
        </div>

        <Button variant="secondary" size="sm" disabled={stored === 0} onClick={removeAll}>
          {t('data.clearAll')}
        </Button>
      </section>

      {/* ── 4. Về sản phẩm ───────────────────────────────────────────────── */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>
          <SectionIcon d={SECTION_ICONS.about} />
          {t('settings.about.title')}
        </h2>

        <dl className={styles.about}>
          <dt>{t('about.formulas')}</dt>
          <dd>{FORMULA_SUMMARIES.length}</dd>

          <dt>{t('about.schedule')}</dt>
          <dd>{MARKET_CONFIG.schedules.length}</dd>

          <dt>{t('about.offline')}</dt>
          <dd>{t('about.offlineValue')}</dd>
        </dl>

        {/*
          KHÔNG lặp lại câu miễn trừ ở đây. `AppShell` đã đặt nó ở chân mọi trang, và đây không
          phải màn bày ra con số tiền nào nên UI-04 không đòi bản thứ hai trong tầm mắt — khác
          màn chi tiết công thức, nơi cố ý giữ cả hai.
        */}
      </section>
    </div>
  );
}
