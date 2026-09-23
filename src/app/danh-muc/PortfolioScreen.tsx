'use client';

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  FORMULA_SUMMARIES,
  MARKET_FEED,
  MAX_HOLDINGS,
  PORTFOLIO_KEY,
  PRICE_CACHE_KEY,
  SAVED_CALCS_ANCHOR,
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
  keepViNumberChars,
  oldestAsOf,
  parseCachedPrices,
  parseHoldings,
  parseSavedCalcs,
  parseViNumber,
  removeHolding,
  removeSavedCalc,
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
import { filterTypedValue, guardFilteredDelete, resetFilteredDelete } from '@/ui/inputs';
import { DisclaimerBar } from '@/ui/navigation';
import { BottomSheet, Button, Input } from '@/ui/primitives';
import { StatTile } from '@/ui/result';
import { FormulaForTickerSheet, TickerPickerSheet } from '@/ui/sheets';

import styles from './PortfolioScreen.module.css';

/**
 * Màn WF-06 Danh mục cá nhân — gói WBS 3.4.1, mở rộng ở gói "Danh mục dùng số liệu thật" và
 * gói "Tám đề mục còn hở".
 *
 * Sáu con số đầu màn đều là **kết quả tính** nên đi qua `StatTile` nhận thẳng `CalcOutput`:
 * thiếu dữ liệu thì ô hiện "_ _" kèm lý do chứ không hiện 0 (FR-06). Đây là chỗ dễ vi phạm
 * nhất trong cả sản phẩm — một danh mục mới toanh có tổng giá trị chưa xác định, không phải 0 ₫.
 *
 * ── Sáu ô ở chế độ Nâng cao, bốn ô ở Cơ bản (FR-09) ─────────────────────────────────────────
 *
 * Beta và XIRR là hai khái niệm nâng cao thật, và với người dùng F0 chúng gần như **luôn** ở
 * trạng thái "_ _": beta là bình quân gia quyền nên thiếu beta của một mã là hỏng cả ô, mà
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
 *
 * Ba ô số của form (số lượng, giá vốn, beta) vẫn phải theo cùng luật gõ với `NumberInput`: chữ
 * cái không bao giờ xuất hiện trong ô. Lọc ngay tại `onChange` của từng ô chứ KHÔNG lọc trong
 * `setField()` — hàm ấy còn gánh `buyDate` (ô `type="date"`) và cặp `code`/`name` do `pickTicker`
 * đặt, nên nhét luật nội dung vào đó là phải viết thêm một danh sách khoá cho phép rồi giấu nó
 * đi một tầng. Câu lỗi lúc chốt vẫn còn nguyên: người dùng để trống ô thì `submit()` vẫn nói ra.
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
 * Thời gian tối đa màn giữ khối "Phép tính đã lưu" ở đầu tầm nhìn sau khi đáp xuống bằng neo.
 *
 * Đủ dài để phủ lời gọi thị giá trên mạng di động chậm (đo trên dev server: vài trăm mili giây),
 * và không bao giờ là lý do chính để dừng — người dùng chạm vào màn là dừng ngay. Xem effect cuộn
 * tới neo trong `PortfolioScreen`.
 */
const HOLD_ANCHOR_MS = 8000;

/**
 * Số ô mà chế độ Cơ bản giấu đi — Beta và XIRR.
 *
 * Con số này phải khớp số `StatTile` nằm trong nhánh `advanced &&` bên dưới. Không đếm được tự
 * động vì chúng là JSX, nên `PortfolioScreen.test.tsx` gác bằng cách đếm ô thật ở cả hai chế độ
 * rồi so hiệu số với chính hằng số này — thêm một ô nâng cao mà quên sửa đây là đỏ ngay.
 */
const ADVANCED_TILES = 2;

/**
 * Số cột của bảng Nắm giữ — tám cột số liệu cộng một cột chở mũi tên.
 *
 * Dùng cho `colSpan` của hàng mở ra. Đếm hụt thì hàng ấy không trải hết bề ngang và trình duyệt
 * độn thêm một ô trống vào cuối bảng; đếm dư thì bảng rộng hơn chính nó. Cả hai đều là lỗi lặng,
 * nên `PortfolioScreen.test.tsx` đối chiếu hằng số này với số `<th>` thật trong hàng tiêu đề.
 */
const HOLD_COLUMNS = 9;

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
 * `absent` tách "chưa có giá" và "_ _" khỏi một giá trị thật. Chúng chiếm đúng chỗ của một con số
 * nên phải trông khác một con số (FR-06: thiếu dữ liệu thì nói ra, không hiện 0).
 */
interface PortfolioCell {
  label: string;
  value: string;
  kind: 'number' | 'date';
  absent?: boolean;
}

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
   * Mã đang MỞ khối chi tiết. `null` nghĩa là mọi dòng đều đang đóng.
   *
   * Danh sách nay là dòng gọn ba cột đúng bản vẽ WF-06 — mã · số lượng/giá vốn · tỷ trọng/lãi lỗ
   * — nên thị giá, ngày mua, beta và ba nút hành động chuyển xuống khối mở ra khi bấm vào dòng.
   * Không thứ nào bị bỏ đi, chỉ đổi chỗ.
   *
   * Là MỘT mã chứ không phải một tập hợp: kiểu accordion, mở dòng này thì dòng đang mở tự đóng.
   * Bản trước giữ một `Set` với lập luận "so hai mã cạnh nhau là việc thật" — chủ dự án đã bác lập
   * luận ấy trên màn hình thật: mỗi khối chi tiết cao gần bằng ba dòng gọn, nên hai khối cùng mở
   * đẩy mã thứ hai xuống dưới nếp gấp và cái người dùng nhìn thấy không còn là hai mã cạnh nhau,
   * mà là một khối số lơ lửng không rõ thuộc về ai. So sánh vốn đã có chỗ riêng và chỗ ấy làm tốt
   * hơn: dòng gọn ba cột luôn bày sẵn tỷ trọng và lãi/lỗ của MỌI mã cùng lúc.
   */
  const [expanded, setExpanded] = useState<string | null>(null);
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

  /**
   * Các phép tính người dùng bấm "Lưu vào danh mục" ở màn chi tiết công thức.
   *
   * Khối bày chúng từng là tab "Công thức" và bị gỡ cùng cụm tab (14/09/2026), trong khi nút Lưu
   * ở 111 màn chi tiết vẫn ghi vào kho — tức lưu xong không có chỗ nào để thấy lại. Chủ dự án báo
   * đúng hệ quả ấy như một lỗi (15/09/2026), nên khối quay lại, lần này KHÔNG có tab: nó là khối
   * thứ hai của cùng một màn, đứng dưới khối Nắm giữ.
   */
  const [savedCalcs, setSavedCalcs] = useState<ReadonlyArray<SavedCalc>>([]);

  /** Khối "Phép tính đã lưu", để cuộn tới khi URL mang neo của nó — xem effect dưới `loaded`. */
  const savedRef = useRef<HTMLElement>(null);

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

    try {
      setSavedCalcs(parseSavedCalcs(window.localStorage.getItem(SAVED_CALCS_KEY)));
    } catch {
      // Cùng lý do ngay trên — không đọc được thì coi như chưa lưu gì, khối tự ẩn.
    }

    /*
     * Không còn nhánh đọc `?tab=cong-thuc`: cụm tab đã bỏ (14/09/2026), nên tham số ấy không mở
     * ra được gì nữa. URL cũ ai đó đã bookmark vẫn vào đúng màn này, chỉ là tham số bị lờ đi.
     * Lối vào thẳng khối phép tính đã lưu nay là neo `#phep-tinh-da-luu` — xem effect ngay dưới.
     */
    setAsOf(todayIso());
    setLoaded(true);
  }, []);

  /*
   * Cuộn tới khối "Phép tính đã lưu" khi URL mang neo của nó — đích đến của nút Lưu ở màn chi
   * tiết công thức (`savedCalcsPath()`) — và GIỮ nó ở đó cho tới khi bố cục phía trên thôi đổi.
   *
   * Không trông vào việc trình duyệt tự nhảy tới neo: khối chỉ dựng khi kho có mục, mà kho đọc từ
   * localStorage TRONG effect, nên lúc trình duyệt dò neo thì phần tử mang `id` ấy chưa có.
   *
   * Cuộn MỘT LẦN cũng không đủ, và đây là số đo trên Chrome thật chứ không phải phỏng đoán (danh
   * mục 6 mã, dev server): cuộn ngay lúc `loaded` thì thị giá còn chưa về. Vài trăm mili giây sau
   * lời gọi Finbox trả lời, mỗi dòng Nắm giữ cao thêm một hàng (tỷ trọng, lãi/lỗ) và dải "Giá
   * phiên" hiện ra — cả khối Phép tính đã lưu bị đẩy xuống. Kết quả đo được: mép trên khối dừng ở
   * 702/780px (khổ 360) và 889/900px (khổ 1440), tức chỉ ló ra ở đáy màn. Đúng cảm giác "lưu xong
   * không thấy đâu" mà lỗi này sinh ra để chữa.
   *
   * Cơ chế neo cuộn sẵn có của trình duyệt (`overflow-anchor`) không cứu được: nó chọn phần tử
   * ĐANG trong tầm nhìn làm mốc, mà lúc thị giá về thì các dòng Nắm giữ vẫn nằm trong tầm nhìn.
   *
   * Nên: `ResizeObserver` trên khung màn, mỗi lần khung đổi cỡ thì canh lại khối lên đầu. Hai điều
   * kiện dừng, và điều kiện đầu là thứ quyết định việc này có được phép làm hay không:
   *
   *   1. Người dùng TỰ thao tác (lăn chuột, chạm, nhấn phím, bấm) — từ lúc ấy màn thôi giành cuộn.
   *      Kéo người ta về chỗ cũ trong lúc họ đang cuộn đi là một lỗi tệ hơn lỗi đang chữa.
   *   2. Quá `HOLD_ANCHOR_MS` — mạng chậm tới đâu thì cũng không giữ vô hạn.
   *
   * `behavior: 'auto'` chứ không `smooth`: đây là lượt đáp xuống sau khi chuyển trang, cùng bản
   * chất với cú nhảy tới neo của trình duyệt, không phải một thao tác trong trang. Và một lượt cuộn
   * mượt đang chạy dở sẽ bị lượt canh lại kế tiếp cắt ngang thành một cú giật.
   */
  useEffect(() => {
    if (!loaded) return;
    if (window.location.hash !== `#${SAVED_CALCS_ANCHOR}`) return;

    const target = savedRef.current;
    if (target === null || typeof target.scrollIntoView !== 'function') return;

    const align = (): void => {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
    };

    // Lượt đầu chờ một khung hình: effect chạy sau commit nhưng có thể trước lượt tính bố cục.
    const frame = window.requestAnimationFrame(align);

    let observer: ResizeObserver | null = null;
    const root = target.parentElement;
    if (root !== null && typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(align);
      observer.observe(root);
    }

    const USER_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
    let timer = 0;
    const release = (): void => {
      observer?.disconnect();
      observer = null;
      window.clearTimeout(timer);
      for (const name of USER_EVENTS) window.removeEventListener(name, release);
    };
    for (const name of USER_EVENTS) window.addEventListener(name, release, { passive: true });
    timer = window.setTimeout(release, HOLD_ANCHOR_MS);

    return () => {
      window.cancelAnimationFrame(frame);
      release();
    };
  }, [loaded]);

  /** Ghi lại kho phép tính đã lưu sau mỗi lần xoá một mục. */
  const persistSaved = useCallback((next: ReadonlyArray<SavedCalc>): void => {
    setSavedCalcs(next);
    try {
      window.localStorage.setItem(SAVED_CALCS_KEY, serializeSavedCalcs(next));
    } catch {
      // Hết dung lượng hoặc bị chặn — không chặn thao tác đang làm.
    }
  }, []);

  /*
   * ── Hiệu ứng "kéo form vào tầm mắt" đã BỎ (22/09/2026) ────────────────────────────────────
   *
   * Nó sinh ra vì chủ dự án báo bấm "Sửa" xong "cảm giác không có gì thay đổi": nút Sửa nằm
   * trong khối chi tiết của MỘT dòng, mà form luôn dựng ở CUỐI cả danh sách — dòng đang sửa càng
   * ở trên thì form càng xa tầm nhìn, nên màn hình đứng yên trong khi form đã mở ở rất xa bên
   * dưới.
   *
   * Từ đợt này form không còn nằm trong dòng chảy của trang: nó là hộp thoại nổi giữa màn
   * (`<BottomSheet placement="center">`), mở ra là đè lên chính giữa tầm nhìn và trình duyệt tự
   * chuyển tiêu điểm vào trong. Không còn khoảng cách nào để cuộn qua, nên giữ lại một lời gọi
   * `scrollIntoView` là cuộn nền phía sau một tấm đang che nó. `formRef` đi theo effect này.
   */

  /*
   * `persistSaved()` đã bỏ cùng panel "phép tính đã lưu": nó chỉ phục vụ nút Xoá của từng dòng
   * trong danh sách ấy, mà danh sách nay không còn được dựng ở đâu. Kho `ffb.savedCalcs.v1` vẫn
   * sống — màn chi tiết vẫn ghi vào — nhưng màn này thôi đọc và thôi ghi nó.
   */

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
         * 3. Không có gì cả → `'failed'`, màn hiện "_ _" kèm lý do.
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

  /**
   * Đóng/mở khối chi tiết của một mã, kiểu accordion.
   *
   * Mở một mã khác thì mã đang mở tự đóng — đó là toàn bộ việc phép gán này làm, chứ không cần một
   * bước "đóng cái cũ" riêng: trạng thái chỉ giữ được một mã nên không có cách nào để hai khối cùng
   * mở. Bấm lại đúng mã đang mở thì về `null`, tức đóng.
   */
  const toggleDetail = useCallback((code: string): void => {
    setExpanded((current) => (current === code ? null : code));
  }, []);

  /**
   * Đóng khối chi tiết của một mã, dù nó đang mở hay không.
   *
   * Tách khỏi `toggleDetail` chứ không gọi lại nó: "đóng" và "đảo trạng thái" chỉ trùng nhau khi
   * dòng đang mở. Chỗ dùng là lúc BỎ một mã — hôm nay nút Bỏ chỉ với tới được từ trong khối đang
   * mở nên hai hàm cho cùng kết quả, nhưng ai đưa nút Bỏ ra chỗ khác (vuốt ngang, menu…) sẽ khiến
   * `toggleDetail` MỞ khối chi tiết của đúng mã vừa xoá.
   */
  const collapseDetail = useCallback((code: string): void => {
    setExpanded((current) => (current === code ? null : current));
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
      {/*
        KHÔNG có `<h1>` ở đây — tiêu đề "Danh mục của tôi" nay do thanh trên dựng
        (`HeaderIdentity` + `headerTitleKey()`). Trang vẫn đúng một `<h1>`, chỉ đổi chỗ.

        Phụ đề "Lưu tại thiết bị · không cần đăng nhập" cũng bỏ theo, chủ dự án chốt.
      */}

      {/*
        ⚠ CỤM TAB (Mã · Công thức) đã BỎ — chủ dự án chốt 14/09/2026: *"bỏ tabbar đi và giữ lại
        toàn bộ giao diện và logic thêm mã cổ phiếu cũ"*. Màn này nay chỉ còn MỘT nội dung.

        Đi theo nó: `?tab=cong-thuc` và mọi state chỉ phục vụ việc đổi tab (`tab`, `switchTab`,
        `tablistRef`, `tabJustClicked`, cùng effect cuộn cụm tab trở lại tầm mắt — thứ chỉ có nghĩa
        khi hai panel chênh nhau cả nghìn pixel).

        Panel "phép tính đã lưu" cũng đi theo lượt ấy, và để lại một lỗi thật: nút "Lưu vào danh
        mục" ở 111 màn chi tiết vẫn ghi vào kho, nhưng không còn chỗ nào bày kho ra. Chủ dự án báo
        lại đúng lỗi đó (15/09/2026) — nay danh sách quay về thành KHỐI THỨ HAI của màn, ngay dưới
        khối Nắm giữ, không tab nào. Quyết định "bỏ tabbar" giữ nguyên.
      */}

      {/*
        `styles.panel` KHÔNG được bỏ, dù lớp bọc này thôi làm tabpanel từ 14/09/2026.

        `.screen` là flex column có `gap`, nên trước khi có tab, sáu ô số · thanh thị giá · khối
        Nắm giữ là con TRỰC TIẾP của nó và được giãn cách sẵn. Bọc chúng vào một `<div>` trần là
        cắt đứt quan hệ ấy: cả ba dính sát nhau, thanh thị giá đè lên tiêu đề "NẮM GIỮ". `.panel`
        chép lại đúng luật giãn cách đó, nên nó phải ở lại chừng nào lớp bọc còn ở lại.

        Vai ARIA thì đi hết: không còn cụm tab thì không còn `role="tabpanel"`, `aria-labelledby`
        hay một `id` để tab trỏ tới. Một tabpanel không có tablist là nói dối trình đọc màn hình.
      */}
      <div className={styles.panel}>
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

        <section className={styles.block} aria-labelledby="portfolio-holdings">
          {/*
        Dòng tiêu đề khối — dựng lại 22/09/2026 theo ảnh thiết kế chủ dự án đưa:
        "NẮM GIỮ · 2 mã · giá phiên 22/09/2026" bên trái, nút "+ Thêm mã" bên phải.

        Dải trạng thái thị giá trước đây đứng RIÊNG, ngay dưới lưới ô thống kê, với lý do "đặt
        ngay cạnh chỗ người dùng đang nhìn con số". Lý do ấy không mất: dòng này vẫn nằm giữa
        lưới ô và danh sách mã. Thứ đổi là nó thôi chiếm một hàng riêng. GỘP chứ không nhân đôi
        — để cả hai thì ngày phiên in hai lần trên một màn, mà ngày phiên là lời hứa "số này
        thuộc phiên nào", nói hai lần là dựng hai nguồn sự thật cho cùng một điều.

        Luôn hiện khi danh mục có mã, kể cả lúc mọi thứ bình thường: "giá của phiên nào" là
        thông tin cần thường trực chứ không phải chỉ lúc hỏng — mở app chiều thứ Bảy thì con số
        đang nhìn là giá thứ Sáu. Nút làm mới cũng vì thế mà luôn có mặt.

        `<h2>` giữ nguyên chữ "Nắm giữ" MỘT MÌNH, phần đếm mã và trạng thái giá ở `<p>` em kế
        bên. Không nhét chung một phần tử: tên khả truy cập của cả khối lấy từ `<h2>` này qua
        `aria-labelledby`, nên trộn ngày phiên vào đó là mỗi lượt làm mới giá thì tên khối đổi
        theo — trình đọc màn hình thông báo lại cả khối vì một con số vừa đổi.
      */}
          <div className={styles.blockHead}>
            <h2 className={styles.blockTitle} id="portfolio-holdings">
              {t('portfolio.holdings')}
            </h2>

            {holdings.length > 0 && (
              <p
                className={priceState === 'ready' ? styles.priceNote : styles.priceError}
                role={priceState === 'ready' ? 'status' : 'alert'}
              >
                <span className={styles.priceText}>
                  {/*
                      Số mã đang giữ. Đọc thẳng `holdings.length` chứ không lấy `summary.count`:
                      ô thống kê kia là một `CalcOutput` có thể `fail`, còn đây chỉ đếm số dòng
                      ngay bên dưới — một con số không bao giờ hỏng được.
                    */}
                  <span>
                    {formatNumber(holdings.length) ?? holdings.length} {t('portfolio.tickerUnit')}
                  </span>
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
                      Nguồn TRẢ LỜI ĐƯỢC nhưng không mã nào có giá — ca thật, gặp ngay khi người
                      dùng gõ một mã không nằm trong danh sách Finbox (ví dụ 'VNI', vốn là chỉ số
                      chứ không phải cổ phiếu). Bốn nhánh trên đều tắt: không đang tải, không
                      hỏng, không giá cũ, và không có ngày phiên nào để khoe.

                      Không có nhánh này thì dòng chỉ còn mỗi nút "Làm mới" đứng chơ vơ — người
                      dùng thấy một thao tác được mời gọi mà không biết để làm gì. Lý do đầy đủ
                      (mã nào thiếu, nên làm gì) đã nằm ở ô "Tổng giá trị" ngay trên, nên ở đây
                      chỉ cần một câu ngắn nói vì sao chỗ này trống.
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

            {/*
              Nút hành động chính của cả màn. Từ 22/09/2026 nó đứng ở GÓC PHẢI dòng tiêu đề, không
              còn là khung nét đứt rộng hết hàng ở cuối khối như bản vẽ WF-06 — chủ dự án đưa ảnh
              thiết kế mới và chốt "làm đủ như ảnh, ở cả hai khổ".

              Hai thứ giữ lại từ bản cũ vì chúng là bài học chứ không phải kiểu dáng: chữ ĐẬM màu
              nhấn trên nền có màu (khung nét đứt trên nền trắng từng bị đọc ra như một ô trống
              chờ điền), và dấu cộng là SVG `aria-hidden` chứ không phải ký tự '+' trong nhãn —
              nếu không, tên khả truy cập của nút thành "+ Thêm mã".

              Nút KHÔNG còn bị form thay chỗ: form nay mở thành hộp thoại nổi giữa màn, và phần
              trang phía sau đã `inert` nên nút này không với tới được trong lúc hộp thoại mở.
            */}
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
          </div>

          {holdings.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden="true">
                <StatIcon d={TILE_ICONS.count} />
              </span>
              <p className={styles.emptyText}>{t('portfolio.empty')}</p>
            </div>
          ) : (
            <table className={styles.holdList}>
              {/*
                Chú thích bảng, ẩn khỏi mắt: `<h2>` "NẮM GIỮ" ngay trên đã nói đúng điều này cho
                người nhìn thấy. Trình đọc màn hình thì cần nó — nó là câu đọc trước khi bước vào
                bảng, và không có nó thì bảng chỉ được xướng tên là "bảng".
              */}
              <caption className="visually-hidden">{t('portfolio.tableCaption')}</caption>

              {/*
                Hàng tiêu đề chỉ hiện từ 1024px. Ở khổ hẹp hơn nó `display: none` vì hàng lúc ấy
                không còn xếp theo cột — nhãn đi liền con số ngay trong ô (`.cellTag`).

                Ô cuối để trống chứ không đặt một nhãn ẩn: cột ấy chỉ chở mũi tên trang trí, mà
                nút mở hàng thì đã tự xưng tên đủ ("Chi tiết FPT").
              */}
              <thead className={styles.holdHead}>
                <tr>
                  <th scope="col">{t('portfolio.colCode')}</th>
                  <th scope="col">{t('portfolio.colName')}</th>
                  <th scope="col">{t('portfolio.colQuantity')}</th>
                  <th scope="col">{t('portfolio.colCostPrice')}</th>
                  <th scope="col">{t('portfolio.marketPrice')}</th>
                  <th scope="col">{t('portfolio.colValue')}</th>
                  <th scope="col">{t('portfolio.gain')}</th>
                  <th scope="col">{t('portfolio.colWeight')}</th>
                  <th scope="col" />
                </tr>
              </thead>

              <tbody>
                {summary.rows.map((row) => {
                  const { holding } = row;
                  const open = expanded === holding.code;

                  /*
                   * Số liệu của HÀNG MỞ RA, dựng thành các ô NHÃN–GIÁ TRỊ thay vì một câu nối bằng
                   * dấu chấm.
                   *
                   * Bản trước ghép tất cả thành `100 CP · giá vốn 21 ₫ · chưa có giá` rồi thêm một
                   * dòng `mua 02/08/2026 · beta 1,1` nữa, cả hai cùng cỡ chữ nhỏ nhất và cùng màu
                   * xám. Đọc ra thì được, nhưng KHÔNG dò được: mắt phải đọc hết cả câu mới biết con
                   * số nào là giá vốn, và nhãn lẫn giá trị trông y hệt nhau. Tách nhãn ra chữ nhỏ in
                   * hoa, giá trị để cỡ chữ thường màu đậm — đúng khuôn `StatTile` ở đầu màn, nên hai
                   * khối số của cùng một màn nói cùng một thứ tiếng.
                   *
                   * Nay chỉ còn NGÀY MUA và BETA. Thị giá và phần trăm lãi/lỗ đã LÊN hàng bảng
                   * (22/09/2026, ảnh thiết kế chủ dự án đưa), cùng lý do số lượng và giá vốn rời
                   * khỏi đây từ trước: một con số bày hai chỗ trên cùng một màn là hai nguồn sự
                   * thật, và mắt không biết chỗ nào mới đúng.
                   *
                   * Cả hai chỉ hiện khi có. Ngày mua đáng ngại nhất trong nhóm — gõ nhầm năm là
                   * đúng cái bẫy mà luật `MODEL_VIOLATION` ở `summarisePortfolio()` dựng ra để
                   * chặn, mà người dùng lại không có cách nào nhìn thấy ngày đang lưu để sửa.
                   */
                  const cells: ReadonlyArray<PortfolioCell> = [
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

                  /* Thiếu thị giá thì BỐN ô cùng vắng: giá trị, lãi/lỗ và tỷ trọng đều tính từ nó. */
                  const noPrice = row.marketPrice === null;

                  return (
                    <Fragment key={holding.code}>
                      {/*
                      Hàng bảng tám cột (từ 1024px) — cũng chính là dòng gọn ba cột của bản vẽ
                      WF-06 ở khổ hẹp hơn. MỘT cây DOM cho cả hai, chỉ khác nhau ở CSS.

                      Vì sao không dựng hai cây rồi ẩn bớt một: hai bản cùng nằm trong DOM thì mọi
                      con số có mặt hai lần, và `getByText` trong ca kiểm báo "nhiều kết quả" —
                      chưa kể trình đọc màn hình đọc cả hai. Vì sao không chọn cây theo bề ngang
                      màn lúc chạy: lần dựng đầu ở trình duyệt phải khớp HTML tĩnh, mà HTML tĩnh
                      thì không biết màn rộng bao nhiêu.

                      Cái bấm được vẫn là một nút PHỦ LÊN cả hàng (`.holdToggle`, xem CSS), không
                      phải một nút bọc quanh nội dung. Lý do là quy tắc tính tên trợ năng:
                      `aria-label` NUỐT toàn bộ nội dung bên trong nút, nên bọc cả hàng vào nút sẽ
                      làm số lượng, giá vốn, thị giá, giá trị, lãi/lỗ và tỷ trọng biến mất khỏi
                      bản đọc. Đã thử hướng ngược lại (bỏ `aria-label`, để tên nút tự ghép từ nội
                      dung) và nó hỏng: tên được ghép SAU KHI cắt khoảng trắng hai đầu từng thẻ
                      con, nên nghe thành "FPT500 CPgiá vốn 78.000 ₫".

                      Nút neo vào `.holdRow` bằng `position: relative` đặt trên chính `<tr>`. Được
                      phép, và cả ba engine đều dựng đúng — nhưng vì đây là chỗ dễ hỏng âm thầm,
                      `chrome-check.mjs` đo hộp của nút so với hộp của hàng ở khổ 1440.
                    */}
                      <tr className={styles.holdRow}>
                        <td className={styles.holdCode}>
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
                          {holding.code}
                        </td>

                        {/*
                        Tên doanh nghiệp LÊN hàng (22/09/2026), đảo lại chỗ cũ của nó trong khối
                        mở ra. Lý do cũ — "cột mã trên dòng gọn chỉ rộng ba đến bốn ký tự" — chỉ
                        đúng với dòng gọn; bảng có hẳn một cột cho nó.

                        `holding.name` chỉ được ghi khi người dùng chọn mã qua sheet, nên mã lưu
                        từ trước có thể thiếu. Lấy bù từ `quotes` — cùng gói dữ liệu đã tải về để
                        tra thị giá, KHÔNG thêm lời gọi mạng nào. Thiếu cả hai thì ô để trống:
                        tên doanh nghiệp không phải một con số, nên chỗ trống ở đây không phải cái
                        FR-06 đi chặn.
                      */}
                        <td className={styles.holdName}>
                          {holding.name ?? quotes.get(holding.code)?.name ?? ''}
                        </td>

                        <td className={`${styles.holdCell} ${styles.holdQuantity}`}>
                          {formatNumber(holding.quantity) ?? holding.quantity}
                          <span className={styles.cellUnit}> {t('portfolio.shares')}</span>
                        </td>

                        <td className={`${styles.holdCell} ${styles.holdCost}`}>
                          <span className={styles.cellTag}>{t('portfolio.costPrice')} </span>
                          {formatNumber(holding.costPrice) ?? '_ _'} ₫
                        </td>

                        {/*
                        Bốn ô cuối cùng sống chết theo thị giá. Thiếu giá thì cả bốn hiện `_ _` —
                        đúng ký hiệu "chưa có số" mà cả sản phẩm đang dùng — chứ KHÔNG hiện 0 ₫
                        hay 0% (FR-06). Lý do và lối xử lý đã nằm ở dòng tiêu đề khối ngay trên,
                        chỗ có nút "Làm mới", nên không lặp lại ở từng hàng.
                      */}
                        <td className={`${styles.holdCell} ${styles.holdPrice}`}>
                          <span className={styles.cellTag}>{t('portfolio.marketPrice')} </span>
                          {row.marketPrice === null ? (
                            <span className={styles.holdMissing}>_ _</span>
                          ) : (
                            `${formatNumber(row.marketPrice) ?? '_ _'} ₫`
                          )}
                        </td>

                        <td className={`${styles.holdCell} ${styles.holdValue}`}>
                          {row.value === null ? (
                            <span className={styles.holdMissing}>_ _</span>
                          ) : (
                            `${formatNumber(row.value, { maxDecimals: 0 }) ?? '_ _'} ₫`
                          )}
                        </td>

                        {/*
                        Lãi/lỗ hai vế: số tiền ở trên, phần trăm ngay dưới. Dấu +/− mang tin chứ
                        không chỉ có màu (NFR-USA-06) — đây là chỗ duy nhất của màn mà màu đỏ và
                        màu xanh nói ngược nhau, nên nó phải đọc được cả khi không phân biệt màu.
                      */}
                        <td className={`${styles.holdCell} ${styles.holdGainCell}`}>
                          {row.gain === null ? (
                            <span className={styles.holdMissing}>_ _</span>
                          ) : (
                            <>
                              <span
                                className={[
                                  styles.holdGain,
                                  up ? styles.holdGainUp : styles.holdGainDown,
                                ].join(' ')}
                              >
                                {up ? '+' : '−'}
                                {formatNumber(Math.abs(row.gain), { maxDecimals: 0 }) ?? '_ _'} ₫
                              </span>
                              {row.gainPercent !== null && (
                                <span
                                  className={[
                                    styles.holdGainPct,
                                    up ? styles.holdGainUp : styles.holdGainDown,
                                  ].join(' ')}
                                >
                                  {up ? '+' : '−'}
                                  {formatNumber(Math.abs(row.gainPercent), { maxDecimals: 1 }) ??
                                    '_ _'}
                                  %
                                </span>
                              )}
                            </>
                          )}
                        </td>

                        {/*
                        Tỷ trọng: con số, chữ "tỷ trọng" (chỉ hiện ở khổ dòng gọn, nơi không có
                        tiêu đề cột nào nói tên nó), rồi một thanh ngang.

                        Thanh là `aria-hidden`: nó vẽ lại đúng con số ngay bên cạnh, nên để trình
                        đọc màn hình nghe thấy là nghe hai lần. Bề rộng đi qua biến CSS chứ không
                        qua `width` thẳng, để CSS giữ quyền quyết định thanh dài tối đa bao nhiêu.
                      */}
                        <td className={`${styles.holdCell} ${styles.holdWeightCell}`}>
                          {row.weight === null ? (
                            <span className={styles.holdMissing}>_ _</span>
                          ) : (
                            <>
                              <span className={styles.holdWeight}>
                                {formatNumber(row.weight, { maxDecimals: 0 }) ?? '_ _'}%
                              </span>{' '}
                              {/*
                                Dấu cách là một NÚT VĂN BẢN thật, không phải lề CSS: ở khổ bảng
                                nhãn này `display: none`, và một lề thì biến mất cùng nó, nhưng
                                trình đọc màn hình vẫn đọc liền "8%tỷ trọng" nếu hai thẻ dính
                                nhau trong DOM. Chủ dự án chụp đúng chỗ dính ấy (22/09/2026).
                              */}
                              <span className={styles.holdWeightLabel}>
                                {t('portfolio.weight')}
                              </span>
                              <span
                                className={styles.weightBar}
                                style={
                                  {
                                    '--weight': `${String(Math.max(0, Math.min(100, row.weight)))}%`,
                                  } as CSSProperties
                                }
                                aria-hidden="true"
                              />
                            </>
                          )}
                        </td>

                        {/*
                        Mũi tên là thứ DUY NHẤT nói cho người dùng biết hàng này bấm được. Bản
                        trước học đúng bài này với dấu bút chì: hai lượt đầu nó chỉ đổi màu lúc rê
                        chuột, mà màn thiết kế cho 360px và điện thoại không có trạng thái rê
                        chuột.

                        Trình đọc màn hình không nghe thấy ký hiệu này: `aria-label` của nút phủ
                        đã nói "Chi tiết FPT", và `aria-expanded` nói đang mở hay đóng.
                      */}
                        <td className={styles.holdMarkCell}>
                          <span
                            className={
                              open ? `${styles.holdMark} ${styles.holdMarkOpen}` : styles.holdMark
                            }
                            aria-hidden="true"
                          >
                            <StatIcon d="m6 9 6 6 6-6" />
                          </span>
                        </td>
                      </tr>

                      {open && (
                        <tr className={styles.holdDetailRow}>
                          {/*
                            `<td>` phải GIỮ NGUYÊN là một table-cell — mọi kiểu dáng đi vào `<div>`
                            bên trong.

                            Bản đầu đặt thẳng `display: flex` lên chính `<td>` này, và nó hỏng
                            theo một cách rất khó đoán: một phần tử flex KHÔNG còn là table-cell,
                            nên trình duyệt bọc nó vào một ô ẩn danh mang `colspan=1`. Ô ấy rơi
                            vào CỘT MỘT, kéo cột "Mã" rộng ra bằng cả cụm nút, và đẩy bảy cột còn
                            lại sang phải — nhưng chỉ ở hàng đang mở, nên bảng nhảy chỗ mỗi lần
                            bấm. Chủ dự án bắt được đúng triệu chứng ấy (22/09/2026): tiêu đề
                            "Doanh nghiệp" nhảy từ x≈110 sang x≈390 khi mở một hàng.
                          */}
                          <td className={styles.holdDetail} colSpan={HOLD_COLUMNS}>
                            <div className={styles.holdDetailInner}>
                              {/*
                                `<dl>` chỉ dựng khi CÓ ô. Ngày mua và beta đều tuỳ chọn, nên phần
                                lớn mã không có ô nào — mà một `<dl>` rỗng vẫn ăn trọn một khe
                                `gap` của khối và vẫn để lại vạch ngăn phía trên cụm nút, tức một
                                mảng trống có kẻ chỉ huy ngay giữa khối. Chủ dự án chụp đúng mảng
                                ấy ở khổ điện thoại (22/09/2026).
                              */}
                              {cells.length > 0 && (
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
                              )}

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
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}

          {/*
            ── Tỷ trọng là gì, nói thành câu (22/09/2026) ─────────────────────────────────────

            Chủ dự án đọc cột TỶ TRỌNG và báo "chưa hiểu tác dụng". Rà lại thì ra gốc: sản phẩm
            dùng đúng chữ ấy cho BA thứ khác nhau — phần của một mã trong danh mục (chỗ này), tỷ
            trọng vốn chủ và vốn nợ trong `wacc`, và hệ số làm mượt `k` của `ema-n-phien`. Ba
            nghĩa không bao giờ đứng chung một màn nên không xung đột, nhưng ở đây con số đứng
            trần: "6%" mà không nói 6% CỦA CÁI GÌ, trong khi mẫu số có tới hai lựa chọn hợp lý là
            giá trị thị trường và vốn đã bỏ ra.

            Đặt thành một dòng dưới bảng chứ không nhét vào tiêu đề cột: tiêu đề cột rộng 10% bề
            ngang, không chở nổi một mệnh đề. Cùng nếp `ConstantsNote` ở màn chi tiết — câu giải
            thích cho cả khối thì đứng cuối khối.

            Câu thứ hai là phần THÀNH THẬT về mẫu số, và nó chỉ hiện khi cần. `total` cộng bằng
            `row.value ?? 0`, nên một mã chưa tra được giá bị coi như 0 và rơi khỏi mẫu số — tỷ
            trọng của các mã còn lại vì thế cộng lại đủ 100% trong khi danh mục thì chưa đủ. Im
            lặng ở đây đúng là loại "số sai mà trông có lý" mà FR-06 dựng ra để chặn.
          */}
          {holdings.length > 0 && (
            <p className={styles.weightNote}>
              {t('portfolio.weightNote')}
              {summary.rows.some((row) => row.value === null) && (
                <> {t('portfolio.weightPartial')}</>
              )}
            </p>
          )}

          {/*
            Form thêm/sửa mã — hộp thoại NỔI GIỮA MÀN từ 22/09/2026, theo yêu cầu của chủ dự án:
            "bấm vào Sửa thì bật popup mới lên giữa màn chiếm tầm 50% màn hình". Trước đó nó là
            một khối chạy thẳng trong trang, dựng ở cuối danh sách.

            Dùng lại `BottomSheet` với `placement="center"` chứ không dựng một cái vỏ thứ hai:
            phần khó không nằm ở chỗ tấm đứng đâu mà ở `<dialog>` gốc — bẫy tiêu điểm, phím Esc,
            `inert` cho phần trang phía sau, khoá cuộn nền, bấm ra ngoài thì đóng. Sheet chọn mã
            và sheet chọn công thức mở ĐÈ LÊN hộp thoại này; `<dialog>` xếp chồng ở lớp trên cùng
            nên cái mở sau luôn nhận tiêu điểm.

            Chỉ dựng khi mở, không dựng sẵn rồi ẩn: các ô nhập có nhãn, và để chúng nằm trong DOM
            lúc form đóng là mọi `getByLabelText('Số cổ phiếu nắm giữ')` tìm thấy một ô mà người
            dùng không nhìn thấy.
          */}
          {formOpen && (
            <BottomSheet
              open
              onClose={closeForm}
              placement="center"
              title={editing === null ? t('portfolio.add') : `${t('portfolio.edit')} ${editing}`}
              className={styles.formSheet}
              footer={
                <>
                  {/*
                    Nhãn nút đổi theo việc nút sắp làm. "Thêm vào danh mục" khi thật ra là cộng
                    dồn vào một dòng đã có là hứa sai ngay trên đích bấm — chỗ người dùng đọc kỹ
                    nhất.
                  */}
                  <Button onClick={submit}>{submitLabel}</Button>
                  {/*
                    `secondary` chứ không `ghost`: trong một hàng nút của hộp thoại, một nhãn chữ
                    trần đứng cạnh một nút nền đặc đọc ra như một liên kết lạc chỗ, và hai thứ cao
                    thấp khác nhau làm hàng nút lệch. Viền nhẹ giữ đúng thứ bậc (nút chính vẫn là
                    cái duy nhất có nền) mà vẫn cho hai nút cùng một khối hình.
                  */}
                  <Button variant="secondary" onClick={closeForm}>
                    {t('portfolio.formCancel')}
                  </Button>
                </>
              }
            >
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
                  {/*
                  Ô mã KHÔNG còn câu gợi ý nào, ở cả hai chế độ — chủ dự án chốt bỏ 14/09/2026,
                  hai đợt liền nhau.

                  Đợt một bỏ `portfolio.priceNote` ("Thị giá lấy từ Finbox theo phiên gần nhất…"):
                  nó trả lời một câu hỏi chưa ai hỏi, lúc ô mã còn trống thì trên màn chưa có thị
                  giá nào để mà đính điều kiện. Lời hứa "số này cũ tới đâu" không mất — nó nằm đúng
                  cạnh con số, ở dòng ngày phiên khi giá lấy từ bộ nhớ đệm (`PriceState = 'stale'`).

                  Đợt hai bỏ nốt `portfolio.editHint` ("Đổi số lượng, giá vốn, ngày mua hoặc beta.
                  Muốn đổi mã thì bỏ rồi thêm lại."). Nó kể lại thứ form đã tự bày ra: bốn ô đổi
                  được đang hiện ngay dưới, còn nút mã thì `disabled` và mắt đọc ra ngay. Vế "bỏ
                  rồi thêm lại" là lối đi vòng cho một việc hiếm, không đáng một dòng thường trực
                  trên mọi lượt sửa.
                */}
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
                  type="text"
                  inputMode="decimal"
                  value={form.quantity}
                  error={errors.quantity}
                  onChange={(event) => {
                    setField('quantity', filterTypedValue(event, keepViNumberChars));
                  }}
                  onKeyDown={guardFilteredDelete}
                  onBlur={(event) => {
                    resetFilteredDelete(event.currentTarget);
                  }}
                />

                <Input
                  label={t('portfolio.formCostPrice')}
                  type="text"
                  inputMode="decimal"
                  value={form.costPrice}
                  error={errors.costPrice}
                  onChange={(event) => {
                    setField('costPrice', filterTypedValue(event, keepViNumberChars));
                  }}
                  onKeyDown={guardFilteredDelete}
                  onBlur={(event) => {
                    resetFilteredDelete(event.currentTarget);
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
                    type="text"
                    inputMode="decimal"
                    hint={t('portfolio.betaHint')}
                    value={form.beta}
                    error={errors.beta}
                    onChange={(event) => {
                      setField('beta', filterTypedValue(event, keepViNumberChars));
                    }}
                    onKeyDown={guardFilteredDelete}
                    onBlur={(event) => {
                      resetFilteredDelete(event.currentTarget);
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
                  {/*
                  Ô này KHÔNG còn câu gợi ý nào — chủ dự án chốt bỏ nốt câu cuối 22/09/2026.

                  Lượt một (14/09/2026) bỏ `portfolio.formulaHint` ("Tuỳ chọn. Chọn rồi thì lưu
                  xong sẽ mở thẳng công thức đó…"): nhãn nút gửi ngay bên dưới đã nói đúng việc sắp
                  xảy ra ("Thêm và mở công thức" / "Lưu và mở công thức").

                  Lượt hai bỏ `portfolio.formulaNeedsCode` ("Số ô điền sẵn của mỗi công thức phụ
                  thuộc mã, nên phải có mã rồi mới chọn được. Bấm vào ô này để chọn mã."). Lý do
                  giữ nó trước đây — "nút hứa một việc khác với chữ trên nhãn ô nên phải có chỗ nói
                  vì sao" — nay đã được chính cái nút gánh: nó in thẳng "Chọn mã cổ phiếu trước",
                  tức đã nói cả việc cần làm lẫn thứ tự phải làm, ngay tại chỗ người dùng đang bấm.
                  Hai dòng chữ cho một ý là một dòng thừa.

                  Bỏ câu thì bỏ luôn `aria-describedby` trỏ vào nó: trỏ vào một id không tồn tại
                  thì trình đọc màn hình lặng thinh — không lỗi, không cảnh báo, chỉ mất phần mô
                  tả; đúng kiểu hỏng mà không cửa nào bắt được.
                */}
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
              </div>
            </BottomSheet>
          )}
        </section>
      </div>

      {/*
        Khối "Phép tính đã lưu" — đích của nút Lưu ở màn chi tiết công thức.

        CHỈ dựng khi kho có ít nhất một mục. Bản tab cũ có ô rỗng kèm câu hướng dẫn, và ở đó nó
        đúng: người dùng đã chủ động bấm sang tab. Nay khối nằm thường trực dưới danh mục của MỌI
        người, kể cả người chưa từng bấm Lưu — một ô rỗng thường trực là đúng thứ chủ dự án đã gỡ
        khi bỏ tabbar. Người dùng tới được khối này chỉ bằng việc lưu, nên họ luôn thấy nó có mục.

        Nằm NGOÀI `.panel` của khối Nắm giữ: `.screen` đã giãn cách các con trực tiếp của nó.
      */}
      {savedCalcs.length > 0 && (
        <section
          ref={savedRef}
          id={SAVED_CALCS_ANCHOR}
          className={`${styles.block} ${styles.savedBlock}`}
          aria-labelledby="portfolio-saved"
        >
          <h2 className={styles.blockTitle} id="portfolio-saved">
            {t('portfolio.savedTitle')}
          </h2>

          <ul className={styles.savedList}>
            {savedCalcs.map((saved) => {
              const summaryOf = SUMMARY_BY_ID.get(saved.formulaId);
              // Công thức bị gỡ khỏi Registry thì id vẫn là thứ nhận ra được, hơn là một dòng trống.
              const formulaName = summaryOf === undefined ? saved.formulaId : pick(summaryOf.name);

              /*
                Tên đã cất là chuỗi ĐÃ GHÉP ở ngôn ngữ lúc bấm Lưu, nên đổi sang EN nó vẫn tiếng
                Việt trong khi dòng phụ ngay dưới đã dịch. `displayCalcName()` nhận ra tên nào vốn
                là GỢI Ý rồi dựng lại ở ngôn ngữ đang xem; tên người dùng tự gõ giữ nguyên từng chữ.
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

              /*
                Dòng phụ chỉ nói những gì DÒNG TÊN chưa nói: tên tự sinh có dạng "<mã> · <tên công
                thức> · <ngày>", nên mảnh nào đã nằm trong tên thì bỏ. "lưu <ngày>" thì KHÔNG bao
                giờ bị lọc — đó là chỗ duy nhất nói con số này thuộc một MỐC chứ không vừa tính xong.
              */
              const metaParts = [saved.code, formulaName]
                .filter((part): part is string => part !== undefined)
                .filter((part) => !savedName.includes(part));
              metaParts.push(`${t('portfolio.savedAt')} ${formatIsoDate(isoDayOf(saved.savedAt))}`);
              if (saved.needsSeries) metaParts.push(t('portfolio.savedNeedsSeries'));

              return (
                <li key={saved.id} className={styles.savedRow}>
                  <p className={styles.savedName}>{savedName}</p>

                  {/*
                    "Xem" là `<Link>` chứ không `<button>`: điều hướng sang màn khác thì phải mở
                    được bằng chuột giữa và menu ngữ cảnh. Con số kết quả không bày ở đây — chủ dự
                    án chốt từ bản tab: *"số liệu thì khi mở lại thì mới thấy được"*.
                  */}
                  <div className={styles.savedActions}>
                    <Link
                      className={`${styles.savedAction} ${styles.savedActionOpen}`}
                      href={`${formulaPath(saved.formulaId)}?luu=${saved.id}`}
                    >
                      {t('portfolio.savedOpen')}
                    </Link>
                    <button
                      type="button"
                      className={`${styles.savedAction} ${styles.savedActionRemove}`}
                      aria-label={`${t('portfolio.savedRemove')} ${savedName}`}
                      onClick={() => {
                        persistSaved(removeSavedCalc(savedCalcs, saved.id));
                      }}
                    >
                      {t('portfolio.savedRemove')}
                    </button>
                  </div>

                  <p className={styles.savedMeta}>{metaParts.join(' · ')}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/*
        ⚠ Dải "CỤC BỘ · Số lượng và giá vốn chỉ lưu trên thiết bị này. Chỉ mã cổ phiếu được gửi tới
        Finbox để tra thị giá." đã BỎ — chủ dự án chốt (09/09/2026).

        Ghi lại vì nó không phải một chú thích thường: CLAUDE.md, mục "The one network call", nêu
        đích danh `portfolio.localOnly` là chỗ sản phẩm NÓI RA trên màn cái gì rời khỏi máy, và
        cùng đợt này `settings.data.note` cũng bỏ. Sau hai lượt ấy, sản phẩm không còn câu nào trên
        màn nói về việc mã cổ phiếu được gửi tới `dcs.finbox.vn`.

        Bản thân cam kết KHÔNG đổi — số lượng, giá vốn và ngày mua vẫn không bao giờ vào một request
        (xem `src/data/finbox/`), và ca kiểm chặn điều đó vẫn còn. Chỉ là màn thôi nói ra.
      */}

      {/*
        Ô miễn trừ đứng CUỐI MÀN, sau cả khối Phép tính đã lưu — chủ dự án chốt 15/09/2026: *"nội
        dung cảnh báo cho xuống cuối trang"*. Trước đó nó đứng đầu màn, trên sáu ô tiền, theo UI-04
        (mức M: miễn trừ trong tầm nhìn đầu tiên của trang có kết quả). Đổi chỗ là quyết định sản
        phẩm, cùng lượt với màn chi tiết công thức.

        Đây vẫn là câu miễn trừ DUY NHẤT của màn: `showsFooterDisclaimer()` trừ `/danh-muc/` ra nên
        dải xám chân trang không dựng ở đây. Ô nằm ngoài mọi nhánh điều kiện nên có ở mọi trạng thái
        của màn — rỗng, đang tải, lỗi thị giá — và đó là điều kiện để dòng trừ bên ấy hợp lệ.
      */}
      <DisclaimerBar variant="notice" />

      {/*
        Cả hai sheet của màn này đều mở TỪ TRONG hộp thoại thêm/sửa mã, nên chúng cũng nổi giữa
        màn (22/09/2026, chủ dự án yêu cầu). Một tấm dán đáy trượt lên đè lên một tấm đang nổi ở
        giữa thì hai lớp đọc ra như hai thứ không liên quan, và cái ở dưới thì vẫn ở giữa màn.

        Màn chi tiết công thức KHÔNG đổi theo: ở đó `TickerPickerSheet` mở thẳng từ trang, không
        từ hộp thoại nào, và dán đáy là dáng đúng cho một danh sách dài cuộn bằng ngón tay.
      */}
      {mountedSheets.has('ticker') && (
        <TickerPickerSheet
          open={sheet === 'ticker'}
          onClose={closeSheet}
          onPick={pickTicker}
          heldCodes={heldCodes}
          placement="center"
        />
      )}

      {mountedSheets.has('formulas') && (
        <FormulaForTickerSheet
          open={sheet === 'formulas'}
          onClose={closeSheet}
          onPick={setPlannedFormula}
          placement="center"
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
