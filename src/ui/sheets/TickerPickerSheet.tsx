'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { normalizeVi, useTickerList } from '@/application';
import type { TickerRef } from '@/application';
import { useT } from '@/application/preferences-context';
import type { TickerCoverage } from '@/application/ticker-coverage';
import { Badge, BottomSheet, Button } from '@/ui/primitives';

import styles from './TickerPickerSheet.module.css';

/**
 * Số mã bày ra mỗi lượt: mở sheet là 20 dòng, cuộn tới đáy thì thêm 20 dòng nữa.
 *
 * ── Thay cho "cắt ở 60 dòng rồi ghi 60/1.649 mã" (13/10/2026) ───────────────────────────────
 *
 * Bản trước dựng 60 dòng đầu rồi in "60/1.649 mã" dưới danh sách để nói đã cắt. Chủ dự án đọc cặp
 * số ấy ngay sau khi nút ngoài tấm mẫu ghi "Danh sách 1.100 mã khác": *"tại sao … bên ngoài ghi là
 * 1000 mã mà lúc vào hiển thị có 60/1649 mã?"* — 60 là số DÒNG, nhưng đứng cạnh một tổng thì nó đọc
 * ra như số mã dùng được. Rồi chốt luôn cách bày: *"ban đầu hiển thị 20 mã khi người dùng scroll
 * xuống dưới thì hiển thị icon xoay tròn loading... rồi hiển thị thêm 20 mã nữa. còn nếu người dùng
 * search thì cần loading để tìm mã tương ứng"*.
 *
 * Bày dần thì không còn gì bị cắt, nên dòng đếm ấy bỏ hẳn (bia mộ `ticker.capped` ở `vi.ts`): cuộn
 * mãi là tới mã cuối.
 *
 * ── Vì sao KHÔNG ảo hoá bằng `VirtualList` ──────────────────────────────────────────────────
 *
 * `VirtualList` (`src/ui/browse/`) tính cửa sổ hiển thị từ `window.scroll` — nó cố ý KHÔNG tạo
 * khung cuộn lồng, xem docblock của nó. Nhưng thân `BottomSheet` lại chính là một khung cuộn
 * lồng (`overflow-y: auto`), nên cuộn trong sheet không hề làm `window.scrollY` nhúc nhích và
 * danh sách sẽ đứng im ở 40 mục đầu. Dùng nó ở đây là sai chỗ, không phải tiết kiệm.
 */
const PAGE_SIZE = 20;

/**
 * Hai khoảng chờ có vòng xoay — CỐ Ý, không phải thời gian máy cần.
 *
 * Cả danh sách đã nằm sẵn trong bộ nhớ từ lúc sheet mở (một lượt gọi, ~1.649 mã), nên lọc hay bày
 * thêm 20 dòng đều xong trong một khung hình. Hai khoảng chờ này là nhịp chủ dự án yêu cầu: người
 * dùng phải THẤY danh sách đang được nạp thêm hay đang được tìm, thay vì dòng mới hiện ra câm lặng
 * dưới ngón tay. Giữ ngắn — dài hơn là bắt người ta chờ một thứ đã có sẵn.
 *
 * Khoảng chờ khi gõ còn làm một việc thật: người dùng gõ "vnm" là ba phím, và danh sách chỉ lọc
 * một lần sau phím cuối thay vì nháy ba lượt kết quả.
 */
const SEARCH_DELAY_MS = 300;
const MORE_DELAY_MS = 350;

export interface TickerPickerSheetProps {
  open: boolean;
  onClose: () => void;
  /** Gọi khi người dùng chọn một mã. Sheet tự đóng sau đó. */
  onPick: (ticker: TickerRef) => void;
  /**
   * Mã đã có trong danh mục — dán nhãn "đã có" và **khoá nút chọn** của chúng.
   *
   * Chủ dự án chốt ngày 10/10/2026, ĐẢO quyết định cũ của chính chỗ này: *"mã nào đã thêm rồi thì
   * không cho thêm nữa chứ không phải hiển button 'Cộng thêm' làm gì"*. Trước đó chọn lại một mã
   * đang giữ là hợp lệ — `addHolding()` cộng dồn vào dòng cũ, đúng nghĩa "mua thêm" — và sheet chỉ
   * nói ra điều đó trước khi bấm, bằng nhãn này cộng một nhãn nút riêng ("Cộng thêm").
   *
   * Cách chữa mới triệt hơn: hai lối đi khác nhau thì tách hẳn ra. Thêm mã là việc của form thêm
   * mã, còn đổi số của một mã đang giữ là bấm vào mã trong danh sách rồi bấm Sửa — một lối không
   * cần ai giải thích rằng số cũ và số mới sẽ được cộng vào nhau.
   *
   * Vắng mặt (màn chi tiết công thức) thì sheet không biết danh mục có gì và không khoá mã nào —
   * ở đó chọn mã là để NẠP SỐ LIỆU, không liên quan gì tới danh mục.
   */
  heldCodes?: ReadonlySet<string>;
  /**
   * `'back'` khi sheet này mở đè lên một sheet khác và đóng nó là QUAY LẠI sheet đó — màn chi
   * tiết công thức dùng khi người dùng vào đây từ lối rẽ trong `PresetSheet`. Mặc định `'close'`
   * cho lối vào bình thường (nút "Đổi mã", tab Danh mục), nơi đóng là thoát hẳn ra màn.
   */
  dismiss?: 'close' | 'back';
  /**
   * Chỗ tấm đứng trên màn — xem `BottomSheetProps.placement`.
   *
   * Màn Danh mục truyền `'center'` vì sheet này mở TỪ TRONG một hộp thoại nổi giữa màn: một tấm
   * dán đáy trượt lên đè lên một tấm đang nổi ở giữa thì hai lớp đọc ra như hai thứ không liên
   * quan. Màn chi tiết công thức cũng truyền `'center'` từ 21/10/2026: tấm này mở ra từ lối rẽ
   * "Danh sách … mã khác →" của tấm Nạp mẫu, mà tấm ấy nay nổi giữa màn cả trên điện thoại — chủ dự
   * án: _"sau khi click vào button này thì chuyển sang màn mới là màn chọn mã thì cũng là dialog
   * giữa"_. Trước đó màn chi tiết giữ dán đáy ("dáng đúng cho một danh sách dài cuộn bằng ngón tay").
   *
   * Từ 1024px primitive tự đưa mọi tấm lên giữa màn, nên prop này chỉ có tác dụng ở khổ hẹp.
   */
  placement?: 'bottom' | 'center';
  /**
   * Đầu và thân tấm gọn lại dưới 1024px — đệm 12 × 16px, tiêu đề 14px — cùng bộ số của tấm Nạp mẫu.
   *
   * Màn chi tiết công thức truyền (21/10/2026, chủ dự án khoanh đầu tấm: _"cần giảm padding của phần
   * khoanh đỏ màn mới. áp dụng cho bản mobile"_): ở đó tấm này và tấm Nạp mẫu thay chỗ nhau qua lối rẽ
   * và nút ‹, nên đầu tấm phải y hệt nhau. Màn Danh mục KHÔNG truyền: ở đó tấm mở đè lên hộp thoại
   * Thêm/Sửa mã, và các hộp thoại của màn ấy cùng một cỡ đầu (luật điện thoại của `.panelCenter`).
   */
  compact?: boolean;
  /**
   * Ngày ISO của màn — bật phần đánh dấu "mã này chưa có dữ liệu cơ bản".
   *
   * Có mặt thì sheet nạp trễ bảng mã (`@/application/ticker-coverage`) và dán nhãn lên những mã
   * `toFundamentals()` sẽ từ chối; vắng mặt thì sheet chạy y như trước. Là **opt-in** vì hai lối
   * vào cần hai thứ khác nhau: màn chi tiết công thức cần nạp được số liệu nên mã thiếu báo cáo là
   * vô dụng, còn tab Danh mục chỉ cần THỊ GIÁ — thêm một mã không có báo cáo vào danh mục là
   * chuyện hoàn toàn hợp lệ, và dán nhãn "không dùng được" ở đó là nói sai.
   *
   * Truyền ngày chứ không truyền cờ: bảng mã cũ đi mỗi kỳ báo cáo và câu chữ phải hạ giọng theo —
   * xem `TickerCoverage.stale`. Application không được tự lấy đồng hồ hệ thống (NFR-REL-03).
   */
  markUnusableAsOf?: string;
}

/**
 * Sheet chọn mã trong toàn thị trường — gói "Danh mục dùng số liệu thật".
 *
 * Thay cho `<Select>` cũ chỉ có 4 mã mẫu. Cùng khuôn `PresetSheet` (WF-10) để hai ô chọn mã của
 * sản phẩm trông và dùng giống nhau, nhưng nguồn khác hẳn: `PresetSheet` đọc `DataProvider`
 * đồng bộ, còn ở đây là `MarketFeed` bất đồng bộ nên có thêm hai trạng thái đang tải / lỗi.
 */
export function TickerPickerSheet({
  open,
  onClose,
  onPick,
  heldCodes,
  dismiss = 'close',
  placement = 'bottom',
  compact = false,
  markUnusableAsOf,
}: TickerPickerSheetProps) {
  const t = useT();
  /** Chữ đang nằm trong ô tìm — đổi theo từng phím. */
  const [query, setQuery] = useState('');
  /**
   * Từ khoá danh sách ĐANG lọc theo (đã bỏ dấu, bỏ khoảng trắng đầu cuối) — chạy sau `query` một
   * nhịp `SEARCH_DELAY_MS`. Hai cái lệch nhau nghĩa là đang tìm, và màn hiện vòng xoay.
   */
  const [applied, setApplied] = useState('');
  /** Đang bày bao nhiêu dòng đầu của kết quả. */
  const [visible, setVisible] = useState(PAGE_SIZE);
  /** Đáy danh sách vừa vào tầm nhìn, đang chờ `MORE_DELAY_MS` để bày thêm một lượt. */
  const [loadingMore, setLoadingMore] = useState(false);
  /** Mốc cuối danh sách — vào tầm nhìn là tín hiệu bày thêm. */
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Chỉ chạm mạng khi sheet thật sự mở — xem docblock `useTickerList`.
  const { items, status, failure, reload } = useTickerList(open);

  /**
   * Bảng mã có số liệu cơ bản — nạp TRỄ, và chỉ khi sheet mở với `markUnusableAsOf`.
   *
   * `null` là trạng thái bình thường ở lượt render đầu và ở mọi lối vào không bật đánh dấu. Nạp
   * hỏng (mất mạng giữa chừng, chunk lỗi) thì nó ở lại `null` và sheet chạy y như trước — **không**
   * dán nhãn gì cả. Đó là chiều an toàn duy nhất: nhãn sai làm người dùng bỏ qua một mã hoàn toàn
   * hợp lệ, còn thiếu nhãn thì họ chỉ mất một cú bấm và nhận đúng câu giải thích ở màn.
   */
  const [coverage, setCoverage] = useState<TickerCoverage | null>(null);

  useEffect(() => {
    if (!open || markUnusableAsOf === undefined) return;

    let huy = false;
    void (async () => {
      try {
        const { tickerCoverage } = await import('@/application/ticker-coverage');
        if (!huy) setCoverage(tickerCoverage(markUnusableAsOf));
      } catch {
        // Không nạp được bảng thì thôi đánh dấu — xem docblock của `coverage`.
      }
    })();

    return () => {
      huy = true;
    };
  }, [open, markUnusableAsOf]);

  /** Mã này chắc chắn KHÔNG nạp được số liệu — chỉ trả `true` khi đã có bảng để mà chắc. */
  const khongDungDuoc = (code: string): boolean =>
    coverage !== null && !coverage.codes.has(code.toUpperCase());

  /**
   * Khoá nút "Chọn" — chủ dự án chốt ngày 06/10/2026, ĐẢO quyết định cũ của chính chỗ này.
   *
   * Trước đó nhãn "chưa có dữ liệu" chỉ là lời báo trước, nút vẫn bấm được, với lý do ghi sẵn:
   * bảng mã sinh lúc build nên một mã bị dán nhãn hôm nay có thể đã công bố thêm quý và dùng được
   * rồi, khoá lại là biến một dự đoán thành một lệnh cấm. Chủ dự án nhìn màn thật và chốt ngược:
   * *"đang chưa có dữ liệu thì không cho bấm vào button Chọn"*. Bấm vào một mã rồi nhận câu
   * "chưa có đủ số liệu cơ bản" ở màn là một chuyến đi uổng, và nhãn đứng ngay cạnh nút đã nói
   * đủ vì sao nút xám.
   *
   * Nhưng khoá THEO ĐỘ CHẮC của chính cái nhãn, không khoá bừa: bảng còn tươi thì nhãn khẳng định
   * ("chưa có dữ liệu") và nút khoá; bảng quá một kỳ báo cáo thì nhãn đã tự hạ giọng ("có thể chưa
   * có dữ liệu") nên nút mở, vì đó đúng là trường hợp lý do cũ còn đứng vững. Một câu nói "có thể"
   * mà đi kèm một nút cấm thì hai thứ nói hai chuyện.
   */
  const khoaNutChon = (code: string): boolean => khongDungDuoc(code) && coverage?.stale !== true;

  /** Mã đã có trong danh mục — từ 10/10/2026 là một lời từ chối, xem docblock `heldCodes`. */
  const daGiu = (code: string): boolean => heldCodes?.has(code) === true;

  /**
   * Hai lý do khoá nút, và nút phải chỉ `aria-describedby` vào ĐÚNG (những) nhãn đang hiện.
   *
   * Một mã có thể vướng cả hai cùng lúc (đang giữ VÀ chưa có báo cáo), nên đây là danh sách chứ
   * không phải một id: `aria-describedby` nhận nhiều id cách nhau bằng dấu cách, và bỏ bớt một lý
   * do là để người dùng bàn phím nghe một nửa sự thật. Rỗng thì KHÔNG đặt thuộc tính — trỏ vào một
   * id không tồn tại thì trình đọc màn hình im lặng, tệ hơn hẳn việc không trỏ gì.
   *
   * Id lấy theo mã nên không cần `useId`, và không hai dòng nào trùng id.
   */
  const lyDoKhoa = (code: string): string[] => [
    ...(daGiu(code) ? [`ticker-da-co-${code}`] : []),
    ...(khoaNutChon(code) ? [`ticker-chua-co-${code}`] : []),
  ];

  /**
   * Lọc bỏ dấu, và **mã khớp đầu chuỗi đứng trước**.
   *
   * Gõ "vn" mà kết quả đầu là một công ty có chữ "vận" trong tên thì ô này vô dụng: người dùng
   * gõ mã, nên thứ khớp mã phải lên trước tên doanh nghiệp.
   */
  const results = useMemo(() => {
    if (applied === '') return items;

    const byCode: TickerRef[] = [];
    const byName: TickerRef[] = [];

    for (const item of items) {
      const code = normalizeVi(item.code);
      if (code.startsWith(applied)) byCode.push(item);
      else if (code.includes(applied) || normalizeVi(item.name).includes(applied))
        byName.push(item);
    }

    return [...byCode, ...byName];
  }, [items, applied]);

  /**
   * Đang tìm: ô đã đổi mà danh sách chưa lọc theo.
   *
   * So trên chuỗi ĐÃ chuẩn hoá chứ không so chữ thô: gõ thêm một dấu cách hay đổi "Fpt" thành
   * "FPT" không đổi kết quả, nên không được dựng vòng xoay cho một lượt tìm ra đúng thứ đang hiện.
   */
  const needle = normalizeVi(query).trim();
  const searching = needle !== applied;

  useEffect(() => {
    if (needle === applied) return;

    const hen = window.setTimeout(() => {
      setApplied(needle);
      // Kết quả mới thì bày lại từ lượt đầu — giữ số dòng của kết quả cũ là dựng 200 dòng cho một
      // từ khoá vừa gõ.
      setVisible(PAGE_SIZE);
      setLoadingMore(false);
    }, SEARCH_DELAY_MS);

    return () => {
      window.clearTimeout(hen);
    };
  }, [needle, applied]);

  /**
   * Trình duyệt không có `IntersectionObserver` thì bày hết, không bày dần.
   *
   * Mốc cuối danh sách là thứ DUY NHẤT gọi lượt kế; không có bộ quan sát thì vòng xoay ở đáy sẽ
   * quay mãi và mã thứ 21 trở đi không bao giờ tới được. Bày hết một lần là chiều an toàn — cũng
   * là thứ jsdom chạy, nên các ca kiểm bày dần phải tự dựng bộ quan sát giả.
   */
  const bayDan = typeof IntersectionObserver !== 'undefined';
  const shown = bayDan ? results.slice(0, visible) : results;
  const conNua = shown.length < results.length;

  /*
   * Đáy danh sách vào tầm nhìn → bật vòng xoay. Gốc quan sát để mặc định (khung nhìn): phần tử nằm
   * ngoài vùng cuộn của thân sheet thì bị chính thân sheet cắt, nên không tính là đang thấy.
   *
   * `visible` nằm trong danh sách phụ thuộc để mỗi lượt bày thêm lại quan sát từ đầu: bộ quan sát
   * mới báo ngay trạng thái hiện tại, nên nếu 20 dòng vừa thêm chưa đẩy được mốc ra khỏi tầm nhìn
   * (màn rất cao, hoặc kết quả tìm ngắn) thì lượt kế tự chạy tiếp, không cần người dùng nhúc nhích.
   */
  useEffect(() => {
    const moc = sentinelRef.current;
    if (!bayDan || !conNua || loadingMore || searching || moc === null) return;

    const quanSat = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setLoadingMore(true);
    });
    quanSat.observe(moc);

    return () => {
      quanSat.disconnect();
    };
  }, [bayDan, conNua, loadingMore, searching, visible, status]);

  useEffect(() => {
    if (!loadingMore) return;

    const hen = window.setTimeout(() => {
      setVisible((n) => n + PAGE_SIZE);
      setLoadingMore(false);
    }, MORE_DELAY_MS);

    return () => {
      window.clearTimeout(hen);
    };
  }, [loadingMore]);

  /*
   * Sheet đóng thì lần mở sau bắt đầu lại từ 20 dòng. Component ở lại DOM sau khi đóng (để khỏi
   * tải lại danh sách), nên không tự về đầu — và một sheet đang giữ 400 dòng thì mở lại là dựng
   * đủ 400 dòng trước khi người dùng thấy gì.
   */
  useEffect(() => {
    if (open) return;
    setVisible(PAGE_SIZE);
    setLoadingMore(false);
  }, [open]);

  function close(): void {
    // Xoá cả hai cùng lúc: chỉ xoá ô thì lần mở sau sheet nháy vòng xoay "đang tìm" trên ô trống.
    setQuery('');
    setApplied('');
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={t('ticker.title')}
      /*
       * Không còn dòng phụ — chủ dự án chốt bỏ 22/09/2026 ("Toàn bộ mã đang giao dịch, lấy từ
       * Finbox"). Vế đầu kể lại thứ danh sách ngay dưới đã tự bày ra; vế sau gọi tên một nhà cung
       * cấp mà người dùng không có việc gì phải biết để chọn được mã. Cùng lượt dọn với câu gợi ý
       * của ô chọn công thức ở màn Danh mục, và cùng một lý do: chữ nói lại điều màn đã nói.
       */
      dismiss={dismiss}
      placement={placement}
      // Đầu và thân gọn dưới 1024px — xem prop `compact` và khối cuối `TickerPickerSheet.module.css`.
      className={compact ? styles.compact : undefined}
      /*
       * Ghim chiều cao tấm — xem `BottomSheetProps.size`.
       *
       * Ô lọc nằm ngay trong thân sheet này, và số dòng đổi theo từng từ khoá: mở ra là 20 dòng
       * (cao hơn cả tấm), gõ "vnm" còn một. Để tấm co theo nội dung thì nó tụt từ gần hết màn xuống
       * chừng hai đốt ngón tay ngay giữa lúc người dùng đang gõ, kéo cả ô tìm kiếm chạy theo.
       */
      size="tall"
    >
      <label className="visually-hidden" htmlFor="ticker-search">
        {t('ticker.searchLabel')}
      </label>
      <input
        id="ticker-search"
        className={styles.search}
        type="search"
        inputMode="search"
        autoComplete="off"
        placeholder={t('ticker.searchPlaceholder')}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        // Không tắt ô lúc đang tải: người dùng gõ sẵn mã rồi danh sách về là lọc luôn.
        disabled={status === 'error'}
      />

      {/*
        Không còn dòng "danh sách có thể đã cũ" — chủ dự án bỏ 29/09/2026. Cache quá hạn mà làm mới
        hỏng thì danh sách cũ vẫn hiện như thường; lý do ở bia mộ `ticker.stale` trong `vi.ts`.
      */}
      {status === 'loading' && (
        <p className={styles.state} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          {t('ticker.loading')}
        </p>
      )}

      {status === 'error' && (
        <div className={styles.state} role="alert">
          <p className={styles.errorText}>
            {failure === 'network' ? t('ticker.errorNetwork') : t('ticker.errorSource')}
          </p>
          <Button variant="secondary" size="sm" onClick={reload}>
            {t('ticker.retry')}
          </Button>
        </div>
      )}

      {/*
        Đang tìm thì vòng xoay ĐỨNG THAY danh sách, không đè lên nó: để nguyên kết quả cũ dưới một
        vòng xoay là mời người dùng bấm "Chọn" vào một dòng sắp biến mất. Sheet ghim chiều cao
        (`size="tall"`) nên thay ruột không làm tấm co giật.
      */}
      {status === 'ready' && searching && (
        <p className={styles.state} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          {t('ticker.searching')}
        </p>
      )}

      {status === 'ready' && !searching && (
        <>
          {shown.length === 0 ? (
            <p className={styles.state}>{t('ticker.noMatch')}</p>
          ) : (
            <ul className={styles.list}>
              {shown.map((ticker) => (
                <li
                  key={ticker.code}
                  className={khongDungDuoc(ticker.code) ? styles.itemMuted : styles.item}
                >
                  {/*
                    Mã, tên và nhãn chung một khối `.text`. Từ 1024px khối này `display: contents`,
                    dòng vẫn một hàng như cũ; dưới 1024px nó là lưới hai cột và nhãn xuống dưới tên
                    — xem khối điện thoại cuối `TickerPickerSheet.module.css`.
                  */}
                  <span className={styles.text}>
                    {/*
                      Mã đứng riêng, chữ đơn cách — cùng lý do như PresetSheet: mắt dò theo mã. Từ
                      19/10/2026 là chữ trơn, không còn ô nền (xem `.code` ở `Badge.module.css`).
                      `styles.code` chỉ để khổ điện thoại hạ cỡ chữ.
                    */}
                    <Badge tone="code" className={styles.code}>
                      {ticker.code}
                    </Badge>
                    <span className={styles.name}>{ticker.name}</span>

                    {/*
                    Mã đang giữ: nhãn này là LÝ DO nút bên cạnh xám, không còn là lời báo trước về
                    việc cộng dồn (10/10/2026 — xem docblock `heldCodes`). `id` để nút khoá trỏ
                    `aria-describedby` vào đây, cùng khuôn với nhãn "chưa có dữ liệu" ngay dưới.
                  */}
                    {daGiu(ticker.code) && (
                      <span className={styles.held} id={`ticker-da-co-${ticker.code}`}>
                        {t('ticker.held')}
                      </span>
                    )}

                    {/*
                    Mã không có báo cáo dùng được — nói TRƯỚC khi bấm, thay vì để họ chọn rồi mới
                    nhận câu "chưa có đủ số liệu cơ bản" ở màn. Từ 06/10/2026 nhãn này còn khoá
                    luôn nút bên cạnh; luật và lý do ở `khoaNutChon` phía trên.

                    `id` để nút khoá trỏ `aria-describedby` vào đây: một nút xám không giải thích
                    gì thì người dùng bàn phím và trình đọc màn hình chỉ nghe "Chọn, không dùng
                    được" mà không biết vì sao. Xem `lyDoKhoa` phía trên.
                  */}
                    {khongDungDuoc(ticker.code) && (
                      <span className={styles.unusable} id={`ticker-chua-co-${ticker.code}`}>
                        {coverage?.stale === true ? t('ticker.noDataStale') : t('ticker.noData')}
                      </span>
                    )}
                  </span>

                  {/*
                    Nhãn nút KHÔNG đổi theo trạng thái nữa — luôn là "Chọn". Mã đang giữ thì nút
                    xám, và nhãn "đã có" ngay cạnh nói vì sao; một nhãn riêng ("Cộng thêm") sẽ hứa
                    một việc nút không còn làm. Khoá chứ không ẩn, cùng lý do đã ghi cho mã thiếu
                    báo cáo: cột nút thẳng hàng thì mắt dò cả danh sách bằng một đường.
                  */}
                  <Button
                    variant="secondary"
                    size="sm"
                    {...(lyDoKhoa(ticker.code).length > 0
                      ? {
                          disabled: true,
                          'aria-describedby': lyDoKhoa(ticker.code).join(' '),
                        }
                      : {})}
                    onClick={() => {
                      onPick(ticker);
                      close();
                    }}
                  >
                    {t('ticker.pick')}
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {/*
            Mốc cuối danh sách, chỉ dựng khi còn mã chưa bày. Vòng xoay nằm sẵn ở đây chứ không
            đợi `loadingMore`: nó ở dưới đáy nên chỉ lọt vào mắt đúng lúc người dùng cuộn tới, và
            dựng sẵn thì dòng thứ 21 không đẩy thêm một khối vào giữa lúc đang cuộn.

            Chữ thì ẩn khỏi mắt, vòng xoay đã nói đủ; trình đọc màn hình nghe "Đang tải thêm mã…".
            Không còn dòng "60/1.649 mã" — xem docblock `PAGE_SIZE`.
          */}
          {conNua && (
            <div ref={sentinelRef} className={styles.more} role="status">
              <span className={styles.spinner} aria-hidden="true" />
              <span className="visually-hidden">{t('ticker.loadingMore')}</span>
            </div>
          )}
        </>
      )}
    </BottomSheet>
  );
}
