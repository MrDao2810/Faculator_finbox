'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  FORMULA_SUMMARIES,
  MARKET_FEED,
  MAX_HOLDINGS,
  PORTFOLIO_KEY,
  PRICE_CACHE_KEY,
  PRICE_SERIES_KEY,
  ROUTES,
  SAVED_CALCS_ANCHOR,
  SAVED_CALCS_KEY,
  addHolding,
  displayCalcName,
  formatIsoDate,
  formatNumber,
  formatValueWithUnit,
  formulaPath,
  isAbortError,
  isPriceCacheFresh,
  keepViNumberChars,
  normalizeVi,
  oldestAsOf,
  parseCachedPrices,
  parseHoldings,
  parseSavedCalcs,
  parseStoredSeries,
  parseViNumber,
  removeHolding,
  removeSavedCalc,
  serializeCachedPrices,
  serializeHoldings,
  serializeSavedCalcs,
  suggestCalcNames,
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
import { SearchBox } from '@/ui/browse';
import { useValueText } from '@/ui/i18n/units';
import { filterTypedValue, guardFilteredDelete, resetFilteredDelete } from '@/ui/inputs';
import { DisclaimerBar } from '@/ui/navigation';
import { Badge, BottomSheet, Button, Input, TabBar, tabId } from '@/ui/primitives';
import { FormulaForTickerSheet, TickerPickerSheet } from '@/ui/sheets';

import styles from './PortfolioScreen.module.css';
import { HoldingsSummary, SavedSummary } from './PortfolioSummary';

/**
 * Màn WF-06 Danh mục cá nhân — gói WBS 3.4.1, mở rộng ở gói "Danh mục dùng số liệu thật" và
 * gói "Tám đề mục còn hở".
 *
 * ── Bố cục hai cột (từ 12/10/2026) ──────────────────────────────────────────────────────────
 *
 * Cột trái: nhãn "Danh mục", tab dọc, thẻ tóm tắt (`PortfolioSummary`). Cột phải: bảng của tab
 * đang mở. Trước đó là sáu ô `StatTile` đầu màn rồi danh sách mã với hàng mở rộng — xem mục
 * "Danh mục thiết kế lại thành hai cột" trong `TASK.md` và đoạn "TWO COLUMNS" trong `CLAUDE.md`.
 * Khổ nhỏ hơn 1024px CHƯA có thiết kế: hai cột xếp chồng, bảng cuộn ngang trong khung của nó.
 *
 * Các con số trong thẻ tóm tắt đều là **kết quả tính** nên đi qua `CalcOutput`: thiếu dữ liệu thì
 * hiện "_ _" kèm lý do chứ không hiện 0 (FR-06). Đây là chỗ dễ vi phạm nhất trong cả sản phẩm — một
 * danh mục mới toanh có tổng giá trị chưa xác định, không phải 0 ₫. Beta và XIRR hiện "_ _" mà không
 * kèm câu lý do, từ 29/09/2026.
 *
 * ── Beta và XIRR chỉ ở chế độ Nâng cao (FR-09) ──────────────────────────────────────────────
 *
 * Beta và XIRR là hai khái niệm nâng cao thật, và với người dùng F0 chúng gần như **luôn** ở
 * trạng thái "_ _": beta là bình quân gia quyền nên thiếu beta của một mã là hỏng cả dòng, mà
 * beta thì phải nhập tay; XIRR đòi ngày mua hợp lệ ở mọi mã. Hai dòng ấy không nói được điều gì
 * ngay sau khi thêm mã đầu tiên — nên chế độ Cơ bản (mặc định của sản phẩm, SRS 1.3.3) không dựng
 * chúng, kèm dòng nói ra là đang giấu `ADVANCED_TILES` dòng.
 *
 * Ô nhập Beta trong form đi theo cùng luật — bày một con số mà chính chế độ đang xem không cho
 * sửa là một ngõ cụt. Beta và ngày mua KHÔNG còn hiện ở bảng (bỏ hàng mở rộng), nên form Sửa là
 * nơi duy nhất người dùng đọc lại được chúng.
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
 * Hai tab của màn: các mã đang nắm giữ, và phép tính đã lưu từ màn chi tiết công thức.
 *
 * Cụm tab này QUAY LẠI ngày 10/10/2026 sau khi chủ dự án gỡ nó ngày 14/09/2026 (*"bỏ tabbar đi và
 * giữ lại toàn bộ giao diện và logic thêm mã cổ phiếu cũ"*) rồi gọi việc "lưu xong không thấy đâu"
 * là lỗi ngày 15/09/2026. Hai bài học của hai lượt ấy cùng giữ ở đây: số đếm của tab Công thức
 * hiện ngay trên thanh tab (không phải bấm sang mới biết kho có mục), và neo `#phep-tinh-da-luu`
 * mở thẳng tab Công thức.
 *
 * Tab Công thức KHÔNG tính lại con số nào. Tính lại đòi `FORMULA_MODULES`, tức cả Registry, trong
 * gói của `/danh-muc/` — đã đo một lần ở `LIVE_PRESET_FORMULAS`: 131 kB lên 217 kB, vượt hẳn cửa
 * 180 kB. Nên tab này chỉ bày lại con số đã cất kèm NGÀY LƯU, còn việc tính lại thuộc về nút "Xem",
 * nơi màn chi tiết chạy đúng bộ máy đã sinh ra nó.
 */
type PortfolioTab = 'holdings' | 'saved';

/**
 * Tiền tố id của cụm tab — `tabId()` ghép ra `portfolio-tab-holdings` / `portfolio-tab-saved`.
 * Nơi dựng `aria-labelledby` cho vùng nội dung cũng đi qua `tabId()`, không tự gõ chuỗi.
 */
const PORTFOLIO_TABS_ID = 'portfolio';

/**
 * id CHUNG của vùng nội dung. Chỉ MỘT vùng nằm trong DOM tại một thời điểm (nội dung thay theo
 * tab), nên hai id riêng sẽ để lại một tab luôn trỏ `aria-controls` vào chỗ không tồn tại.
 */
const PORTFOLIO_PANEL_ID = 'portfolio-panel';

/** Giá trị của `?tab=` trên URL. Tiếng Việt cho khớp lối đặt đường dẫn của cả sản phẩm. */
const SAVED_TAB_PARAM = 'cong-thuc';

/**
 * Số dòng mà chế độ Cơ bản giấu đi trong thẻ tóm tắt — Beta và XIRR.
 *
 * Con số này phải khớp số dòng nằm trong nhánh `advanced &&` của `HoldingsSummary`. Không đếm được tự
 * động vì chúng là JSX, nên `PortfolioScreen.test.tsx` gác bằng cách đếm dòng thật ở cả hai chế độ
 * rồi so hiệu số với con số "N ô nâng cao đang ẩn" — thêm một dòng nâng cao mà quên sửa đây là đỏ ngay.
 * (Tên giữ chữ "TILES" từ thời sáu ô `StatTile`; đổi tên chỉ để đẩy một diff không mang nghĩa gì.)
 */
const ADVANCED_TILES = 2;

/**
 * Icon của hai tab, hai nút trên mỗi dòng và các trạng thái rỗng.
 *
 * Vẽ tay như `TabIcon` và `CategoryIcon`, không thêm thư viện (NFR-PER-04).
 *
 * Luôn `aria-hidden` và tuyệt đối không chứa `<title>`/`<desc>`/`<text>` — chúng sẽ chui vào
 * `textContent` của thẻ, mà nhiều ca kiểm ở màn này dò giá trị qua đúng `textContent`. Chữ "fx" của
 * tab Công thức vì thế được VẼ bằng nét, không phải gõ bằng phần tử `<text>`.
 */
function StatIcon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
  /* Cột — trạng thái rỗng của tab Mã. */
  count: 'M5 20V11M12 20V4M19 20v-6',
  /* Đồng xu có chữ S dựng đứng — tab Mã. */
  tabHoldings:
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM14.5 9.2c-.4-.8-1.3-1.2-2.5-1.2-1.4 0-2.5.7-2.5 1.8 0 2.5 5 1.2 5 3.7 0 1.1-1.1 1.8-2.5 1.8-1.2 0-2.1-.4-2.5-1.2M12 6.5V8m0 8v1.5',
  /* "fx" vẽ bằng nét — tab Công thức. */
  tabSaved: 'M8.5 18v-9a3 3 0 0 1 3-3h.5M6 11.5h5.5M13 12.5l5 6m0-6-5 6',
  /* Dấu cộng — nút Thêm mới. */
  plus: 'M12 5v14M5 12h14',
  /* Bút chì — Sửa. */
  edit: 'M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4',
  /* Thùng rác — Bỏ mã, Xoá. */
  trash: 'M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13M10 11v5M14 11v5',
  /* Vòng tròn chấm than — dòng phép tính cần nạp lại chuỗi giá. */
  warn: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 8v5M12 16.5v.01',
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
  buyDate?: string;
  beta?: string;
  form?: string;
}

/** Hai sheet của màn. Chỉ dựng khi người dùng mở lần đầu — cùng nếp `FormulaDetail`. */
type SheetKind = 'ticker' | 'formulas';

/**
 * Một dòng của bảng Phép tính đã lưu, ĐÃ dựng sẵn mọi chữ cần in.
 *
 * Dựng một lượt ở thân component rồi bảng chỉ việc in: tìm, đếm cho thẻ tóm tắt và vẽ dòng
 * đều đọc cùng một mảng, nên không có chỗ nào tự suy ra "cần nạp lại chuỗi" lần thứ hai và lệch nhau.
 */
interface SavedRowView {
  saved: SavedCalc;
  /** Dòng chính của ô Công thức: tên công thức, hoặc tên người dùng tự đặt. */
  title: string;
  /**
   * Tên để ĐỌC cho trình đọc màn hình ở hai nút cuối dòng, có mã đứng trước ("GVR · P/E…").
   * Hai phép tính cùng công thức khác mã mà chỉ nói "Xoá P/E" thì không biết xoá cái nào.
   */
  label: string;
  /** Dòng phụ: tên công thức, CHỈ khi dòng chính là tên tự đặt mà chưa nhắc tới nó. */
  subtitle: string | null;
  /**
   * Chuỗi giá trong máy không còn khớp lúc lưu — luật của `FormulaDetail` (`seriesMismatch`).
   * Dòng bị cờ in `_ _` thay con số đã lưu: mở lại sẽ ra con số khác, mà một con số cũ đứng cạnh
   * cái tên cũ là đúng loại "số sai mà trông có lý" FR-06 chặn.
   */
  needsReload: boolean;
  result: string;
  date: string;
  /** Chuỗi đã bỏ dấu để ô tìm so khớp: tên, tên công thức hai ngôn ngữ, mã. */
  haystack: string;
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
  /*
   * Không còn state "mã đang mở khối chi tiết" (`expanded`, 12/10/2026): bảng bỏ hàng mở rộng, Sửa
   * và Bỏ mã là hai nút biểu tượng ngay trên dòng. Ngày mua và beta vì thế chỉ còn thấy trong form
   * Sửa. Lịch sử của accordion (một mã mở một lúc, vì sao không giữ một `Set`) nằm ở git, không ở đây.
   */
  /**
   * Chữ gõ ở ô "Tìm kiếm" — MỘT ô, một chuỗi, dùng chung cho hai tab (12/10/2026).
   *
   * Chủ dự án: *"đồng bộ 2 chức năng này để khi đổi tab thì vẫn giữ nguyên … khi search ở tab nào thì
   * tab đó hiển thị tương ứng"*. Trước đó mỗi tab giữ một chuỗi riêng (`holdQuery`, `savedQuery`) với
   * hai nhãn khác nhau ("Tìm mã", "Tìm công thức hoặc mã"). Nay chuỗi SỐNG QUA lượt đổi tab và lọc
   * bảng của tab đang mở: gõ "hpg" ở tab Mã rồi sang tab Công thức thì thấy các phép tính của HPG.
   * Cả hai bảng đều tìm được theo mã, nên một chuỗi phục vụ được cả hai.
   *
   * Ở tab Mã nó chỉ lọc HÀNG HIỆN — tỷ trọng vẫn tính trên cả danh mục.
   */
  const [query, setQuery] = useState('');
  /**
   * Số dòng của chuỗi giá đang nằm trong máy (`ffb.series.v1`).
   *
   * Đọc đúng kho mà `FormulaDetail` đọc lúc mở một phép tính đã lưu (nó nạp chuỗi từ kho này ngay
   * lúc mount), để cờ "cần nạp lại chuỗi" ở đây và `seriesMismatch` ở màn chi tiết không thể nói hai
   * điều khác nhau về cùng một phép tính. Xem `needsReload` bên dưới.
   */
  const [seriesRows, setSeriesRows] = useState(0);
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
   * Khối bày chúng từng là tab "Công thức", bị gỡ cùng cụm tab (14/09/2026) trong khi nút Lưu ở
   * 111 màn chi tiết vẫn ghi vào kho — lưu xong không có chỗ nào để thấy lại, và chủ dự án báo
   * đúng hệ quả ấy như một lỗi (15/09/2026). Khối quay lại thành khối thứ hai dưới Nắm giữ, rồi
   * 10/10/2026 thành tab "Công thức" của cụm hai tab — xem `PortfolioTab`.
   */
  const [savedCalcs, setSavedCalcs] = useState<ReadonlyArray<SavedCalc>>([]);

  /**
   * Tab đang mở. Luôn khởi tạo là `'holdings'` để lần render đầu của client bằng đúng HTML tĩnh
   * (build không biết `?tab=` hay hash); effect nạp kho bên dưới mới đổi sang `'saved'`.
   */
  const [tab, setTab] = useState<PortfolioTab>('holdings');

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

    try {
      setSeriesRows(parseStoredSeries(window.localStorage.getItem(PRICE_SERIES_KEY)).rows.length);
    } catch {
      // Không đọc được kho chuỗi thì coi như trong máy không có chuỗi nào (0 dòng).
    }

    /*
     * Tab mở sẵn đến từ MỘT TRONG HAI lối: `?tab=cong-thuc` (bản tab cũ ghi ra, và `switchTab`
     * ghi lại) hoặc neo `#phep-tinh-da-luu`, đích của nút Lưu ở màn chi tiết (`savedCalcsPath()`).
     * Đọc `window.location` trong effect chứ không dùng `useSearchParams()`: với `output:
     * 'export'` hook ấy ép cả cây vào `<Suspense>` và Next bỏ nó khỏi HTML tĩnh.
     */
    try {
      const wantsSaved =
        new URLSearchParams(window.location.search).get('tab') === SAVED_TAB_PARAM ||
        window.location.hash === `#${SAVED_CALCS_ANCHOR}`;
      if (wantsSaved) setTab('saved');
    } catch {
      // URL lạ thì cứ mở tab mặc định.
    }

    setAsOf(todayIso());
    setLoaded(true);
  }, []);

  /**
   * Đổi tab và ghi lại vào URL, để chia sẻ đường dẫn và tải lại trang đều đúng tab.
   *
   * `replaceState` chứ không `pushState`: đổi tab không phải đi tới một màn khác, và nhồi từng
   * lượt bấm vào lịch sử sẽ biến nút Back thành "quay lại tab trước". Hash bị bỏ khi về tab Mã —
   * giữ `#phep-tinh-da-luu` lại trên URL của tab Mã là nói dối về chỗ đang đứng. Truyền
   * `window.history.state` lại nguyên vẹn: Next lưu `__NA` ở đó, ghi đè bằng `null` là làm nó mất
   * khả năng quay lại mục này.
   */
  const switchTab = useCallback((next: PortfolioTab): void => {
    setTab(next);
    try {
      const url = new URL(window.location.href);
      if (next === 'saved') url.searchParams.set('tab', SAVED_TAB_PARAM);
      else url.searchParams.delete('tab');
      if (next === 'holdings' && url.hash === `#${SAVED_CALCS_ANCHOR}`) url.hash = '';
      window.history.replaceState(window.history.state, '', url);
    } catch {
      // Trình duyệt chặn History API — tab vẫn đổi, chỉ là URL không theo.
    }
  }, []);

  /*
   * Không còn effect "cuộn tới neo rồi giữ nó ở đó" (đã xoá 10/10/2026). Nó sinh ra ngày 15/09
   * vì khối Phép tính đã lưu đứng DƯỚI khối Nắm giữ: đo trên Chrome thật, thị giá về vài trăm
   * mili giây sau thì mỗi dòng cao thêm một hàng và khối bị đẩy xuống 702/780px. Nay tab Công
   * thức chỉ có đúng khối ấy, ngay dưới thanh tab, nên không còn gì phía trên để đẩy nó đi và
   * neo `#phep-tinh-da-luu` chỉ cần MỞ ĐÚNG TAB — xem effect nạp kho.
   */

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
   * Bỏ một mã khỏi danh mục — việc nút thùng rác ở mỗi dòng gọi.
   *
   * Đang sửa đúng mã vừa bị bỏ thì form phải đóng, nếu không nó sẽ lưu ngược một mã không còn tồn
   * tại (`updateHolding` lên một mã vắng thì không làm gì, và form thì cứ báo như đã lưu).
   *
   * MỘT lần bấm là mất, không hỏi lại, không hoàn tác — đúng bản thiết kế 12/10/2026. Trước đó nút Bỏ
   * nằm trong khối mở của dòng nên cần hai thao tác; nay là một nút biểu tượng đứng cạnh nút Sửa.
   */
  const removeRow = useCallback(
    (code: string): void => {
      setHoldings((current) => removeHolding(current, code));
      if (editing === code) closeForm();
    },
    [editing, closeForm],
  );

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
    if (form.buyDate !== '' && form.buyDate > todayIso()) next.buyDate = t('portfolio.errBuyDate');
    if (advanced && betaTyped !== '' && typedBeta === null) next.beta = t('portfolio.errBeta');

    /*
     * Trần số mã: `addHolding()` từ chối trong im lặng khi danh mục đã đầy, nên phải chặn ở đây
     * mới nói được lý do. Chỉ tính là "thêm mới" khi mã chưa có — một mã ĐANG giữ thì `addHolding()`
     * cộng dồn vào dòng cũ nên không chạm trần.
     *
     * Vế `!holdings.some(...)` nay là lớp chắn thứ hai: sheet chọn mã đã khoá nút của mã đang giữ
     * (xem bia mộ `mergingInto`), nên `code` tới được đây thì chắc chắn là mã mới. Giữ lại vì nó
     * bảo vệ đúng thứ `addHolding()` vẫn làm, chứ không phải thứ màn hình đang cho phép.
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

  /*
   * ── Trạng thái "cộng dồn" của form đã BỎ (10/10/2026) ──────────────────────────────────────
   *
   * `mergingInto` nhận ra mã đang chọn ở form THÊM đã nằm trong danh mục, để form nói trước rằng
   * `addHolding()` sẽ **cộng dồn** số lượng và tính lại giá vốn bình quân chứ không tạo dòng thứ
   * hai. Nó chữa một lỗi thật: trước đó việc ấy xảy ra trong im lặng — thêm 50 CP rồi thấy dòng
   * cũ nhảy lên 150 CP mà không có lời nào, nên người dùng tưởng màn đang cho tạo mã trùng.
   *
   * Nay sheet chọn mã KHOÁ nút của mã đang giữ (chủ dự án chốt, nguyên văn ở bia mộ trong
   * `vi.ts`), nên `form.code` ở nhánh thêm không bao giờ còn là một mã đã có — không còn trạng
   * thái nào để mà nhận ra. Đi cùng nó là `portfolio.mergeNote` (câu nói trước) và hai nhãn nút
   * `portfolio.formMerge*`.
   *
   * `addHolding()` thì KHÔNG đổi — nó vẫn cộng dồn theo mã, và đó là chỗ duy nhất còn giữ hành vi
   * ấy. Đưa lại một mã đang giữ vào form bằng đường nào khác thì phải dựng lại cả ba.
   */

  /** Mã đang giữ — sheet chọn mã dán nhãn và khoá nút của chúng. */
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
   * Nhãn nút lưu — BỐN tổ hợp của hai câu hỏi độc lập.
   *
   * Câu một: nút sắp làm gì với danh mục (thêm dòng mới · lưu bản sửa). Câu hai: xong rồi có mở
   * công thức không.
   *
   * Giữ dạng bảng tra chứ không gộp lại thành toán tử ba ngôi lồng nhau, dù nay chỉ còn hai nhánh:
   * bản lồng nhau đã từng ĐỂ LỌT một tổ hợp — chọn một mã đang giữ RỒI chọn công thức thì nhãn ra
   * "Thêm và mở công thức" trong khi việc sắp xảy ra là cộng dồn. Tổ hợp ấy nay không còn tồn tại
   * (xem bia mộ `mergingInto` ở trên), nhưng dạng bảng là thứ làm một chỗ hổng lộ ra bằng mắt, và
   * câu hỏi "nút này hứa đúng việc nó làm chưa" thì không hết.
   */
  const submitLabel = useMemo(() => {
    const open = plannedFormula !== null;
    if (editing !== null) return t(open ? 'portfolio.formSaveOpen' : 'portfolio.formSave');
    return t(open ? 'portfolio.formSubmitOpen' : 'portfolio.formSubmit');
  }, [plannedFormula, editing, t]);

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

  // ── Dữ liệu của hai bảng ────────────────────────────────────────────────────

  /**
   * Hàng của bảng Nắm giữ sau khi lọc bằng ô "Tìm kiếm".
   *
   * `normalizeVi()` bỏ dấu và hạ chữ thường — cùng hàm với sheet chọn mã, nên gõ "fpt" hay "FPT" hay
   * gõ không dấu tên doanh nghiệp đều ra đúng. Lọc chỉ ẨN HÀNG: `summary.rows` vẫn là cả danh mục, nên
   * tỷ trọng của một mã không đổi khi người dùng gõ vào ô tìm (mẫu số là cả danh mục, không phải
   * phần đang hiện). Tên doanh nghiệp lấy bù từ `quotes` như cột Doanh nghiệp ngày trước vẫn làm —
   * cùng gói dữ liệu đã tải để tra thị giá, không thêm lời gọi mạng nào.
   */
  const needle = normalizeVi(query).trim();
  const visibleRows = useMemo(() => {
    if (needle === '') return summary.rows;
    return summary.rows.filter((row) => {
      const name = row.holding.name ?? quotes.get(row.holding.code)?.name ?? '';
      return normalizeVi(row.holding.code).includes(needle) || normalizeVi(name).includes(needle);
    });
  }, [summary.rows, needle, quotes]);

  /*
   * Mọi dòng của bảng Phép tính đã lưu, dựng MỘT lượt — xem `SavedRowView`. Không bọc `useMemo`: hai
   * hook định dạng (`pick`, `valueText`) trả hàm mới mỗi lượt render nên phụ thuộc của nó đổi mỗi lần,
   * mà kho chỉ giữ tối đa ba mươi mục.
   */
  const savedRows: SavedRowView[] = savedCalcs.map((saved) => {
    const summaryOf = SUMMARY_BY_ID.get(saved.formulaId);
    // Công thức bị gỡ khỏi Registry thì id vẫn là thứ nhận ra được, hơn là một dòng trống.
    const formulaName = summaryOf === undefined ? saved.formulaId : pick(summaryOf.name);
    const viResult =
      saved.resultValue === null
        ? undefined
        : formatValueWithUnit(saved.resultValue, saved.resultUnit);
    const localResult =
      saved.resultValue === null ? undefined : valueText(saved.resultValue, saved.resultUnit);

    /*
     * Tên đã cất là chuỗi ĐÃ GHÉP ở ngôn ngữ lúc bấm Lưu, nên đổi sang EN nó vẫn tiếng Việt.
     * `displayCalcName()` nhận ra tên nào vốn là GỢI Ý rồi dựng lại ở ngôn ngữ đang xem; tên người
     * dùng tự gõ giữ nguyên từng chữ.
     */
    const savedName =
      summaryOf === undefined
        ? saved.name
        : displayCalcName({
            stored: saved.name,
            viName: summaryOf.name.vi,
            localName: formulaName,
            ...(saved.code === undefined ? {} : { code: saved.code }),
            ...(viResult === undefined || localResult === undefined
              ? {}
              : { viResult, localResult }),
            savedAt: saved.savedAt,
          });

    /*
     * Tên nào là GỢI Ý tự sinh ("GVR · P/E · 10/10/2026") thì cột Công thức chỉ cần tên công thức —
     * mã đã có cột riêng ngay cạnh, ngày cũng vậy, in lại là nói ba lần. Tên người dùng tự đặt thì giữ
     * nguyên làm dòng chính, tên công thức xuống làm dòng phụ để người ta còn biết nó tính gì.
     *
     * Nhận ra gợi ý bằng cách dựng lại đúng bộ gợi ý rồi so — cùng cách `displayCalcName()` làm, nên
     * không cần thêm một trường cờ vào kho (chỉ cứu được bản lưu từ nay về sau). Hậu tố né trùng
     * " (2)" do `dedupe()` gắn SAU khi ghép nên phải tách ra trước khi so.
     */
    const suffix = /\s\(\d+\)$/.exec(savedName);
    const base = (suffix === null ? savedName : savedName.slice(0, suffix.index))
      .trim()
      .toLowerCase();
    const suggested = suggestCalcNames({
      formulaName,
      ...(saved.code === undefined ? {} : { code: saved.code }),
      ...(localResult === undefined ? {} : { resultText: localResult }),
      savedAt: saved.savedAt,
    }).some((name) => name.trim().toLowerCase() === base);

    /*
     * Luật "cần nạp lại chuỗi" — đúng luật `seriesMismatch` của `FormulaDetail`, đọc cùng kho
     * (`ffb.series.v1`). Phép tính không dùng chuỗi giá thì không bao giờ bị cờ.
     */
    const needsReload = saved.needsSeries && seriesRows !== (saved.seriesCount ?? 0);

    const title = suggested ? formulaName : savedName;

    return {
      saved,
      title,
      // Tên tự đặt hay mang sẵn mã ("HPG · P/E") — thêm mã nữa là đọc "HPG · HPG · P/E".
      label:
        saved.code === undefined || title.includes(saved.code) ? title : `${saved.code} · ${title}`,
      subtitle: suggested || savedName.includes(formulaName) ? null : formulaName,
      needsReload,
      // `_ _` chứ không 0 (FR-06): dòng bị cờ, hoặc bản lưu cũ/hỏng không còn kết quả.
      result: needsReload || localResult === undefined ? '_ _' : localResult,
      date: formatIsoDate(isoDayOf(saved.savedAt)),
      haystack: normalizeVi(
        [savedName, formulaName, summaryOf?.name.vi, summaryOf?.name.en, saved.code]
          .filter((part): part is string => part !== undefined)
          .join(' '),
      ),
    };
  });

  /*
   * Bảng luôn xếp mới nhất trước. Chip lọc theo mã và ô chọn chiều sắp xếp từng nằm trên bảng (bản
   * thiết kế 12/10/2026) và đã bị chủ dự án bảo bỏ ngay sau đó: ô tìm đã tìm được theo mã, còn
   * kho tối đa 30 phép tính nên một chiều xếp cố định là đủ.
   */
  const shownSaved = savedRows
    .filter((row) => needle === '' || row.haystack.includes(needle))
    .sort((a, b) => b.saved.savedAt - a.saved.savedAt);

  // Số đếm của thẻ tóm tắt tính trên CẢ kho, không theo ô tìm đang gõ.
  const savedTickers = new Set(
    savedCalcs.flatMap((saved) => (saved.code === undefined ? [] : [saved.code])),
  ).size;
  const savedFormulas = new Set(savedCalcs.map((saved) => saved.formulaId)).size;
  const savedReload = savedRows.filter((row) => row.needsReload).length;
  const lastSavedAt = savedCalcs.reduce((latest, saved) => Math.max(latest, saved.savedAt), 0);
  const lastSaved = lastSavedAt > 0 ? formatIsoDate(isoDayOf(lastSavedAt)) : null;

  /**
   * Cụm công cụ ở góc phải dòng tiêu đề: ô "Tìm kiếm" và nút "Thêm mới" — MỘT khuôn cho cả hai tab.
   *
   * Dựng một lần ở đây rồi cả hai tab cùng đặt vào dòng tiêu đề của mình, nên hai tab không thể lệch
   * nhau về chữ, cỡ hay vị trí: đổi tab thì hai thứ này đứng yên (chủ dự án, 12/10/2026 — trước đó
   * là "Tìm mã" + "Thêm mã" bên này và "Tìm công thức hoặc mã" + "Tính công thức mới" bên kia, hai
   * nút rộng khác nhau nên ô tìm nhảy chỗ mỗi lần đổi tab).
   *
   * Cùng chữ, khác việc — theo tab đang mở:
   *   - Ô tìm lọc bảng của tab ấy (xem `query`).
   *   - "Thêm mới" ở tab Mã MỞ FORM thêm mã, nên là `<button>`. Ở tab Công thức nó DẪN sang danh sách
   *     công thức, nên là `<Link>` — một phép tính chỉ sinh ra ở màn chi tiết công thức (bấm Lưu ở
   *     đó), màn này không có form nào để "thêm" nó tại chỗ. Điều hướng thì phải là liên kết: mở được
   *     bằng chuột giữa và menu ngữ cảnh.
   *
   * Ô tìm LUÔN có mặt, kể cả khi tab đang mở chưa có dòng nào. Bản trước giấu nó lúc rỗng ("không có
   * gì để lọc"); giữ luật ấy thì một tab có dữ liệu và một tab rỗng sẽ cho hai dòng tiêu đề khác
   * nhau, đúng thứ yêu cầu này bảo bỏ.
   *
   * Dấu cộng là SVG `aria-hidden` chứ không phải ký tự '+' trong nhãn — nếu không, tên khả truy cập
   * của nút thành "+ Thêm mới". Nút ở tab Mã không bị form thay chỗ: form là hộp thoại nổi giữa màn,
   * và phần trang phía sau đã `inert` nên nút không với tới được trong lúc hộp thoại mở.
   */
  const headTools = (
    <div className={styles.headTools}>
      <div className={styles.search}>
        <SearchBox
          value={query}
          onChange={setQuery}
          label={t('portfolio.search')}
          placeholder={t('portfolio.search')}
          compact
        />
      </div>

      {tab === 'holdings' ? (
        <button
          type="button"
          className={styles.addButton}
          onClick={() => {
            setFormOpen(true);
          }}
        >
          <StatIcon d={TILE_ICONS.plus} />
          {t('portfolio.addNew')}
        </button>
      ) : (
        <Link className={styles.addButton} href={ROUTES.formulas}>
          <StatIcon d={TILE_ICONS.plus} />
          {t('portfolio.addNew')}
        </Link>
      )}
    </div>
  );

  /**
   * Dải thị giá — chân thẻ tóm tắt.
   *
   * Từng là dải đứng riêng ngay dưới lưới sáu ô, rồi (22/09/2026) gộp vào dòng tiêu đề của khối Nắm
   * giữ; từ 12/10/2026 nó nằm ở chân thẻ tóm tắt, đúng chỗ bản thiết kế vẽ "Giá phiên 10/10/2026".
   * GỘP chứ không nhân đôi: ngày phiên là lời hứa "số này thuộc phiên nào", nói hai lần là dựng hai
   * nguồn sự thật cho cùng một điều.
   *
   * Luôn hiện khi danh mục có mã, kể cả lúc mọi thứ bình thường: "giá của phiên nào" là thông tin
   * cần thường trực chứ không phải chỉ lúc hỏng — mở app chiều thứ Bảy thì con số đang nhìn là giá
   * thứ Sáu. Nút làm mới cũng vì thế mà luôn có mặt.
   *
   * Vẫn MỘT phần tử duy nhất mang `role="status"`/`"alert"`, và ngày phiên in đúng MỘT lần trên cả
   * màn: giá cũ (`'stale'`) chỉ được phép hiện khi màn nói ra nó là giá của phiên nào
   * (`price-cache-store.ts`), và ca kiểm tìm ngày ấy bằng `getByText` đơn.
   */
  const priceStrip =
    holdings.length === 0 ? null : (
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
          {/*
            Nguồn TRẢ LỜI ĐƯỢC nhưng không mã nào có giá — ca thật, gặp ngay khi người dùng gõ một
            mã không nằm trong danh sách Finbox (ví dụ 'VNI', vốn là chỉ số chứ không phải cổ
            phiếu). Bốn nhánh trên đều tắt: không đang tải, không hỏng, không giá cũ, và không có
            ngày phiên nào để khoe.

            Không có nhánh này thì dòng chỉ còn mỗi nút "Làm mới" đứng chơ vơ — người dùng thấy một
            thao tác được mời gọi mà không biết để làm gì. Lý do đầy đủ (mã nào thiếu, nên làm gì)
            đã nằm ở dòng "Tổng giá trị" ngay trên, nên ở đây chỉ cần một câu ngắn.
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
    );

  return (
    <div className={styles.screen}>
      {/*
        KHÔNG có `<h1>` ở đây — tiêu đề "Danh mục của tôi" do thanh trên dựng (`HeaderIdentity` +
        `headerTitleKey()`). Chữ "Danh mục" đầu cột trái chỉ là NHÃN của cột (12/10/2026, theo bản
        thiết kế); trang vẫn đúng một `<h1>`.

        ── Hai cột (từ 1024px) ──────────────────────────────────────────────────────────────────
        Cột trái: nhãn · tab dọc · thẻ tóm tắt đổi theo tab. Cột phải: tabpanel. Dưới 1024px hai cột
        xếp chồng — phương án TẠM, chờ thiết kế khổ điện thoại (chủ dự án: "tạm thời tính sau").

        Tab dọc nằm ở cột trái còn tabpanel ở cột phải, không liền kề trong DOM: `aria-controls` của
        mọi tab trỏ vào MỘT id chung (`PORTFOLIO_PANEL_ID`) nên không phụ thuộc chuyện ai đứng cạnh ai.
        Chỉ MỘT tabpanel nằm trong DOM tại một thời điểm. Thị giá, kho đã lưu và hai sheet sống ở
        state của CẢ MÀN chứ không ở panel, nên đổi tab không gọi lại Finbox và không làm mất gì.
      */}
      <div className={styles.layout}>
        <div className={styles.side}>
          <p className={styles.sideTitle}>{t('portfolio.sideTitle')}</p>

          {/*
            Số đếm của CẢ HAI tab hiện ngay trên thanh, kể cả tab đang đóng: đó là cách người vừa bấm
            "Lưu vào danh mục" ở màn chi tiết biết kho có mục mà không phải đoán tab nào chứa nó.
            Nhãn tab dùng thẳng tiêu đề của hai khối — một nguồn chữ (xem mộ chí ở `vi.ts`).
          */}
          <TabBar
            label={t('portfolio.title')}
            idBase={PORTFOLIO_TABS_ID}
            panelId={PORTFOLIO_PANEL_ID}
            orientation="vertical"
            value={tab}
            onChange={switchTab}
            items={[
              {
                value: 'holdings',
                label: t('portfolio.holdings'),
                count: holdings.length,
                icon: <StatIcon d={TILE_ICONS.tabHoldings} />,
              },
              {
                value: 'saved',
                label: t('portfolio.savedTitle'),
                count: savedCalcs.length,
                icon: <StatIcon d={TILE_ICONS.tabSaved} />,
              },
            ]}
          />

          {tab === 'holdings' ? (
            <HoldingsSummary
              totalValue={summary.totalValue}
              totalCost={summary.totalCost}
              gain={summary.gain}
              gainPercent={summary.gainPercent}
              beta={summary.beta}
              xirr={summary.xirr}
              advanced={advanced}
              hiddenCount={ADVANCED_TILES}
              footer={priceStrip}
            />
          ) : (
            <SavedSummary
              count={savedCalcs.length}
              tickers={savedTickers}
              formulas={savedFormulas}
              reload={savedReload}
              lastSaved={lastSaved}
            />
          )}
        </div>

        <div className={styles.main}>
          {tab === 'holdings' && (
            <div
              id={PORTFOLIO_PANEL_ID}
              role="tabpanel"
              aria-labelledby={tabId(PORTFOLIO_TABS_ID, 'holdings')}
            >
              <section className={styles.block} aria-labelledby="portfolio-holdings">
                {/*
                  Tiêu đề đứng MỘT MÌNH. Số đếm "5 / 50" từng đứng cạnh nó (bản thiết kế 12/10/2026) và
                  chủ dự án bảo bỏ cùng ngày, cùng với con số cạnh "Phép tính đã lưu": số mã đã có trên
                  tab ở cột trái. Trần 50 mã vì thế chỉ còn nói ra ở câu lỗi `portfolio.errFull`, lúc
                  người dùng chạm trần.
                */}
                <div className={styles.blockHead}>
                  <h2 className={styles.mainTitle} id="portfolio-holdings">
                    {t('portfolio.holdings')}
                  </h2>

                  {/* Ô "Tìm kiếm" và nút "Thêm mới" — một khuôn cho cả hai tab, xem `headTools`. */}
                  {headTools}
                </div>

                {holdings.length === 0 ? (
                  <div className={styles.empty}>
                    <span className={styles.emptyIcon} aria-hidden="true">
                      <StatIcon d={TILE_ICONS.count} />
                    </span>
                    <p className={styles.emptyText}>{t('portfolio.empty')}</p>
                  </div>
                ) : visibleRows.length === 0 ? (
                  <p className={styles.noMatch}>{t('portfolio.noMatch')}</p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.holdList}>
                      {/*
                        Chú thích bảng, ẩn khỏi mắt: `<h2>` ngay trên đã nói đúng điều này cho người
                        nhìn thấy. Trình đọc màn hình thì cần nó — nó là câu đọc trước khi bước vào
                        bảng, và không có nó thì bảng chỉ được xướng tên là "bảng".
                      */}
                      <caption className="visually-hidden">{t('portfolio.tableCaption')}</caption>

                      <thead className={styles.holdHead}>
                        <tr>
                          <th scope="col">{t('portfolio.colCode')}</th>
                          <th scope="col">{t('portfolio.colShares')}</th>
                          <th scope="col">{t('portfolio.colCostPrice')}</th>
                          <th scope="col">{t('portfolio.marketPrice')}</th>
                          <th scope="col">{t('portfolio.gain')}</th>
                          <th scope="col">{t('portfolio.colPercent')}</th>
                          <th scope="col">{t('portfolio.colWeight')}</th>
                          {/* Cột chỉ chở hai nút biểu tượng: nhãn ẩn khỏi mắt nhưng trình đọc màn hình có tên. */}
                          <th scope="col">
                            <span className="visually-hidden">{t('portfolio.colActions')}</span>
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {visibleRows.map((row) => {
                          const { holding } = row;
                          const up = row.gain !== null && row.gain >= 0;

                          return (
                            <tr key={holding.code} className={styles.holdRow}>
                              <td className={styles.holdCode}>
                                <Badge tone="code">{holding.code}</Badge>
                              </td>

                              <td className={`${styles.holdCell} ${styles.holdMuted}`}>
                                {formatNumber(holding.quantity) ?? holding.quantity}
                              </td>

                              <td className={`${styles.holdCell} ${styles.holdMuted}`}>
                                {formatNumber(holding.costPrice) ?? '_ _'}
                              </td>

                              {/*
                                Bốn ô sau (thị giá, lãi/lỗ, %, tỷ trọng) sống chết theo thị giá. Thiếu
                                giá thì cả bốn hiện `_ _` — đúng ký hiệu "chưa có số" mà cả sản phẩm
                                đang dùng — chứ KHÔNG hiện 0 ₫ hay 0% (FR-06). Lý do và lối xử lý nằm ở
                                chân thẻ tóm tắt, chỗ có nút Làm mới, nên không lặp ở từng hàng.
                              */}
                              <td className={`${styles.holdCell} ${styles.holdPrice}`}>
                                {row.marketPrice === null ? (
                                  <span className={styles.holdMissing}>_ _</span>
                                ) : (
                                  (formatNumber(row.marketPrice) ?? '_ _')
                                )}
                              </td>

                              {/*
                                Lãi/lỗ hai cột: số tiền, rồi mũi tên + phần trăm. Dấu +/− nằm TRONG
                                chữ chứ không chỉ ở màu và mũi tên (NFR-USA-06) — đây là chỗ duy nhất
                                của màn mà màu đỏ và màu xanh nói ngược nhau, nên nó phải đọc được cả
                                khi không phân biệt màu. Mũi tên chỉ là trang trí (`aria-hidden`).
                              */}
                              <td className={styles.holdCell}>
                                {row.gain === null ? (
                                  <span className={styles.holdMissing}>_ _</span>
                                ) : (
                                  <span
                                    className={[
                                      styles.holdGain,
                                      up ? styles.holdGainUp : styles.holdGainDown,
                                    ].join(' ')}
                                  >
                                    {up ? '+' : '−'}
                                    {formatNumber(Math.abs(row.gain), { maxDecimals: 0 }) ?? '_ _'}
                                  </span>
                                )}
                              </td>

                              <td className={styles.holdCell}>
                                {row.gain === null || row.gainPercent === null ? (
                                  <span className={styles.holdMissing}>_ _</span>
                                ) : (
                                  <span
                                    className={[
                                      styles.holdGainPct,
                                      up ? styles.holdGainUp : styles.holdGainDown,
                                    ].join(' ')}
                                  >
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <path
                                        d={up ? 'M12 19V5M5 12l7-7 7 7' : 'M12 5v14M19 12l-7 7-7-7'}
                                      />
                                    </svg>
                                    {up ? '+' : '−'}
                                    {formatNumber(Math.abs(row.gainPercent), {
                                      minDecimals: 1,
                                      maxDecimals: 1,
                                    }) ?? '_ _'}
                                    %
                                  </span>
                                )}
                              </td>

                              {/*
                                Tỷ trọng: thanh ngang rồi con số. Thanh là `aria-hidden`: nó vẽ lại
                                đúng con số ngay bên cạnh, nên để trình đọc màn hình nghe thấy là nghe
                                hai lần. Bề rộng đi qua biến CSS chứ không qua `width` thẳng, để CSS
                                giữ quyền quyết định thanh dài tối đa bao nhiêu.
                              */}
                              <td className={styles.holdCell}>
                                {row.weight === null ? (
                                  <span className={styles.holdMissing}>_ _</span>
                                ) : (
                                  <span className={styles.holdWeightCell}>
                                    <span
                                      className={styles.weightBar}
                                      style={
                                        {
                                          '--weight': `${String(Math.max(0, Math.min(100, row.weight)))}%`,
                                        } as CSSProperties
                                      }
                                      aria-hidden="true"
                                    />
                                    <span className={styles.holdWeight}>
                                      {formatNumber(row.weight, {
                                        minDecimals: 1,
                                        maxDecimals: 1,
                                      }) ?? '_ _'}
                                      %
                                    </span>
                                  </span>
                                )}
                              </td>

                              {/*
                                Hai nút biểu tượng thay cho khối mở ra khi bấm một dòng (12/10/2026).
                                Biểu tượng KHÔNG mang chữ nên tên khả truy cập đi qua `aria-label`
                                ("Sửa FPT", "Bỏ mã FPT"); từng có bài học ngược lại ở đây — nút `ƒ`
                                và `×` trần trên nền trong suốt bị chủ dự án báo "mờ nhạt và không
                                biết có thể thao tác", nên cả hai nút có viền focus, vùng chạm 44px
                                và màu chữ đủ đậm (xem `.rowAction`).

                                Nút Bỏ mã KHÔNG hỏi lại và không hoàn tác — đúng bản thiết kế. Từng
                                phải mở khối chi tiết rồi mới bấm tới, tức hai thao tác.
                              */}
                              <td className={styles.holdActions}>
                                <button
                                  type="button"
                                  className={styles.rowAction}
                                  aria-label={`${t('portfolio.edit')} ${holding.code}`}
                                  onClick={() => {
                                    startEdit(holding);
                                  }}
                                >
                                  <StatIcon d={TILE_ICONS.edit} />
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.rowAction} ${styles.rowActionDanger}`}
                                  aria-label={`${t('portfolio.remove')} ${holding.code}`}
                                  onClick={() => {
                                    removeRow(holding.code);
                                  }}
                                >
                                  <StatIcon d={TILE_ICONS.trash} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/*
                  ── Mẫu số đang hụt: nói ra, và CHỈ khi nó hụt ────────────────────────────────

                  `total` cộng bằng `row.value ?? 0`, nên một mã chưa tra được giá bị coi như 0 và rơi
                  khỏi mẫu số — tỷ trọng của các mã còn lại vì thế cộng lại đủ 100% trong khi danh mục
                  thì chưa đủ. Im lặng ở đây đúng là loại "số sai mà trông có lý" mà FR-06 dựng ra để
                  chặn. Câu định nghĩa tỷ trọng đã bỏ 08/10/2026 theo chủ dự án — mộ chí ở khoá
                  `portfolio.weightNote` trong `vi.ts`.
                */}
                {summary.rows.some((row) => row.value === null) && (
                  <p className={styles.weightNote}>{t('portfolio.weightPartial')}</p>
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
                    title={
                      editing === null ? t('portfolio.add') : `${t('portfolio.edit')} ${editing}`
                    }
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
                            <span className={styles.codePlaceholder}>
                              {t('portfolio.pickCode')}
                            </span>
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
                        {/*
                  Không còn câu "Mã này đã có trong danh mục. Thêm nữa sẽ cộng dồn số lượng…" —
                  chủ dự án chốt bỏ 10/10/2026 cùng lượt với việc khoá nút chọn của mã đang giữ.
                  Câu ấy giải thích một việc nay không xảy ra được nữa; nguyên văn và lý do ở bia
                  mộ `portfolio.mergeNote` trong `vi.ts`.
                */}
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
                        error={errors.buyDate}
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
                            <span className={styles.codePlaceholder}>
                              {t('portfolio.pickCodeFirst')}
                            </span>
                          ) : plannedFormulaName === null ? (
                            <span className={styles.codePlaceholder}>
                              {t('portfolio.pickFormula')}
                            </span>
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
          )}

          {/*
            Tab Công thức — đích của nút Lưu ở màn chi tiết công thức.

            LUÔN dựng khi tab này đang mở, kể cả kho rỗng. Bản khối-thứ-hai (15/09/2026) chỉ dựng khi
            có mục, vì khi ấy nó nằm thường trực dưới danh mục của MỌI người — kể cả người chưa từng
            bấm Lưu, và một ô rỗng thường trực là thứ chủ dự án đã gỡ cùng cụm tab. Nay người dùng
            chủ động bấm sang tab, đúng điều kiện bản tab đầu tiên dùng để cho phép ô rỗng.

            `id={SAVED_CALCS_ANCHOR}` ở lại trên `<section>` chứ không lên tabpanel: đó là phần tử mà
            `savedCalcsPath()` và `chrome-check.mjs` nhắm tới, và nó vẫn là thứ có tiêu đề.

            Từ 12/10/2026 danh sách `<ul>` thành BẢNG (công thức · mã · kết quả · ngày lưu · hành động)
            kèm ô tìm (chip lọc theo mã và ô sắp xếp trong bản vẽ đã bỏ cùng ngày). Bảng đảo lại lời
            chủ dự án chốt từ bản tab —
            *"số liệu thì khi mở lại thì mới thấy được"* — vì bản thiết kế mới có cột Kết quả; điều kiện
            để cột ấy lương thiện là dòng nào mở lại sẽ ra số khác thì in `_ _` (xem `SavedRowView`).
          */}
          {tab === 'saved' && (
            <div
              id={PORTFOLIO_PANEL_ID}
              role="tabpanel"
              aria-labelledby={tabId(PORTFOLIO_TABS_ID, 'saved')}
            >
              <section
                id={SAVED_CALCS_ANCHOR}
                className={styles.block}
                aria-labelledby="portfolio-saved"
              >
                <div className={styles.blockHead}>
                  {/* Không còn số đếm cạnh tiêu đề — xem chú thích ở tiêu đề "Mã nắm giữ". */}
                  <h2 className={styles.mainTitle} id="portfolio-saved">
                    {t('portfolio.savedTitle')}
                  </h2>

                  {/* Cùng cụm với tab Mã; "Thêm mới" ở đây dẫn sang danh sách công thức. */}
                  {headTools}
                </div>

                {savedCalcs.length === 0 ? (
                  <div className={styles.empty}>
                    <span className={styles.emptyIcon} aria-hidden="true">
                      <StatIcon d={TILE_ICONS.tabSaved} />
                    </span>
                    <p className={styles.emptyText}>{t('portfolio.savedEmpty')}</p>
                    <Link
                      className={`${styles.savedAction} ${styles.savedActionOpen}`}
                      href={ROUTES.formulas}
                    >
                      {t('portfolio.savedEmptyAction')}
                    </Link>
                  </div>
                ) : shownSaved.length === 0 ? (
                  <p className={styles.noMatch}>{t('portfolio.savedNoMatch')}</p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.savedList}>
                      <caption className="visually-hidden">
                        {t('portfolio.savedTableCaption')}
                      </caption>

                      <thead className={styles.holdHead}>
                        <tr>
                          <th scope="col">{t('portfolio.savedColFormula')}</th>
                          <th scope="col">{t('portfolio.colCode')}</th>
                          <th scope="col">{t('portfolio.savedColResult')}</th>
                          <th scope="col">{t('portfolio.savedColDate')}</th>
                          <th scope="col">
                            <span className="visually-hidden">{t('portfolio.colActions')}</span>
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {shownSaved.map((row) => (
                          <tr
                            key={row.saved.id}
                            className={
                              row.needsReload
                                ? `${styles.savedRow} ${styles.savedRowWarn}`
                                : styles.savedRow
                            }
                          >
                            <td className={styles.savedName}>
                              <span className={styles.savedTitle}>{row.title}</span>
                              {row.subtitle !== null && (
                                <span className={styles.savedSub}>{row.subtitle}</span>
                              )}
                              {/*
                                    Lý do của ô Kết quả đang `_ _` (FR-06) — thứ bản thiết kế đặt ở cột
                                    "Số liệu dùng", cột đã bỏ nên dòng cảnh báo xuống đây, dưới tên.
                                  */}
                              {row.needsReload && (
                                <span className={styles.savedWarn}>
                                  <StatIcon d={TILE_ICONS.warn} size={14} />
                                  {t('portfolio.savedNeedsSeries')}
                                </span>
                              )}
                            </td>

                            <td className={styles.holdCode}>
                              {row.saved.code === undefined ? null : (
                                <Badge tone="code">{row.saved.code}</Badge>
                              )}
                            </td>

                            <td
                              className={
                                row.result === '_ _'
                                  ? `${styles.savedResult} ${styles.holdMissing}`
                                  : styles.savedResult
                              }
                            >
                              {row.result}
                            </td>

                            <td className={styles.savedDate}>{row.date}</td>

                            {/*
                                  "Mở" là `<Link>` chứ không `<button>`: điều hướng sang màn khác thì
                                  phải mở được bằng chuột giữa và menu ngữ cảnh. Dòng bị cờ đổi chữ
                                  thành "Nạp" nhưng đi cùng một đích — màn chi tiết nạp chuỗi từ chính
                                  kho mà cờ này đọc. Tên khả truy cập mở đầu bằng đúng chữ nhìn thấy
                                  (WCAG 2.5.3) rồi nói tiếp là mở cái gì.
                                */}
                            <td className={styles.holdActions}>
                              <Link
                                className={styles.rowLink}
                                href={`${formulaPath(row.saved.formulaId)}?luu=${row.saved.id}`}
                                aria-label={`${row.needsReload ? t('portfolio.savedReload') : t('portfolio.savedOpen')} ${row.label}`}
                              >
                                {row.needsReload
                                  ? t('portfolio.savedReload')
                                  : t('portfolio.savedOpen')}
                              </Link>
                              <button
                                type="button"
                                className={`${styles.rowAction} ${styles.rowActionDanger}`}
                                aria-label={`${t('portfolio.savedRemove')} ${row.label}`}
                                onClick={() => {
                                  persistSaved(removeSavedCalc(savedCalcs, row.saved.id));
                                }}
                              >
                                <StatIcon d={TILE_ICONS.trash} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

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
        Ô miễn trừ đứng CUỐI MÀN, sau cả hai tab — chủ dự án chốt 15/09/2026: *"nội
        dung cảnh báo cho xuống cuối trang"*. Trước đó nó đứng đầu màn, trên sáu ô tiền, theo UI-04
        (mức M: miễn trừ trong tầm nhìn đầu tiên của trang có kết quả). Đổi chỗ là quyết định sản
        phẩm, cùng lượt với màn chi tiết công thức.

        Đây vẫn là câu miễn trừ DUY NHẤT của màn: `showsFooterDisclaimer()` trừ `/danh-muc/` ra nên
        dải xám chân trang không dựng ở đây. Ô nằm ngoài mọi nhánh điều kiện nên có ở mọi trạng thái
        của màn — rỗng, đang tải, lỗi thị giá — và đó là điều kiện để dòng trừ bên ấy hợp lệ.
        Nó cũng phải nằm NGOÀI hai tab: `usePathname()` không nhìn thấy `?tab=`, nên bên
        `routes.ts` không có cách nào bù lại nếu một tab trắng câu miễn trừ.
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
           *
           * ── Chỉ nói "thiếu giá" khi ĐÃ TRA và không có ─────────────────────────────────────
           *
           * `quotes` chỉ chứa mã ĐANG GIỮ (`feed.snapshots` gọi theo danh sách nắm giữ). Từ
           * 10/10/2026 form THÊM chỉ chọn được mã chưa giữ — sheet chọn mã khoá phần còn lại —
           * nên `quotes.get(formCode)` ở nhánh thêm luôn `undefined`. Bản cũ đọc `undefined`
           * thành "không có giá", nên sau đợt này mọi lượt thêm mã sẽ ẩn 8 công thức kèm câu
           * "Chưa tra được thị giá của mã này", trong khi màn CHƯA HỀ tra giá mã ấy. Câu đó mới
           * là chỗ sai: nó khẳng định một việc không ai kiểm.
           *
           * Nên `undefined` nay đọc là "chưa biết", và chưa biết thì không in câu nào. Mã thật sự
           * không có thị giá vẫn nhận đúng nhánh cũ qua nhánh SỬA (mã đang giữ nên có bản ghi
           * trong `quotes`, `priceVnd: null`), và ở màn chi tiết thì `FormulaDetail` tự tra lấy
           * và tự nói nếu hụt — không ô nào ra số 0 lặng lẽ (FR-06).
           *
           * Cả khác biệt nằm trong một ký tự: `?.priceVnd` cho ra `undefined` khi CHƯA CÓ bản ghi
           * và `null` khi có bản ghi mà thiếu giá. Vế `?? null` của bản cũ gộp đúng hai thứ ấy lại
           * thành một, nên đừng thêm nó về.
           */
          hasPrice={formCode === null || quotes.get(formCode)?.priceVnd !== null}
        />
      )}
    </div>
  );
}
