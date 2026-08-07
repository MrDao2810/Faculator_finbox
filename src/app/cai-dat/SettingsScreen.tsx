'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  FORMULA_SUMMARIES,
  MARKET_CONFIG,
  PORTFOLIO_KEY,
  PREFERENCES_STORAGE_KEY,
  PRICE_SERIES_KEY,
  RECENT_SEARCHES_KEY,
  formatNumber,
  t,
} from '@/application';
import { usePreferences } from '@/application/preferences-context';
import { UnitSwitcher } from '@/ui/inputs';
import { Button, Select } from '@/ui/primitives';
import { ModeToggle } from '@/ui/navigation';

import styles from './SettingsScreen.module.css';

/**
 * Bốn thứ app này lưu trên máy người dùng, đúng thứ tự "hay động tới nhất" trước.
 *
 * LDR-04 · NFR-SEC-01 · COM-03: mọi thứ ở đây nằm trên thiết bị và không gửi đi đâu. Nói ra
 * được thì phải xoá được — người dùng không có cách nào khác để lấy lại quyền với dữ liệu của
 * mình, vì không có tài khoản nào để đăng xuất.
 */
const STORAGE_ITEMS: ReadonlyArray<{
  key: string;
  labelKey: 'data.prefs' | 'data.recent' | 'data.series' | 'data.portfolio';
}> = [
  { key: PREFERENCES_STORAGE_KEY, labelKey: 'data.prefs' },
  { key: RECENT_SEARCHES_KEY, labelKey: 'data.recent' },
  { key: PRICE_SERIES_KEY, labelKey: 'data.series' },
  { key: PORTFOLIO_KEY, labelKey: 'data.portfolio' },
];

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

  const [sizes, setSizes] = useState<ReadonlyArray<number | null>>(() =>
    STORAGE_ITEMS.map(() => null),
  );

  const refreshSizes = useCallback(() => {
    setSizes(STORAGE_ITEMS.map((item) => sizeOf(item.key)));
  }, []);

  useEffect(refreshSizes, [refreshSizes]);

  const stored = sizes.filter((size) => size !== null).length;

  function remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Xoá không được thì con số trên màn vẫn phải nói đúng sự thật — nên đọc lại ngay dưới.
    }
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
    refreshSizes();
    // Tải lại để mọi màn đọc lại tuỳ chọn mặc định — nếu không thì trên màn vẫn là bộ cũ.
    window.location.reload();
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.h1}>{t('page.settings.title')}</h1>

      {/* ── 1. Chế độ hiển thị — FR-09 ───────────────────────────────────── */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>{t('settings.mode.title')}</h2>

        <div className={styles.row}>
          <span className={styles.rowText}>
            <span className={styles.rowLabel}>{t('settings.mode.label')}</span>
            <span className={styles.rowHint}>{t('settings.mode.hint')}</span>
          </span>
          {/* Dùng lại đúng nút của thanh trên, không dựng bản thứ hai — một nguồn sự thật. */}
          <ModeToggle />
        </div>
      </section>

      {/* ── 2. Đơn vị & biểu thị ─────────────────────────────────────────── */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>{t('settings.units.title')}</h2>

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
                {schedule.name}
              </option>
            ))}
          </Select>
        </div>
      </section>

      {/* ── 3. Dữ liệu cục bộ — LDR-04, NFR-SEC-01 ───────────────────────── */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>{t('settings.data.title')}</h2>
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

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={size === null}
                  onClick={() => {
                    remove(item.key);
                  }}
                >
                  {t('data.remove')}
                </Button>
              </li>
            );
          })}
        </ul>

        <Button variant="secondary" size="sm" disabled={stored === 0} onClick={removeAll}>
          {t('data.clearAll')}
        </Button>
      </section>

      {/* ── 4. Về sản phẩm ───────────────────────────────────────────────── */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>{t('settings.about.title')}</h2>

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
