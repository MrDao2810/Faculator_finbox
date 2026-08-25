'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  MARKET_FEED,
  MAX_HOLDINGS,
  PORTFOLIO_KEY,
  PRICE_CACHE_KEY,
  addHolding,
  formatCalcOutput,
  formatIsoDate,
  formatNumber,
  isAbortError,
  isCalculated,
  isPriceCacheFresh,
  oldestAsOf,
  parseCachedPrices,
  parseHoldings,
  parseViNumber,
  removeHolding,
  serializeCachedPrices,
  serializeHoldings,
  summarisePortfolio,
  updateHolding,
} from '@/application';
import type {
  CachedPrices,
  CachedQuote,
  Holding,
  PriceState,
  TickerRef,
  TickerSnapshot,
} from '@/application';
import { useT } from '@/application/preferences-context';
import { Button, Input } from '@/ui/primitives';
import { StatTile } from '@/ui/result';
import { FormulaForTickerSheet, TickerPickerSheet } from '@/ui/sheets';

import styles from './PortfolioScreen.module.css';

/**
 * Màn WF-06 Danh mục cá nhân — gói WBS 3.4.1, mở rộng ở gói "Danh mục dùng số liệu thật" và
 * gói "Tám đề mục còn hở".
 *
 * Sáu con số đầu màn đều là **kết quả tính** nên đi qua `StatTile` nhận thẳng `CalcOutput`:
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
 * ── Không thao tác nào được phép hỏng trong im lặng ─────────────────────────────────────────
 *
 * Ba ca từng hỏng mà trông như thành công, nay đều có câu lỗi đi kèm: ô mã trống, số lượng hoặc
 * giá vốn không dương, và danh mục đã đủ `MAX_HOLDINGS` mã. Câu lỗi đi qua prop `error` của
 * primitive `Input` — chỗ đã nối sẵn `aria-invalid`, `aria-describedby` và `role="alert"`.
 *
 * Cố ý KHÔNG dùng `NumberInput` (bộ năm trạng thái WF-16) ở form này: component đó nhận một
 * `VariableSpec`, tức hình dạng của một BIẾN CÔNG THỨC trong Registry, mà "số cổ phiếu nắm giữ"
 * thì không phải biến công thức — dùng nó ở đây phải bịa ra ba spec giả, và hai trạng thái
 * `derived`/`locked` của nó không có nghĩa gì ở đây. Bản thân `NumberInput` cũng chỉ chuyển câu
 * lỗi xuống đúng prop `error` này, nên đường đi cho trình đọc màn hình là một.
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

/** Câu lỗi theo từng ô, cộng một câu chung cho lỗi không thuộc ô nào (danh mục đã đầy). */
interface FormErrors {
  code?: string;
  quantity?: string;
  costPrice?: string;
  beta?: string;
  form?: string;
}

/** Hai sheet của màn. Chỉ dựng khi người dùng mở lần đầu — cùng nếp `FormulaDetail`. */
type SheetKind = 'ticker' | 'formulas';

/** Bản cache chỉ giữ giá; dựng lại thành `TickerSnapshot` để phần còn lại của màn không phải biết. */
function snapshotFromCache(quote: CachedQuote): TickerSnapshot {
  return {
    code: quote.code,
    name: quote.name,
    priceVnd: quote.priceVnd,
    asOfDate: quote.asOfDate,
    // Ba trường này KHÔNG được cache (xem `price-cache-store.ts`), và không màn nào ở đây đọc
    // tới. Màn chi tiết công thức tra lại số liệu cơ bản bằng lời gọi riêng theo `?ma=`.
    floor: null,
    industry: null,
    fundamentals: null,
  };
}

export function PortfolioScreen() {
  const t = useT();
  const [holdings, setHoldings] = useState<ReadonlyArray<Holding>>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  /** Mã đang được SỬA. `null` nghĩa là form đang ở chế độ thêm mới. */
  const [editing, setEditing] = useState<string | null>(null);
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
  /**
   * Lần tra gần nhất có hỏng không.
   *
   * `priceState` được SUY RA từ cờ này cộng với `quotes.size`, chứ không phải một state thứ hai.
   * Bản đầu để nó là state riêng và tính ngay trong khối `catch`, nhưng ở đó chưa nhìn thấy giá
   * trị mới của `quotes` (bản dự phòng vừa đọc từ cache), nên hai state lệch pha nhau: mạng hỏng
   * mà màn vẫn báo bình thường. Suy ra thì không có pha nào để lệch.
   */
  const [fetchFailed, setFetchFailed] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  /** Tăng lên mỗi lần bấm "Làm mới" — đủ để effect chạy lại, không cần state nào khác. */
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
      setFetchFailed(false);
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
        setFetchFailed(false);

        /*
         * Ghi lại ngay sau một lần tra thành công — đây là thứ cứu màn lúc mất mạng. Chỉ cất mã
         * nào THẬT SỰ có giá: một mục giá `null` cất vào chỉ tổ làm bản cache trông như đủ.
         */
        const keep: CachedQuote[] = [];
        for (const snapshot of snapshots.values()) {
          if (snapshot.priceVnd === null) continue;
          keep.push({
            code: snapshot.code,
            name: snapshot.name,
            priceVnd: snapshot.priceVnd,
            asOfDate: snapshot.asOfDate,
          });
        }
        try {
          window.localStorage.setItem(PRICE_CACHE_KEY, serializeCachedPrices(keep, Date.now()));
        } catch {
          // Hết dung lượng hoặc bị chặn — mất cache thôi, không hỏng gì đang chạy.
        }
      } catch (error) {
        if (isAbortError(error) || controller.signal.aborted) return;
        setFetchFailed(true);

        /*
         * Hỏng thì tìm thứ THẬT để thay, theo đúng thứ tự tin cậy:
         *
         * 1. Giá đã tra được trong chính phiên làm việc này — mới nhất, giữ nguyên.
         * 2. Giá đã lưu ở lần mở app trước, nếu còn trong hạn.
         * 3. Không có gì cả → `'failed'`, màn hiện "— , —" kèm lý do.
         *
         * Hai ca đầu đều là `'stale'`, và `'stale'` BẮT BUỘC đi kèm ngày phiên hiện trên màn —
         * đó là điều kiện để việc dùng giá cũ không thành nói dối (xem `price-cache-store.ts`).
         */
        let cached: CachedPrices | null = null;
        try {
          cached = parseCachedPrices(window.localStorage.getItem(PRICE_CACHE_KEY));
        } catch {
          cached = null;
        }

        const wanted = new Set(codesKey.split(','));
        const usable =
          cached !== null && isPriceCacheFresh(cached, Date.now())
            ? cached.items.filter((item) => wanted.has(item.code))
            : [];

        // Đọc localStorage NGOÀI hàm cập nhật: React được phép gọi hàm ấy nhiều lần, nên nó
        // phải thuần — chỉ so `current` rồi trả về, không chạm gì bên ngoài.
        setQuotes((current) => {
          if (current.size > 0 || usable.length === 0) return current;
          return new Map(usable.map((item) => [item.code, snapshotFromCache(item)]));
        });
      } finally {
        if (!controller.signal.aborted) setPriceLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [codesKey, loaded, priceAttempt]);

  /**
   * Tra hỏng mà vẫn còn giá để hiện là `'stale'`; hỏng và trắng tay mới là `'failed'`.
   *
   * Giá còn lại đến từ một trong hai chỗ, cả hai đều là giá THẬT của một phiên đã đóng: lần tra
   * thành công trước đó trong chính phiên làm việc này, hoặc bản lưu ở localStorage.
   */
  const priceState: PriceState = !fetchFailed ? 'ready' : quotes.size > 0 ? 'stale' : 'failed';

  /** Bảng tra mã → thị giá (₫), đúng hình dạng `summarisePortfolio()` cần. */
  const prices = useMemo(() => {
    const map = new Map<string, number>();
    for (const [code, snapshot] of quotes) {
      if (snapshot.priceVnd !== null) map.set(code, snapshot.priceVnd);
    }
    return map;
  }, [quotes]);

  /**
   * Ngày phiên đem ra khoe với người dùng — lấy phiên CŨ NHẤT trong các mã đang giữ.
   *
   * Cũ nhất chứ không mới nhất: câu "Giá phiên 21/08" phải đúng với mọi con số đang hiện, nếu
   * không thì một mã lỡ nhịp sẽ nấp sau ngày đẹp của mã khác.
   */
  const priceAsOf = useMemo(
    () =>
      oldestAsOf(
        holdings
          .map((holding) => quotes.get(holding.code))
          .filter((snapshot): snapshot is TickerSnapshot => snapshot !== undefined),
      ),
    [holdings, quotes],
  );

  const summary = useMemo(
    () => summarisePortfolio(holdings, prices, asOf, priceState),
    [holdings, prices, asOf, priceState],
  );

  const closeForm = useCallback((): void => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditing(null);
    setFormOpen(false);
  }, []);

  /** Mở form ở chế độ SỬA, đổ sẵn số đang lưu. */
  const startEdit = useCallback((holding: Holding): void => {
    setForm({
      code: holding.code,
      name: holding.name ?? '',
      quantity: formatNumber(holding.quantity) ?? String(holding.quantity),
      costPrice: formatNumber(holding.costPrice) ?? String(holding.costPrice),
      buyDate: holding.buyDate,
      beta:
        holding.beta === undefined || holding.beta === null
          ? ''
          : (formatNumber(holding.beta, { maxDecimals: 4 }) ?? String(holding.beta)),
    });
    setErrors({});
    setEditing(holding.code);
    setFormOpen(true);
  }, []);

  const submit = useCallback(() => {
    const code = form.code.trim().toUpperCase();
    const quantity = parseViNumber(form.quantity);
    const costPrice = parseViNumber(form.costPrice);
    const betaTyped = form.beta.trim();
    const beta = betaTyped === '' ? null : parseViNumber(betaTyped);

    const next: FormErrors = {};
    if (code === '') next.code = t('portfolio.errCode');
    if (quantity === null || quantity <= 0) next.quantity = t('portfolio.errQuantity');
    if (costPrice === null || costPrice <= 0) next.costPrice = t('portfolio.errCostPrice');
    if (betaTyped !== '' && beta === null) next.beta = t('portfolio.errBeta');

    /*
     * Trần số mã: `addHolding()` từ chối trong im lặng khi danh mục đã đầy, nên phải chặn ở đây
     * mới nói được lý do. Chỉ tính là "thêm mới" khi mã chưa có — thêm tiếp một mã ĐANG giữ chỉ
     * cộng dồn vào dòng cũ nên không chạm trần.
     */
    const isNewCode = editing === null && !holdings.some((holding) => holding.code === code);
    if (isNewCode && holdings.length >= MAX_HOLDINGS) next.form = t('portfolio.errFull');

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    // Đã qua mọi cửa ở trên nên hai giá trị này chắc chắn là số dương; ép kiểu cho TypeScript.
    const safeQuantity = quantity as number;
    const safeCostPrice = costPrice as number;
    const name = form.name.trim();

    setHoldings((current) =>
      editing === null
        ? addHolding(current, {
            code,
            ...(name === '' ? {} : { name }),
            quantity: safeQuantity,
            costPrice: safeCostPrice,
            buyDate: form.buyDate,
            beta,
          })
        : updateHolding(current, editing, {
            ...(name === '' ? {} : { name }),
            quantity: safeQuantity,
            costPrice: safeCostPrice,
            buyDate: form.buyDate,
            beta,
          }),
    );
    closeForm();
  }, [form, editing, holdings, t, closeForm]);

  /**
   * Mã đang chọn ở form THÊM đã nằm trong danh mục sẵn rồi.
   *
   * `addHolding()` khi ấy **cộng dồn** số lượng và tính lại giá vốn bình quân chứ không tạo dòng
   * thứ hai — đó là hành vi đúng ("thêm FPT lần nữa" = mua thêm), nhưng trước đây nó xảy ra
   * trong im lặng: người dùng thêm 50 CP rồi thấy dòng cũ nhảy lên 150 CP mà không có lời nào,
   * nên tưởng màn đang cho tạo mã trùng hoặc đang tính sai. Cùng loại lỗi với ba ca "hỏng trong
   * im lặng" đã vá, chỉ khác là ở đây thao tác THÀNH CÔNG nhưng làm việc khác điều người dùng
   * tưởng.
   */
  const mergingInto = useMemo(
    () =>
      editing === null && form.code.trim() !== ''
        ? (holdings.find((holding) => holding.code === form.code.trim().toUpperCase()) ?? null)
        : null,
    [editing, form.code, holdings],
  );

  /** Mã đang giữ — sheet chọn mã đánh dấu chúng để người dùng biết trước khi bấm. */
  const heldCodes = useMemo(() => new Set(holdings.map((holding) => holding.code)), [holdings]);

  const pickTicker = useCallback((ticker: TickerRef): void => {
    setForm((current) => ({ ...current, code: ticker.code, name: ticker.name }));
    setErrors((current) => ({ ...current, code: undefined }));
  }, []);

  /** Đổi một ô và xoá luôn câu lỗi của chính ô đó — lỗi cũ không được đứng đó khi đã sửa. */
  const setField = useCallback((key: keyof FormState, value: string): void => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
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
        <StatTile
          label={t('portfolio.totalCost')}
          output={summary.totalCost}
          showEyebrow={false}
          decimals={0}
        />
        <StatTile
          label={t('portfolio.gain')}
          output={summary.gain}
          showEyebrow={false}
          decimals={0}
          /*
           * Phần trăm đi làm dòng phụ của chính ô Lãi/lỗ thay vì chiếm một ô thứ bảy: hai con số
           * là hai cách đọc CÙNG một đại lượng. Chỉ truyền khi nó thật sự tính được — không thì
           * `StatTile` in ra "— %" thừa, mà lý do đã nằm ngay trên đó rồi.
           */
          note={
            isCalculated(summary.gainPercent)
              ? formatCalcOutput(summary.gainPercent, { maxDecimals: 1 })
              : undefined
          }
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
        Trạng thái thị giá, đặt NGAY DƯỚI khối con số — đúng chỗ người dùng đang nhìn con số.

        Luôn hiện khi danh mục có mã, kể cả lúc mọi thứ bình thường: dòng này mang NGÀY PHIÊN,
        mà "giá của phiên nào" là thông tin người dùng cần thường trực chứ không phải chỉ lúc
        hỏng — mở app chiều thứ Bảy thì con số đang nhìn là giá thứ Sáu. Nút làm mới cũng vì thế
        mà luôn có mặt, không đợi hỏng mới xuất hiện.
      */}
      {holdings.length > 0 && (
        <p
          className={priceState === 'ready' ? styles.priceNote : styles.priceError}
          role={priceState === 'ready' ? 'status' : 'alert'}
        >
          <span className={styles.priceText}>
            {priceLoading && <span>{t('portfolio.priceLoading')}</span>}
            {!priceLoading && priceState === 'failed' && <span>{t('portfolio.priceFailed')}</span>}
            {!priceLoading && priceState === 'stale' && <span>{t('portfolio.priceStale')}</span>}
            {!priceLoading && priceAsOf !== null && (
              <span>
                {t('portfolio.priceSession')} {formatIsoDate(priceAsOf)}
              </span>
            )}
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={priceLoading}
            onClick={() => {
              setPriceAttempt((n) => n + 1);
            }}
          >
            {priceState === 'ready' ? t('portfolio.priceRefresh') : t('portfolio.priceRetry')}
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
            {summary.rows.map((row) => {
              const { holding } = row;

              /*
               * Số liệu của mã, dựng thành các ô NHÃN–GIÁ TRỊ thay vì một câu nối bằng dấu chấm.
               *
               * Bản trước ghép tất cả thành `100 CP · giá vốn 21 ₫ · chưa có giá` rồi thêm một
               * dòng `mua 02/08/2026 · beta 1,1` nữa, cả hai cùng cỡ chữ nhỏ nhất và cùng màu
               * xám. Đọc ra thì được, nhưng KHÔNG dò được: mắt phải đọc hết cả câu mới biết con
               * số nào là giá vốn, và nhãn lẫn giá trị trông y hệt nhau. Tách nhãn ra chữ nhỏ in
               * hoa, giá trị để cỡ chữ thường màu đậm — đúng khuôn `StatTile` ở đầu màn, nên hai
               * khối số của cùng một màn nói cùng một thứ tiếng.
               *
               * Ngày mua và beta chỉ hiện khi có. Ngày mua đáng ngại nhất trong nhóm — gõ nhầm
               * năm là đúng cái bẫy mà luật `MODEL_VIOLATION` ở `summarisePortfolio()` dựng ra
               * để chặn, mà người dùng lại không có cách nào nhìn thấy ngày đang lưu để sửa.
               */
              const cells: ReadonlyArray<{ label: string; value: string }> = [
                {
                  label: t('portfolio.cellQuantity'),
                  value: `${formatNumber(holding.quantity) ?? holding.quantity} ${t('portfolio.shares')}`,
                },
                {
                  label: t('portfolio.costPrice'),
                  value: `${formatNumber(holding.costPrice) ?? '—'} ₫`,
                },
                {
                  label: t('portfolio.marketPrice'),
                  // Thiếu giá thì nói thẳng là chưa có, KHÔNG hiện 0 ₫ (FR-06).
                  value:
                    row.marketPrice === null
                      ? t('portfolio.priceMissing')
                      : `${formatNumber(row.marketPrice) ?? '—'} ₫`,
                },
                {
                  label: t('portfolio.weight'),
                  value:
                    row.weight === null
                      ? '—'
                      : `${formatNumber(row.weight, { maxDecimals: 0 }) ?? '—'}%`,
                },
                ...(holding.buyDate === ''
                  ? []
                  : [{ label: t('portfolio.formBuyDate'), value: formatIsoDate(holding.buyDate) }]),
                ...(holding.beta === undefined || holding.beta === null
                  ? []
                  : [
                      {
                        label: t('portfolio.betaShort'),
                        value:
                          formatNumber(holding.beta, { maxDecimals: 4 }) ?? String(holding.beta),
                      },
                    ]),
              ];

              const up = row.gain !== null && row.gain >= 0;

              return (
                <li key={holding.code} className={styles.row}>
                  {/*
                      Nút mở form sửa bao ĐÚNG dòng đầu (mã + tên), không bao các dòng số bên
                      dưới. Lý do là quy tắc tính tên trợ năng: `aria-label` NUỐT toàn bộ nội
                      dung bên trong nút, nên bọc cả khối số vào nút sẽ làm số lượng, giá vốn,
                      thị giá, lãi/lỗ và ngày mua biến mất khỏi bản đọc — đúng những con số vừa
                      được đưa lên màn ở gói này.

                      Đã thử hướng ngược lại (bỏ `aria-label`, thêm chữ "Sửa" ẩn) và nó hỏng:
                      tên nút được ghép từ nội dung từng thẻ con SAU KHI cắt khoảng trắng hai
                      đầu, nên nghe thành "SửaFPT100 CP…". Cách hiện tại giữ nút gọn, nhãn sạch,
                      và mọi con số nằm ngoài nút nên vẫn được đọc như chữ thường của mục danh
                      sách. Nhãn có kèm tên công ty vì tên ấy nằm trong nút.
                    */}
                  <button
                    type="button"
                    className={styles.editButton}
                    aria-label={`${t('portfolio.edit')} ${holding.code}${
                      holding.name === undefined ? '' : ` ${holding.name}`
                    }`}
                    onClick={() => {
                      startEdit(holding);
                    }}
                  >
                    <span className={styles.code}>{holding.code}</span>
                    {holding.name !== undefined && (
                      <span className={styles.name}>{holding.name}</span>
                    )}
                    {/*
                        Dấu bút chì là thứ DUY NHẤT nói cho người dùng biết chỗ này bấm được, nên
                        vị trí của nó quan trọng ngang việc nó tồn tại. Nó phải đứng NGAY SAU tên
                        mã: bản trước đẩy sang lề phải bằng `margin-left: auto`, và ở đó nó rời
                        hẳn khỏi cái mã mà nó sửa nên không ai đoán ra nó để làm gì.

                        Hai bản trước nữa còn tệ hơn — chỉ đổi màu lúc rê chuột, mà màn này thiết
                        kế cho 360px và điện thoại không có trạng thái rê chuột.

                        Trình đọc màn hình không nghe thấy ký hiệu này: `aria-label` của nút đã
                        thay toàn bộ nội dung bên trong.
                      */}
                    <span className={styles.editMark} aria-hidden="true">
                      ✎
                    </span>
                  </button>

                  {/*
                    Lãi/lỗ đứng thành một dải riêng ngay dưới mã, không lẫn vào lưới số liệu:
                    đây là con số người ta mở màn để xem, mọi thứ còn lại là bối cảnh cho nó.

                    Dấu +/− mang tin chứ không chỉ có màu — NFR-USA-06. Thiếu giá thì cả dải
                    biến mất chứ KHÔNG hiện 0 ₫ (FR-06); lý do đã nằm ở ô "Thị giá — chưa có giá"
                    ngay dưới, và ở ô Lãi/lỗ đầu màn.
                  */}
                  {row.gain !== null && row.gainPercent !== null && (
                    <p
                      className={[styles.gainBand, up ? styles.gainUp : styles.gainDown].join(' ')}
                    >
                      <span className={styles.gainLabel}>{t('portfolio.gain')}</span>
                      <span className={styles.gainValue}>
                        {up ? '+' : '−'}
                        {formatNumber(Math.abs(row.gain), { maxDecimals: 0 }) ?? '—'} ₫
                      </span>
                      <span className={styles.gainPercent}>
                        {up ? '+' : '−'}
                        {formatNumber(Math.abs(row.gainPercent), { maxDecimals: 1 }) ?? '—'}%
                      </span>
                    </p>
                  )}

                  <dl className={styles.cells}>
                    {cells.map((cell) => (
                      <div key={cell.label} className={styles.cell}>
                        <dt className={styles.cellLabel}>{cell.label}</dt>
                        <dd className={styles.cellValue}>{cell.value}</dd>
                      </div>
                    ))}
                  </dl>

                  {/*
                    Hai nút cuối thẻ là NÚT THẬT có chữ, không còn là ký tự `ƒ` và `×` trần.

                    Bản trước để hai ký tự ấy trên nền trong suốt, màu chữ mờ, không viền — chủ dự
                    án báo là "hiển thị mờ nhạt và không biết có thể thao tác", và đúng: một ký
                    tự xám không có gì phân biệt với chữ trang trí. Dùng primitive `Button` thì
                    được luôn viền, vòng focus và vùng chạm 44px đã chuẩn hoá sẵn.
                  */}
                  <div className={styles.actions}>
                    {/* Lối đi từ MÃ sang CÔNG THỨC — chiều ngược của nút "Nạp mẫu" ở màn chi tiết. */}
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label={`${t('portfolio.formulas')} ${holding.code}`}
                      onClick={() => {
                        setFormulasFor(holding.code);
                        openSheet('formulas');
                      }}
                    >
                      {t('portfolio.formulas')}
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      aria-label={`${t('portfolio.remove')} ${holding.code}`}
                      onClick={() => {
                        setHoldings((current) => removeHolding(current, holding.code));
                        // Đang sửa đúng mã vừa bị bỏ thì form phải đóng, nếu không nó sẽ lưu
                        // ngược một mã không còn tồn tại.
                        if (editing === holding.code) closeForm();
                      }}
                    >
                      {t('portfolio.remove')}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {formOpen ? (
          <div className={styles.form}>
            {/*
              Ô chọn mã là một NÚT mở sheet, không phải <select>: danh sách có ~1.649 mã, mà một
              <select> chừng ấy option thì không gõ tìm được và dựng ra 1.649 nút DOM.

              Ở chế độ SỬA, nút này khoá lại: đổi mã của một dòng đang có không phải là "sửa" mà
              là hai thao tác khác nhau (bỏ mã cũ, thêm mã mới) với hai con số vốn khác nhau.
            */}
            <div className={styles.codeField}>
              <span className={styles.codeLabel} id="portfolio-code-label">
                {t('portfolio.formCode')}
              </span>
              <button
                type="button"
                className={styles.codeButton}
                aria-labelledby="portfolio-code-label"
                disabled={editing !== null}
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
              <span className={styles.codeHint}>
                {editing === null ? t('portfolio.priceNote') : t('portfolio.editHint')}
              </span>
              {errors.code !== undefined && (
                <span className={styles.fieldError} role="alert">
                  {errors.code}
                </span>
              )}
              {mergingInto !== null && (
                <span className={styles.mergeNote} role="note">
                  {t('portfolio.mergeNote')}
                </span>
              )}
            </div>

            <Input
              label={t('portfolio.formQuantity')}
              inputMode="decimal"
              value={form.quantity}
              error={errors.quantity}
              onChange={(event) => {
                setField('quantity', event.target.value);
              }}
            />

            <Input
              label={t('portfolio.formCostPrice')}
              inputMode="decimal"
              value={form.costPrice}
              error={errors.costPrice}
              onChange={(event) => {
                setField('costPrice', event.target.value);
              }}
            />

            <Input
              label={t('portfolio.formBuyDate')}
              type="date"
              value={form.buyDate}
              onChange={(event) => {
                setField('buyDate', event.target.value);
              }}
            />

            <Input
              label={t('portfolio.formBeta')}
              inputMode="decimal"
              hint={t('portfolio.betaHint')}
              value={form.beta}
              error={errors.beta}
              onChange={(event) => {
                setField('beta', event.target.value);
              }}
            />

            {errors.form !== undefined && (
              <p className={styles.formError} role="alert">
                {errors.form}
              </p>
            )}

            <div className={styles.formActions}>
              {/*
                Nhãn nút đổi theo việc nút sắp làm. "Thêm vào danh mục" khi thật ra là cộng dồn
                vào một dòng đã có là hứa sai ngay trên đích bấm — chỗ người dùng đọc kỹ nhất.
              */}
              <Button onClick={submit}>
                {editing !== null
                  ? t('portfolio.formSave')
                  : mergingInto !== null
                    ? t('portfolio.formMerge')
                    : t('portfolio.formSubmit')}
              </Button>
              <Button variant="ghost" onClick={closeForm}>
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
        <TickerPickerSheet
          open={sheet === 'ticker'}
          onClose={closeSheet}
          onPick={pickTicker}
          heldCodes={heldCodes}
        />
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
