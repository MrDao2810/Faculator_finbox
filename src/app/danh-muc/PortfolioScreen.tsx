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
import { createPortal } from 'react-dom';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  DEFAULT_SAVED_SORT,
  FORMULA_SUMMARIES,
  MARKET_FEED,
  MAX_HOLDINGS,
  PENDING_KEY,
  PORTFOLIO_KEY,
  PORTFOLIO_SORT_KEY,
  PRICE_CACHE_KEY,
  PRICE_SERIES_KEY,
  ROUTES,
  SAVED_CALCS_ANCHOR,
  SAVED_CALCS_KEY,
  SAVED_SORT_KEY,
  addHolding,
  displayCalcName,
  effectiveHoldingSort,
  formatIsoDate,
  formatNumber,
  formatValueWithUnit,
  formulaPath,
  importCodes,
  isAbortError,
  isDefaultSavedSort,
  isPriceCacheFresh,
  keepViNumberChars,
  nextHoldingSort,
  nextSavedSort,
  normalizeVi,
  oldestAsOf,
  parseCachedPrices,
  parseDateText,
  parseHoldingSort,
  parseHoldings,
  parsePendingCodes,
  parseSavedCalcs,
  parseSavedSort,
  parseStoredSeries,
  parseViNumber,
  reconcilePending,
  removeHolding,
  removePendingCode,
  removeSavedCalc,
  requestPersistentStorage,
  serializeCachedPrices,
  serializeHoldingSort,
  serializeHoldings,
  serializePendingCodes,
  serializeSavedCalcs,
  serializeSavedSort,
  sortHoldingRows,
  sortPendingCodes,
  sortSavedRows,
  splitCodeList,
  suggestCalcNames,
  summarisePortfolio,
  updateHolding,
} from '@/application';
import type {
  CachedPrices,
  CachedQuote,
  Holding,
  HoldingSort,
  HoldingSortKey,
  HoldingValue,
  MessageKey,
  PriceState,
  SavedCalc,
  SavedSort,
  SavedSortKey,
  SortDirection,
  TickerRef,
  TickerSnapshot,
} from '@/application';
import { usePick, usePreferences, useT } from '@/application/preferences-context';
import { SearchBox } from '@/ui/browse';
import { useValueText } from '@/ui/i18n/units';
import { DateField, filterTypedValue, guardFilteredDelete, resetFilteredDelete } from '@/ui/inputs';
import { DisclaimerBar, HEADER_ACTIONS_ID } from '@/ui/navigation';
import { BottomSheet, Button, Input, TabBar, tabId } from '@/ui/primitives';
import { FormulaForTickerSheet, TickerPickerSheet } from '@/ui/sheets';

import { ExpandToggle } from './ExpandToggle';
import { KhungCho } from './KhungCho';
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
 *
 * ── Khổ dưới 1024px (bản vẽ khổ điện thoại 14/10/2026) ──────────────────────────────────────
 *
 * Một cột: tab ngang, thẻ tóm tắt thu còn một hàng, bảng gọn với dòng mở ra. Bảng Mã còn năm cột (Mã ·
 * Số CP · Giá vốn · Thị giá · Ngày mua); chạm một dòng thì dòng chi tiết mở ngay dưới với Lãi/lỗ,
 * Lãi/lỗ %, Tỷ trọng và hai nút Sửa · Xoá. "Thêm mới" ghim ở đáy, ngay trên thanh điều hướng. Icon Tìm
 * kiếm nằm trên thanh trên (`HEADER_ACTIONS_ID`) và ô tìm mở ra ngay trên thanh ấy. Bảng Công thức thì KHÔNG có dòng mở ra
 * (chủ dự án vẽ lại 14/10/2026): bốn cột như PC, chạm dòng là mở phép tính, dấu X luôn hiện ở cuối dòng.
 *
 * Mọi khác biệt giữa hai khổ là CSS, trừ HAI chỗ: bấm vào dòng bảng Mã (ở PC mở hộp thoại Sửa, dưới
 * 1024px mở/đóng dòng chi tiết — xem `laKhoPC()`), và chỗ đứng của dấu X bảng Công thức (`khoPC`).
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
 * `setField()` — hàm ấy còn gánh `buyDate` (ô ngày `DateField`, tự lọc ký tự) và cặp `code`/`name` do `pickTicker`
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
 * Dạng ngày ISO 'YYYY-MM-DD' — cửa của cột "Ngày mua" ở bảng Mã.
 *
 * `Holding.buyDate` là chuỗi đọc lên từ `localStorage`: rỗng khi người dùng không nhập, và có thể là
 * bất cứ thứ gì nếu kho bị sửa tay. `formatIsoDate()` trả NGUYÊN XI chuỗi không đúng dạng, nên phải
 * soi ở đây — không thì một chuỗi rác đi thẳng lên ô ngày như thể nó là một ngày.
 */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

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
 * Tham số URL mang danh sách mã cần đưa vào danh mục: `/danh-muc/?nhap=FPT,HPG,MWG`.
 *
 * Đây là bộ nối ĐẦU TIÊN của việc lấy mã từ watchlist tài khoản Finbox (13/10/2026). Chủ dự án chốt
 * nguồn là "một đường link hoặc API", hình dạng chưa định — nên tên `nhap` là TẠM, đổi theo link
 * Finbox chốt. Đổi tên chỉ là đổi hằng này: mọi nguồn đều đổ về một cửa `importCodes()`, và bộ nối
 * API sau này cũng chỉ việc gọi đúng cửa ấy với một mảng mã.
 */
const IMPORT_PARAM = 'nhap';

/** id của khung ô tìm — đích `aria-controls` của icon Tìm kiếm trên thanh trên (khổ điện thoại). */
const SEARCH_ID = 'portfolio-search';

/**
 * Lượt tra thị giá do người dùng BẤM (Làm mới, Thử lại) giữ trạng thái chờ ít nhất chừng này — CỐ Ý,
 * không phải thời gian mạng cần.
 *
 * Finbox trả lời trong ~0,2 giây, nên vệt chờ trên bảng và vòng xoay trên nút chỉ chớp một khung hình và
 * con số mới hiện ra y như con số cũ. Chủ dự án bấm Làm mới và không thấy gì được tải lại (14/10/2026):
 * _"chức năng làm mới đang không làm cho tôi cảm thấy dữ liệu đang được tải lại"_. Cùng loại khoảng chờ
 * với `SEARCH_DELAY_MS` ở `TickerPickerSheet.tsx`: người dùng phải THẤY việc mình vừa bấm đang chạy.
 *
 * Chỉ lượt bấm. Lần tải đầu khi mở màn không bị kéo dài: ở đó chờ là thật, và kéo nó ra là bắt mọi lần
 * mở màn chậm đi. Mạng chậm hơn mốc này thì mốc không thêm gì — chờ bao lâu là bấy lâu.
 */
const MIN_REFRESH_MS = 600;

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
  /*
   * Hai biểu tượng `edit` (bút chì — Sửa) và `fill` (bút chì kèm dấu cộng — Nhập số liệu) đã bỏ ngày
   * 13/10/2026 cùng hai nút mang chúng: chủ dự án đổi "mở form" thành cú bấm cả dòng của bảng Mã.
   */
  /*
   * Dấu X — Xoá, ở cả hai bảng (13/10/2026). Từng là thùng rác (`trash`); chủ dự án xem màn và bảo:
   * *"khi nào hover vào mã đó thì hiển thị icon X chứ không phải là icon xóa"*.
   *
   * Hai biểu tượng `open` (mũi tên ra khỏi khung — Mở) và `reload` (mũi tên vòng — Nạp) bỏ cùng lúc:
   * bảng Công thức được dựng lại theo bảng Mã, mở một phép tính là cú bấm cả dòng.
   */
  close: 'M6 6l12 12M18 6 6 18',
  /* Kính lúp và hai mũi tên vòng — icon Tìm kiếm và Làm mới giá trên thanh trên (khổ điện thoại). */
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35',
  refresh: 'M20 11a8 8 0 0 0-14.3-4.7L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.7L20 16M20 20v-4h-4',
  /* Vòng tròn chấm than — dòng phép tính cần nạp lại chuỗi giá. */
  warn: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 8v5M12 16.5v.01',
} as const;

/**
 * Đang ở khổ PC (từ 1024px) không — để cú bấm vào DÒNG bảng chọn việc của nó.
 *
 * Đọc lúc BẤM, không đọc lúc dựng: HTML tĩnh không biết bề ngang màn, nên mọi khác biệt về hình phải là
 * CSS; còn việc của một cú bấm thì chỉ xảy ra sau hydrate, đọc `matchMedia` ở đó là an toàn. Mốc 1024px
 * khớp mọi `@media` của màn.
 *
 * Không có `matchMedia` (jsdom) thì coi là PC — đúng hành vi mọi ca kiểm cũ đã ghim.
 */
function laKhoPC(): boolean {
  return (
    typeof window.matchMedia !== 'function' || window.matchMedia('(min-width: 1024px)').matches
  );
}

/**
 * Tám cột của bảng Mã, theo thứ tự trên PC — cột nào cũng bấm được để sắp (14/10/2026). Dựng hàng tiêu
 * đề từ mảng này chứ không viết tay tám `<th>`, để cột và khoá sắp không thể lệch nhau.
 *
 * Cột cuối từng là cột hai nút Sửa/Xoá với tiêu đề ẩn; nay là ngày mua — xem ô cuối của dòng.
 */
const HOLDING_COLUMNS: ReadonlyArray<{ key: HoldingSortKey; label: MessageKey }> = [
  { key: 'code', label: 'portfolio.colCode' },
  { key: 'quantity', label: 'portfolio.colShares' },
  { key: 'costPrice', label: 'portfolio.colCostPrice' },
  { key: 'marketPrice', label: 'portfolio.marketPrice' },
  { key: 'gain', label: 'portfolio.gain' },
  { key: 'gainPercent', label: 'portfolio.colPercent' },
  { key: 'weight', label: 'portfolio.colWeight' },
  { key: 'buyDate', label: 'portfolio.colBuyDate' },
];

/**
 * Bốn cột của bảng Công thức (14/10/2026). Ba cột bấm được để sắp; Kết quả (`sortKey: null`) thì không,
 * theo lựa chọn của chủ dự án — một cột lẫn ₫, %, lần không có thứ tự nào đúng. Luật ở
 * `saved-calc-sort.ts`.
 */
const SAVED_COLUMNS: ReadonlyArray<{ sortKey: SavedSortKey | null; label: MessageKey }> = [
  { sortKey: 'title', label: 'portfolio.savedColFormula' },
  { sortKey: 'code', label: 'portfolio.colCode' },
  { sortKey: null, label: 'portfolio.savedColResult' },
  { sortKey: 'savedAt', label: 'portfolio.savedColDate' },
];

/** `aria-sort` của một `<th>`: chỉ cột đang sắp mới mang, cột khác để trống. */
function ariaSort(dir: SortDirection | null): 'ascending' | 'descending' | undefined {
  return dir === null ? undefined : dir === 'asc' ? 'ascending' : 'descending';
}

/**
 * Tiêu đề cột bấm được để sắp — của cả hai bảng (bảng Công thức từ chiều 14/10/2026). Tên nút là đúng
 * chữ của cột, nên `columnheader` vẫn đọc ra "Mã", "Số CP"…; chiều đang sắp do `aria-sort` của `<th>`
 * nói, mũi tên chỉ là hình (`aria-hidden`).
 *
 * Mũi tên chỉ có ở cột đang sắp, và nằm TRONG nhãn (`.sortLabel`) để CSS neo nó ngay sau chữ: dành sẵn
 * chỗ cho nó ở cả tám cột là nới mỗi cột thêm một mũi tên, mà năm cột của khổ điện thoại đã vừa khít bề
 * ngang 360px. Chỗ đứng của nó theo khổ nằm ở `.sortIcon`.
 */
function SortHeader({
  label,
  dir,
  onSort,
}: {
  label: string;
  dir: SortDirection | null;
  onSort: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.sortButton}
      data-sap={dir ?? undefined}
      onClick={onSort}
    >
      <span className={styles.sortLabel}>
        {label}
        {dir !== null && (
          <svg
            className={styles.sortIcon}
            width="6"
            height="6"
            viewBox="0 0 6 6"
            aria-hidden="true"
            focusable="false"
          >
            <path d={dir === 'asc' ? 'M3 0.5 6 5.5H0Z' : 'M3 5.5 0 0.5h6Z'} />
          </svg>
        )}
      </span>
    </button>
  );
}

/** id của dòng chi tiết dưới một dòng bảng — đích `aria-controls` của nút mũi tên. */
function chiTietId(bang: 'ma' | 'luu', khoa: string): string {
  return `portfolio-${bang}-chi-tiet-${khoa}`;
}

/** `_ _` — ký hiệu "chưa có số" của cả sản phẩm (FR-06), không bao giờ là 0. */
function ChuaCo() {
  return <span className={styles.holdMissing}>_ _</span>;
}

/*
 * ── Ba con số sống chết theo thị giá: Lãi/lỗ, Lãi/lỗ %, Tỷ trọng ─────────────────────────────────
 *
 * Mỗi số MỘT hàm in, dùng ở hai chỗ: ô của bảng PC và khối chi tiết khổ điện thoại (14/10/2026). Chép
 * hai bản JSX là hai chỗ in lệch nhau — một bên đổi số chữ số thập phân, bên kia không.
 *
 * Thiếu thị giá thì cả ba in `_ _`, KHÔNG in 0 ₫ hay 0% (FR-06). Dấu +/− nằm TRONG chữ chứ không chỉ ở
 * màu và mũi tên (NFR-USA-06): đây là chỗ màu đỏ và màu xanh nói ngược nhau, nên nó phải đọc được cả khi
 * không phân biệt màu. Mũi tên chỉ là trang trí (`aria-hidden`).
 */
function GainValue({ row }: { row: HoldingValue }) {
  if (row.gain === null) return <ChuaCo />;
  const up = row.gain >= 0;
  return (
    <span className={[styles.holdGain, up ? styles.holdGainUp : styles.holdGainDown].join(' ')}>
      {up ? '+' : '−'}
      {formatNumber(Math.abs(row.gain), { maxDecimals: 0 }) ?? '_ _'}
    </span>
  );
}

function GainPercentValue({ row }: { row: HoldingValue }) {
  if (row.gain === null || row.gainPercent === null) return <ChuaCo />;
  const up = row.gain >= 0;
  return (
    <span className={[styles.holdGainPct, up ? styles.holdGainUp : styles.holdGainDown].join(' ')}>
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
        <path d={up ? 'M12 19V5M5 12l7-7 7 7' : 'M12 5v14M19 12l-7 7-7-7'} />
      </svg>
      {up ? '+' : '−'}
      {formatNumber(Math.abs(row.gainPercent), { minDecimals: 1, maxDecimals: 1 }) ?? '_ _'}%
    </span>
  );
}

/**
 * Tỷ trọng: con số, kèm thanh ngang khi `bar`. Thanh là `aria-hidden`: nó vẽ lại đúng con số ngay bên
 * cạnh, để trình đọc màn hình nghe thấy là nghe hai lần. Bề rộng đi qua biến CSS chứ không qua `width`
 * thẳng, để CSS giữ quyền quyết định thanh dài tối đa bao nhiêu.
 */
function WeightValue({ row, bar = false }: { row: HoldingValue; bar?: boolean }) {
  if (row.weight === null) return <ChuaCo />;
  const number = (
    <span className={styles.holdWeight}>
      {formatNumber(row.weight, { minDecimals: 1, maxDecimals: 1 }) ?? '_ _'}%
    </span>
  );
  if (!bar) return number;
  return (
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
      {number}
    </span>
  );
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
  /**
   * MÃ CHỜ SỐ LIỆU — mã lấy từ watchlist Finbox về, đã đứng trong bảng nhưng chưa có số lượng và giá
   * vốn (13/10/2026). Một kho riêng (`ffb.portfolio.pending.v1`), không phải `Holding` có ô trống:
   * lý do đầy đủ ở docblock `portfolio-pending-store.ts`. Hệ quả ở màn này là `summarisePortfolio()`
   * không bao giờ nhìn thấy chúng, nên không dòng chờ nào kéo được một con số của thẻ tóm tắt.
   */
  const [pending, setPending] = useState<ReadonlyArray<string>>([]);
  /**
   * Mã chờ đang được NHẬP SỐ trong hộp thoại. `null` khi hộp thoại không ở chế độ ấy.
   *
   * Chế độ thứ ba, đứng giữa thêm và sửa: mã đã có sẵn và khoá như lúc sửa, nhưng các ô số trống
   * và lúc lưu thì đi nhánh `addHolding()` như lúc thêm. Không bao giờ cùng khác `null` với `editing`.
   */
  const [completing, setCompleting] = useState<string | null>(null);
  /** Mã của lượt nhập gần nhất không còn chỗ trong bảng — màn nêu tên từng mã. Không ghi xuống đĩa. */
  const [overflow, setOverflow] = useState<ReadonlyArray<string>>([]);
  /**
   * Dòng đang MỞ CHI TIẾT ở khổ điện thoại — mã của bảng Mã, kể cả mã chờ. `null` khi không dòng nào mở.
   * Bảng Công thức từng dùng chung biến này; nó bỏ dòng mở ra ngày 14/10/2026 (xem dòng của bảng ấy).
   *
   * Hàng mở rộng QUAY LẠI (14/10/2026) theo bản vẽ khổ điện thoại, sau khi bản hai cột 12/10/2026 bỏ nó.
   * Chỉ ở khổ dưới 1024px: ở PC bảng đủ cột và cú bấm dòng mở hộp thoại Sửa như cũ (`laKhoPC()`).
   *
   * MỘT dòng mở một lúc, như bản vẽ: hai khối chi tiết mở cùng lúc đẩy dòng thứ hai khỏi màn đầu, và
   * mỗi khối có hai nút Xoá — hai nút Xoá trên một màn điện thoại là một lần bấm nhầm đang chờ sẵn.
   */
  const [openRow, setOpenRow] = useState<string | null>(null);
  /**
   * Ô tìm đang MỞ ở khổ điện thoại — icon Tìm kiếm trên thanh trên bật/tắt nó (bản vẽ 14/10/2026). Ở PC
   * ô tìm luôn hiện và biến này không có tác dụng gì.
   */
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement | null>(null);
  const searchToggle = useRef<HTMLButtonElement | null>(null);
  const searchFrame = useRef<HTMLDivElement | null>(null);
  /**
   * Ô trống ở góc phải thanh trên (`HEADER_ACTIONS_ID`), tìm thấy sau khi màn đã gắn vào trang. `null`
   * trong lượt dựng đầu (khớp HTML tĩnh) và trong mọi ca kiểm không dựng thanh trên.
   */
  const [actionsSlot, setActionsSlot] = useState<HTMLElement | null>(null);
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
   * Cách sắp bảng Mã — bấm tiêu đề cột (14/10/2026), luật ở `portfolio-sort.ts`. `null` là thứ tự đã
   * thêm vào. Nhớ trên máy (`PORTFOLIO_SORT_KEY`) theo lựa chọn của chủ dự án; đọc trong effect nạp kho,
   * nên lượt dựng đầu vẫn bằng HTML tĩnh.
   */
  const [sort, setSort] = useState<HoldingSort | null>(null);
  /**
   * Cách sắp bảng Công thức — cũng bấm tiêu đề cột, luật ở `saved-calc-sort.ts` (14/10/2026). Không có
   * `null`: mặc định là Ngày lưu, mới trước, và tiêu đề ấy mang mũi tên ngay từ đầu. Kho riêng
   * (`SAVED_SORT_KEY`), đọc cùng effect nạp kho; bảng này chỉ có dòng sau khi đọc kho nên không có HTML
   * tĩnh nào để lệch.
   */
  const [savedSort, setSavedSort] = useState<SavedSort>(DEFAULT_SAVED_SORT);
  /**
   * Khổ PC hay không, THEO DÕI liên tục — khác `laKhoPC()`, thứ chỉ đọc lúc bấm. Hai việc: bỏ cách sắp
   * theo ba cột mà khổ điện thoại không có trên hàng tiêu đề (`effectiveHoldingSort`), và chọn chỗ đứng
   * của dấu X ở bảng Công thức (`nutXoa`). Khởi tạo là PC, như `laKhoPC()` khi không có `matchMedia`;
   * lượt dựng đầu chưa có cách sắp nào và chưa có dòng nào (cả hai đọc kho trong effect) nên không lệch
   * HTML tĩnh — và effect theo dõi khổ chạy cùng lượt với effect nạp kho, nên dòng hiện ra đã đúng chỗ.
   */
  const [khoPC, setKhoPC] = useState(true);
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

  /**
   * Chuỗi thô của bốn kho mà TAB NÀY thấy lần cuối — lúc đọc, hay lúc chính nó ghi (16/10/2026).
   *
   * Chủ dự án hỏi dữ liệu của khách có mất khi thoát web không. Thoát thì không; nhưng HAI TAB thì có,
   * đo trên Chrome thật: tab Danh mục mở sẵn, tab khác lưu "Bản C", tab này xoá "Bản A" — kho còn mỗi
   * "Bản B", Bản C mất; bảng Mã y như thế với HPG. Màn ghi nguyên mảng trong state của nó, mà state ấy
   * không biết tab kia vừa thêm gì.
   *
   * Ba lối chữa, dùng chung ref này để biết kho có đổi SAU lần cuối tab này nhìn thấy không:
   *   1. `docLaiKho()` trước mỗi thao tác sửa — đọc lại rồi mới áp thay đổi lên bản mới nhất;
   *   2. sự kiện `storage` (tab khác ghi) và lúc quay lại tab (`visibilitychange`, `pageshow`);
   *   3. hai effect ghi bỏ qua khi chuỗi sắp ghi BẰNG chuỗi đã thấy — không ghi lại thứ vừa đọc lên.
   */
  const khoDaThay = useRef<{
    holdings: string | null;
    pending: string | null;
    saved: string | null;
    series: string | null;
  }>({ holdings: null, pending: null, saved: null, series: null });

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
    let stored: Holding[] = [];
    try {
      const raw = window.localStorage.getItem(PORTFOLIO_KEY);
      khoDaThay.current.holdings = raw;
      stored = parseHoldings(raw);
      setHoldings(stored);
    } catch {
      // localStorage bị chặn — màn vẫn dùng được, chỉ không nhớ giữa hai lần mở.
    }

    try {
      setSort(parseHoldingSort(window.localStorage.getItem(PORTFOLIO_SORT_KEY)));
      setSavedSort(parseSavedSort(window.localStorage.getItem(SAVED_SORT_KEY)));
    } catch {
      // Cùng lý do ngay trên — không đọc được thì hai bảng theo thứ tự mặc định.
    }

    /*
     * Mã chờ số liệu: đọc kho, khớp với danh mục vừa đọc, rồi nhận thêm mã từ `?nhap=` nếu có.
     *
     * Đọc `window.location` trong effect chứ không dùng `useSearchParams()` — cùng lý do với
     * `?tab=` ngay dưới: lần dựng đầu phải bằng HTML tĩnh, mà build thì không biết tham số nào.
     *
     * Effect này CHỈ ĐỌC tham số, không gỡ nó. Việc gỡ nằm ở một effect khai sau effect ghi kho (xem
     * dưới), vì hai lẽ: mã phải nằm trên đĩa trước khi dấu vết duy nhất của nó rời URL, và ở chế độ
     * Strict của React effect này chạy HAI lần liền nhau — gỡ ngay ở lần đầu thì lần hai không còn gì
     * để đọc, kho thì chưa kịp ghi, và lượt nhập biến mất. Đọc hai lần cùng một URL và cùng một kho
     * thì ra đúng một kết quả.
     */
    const held = new Set(stored.map((holding) => holding.code));
    let waiting: string[] = [];
    try {
      const raw = window.localStorage.getItem(PENDING_KEY);
      khoDaThay.current.pending = raw;
      waiting = reconcilePending(parsePendingCodes(raw), held);
    } catch {
      // Cùng lý do ngay trên — không đọc được thì coi như chưa có mã chờ nào.
    }

    try {
      const raw = new URLSearchParams(window.location.search).get(IMPORT_PARAM);
      if (raw !== null) {
        const result = importCodes(waiting, held, splitCodeList(raw));
        waiting = result.pending;
        setOverflow(result.overflow);
      }
    } catch {
      // URL lạ thì bỏ qua lượt nhập; phần đã có trong kho vẫn giữ.
    }
    setPending(waiting);

    try {
      const raw = window.localStorage.getItem(SAVED_CALCS_KEY);
      khoDaThay.current.saved = raw;
      setSavedCalcs(parseSavedCalcs(raw));
    } catch {
      // Cùng lý do ngay trên — không đọc được thì coi như chưa lưu gì, khối tự ẩn.
    }

    try {
      const raw = window.localStorage.getItem(PRICE_SERIES_KEY);
      khoDaThay.current.series = raw;
      setSeriesRows(parseStoredSeries(raw).rows.length);
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

  /**
   * Sửa kho phép tính đã lưu: ĐỌC LẠI kho, áp `doi` lên bản vừa đọc, rồi ghi (16/10/2026).
   *
   * Bản cũ nhận thẳng mảng đã tính từ state của màn, nên một phép tính tab khác vừa lưu (không có
   * trong state ấy) bị chính cú xoá ở tab này ghi đè mất — đo được trên Chrome thật, xem `khoDaThay`.
   * `saveCalc()` ở màn chi tiết vốn đã đọc lại trước khi ghi; nay hai đầu ghi cùng một luật.
   *
   * Đọc hỏng thì áp lên bảng đang hiện — đọc hỏng không phải "kho rỗng", và áp lên `[]` là xoá sạch.
   */
  const capNhatDaLuu = useCallback(
    (doi: (list: ReadonlyArray<SavedCalc>) => SavedCalc[]): void => {
      let goc: ReadonlyArray<SavedCalc> = savedCalcs;
      try {
        goc = parseSavedCalcs(window.localStorage.getItem(SAVED_CALCS_KEY));
      } catch {
        // Kho bị chặn — dùng bảng đang hiện.
      }
      const next = doi(goc);
      setSavedCalcs(next);
      try {
        const raw = serializeSavedCalcs(next);
        window.localStorage.setItem(SAVED_CALCS_KEY, raw);
        khoDaThay.current.saved = raw;
      } catch {
        // Hết dung lượng hoặc bị chặn — không chặn thao tác đang làm.
      }
    },
    [savedCalcs],
  );

  /**
   * Đọc lại bốn kho, và chỉ đặt lại state của kho nào ĐÃ ĐỔI so với lần cuối tab này thấy.
   *
   * Gọi ở đầu mỗi thao tác sửa mã (thêm, sửa, xoá, xoá dòng chờ): `setHoldings(bảnMới)` xếp hàng TRƯỚC
   * `setHoldings((current) => …)` của thao tác, nên React đưa đúng bản mới vào `current`. Và gọi khi tab
   * khác ghi hoặc khi người dùng quay lại tab này (effect ngay dưới hai effect ghi).
   *
   * Mã chờ đọc lại CÙNG lượt với mã nắm giữ: `reconcilePending()` bỏ mã chờ nào đã thành nắm giữ, nên
   * phải so với bảng mã mới, không phải bảng cũ.
   *
   * Không đọc được thì giữ nguyên thứ đang hiện — cùng lý do `capNhatDaLuu`.
   */
  const docLaiKho = useCallback((): void => {
    try {
      const da = khoDaThay.current;
      const rawH = window.localStorage.getItem(PORTFOLIO_KEY);
      const rawP = window.localStorage.getItem(PENDING_KEY);
      if (rawH !== da.holdings || rawP !== da.pending) {
        const moi = parseHoldings(rawH);
        da.holdings = rawH;
        da.pending = rawP;
        setHoldings(moi);
        setPending(
          reconcilePending(parsePendingCodes(rawP), new Set(moi.map((holding) => holding.code))),
        );
      }

      const rawS = window.localStorage.getItem(SAVED_CALCS_KEY);
      if (rawS !== da.saved) {
        da.saved = rawS;
        setSavedCalcs(parseSavedCalcs(rawS));
      }

      const rawC = window.localStorage.getItem(PRICE_SERIES_KEY);
      if (rawC !== da.series) {
        da.series = rawC;
        setSeriesRows(parseStoredSeries(rawC).rows.length);
      }
    } catch {
      // Kho bị chặn — giữ nguyên những gì đang hiện.
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

  /*
   * Ghi kho mã. Bỏ qua khi chuỗi sắp ghi bằng đúng chuỗi tab này đã thấy (xem `khoDaThay`): vừa đọc lại
   * từ tab khác thì không ghi ngược thứ vừa đọc lên. Kho chưa có khoá (`null`) thì vẫn ghi `[]` lúc mở
   * màn, như trước — một ca trong `PortfolioScreen.test.tsx` ghim điều ấy.
   */
  useEffect(() => {
    if (!loaded) return;
    const raw = serializeHoldings(holdings);
    if (raw === khoDaThay.current.holdings) return;
    try {
      window.localStorage.setItem(PORTFOLIO_KEY, raw);
      khoDaThay.current.holdings = raw;
    } catch {
      // Hết dung lượng hoặc bị chặn — không chặn thao tác đang làm.
    }
  }, [holdings, loaded]);

  /*
   * Ghi kho mã chờ. Rỗng thì GỠ khoá chứ không ghi `[]`: gần như mọi người dùng không bao giờ nhập
   * mã từ ngoài, và một khoá rỗng thường trực trong máy họ là một kho không có gì để xoá.
   */
  useEffect(() => {
    if (!loaded) return;
    const raw = pending.length === 0 ? null : serializePendingCodes(pending);
    if (raw === khoDaThay.current.pending) return;
    try {
      if (raw === null) window.localStorage.removeItem(PENDING_KEY);
      else window.localStorage.setItem(PENDING_KEY, raw);
      khoDaThay.current.pending = raw;
    } catch {
      // Hết dung lượng hoặc bị chặn — không chặn thao tác đang làm.
    }
  }, [pending, loaded]);

  /*
   * Gỡ `?nhap=` khỏi URL — effect này PHẢI khai ngay dưới effect ghi kho mã chờ ở trên.
   *
   * React chạy các effect của cùng một lượt commit theo thứ tự khai báo, nên tới đây mã vừa nhận đã
   * nằm trên đĩa. Gỡ để tải lại trang hay chia sẻ đường dẫn không mang theo một lệnh nhập; nhập lại
   * thì cũng không hỏng gì (mã đã ở trong bảng bị bỏ qua), nhưng một URL nói "nhập" trong khi không
   * còn gì để nhập là nói sai về chỗ đang đứng.
   *
   * `replaceState` và truyền lại `window.history.state` — cùng lý do với `switchTab`.
   */
  useEffect(() => {
    if (!loaded) return;
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.has(IMPORT_PARAM)) return;
      url.searchParams.delete(IMPORT_PARAM);
      window.history.replaceState(window.history.state, '', url);
    } catch {
      // Trình duyệt chặn History API — mã vẫn đã vào bảng, chỉ là URL còn tham số.
    }
  }, [loaded]);

  /*
   * Tab khác ghi kho (sự kiện `storage` chỉ đến các tab KHÁC tab ghi), hay người dùng quay lại tab này
   * (`visibilitychange`; `pageshow` cho trang trả về từ bộ nhớ đệm lùi/tiến, nơi sự kiện `storage` lỡ
   * mất) — đọc lại kho để bảng hiện đúng thứ đang nằm trên đĩa. `key === null` là `localStorage.clear()`.
   *
   * Không vòng lặp: tab kia nhận chuỗi mới, `khoDaThay` ghi nhận đúng chuỗi ấy, effect ghi thấy bằng
   * nhau nên không ghi; và `setItem` cùng một giá trị thì trình duyệt không phát sự kiện nào.
   *
   * Khai SAU effect gỡ `?nhap=`: effect ấy phải đứng ngay dưới effect ghi kho mã chờ (xem chú thích của nó).
   */
  useEffect(() => {
    if (!loaded) return undefined;
    const khoTheoDoi = new Set([PORTFOLIO_KEY, PENDING_KEY, SAVED_CALCS_KEY, PRICE_SERIES_KEY]);
    const onStorage = (event: StorageEvent): void => {
      if (event.key === null || khoTheoDoi.has(event.key)) docLaiKho();
    };
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') docLaiKho();
    };
    const onPageShow = (): void => {
      docLaiKho();
    };
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [loaded, docLaiKho]);

  /*
   * Mở trang công thức sau khi lưu — effect này PHẢI khai SAU hai effect ghi ở trên (danh mục, rồi
   * kho mã chờ).
   *
   * React chạy các effect của cùng một lượt commit theo đúng thứ tự khai báo, nên đặt ở đây là
   * bảo đảm mã vừa thêm đã nằm trên đĩa trước khi `router.push()` kéo màn này ra khỏi cây. Gọi
   * thẳng `push()` trong `submit()` thì hai việc ấy đua nhau, và thứ thua là dữ liệu người dùng.
   * Kho mã chờ cũng phải ghi trước: nhập số cho một mã chờ rồi mở công thức là gỡ mã ấy khỏi kho
   * chờ, và nếu lượt gỡ không kịp xuống đĩa thì lần mở sau dựa vào `reconcilePending()` để dọn.
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
  /*
   * Gồm cả MÃ CHỜ SỐ LIỆU: dòng chờ chưa có số lượng nhưng thị giá của nó là số thật, và là thứ duy
   * nhất dòng ấy có để bày. Vẫn chỉ MÃ rời máy — đúng thứ lời gọi này vẫn gửi từ trước.
   */
  const codesKey = useMemo(
    () =>
      [...new Set([...holdings.map((holding) => holding.code), ...pending])]
        .sort((a, b) => a.localeCompare(b))
        .join(','),
    [holdings, pending],
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
    const batDau = Date.now();
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
      }

      // Lượt người dùng bấm Làm mới / Thử lại: vệt chờ đứng đủ `MIN_REFRESH_MS` — xem hằng số ấy.
      const conLai = priceAttempt > 0 ? MIN_REFRESH_MS - (Date.now() - batDau) : 0;
      if (conLai > 0) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, conLai);
        });
      }
      if (!controller.signal.aborted) setPriceLoading(false);
    })();

    return () => {
      controller.abort();
    };
  }, [codesKey, loaded, priceAttempt]);

  /**
   * Tab Công thức đang tải lại — vệt chờ trên cột Kết quả và số đếm của thẻ tóm tắt, đứng `MIN_REFRESH_MS`.
   *
   * Không có lời gọi mạng nào để chờ: tải lại tab này là ĐỌC LẠI hai kho trên máy (phép tính đã lưu, chuỗi
   * giá đang có), thứ xong trong một khung hình. Nhưng kho ấy đổi được từ chỗ khác (lưu một phép tính ở
   * tab trình duyệt khác, nạp chuỗi mới ở `/du-lieu/`), và cờ "Cần nạp lại chuỗi giá" của từng dòng đổi
   * theo — nên đây là tải lại thật, chỉ là nhanh. Chủ dự án muốn cú bấm ấy trông như ở tab Mã (14/10/2026):
   * _"khi bấm vào tải lại thì cả ở màn Mã và công thức đều có hiệu ứng tải lại như của màn Mã"_.
   */
  const [savedLoading, setSavedLoading] = useState(false);
  const savedTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (savedTimer.current !== null) window.clearTimeout(savedTimer.current);
    },
    [],
  );

  /**
   * Làm mới — MỘT việc cho mọi nút làm mới của màn (icon trên thanh trên ở khổ điện thoại, nút ở chân thẻ
   * tóm tắt ở PC): tra lại thị giá cho tab Mã, và đọc lại kho phép tính đã lưu cho tab Công thức. Bấm ở
   * tab nào cũng làm cả hai, để đổi tab ngay sau đó không gặp một bảng chưa được làm mới.
   */
  const lamMoi = useCallback((): void => {
    setPriceAttempt((n) => n + 1);
    // Đọc lại kho bằng đúng lối của thao tác sửa và của tab khác — đọc hỏng thì giữ bảng đang hiện.
    docLaiKho();

    setSavedLoading(true);
    if (savedTimer.current !== null) window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => {
      savedTimer.current = null;
      setSavedLoading(false);
    }, MIN_REFRESH_MS);
  }, [docLaiKho]);

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
   * Ngày phiên đem ra khoe với người dùng — lấy phiên CŨ NHẤT trong các mã đang ở trong bảng.
   *
   * Cũ nhất chứ không mới nhất: câu "Giá phiên 21/08" phải đúng với mọi con số đang hiện, nếu
   * không thì một mã lỡ nhịp sẽ nấp sau ngày đẹp của mã khác. Mã chờ số liệu cũng in thị giá, nên
   * phiên của chúng cũng phải nằm trong phép chọn này.
   */
  const priceAsOf = useMemo(
    () =>
      oldestAsOf(
        [...holdings.map((holding) => holding.code), ...pending]
          .map((code) => quotes.get(code))
          .filter((snapshot): snapshot is TickerSnapshot => snapshot !== undefined),
      ),
    [holdings, pending, quotes],
  );

  /*
   * `holdings` vào phép tính, `pending` thì KHÔNG: chỉ số đếm của nó đi theo, để câu lý do của một
   * danh mục chưa có mã nào đủ số nói đúng điều bảng đang bày (xem `summarisePortfolio`).
   */
  const summary = useMemo(
    () => summarisePortfolio(holdings, prices, asOf, priceState, pending.length),
    [holdings, prices, asOf, priceState, pending.length],
  );

  const closeForm = useCallback((): void => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditing(null);
    setCompleting(null);
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
      // Đọc lại kho trước: mã tab khác vừa thêm phải còn sau cú xoá này — xem `khoDaThay`.
      docLaiKho();
      setHoldings((current) => removeHolding(current, code));
      if (editing === code) closeForm();
      // Dòng chi tiết của một mã vừa mất không còn gì để mở; không về `null` thì thêm lại đúng mã ấy là
      // nó tự mở ra.
      setOpenRow((now) => (now === code ? null : now));
    },
    [editing, closeForm, docLaiKho],
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
    setCompleting(null);
    setFormOpen(true);
  }, []);

  /**
   * Mở hộp thoại ở chế độ NHẬP SỐ cho một mã chờ: mã điền sẵn, các ô số để trống.
   *
   * Tên doanh nghiệp lấy từ `quotes` — cùng gói đã tải để tra thị giá của dòng ấy. Chưa về thì để
   * trống: ô mã vẫn in mã, và `submit()` bỏ hẳn trường tên rỗng thay vì ghi một chuỗi rỗng.
   */
  const startComplete = useCallback(
    (code: string): void => {
      setForm({ ...EMPTY_FORM, code, name: quotes.get(code)?.name ?? '' });
      setErrors({});
      setEditing(null);
      setCompleting(code);
      setFormOpen(true);
    },
    [quotes],
  );

  /** Xoá một dòng chờ — nút thùng rác của nó. Một lần bấm, không hỏi lại, như dòng nắm giữ. */
  const removePendingRow = useCallback(
    (code: string): void => {
      docLaiKho();
      setPending((current) => removePendingCode(current, code));
      if (completing === code) closeForm();
      setOpenRow((now) => (now === code ? null : now));
    },
    [completing, closeForm, docLaiKho],
  );

  /** Mở/đóng dòng chi tiết ở khổ điện thoại. Mở dòng này là đóng dòng đang mở — một dòng một lúc. */
  const toggleRow = useCallback((key: string): void => {
    setOpenRow((now) => (now === key ? null : key));
  }, []);

  /*
   * Tìm ô trống ở thanh trên SAU khi gắn vào trang: cổng (`createPortal`) cần một nút DOM có thật, và
   * lượt dựng đầu phải khớp HTML tĩnh — nên hai icon vào sau hydrate, không vào HTML tĩnh.
   */
  useEffect(() => {
    setActionsSlot(document.getElementById(HEADER_ACTIONS_ID));
  }, []);

  /** Icon Tìm kiếm: mở thì đưa tiêu điểm vào ô; ĐÓNG thì xoá chữ — xem `toggleSearch`. */
  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  /*
   * Ô tìm trên thanh trên đang mở mà CÒN TRỐNG: chạm bất cứ đâu ngoài khung là đóng, như mọi ô bật lên —
   * chủ dự án gọi nó là "popup search", và mở ra rồi không đóng được là lỗi họ báo (14/10/2026).
   *
   * Chỉ khi ô trống. Ô đã có chữ thì bảng bên dưới đang là kết quả tìm, và chạm vào một dòng kết quả là
   * việc người tìm định làm tiếp; đóng ô ở cú chạm ấy là xoá chữ (`toggleSearch`), tức bảng đầy lại và dòng
   * vừa tìm thấy chạy mất. Lúc ấy dấu X cuối khung là đường đóng.
   */
  useEffect(() => {
    if (khoPC || actionsSlot === null || !searchOpen || query !== '') return undefined;
    const onPointerDown = (event: PointerEvent): void => {
      const frame = searchFrame.current;
      if (frame !== null && event.target instanceof Node && frame.contains(event.target)) return;
      setSearchOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [khoPC, actionsSlot, searchOpen, query]);

  /**
   * Bật/tắt ô tìm ở khổ điện thoại. Đóng là XOÁ chữ đang gõ: ô tìm khuất mà bộ lọc vẫn chạy thì bảng
   * thiếu dòng mà trên màn không còn gì nói vì sao.
   */
  const toggleSearch = useCallback((): void => {
    if (searchOpen || query !== '') {
      setSearchOpen(false);
      setQuery('');
    } else {
      setSearchOpen(true);
    }
  }, [searchOpen, query]);

  const submit = useCallback(() => {
    const code = form.code.trim().toUpperCase();
    const quantity = parseViNumber(form.quantity);
    const costPrice = parseViNumber(form.costPrice);
    const betaTyped = form.beta.trim();
    const typedBeta = betaTyped === '' ? null : parseViNumber(betaTyped);
    /*
     * Ngày mua: rỗng là "không nhập" (hợp lệ), `null` là "có gõ nhưng chưa ra một ngày có thật".
     *
     * Đọc lại bằng `parseDateText()` ngay tại đây chứ không tin `form.buyDate` đã là ISO: `DateField`
     * chỉ chuẩn hoá lúc RỜI Ô, mà bấm Enter thì form chốt khi tiêu điểm còn trong ô. Và hai nhánh
     * phải tách: coi một chuỗi không đọc được là ô trống thì form lưu "không có ngày mua" trong khi
     * ô đang in '32/13/2026' (FR-06 áp cho dữ liệu vào).
     */
    const buyDateTyped = form.buyDate.trim();
    const buyDate = buyDateTyped === '' ? '' : parseDateText(buyDateTyped);

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
    if (buyDate === null) next.buyDate = t('portfolio.errBuyDateFormat');
    else if (buyDate !== '' && buyDate > todayIso()) next.buyDate = t('portfolio.errBuyDate');
    /*
     * Chỉ bắt lỗi beta khi ô beta ĐANG HIỆN — câu lỗi trên một ô vô hình là form từ chối lưu mà
     * không nói được vì sao.
     */
    if (advanced && betaTyped !== '' && typedBeta === null) next.beta = t('portfolio.errBeta');

    /*
     * Trần số mã: `addHolding()` từ chối trong im lặng khi danh mục đã đầy, nên phải chặn ở đây
     * mới nói được lý do. Chỉ tính là "thêm mới" khi mã chưa có — một mã ĐANG giữ thì `addHolding()`
     * cộng dồn vào dòng cũ nên không chạm trần.
     *
     * Vế `!holdings.some(...)` nay là lớp chắn thứ hai: sheet chọn mã đã khoá nút của mã đang giữ
     * (xem bia mộ `mergingInto`), nên `code` tới được đây thì chắc chắn là mã mới. Giữ lại vì nó
     * bảo vệ đúng thứ `addHolding()` vẫn làm, chứ không phải thứ màn hình đang cho phép.
     *
     * Trần là trần của BẢNG, nên mã chờ số liệu cũng chiếm chỗ. Riêng mã chờ đang được nhập số thì
     * không tính: nó đã có dòng sẵn, lưu xong chỉ là đổi dòng ấy từ chờ sang nắm giữ.
     */
    const isNewCode = editing === null && !holdings.some((holding) => holding.code === code);
    const otherRows = holdings.length + pending.filter((item) => item !== code).length;
    if (isNewCode && otherRows >= MAX_HOLDINGS) next.form = t('portfolio.errFull');

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    // Đã qua mọi cửa ở trên nên hai giá trị này chắc chắn là số dương; ép kiểu cho TypeScript.
    const safeQuantity = quantity as number;
    const safeCostPrice = costPrice as number;
    // Cùng lý do: `null` đã bị cửa ngày mua chặn. Ghi dạng ISO đã đọc, không ghi chữ trong ô.
    const safeBuyDate = buyDate ?? '';
    const name = form.name.trim();

    // Áp lên bản MỚI NHẤT của kho, không lên state có thể đã cũ — xem `khoDaThay`.
    docLaiKho();
    setHoldings((current) =>
      editing === null
        ? addHolding(current, {
            code,
            ...(name === '' ? {} : { name }),
            quantity: safeQuantity,
            costPrice: safeCostPrice,
            buyDate: safeBuyDate,
            beta,
          })
        : updateHolding(current, editing, {
            ...(name === '' ? {} : { name }),
            quantity: safeQuantity,
            costPrice: safeCostPrice,
            buyDate: safeBuyDate,
            beta,
          }),
    );

    /*
     * Mã vừa có đủ số thì thôi chờ. Gỡ theo MÃ chứ không theo `completing`: mọi đường biến một mã
     * chờ thành nắm giữ đều phải dọn kho chờ, nếu không bảng in hai dòng cho cùng một mã.
     */
    if (editing === null) {
      setPending((current) =>
        current.includes(code) ? removePendingCode(current, code) : current,
      );
    }

    /*
     * Chọn công thức thì lưu xong đi thẳng tới nó. Xếp lịch chứ không điều hướng ngay — lý do ở
     * effect `pendingOpen`, ngay dưới effect ghi danh mục.
     *
     * Đặt TRƯỚC `closeForm()` vì hàm ấy xoá `plannedFormula`; đọc sau là đọc `null`.
     */
    if (plannedFormula !== null) setPendingOpen({ id: plannedFormula, code });

    // Người dùng vừa giao cho máy một thứ đáng giữ — đúng lúc xin trình duyệt đừng dọn kho.
    requestPersistentStorage();
    closeForm();
  }, [form, editing, holdings, pending, advanced, plannedFormula, t, closeForm, docLaiKho]);

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

  /**
   * Mã đã có một dòng trong bảng — sheet chọn mã dán nhãn "đã có" và khoá nút của chúng.
   *
   * Gồm cả mã chờ số liệu: chúng đã đứng trong bảng, và luật 10/10/2026 là "mã nào đã thêm rồi thì
   * không cho thêm nữa". Đường đi của một mã chờ là bấm vào dòng của nó để nhập số, không phải thêm
   * lại từ sheet.
   */
  const heldCodes = useMemo(
    () => new Set([...holdings.map((holding) => holding.code), ...pending]),
    [holdings, pending],
  );

  /** Mã đang nhập ở form, đã chuẩn hoá. `null` khi chưa chọn mã nào. */
  const formCode = form.code.trim() === '' ? null : form.code.trim().toUpperCase();

  /**
   * Chưa chọn được công thức vì chưa có mã.
   *
   * Không phải chuyện thứ tự cho gọn: số ô điền được của mỗi dòng trong sheet PHỤ THUỘC mã có tra
   * được thị giá hay không (xem `hasPrice` ở `FormulaForTickerSheet`), và số ấy quyết định dòng
   * nào có mặt, xếp thứ mấy. Mở sheet khi chưa biết mã là đưa ra một danh sách chưa chắc đúng.
   */
  const formulaLocked = formCode === null;

  /**
   * Nhãn nút lưu — SÁU tổ hợp của hai câu hỏi độc lập.
   *
   * Câu một: nút sắp làm gì với danh mục (thêm dòng mới · lưu bản sửa · lưu số cho một mã chờ). Câu
   * hai: xong rồi có mở công thức không. Mã chờ có hàng riêng vì "Thêm vào danh mục" sai với nó —
   * mã đã nằm trong bảng — còn "Lưu thay đổi" cũng sai, vì chưa có số nào để mà đổi.
   *
   * Giữ dạng bảng tra chứ không gộp lại thành toán tử ba ngôi lồng nhau, dù chỉ có ba nhánh:
   * bản lồng nhau đã từng ĐỂ LỌT một tổ hợp — chọn một mã đang giữ RỒI chọn công thức thì nhãn ra
   * "Thêm và mở công thức" trong khi việc sắp xảy ra là cộng dồn. Tổ hợp ấy nay không còn tồn tại
   * (xem bia mộ `mergingInto` ở trên), nhưng dạng bảng là thứ làm một chỗ hổng lộ ra bằng mắt, và
   * câu hỏi "nút này hứa đúng việc nó làm chưa" thì không hết.
   */
  const submitLabel = useMemo(() => {
    const open = plannedFormula !== null;
    if (editing !== null) return t(open ? 'portfolio.formSaveOpen' : 'portfolio.formSave');
    if (completing !== null) return t(open ? 'portfolio.formSaveOpen' : 'portfolio.formComplete');
    return t(open ? 'portfolio.formSubmitOpen' : 'portfolio.formSubmit');
  }, [plannedFormula, editing, completing, t]);

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

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia('(min-width: 1024px)');
    const dongBo = (): void => setKhoPC(media.matches);
    dongBo();
    media.addEventListener('change', dongBo);
    return () => media.removeEventListener('change', dongBo);
  }, []);

  /**
   * Bấm tiêu đề cột `key`: tính cách sắp kế tiếp rồi ghi xuống kho NGAY TRONG cú bấm — không qua một
   * effect ăn theo `sort`, vì effect ấy cũng chạy ở lượt nạp và sẽ ghi lại thứ vừa đọc. Về thứ tự đã
   * thêm vào thì GỠ khoá, cùng lẽ với kho mã chờ: một khoá chỉ để nói "không sắp gì" là kho không có
   * gì để xoá.
   */
  const sortBy = useCallback(
    (key: HoldingSortKey): void => {
      const next = nextHoldingSort(sort, key);
      setSort(next);
      try {
        if (next === null) window.localStorage.removeItem(PORTFOLIO_SORT_KEY);
        else window.localStorage.setItem(PORTFOLIO_SORT_KEY, serializeHoldingSort(next));
      } catch {
        // Hết dung lượng hoặc bị chặn — bảng vẫn sắp, chỉ là lần sau mở lại không nhớ.
      }
    },
    [sort],
  );
  const shownSort = effectiveHoldingSort(sort, khoPC);

  /**
   * Bấm tiêu đề cột của bảng Công thức — cùng nếp `sortBy`: ghi kho ngay trong cú bấm, về mặc định
   * (Ngày lưu, mới trước) thì gỡ khoá.
   */
  const sortSavedBy = useCallback(
    (key: SavedSortKey): void => {
      const next = nextSavedSort(savedSort, key);
      setSavedSort(next);
      try {
        if (isDefaultSavedSort(next)) window.localStorage.removeItem(SAVED_SORT_KEY);
        else window.localStorage.setItem(SAVED_SORT_KEY, serializeSavedSort(next));
      } catch {
        // Hết dung lượng hoặc bị chặn — bảng vẫn sắp, chỉ là lần sau mở lại không nhớ.
      }
    },
    [savedSort],
  );

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
    const rows =
      needle === ''
        ? summary.rows
        : summary.rows.filter((row) => {
            const name = row.holding.name ?? quotes.get(row.holding.code)?.name ?? '';
            return (
              normalizeVi(row.holding.code).includes(needle) || normalizeVi(name).includes(needle)
            );
          });
    return sortHoldingRows(rows, shownSort);
  }, [summary.rows, needle, quotes, shownSort]);

  /** Dòng chờ số liệu sau khi lọc — cùng ô tìm, cùng luật so khớp (mã, hoặc tên lấy từ `quotes`). */
  const visiblePending = useMemo(() => {
    const codes =
      needle === ''
        ? pending
        : pending.filter((code) => {
            const name = quotes.get(code)?.name ?? '';
            return normalizeVi(code).includes(needle) || normalizeVi(name).includes(needle);
          });
    // Dòng chờ vẫn đứng SAU dòng nắm giữ; trong khối của chúng thì sắp theo Mã hoặc Thị giá.
    return sortPendingCodes(codes, shownSort, (code) => quotes.get(code)?.priceVnd ?? null);
  }, [pending, needle, quotes, shownSort]);

  /*
   * Mọi dòng của bảng Phép tính đã lưu, dựng MỘT lượt — xem `SavedRowView`.
   *
   * Bọc `useMemo` từ 28/10/2026. Trước đó không bọc vì `valueText` trả hàm mới mỗi lượt (nay
   * `useValueText` dùng `useCallback`, `pick` vốn đã ổn định), và đo trên bản build: mỗi phím gõ trong
   * hộp Thêm mã dựng lại 30 dòng — `displayCalcName`, `suggestCalcNames`, `formatNumber`,
   * `normalizeVi` — khoảng 30% script của phím ấy ở CPU 4×, kể cả khi đang mở tab Mã.
   */
  const savedRows = useMemo<SavedRowView[]>(
    () =>
      savedCalcs.map((saved) => {
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
            saved.code === undefined || title.includes(saved.code)
              ? title
              : `${saved.code} · ${title}`,
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
      }),
    [savedCalcs, pick, valueText, seriesRows],
  );

  /*
   * Mặc định mới nhất trước; bấm tiêu đề cột để sắp khác (14/10/2026). Chip lọc theo mã và ô CHỌN chiều
   * sắp xếp từng nằm trên bảng (bản thiết kế 12/10/2026) và đã bị chủ dự án bảo bỏ ngay sau đó; khi chủ
   * dự án xin lại việc sắp, nó về theo đúng cách bảng Mã làm — bấm tiêu đề — chứ không dựng lại ô chọn.
   * Sắp theo TÊN ĐANG IN (`title`), không theo tên đã cất: người dùng thấy gì thì xếp theo cái ấy.
   */
  const shownSaved = sortSavedRows(
    savedRows.filter((row) => needle === '' || row.haystack.includes(needle)),
    savedSort,
    (row) => ({ title: row.title, code: row.saved.code, savedAt: row.saved.savedAt }),
  );

  // Số đếm của thẻ tóm tắt tính trên CẢ kho, không theo ô tìm đang gõ.
  const savedTickers = new Set(
    savedCalcs.flatMap((saved) => (saved.code === undefined ? [] : [saved.code])),
  ).size;
  const savedFormulas = new Set(savedCalcs.map((saved) => saved.formulaId)).size;
  const savedReload = savedRows.filter((row) => row.needsReload).length;
  const lastSavedAt = savedCalcs.reduce((latest, saved) => Math.max(latest, saved.savedAt), 0);
  const lastSaved = lastSavedAt > 0 ? formatIsoDate(isoDayOf(lastSavedAt)) : null;

  /**
   * Ô tìm đang đứng trên THANH TRÊN chứ không ở dòng tiêu đề — khổ điện thoại, ô đang mở (hoặc còn chữ),
   * và thanh trên có ô trống cho màn (xem `headerActions`).
   *
   * MỘT ô, dựng ở MỘT trong hai chỗ, không dựng hai bản rồi CSS ẩn một: hai `searchbox` cùng tên là hai
   * đích cho trình đọc màn hình và cho mọi `getByRole('searchbox')`. Theo `khoPC` (nghe đổi khổ) chứ
   * không theo `laKhoPC()`: xoay máy sang khổ PC thì ô về lại dòng tiêu đề, chữ đang gõ còn nguyên.
   */
  const searchInHeader = !khoPC && actionsSlot !== null && (searchOpen || query !== '');

  const searchBox = (
    <SearchBox
      value={query}
      onChange={setQuery}
      /*
       * Esc đóng ô trên thanh trên như bấm lại icon (đóng là xoá chữ, xem `toggleSearch`), rồi trả
       * tiêu điểm về icon — ô vừa tháo khỏi DOM, để tiêu điểm rơi về <body> là bắt Tab lại từ đầu.
       */
      onCancel={
        searchInHeader
          ? () => {
              setSearchOpen(false);
              setQuery('');
              searchToggle.current?.focus();
            }
          : undefined
      }
      label={t('portfolio.search')}
      placeholder={t('portfolio.search')}
      inputRef={searchInput}
      compact
      bare={searchInHeader}
    />
  );

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
   *
   * Dưới 1024px (bản vẽ 14/10/2026) "Thêm mới" ghim ở đáy màn bằng CSS, không dựng bản thứ hai: hai nút
   * "Thêm mới" trong DOM là mọi `getByRole('button', { name: 'Thêm mới' })` hỏng, và hai đích làm cùng
   * một việc thì trình đọc màn hình đọc hai lần. Ô tìm thì ẩn, và khi mở nó RỜI khỏi đây lên thanh trên
   * — xem `searchInHeader`; cũng là cùng MỘT ô, chỉ đổi chỗ dựng.
   */
  const headTools = (
    <div className={styles.headTools}>
      {!searchInHeader && (
        <div className={styles.search} id={SEARCH_ID}>
          {searchBox}
        </div>
      )}

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
   * Hai icon của thanh trên ở khổ điện thoại — Tìm kiếm, rồi Làm mới giá bên phải nó — đặt vào ô trống
   * `HEADER_ACTIONS_ID` qua cổng. Từ 1024px cả hai `display: none`: ở PC ô tìm đứng sẵn trên bảng và
   * nút "Làm mới" nằm ở chân thẻ tóm tắt.
   *
   * Mở ra thì Ô TÌM hiện NGAY TRÊN THANH, giữa tên màn và mép phải, icon đứng ở cuối ô (chủ dự án khoanh
   * chỗ ấy trên ảnh, 14/10/2026: _"khi bấm vào icon search thì có thêm một popup search ở chỗ rôi khoanh
   * đỏ"_). Trước đó ô mở ra ở đầu bảng, cách icon cả dải tab và thẻ tóm tắt. Khung `.headerSearch` bọc cả
   * ô lẫn icon, nên icon là cùng một nút ở hai trạng thái: tiêu điểm không rơi khi bấm đóng.
   *
   * Ô đang mở thì icon là dấu X, không phải kính lúp. Bản đầu để kính lúp ở cả hai trạng thái, và chủ dự
   * án mở ô ra rồi không đóng được: _"bật ô search lên được rồi nhưng không có cách nào tắt đi được ? lỗi
   * nghiêm trọng"_. Kính lúp vẫn đóng được ô, nhưng ở cuối một ô tìm nó đọc là "tìm", không ai bấm nó để
   * đóng. Tên nút giữ "Tìm kiếm" và trạng thái nằm ở `aria-expanded`, như mọi nút mở/đóng khác của màn.
   * Ô còn trống thì chạm ra ngoài cũng đóng — xem effect `searchFrame`.
   *
   * Icon Làm mới giá đứng BÊN PHẢI icon này. Bản vẽ đầu có nó, chủ dự án gạch nó (_"bỏ icon refect ở đầu
   * đi chỉ để lại icon search"_), rồi cùng ngày cho về: _"thêm lại icon refresh lên để ở bên phải của icon
   * search đồng thời xóa ngày và tên button tải lại ở tab mã đi"_ — nên ở khổ này nó là đường làm mới duy
   * nhất (nút ở chân thẻ ẩn, `.priceButton`). Bấm là `lamMoi`, ở cả hai tab. Đang tải thì icon xoay và khoá
   * lại; `aria-busy` nói điều ấy cho trình đọc màn hình.
   *
   * **Ô tìm đang mở (`searchInHeader`) thì icon Làm mới KHÔNG dựng**, tới khi ô đóng (chủ dự án, cùng ngày:
   * _"sau khi bật search lên thì phải ẩn icon refresh đi cho đến khi không sử dụng chức năng search"_). Ô
   * mở là cả lúc ô còn chữ, nên "không dùng tìm kiếm" chỉ đến khi đóng — mà đóng là xoá chữ. Khung ô tìm
   * nhận luôn chỗ của icon. Gỡ khỏi DOM chứ không ẩn bằng CSS: lúc ấy nó không bấm được, nên nó không
   * được còn là một nấc Tab hay một nút trình đọc màn hình đọc ra.
   */
  const dangLamMoi = priceLoading || savedLoading;
  const headerActions =
    actionsSlot === null
      ? null
      : createPortal(
          <>
            <div
              ref={searchFrame}
              className={styles.headerSearch}
              data-mo={searchInHeader ? '' : undefined}
            >
              {searchInHeader && (
                <div className={styles.headerSearchField} id={SEARCH_ID}>
                  {searchBox}
                </div>
              )}
              <button
                ref={searchToggle}
                type="button"
                className={styles.headerAction}
                aria-label={t('portfolio.search')}
                aria-expanded={searchOpen || query !== ''}
                aria-controls={SEARCH_ID}
                onClick={toggleSearch}
              >
                <StatIcon d={searchInHeader ? TILE_ICONS.close : TILE_ICONS.search} size={20} />
              </button>
            </div>
            {!searchInHeader && (
              <button
                type="button"
                className={`${styles.headerAction} ${styles.headerRefresh}`}
                aria-label={t('portfolio.refreshPrices')}
                aria-busy={dangLamMoi}
                disabled={dangLamMoi}
                onClick={lamMoi}
              >
                <StatIcon d={TILE_ICONS.refresh} size={20} />
              </button>
            )}
          </>,
          actionsSlot,
        );

  /**
   * Dải thị giá — chân thẻ tóm tắt.
   *
   * Từng là dải đứng riêng ngay dưới lưới sáu ô, rồi (22/09/2026) gộp vào dòng tiêu đề của khối Nắm
   * giữ; từ 12/10/2026 nó nằm ở chân thẻ tóm tắt, đúng chỗ bản thiết kế vẽ "Giá phiên 10/10/2026".
   * GỘP chứ không nhân đôi: ngày phiên là lời hứa "số này thuộc phiên nào", nói hai lần là dựng hai
   * nguồn sự thật cho cùng một điều.
   *
   * Từ 1024px luôn hiện khi danh mục có mã, kể cả lúc mọi thứ bình thường: "giá của phiên nào" là thông
   * tin cần thường trực chứ không phải chỉ lúc hỏng — mở app chiều thứ Bảy thì con số đang nhìn là giá
   * thứ Sáu. Nút làm mới cũng vì thế mà luôn có mặt.
   *
   * Dưới 1024px thì KHÔNG, theo lời chủ dự án (14/10/2026): _"xóa ngày và tên button tải lại ở tab mã
   * đi"_, khi icon Làm mới về lại thanh trên. Lúc giá bình thường cả dải ẩn (`.footPrice` ở
   * `PortfolioSummary.module.css`). Ngoại lệ GIỮ LẠI, và nó là FR-06: giá CŨ hoặc tra hỏng thì dải vẫn
   * hiện (`footerUrgent`) — giá cũ chỉ được đứng trên màn cạnh tên phiên của nó (`price-cache-store.ts`);
   * chỉ nút trong dải là ẩn, vì icon trên thanh làm đúng việc ấy.
   *
   * Vẫn MỘT phần tử duy nhất mang `role="status"`/`"alert"`, và ngày phiên in đúng MỘT lần trên cả
   * màn: giá cũ (`'stale'`) chỉ được phép hiện khi màn nói ra nó là giá của phiên nào
   * (`price-cache-store.ts`), và ca kiểm tìm ngày ấy bằng `getByText` đơn.
   *
   * Có mặt cả khi bảng CHỈ có mã chờ số liệu: dòng chờ cũng in thị giá, mà giá nào trên màn cũng phải
   * có ngày phiên đứng tên — nhất là lúc mất mạng, khi con số ấy là giá cũ.
   */
  const priceStrip =
    holdings.length + pending.length === 0 ? null : (
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

        {/*
          Vòng xoay TRONG nút lúc đang tra: cú bấm phải có hồi đáp ngay ở chỗ ngón tay vừa chạm, không chỉ
          ở dòng chữ bên cạnh (14/10/2026, xem `MIN_REFRESH_MS`). Nhãn giữ nguyên, để tên nút không đổi
          giữa chừng dưới tay người dùng bàn phím.

          Dưới 1024px nút này ẨN (`.priceButton`): icon Làm mới trên thanh trên làm đúng việc ấy, và chủ
          dự án bỏ nút cùng ngày phiên khỏi chân thẻ ở khổ ấy (14/10/2026). Ẩn bằng CSS chứ không gỡ: từ
          1024px không có icon trên thanh, nút này là đường làm mới duy nhất.
        */}
        <Button
          variant="secondary"
          size="sm"
          className={styles.priceButton}
          disabled={priceLoading}
          onClick={lamMoi}
        >
          {priceLoading && <span className={styles.nutXoay} aria-hidden="true" />}
          {priceState === 'ready' ? t('portfolio.priceRefresh') : t('portfolio.priceRetry')}
        </Button>
      </p>
    );

  return (
    <div className={styles.screen}>
      {/* Icon Tìm kiếm (và ô tìm khi mở) — vào thanh trên qua cổng, chỉ hiện dưới 1024px. */}
      {headerActions}

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
          {/*
            Dải nền của cụm tab — chỉ khổ dưới 1024px (bản vẽ 14/10/2026): nền như thanh trên, sát dưới
            thanh trên, chạy hết bề ngang, kẻ dưới. Từ 1024px nó không là hộp nào (`display: contents`).
          */}
          <div className={styles.tabBand}>
            <TabBar
              label={t('portfolio.title')}
              idBase={PORTFOLIO_TABS_ID}
              panelId={PORTFOLIO_PANEL_ID}
              orientation="responsive"
              value={tab}
              onChange={switchTab}
              items={[
                {
                  value: 'holdings',
                  label: t('portfolio.holdings'),
                  // Số DÒNG của bảng: mã chờ số liệu cũng là một dòng người dùng thấy và phải xử lý.
                  count: holdings.length + pending.length,
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
          </div>

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
              footerUrgent={priceState !== 'ready'}
              loading={priceLoading}
            />
          ) : (
            <SavedSummary
              count={savedCalcs.length}
              tickers={savedTickers}
              formulas={savedFormulas}
              reload={savedReload}
              lastSaved={lastSaved}
              loading={savedLoading}
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

                {holdings.length + pending.length === 0 ? (
                  <div className={styles.empty}>
                    <span className={styles.emptyIcon} aria-hidden="true">
                      <StatIcon d={TILE_ICONS.count} />
                    </span>
                    <p className={styles.emptyText}>{t('portfolio.empty')}</p>
                  </div>
                ) : visibleRows.length + visiblePending.length === 0 ? (
                  <p className={styles.noMatch}>{t('portfolio.noMatch')}</p>
                ) : (
                  <div className={styles.tableWrap}>
                    {/*
                      `aria-busy` trong lúc tra thị giá: các ô sống theo giá đang là vệt chờ (`KhungCho`),
                      trình đọc màn hình đợi bảng xong mới đọc lại thay vì đọc số cũ dưới vệt.
                    */}
                    <table className={styles.holdList} aria-busy={priceLoading}>
                      {/*
                        Chú thích bảng, ẩn khỏi mắt: `<h2>` ngay trên đã nói đúng điều này cho người
                        nhìn thấy. Trình đọc màn hình thì cần nó — nó là câu đọc trước khi bước vào
                        bảng, và không có nó thì bảng chỉ được xướng tên là "bảng".
                      */}
                      <caption className="visually-hidden">{t('portfolio.tableCaption')}</caption>

                      <thead className={styles.holdHead}>
                        <tr>
                          {HOLDING_COLUMNS.map(({ key, label }) => {
                            const dir = shownSort?.key === key ? shownSort.dir : null;
                            return (
                              <th key={key} scope="col" aria-sort={ariaSort(dir)}>
                                <SortHeader label={t(label)} dir={dir} onSort={() => sortBy(key)} />
                              </th>
                            );
                          })}
                        </tr>
                      </thead>

                      <tbody>
                        {visibleRows.map((row) => {
                          const { holding } = row;
                          const mo = openRow === holding.code;

                          return (
                            <Fragment key={holding.code}>
                              {/*
                                Bấm dòng: ở PC mở form Sửa, dưới 1024px mở/đóng dòng chi tiết ngay dưới
                                (bản vẽ khổ điện thoại 14/10/2026) — xem `laKhoPC()`.
                              */}
                              <tr
                                className={[
                                  styles.holdRow,
                                  styles.holdRowOpen,
                                  mo ? styles.rowExpanded : undefined,
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                onClick={() => {
                                  if (laKhoPC()) startEdit(holding);
                                  else toggleRow(holding.code);
                                }}
                              >
                                {/*
                                  ── Ô Mã: chữ trơn + dấu X hiện khi rê chuột (13/10/2026) ──────────────
                                  Chủ dự án vẽ lại dòng này trên ảnh chụp: *"bỏ bo viền ngoài xanh xanh
                                  của tên ticker … chỉ để hiển thị tên ticker thôi. bỏ 2 icon edit và xóa
                                  đi. thay vào đó … khi hover chuột vào một mã bất kỳ thì icon xóa sẽ
                                  hiển thị chỗ đó … nếu người dùng muốn sửa hoặc xem mã đó thì bấm luôn
                                  vào mã"*. Nên: mã hết là chip, cả dòng là đích bấm mở form Sửa, và nút
                                  xoá dời từ cuối dòng về ngay sau mã. Xem bản đầu xong, cùng ngày: *"hiển
                                  thị icon X chứ không phải là icon xóa … không cần border đỏ xung quanh
                                  icon X chỉ cần icon ĐỎ X thôi"* — thùng rác thành dấu X đỏ, không nền.

                                  Mã là một `<button>` chứ không phải chữ trơn, và đó là phần không được
                                  bỏ: `<tr>` không lấy được tiêu điểm, nên người dùng bàn phím và trình đọc
                                  màn hình cần một nút thật để mở form — cùng việc với cú bấm cả dòng, có
                                  tên ("Sửa FPT", chứa đúng chữ đang hiện). Cùng cách dòng chờ số liệu ngay
                                  dưới vẫn làm.

                                  Cả hai nút chặn sự kiện nổi lên: không chặn thì bấm dấu X vừa xoá
                                  mã vừa mở form Sửa cho chính mã vừa biến mất.

                                  Dấu X ẩn bằng `opacity`, KHÔNG bằng `display`: nó phải còn trong thứ
                                  tự Tab để bàn phím tới được, và hiện ra khi có tiêu điểm. Luật ẩn chỉ
                                  áp cho thiết bị CÓ con trỏ rê (`@media (hover: hover)`) — xem `.rowRemove`.

                                  Dưới 1024px (14/10/2026) dấu X `display: none` — Xoá nằm trong dòng chi
                                  tiết như bản vẽ — và nút mã nhường cú chạm cho cả dòng
                                  (`pointer-events: none`), để chạm vào mã cũng mở dòng như chạm chỗ khác.
                                  Nút mã vẫn ở đó cho bàn phím, đúng tên "Sửa FPT", đúng việc ấy.

                                  Nút Xoá vẫn KHÔNG hỏi lại và không hoàn tác, đúng bản thiết kế 12/10.
                                */}
                                <td className={styles.holdCode}>
                                  <span className={styles.codeCell}>
                                    <button
                                      type="button"
                                      className={styles.codeOpen}
                                      aria-label={`${t('portfolio.edit')} ${holding.code}`}
                                      title={t('portfolio.edit')}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        startEdit(holding);
                                      }}
                                    >
                                      {holding.code}
                                    </button>
                                    <button
                                      type="button"
                                      className={`${styles.rowAction} ${styles.rowRemove}`}
                                      aria-label={`${t('portfolio.remove')} ${holding.code}`}
                                      title={t('portfolio.remove')}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        removeRow(holding.code);
                                      }}
                                    >
                                      <StatIcon d={TILE_ICONS.close} />
                                    </button>
                                  </span>
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
                                  <KhungCho cho={priceLoading}>
                                    {row.marketPrice === null ? (
                                      <ChuaCo />
                                    ) : (
                                      (formatNumber(row.marketPrice) ?? '_ _')
                                    )}
                                  </KhungCho>
                                </td>

                                {/*
                                  Lãi/lỗ hai cột: số tiền, rồi mũi tên + phần trăm — xem `GainValue`.
                                  Ba cột này (cùng Tỷ trọng) ẩn dưới 1024px và xuống dòng chi tiết.
                                */}
                                <td className={styles.holdCell}>
                                  <KhungCho cho={priceLoading}>
                                    <GainValue row={row} />
                                  </KhungCho>
                                </td>

                                <td className={styles.holdCell}>
                                  <KhungCho cho={priceLoading}>
                                    <GainPercentValue row={row} />
                                  </KhungCho>
                                </td>

                                <td className={styles.holdCell}>
                                  <KhungCho cho={priceLoading}>
                                    <WeightValue row={row} bar />
                                  </KhungCho>
                                </td>

                                {/*
                                  Cột cuối: NGÀY MUA (13/10/2026). Chỗ này từng chở hai nút biểu tượng
                                  Sửa và Xoá (12/10/2026); chủ dự án bỏ cả hai — Sửa thành cú bấm cả
                                  dòng, Xoá dời về cạnh mã — và giao chỗ trống cho ngày: *"thay thế chỗ
                                  trước kia của 2 icon Sửa và Xóa thành hiển thị ngày vì đang chưa có
                                  ngày"*. Việc này đảo câu 12/10 "ngày mua chỉ thấy trong form Sửa".

                                  Mã không có ngày mua thì in `_ _`, cùng ký hiệu "chưa có số liệu" của
                                  bốn ô thị giá — không bỏ trống, vì một ô trống trong cột ngày đọc ra là
                                  bảng dựng thiếu. Beta vẫn chỉ thấy trong form Sửa.

                                  Mũi tên mở dòng chi tiết nằm TRONG ô này, không thành cột thứ chín: nó
                                  chỉ có ở khổ điện thoại, và một cột chỉ có ở một khổ là một tiêu đề cột
                                  trống ở khổ kia.
                                */}
                                <td className={`${styles.holdCell} ${styles.holdMuted}`}>
                                  <span className={styles.lastCell}>
                                    {ISO_DAY.test(holding.buyDate) ? (
                                      formatIsoDate(holding.buyDate)
                                    ) : (
                                      <ChuaCo />
                                    )}
                                    <ExpandToggle
                                      open={mo}
                                      {...(mo ? { controls: chiTietId('ma', holding.code) } : {})}
                                      label={`${t('portfolio.details')} ${holding.code}`}
                                      onToggle={() => {
                                        toggleRow(holding.code);
                                      }}
                                    />
                                  </span>
                                </td>
                              </tr>

                              {/*
                                ── Dòng chi tiết — chỉ khổ dưới 1024px (bản vẽ 14/10/2026) ───────────────
                                Ba số bảng gọn không chở (Lãi/lỗ, Lãi/lỗ %, Tỷ trọng), rồi hai nút Sửa ·
                                Xoá. Chủ dự án đổi nhãn nút đỏ của bản vẽ từ "Bỏ mã" thành "Xoá" — cùng
                                chữ với dấu X đỏ của khổ PC.

                                Chỉ dựng khi mở: dựng sẵn rồi ẩn thì mọi con số lãi/lỗ có hai bản trong
                                DOM. `colSpan` 5 vì dưới 1024px bảng đúng năm cột; từ 1024px dòng này
                                `display: none` (lỡ mở ở khổ hẹp rồi kéo rộng cửa sổ).
                              */}
                              {mo && (
                                <tr className={styles.detailRow} id={chiTietId('ma', holding.code)}>
                                  <td colSpan={5}>
                                    <div className={styles.detail}>
                                      <dl className={styles.detailStats}>
                                        <div>
                                          <dt>{t('portfolio.gain')}</dt>
                                          <dd>
                                            <KhungCho cho={priceLoading}>
                                              <GainValue row={row} />
                                            </KhungCho>
                                          </dd>
                                        </div>
                                        <div>
                                          <dt>{t('portfolio.colPercent')}</dt>
                                          <dd>
                                            <KhungCho cho={priceLoading}>
                                              <GainPercentValue row={row} />
                                            </KhungCho>
                                          </dd>
                                        </div>
                                        <div>
                                          <dt>{t('portfolio.colWeight')}</dt>
                                          <dd>
                                            <KhungCho cho={priceLoading}>
                                              <WeightValue row={row} />
                                            </KhungCho>
                                          </dd>
                                        </div>
                                      </dl>
                                      <div className={styles.detailActions}>
                                        <button
                                          type="button"
                                          className={styles.detailButton}
                                          onClick={() => {
                                            startEdit(holding);
                                          }}
                                        >
                                          {t('portfolio.edit')}
                                        </button>
                                        <button
                                          type="button"
                                          className={`${styles.detailButton} ${styles.detailDanger}`}
                                          onClick={() => {
                                            removeRow(holding.code);
                                          }}
                                        >
                                          {t('portfolio.remove')}
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}

                        {/*
                          ── Dòng CHỜ SỐ LIỆU (13/10/2026) ─────────────────────────────────────────
                          Mã lấy từ watchlist Finbox về: đã ở trong danh mục nhưng chưa có số lượng và
                          giá vốn. Chủ dự án: "sẽ có màu tượng trưng riêng để khi người dùng bấm vào
                          sẽ hiển thị bảng nhập thêm thông số đang thiếu".

                          Đứng SAU các dòng nắm giữ, theo thứ tự nhập. Thị giá là số THẬT (cùng lời gọi
                          tra giá của cả bảng); năm ô còn lại in `_ _` vì chưa có số lượng thì không có
                          gì để tính — không phải 0 CP, không phải lãi/lỗ 0 (FR-06). Dòng này KHÔNG nằm
                          trong `summary.rows`, nên nó không vào tổng, không vào mẫu số của tỷ trọng.

                          Bấm đâu trên dòng cũng mở hộp thoại nhập số (dưới 1024px: mở dòng chi tiết
                          có nút "Nhập số liệu" — cùng khuôn dòng nắm giữ). `<tr>` không lấy được tiêu
                          điểm, nên người dùng bàn phím và trình đọc màn hình đi qua chính MÃ ở ô đầu,
                          vốn là một nút — cùng việc, có tên ("Nhập số liệu FPT"). Từ 13/10/2026 dòng
                          nắm giữ cũng theo đúng khuôn này. Hai nút chặn sự kiện nổi lên: bấm Xoá mà
                          dòng còn mở hộp thoại cho một mã vừa biến mất là hai việc ngược nhau.
                        */}
                        {visiblePending.map((code) => {
                          const marketPrice = quotes.get(code)?.priceVnd ?? null;
                          const mo = openRow === code;

                          return (
                            <Fragment key={code}>
                              <tr
                                className={[
                                  styles.holdRow,
                                  styles.holdRowPending,
                                  mo ? styles.rowExpanded : undefined,
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                onClick={() => {
                                  if (laKhoPC()) startComplete(code);
                                  else toggleRow(code);
                                }}
                              >
                                {/* Cùng khuôn ô Mã của dòng nắm giữ — chỉ khác tên nút mở ("Nhập số liệu"). */}
                                <td className={styles.holdCode}>
                                  <span className={styles.codeCell}>
                                    <button
                                      type="button"
                                      className={styles.codeOpen}
                                      aria-label={`${t('portfolio.complete')} ${code}`}
                                      title={t('portfolio.complete')}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        startComplete(code);
                                      }}
                                    >
                                      {code}
                                    </button>
                                    <button
                                      type="button"
                                      className={`${styles.rowAction} ${styles.rowRemove}`}
                                      aria-label={`${t('portfolio.remove')} ${code}`}
                                      title={t('portfolio.remove')}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        removePendingRow(code);
                                      }}
                                    >
                                      <StatIcon d={TILE_ICONS.close} />
                                    </button>
                                  </span>
                                </td>
                                <td className={styles.holdCell}>
                                  <ChuaCo />
                                </td>
                                <td className={styles.holdCell}>
                                  <ChuaCo />
                                </td>
                                <td className={`${styles.holdCell} ${styles.holdPrice}`}>
                                  <KhungCho cho={priceLoading}>
                                    {marketPrice === null ? (
                                      <ChuaCo />
                                    ) : (
                                      (formatNumber(marketPrice) ?? <ChuaCo />)
                                    )}
                                  </KhungCho>
                                </td>
                                <td className={styles.holdCell}>
                                  <ChuaCo />
                                </td>
                                <td className={styles.holdCell}>
                                  <ChuaCo />
                                </td>
                                <td className={styles.holdCell}>
                                  <ChuaCo />
                                </td>
                                {/* Ngày mua: mã chờ chưa có, cùng lẽ với số lượng và giá vốn. */}
                                <td className={styles.holdCell}>
                                  <span className={styles.lastCell}>
                                    <ChuaCo />
                                    <ExpandToggle
                                      open={mo}
                                      {...(mo ? { controls: chiTietId('ma', code) } : {})}
                                      label={`${t('portfolio.details')} ${code}`}
                                      onToggle={() => {
                                        toggleRow(code);
                                      }}
                                    />
                                  </span>
                                </td>
                              </tr>

                              {/*
                                Chi tiết của dòng chờ: chỉ hai nút. Ba số của dòng nắm giữ ở đây đều là
                                `_ _` (chưa có số lượng thì không có gì để tính), bày ra là ba ô không
                                nói gì.
                              */}
                              {mo && (
                                <tr className={styles.detailRow} id={chiTietId('ma', code)}>
                                  <td colSpan={5}>
                                    <div className={styles.detail}>
                                      <div className={styles.detailActions}>
                                        <button
                                          type="button"
                                          className={styles.detailButton}
                                          onClick={() => {
                                            startComplete(code);
                                          }}
                                        >
                                          {t('portfolio.complete')}
                                        </button>
                                        <button
                                          type="button"
                                          className={`${styles.detailButton} ${styles.detailDanger}`}
                                          onClick={() => {
                                            removePendingRow(code);
                                          }}
                                        >
                                          {t('portfolio.remove')}
                                        </button>
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
                  Lượt nhập mã từ ngoài chạm trần của bảng: nêu ĐÍCH DANH mã chưa vào được. Chỉ dựng
                  khi có mã bị bỏ lại — nhập trót lọt thì các dòng mới tự nói, không cần câu nào.

                  Đứng DƯỚI bảng, cạnh câu mẫu số ở trên, chứ không chen giữa dòng tiêu đề và bảng:
                  thẻ tab ở cột trái và bảng ở cột phải bắt đầu cùng một độ cao (12/10/2026), và một
                  dòng chữ chen vào đó đẩy bảng lệch xuống đúng bằng chiều cao của nó.

                  Một `<p>` trơn như câu mẫu số, KHÔNG mang `role="status"`: màn này chỉ có đúng một
                  phần tử `status`/`alert` là dải thị giá, và nhiều ca kiểm tìm nó bằng vai trò đơn.
                */}
                {overflow.length > 0 && (
                  <p className={styles.weightNote}>
                    {t('portfolio.importFull')
                      .replace('{max}', String(MAX_HOLDINGS))
                      .replace('{codes}', overflow.join(', '))}
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
                    title={
                      editing !== null
                        ? `${t('portfolio.edit')} ${editing}`
                        : completing !== null
                          ? `${t('portfolio.complete')} ${completing}`
                          : t('portfolio.add')
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
              Chế độ NHẬP SỐ cho một mã chờ cũng khoá, cùng lẽ: hộp thoại mở ra cho đúng dòng ấy.
            */}
                      <div className={styles.codeField}>
                        <span className={styles.codeLabel} id="portfolio-code-label">
                          {t('portfolio.formCode')}
                        </span>
                        <button
                          type="button"
                          className={styles.codeButton}
                          aria-labelledby="portfolio-code-label"
                          disabled={editing !== null || completing !== null}
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

                      {/*
              Ô CHỮ in ngày/tháng/năm, không phải `type="date"` (13/10/2026). Chủ dự án chụp cột
              "Ngày mua" in `03/10/2026` còn ô này in `10/03/2026`: ô của trình duyệt vẽ theo ngôn
              ngữ của trình duyệt, không theo `formatIsoDate()` của bảng. Xem `DateInput.tsx`.
            */}
                      <DateField
                        label={t('portfolio.formBuyDate')}
                        value={form.buyDate}
                        error={errors.buyDate}
                        onChange={(next) => {
                          setField('buyDate', next);
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
              do còn mạnh hơn — 34 dòng chia hai nhóm cấp độ, có ô tìm, thứ một `<select>` không
              chở nổi.

              Khoá lại khi chưa chọn mã, và đó không phải chuyện thứ tự cho gọn: số ô điền được của
              mỗi công thức PHỤ THUỘC mã có tra được thị giá hay không (xem `hasPrice` ở
              `FormulaForTickerSheet`), và nó quyết định dòng nào có mặt. Mở sheet khi chưa biết mã
              là đưa ra một danh sách chưa chắc đúng.
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
                        {/*
                  Nút chữ "Bỏ chọn công thức" dưới ô đã BỎ (19/10/2026, chủ dự án gọi là "text button
                  thừa"). Muốn bỏ công thức đã chọn thì đóng hộp thoại rồi mở lại: lần mở nào cũng
                  đặt `plannedFormula` về `null`.
                */}
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
                    {/*
                      Chữ ngắn thay icon "fx" (19/10/2026): chủ dự án hỏi icon ấy là gì rồi cho thay. Câu
                      hướng dẫn dài ở đây đã gỡ cùng ngày — lịch sử ở khoá `portfolio.savedEmpty`, `vi.ts`.
                    */}
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
                    <table className={styles.savedList} aria-busy={savedLoading}>
                      <caption className="visually-hidden">
                        {t('portfolio.savedTableCaption')}
                      </caption>

                      <thead className={styles.holdHead}>
                        <tr>
                          {SAVED_COLUMNS.map(({ sortKey, label }) => {
                            if (sortKey === null) {
                              return (
                                <th key={label} scope="col">
                                  {t(label)}
                                </th>
                              );
                            }
                            const dir = savedSort.key === sortKey ? savedSort.dir : null;
                            return (
                              <th key={label} scope="col" aria-sort={ariaSort(dir)}>
                                <SortHeader
                                  label={t(label)}
                                  dir={dir}
                                  onSort={() => sortSavedBy(sortKey)}
                                />
                              </th>
                            );
                          })}
                        </tr>
                      </thead>

                      <tbody>
                        {shownSaved.map((row) => {
                          const href = `${formulaPath(row.saved.formulaId)}?luu=${row.saved.id}`;
                          const openName = row.needsReload
                            ? t('portfolio.savedReload')
                            : t('portfolio.savedOpen');
                          /*
                            Dấu X: MỘT nút, đứng một trong hai chỗ tuỳ khổ — ngay sau tên ở PC (rê chuột
                            mới hiện), cuối ô Ngày lưu ở khổ điện thoại (luôn hiện). Chọn chỗ bằng
                            `khoPC` chứ không vẽ hai nút rồi CSS ẩn một: hai nút cùng tên "Xoá …" là hai
                            đích cho trình đọc màn hình và cho mọi ca kiểm tìm theo tên. Dòng của bảng
                            này chỉ có sau khi đọc kho (effect), nên không có HTML tĩnh nào để lệch.
                          */
                          const nutXoa = (
                            <button
                              type="button"
                              className={`${styles.rowAction} ${styles.rowRemove}`}
                              aria-label={`${t('portfolio.savedRemove')} ${row.label}`}
                              title={t('portfolio.savedRemove')}
                              onClick={(event) => {
                                event.stopPropagation();
                                // Xoá trên bản vừa đọc lại, không trên bảng đang hiện — xem `capNhatDaLuu`.
                                capNhatDaLuu((list) => removeSavedCalc(list, row.saved.id));
                              }}
                            >
                              <StatIcon d={TILE_ICONS.close} />
                            </button>
                          );

                          return (
                            <Fragment key={row.saved.id}>
                              {/*
                              ── Cùng khuôn với dòng của bảng Mã (13/10/2026) ────────────────────────
                              Chủ dự án xem bảng Mã vừa dựng lại rồi bảo: *"đồng bộ cả bên Công thức
                              nữa chứ không phải mỗi bên mã"*. Nên ở đây cũng vậy: mã hết là chip, hai
                              nút biểu tượng cuối dòng (mở/nạp + thùng rác) bỏ, cả dòng là đích bấm mở
                              phép tính, và dấu X đỏ hiện ngay sau tên khi rê chuột vào dòng.

                              `<tr>` không lấy được tiêu điểm và không mở được bằng chuột giữa, nên TÊN
                              ở ô đầu là một `<Link>` thật tới cùng đích — đường của bàn phím, trình đọc
                              màn hình và "mở ở tab mới". Nó giữ đúng hai cái tên mà nút biểu tượng cũ
                              mang: `aria-label` "Mở HPG · P/E" hoặc "Nạp FPT · Beta…", `title` "Mở"
                              hoặc "Nạp". Dòng bị cờ (`needsReload`) đi cùng một đích: màn chi tiết nạp
                              chuỗi từ chính kho mà cờ này đọc.

                              Cả liên kết lẫn dấu X chặn sự kiện nổi lên: không chặn thì bấm tên là điều
                              hướng hai lần, còn bấm X là vừa xoá vừa mở chính phép tính vừa xoá.

                              ── Khổ điện thoại: KHÔNG dòng thả xuống (14/10/2026, lượt hai) ──────────
                              Bản đầu theo khuôn bảng Mã: ba cột, chạm dòng mở dòng chi tiết với Ngày lưu
                              và hai nút Mở/Nạp · Xoá. Chủ dự án xem rồi vẽ lại: *"không có popup đổ xuống
                              khi bấm vào mã nữa, chuyển date lên cùng hàng với cái số liệu kia giống như
                              bên Mã. bây giờ bấm vào công thức thì là vào phần sửa luôn, tạo thêm Icon xóa
                              ở góc bên phải như ở web"*. Nên dưới 1024px bảng có đủ bốn cột như PC, chạm
                              dòng là mở phép tính như PC, và dấu X đứng cuối ô Ngày lưu (xem `nutXoa`).
                              Bảng Mã KHÔNG đổi theo: dòng chi tiết của nó chở ba con số không còn chỗ trên
                              hàng, và nó là bản vẽ của chủ dự án.
                            */}
                              <tr
                                className={[
                                  styles.savedRow,
                                  row.needsReload ? styles.savedRowWarn : undefined,
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                onClick={() => {
                                  router.push(href);
                                }}
                              >
                                <td className={styles.savedName}>
                                  <span className={styles.savedHead}>
                                    <Link
                                      className={styles.savedOpen}
                                      href={href}
                                      aria-label={`${openName} ${row.label}`}
                                      title={openName}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                      }}
                                    >
                                      {row.title}
                                    </Link>
                                    {khoPC && nutXoa}
                                  </span>
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

                                {/* Mã là chữ trơn như ở bảng Mã, không còn chip (`Badge tone="code"`). */}
                                <td className={styles.holdCode}>
                                  {row.saved.code === undefined ? null : (
                                    <span className={styles.savedCode}>{row.saved.code}</span>
                                  )}
                                </td>

                                <td
                                  className={
                                    row.result === '_ _'
                                      ? `${styles.savedResult} ${styles.holdMissing}`
                                      : styles.savedResult
                                  }
                                >
                                  {/*
                                    Kết quả là con số của dòng, và là thứ đổi được khi tải lại (cờ "cần nạp
                                    lại chuỗi" đổi theo kho chuỗi giá) — nên vệt chờ nằm ở đây, như các ô
                                    sống theo thị giá ở bảng Mã. Tên, mã và ngày lưu đứng yên.
                                  */}
                                  <KhungCho cho={savedLoading}>{row.result}</KhungCho>
                                </td>

                                {/*
                                  Ô cuối: ngày lưu, và ở khổ điện thoại thêm dấu X đứng sát mép phải — chỗ
                                  mũi tên "Chi tiết" từng đứng. Cùng lẽ với mũi tên ấy ở bảng Mã: nút nằm
                                  TRONG ô cuối chứ không thành cột thứ năm, vì cột chỉ có ở một khổ là một
                                  tiêu đề trống ở khổ kia.
                                */}
                                <td className={styles.savedDate}>
                                  {khoPC ? (
                                    row.date
                                  ) : (
                                    <span className={styles.lastCell}>
                                      {row.date}
                                      {nutXoa}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            </Fragment>
                          );
                        })}
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
           * `quotes` chỉ chứa mã ĐÃ CÓ DÒNG trong bảng (`feed.snapshots` gọi theo mã nắm giữ và
           * mã chờ số liệu). Từ 10/10/2026 form THÊM chỉ chọn được mã chưa có dòng — sheet chọn mã
           * khoá phần còn lại — nên `quotes.get(formCode)` ở nhánh thêm luôn `undefined`. Nhánh
           * nhập số cho một mã chờ thì có bản ghi như nhánh sửa. Bản cũ đọc `undefined`
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
