'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  MARKET_FEED,
  PORTFOLIO_KEY,
  addHolding,
  formatNumber,
  isAbortError,
  parseHoldings,
  parseViNumber,
  removeHolding,
  serializeHoldings,
  summarisePortfolio,
} from '@/application';
import type { Holding, PriceState, TickerRef, TickerSnapshot } from '@/application';
import { useT } from '@/application/preferences-context';
import { Button, Input } from '@/ui/primitives';
import { StatTile } from '@/ui/result';
import { FormulaForTickerSheet, TickerPickerSheet } from '@/ui/sheets';

import styles from './PortfolioScreen.module.css';

/**
 * Màn WF-06 Danh mục cá nhân — gói WBS 3.4.1, mở rộng ở gói "Danh mục dùng số liệu thật".
 *
 * Bốn con số đầu màn đều là **kết quả tính** nên đi qua `StatTile` nhận thẳng `CalcOutput`:
 * thiếu dữ liệu thì ô hiện "— , —" kèm lý do chứ không hiện 0 (FR-06). Đây là chỗ dễ vi phạm
 * nhất trong cả sản phẩm — một danh mục mới toanh có tổng giá trị chưa xác định, không phải 0 ₫.
 *
 * ── Thứ gì rời khỏi máy người dùng, thứ gì không ────────────────────────────────────────────
 *
 * Số lượng nắm giữ, giá vốn, ngày mua, beta: **không bao giờ** rời localStorage. Chỉ danh sách
 * MÃ được gửi tới `dcs.finbox.vn` để tra thị giá, và đó là điều màn nói thẳng ở cuối trang.
 * Trước gói này sản phẩm không gọi máy chủ nào và CSP khoá `connect-src 'self'`; nay CSP mở
 * đúng một origin — xem `public/_headers`.
 *
 * Mã chọn được là **toàn bộ ~1.649 mã đang giao dịch** (`TickerPickerSheet`), không còn giới hạn
 * ở 4 preset của `samples.ts`. Bộ mẫu WF-10 vẫn còn nguyên và vẫn dùng ở màn chi tiết công thức
 * — hai nguồn phục vụ hai việc khác nhau, xem `src/data/finbox/types.ts`.
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
  name: string;
  quantity: string;
  costPrice: string;
  buyDate: string;
  beta: string;
}

const EMPTY_FORM: FormState = {
  code: '',
  name: '',
  quantity: '',
  costPrice: '',
  buyDate: '',
  beta: '',
};

/** Hai sheet của màn. Chỉ dựng khi người dùng mở lần đầu — cùng nếp `FormulaDetail`. */
type SheetKind = 'ticker' | 'formulas';

export function PortfolioScreen() {
  const t = useT();
  const [holdings, setHoldings] = useState<ReadonlyArray<Holding>>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [asOf, setAsOf] = useState('');
  const [loaded, setLoaded] = useState(false);

  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [mountedSheets, setMountedSheets] = useState<ReadonlySet<SheetKind>>(() => new Set());
  /** Mã đang xem danh sách công thức. */
  const [formulasFor, setFormulasFor] = useState<string | null>(null);

  const openSheet = useCallback((kind: SheetKind): void => {
    setMountedSheets((current) => (current.has(kind) ? current : new Set(current).add(kind)));
    setSheet(kind);
  }, []);
  const closeSheet = useCallback((): void => {
    setSheet(null);
  }, []);

  // ── Thị giá lấy từ Finbox ──────────────────────────────────────────────────
  const [quotes, setQuotes] = useState<ReadonlyMap<string, TickerSnapshot>>(() => new Map());
  const [priceState, setPriceState] = useState<PriceState>('ready');
  const [priceLoading, setPriceLoading] = useState(false);
  /** Tăng lên mỗi lần bấm "Thử lại" — đủ để effect chạy lại, không cần state nào khác. */
  const [priceAttempt, setPriceAttempt] = useState(0);

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

  /*
   * Khoá phụ thuộc là CHUỖI MÃ đã sắp xếp, không phải mảng `holdings`.
   *
   * Sửa số lượng hay giá vốn của một mã không đổi gì về phía thị giá, nhưng nó tạo một mảng
   * `holdings` mới — lấy mảng làm phụ thuộc thì mỗi lần gõ một chữ số vào ô số lượng là một lần
   * gọi mạng.
   */
  const codesKey = useMemo(
    () =>
      [...new Set(holdings.map((holding) => holding.code))]
        .sort((a, b) => a.localeCompare(b))
        .join(','),
    [holdings],
  );

  useEffect(() => {
    if (!loaded) return;

    if (codesKey === '') {
      setQuotes(new Map());
      setPriceState('ready');
      setPriceLoading(false);
      return;
    }

    const controller = new AbortController();
    setPriceLoading(true);

    void (async () => {
      try {
        const snapshots = await MARKET_FEED.snapshots(codesKey.split(','), controller.signal);
        if (controller.signal.aborted) return;
        setQuotes(snapshots);
        setPriceState('ready');
      } catch (error) {
        if (isAbortError(error) || controller.signal.aborted) return;
        /*
         * KHÔNG xoá bảng giá đang có: giá của các mã đã tra được vẫn là giá thật của lần tra
         * trước. Tổng giá trị vẫn báo lỗi đúng, vì `summarisePortfolio()` chỉ ra số khi MỌI mã
         * đều có giá — mã vừa thêm mà chưa tra được sẽ giữ tổng ở trạng thái thiếu.
         */
        setPriceState('failed');
      } finally {
        if (!controller.signal.aborted) setPriceLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [codesKey, loaded, priceAttempt]);

  /** Bảng tra mã → thị giá (₫), đúng hình dạng `summarisePortfolio()` cần. */
  const prices = useMemo(() => {
    const map = new Map<string, number>();
    for (const [code, snapshot] of quotes) {
      if (snapshot.priceVnd !== null) map.set(code, snapshot.priceVnd);
    }
    return map;
  }, [quotes]);

  const summary = useMemo(
    () => summarisePortfolio(holdings, prices, asOf, priceState),
    [holdings, prices, asOf, priceState],
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

  const pickTicker = useCallback((ticker: TickerRef): void => {
    setForm((current) => ({ ...current, code: ticker.code, name: ticker.name }));
  }, []);

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
        Trạng thái của phần thị giá, đặt NGAY DƯỚI khối con số — đúng chỗ người dùng đang nhìn
        con số, cùng lý do mà cảnh báo bản thảo trước đây đặt ở đây.

        Chỉ hiện khi có chuyện để nói: đang tải, hoặc tra hỏng. Tra xong bình thường thì không
        có dòng nào, vì "mọi thứ ổn" không đáng chiếm một dòng trên màn hẹp.
      */}
      {priceLoading && (
        <p className={styles.priceNote} role="status">
          {t('portfolio.priceLoading')}
        </p>
      )}

      {!priceLoading && priceState === 'failed' && (
        <p className={styles.priceError} role="alert">
          <span>{t('portfolio.priceFailed')}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setPriceAttempt((n) => n + 1);
            }}
          >
            {t('portfolio.priceRetry')}
          </Button>
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

                {/* Lối đi từ MÃ sang CÔNG THỨC — chiều ngược của nút "Nạp mẫu" ở màn chi tiết. */}
                <button
                  type="button"
                  className={styles.formulaButton}
                  aria-label={`${t('portfolio.formulas')} ${row.holding.code}`}
                  onClick={() => {
                    setFormulasFor(row.holding.code);
                    openSheet('formulas');
                  }}
                >
                  ƒ
                </button>

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
            {/*
              Ô chọn mã là một NÚT mở sheet, không phải <select>: danh sách có ~1.649 mã, mà một
              <select> chừng ấy option thì không gõ tìm được và dựng ra 1.649 nút DOM.
            */}
            <div className={styles.codeField}>
              <span className={styles.codeLabel} id="portfolio-code-label">
                {t('portfolio.formCode')}
              </span>
              <button
                type="button"
                className={styles.codeButton}
                aria-labelledby="portfolio-code-label"
                onClick={() => {
                  openSheet('ticker');
                }}
              >
                {form.code === '' ? (
                  <span className={styles.codePlaceholder}>{t('portfolio.pickCode')}</span>
                ) : (
                  <>
                    <span className={styles.codeBadge}>{form.code}</span>
                    <span className={styles.codeName}>{form.name}</span>
                  </>
                )}
              </button>
              <span className={styles.codeHint}>{t('portfolio.priceNote')}</span>
            </div>

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

      {mountedSheets.has('ticker') && (
        <TickerPickerSheet open={sheet === 'ticker'} onClose={closeSheet} onPick={pickTicker} />
      )}

      {mountedSheets.has('formulas') && (
        <FormulaForTickerSheet
          open={sheet === 'formulas'}
          onClose={closeSheet}
          code={formulasFor}
          /*
           * Mã chưa tra được giá thì sheet phải nói khác đi: 15 công thức điền hụt một ô và 8
           * công thức không điền được ô nào. Dữ liệu đã nằm sẵn trong `quotes`, không thêm lời
           * gọi mạng nào. `undefined` (chưa chọn mã nào) coi như có giá — sheet lúc đó không mở.
           */
          hasPrice={formulasFor === null || (quotes.get(formulasFor)?.priceVnd ?? null) !== null}
        />
      )}
    </div>
  );
}
