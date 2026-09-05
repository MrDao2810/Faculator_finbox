'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  FORMULA_SUMMARIES,
  MARKET_FEED,
  MAX_HOLDINGS,
  PORTFOLIO_KEY,
  PRICE_CACHE_KEY,
  SAVED_CALCS_KEY,
  addHolding,
  displayCalcName,
  formatIsoDate,
  formatNumber,
  formatValueWithUnit,
  formulaPath,
  isAbortError,
  isCalculated,
  isPriceCacheFresh,
  oldestAsOf,
  parseCachedPrices,
  parseHoldings,
  parseSavedCalcs,
  parseViNumber,
  removeHolding,
  removeSavedCalc,
  renameSavedCalc,
  serializeCachedPrices,
  serializeHoldings,
  serializeSavedCalcs,
  summarisePortfolio,
  updateHolding,
} from '@/application';
import type {
  CachedPrices,
  CachedQuote,
  Holding,
  PriceState,
  SavedCalc,
  TickerRef,
  TickerSnapshot,
} from '@/application';
import { usePick, usePreferences, useT } from '@/application/preferences-context';
import { HiddenByLevelNote } from '@/ui/browse';
import { useCalcText, useValueText } from '@/ui/i18n/units';
import { DisclaimerBar } from '@/ui/navigation';
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
 * ── Sáu ô ở chế độ Nâng cao, bốn ô ở Cơ bản (FR-09) ─────────────────────────────────────────
 *
 * Beta và XIRR là hai khái niệm nâng cao thật, và với người dùng F0 chúng gần như **luôn** ở
 * trạng thái "— , —": beta là bình quân gia quyền nên thiếu beta của một mã là hỏng cả ô, mà
 * beta thì phải nhập tay; XIRR đòi ngày mua hợp lệ ở mọi mã. Bốn trên sáu ô nói được điều gì
 * đó ngay sau khi thêm mã đầu tiên, hai ô còn lại thì không — nên chế độ Cơ bản (mặc định của
 * sản phẩm, SRS 1.3.3) chỉ dựng bốn ô ấy, kèm dòng nói ra là đang giấu hai ô.
 *
 * Ô nhập Beta trong form và ô `beta` trong thẻ nắm giữ đi theo cùng luật — bày một con số mà
 * chính chế độ đang xem không cho sửa là một ngõ cụt.
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

/**
 * Mốc epoch thành ngày ISO 'YYYY-MM-DD' theo giờ **địa phương**, để đưa cho `formatIsoDate()`.
 *
 * Không dùng `toISOString().slice(0, 10)`: hàm đó đổi sang UTC, nên một phép tính lưu lúc 7 giờ
 * sáng ở Việt Nam sẽ hiện ra ngày hôm trước — cùng lý do `todayIso()` ngay trên tự ghép chuỗi.
 */
function isoDayOf(ms: number): string {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return '';

  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Số ô mà chế độ Cơ bản giấu đi — Beta và XIRR.
 *
 * Con số này phải khớp số `StatTile` nằm trong nhánh `advanced &&` bên dưới. Không đếm được tự
 * động vì chúng là JSX, nên `PortfolioScreen.test.tsx` gác bằng cách đếm ô thật ở cả hai chế độ
 * rồi so hiệu số với chính hằng số này — thêm một ô nâng cao mà quên sửa đây là đỏ ngay.
 */
const ADVANCED_TILES = 2;

/**
 * Icon của sáu ô chỉ số và hai tab — bản thiết kế đợt 12.
 *
 * Vẽ tay như `TabIcon` và `CategoryIcon`, không thêm thư viện (NFR-PER-04). Khai ở màn này chứ
 * không đẩy vào `@/ui/result`: `StatTile` là component chung, nó không nên biết danh mục có
 * những chỉ số nào.
 *
 * Luôn `aria-hidden` và tuyệt đối không chứa `<title>`/`<desc>` — chúng sẽ chui vào `textContent`
 * của thẻ, mà nhiều ca kiểm ở màn này dò giá trị qua đúng `textContent`.
 */
function StatIcon({ d }: { d: string }) {
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

const TILE_ICONS = {
  /* Ví tiền — tổng giá trị đang nắm. */
  totalValue:
    'M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm13 4h4v4h-4Z',
  /* Đồng xu — số vốn đã bỏ ra. */
  totalCost:
    'M4 8c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v8c0 1.7 3.6 3 8 3s8-1.3 8-3V8',
  /* Mũi tên lên — lãi/lỗ. */
  gain: 'M4 17l5-5 3 3 7-7M15 8h5v5',
  /* Con lắc — beta là độ dao động so với thị trường. */
  beta: 'M12 4v6M12 10a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM6 6l1.5 1.5M18 6l-1.5 1.5',
  /* Đồng hồ — XIRR là lợi suất có tính tới thời điểm. */
  xirr: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  /* Cột — số mã đang giữ. */
  count: 'M5 20V11M12 20V4M19 20v-6',
  /* Danh sách mã. */
  tabHoldings: 'M4 6h16M4 12h16M4 18h10',
  /* Ô vuông xếp — các phép tính đã lưu. */
  tabSaved: 'M4 5h6v6H4V5ZM14 5h6v6h-6V5ZM4 13h6v6H4v-6ZM14 13h6v6h-6v-6Z',
} as const;

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

/**
 * Một ô số liệu trong thẻ của một mã.
 *
 * `kind` có mặt vì bản rà soát thiết kế bắt được rằng NGÀY MUA đang hiện y hệt một khoản tiền:
 * cùng cỡ chữ, cùng độ đậm, cùng `tabular-nums`. Trước đợt này ô nào cũng là một cặp nhãn–giá trị
 * vô danh, nên CSS không có cách nào biết ô nào là số ô nào là ngày.
 *
 * Phân biệt bằng MẶT CHỮ và MÀU, không bằng căn lề: một bản thử căn phải cho ô số đã bị chủ dự án
 * bác ngay khi nhìn thấy — lý do đầy đủ ở chú thích "Căn lề: TẤT CẢ căn trái" trong
 * `PortfolioScreen.module.css`.
 *
 * `absent` tách "chưa có giá" và "—" khỏi một giá trị thật. Chúng chiếm đúng chỗ của một con số
 * nên phải trông khác một con số (FR-06: thiếu dữ liệu thì nói ra, không hiện 0).
 */
interface PortfolioCell {
  label: string;
  value: string;
  kind: 'number' | 'date';
  absent?: boolean;
}

/**
 * Hai tab của màn: mã đang nắm giữ, và phép tính đã lưu từ màn chi tiết công thức.
 *
 * Tab thứ hai KHÔNG tính lại con số nào. Tính lại đòi `FORMULA_MODULES`, tức cả Registry, trong
 * gói của `/danh-muc/` — đã đo một lần ở `LIVE_PRESET_FORMULAS`: 131 kB lên 217 kB, vượt hẳn cửa
 * 180 kB. Nên tab này chỉ bày lại con số đã cất kèm NGÀY LƯU, còn việc tính lại thuộc về nút
 * "Mở lại", nơi màn chi tiết chạy đúng bộ máy đã sinh ra nó.
 *
 * Tên công thức lấy từ `FORMULA_SUMMARIES` — chỉ mục nhẹ, cố ý không kéo theo hàm tính.
 */
type PortfolioTab = 'holdings' | 'saved';

/** Giá trị của `?tab=` trên URL. Tiếng Việt cho khớp lối đặt đường dẫn của cả sản phẩm. */
const SAVED_TAB_PARAM = 'cong-thuc';

/** Tra tên công thức theo id, dạng song ngữ. `undefined` khi id không còn trong Registry. */
const SUMMARY_BY_ID = new Map(FORMULA_SUMMARIES.map((summary) => [summary.id, summary]));

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
  const pick = usePick();
  const calcText = useCalcText();
  const valueText = useValueText();
  const router = useRouter();
  const { mode } = usePreferences();
  /** Chế độ Nâng cao mở thêm ô Beta, ô XIRR và ô nhập beta — FR-09. */
  const advanced = mode === 'advanced';
  const [holdings, setHoldings] = useState<ReadonlyArray<Holding>>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  /** Mã đang được SỬA. `null` nghĩa là form đang ở chế độ thêm mới. */
  const [editing, setEditing] = useState<string | null>(null);
  /**
   * Những mã đang MỞ khối chi tiết.
   *
   * Danh sách nay là dòng gọn ba cột đúng bản vẽ WF-06 — mã · số lượng/giá vốn · tỷ trọng/lãi lỗ
   * — nên thị giá, ngày mua, beta và ba nút hành động chuyển xuống khối mở ra khi bấm vào dòng.
   * Không thứ nào bị bỏ đi, chỉ đổi chỗ.
   *
   * Là một TẬP HỢP chứ không phải một mã: so hai mã cạnh nhau là việc thật, mà kiểu accordion
   * (mở cái này thì đóng cái kia) làm đúng việc ấy không làm được.
   */
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [asOf, setAsOf] = useState('');
  const [loaded, setLoaded] = useState(false);

  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [mountedSheets, setMountedSheets] = useState<ReadonlySet<SheetKind>>(() => new Set());
  /**
   * Công thức người dùng chọn ngay trong form. `null` nghĩa là chỉ lưu vào danh mục, không mở gì.
   *
   * ── Vì sao ô này nằm trong form chứ không thành một nút riêng ở dòng mã ──────────────────────
   *
   * Bản trước tách làm hai việc: thêm mã xong, muốn tính thì phải tìm lại dòng mã, bấm mở khối
   * chi tiết, rồi bấm "Tính công thức". Ba thao tác cho một ý định mà người dùng đã có từ trước
   * khi mở form. Chủ dự án báo đúng chỗ ấy là thừa.
   *
   * Nay ý định đi cùng dữ liệu: chọn mã, nhập số, chọn công thức — một nút làm cả hai. Ô này
   * **tuỳ chọn**, vì hai ý định vẫn là hai: có người chỉ theo dõi danh mục, không tính gì cả, và
   * bắt họ chọn công thức mới lưu được là dựng ra một cửa ải mới.
   *
   * Nó cũng có mặt ở chế độ SỬA, và đó là điều kiện để nút "Tính công thức" ở dòng mã được phép
   * bỏ đi: mã thêm từ tuần trước vẫn tính được, đường đi là Sửa → chọn công thức → "Lưu và mở".
   */
  const [plannedFormula, setPlannedFormula] = useState<string | null>(null);
  /**
   * Trang cần mở SAU KHI danh mục đã ghi xong xuống localStorage.
   *
   * Không gọi `router.push()` thẳng trong `submit()`: điều hướng làm màn này rời khỏi cây React,
   * mà việc ghi `PORTFOLIO_KEY` nằm trong một effect ăn theo `holdings`. Đẩy lệnh mở sang một
   * effect khai SAU effect ghi thì thứ tự chạy là xác định — effect chạy theo đúng thứ tự khai
   * trong cùng một lượt commit — nên mã vừa thêm chắc chắn đã nằm trên đĩa trước khi trang đổi.
   */
  const [pendingOpen, setPendingOpen] = useState<{ id: string; code: string } | null>(null);

  // ── Tab "Công thức": phép tính đã lưu từ màn chi tiết ──────────────────────
  const [tab, setTab] = useState<PortfolioTab>('holdings');
  /** Cụm hai tab, để đưa nó trở lại tầm mắt sau khi đổi tab — xem effect dưới `switchTab`. */
  const tablistRef = useRef<HTMLDivElement>(null);
  /** Bật khi NGƯỜI DÙNG bấm tab, để lần mở màn với `?tab=` không tự cuộn. */
  const tabJustClicked = useRef(false);
  /** Form thêm/sửa mã, để đưa nó vào tầm mắt khi mở — xem effect dưới `formOpen`. */
  const formRef = useRef<HTMLDivElement>(null);
  const [savedCalcs, setSavedCalcs] = useState<ReadonlyArray<SavedCalc>>([]);
  /** Id mục đang đổi tên tại chỗ. `null` nghĩa là không có mục nào đang sửa. */
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

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
      setSavedCalcs(parseSavedCalcs(window.localStorage.getItem(SAVED_CALCS_KEY)));
    } catch {
      // localStorage bị chặn — màn vẫn dùng được, chỉ không nhớ giữa hai lần mở.
    }

    /*
     * Tab mở sẵn đến từ `?tab=cong-thuc` — lối đi thẳng từ câu "Đã lưu vào Danh mục › Công thức"
     * ở sheet lưu.
     *
     * ⚠ `window.location.search` trong effect, KHÔNG `useSearchParams()`: với `output: 'export'`
     * hook đó buộc cây phải nằm trong `<Suspense>` và Next bỏ phần đó khỏi HTML tĩnh. Màn này
     * không có MathML để mất như 111 trang chi tiết, nhưng quy ước là một cho cả sản phẩm.
     */
    try {
      if (new URLSearchParams(window.location.search).get('tab') === SAVED_TAB_PARAM) {
        setTab('saved');
      }
    } catch {
      // URL lạ thì cứ mở tab mặc định.
    }

    setAsOf(todayIso());
    setLoaded(true);
  }, []);

  /**
   * Đổi tab và ghi lại vào URL, để nút Back của trình duyệt và việc chia sẻ đường dẫn đều đúng.
   *
   * `replaceState` chứ không `pushState`: đổi tab không phải là đi tới một màn khác, và nhồi
   * từng lượt bấm tab vào lịch sử sẽ biến nút Back thành "quay lại tab trước" — đúng cái bẫy mà
   * gói phóng to biểu đồ đã phải gỡ một lần.
   */
  const switchTab = useCallback((next: PortfolioTab): void => {
    setTab(next);
    setRenaming(null);
    tabJustClicked.current = true;

    try {
      const url = new URL(window.location.href);
      if (next === 'saved') url.searchParams.set('tab', SAVED_TAB_PARAM);
      else url.searchParams.delete('tab');
      window.history.replaceState(null, '', `${url.pathname}${url.search}`);
    } catch {
      // Trình duyệt chặn History API — tab vẫn đổi, chỉ là URL không theo.
    }
  }, []);

  /*
   * Đưa cụm tab trở lại tầm mắt sau khi đổi tab.
   *
   * Hai panel chênh nhau rất nhiều: đo trên Chrome thật với 3 mã và 1 phép tính đã lưu, trang cao
   * 1916px ở tab Mã và 780px ở tab Công thức. Đang đọc giữa danh sách mã mà bấm sang tab kia thì
   * trang co lại, trình duyệt tự kẹp vị trí cuộn (700 → 0) và người dùng bị ném đi một quãng
   * không ai yêu cầu. Chủ dự án báo cùng lúc với cú giãn ngang khi thanh cuộn biến mất — cú ấy
   * là hành vi mặc định của trình duyệt và đã cân nhắc rồi để nguyên, xem docblock cạnh khối
   * `body { overflow-x: clip }` trong `globals.css`.
   *
   * `block: 'nearest'` chứ không `'start'`: nó KHÔNG cuộn khi cụm tab vẫn đang trong tầm nhìn,
   * nên đứng ở đầu trang bấm tab thì màn hình đứng yên. Chỉ khi cụm tab đã bị đẩy lên trên nó mới
   * cuộn, và cuộn vừa đủ. Khoảng chừa dưới thanh trên dính do `scroll-margin-top` của `.tabs` lo,
   * nên ở đây không phải đo chiều cao thanh ấy bằng JavaScript.
   *
   * Chạy theo `tab` chứ không đặt thẳng trong `switchTab`: lúc ấy React chưa dựng lại panel nên
   * chiều cao trang vẫn là của tab cũ. Cờ `tabJustClicked` để lần mở màn với `?tab=cong-thuc`
   * không tự cuộn — người dùng chưa bấm gì cả.
   */
  useEffect(() => {
    if (!tabJustClicked.current) return;
    tabJustClicked.current = false;
    tablistRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'auto' });
  }, [tab]);

  /*
   * Đưa form vào tầm mắt khi nó vừa mở.
   *
   * Chủ dự án báo bấm "Sửa" xong "cảm giác không có gì thay đổi": nút Sửa nằm trong khối chi
   * tiết của MỘT dòng, mà form luôn dựng ở cuối cả danh sách — dòng đang sửa càng ở trên thì form
   * càng xa khỏi tầm nhìn, nên màn hình đứng yên trong khi form đã mở ra ở rất xa bên dưới.
   *
   * `formOpen` không bao giờ bật ngoài hai cú bấm của người dùng (nút Sửa và nút "Thêm mã cổ
   * phiếu"), khác `tab` — nó không có đường bật tự động nào cần một cờ "vừa bấm" để phân biệt.
   *
   * `block: 'start'` chứ không `'nearest'` như cụm tab: ở đây form là đích để THAO TÁC tiếp
   * (gõ số, chọn công thức), nên cần đưa hẳn lên đầu màn hình cho các ô nhập lộ ra trọn vẹn, chứ
   * không chỉ "vừa lọt vào tầm nhìn" — form dài hơn nhiều so với một mép khối vừa ló ra.
   *
   * Cùng khuôn `scrollToExample()` của `FormulaDetail.tsx`: kiểm `typeof` trước khi gọi
   * `matchMedia` lẫn `scrollIntoView` vì jsdom (môi trường test) không cài `matchMedia`.
   */
  useEffect(() => {
    if (!formOpen) return;
    const target = formRef.current;
    if (target === null || typeof target.scrollIntoView !== 'function') return;
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }, [formOpen]);

  /** Ghi lại kho phép tính đã lưu sau mỗi lần đổi tên hoặc xoá. */
  const persistSaved = useCallback((next: ReadonlyArray<SavedCalc>): void => {
    setSavedCalcs(next);
    try {
      window.localStorage.setItem(SAVED_CALCS_KEY, serializeSavedCalcs(next));
    } catch {
      // Hết dung lượng hoặc bị chặn — không chặn thao tác đang làm.
    }
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
   * Mở trang công thức sau khi lưu — effect này PHẢI khai ngay dưới effect ghi ở trên.
   *
   * React chạy các effect của cùng một lượt commit theo đúng thứ tự khai báo, nên đặt ở đây là
   * bảo đảm mã vừa thêm đã nằm trên đĩa trước khi `router.push()` kéo màn này ra khỏi cây. Gọi
   * thẳng `push()` trong `submit()` thì hai việc ấy đua nhau, và thứ thua là dữ liệu người dùng.
   *
   * `?ma=` là thứ `FormulaDetail` đọc để tự nạp số liệu của mã — xem docblock ở đó.
   */
  useEffect(() => {
    if (pendingOpen === null) return;
    setPendingOpen(null);
    router.push(`${formulaPath(pendingOpen.id)}?ma=${pendingOpen.code}`);
  }, [pendingOpen, router]);

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
    // Lựa chọn công thức thuộc về LƯỢT nhập này, không phải về màn — mở form lần sau là trắng.
    setPlannedFormula(null);
  }, []);

  /** Đóng/mở khối chi tiết của một mã. */
  const toggleDetail = useCallback((code: string): void => {
    setExpanded((current) => {
      const next = new Set(current);
      // `delete` trả false khi mã chưa có trong tập — tức dòng đang đóng, nên mở ra.
      if (!next.delete(code)) next.add(code);
      return next;
    });
  }, []);

  /**
   * Đóng khối chi tiết của một mã, dù nó đang mở hay không.
   *
   * Tách khỏi `toggleDetail` chứ không gọi lại nó: "đóng" và "đảo trạng thái" chỉ trùng nhau khi
   * dòng đang mở. Chỗ dùng là lúc BỎ một mã — hôm nay nút Bỏ chỉ với tới được từ trong khối đang
   * mở nên hai hàm cho cùng kết quả, nhưng ai đưa nút Bỏ ra chỗ khác (vuốt ngang, menu…) sẽ khiến
   * `toggleDetail` THÊM mã vừa xoá vào tập đang mở, và mã ấy thêm lại sau này sẽ tự bung sẵn.
   */
  const collapseDetail = useCallback((code: string): void => {
    setExpanded((current) => {
      if (!current.has(code)) return current;
      const next = new Set(current);
      next.delete(code);
      return next;
    });
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
    const typedBeta = betaTyped === '' ? null : parseViNumber(betaTyped);

    /*
     * Beta ghi xuống: chế độ Cơ bản KHÔNG đọc từ form mà lấy thẳng bản đang lưu.
     *
     * `updateHolding()` thay thế trọn bản ghi, nên bất cứ đường nào làm `beta` ra `null` ở đây
     * là xoá mất số người dùng đã nhập — mất dữ liệu, không phải ẩn hiển thị. Ở chế độ Cơ bản ô
     * beta không dựng ra nên form không phải nguồn sự thật của nó nữa; đọc lại từ `holdings` là
     * đường duy nhất không phụ thuộc việc `parseViNumber()` có đọc nổi chuỗi cũ hay không.
     * (Thêm một mã đã có thì `addHolding()` tự giữ — xem `portfolio-store.ts`.)
     */
    const storedBeta =
      editing === null ? null : (holdings.find((item) => item.code === editing)?.beta ?? null);
    const beta = advanced ? typedBeta : storedBeta;

    const next: FormErrors = {};
    if (code === '') next.code = t('portfolio.errCode');
    if (quantity === null || quantity <= 0) next.quantity = t('portfolio.errQuantity');
    if (costPrice === null || costPrice <= 0) next.costPrice = t('portfolio.errCostPrice');
    /*
     * Chỉ bắt lỗi beta khi ô beta ĐANG HIỆN — câu lỗi trên một ô vô hình là form từ chối lưu mà
     * không nói được vì sao.
     */
    if (advanced && betaTyped !== '' && typedBeta === null) next.beta = t('portfolio.errBeta');

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

    /*
     * Chọn công thức thì lưu xong đi thẳng tới nó. Xếp lịch chứ không điều hướng ngay — lý do ở
     * effect `pendingOpen`, ngay dưới effect ghi danh mục.
     *
     * Đặt TRƯỚC `closeForm()` vì hàm ấy xoá `plannedFormula`; đọc sau là đọc `null`.
     */
    if (plannedFormula !== null) setPendingOpen({ id: plannedFormula, code });

    closeForm();
  }, [form, editing, holdings, advanced, plannedFormula, t, closeForm]);

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

  /** Mã đang nhập ở form, đã chuẩn hoá. `null` khi chưa chọn mã nào. */
  const formCode = form.code.trim() === '' ? null : form.code.trim().toUpperCase();

  /**
   * Chưa chọn được công thức vì chưa có mã.
   *
   * Không phải chuyện thứ tự cho gọn: tỷ lệ "2/2 ô điền sẵn" của mỗi dòng trong sheet PHỤ THUỘC
   * mã có tra được thị giá hay không (xem `hasPrice` ở `FormulaForTickerSheet`). Mở sheet khi
   * chưa biết mã là in ra 31 con số chưa chắc đúng — đúng loại "số sai mà trông có lý" mà FR-06
   * dựng ra để chặn.
   */
  const formulaLocked = formCode === null;

  /**
   * Nhãn nút lưu — SÁU tổ hợp của hai câu hỏi độc lập.
   *
   * Câu một: nút sắp làm gì với danh mục (thêm dòng mới · cộng dồn vào dòng đã có · lưu bản sửa).
   * Câu hai: xong rồi có mở công thức không.
   *
   * Bảng tra thay vì ba tầng toán tử ba ngôi lồng nhau: bản lồng nhau đã ĐỂ LỌT một tổ hợp — chọn
   * một mã đang giữ RỒI chọn công thức thì nhãn ra "Thêm và mở công thức", trong khi việc sắp xảy
   * ra là cộng dồn. Đó đúng là lỗi mà `portfolio.formMerge` sinh ra để chữa (hứa sai ngay trên
   * đích bấm), và nhánh mới đã lặng lẽ dựng nó lại. Viết thành bảng thì chỗ hổng lộ ra bằng mắt.
   */
  const submitLabel = useMemo(() => {
    const open = plannedFormula !== null;
    if (editing !== null) return t(open ? 'portfolio.formSaveOpen' : 'portfolio.formSave');
    if (mergingInto !== null) return t(open ? 'portfolio.formMergeOpen' : 'portfolio.formMerge');
    return t(open ? 'portfolio.formSubmitOpen' : 'portfolio.formSubmit');
  }, [plannedFormula, editing, mergingInto, t]);

  /**
   * Tên công thức đang chọn ở form. `null` khi chưa chọn.
   *
   * Tra qua `FORMULA_SUMMARIES` chứ không cất sẵn chuỗi tên lúc chọn: tên là chữ ĐÃ DỊCH, mà ngôn
   * ngữ đổi được lúc chạy — cùng lý do `savedResult` định dạng lại từ số thô mỗi lần hiện. Công
   * thức bị gỡ khỏi Registry thì `id` vẫn là thứ nhận ra được, hơn là một ô trống.
   */
  const plannedFormulaName = useMemo(() => {
    if (plannedFormula === null) return null;
    const summary = SUMMARY_BY_ID.get(plannedFormula);
    return summary === undefined ? plannedFormula : pick(summary.name);
  }, [plannedFormula, pick]);

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

      {/*
        Hai tab: mã đang giữ · phép tính đã lưu.

        Dựng tay bằng `role="tablist"` chứ không qua một primitive: sản phẩm chưa có primitive
        tab nào, và đây là chỗ duy nhất cần nó. Số đếm nằm ngay trên nhãn để người dùng biết tab
        kia có gì mà không phải bấm sang xem.
      */}
      <div
        ref={tablistRef}
        className={styles.tabs}
        role="tablist"
        aria-label={t('portfolio.title')}
      >
        <button
          type="button"
          role="tab"
          id="portfolio-tab-holdings"
          aria-selected={tab === 'holdings'}
          aria-controls="portfolio-panel-holdings"
          className={tab === 'holdings' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => {
            switchTab('holdings');
          }}
        >
          {/* Icon `aria-hidden`, nên tên khả truy cập vẫn đúng là 'Mã (1)'. */}
          <StatIcon d={TILE_ICONS.tabHoldings} />
          {t('portfolio.tabHoldings')} ({holdings.length})
        </button>
        <button
          type="button"
          role="tab"
          id="portfolio-tab-saved"
          aria-selected={tab === 'saved'}
          aria-controls="portfolio-panel-saved"
          className={tab === 'saved' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => {
            switchTab('saved');
          }}
        >
          <StatIcon d={TILE_ICONS.tabSaved} />
          {t('portfolio.tabSaved')} ({savedCalcs.length})
        </button>
      </div>

      {tab === 'saved' ? (
        <section
          id="portfolio-panel-saved"
          role="tabpanel"
          aria-labelledby="portfolio-tab-saved"
          className={styles.block}
        >
          {savedCalcs.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden="true">
                <StatIcon d={TILE_ICONS.tabSaved} />
              </span>
              <p className={styles.emptyText}>{t('portfolio.savedEmpty')}</p>
            </div>
          ) : (
            <>
              {/*
                Nói thẳng rằng con số đang bày là con số CỦA LẦN LƯU, không phải số tính lại.
                Cùng ràng buộc mà thị giá đã lưu đang chịu ở tab bên cạnh: được dùng số cũ, nhưng
                phải nói rõ nó thuộc mốc nào (FR-06).
              */}
              <p className={styles.savedNote} role="note">
                {t('portfolio.savedResultNote')}
              </p>

              <ul className={styles.list}>
                {savedCalcs.map((saved) => {
                  const summaryOf = SUMMARY_BY_ID.get(saved.formulaId);
                  // Công thức bị gỡ khỏi Registry thì id vẫn là thứ nhận ra được, hơn là một dòng trống.
                  const formulaName =
                    summaryOf === undefined ? saved.formulaId : pick(summaryOf.name);

                  /*
                    Tên đã cất là chuỗi ĐÃ GHÉP ở ngôn ngữ lúc bấm Lưu, nên đổi sang EN nó vẫn
                    tiếng Việt trong khi dòng phụ ngay dưới đã dịch. `displayCalcName()` nhận ra
                    tên nào vốn là GỢI Ý rồi dựng lại ở ngôn ngữ đang xem; tên người dùng tự gõ
                    giữ nguyên từng chữ. Lý do đầy đủ ở docblock của hàm.
                  */
                  const savedName =
                    summaryOf === undefined
                      ? saved.name
                      : displayCalcName({
                          stored: saved.name,
                          viName: summaryOf.name.vi,
                          localName: formulaName,
                          ...(saved.code === undefined ? {} : { code: saved.code }),
                          ...(saved.resultValue === null
                            ? {}
                            : {
                                viResult: formatValueWithUnit(saved.resultValue, saved.resultUnit),
                                localResult: valueText(saved.resultValue, saved.resultUnit),
                              }),
                          savedAt: saved.savedAt,
                        });

                  return (
                    <li key={saved.id} className={styles.row}>
                      {renaming === saved.id ? (
                        <div className={styles.renameRow}>
                          <Input
                            label={t('portfolio.savedNameLabel')}
                            value={renameDraft}
                            maxLength={60}
                            onChange={(event) => {
                              setRenameDraft(event.target.value);
                            }}
                          />
                          <div className={styles.actions}>
                            <Button
                              size="sm"
                              disabled={renameDraft.trim() === ''}
                              onClick={() => {
                                persistSaved(renameSavedCalc(savedCalcs, saved.id, renameDraft));
                                setRenaming(null);
                              }}
                            >
                              {t('portfolio.savedSaveName')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRenaming(null);
                              }}
                            >
                              {t('portfolio.formCancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className={styles.savedName}>{savedName}</p>
                          <p className={styles.savedMeta}>
                            {saved.code === undefined
                              ? formulaName
                              : `${saved.code} · ${formulaName}`}
                            {' · '}
                            {t('portfolio.savedAt')} {formatIsoDate(isoDayOf(saved.savedAt))}
                            {saved.needsSeries && ` · ${t('portfolio.savedNeedsSeries')}`}
                          </p>
                          {/*
                            Kết quả định dạng lại từ SỐ THÔ mỗi lần hiện, không phải chuỗi đã cất
                            sẵn: chuỗi là chữ đã dịch, mà ngôn ngữ đổi được lúc chạy. Thiếu số thì
                            hiện gạch chứ không hiện 0 (FR-06).
                          */}
                          <p className={styles.savedResult}>
                            {saved.resultValue === null
                              ? '—'
                              : valueText(saved.resultValue, saved.resultUnit)}
                          </p>

                          <div className={styles.actions}>
                            <Link
                              className={styles.savedOpen}
                              href={`${formulaPath(saved.formulaId)}?luu=${saved.id}`}
                            >
                              {t('portfolio.savedOpen')}
                            </Link>
                            <Button
                              variant="secondary"
                              size="sm"
                              aria-label={`${t('portfolio.savedRename')} ${saved.name}`}
                              onClick={() => {
                                setRenaming(saved.id);
                                setRenameDraft(saved.name);
                              }}
                            >
                              {t('portfolio.savedRename')}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              aria-label={`${t('portfolio.savedRemove')} ${saved.name}`}
                              onClick={() => {
                                persistSaved(removeSavedCalc(savedCalcs, saved.id));
                              }}
                            >
                              {t('portfolio.savedRemove')}
                            </Button>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      ) : (
        /*
          `styles.panel` KHÔNG được bỏ. `.screen` là flex column có `gap`, nên trước khi có tab,
          sáu ô số · thanh thị giá · khối Nắm giữ là con TRỰC TIẾP của nó và được giãn cách sẵn.
          Bọc chúng vào một <div> trần để làm tabpanel là cắt đứt quan hệ ấy: cả ba dính sát
          nhau, thanh thị giá đè lên tiêu đề "NẮM GIỮ". `.panel` chép lại đúng luật giãn cách đó.
        */
        <div
          id="portfolio-panel-holdings"
          role="tabpanel"
          aria-labelledby="portfolio-tab-holdings"
          className={styles.panel}
        >
          {/*
            UI-04 (mức M) đòi dải miễn trừ nằm trong TẦM NHÌN ĐẦU TIÊN của trang có kết quả, và
            màn này bày sáu ô tiền ngay đầu màn — trong đó có lãi/lỗ của chính người dùng, tức
            con số dễ bị đọc thành lời khuyên nhất trong cả sản phẩm (rủi ro R-06). Trước đây câu
            miễn trừ duy nhất ở đây là dải `footer` của AppShell, nằm sau cả danh sách nắm giữ.
            Cùng lý do bản `notice` đã có ở màn chi tiết công thức.
          */}
          <DisclaimerBar variant="notice" />

          <div className={styles.stats}>
            <StatTile
              label={t('portfolio.totalValue')}
              output={summary.totalValue}
              showEyebrow={false}
              decimals={0}
              icon={<StatIcon d={TILE_ICONS.totalValue} />}
            />
            <StatTile
              label={t('portfolio.totalCost')}
              output={summary.totalCost}
              showEyebrow={false}
              decimals={0}
              icon={<StatIcon d={TILE_ICONS.totalCost} />}
            />
            <StatTile
              label={t('portfolio.gain')}
              output={summary.gain}
              showEyebrow={false}
              decimals={0}
              icon={<StatIcon d={TILE_ICONS.gain} />}
              /*
               * Phần trăm đi làm dòng phụ của chính ô Lãi/lỗ thay vì chiếm một ô thứ bảy: hai con số
               * là hai cách đọc CÙNG một đại lượng. Chỉ truyền khi nó thật sự tính được — không thì
               * `StatTile` in ra "— %" thừa, mà lý do đã nằm ngay trên đó rồi.
               */
              note={
                isCalculated(summary.gainPercent)
                  ? calcText(summary.gainPercent, { maxDecimals: 1 })
                  : undefined
              }
            />
            {/*
          Hai ô nâng cao — FR-09. Đặt TRƯỚC ô "Số mã" chứ không dồn xuống cuối, để thứ tự bốn ô
          còn lại ở chế độ Cơ bản vẫn là thứ tự người dùng đã quen: giá trị · vốn · lãi/lỗ · số mã.
        */}
            {advanced && (
              <>
                <StatTile
                  label={t('portfolio.beta')}
                  output={summary.beta}
                  showEyebrow={false}
                  icon={<StatIcon d={TILE_ICONS.beta} />}
                />
                <StatTile
                  label={t('portfolio.xirr')}
                  output={summary.xirr}
                  showEyebrow={false}
                  decimals={1}
                  icon={<StatIcon d={TILE_ICONS.xirr} />}
                />
              </>
            )}
            <StatTile
              label={t('portfolio.count')}
              output={summary.count}
              showEyebrow={false}
              decimals={0}
              icon={<StatIcon d={TILE_ICONS.count} />}
            />
          </div>

          {/*
        Dòng "2 ô nâng cao đang ẩn · Bật chế độ Nâng cao", ngay dưới lưới ô chứ không phải cuối
        màn: trình đọc màn hình phải gặp nó ngay sau bốn ô, đúng lúc câu hỏi "còn gì nữa không"
        nảy ra.
      */}
          {!advanced && (
            <HiddenByLevelNote count={ADVANCED_TILES} labelKey="portfolio.hiddenByLevel" />
          )}

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
                {!priceLoading && priceState === 'failed' && (
                  <span>{t('portfolio.priceFailed')}</span>
                )}
                {!priceLoading && priceState === 'stale' && (
                  <span>{t('portfolio.priceStale')}</span>
                )}
                {!priceLoading && priceAsOf !== null && (
                  <span>
                    {t('portfolio.priceSession')} {formatIsoDate(priceAsOf)}
                  </span>
                )}
                {/*
                  Nguồn TRẢ LỜI ĐƯỢC nhưng không mã nào có giá — ca thật, gặp ngay khi người dùng
                  gõ một mã không nằm trong danh sách Finbox (ví dụ 'VNI', vốn là chỉ số chứ không
                  phải cổ phiếu). Bốn nhánh trên đều tắt: không đang tải, không hỏng, không giá cũ,
                  và không có ngày phiên nào để khoe.

                  Không có nhánh này thì thanh chỉ còn mỗi nút "Làm mới" nằm chơ vơ bên phải một
                  hộp trắng — người dùng thấy một thao tác được mời gọi mà không biết để làm gì.
                  Lý do đầy đủ (mã nào thiếu, nên làm gì) đã nằm ở ô "Tổng giá trị" ngay trên, nên
                  ở đây chỉ cần một câu ngắn nói vì sao thanh này trống.
                */}
                {!priceLoading && priceState === 'ready' && priceAsOf === null && (
                  <span>{t('portfolio.priceNone')}</span>
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
              <div className={styles.empty}>
                <span className={styles.emptyIcon} aria-hidden="true">
                  <StatIcon d={TILE_ICONS.count} />
                </span>
                <p className={styles.emptyText}>{t('portfolio.empty')}</p>
              </div>
            ) : (
              <ul className={styles.holdList}>
                {summary.rows.map((row) => {
                  const { holding } = row;
                  const open = expanded.has(holding.code);

                  /*
                   * Số liệu của KHỐI CHI TIẾT, dựng thành các ô NHÃN–GIÁ TRỊ thay vì một câu nối
                   * bằng dấu chấm.
                   *
                   * Bản trước ghép tất cả thành `100 CP · giá vốn 21 ₫ · chưa có giá` rồi thêm một
                   * dòng `mua 02/08/2026 · beta 1,1` nữa, cả hai cùng cỡ chữ nhỏ nhất và cùng màu
                   * xám. Đọc ra thì được, nhưng KHÔNG dò được: mắt phải đọc hết cả câu mới biết con
                   * số nào là giá vốn, và nhãn lẫn giá trị trông y hệt nhau. Tách nhãn ra chữ nhỏ in
                   * hoa, giá trị để cỡ chữ thường màu đậm — đúng khuôn `StatTile` ở đầu màn, nên hai
                   * khối số của cùng một màn nói cùng một thứ tiếng.
                   *
                   * SỐ LƯỢNG, GIÁ VỐN và TỶ TRỌNG không còn ở đây: chúng đã đứng sẵn trên dòng gọn
                   * theo bản vẽ WF-06, và lặp lại chúng ngay dưới là bày cùng một con số hai lần.
                   *
                   * Ngày mua và beta chỉ hiện khi có. Ngày mua đáng ngại nhất trong nhóm — gõ nhầm
                   * năm là đúng cái bẫy mà luật `MODEL_VIOLATION` ở `summarisePortfolio()` dựng ra
                   * để chặn, mà người dùng lại không có cách nào nhìn thấy ngày đang lưu để sửa.
                   */
                  const cells: ReadonlyArray<PortfolioCell> = [
                    {
                      label: t('portfolio.marketPrice'),
                      // Thiếu giá thì nói thẳng là chưa có, KHÔNG hiện 0 ₫ (FR-06).
                      value:
                        row.marketPrice === null
                          ? t('portfolio.priceMissing')
                          : `${formatNumber(row.marketPrice) ?? '—'} ₫`,
                      kind: 'number',
                      /*
                       * Chữ "chưa có giá" ĐỨNG ĐÚNG CHỖ của một khoản tiền, nên phải trông khác
                       * một khoản tiền — nếu không nó đọc ra như một giá trị thật.
                       */
                      absent: row.marketPrice === null,
                    },
                    {
                      /*
                       * PHẦN TRĂM lãi/lỗ, còn số tiền thì đã đứng trên dòng gọn ngay phía trên.
                       * Hai vế của cùng một con số nên không lặp; tách như vậy vì dòng gọn chỉ đủ
                       * chỗ cho một vế, mà số tiền mới là vế trả lời được "lãi bao nhiêu".
                       */
                      label: t('portfolio.gain'),
                      value:
                        row.gainPercent === null
                          ? '—'
                          : `${row.gainPercent >= 0 ? '+' : '−'}${
                              formatNumber(Math.abs(row.gainPercent), { maxDecimals: 1 }) ?? '—'
                            }%`,
                      kind: 'number',
                      absent: row.gainPercent === null,
                    },
                    ...(holding.buyDate === ''
                      ? []
                      : [
                          {
                            label: t('portfolio.formBuyDate'),
                            value: formatIsoDate(holding.buyDate),
                            /*
                             * NGÀY, không phải số. Bản rà soát thiết kế bắt đúng chỗ này: ngày mua
                             * trước đây hiện y hệt một khoản tiền — cùng cỡ, cùng độ đậm, cùng
                             * `tabular-nums` — nên `02/08/2026` đọc thoáng qua ra một con số.
                             */
                            kind: 'date' as const,
                          },
                        ]),
                    /*
                     * Beta chỉ hiện ở chế độ Nâng cao — cùng luật với ô Beta ở đầu màn và ô nhập
                     * trong form. Ở chế độ Cơ bản, form không có ô beta nên bày con số ra đây là
                     * bày một thứ chính chế độ đang xem không cho sửa.
                     */
                    ...(!advanced || holding.beta === undefined || holding.beta === null
                      ? []
                      : [
                          {
                            label: t('portfolio.betaShort'),
                            value:
                              formatNumber(holding.beta, { maxDecimals: 4 }) ??
                              String(holding.beta),
                            kind: 'number' as const,
                          },
                        ]),
                  ];

                  const up = row.gain !== null && row.gain >= 0;

                  return (
                    <li key={holding.code} className={styles.holdRow}>
                      {/*
                      Dòng gọn ba cột đúng bản vẽ WF-06: mã · số lượng/giá vốn · tỷ trọng/lãi lỗ.

                      Cái bấm được là một nút PHỦ LÊN cả dòng (`.holdToggle`, xem CSS), không phải
                      một nút bọc quanh nội dung. Lý do là quy tắc tính tên trợ năng: `aria-label`
                      NUỐT toàn bộ nội dung bên trong nút, nên bọc cả dòng vào nút sẽ làm số lượng,
                      giá vốn, tỷ trọng và lãi/lỗ biến mất khỏi bản đọc.

                      Đã thử hướng ngược lại (bỏ `aria-label`, để tên nút tự ghép từ nội dung) và
                      nó hỏng: tên được ghép SAU KHI cắt khoảng trắng hai đầu từng thẻ con, nên
                      nghe thành "FPT500 CPgiá vốn 78.000 ₫". Nút phủ giữ được cả hai: nhãn sạch
                      ("Chi tiết FPT"), còn mọi con số nằm ngoài nút nên vẫn được đọc như chữ
                      thường của mục danh sách.
                    */}
                      <div className={styles.holdSummary}>
                        <button
                          type="button"
                          className={styles.holdToggle}
                          aria-expanded={open}
                          aria-label={`${t('portfolio.details')} ${holding.code}${
                            holding.name === undefined ? '' : ` ${holding.name}`
                          }`}
                          onClick={() => {
                            toggleDetail(holding.code);
                          }}
                        />

                        <span className={styles.holdCode}>{holding.code}</span>

                        <span className={styles.holdMid}>
                          <span className={styles.holdQuantity}>
                            {formatNumber(holding.quantity) ?? holding.quantity}{' '}
                            {t('portfolio.shares')}
                          </span>
                          <span className={styles.holdCost}>
                            {t('portfolio.costPrice')} {formatNumber(holding.costPrice) ?? '—'} ₫
                          </span>
                        </span>

                        {/*
                        Cột phải: tỷ trọng ở trên (đúng bản vẽ), lãi/lỗ ngay dưới — con số người
                        ta mở màn để xem. Dấu +/− mang tin chứ không chỉ có màu (NFR-USA-06).

                        Thiếu thị giá thì CẢ HAI biến mất và cột nói thẳng "chưa có giá", chứ
                        không hiện 0 ₫ hay 0% (FR-06): tỷ trọng cũng tính từ thị giá nên nó
                        `null` cùng lúc với lãi/lỗ, và một dấu gạch ở đây không nói được lý do.
                      */}
                        <span className={styles.holdRight}>
                          {row.marketPrice === null ? (
                            <span className={styles.holdMissing}>
                              {t('portfolio.priceMissing')}
                            </span>
                          ) : (
                            <>
                              <span className={styles.holdWeight}>
                                {row.weight === null
                                  ? '—'
                                  : `${formatNumber(row.weight, { maxDecimals: 0 }) ?? '—'}%`}
                              </span>
                              <span className={styles.holdWeightLabel}>
                                {t('portfolio.weight')}
                              </span>
                              {row.gain !== null && (
                                <span
                                  className={[
                                    styles.holdGain,
                                    up ? styles.holdGainUp : styles.holdGainDown,
                                  ].join(' ')}
                                >
                                  {up ? '+' : '−'}
                                  {formatNumber(Math.abs(row.gain), { maxDecimals: 0 }) ?? '—'} ₫
                                </span>
                              )}
                            </>
                          )}
                        </span>

                        {/*
                        Mũi tên là thứ DUY NHẤT nói cho người dùng biết dòng này bấm được. Bản
                        trước học đúng bài này với dấu bút chì: hai lượt đầu nó chỉ đổi màu lúc rê
                        chuột, mà màn thiết kế cho 360px và điện thoại không có trạng thái rê
                        chuột. Bản vẽ WF-06 không có mũi tên, nhưng bản vẽ cũng không có khối mở
                        ra — có khối thì phải có tay nắm.

                        Trình đọc màn hình không nghe thấy ký hiệu này: `aria-label` của nút phủ
                        đã nói "Chi tiết FPT", và `aria-expanded` nói đang mở hay đóng.
                      */}
                        <span
                          className={
                            open ? `${styles.holdMark} ${styles.holdMarkOpen}` : styles.holdMark
                          }
                          aria-hidden="true"
                        >
                          <StatIcon d="m6 9 6 6 6-6" />
                        </span>
                      </div>

                      {open && (
                        <div className={styles.holdDetail}>
                          {/*
                          Tên doanh nghiệp xuống đây vì cột mã trên dòng gọn chỉ rộng đúng ba đến
                          bốn ký tự. Nó là thứ để NHẬN RA mã chứ không phải thứ đọc kỹ, nên chỗ
                          của nó là khối mở ra, không phải dòng danh sách.
                        */}
                          {holding.name !== undefined && (
                            <p className={styles.holdName}>{holding.name}</p>
                          )}

                          <dl className={styles.cells}>
                            {cells.map((cell) => (
                              /*
                                Chỉ ô NGÀY mang lớp riêng. Ô số không cần lớp nào — mọi ô căn trái như
                                nhau, xem chú thích "Căn lề: TẤT CẢ căn trái" ở `PortfolioScreen.module.css`.
                              */
                              <div
                                key={cell.label}
                                className={`${styles.cell} ${cell.kind === 'date' ? styles.cellDate : ''}`.trimEnd()}
                              >
                                <dt className={styles.cellLabel}>{cell.label}</dt>
                                <dd
                                  className={`${styles.cellValue} ${cell.absent === true ? styles.cellAbsent : ''}`.trimEnd()}
                                >
                                  {cell.value}
                                </dd>
                              </div>
                            ))}
                          </dl>

                          {/*
                        Hai nút cuối khối là NÚT THẬT có chữ, không còn là ký tự `ƒ` và `×` trần.

                        Bản trước để hai ký tự ấy trên nền trong suốt, màu chữ mờ, không viền — chủ dự
                        án báo là "hiển thị mờ nhạt và không biết có thể thao tác", và đúng: một ký
                        tự xám không có gì phân biệt với chữ trang trí. Dùng primitive `Button` thì
                        được luôn viền, vòng focus và vùng chạm 44px đã chuẩn hoá sẵn.

                        Từng có nút thứ ba, "Tính công thức", và nó đã bỏ ở đợt gộp luồng thêm mã:
                        chọn công thức nay nằm ngay trong form, nên với mã đã có thì đường đi là
                        Sửa → chọn công thức → "Lưu và mở". Một cửa cho cả thêm mới lẫn mã cũ, thay
                        vì hai lối làm cùng một việc.
                      */}
                          <div className={styles.actions}>
                            {/* Nút Sửa thay chỗ dấu bút chì cũ: dòng gọn nay mở khối chi tiết chứ không mở form. */}
                            <Button
                              variant="secondary"
                              size="sm"
                              aria-label={`${t('portfolio.edit')} ${holding.code}`}
                              onClick={() => {
                                startEdit(holding);
                              }}
                            >
                              {t('portfolio.edit')}
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
                                /*
                                 * Gỡ mã khỏi tập đang mở. Không gỡ thì thêm lại đúng mã ấy sau này
                                 * sẽ hiện ra với khối chi tiết bung sẵn — dấu vết của một thao tác
                                 * người dùng đã quên từ lâu.
                                 */
                                collapseDetail(holding.code);
                              }}
                            >
                              {t('portfolio.remove')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {formOpen ? (
              <div ref={formRef} className={styles.form}>
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

                {/*
              Ô nhập beta chỉ có ở chế độ Nâng cao — FR-09.

              `form.beta` VẪN được `startEdit()` đổ đầy dù ô không dựng ra, và `submit()` vẫn ghi
              lại đúng giá trị ấy. Bỏ đi là mỗi lần sửa một mã ở chế độ Cơ bản sẽ xoá mất beta
              người dùng đã nhập trước đó — mất dữ liệu, không phải ẩn hiển thị.
            */}
                {advanced && (
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
                )}

                {/*
              Ô chọn công thức — TUỲ CHỌN, và là thứ gộp hai luồng của màn làm một.

              Cùng khuôn `.codeField` ngay trên: một nút mở sheet, không phải `<select>`. Ở đây lý
              do còn mạnh hơn — 31 dòng nhưng mỗi dòng mang thêm tỷ lệ "2/2 ô điền sẵn", thứ một
              `<option>` không chở nổi.

              Khoá lại khi chưa chọn mã, và đó không phải chuyện thứ tự cho gọn: tỷ lệ ô điền sẵn
              của mỗi công thức PHỤ THUỘC mã có tra được thị giá hay không (xem `hasPrice` ở
              `FormulaForTickerSheet`). Mở sheet khi chưa biết mã là in ra 31 con số chưa chắc
              đúng — đúng loại "số sai mà trông có lý" mà FR-06 dựng ra để chặn.
            */}
                <div className={styles.codeField}>
                  <span className={styles.codeLabel} id="portfolio-formula-label">
                    {t('portfolio.formulas')}
                  </span>
                  <button
                    type="button"
                    className={styles.codeButton}
                    aria-labelledby="portfolio-formula-label"
                    aria-describedby="portfolio-formula-hint"
                    onClick={() => {
                      /*
                       * Chưa có mã thì mở sheet CHỌN MÃ, không phải không làm gì.
                       *
                       * Bản đầu để `disabled` và chủ dự án báo ngay: "bấm vào chọn công thức không
                       * thấy hiệu ứng gì". Đúng — kiểu dáng khoá (viền nét đứt, nền chìm) quá nhẹ
                       * so với ô chọn mã ngay trên, mà chữ trên nút vẫn hứa "Chọn công thức". Một
                       * nút hứa một việc rồi im lặng là hỏng, dù câu gợi ý bên dưới có nói lý do.
                       *
                       * Nay nút nói đúng thứ nó sẽ làm ("Chọn mã cổ phiếu trước") và làm đúng thứ
                       * ấy. Ngõ cụt thành một bước đi tiếp.
                       */
                      openSheet(formulaLocked ? 'ticker' : 'formulas');
                    }}
                  >
                    {formulaLocked ? (
                      <span className={styles.codePlaceholder}>{t('portfolio.pickCodeFirst')}</span>
                    ) : plannedFormulaName === null ? (
                      <span className={styles.codePlaceholder}>{t('portfolio.pickFormula')}</span>
                    ) : (
                      <span className={styles.formulaName}>{plannedFormulaName}</span>
                    )}
                  </button>
                  <span className={styles.codeHint} id="portfolio-formula-hint">
                    {formulaLocked ? t('portfolio.formulaNeedsCode') : t('portfolio.formulaHint')}
                  </span>
                  {plannedFormula !== null && (
                    <button
                      type="button"
                      className={styles.clearFormula}
                      onClick={() => {
                        setPlannedFormula(null);
                      }}
                    >
                      {t('portfolio.formulaClear')}
                    </button>
                  )}
                </div>

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
                  <Button onClick={submit}>{submitLabel}</Button>
                  <Button variant="ghost" onClick={closeForm}>
                    {t('portfolio.formCancel')}
                  </Button>
                </div>
              </div>
            ) : (
              /*
                Nút hành động chính của cả màn — khung nét đứt rộng hết hàng, đúng bản vẽ WF-06.

                Đây là lần thứ hai kiểu nét đứt được dùng, và lần trước nó bị bỏ vì "đọc ra như
                một chỗ trống chờ điền chứ không phải một nút bấm". Chủ dự án chọn lại kiểu này
                khi đối chiếu với bản vẽ; hai thứ giữ lại từ bài học ấy là chữ ĐẬM màu nhấn và
                nền `accent-soft` — mặt phẳng có màu thì không còn đọc ra như một ô trống.

                Dấu cộng chuyển từ ký tự trần sang SVG `aria-hidden`: trước đó tên khả truy cập
                của nút là "+ Thêm mã cổ phiếu", nay đúng bằng nhãn thật.
              */
              <div className={styles.addRow}>
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={() => {
                    setFormOpen(true);
                  }}
                >
                  <StatIcon d="M12 5v14M5 12h14" />
                  {t('portfolio.add')}
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/*
        Dòng cam kết riêng tư nằm NGOÀI cả hai tab: nó nói về toàn bộ dữ liệu của màn, và phép
        tính đã lưu cũng nằm trên máy người dùng y như số lượng và giá vốn.
      */}
      <p className={styles.local}>
        <span className={styles.localTag}>
          {/* Ổ khoá — dấu hiệu thứ hai bên cạnh chữ, cho người lướt nhanh không đọc cả câu. */}
          <StatIcon d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5v-9Z" />
          {t('portfolio.localTag')}
        </span>
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
          onPick={setPlannedFormula}
          /*
           * Mã của sheet là mã ĐANG NHẬP ở form, không phải một mã trong danh sách: sheet chỉ mở
           * được từ trong form, và nút mở nó bị khoá cho tới khi có mã.
           */
          code={formCode}
          /*
           * Mã chưa tra được giá thì sheet phải nói khác đi: 15 công thức điền hụt một ô và 8
           * công thức không điền được ô nào. Dữ liệu đã nằm sẵn trong `quotes`, không thêm lời
           * gọi mạng nào. `null` (chưa chọn mã nào) coi như có giá — sheet lúc đó không mở được.
           */
          hasPrice={formCode === null || (quotes.get(formCode)?.priceVnd ?? null) !== null}
        />
      )}
    </div>
  );
}
