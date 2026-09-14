'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  FORMULA_SUMMARIES,
  FORMULA_USAGE_KEY,
  HOME_RECENT_SEARCHES_KEY,
  INPUT_DRAFT_KEY,
  MARKET_CONFIG,
  PORTFOLIO_KEY,
  PREFERENCES_STORAGE_KEY,
  PRICE_CACHE_KEY,
  PRICE_SERIES_KEY,
  RECENT_SEARCHES_KEY,
  SAVED_CALCS_KEY,
  TICKER_LIST_KEY,
} from '@/application';
import { usePick, usePreferences, useT } from '@/application/preferences-context';
import { UnitSwitcher } from '@/ui/inputs';
import { Button, Select } from '@/ui/primitives';
import { ModeToggle, ThemePicker } from '@/ui/navigation';

import styles from './SettingsScreen.module.css';

/**
 * Mọi thứ app này lưu trên máy người dùng, đúng thứ tự "hay động tới nhất" trước.
 *
 * LDR-04 · NFR-SEC-01 · COM-03: mọi thứ ở đây nằm trên thiết bị và không gửi đi đâu.
 *
 * ⚠ Từ 09/09/2026 màn KHÔNG còn nói câu ấy ra nữa — chủ dự án bỏ `settings.data.note`, cùng đợt
 * với dải "CỤC BỘ" ở màn Danh mục. Yêu cầu vẫn được giữ bằng CHỨC NĂNG chứ không bằng lời: dữ liệu
 * thật sự nằm trên máy, và mỗi kho đều có nút xoá. Xoá được thì mới là quyền — người dùng không có
 * cách nào khác để lấy lại quyền với dữ liệu của mình, vì không có tài khoản nào để đăng xuất.
 *
 * Thêm một kho mới mà quên thêm dòng vào đây là dựng ra đúng thứ danh sách này tồn tại để chặn:
 * dữ liệu nằm trên máy người dùng mà họ không có nút nào để xoá. Chuyện đó đã xảy ra thật hai
 * lần — `ffb.tickers.v1` và `ffb.prices.v1` nằm ngoài danh sách này kể từ gói "Danh mục dùng số
 * liệu thật" cho tới khi được vá cùng đợt cá nhân hoá trang chủ. Nay có ca kiểm quét mọi hằng
 * `'ffb.…'` trong `src/application` để không có lần thứ ba; xem `SettingsScreen.test.tsx`.
 */
/** Nhãn của một kho. Union chứ không phải `MessageKey` trần — chỉ mười câu này hợp nghĩa ở đây. */
type StorageLabelKey =
  | 'data.prefs'
  | 'data.recent'
  | 'data.recentHome'
  | 'data.usage'
  | 'data.series'
  | 'data.portfolio'
  | 'data.saved'
  | 'data.drafts'
  | 'data.tickers'
  | 'data.prices';

/**
 * Câu nói trong kho có gì — dòng phụ của mỗi hàng.
 *
 * Luôn đi kèm nhãn, nên union này là bản sao có hậu tố `.note` của union trên. Để rời nhau thì
 * thêm một kho mới mà quên câu mô tả vẫn dịch được, và hàng ấy lại rơi về đúng cái dòng trống
 * nghĩa mà đợt này vừa bỏ đi.
 */
type StorageNoteKey = `${StorageLabelKey}.note`;

/**
 * Cờ TẠM ẨN khối "Dữ liệu trên máy" — chủ dự án chốt 14/09/2026.
 *
 * Tạm, không phải bỏ. Bật lại là một dòng: đổi thành `true` và khối trở lại nguyên vẹn, kể cả bộ
 * ca kiểm của nó — `SettingsScreen.test.tsx` đọc chính hằng này qua `describe.skipIf`, nên không
 * có ca nào phải viết lại. Vì thế toàn bộ state của khối (`filled`, `undo`, `remove`,
 * `removeAll`, `restore`) cố ý Ở LẠI chứ không gỡ theo.
 *
 * ⚠ **Trong lúc ẩn, người dùng không còn nút nào để xoá dữ liệu app giữ trên máy họ.** LDR-04 và
 * NFR-SEC-01 đòi quyền ấy, và ở sản phẩm này không có tài khoản nào để đăng xuất, không có màn
 * nào khác bày kho ra — nên đây là lối duy nhất. Chỗ duy nhất còn lại là xoá dữ liệu trang trong
 * trình duyệt, tức người dùng phải tự biết đường. Chủ dự án đã biết và chọn tạm ẩn.
 *
 * `STORAGE_ITEMS` ngay dưới thì VẪN phải cập nhật khi thêm kho mới, dù khối đang ẩn — cửa gác
 * "mọi kho khai trong src/application đều xoá được" nay đọc thẳng mảng ấy chứ không đọc màn, đúng
 * vì lý do này: bản kiểm kê mà mục ra trong lúc khối ẩn thì lúc bật lại nó thiếu, và đó chính là
 * con bọ đã xảy ra hai lần.
 *
 * Kiểu `boolean` chứ không để suy ra `false`: kiểu literal làm mọi nhánh dùng nó thành mã chết
 * trong mắt TypeScript lẫn ESLint, và nhánh chết thì không ai còn sửa khi nó đang ngủ.
 */
export const HIEN_KHOI_DU_LIEU: boolean = false;

export const STORAGE_ITEMS: ReadonlyArray<{
  key: string;
  labelKey: StorageLabelKey;
  noteKey: StorageNoteKey;
}> = [
  { key: PREFERENCES_STORAGE_KEY, labelKey: 'data.prefs', noteKey: 'data.prefs.note' },
  /*
   * Ba kho "lịch sử" đứng cạnh nhau: cùng loại dữ liệu, cùng lý do người dùng muốn xoá.
   *
   * Hai dòng đầu là lịch sử tìm của HAI ô tìm khác nhau — mỗi ô một kho riêng để chip của màn
   * này không lẫn sang màn kia (xem docblock `recent-searches.ts`). Nhãn phải nói ra màn nào,
   * nếu không ở đây hiện hai dòng trông y hệt nhau mà xoá ra hai kết quả khác.
   */
  { key: RECENT_SEARCHES_KEY, labelKey: 'data.recent', noteKey: 'data.recent.note' },
  { key: HOME_RECENT_SEARCHES_KEY, labelKey: 'data.recentHome', noteKey: 'data.recentHome.note' },
  { key: FORMULA_USAGE_KEY, labelKey: 'data.usage', noteKey: 'data.usage.note' },
  { key: PRICE_SERIES_KEY, labelKey: 'data.series', noteKey: 'data.series.note' },
  { key: PORTFOLIO_KEY, labelKey: 'data.portfolio', noteKey: 'data.portfolio.note' },
  { key: SAVED_CALCS_KEY, labelKey: 'data.saved', noteKey: 'data.saved.note' },
  /*
   * Bản nháp ô nhập đứng NGAY SAU phép tính đã lưu, vì người dùng dễ nhầm hai thứ này với nhau.
   * Khác nhau ở chỗ chủ động: "Phép tính đã lưu" là thứ họ tự bấm nút lưu và tự đặt tên; kho này
   * ghi lặng lẽ mỗi lần họ gõ, chỉ để số không bốc hơi khi rời màn, và tự hết hạn sau bảy ngày.
   */
  { key: INPUT_DRAFT_KEY, labelKey: 'data.drafts', noteKey: 'data.drafts.note' },
  // Hai kho tạm của tab Danh mục. Xoá chỉ mất bộ nhớ đệm, lần mở sau tự lấy lại từ nguồn.
  { key: TICKER_LIST_KEY, labelKey: 'data.tickers', noteKey: 'data.tickers.note' },
  { key: PRICE_CACHE_KEY, labelKey: 'data.prices', noteKey: 'data.prices.note' },
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

/**
 * Kho này đã có gì chưa.
 *
 * Trước đợt này hàm trả về ĐỘ DÀI chuỗi để in ra màn ("98 ký tự"). Con số ấy đã bỏ — chủ dự án
 * chỉ vào đúng nó: *"không có nghĩa"* — nên thứ màn hình còn cần chỉ là có/không: nó quyết định
 * dòng phụ có kèm chữ "Chưa có gì" hay không, và nút xoá của hàng có bấm được hay không.
 *
 * Trả `boolean` chứ không giữ lại con số "phòng khi cần": một giá trị không ai đọc là một lời mời
 * in nó ra màn lần nữa.
 */
function coDuLieu(key: string): boolean {
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    // Trình duyệt chặn localStorage (chế độ riêng tư của Safari) — coi như chưa lưu gì.
    return false;
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

  /**
   * Kho nào đang có dữ liệu — đúng một cờ mỗi hàng.
   *
   * Khởi tạo TOÀN `false` chứ không đọc kho ngay: bản build là HTML tĩnh nên lượt render đầu ở
   * máy khách phải giống hệt lúc build (bài học đợt 2). Hệ quả nhìn thấy được: khoảnh khắc đầu
   * mọi hàng đều mang nhãn "Chưa có gì", rồi effect ngay dưới sửa lại — chấp nhận được vì nhãn ấy
   * chỉ là chú thích cho nút xoá đang mờ, không phải một con số người dùng đọc để ra quyết định.
   */
  const [filled, setFilled] = useState<ReadonlyArray<boolean>>(() =>
    STORAGE_ITEMS.map(() => false),
  );

  /** Đọc lại kho rồi đồng bộ cờ — gọi lúc mở màn và sau mỗi lần xoá / hoàn tác. */
  const dongBoTrangThai = useCallback(() => {
    setFilled(STORAGE_ITEMS.map((item) => coDuLieu(item.key)));
  }, []);

  useEffect(dongBoTrangThai, [dongBoTrangThai]);

  const stored = filled.filter(Boolean).length;

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
    dongBoTrangThai();

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
    dongBoTrangThai();
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
    dongBoTrangThai();
    // Tải lại để mọi màn đọc lại tuỳ chọn mặc định — nếu không thì trên màn vẫn là bộ cũ.
    window.location.reload();
  }

  return (
    <div className={styles.screen}>
      {/*
        KHÔNG có `<h1>` ở đây — tiêu đề "Cài đặt" nay do thanh trên dựng (`HeaderIdentity` +
        `headerTitleKey()`). Trang vẫn đúng một `<h1>`, chỉ đổi chỗ.
      */}

      {/*
        Hai cột ở khổ PC (bản vẽ WF-13), và chúng là hai BỌC thật chứ không phải một lưới phẳng.

        Lưới phẳng canh các khối theo HÀNG: khối "Dữ liệu trên máy" cao 760px (mười kho, mỗi kho
        một hàng có nút xoá) sẽ kéo hàng đầu cao bằng nó, đẩy khối "Đơn vị & biểu thị" xuống tận
        đáy màn, cách khối "Chế độ hiển thị" ngay trên nó một khoảng trống bằng nửa trang.

        Ở khổ hẹp `.col` chỉ là flex cột cùng nhịp `--space-5` với `.screen`, nên điện thoại giữ
        nguyên thứ tự 1 → 2 → 3 → 4 và không đổi một pixel nào.
      */}
      <div className={styles.col}>
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
          {/*
          Dòng phụ đã bỏ (chủ dự án chốt). Nó từng nói thêm một vế KHÔNG suy ra được từ nhãn: file
          PNG và bản in xuất ra luôn nền sáng bất kể giao diện đang tối. Vế ấy nay chỉ còn sống
          trong mã (`draw-card.ts` ghim `CARD_COLORS` vào bảng sáng, `draw-card.test.ts` gác) —
          người dùng chọn giao diện Tối rồi xuất ảnh sẽ gặp nền sáng mà không được báo trước.
        */}
          <div className={styles.row}>
            <span className={styles.rowText}>
              <span className={styles.rowLabel}>{t('settings.theme.label')}</span>
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

          {/* Dòng phụ đã bỏ (chủ dự án chốt): đơn vị này chỉ đổi cách BÀY con số trong bảng. */}
          <div className={styles.row}>
            <span className={styles.rowText}>
              <span className={styles.rowLabel}>{t('settings.units.scale')}</span>
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
      </div>

      <div className={styles.col}>
        {/* ── 3. Dữ liệu cục bộ — LDR-04, NFR-SEC-01. TẠM ẨN, xem `HIEN_KHOI_DU_LIEU` ────── */}
        {HIEN_KHOI_DU_LIEU && (
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>
              <SectionIcon d={SECTION_ICONS.data} />
              {t('settings.data.title')}
            </h2>
            {/*
          ⚠ Câu "Mọi thứ dưới đây nằm trong trình duyệt của bạn và không được gửi đi đâu" đã bỏ
          (chủ dự án chốt). Cùng đợt với dải "CỤC BỘ" ở màn Danh mục — xem docblock ở đó: sau hai
          lượt ấy sản phẩm không còn câu nào TRÊN MÀN nói về dữ liệu rời máy.
        */}

            <ul className={styles.dataList}>
              {STORAGE_ITEMS.map((item, index) => {
                const coGi = filled[index] ?? false;
                return (
                  /*
                Khoá kho đi vào THUỘC TÍNH, không đi vào chữ trên màn.

                Chủ dự án chốt ẩn hẳn `ffb.…v1`: màn Cài đặt là chỗ của người dùng, không phải chỗ
                debug. Nhưng cửa gác "mọi kho khai trong src/application đều xoá được ở màn này"
                phải còn soi được từng hàng — nó đã thủng hai lần thật (`ffb.tickers.v1`,
                `ffb.prices.v1` nằm trên máy người dùng mà không có nút xoá nào). Nên khoá vẫn nằm
                trong DOM, chỉ là không hiện thành chữ; `SettingsScreen.test.tsx` đọc `data-key`.
              */
                  <li key={item.key} className={styles.dataRow} data-key={item.key}>
                    <span className={styles.rowText}>
                      <span className={styles.rowHead}>
                        <span className={styles.rowLabel}>{t(item.labelKey)}</span>
                        {/*
                      "Chưa có gì" chỉ hiện khi kho rỗng, và nó là lời giải thích cho nút xoá đang
                      mờ ngay bên cạnh. Kho có dữ liệu thì không cần nhãn nào: nút xoá bấm được đã
                      nói đủ, còn thêm chữ "đang lưu" vào chín hàng là chín lần nhiễu.
                    */}
                        {!coGi && <span className={styles.rowEmpty}>{t('data.empty')}</span>}
                      </span>
                      <span className={styles.rowHint}>{t(item.noteKey)}</span>
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
                      disabled={!coGi}
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
        )}

        {/*
          Bản RÚT GỌN, dựng khi bản kiểm kê đang ẩn — chủ dự án chốt 14/09/2026.

          Chỉ tiêu đề và một nút, đúng yêu cầu: *"nếu có hệ quả là không thể xoá dữ liệu app giữ
          trên máy thì tạm thời làm một button… chỉ cần button trong ảnh và text 'Dữ liệu của bạn'
          còn lại thì không cần thêm"*. Không dải "CỤC BỘ", không câu mô tả — hai thứ ấy đã bỏ
          09/09/2026 và không dựng lại.

          Nhờ nó, khối 3 LUÔN có mặt: quyền xoá dữ liệu của LDR-04 · NFR-SEC-01 không đứt quãng
          trong lúc bản đầy đủ ngủ, và bố cục hai cột của màn không đổi (phép kiểm
          `chrome-check.mjs` vẫn đếm đúng bốn khối).

          `variant="danger"` chứ không `secondary`: nút này xoá SẠCH mọi kho trong một cú bấm, và
          nay nó đứng một mình chứ không còn chín nút xoá từng dòng ở trên để đặt nó vào ngữ cảnh.
          Vẫn hỏi lại qua `window.confirm` như cũ.
        */}
        {!HIEN_KHOI_DU_LIEU && (
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>
              <SectionIcon d={SECTION_ICONS.data} />
              {t('settings.data.title')}
            </h2>
            <Button variant="danger" size="sm" disabled={stored === 0} onClick={removeAll}>
              {t('data.clearAll')}
            </Button>
          </section>
        )}

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
    </div>
  );
}
