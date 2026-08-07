'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  PORTFOLIO_KEY,
  SAMPLE_DATA,
  addHolding,
  formatNumber,
  hasDraftData,
  parseHoldings,
  parseViNumber,
  removeHolding,
  serializeHoldings,
  summarisePortfolio,
  t,
} from '@/application';
import type { Holding } from '@/application';
import { Button, Input, Select } from '@/ui/primitives';
import { StatTile } from '@/ui/result';

import styles from './PortfolioScreen.module.css';

/**
 * Màn WF-06 Danh mục cá nhân — gói WBS 3.4.1.
 *
 * Bốn con số đầu màn đều là **kết quả tính** nên đi qua `StatTile` nhận thẳng `CalcOutput`:
 * thiếu dữ liệu thì ô hiện "— , —" kèm lý do chứ không hiện 0 (FR-06). Đây là chỗ dễ vi phạm
 * nhất trong cả sản phẩm — một danh mục mới toanh có tổng giá trị chưa xác định, không phải 0 ₫.
 *
 * Toàn bộ danh mục nằm trong localStorage của người dùng: không tài khoản, không backend,
 * không gửi đi đâu (NFR-SEC-01, COM-03). Màn nói thẳng điều đó ở cuối trang.
 *
 * Thị giá lấy qua `DataProvider` — bản đầu là số liệu mẫu tĩnh, đổi sang nguồn thật thì màn
 * này không sửa dòng nào (FR-17).
 */

/**
 * Ngày định giá.
 *
 * Lấy ở tầng giao diện rồi TRUYỀN XUỐNG, chứ không để Domain tự gọi `new Date()`:
 * `summarisePortfolio()` bắt buộc nhận `asOf` đúng vì lý do đó (NFR-REL-03). Đọc trong effect
 * chứ không lúc render, nếu không bản build tĩnh và máy khách sẽ ra hai ngày khác nhau và
 * lệch hydration.
 */
function todayIso(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

interface FormState {
  code: string;
  quantity: string;
  costPrice: string;
  buyDate: string;
  beta: string;
}

const EMPTY_FORM: FormState = { code: '', quantity: '', costPrice: '', buyDate: '', beta: '' };

export function PortfolioScreen() {
  const [holdings, setHoldings] = useState<ReadonlyArray<Holding>>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [asOf, setAsOf] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setHoldings(parseHoldings(window.localStorage.getItem(PORTFOLIO_KEY)));
    } catch {
      // localStorage bị chặn — màn vẫn dùng được, chỉ không nhớ giữa hai lần mở.
    }
    setAsOf(todayIso());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(PORTFOLIO_KEY, serializeHoldings(holdings));
    } catch {
      // Hết dung lượng hoặc bị chặn — không chặn thao tác đang làm.
    }
  }, [holdings, loaded]);

  /** Bảng thị giá tra theo mã, dựng từ phiên gần nhất của bộ số liệu. */
  const prices = useMemo(() => {
    const map = new Map<string, number>();
    for (const preset of SAMPLE_DATA.list()) {
      const last = preset.bars[preset.bars.length - 1];
      if (last !== undefined) map.set(preset.code, last.close);
    }
    return map;
  }, []);

  const summary = useMemo(
    () => summarisePortfolio(holdings, prices, asOf),
    [holdings, prices, asOf],
  );

  const submit = useCallback(() => {
    const quantity = parseViNumber(form.quantity);
    const costPrice = parseViNumber(form.costPrice);
    if (form.code.trim() === '' || quantity === null || costPrice === null) return;

    setHoldings((current) =>
      addHolding(current, {
        code: form.code,
        quantity,
        costPrice,
        buyDate: form.buyDate,
        beta: parseViNumber(form.beta),
      }),
    );
    setForm(EMPTY_FORM);
    setFormOpen(false);
  }, [form]);

  return (
    <div className={styles.screen}>
      <header className={styles.head}>
        <h1 className={styles.title}>{t('portfolio.title')}</h1>
        <p className={styles.subtitle}>{t('portfolio.subtitle')}</p>
      </header>

      <div className={styles.stats}>
        <StatTile
          label={t('portfolio.totalValue')}
          output={summary.totalValue}
          showEyebrow={false}
          decimals={0}
        />
        <StatTile label={t('portfolio.beta')} output={summary.beta} showEyebrow={false} />
        <StatTile
          label={t('portfolio.xirr')}
          output={summary.xirr}
          showEyebrow={false}
          decimals={1}
        />
        <StatTile
          label={t('portfolio.count')}
          output={summary.count}
          showEyebrow={false}
          decimals={0}
        />
      </div>

      {/*
        Cảnh báo bản thảo đặt NGAY DƯỚI khối con số tiền, không nhét vào ô chọn mã.
        Tổng giá trị và lãi/lỗ ở trên dựng từ thị giá của bộ số liệu mẫu tự dựng — người dùng
        phải đọc được điều đó ở đúng chỗ họ đang nhìn con số, chứ không phải ở một ô khác
        phía dưới. Cờ đọc từ `hasDraftData()`, nên khi bộ mẫu thật về là câu này tự biến mất.
      */}
      {hasDraftData() && (
        <p className={styles.draftNote} role="note">
          <span className={styles.draftTag}>{t('preset.draftTag')}</span>
          {t('preset.draftInline')}
        </p>
      )}

      <section className={styles.block} aria-labelledby="portfolio-holdings">
        <h2 className={styles.blockTitle} id="portfolio-holdings">
          {t('portfolio.holdings')}
        </h2>

        {holdings.length === 0 ? (
          <p className={styles.empty}>{t('portfolio.empty')}</p>
        ) : (
          <ul className={styles.list}>
            {summary.rows.map((row) => (
              <li key={row.holding.code} className={styles.row}>
                <span className={styles.code}>{row.holding.code}</span>

                <span className={styles.detail}>
                  <span className={styles.quantity}>
                    {formatNumber(row.holding.quantity) ?? row.holding.quantity}{' '}
                    {t('portfolio.shares')}
                  </span>
                  <span className={styles.cost}>
                    {t('portfolio.costPrice')} {formatNumber(row.holding.costPrice) ?? '—'}₫
                  </span>
                </span>

                <span className={styles.weightBox}>
                  {/* Thiếu thị giá thì hiện "—" kèm lý do ở thẻ tổng, KHÔNG hiện 0% (FR-06). */}
                  <span className={styles.weight}>
                    {row.weight === null
                      ? '—'
                      : `${formatNumber(row.weight, { maxDecimals: 0 }) ?? '—'}%`}
                  </span>
                  <span className={styles.weightLabel}>{t('portfolio.weight')}</span>
                </span>

                <button
                  type="button"
                  className={styles.removeButton}
                  aria-label={`${t('portfolio.remove')} ${row.holding.code}`}
                  onClick={() => {
                    setHoldings((current) => removeHolding(current, row.holding.code));
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {formOpen ? (
          <div className={styles.form}>
            <Select
              label={t('portfolio.formCode')}
              value={form.code}
              onChange={(event) => {
                setForm((current) => ({ ...current, code: event.target.value }));
              }}
              hint={t('portfolio.priceNote')}
            >
              <option value="">—</option>
              {SAMPLE_DATA.list().map((preset) => (
                <option key={preset.code} value={preset.code}>
                  {preset.code} · {preset.name}
                </option>
              ))}
            </Select>

            <Input
              label={t('portfolio.formQuantity')}
              inputMode="decimal"
              value={form.quantity}
              onChange={(event) => {
                setForm((current) => ({ ...current, quantity: event.target.value }));
              }}
            />

            <Input
              label={t('portfolio.formCostPrice')}
              inputMode="decimal"
              value={form.costPrice}
              onChange={(event) => {
                setForm((current) => ({ ...current, costPrice: event.target.value }));
              }}
            />

            <Input
              label={t('portfolio.formBuyDate')}
              type="date"
              value={form.buyDate}
              onChange={(event) => {
                setForm((current) => ({ ...current, buyDate: event.target.value }));
              }}
            />

            <Input
              label={t('portfolio.formBeta')}
              inputMode="decimal"
              hint={t('portfolio.betaHint')}
              value={form.beta}
              onChange={(event) => {
                setForm((current) => ({ ...current, beta: event.target.value }));
              }}
            />

            <div className={styles.formActions}>
              <Button onClick={submit}>{t('portfolio.formSubmit')}</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setFormOpen(false);
                }}
              >
                {t('portfolio.formCancel')}
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={styles.addButton}
            onClick={() => {
              setFormOpen(true);
            }}
          >
            + {t('portfolio.add')}
          </button>
        )}
      </section>

      <p className={styles.local}>
        <span className={styles.localTag}>{t('portfolio.localTag')}</span>
        {t('portfolio.localOnly')}
      </p>
    </div>
  );
}
