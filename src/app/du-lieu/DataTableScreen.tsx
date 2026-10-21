'use client';

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import {
  MAX_SERIES_ROWS,
  PRICE_SERIES_KEY,
  WORKING_SERIES_KEY,
  appendRow,
  checkSeries,
  defaultPresetPicks,
  displaySeriesDate,
  emptyRow,
  formatNumber,
  keepSeriesDateChars,
  parseSeriesDate,
  parseStoredSeries,
  rawViNumber,
  removeRow,
  serializeStoredSeries,
  sortRowsByDate,
  toCsv,
  updateRow,
  withSeriesDateSlashes,
} from '@/application';
import type { CandleRange, PasteResult, Preset, SeriesRow } from '@/application';
import { useT } from '@/application/preferences-context';
import {
  NumberCell,
  filterTypedValue,
  guardFilteredDelete,
  resetFilteredDelete,
} from '@/ui/inputs';
import { useKhoMayTinh } from '@/ui/layout/use-kho-may-tinh';
import { Button } from '@/ui/primitives';
import { CandleChart } from '@/ui/series';
import { beNgangTenCot, PasteImportSheet, PresetSheet } from '@/ui/sheets';

import styles from './DataTableScreen.module.css';

/**
 * Màn WF-05 Bảng dữ liệu — gói WBS 3.3.1.
 *
 * Đây là chỗ chuỗi giá đi vào hệ thống. Beta, Sharpe, độ biến động và VaR đều cần nhiều phiên
 * (FR-12) mà `CalcContext.series` chỉ nhận một mảng số, nên phải có màn để người dùng nhập,
 * sửa và **nhìn thấy dòng nào sai** trước khi đưa vào công thức.
 *
 * Ba lối vào dữ liệu, cùng đổ về một bảng: nhập tay từng dòng · nạp bộ mẫu của DataProvider ·
 * dán từ Excel qua sheet WF-11 đã dựng ở đợt 6. Lối ra là CSV tải về.
 *
 * Bảng lưu ở localStorage chứ không gửi đi đâu (NFR-SEC-01, COM-03). Màn từng có một dòng ghi
 * chú nói đúng câu ấy ngay dưới bảng; chủ dự án cho bỏ ngày 25/08/2026 vì người dùng không cần
 * đọc nó. Bỏ được là vì màn này KHÔNG gọi mạng lần nào, nên chẳng có gì để cảnh báo.
 *
 * Câu trên từng nói thêm rằng "chỗ duy nhất còn phải nói rõ là màn Danh mục, nơi mã cổ phiếu có
 * rời máy thật" — điều đó KHÔNG còn đúng: dải ấy (`portfolio.localOnly`) cũng đã bỏ ngày
 * 09/09/2026 theo yêu cầu chủ dự án. Nay không màn nào nói ra nữa. Đừng dựng lại dòng này ở đây.
 *
 * ── Bản vẽ 10/09/2026: biểu đồ nến trên, bảng và cột kiểm dưới ─────────────────────────────────
 *
 * Chủ dự án gửi bản vẽ khổ PC cho màn này: thẻ biểu đồ nến bày cả chuỗi ở trên, rồi bảng số liệu
 * bên trái và cột "Kiểm tra dữ liệu" bên phải. Biểu đồ vẽ chính cái bảng đang gõ, nên nó là một
 * tấm gương chứ không phải một phép tính — sửa một ô là hình đổi theo ngay.
 *
 * ── Ngày MỚI NHẤT lên đầu, nhưng chỉ ở phần NHÌN THẤY ──────────────────────────────────────────
 *
 * Chủ dự án chốt cùng ngày: bảng bày ngày mới nhất trước. Mảng `rows` thì **giữ nguyên thứ tự
 * thời gian cũ → mới** và tuyệt đối không được lật: `closesOf()` trả mảng theo đúng thứ tự này,
 * còn Beta, độ biến động và VaR đều đọc nó như một chuỗi thời gian. Lật mảng đã lưu là mọi con số
 * rủi ro của sản phẩm tính ngược, mà không có gì trên màn nói là đã ngược.
 *
 * Nên phép lật nằm ở đúng một chỗ: `thuTuBay` ngay dưới. Mọi thứ khác — lưu, kiểm, xuất CSV, vẽ
 * biểu đồ — vẫn làm việc trên mảng thời gian thật.
 *
 * ── 20/10/2026: bảng theo bản vẽ của lưới "Bảng dữ liệu" ──────────────────────────────────────
 *
 * Cùng ngày dựng lại lưới của popup "Bảng dữ liệu" (`PasteImportSheet`) theo bản vẽ, chủ dự án bảo
 * _"thay đổi tương tự với bảng số liệu của phần Chuỗi giá OHLCV"_. Hai bảng là một bảng giá, nên một
 * khuôn: tên cột ngắn bấm để sắp xếp, cột số thứ tự đếm theo màn, ô ngày in ngày/tháng với năm in một
 * lần trên bảng, dòng sọc 32px không kẻ, cột Đóng tô theo giá mở, và cuộn ngang trong khung với cột
 * số thứ tự và cột Ngày đứng yên. Luật nào khác bên popup thì ghi ngay tại chỗ ấy ở file này.
 */

/**
 * Sáu cột của bảng, đúng thứ tự wireframe. `label` là tên đọc được của ô ("Dòng 3 · Khối lượng");
 * `short` và `full` là tên in trên đầu cột, DÙNG CHUNG khoá với lưới của popup (`paste.short.*`,
 * `paste.col.*`) để hai bảng không thể lệch chữ.
 *
 * `short` ("Mở", "KL") CHỈ ở khổ điện thoại (21/10/2026): bản vẽ là ảnh chụp điện thoại, và chủ dự
 * án — _"web pc thì không cần tiết kiệm chữ … ghi rõ lại tiêu đề 'Mở' 'Cao' 'Thấp',... là mở cái gì,
 * cao cái gì, thấp cái gì"_ — nên từ 1024px đầu cột in `full` ("Giá mở cửa"). Không dùng `label` cho
 * việc ấy: nhãn ô của màn này vốn ngắn ("Mở", "Đóng"). Cùng luật với lưới popup (`COLUMN_SHORT_KEYS`),
 * cùng hook `useKhoMayTinh`.
 */
const COLUMNS = [
  { key: 'date', label: 'series.colDate', short: 'paste.short.date', full: 'paste.col.date' },
  { key: 'open', label: 'series.colOpen', short: 'paste.short.open', full: 'paste.col.open' },
  { key: 'high', label: 'series.colHigh', short: 'paste.short.high', full: 'paste.col.high' },
  { key: 'low', label: 'series.colLow', short: 'paste.short.low', full: 'paste.col.low' },
  { key: 'close', label: 'series.colClose', short: 'paste.short.close', full: 'paste.col.close' },
  {
    key: 'volume',
    label: 'series.colVolume',
    short: 'paste.short.volume',
    full: 'paste.col.volume',
  },
] as const;

type CotBang = (typeof COLUMNS)[number]['key'];

/** Chiều cao một dòng, px — cùng con số với `ROW_H` của lưới popup. CSS đọc nó qua `--bang-dong-h`. */
const ROW_H = 32;

/**
 * Chữ in trong ô ngày khi ô KHÔNG đang được sửa — cùng luật với `ngayIn` của lưới popup. Điện thoại:
 * chỉ ngày/tháng, năm in một lần trên bảng (`yearNote`). Từ 1024px (`duNam`, 21/10/2026): đủ
 * ngày/tháng/năm — chủ dự án: _"dữ liệu xuất hiện ở trong bảng ở web pc thì cần hiển thị đầy đủ, ví dụ
 * như ngày: cần hiện rõ ngày tháng năm"_. Ô không mang ngày đủ năm ('15/07', số thứ tự phiên '1') in
 * đúng như đang có.
 */
function ngayIn(text: string, duNam: boolean): string {
  const ngay = parseSeriesDate(text);
  if (ngay === null || ngay.year === null) return text;
  const ngayThang = `${String(ngay.day).padStart(2, '0')}/${String(ngay.month).padStart(2, '0')}`;
  return duNam ? `${ngayThang}/${String(ngay.year)}` : ngayThang;
}

type ChieuSapXep = 'giam' | 'tang';

/**
 * Bảng đang xếp theo cột nào, chiều nào, và thứ tự dòng CHỐT ở lần xếp gần nhất.
 *
 * `thuTu === null` là thứ tự mặc định — ngày mới nhất lên đầu, tức mảng `rows` lật ngược, như bảng
 * này vẫn bày từ 10/09/2026. Mọi thứ tự khác chốt thành danh sách chỉ số, để gõ sửa một ô của cột
 * đang xếp không làm dòng nhảy đi dưới tay. `cu`: tiêu điểm vừa rời một dòng, phải xếp lại — xem
 * `onLeave`.
 */
interface SapXep {
  cot: CotBang;
  chieu: ChieuSapXep;
  thuTu: ReadonlyArray<number> | null;
  cu: boolean;
}

const SAP_MAC_DINH: SapXep = { cot: 'date', chieu: 'giam', thuTu: null, cu: false };

/**
 * Thứ tự bày ra khi xếp theo một cột. Ngày: mảng `rows` vốn đã theo ngày nên chỉ cần lật hay không.
 * Cột số: ô trống đứng CUỐI ở cả hai chiều (coi là 0 thì nó chen vào giữa như một con số có thật,
 * FR-06), hai ô bằng nhau thì phiên mới hơn đứng trước — như thứ tự mặc định.
 */
function thuTuSapXep(rows: ReadonlyArray<SeriesRow>, cot: CotBang, chieu: ChieuSapXep): number[] {
  const viTri = rows.map((_, index) => index);
  if (cot === 'date') return chieu === 'tang' ? viTri : viTri.reverse();
  return viTri.sort((a, b) => {
    const ka = rows[a]?.[cot] ?? null;
    const kb = rows[b]?.[cot] ?? null;
    if (ka === null || kb === null) return ka === kb ? b - a : ka === null ? 1 : -1;
    if (ka === kb) return b - a;
    return chieu === 'tang' ? ka - kb : kb - ka;
  });
}

/** Dấu ˅ cạnh tên cột — cùng hình với lưới popup. Đang xếp tăng dần thì lật lên thành ˄. */
function SortIcon({ chieu }: { chieu: ChieuSapXep | null }) {
  return (
    <svg
      className={styles.sortIcon}
      data-chieu={chieu ?? undefined}
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** Số phiên tối thiểu để Beta và Sharpe có ý nghĩa thống kê — cùng ngưỡng với cảnh báo WF-15. */
const MIN_USABLE_ROWS = 60;

/**
 * Chữ của ô Ngày khi một ngày ĐI VÀO bảng: mọi ngày đủ năm về 'DD/MM/YYYY'.
 *
 * Chủ dự án báo ngày 13/10/2026 ở màn Danh mục: cột in `03/10/2026`, ô sửa in `10/03/2026`, và yêu
 * cầu rà cả sản phẩm cho đồng bộ. Bảng này mắc cùng kiểu lỗi theo cách riêng: bộ mẫu và Finbox ghi
 * ISO ('2026-09-08'), người dùng gõ kiểu Việt ('08/09/2026'), nên một cột có thể in hai lối viết,
 * và cùng một phiên hiện ISO ở đây nhưng '08/09/2026' trên trục biểu đồ của màn chi tiết.
 *
 * Gọi ở đúng BỐN cửa vào (đọc kho, nạp mẫu, dán, rời ô), KHÔNG gọi trong lúc gõ: đổi chữ dưới tay
 * người đang gõ là con trỏ nhảy. Ngày thiếu năm ('15/07') và số thứ tự phiên đi qua nguyên vẹn —
 * xem `displaySeriesDate()`.
 */
function ngayCuaBang(raw: string): string {
  return displaySeriesDate(raw);
}

/** Một dòng đọc lên từ kho, ngày đã về lối viết của bảng. Dòng không đổi thì trả CHÍNH nó. */
function dongCuaBang(row: SeriesRow): SeriesRow {
  const date = ngayCuaBang(row.date);
  return date === row.date ? row : { ...row, date };
}

/** id của ô ngày trên một dòng — chỗ mà nút "Tới dòng N" nhảy tới. */
function oNgayId(index: number): string {
  return `o-ngay-${String(index)}`;
}

interface SeriesRowFieldsProps {
  row: SeriesRow;
  /** Vị trí trong mảng `rows` — dùng cho mọi lời gọi ngược lên màn. */
  index: number;
  /**
   * Số dòng NGƯỜI DÙNG ĐẾM BẰNG MẮT, đếm từ 1 ở dòng trên cùng, với mọi kiểu sắp xếp. Khác `index`
   * vì bảng lật. In ở cột đầu từ 20/10/2026 — trước đó nút "Tới dòng N" của cột kiểm nói tới một con
   * số không in ở đâu trên bảng.
   */
  displayNumber: number;
  /** Dòng sọc — tính theo vị trí BÀY RA, nên sọc vẫn xen kẽ khi bảng đang sắp xếp. */
  stripe: boolean;
  /** Từ 1024px: ô ngày in đủ ngày/tháng/năm thay vì ngày/tháng — xem `ngayIn`. */
  fullDate: boolean;
  /** Dòng có vấn đề hay không. Truyền boolean chứ KHÔNG truyền mảng issues: mảng được dựng
   *  lại sau mỗi lần gõ nên sẽ phá memo, và ở đây dòng chỉ cần biết có tô vàng hay không. */
  bad: boolean;
  onChange: (index: number, patch: Partial<SeriesRow>) => void;
  onRemove: (index: number) => void;
  /** Tiêu điểm vừa rời khỏi cả dòng — lúc ấy mới được sắp xếp lại. */
  onLeave: () => void;
}

/**
 * Một dòng của bảng, **memo hoá**.
 *
 * Bộ mẫu 248 phiên là 1.488 ô nhập. Không memo thì mỗi phím gõ vào một ô sẽ render lại toàn
 * bộ chỗ còn lại: đo trên máy thật được 72 ms/phím, tức là gõ nhanh sẽ thấy chữ đuổi theo tay.
 * Memo cắt việc đó xuống còn đúng dòng đang sửa.
 */
const SeriesRowFields = memo(function SeriesRowFields({
  row,
  index,
  displayNumber,
  stripe,
  fullDate,
  bad,
  onChange,
  onRemove,
  onLeave,
}: SeriesRowFieldsProps) {
  const t = useT();
  /** Ô ngày đang được sửa — lúc ấy nó in đủ năm để sửa được, rời ô thì về ngày/tháng. */
  const [suaNgay, setSuaNgay] = useState(false);
  /*
   * Giá đóng cửa so với giá mở cửa của CHÍNH phiên ấy — cùng luật màu với lưới popup (`trendOf`):
   * xanh khi đóng ≥ mở, cam khi đóng < mở. Thiếu một trong hai thì không tô.
   */
  const xuHuong =
    row.open === null || row.close === null ? undefined : row.close >= row.open ? 'tang' : 'giam';
  const rowClass = [stripe ? styles.rowStripe : '', bad ? styles.badRow : '']
    .filter((name) => name !== '')
    .join(' ');

  return (
    <tr
      className={rowClass === '' ? undefined : rowClass}
      /*
       * Sắp xếp lại NGAY KHI tiêu điểm rời khỏi cả dòng, không sớm hơn.
       *
       * `relatedTarget` là nơi tiêu điểm sắp tới. Còn nằm trong chính dòng này (Tab từ ô Ngày
       * sang ô Mở) thì chưa nhập xong — sắp lúc ấy là dòng nhảy đi chỗ khác giữa lúc người dùng
       * đang gõ, đúng thứ chủ dự án dặn tránh: *"nhập liệu xong rồi mới check ngày rồi sort"*.
       */
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        onLeave();
      }}
    >
      {/*
        Số thứ tự trên màn. Dòng lỗi thì con số đậm và đỏ, như lưới popup — không viên tròn nào quanh
        nó (chủ dự án bỏ ngày 20/10/2026). Vẫn đọc được số để đối với câu "Dòng N" bên cột kiểm.
      */}
      <th scope="row" className={styles.lineNo}>
        <span className={bad ? styles.lineNoBad : undefined}>{displayNumber}</span>
      </th>

      {COLUMNS.map((column) => (
        <td
          key={column.key}
          className={
            column.key === 'date'
              ? styles.tdDate
              : column.key === 'volume'
                ? styles.tdSoft
                : undefined
          }
          data-xu-huong={column.key === 'close' ? xuHuong : undefined}
        >
          {column.key === 'date' ? (
            /*
              Ô Ngày: bàn phím SỐ, và một luật ghép dấu bù lại cho nó.

              Chủ dự án chốt 14/09/2026 đưa ô này vào cùng luật với các ô số — chỉ chữ số và ba dấu
              ngăn mà `parseSeriesDate()` đọc được. Nhưng bàn phím số của iPhone lẫn Android KHÔNG
              có phím '/', nên `inputMode="numeric"` một mình sẽ khoá người dùng điện thoại ra khỏi
              cột này: họ chỉ gõ được '07092026'. `withSeriesDateSlashes()` lúc rời ô là phần bù bắt
              buộc, không phải tiện ích thêm — gỡ nó đi là hồi quy cứng trên điện thoại.

              Ghép dấu lúc RỜI Ô chứ không từng phím: chèn dấu giữa lúc đang gõ là con trỏ nhảy.
              Và nó không bao giờ đoán bừa — ghép không ra một ngày có thật thì trả nguyên xi, nên
              số thứ tự phiên ('1', '2' của chuỗi minh hoạ trang Beta) nằm im.

              Không đang sửa thì ô ở điện thoại chỉ in ngày/tháng (`ngayIn`, 20/10/2026), từ 1024px
              in đủ năm (21/10/2026); chạm vào là thấy lại đúng chữ đã ghi. Chỉ là cách IN: giá trị
              của dòng vẫn đủ năm, nên lưu, kiểm và CSV không đổi.

              Ô trống hiện `_ _` như năm ô số (chủ dự án, 20/10/2026: _"chỗ nhập ngày đang để trống
              không có _ _ ở dưới ẩn ý là được nhập"_) — trắng trơn thì đọc ra là ô khoá.
            */
            <input
              id={oNgayId(index)}
              className={styles.cell}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="_ _"
              aria-label={`${t('series.rowLabel')} ${displayNumber} · ${t(column.label)}`}
              value={suaNgay ? row.date : ngayIn(row.date, fullDate)}
              onFocus={() => {
                setSuaNgay(true);
              }}
              onChange={(event) => {
                onChange(index, { date: filterTypedValue(event, keepSeriesDateChars) });
              }}
              /* Bù phím xoá cho ký tự vừa bị loại — bắt buộc đi kèm cửa lọc, xem docblock của nó. */
              onKeyDown={guardFilteredDelete}
              onBlur={(event) => {
                setSuaNgay(false);
                resetFilteredDelete(event.currentTarget);
                /* Ghép dấu rồi đưa về MỘT lối viết: '20250715' và '2025-07-15' đều thành
                   '15/07/2025' — xem `ngayCuaBang()`. */
                const tron = ngayCuaBang(withSeriesDateSlashes(row.date));
                if (tron !== row.date) onChange(index, { date: tron });
              }}
            />
          ) : (
            /* Năm cột số đi qua `NumberCell` — nó giữ chuỗi thô trong lúc gõ, nếu không thì dấu
               phẩy bị nuốt ngay khi vừa gõ và một lần chạm vào ô có thể nhân giá lên nghìn lần
               (lý do đầy đủ ở docblock của nó).

               Ô chưa điền hiện dấu gạch chứ không để trắng trơn: bốn cột Mở/Cao/Thấp/Khối lượng
               thường trống cả bảng (chuỗi minh hoạ chỉ có giá đóng cửa), mà trắng trơn thì đọc ra
               là ô khoá. Ký tự thuần nên không qua i18n — cùng loại với '×' của nút xoá và '!'
               của cờ báo lỗi ngay dưới. */
            <NumberCell
              className={styles.cell}
              ariaLabel={`${t('series.rowLabel')} ${displayNumber} · ${t(column.label)}`}
              placeholder="_ _"
              value={row[column.key]}
              onChange={(next) => {
                onChange(index, { [column.key]: next });
              }}
            />
          )}
        </td>
      ))}

      <td>
        <button
          type="button"
          className={styles.removeButton}
          aria-label={`${t('series.removeRow')} ${displayNumber}`}
          onClick={() => {
            onRemove(index);
          }}
        >
          ×
        </button>
      </td>
    </tr>
  );
});

export function DataTableScreen() {
  const t = useT();

  /*
   * `?from=` KHÔNG còn đọc ở đây. Nó chỉ phục vụ nút quay lại, mà nút ấy đã lên thanh trên — luật
   * nay nằm trọn ở `backLinkFor()` bên `routes.ts`, kể cả ngoại lệ "về đúng trang công thức".
   *
   * Nhờ đó màn này thôi gọi `useSearchParams()` và thôi đụng `FORMULA_SUMMARIES`. Đừng dựng lại
   * hai thứ ấy chỉ để đọc `?from=`: docblock cũ ở đây đã đo được /du-lieu/ nhảy 131 → 217 kB khi
   * thử kéo Registry vào, và chỉ mục công thức là bước đầu tiên trên con đường ấy.
   */
  const [code, setCode] = useState('');
  const [rows, setRows] = useState<ReadonlyArray<SeriesRow>>([]);
  const [sheet, setSheet] = useState<'preset' | 'paste' | null>(null);
  const [range, setRange] = useState<CandleRange>('all');
  /**
   * Bảng hiện tại dựng từ một bộ số liệu mẫu BẢN THẢO.
   *
   * Cố ý KHÔNG lưu vào localStorage cùng bảng: cờ này nói về phiên làm việc hiện tại, còn dữ
   * liệu đã lưu thì lần mở sau người dùng có thể đã sửa tay. Nạp mẫu bật cờ, dán tay hay sửa
   * tay thì tắt — nó chỉ dùng để đính ghi chú vào file CSV tải về.
   */
  const [fromDraft, setFromDraft] = useState(false);
  const [loaded, setLoaded] = useState(false);
  /** Cột đang sắp xếp — mặc định Ngày giảm dần, tức phiên mới nhất lên đầu. */
  const [sapXep, setSapXep] = useState<SapXep>(SAP_MAC_DINH);
  /** Bề ngang trong của khung cuộn, và mức sàn bề ngang của bảng đọc ra px — xem `colWidth`. */
  const [frameWidth, setFrameWidth] = useState(0);
  const [floorWidth, setFloorWidth] = useState(0);
  const khung = useRef<HTMLDivElement>(null);
  const bang = useRef<HTMLTableElement>(null);
  /** Từ 1024px đầu cột in tên đầy đủ thay cho tên ngắn — xem `COLUMNS`. */
  const mayTinh = useKhoMayTinh();

  /*
   * Đọc localStorage trong effect, KHÔNG đọc lúc khởi tạo state: bản build là HTML tĩnh nên
   * lần render đầu ở máy khách phải giống hệt lúc build, nếu không lệch hydration (bài học đợt 2).
   */
  useEffect(() => {
    try {
      const stored = parseStoredSeries(window.localStorage.getItem(PRICE_SERIES_KEY));
      setCode(stored.code);
      /* Sắp một lần lúc nạp: bảng cũ trong máy có thể đã lộn thứ tự từ một lần dán ngược. Và đưa
         ngày về một lối viết: bảng cất trước 13/10/2026, hay bảng do nút "Áp dụng vào bảng dữ
         liệu" của màn chi tiết ghi, còn mang ngày ISO. */
      setRows(sortRowsByDate(stored.rows.map(dongCuaBang)));
    } catch {
      // localStorage bị chặn (chế độ riêng tư của Safari) — màn vẫn dùng được, chỉ không nhớ.
    }
    setLoaded(true);
  }, []);

  /**
   * Lượt ghi ĐẦU TIÊN sau khi đọc kho — tức bảng vừa nạp lên, chưa ai sửa gì.
   *
   * Cần phân biệt vì hai chuyện dẫn tới cùng một lần ghi: nạp bảng lên màn, và người dùng sửa
   * bảng. Chỉ lần thứ hai mới được phép huỷ chuỗi đã thay tại chỗ ở màn chi tiết (xem effect
   * ngay dưới). Đúng MỘT lượt bị bỏ qua: `setCode`/`setRows`/`setLoaded` nằm chung một effect
   * nên React gộp thành một lượt render, và mọi lượt chạy sau đó đều do `code`/`rows` đổi thật.
   */
  const firstWriteRef = useRef(true);

  // Ghi lại sau mỗi lần sửa. Chỉ ghi sau khi đã đọc xong, nếu không lần render đầu sẽ
  // đè bảng rỗng lên dữ liệu người dùng đã có.
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(PRICE_SERIES_KEY, serializeStoredSeries({ code, rows }));

      if (firstWriteRef.current) {
        firstWriteRef.current = false;
        return;
      }

      /*
       * Người dùng vừa SỬA bảng → chuỗi họ dán tại chỗ ở màn chi tiết hết hiệu lực.
       *
       * Hai chuỗi cùng tồn tại là có chủ ý (dán ở màn chi tiết cố ý không ghi đè bảng này), nên
       * phải có luật ai thắng khi quay lại màn chi tiết. Luật: thao tác GẦN NHẤT thắng. Bỏ đoạn
       * này thì bảng vừa sửa xong lại bị một chuỗi cũ hơn che mất, và người dùng không có cách
       * nào nhìn ra vì sao — xem `WORKING_SERIES_KEY`.
       */
      window.sessionStorage.removeItem(WORKING_SERIES_KEY);
    } catch {
      // Hết dung lượng hoặc bị chặn — không chặn thao tác đang làm.
    }
  }, [code, rows, loaded]);

  const check = useMemo(() => checkSeries(rows), [rows]);
  const issueByIndex = useMemo(
    () => new Map(check.rows.map((row) => [row.index, row.issues])),
    [check],
  );

  /**
   * Thứ tự BÀY RA MÀN: vị trí trên màn → chỉ số trong `rows`.
   *
   * Mặc định là ngày mới nhất trước: chỉ đảo chiều, không sắp lại — `rows` vốn đã theo ngày (xem
   * `onLeave` và lúc nạp). Khi đang xếp theo cột khác thì là thứ tự đã chốt; dòng sinh ra sau lần chốt
   * ("Thêm dòng") đứng TRÊN CÙNG, đúng lời hứa của nút ấy, cho tới lần xếp lại sau.
   */
  const thuTuBay = useMemo(() => {
    if (sapXep.thuTu === null) return rows.map((_, index) => index).reverse();
    const daXep = new Set(sapXep.thuTu);
    const moi: number[] = [];
    for (let index = rows.length - 1; index >= 0; index -= 1) {
      if (!daXep.has(index)) moi.push(index);
    }
    return [...moi, ...sapXep.thuTu.filter((index) => index < rows.length)];
  }, [rows, sapXep.thuTu]);

  const viTriTrenMan = useMemo(
    () => new Map(thuTuBay.map((index, position) => [index, position])),
    [thuTuBay],
  );

  /**
   * Vị trí bày ra của một dòng, đếm từ 1 — con số mà cột số thứ tự, mọi nhãn và mọi câu báo lỗi
   * phải dùng. Đi theo màn ở MỌI kiểu sắp xếp, như lưới popup (`soTrenMan`): dòng trên cùng là 1.
   */
  const soDong = useCallback(
    (index: number) => (viTriTrenMan.get(index) ?? index) + 1,
    [viTriTrenMan],
  );

  /*
   * Xếp lại thứ tự đã chốt sau khi tiêu điểm rời một dòng (`onLeave` dựng cờ `cu`). Chạy trước lúc
   * vẽ ra màn, nên không có khung hình nào bày thứ tự cũ trên mảng vừa sắp lại.
   */
  useLayoutEffect(() => {
    if (!sapXep.cu) return;
    setSapXep({
      ...sapXep,
      cu: false,
      thuTu: sapXep.thuTu === null ? null : thuTuSapXep(rows, sapXep.cot, sapXep.chieu),
    });
  }, [sapXep, rows]);

  /**
   * Bấm tên cột — cùng luật với lưới popup: cột số lần đầu xếp GIẢM dần, lần hai đảo chiều, lần ba
   * về mặc định (ngày mới nhất lên đầu). Cột Ngày đã giảm dần sẵn nên chỉ đảo qua lại giữa cũ trước
   * và mới trước.
   */
  function bamSapXep(cot: CotBang) {
    const dangXep = sapXep.cot === cot ? sapXep.chieu : null;
    const chieu: ChieuSapXep | null =
      cot === 'date'
        ? dangXep === 'giam'
          ? 'tang'
          : null
        : dangXep === null
          ? 'giam'
          : dangXep === 'giam'
            ? 'tang'
            : null;
    setSapXep(
      chieu === null
        ? SAP_MAC_DINH
        : { cot, chieu, thuTu: thuTuSapXep(rows, cot, chieu), cu: false },
    );
  }

  // Ba callback này phải ổn định qua các lần render, nếu không memo của từng dòng vô tác dụng.
  const setCell = useCallback((index: number, patch: Partial<SeriesRow>) => {
    setRows((current) => updateRow(current, index, patch));
  }, []);

  /** Bỏ một dòng. Thứ tự đã chốt dịch chỉ số theo, để các dòng còn lại đứng yên chỗ cũ. */
  const dropRow = useCallback((index: number) => {
    setRows((current) => removeRow(current, index));
    setSapXep((current) =>
      current.thuTu === null
        ? current
        : {
            ...current,
            thuTu: current.thuTu
              .filter((line) => line !== index)
              .map((line) => (line > index ? line - 1 : line)),
          },
    );
  }, []);

  /**
   * Tiêu điểm vừa rời khỏi một dòng — lúc này mới xếp lại theo ngày.
   *
   * Đây là vế thứ hai của yêu cầu chủ dự án: dòng mới hiện ngay trên đầu, *"sau khi nhập liệu
   * xong rồi mới check ngày rồi sort"*. Dòng chưa có ngày đọc được thì `sortRowsByDate()` để
   * nguyên tại chỗ, nên dòng vừa thêm ở lại đầu bảng cho tới khi ô ngày có nội dung thật.
   *
   * Đang xếp theo cột khác thì thứ tự đã chốt cũng xếp lại lúc này (cờ `cu`), cùng luật "nhập xong
   * rồi mới sort". Nó còn là việc BẮT BUỘC: sắp mảng theo ngày làm đổi chỉ số, mà thứ tự đã chốt là
   * một danh sách chỉ số — không xếp lại thì các dòng đổi chỗ cho nhau trên màn. Lưới popup không có
   * vế này vì lưới của nó không bao giờ tự sắp lại.
   */
  const onLeave = useCallback(() => {
    setRows((current) => sortRowsByDate(current));
    setSapXep((current) => (current.thuTu === null ? current : { ...current, cu: true }));
  }, []);

  /**
   * Thêm một dòng — bày ở ĐẦU bảng.
   *
   * Nối vào CUỐI mảng chứ không đầu: mảng đi theo thời gian nên cuối mảng là phiên mới nhất, mà
   * bảng lật nên phiên mới nhất hiện lên trên cùng. Một dòng trống chưa có ngày thì không tham
   * gia phép sắp, nên nó nằm im ở đó trong lúc người dùng gõ.
   *
   * Đưa con trỏ thẳng vào ô ngày: người dùng bấm "Thêm dòng" là để gõ ngay, và ô ngày là ô đầu.
   */
  const addRow = useCallback(() => {
    setRows((current) => {
      const next = appendRow(current, emptyRow());
      if (next.length === current.length) return current;
      /* Sau lượt vẽ tiếp theo mới có ô để đưa tiêu điểm vào. */
      window.requestAnimationFrame(() => {
        document.getElementById(oNgayId(next.length - 1))?.focus();
      });
      return next;
    });
  }, []);

  /** Nhảy tới một dòng đang lỗi từ cột kiểm tra. */
  const goToRow = useCallback((index: number) => {
    const field = document.getElementById(oNgayId(index));
    field?.scrollIntoView({ block: 'center' });
    field?.focus();
  }, []);

  /**
   * Nhận bộ mẫu từ sheet WF-10.
   *
   * Trước đợt 11b màn này có một `<select>` riêng chỉ liệt kê mã, nên người dùng chọn mã mà
   * không biết bộ đó là kỳ báo cáo nào, bao nhiêu phiên, hay số liệu còn là bản thảo — cảnh
   * báo R-01 chỉ có trong sheet. Nay hai chỗ nạp mẫu dùng chung một sheet, một cách nói.
   */
  const loadPreset = useCallback((preset: Preset) => {
    setCode(preset.code);
    // Ghi nhớ bảng này dựng từ bộ mẫu bản thảo, để dấu vết đi theo cả vào file CSV tải về.
    setFromDraft(preset.isDraft);
    // Bảng mới thì thứ tự mới: về ngày mới nhất trước, như lưới popup mỗi lần lưới được THAY.
    setSapXep(SAP_MAC_DINH);
    setRows(
      sortRowsByDate(
        preset.bars.slice(-MAX_SERIES_ROWS).map((bar) => ({
          date: ngayCuaBang(bar.date),
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume,
        })),
      ),
    );
  }, []);

  /**
   * Nhận kết quả từ sheet WF-11. Dán ĐÈ bảng cũ chứ không nối thêm — nối thì sinh ngày trùng.
   *
   * Và xoá MÃ, cùng lúc với số. Mã là nhãn nói bảng này là chuỗi của mã nào, mà dán đè thì số đã
   * là của người dùng. Chủ dự án báo 16/10/2026: nạp mẫu FPT, rồi "Dán Excel/CSV" bộ dữ liệu mẫu,
   * biểu đồ vẽ chuỗi mới mà đầu thẻ vẫn ghi "FPT · 248 phiên · 20/01/2025 → 31/12/2025". Nhãn ấy
   * còn đi theo bảng vào tên file CSV và về màn chi tiết, nên giữ lại là gắn tên FPT lên số của
   * người khác (FR-06). Cùng luật với màn chi tiết: chuỗi dán ở đó được bàn giao sang đây với mã
   * rỗng (`handOverToDataTable()`).
   */
  const importPaste = useCallback((result: PasteResult) => {
    setCode('');
    setFromDraft(false);
    setSapXep(SAP_MAC_DINH);
    setRows(
      sortRowsByDate(
        // `parsePaste` trả chuỗi theo chiều cũ → mới, nên cắt phải cắt ĐẦU chuỗi: quá trần thì
        // giữ các phiên GẦN NHẤT. Cắt đuôi là giữ đúng phần cũ nhất, tức vứt đi phần người
        // dùng quan tâm. Sheet đã cắt sẵn và nói ra; chỗ này giữ bất biến cho mọi lối gọi khác.
        result.rows.slice(-MAX_SERIES_ROWS).map((bar) => ({
          date: ngayCuaBang(bar.date),
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume,
        })),
      ),
    );
    setSheet(null);
  }, []);

  const downloadCsv = useCallback(() => {
    const blob = new Blob([`﻿${toCsv(rows, fromDraft ? t('preset.draftExport') : undefined)}`], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${code === '' ? 'chuoi-gia' : code.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [rows, code, fromDraft, t]);

  const clearAll = useCallback(() => {
    if (!window.confirm(t('series.clearConfirm'))) return;
    setRows([]);
    setSapXep(SAP_MAC_DINH);
  }, [t]);

  /**
   * Năm của chuỗi, in một lần trên bảng thay cho phần năm của từng ô ngày — cùng luật với lưới popup.
   * Chỉ đọc các dòng KHÔNG lỗi, nên một ô gõ nhầm năm 2062 không kéo dãn khoảng năm. Không phiên nào
   * ghi đủ năm (chuỗi minh hoạ đánh số phiên '1', '2') thì không in gì.
   */
  const yearNote = useMemo(() => {
    let tu = Number.POSITIVE_INFINITY;
    let den = Number.NEGATIVE_INFINITY;
    rows.forEach((row, index) => {
      if (issueByIndex.has(index)) return;
      const ngay = parseSeriesDate(row.date);
      if (ngay === null || ngay.year === null) return;
      tu = Math.min(tu, ngay.year);
      den = Math.max(den, ngay.year);
    });
    if (!Number.isFinite(tu)) return null;
    return tu === den
      ? t('paste.yearOne').replace('{nam}', String(tu))
      : t('paste.yearRange').replace('{tu}', String(tu)).replace('{den}', String(den));
  }, [rows, issueByIndex, t]);

  /**
   * Bề ngang từng cột, tính bằng `ch` theo chữ DÀI NHẤT cột ấy đang in — cùng cách với lưới popup.
   * Mức sàn là tên cột in đậm cộng dấu ˅; ô ngày tính theo chữ `ngayIn` in ra (ngày/tháng ở điện
   * thoại, đủ năm từ 1024px).
   */
  const widths = useMemo(
    () =>
      COLUMNS.map((column) => {
        const head = t(mayTinh ? column.full : column.short);
        let longest = beNgangTenCot(head);
        for (const row of rows) {
          const value = column.key === 'date' ? null : row[column.key];
          const text =
            column.key === 'date'
              ? ngayIn(row.date, mayTinh)
              : value === null
                ? ''
                : rawViNumber(value);
          longest = Math.max(longest, text.length);
        }
        return Math.min(longest, 16);
      }),
    [rows, mayTinh, t],
  );
  const widthSum = widths.reduce((sum, width) => sum + width, 0);
  const coBang = rows.length > 0;

  /*
   * Đo khung cuộn và mức sàn của bảng ra px, để chia phần bề ngang DƯ cho riêng các cột số liệu.
   *
   * Hai cái bẫy đã đo ở lưới popup, nên chép cả cách chữa: `table-layout: fixed` tự chia phần dư theo
   * tỷ lệ cho MỌI cột (cột số thứ tự 32 → 68px ở 1440), và mức sàn phải đo lại khi phông chữ tải xong
   * và mỗi lần bảng đổi cỡ — `ch` là bề ngang chữ "0" của phông ĐANG DÙNG, đo trên phông thay thế thì
   * bảng tràn khung ~30px.
   */
  useLayoutEffect(() => {
    const frame = khung.current;
    const table = bang.current;
    if (frame === null || table === null) return undefined;
    const doLai = (): void => {
      setFrameWidth(frame.clientWidth);
      const floor = Number.parseFloat(getComputedStyle(table).minWidth);
      setFloorWidth(Number.isFinite(floor) ? floor : 0);
    };
    doLai();
    let conHieuLuc = true;
    // jsdom không có `document.fonts`.
    if ('fonts' in document) {
      void document.fonts.ready.then(() => {
        if (conHieuLuc) doLai();
      });
    }
    if (typeof ResizeObserver !== 'function') {
      return () => {
        conHieuLuc = false;
      };
    }
    const observer = new ResizeObserver(doLai);
    observer.observe(frame);
    observer.observe(table);
    return () => {
      conHieuLuc = false;
      observer.disconnect();
    };
  }, [coBang, widthSum]);
  const spare = floorWidth > 0 && frameWidth > floorWidth ? frameWidth - floorWidth : 0;
  /** Bề ngang một cột: chữ dài nhất + đệm hai bên + phần dư chia cho nó (làm tròn xuống, khỏi tràn 1px). */
  const colWidth = (width: number): string => {
    const share = widthSum > 0 ? Math.floor((spare * width) / widthSum) : 0;
    return share > 0
      ? `calc(${String(width)}ch + 1rem + ${String(share)}px)`
      : `calc(${String(width)}ch + 1rem)`;
  };

  /*
   * Bảng hết dòng thì cũng hết mã — bằng nút "Xoá" hay bằng cách bỏ từng dòng một. Thiếu đoạn này
   * thì dòng gõ tay đầu tiên sau đó lại hiện dưới nhãn của mã cũ, cùng lỗi với `importPaste()`.
   *
   * Chờ `loaded`: lúc gắn, effect đọc kho đặt mã và dòng trong cùng nhịp với effect này, mà effect
   * này còn thấy mảng rỗng của lần render đầu — không chờ là nó xoá mã vừa đọc lên.
   */
  useEffect(() => {
    if (loaded && rows.length === 0) setCode('');
  }, [loaded, rows.length]);

  /*
   * Thanh tiến độ của cột kiểm tra. Hai mốc trên thanh, đều là con số THẬT của sản phẩm chứ không
   * phải mốc trang trí: 60 là ngưỡng Beta/Sharpe có ý nghĩa thống kê, 400 là trần `MAX_SERIES_ROWS`.
   */
  const phanTram = Math.min(100, (check.usableCount / MAX_SERIES_ROWS) * 100);
  const mocToiThieu = (MIN_USABLE_ROWS / MAX_SERIES_ROWS) * 100;

  return (
    <div className={styles.screen}>
      <div className={styles.topBar}>
        <header className={styles.head}>
          {/*
            Đường ra chuyển lên thanh trên (`HeaderIdentity`), cùng đợt với màn chi tiết và màn tìm.

            Cả NGOẠI LỆ của màn này cũng đi theo, không bị bỏ rơi: vào từ nút "Mở bảng dữ liệu" của
            một trang công thức (`?from=<id>`) thì đường ra vẫn về ĐÚNG trang đó chứ không về danh
            sách. Luật ấy nay nằm ở `backLinkFor()` bên `routes.ts` — đọc `?from` từ chuỗi truy vấn,
            cùng tham số mà `fromFormula` ngay trên đang đọc.
          */}
          <h1 className={styles.title}>{t('series.title')}</h1>
          <p className={styles.subtitle}>
            {code === '' ? t('series.codeLabel') : code} · {t('series.subtitle')}
          </p>
        </header>

        <div className={styles.actions}>
          <Button size="sm" onClick={addRow}>
            + {t('series.addRow')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSheet('preset');
            }}
          >
            {t('series.loadPreset')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSheet('paste');
            }}
          >
            {t('series.paste')}
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadCsv} disabled={rows.length === 0}>
            ↓ {t('series.downloadCsv')}
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} disabled={rows.length === 0}>
            {t('series.clear')}
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className={styles.empty}>{t('series.empty')}</p>
      ) : (
        <>
          <CandleChart rows={rows} code={code} range={range} onRangeChange={setRange} />

          <div className={styles.lower}>
            <section className={styles.tableCard} aria-labelledby="khoi-bang-so-lieu">
              <div className={styles.cardHead}>
                <h2 className={styles.cardTitle} id="khoi-bang-so-lieu">
                  {t('series.tableTitle')}
                </h2>
                {/* Dòng "Mới → cũ · sửa trực tiếp trong ô" đã bỏ — mộ chí `series.tableHint` ở vi.ts. */}
                {/* Năm của chuỗi, thay cho phần năm của từng ô ngày (20/10/2026). */}
                {yearNote !== null && <p className={styles.yearNote}>{yearNote}</p>}
              </div>

              {/* Khung cuộn ngang riêng — bảng 6 cột không thể vừa 360px, và cả trang thì
                  KHÔNG được tràn ngang (bài học đợt 7 với bảng lịch trả nợ WF-14). Cột số thứ tự
                  và cột Ngày đứng yên khi cuộn, như lưới popup. */}
              <div className={styles.tableWrap} ref={khung}>
                {/*
                  `--bang-dong-h`: chiều cao dòng (`ROW_H`). `minWidth`: tổng bề ngang các cột (`widths`)
                  cộng hai cột hẹp 2rem — khung rộng hơn thì bảng giãn lấp khung, hẹp hơn thì khung
                  cuộn ngang. Mỗi cột số liệu cộng 1rem là đệm hai bên của ô.
                */}
                <table
                  ref={bang}
                  className={styles.table}
                  style={
                    {
                      '--bang-dong-h': `${String(ROW_H)}px`,
                      minWidth: `calc(4rem + ${String(widthSum)}ch + ${String(COLUMNS.length)}rem)`,
                    } as CSSProperties
                  }
                >
                  <colgroup>
                    <col className={styles.colLine} />
                    {widths.map((width, index) => (
                      <col key={index} style={{ width: colWidth(width) }} />
                    ))}
                    <col className={styles.colRemove} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col" className={styles.lineHead}>
                        <span className="visually-hidden">{t('series.rowLabel')}</span>
                      </th>
                      {COLUMNS.map((column) => {
                        const full = t(column.full);
                        const short = t(column.short);
                        // Tên ngắn chỉ ở điện thoại; từ 1024px in tên đầy đủ (xem `COLUMNS`).
                        const hien = mayTinh ? full : short;
                        const chieu = sapXep.cot === column.key ? sapXep.chieu : null;
                        return (
                          <th
                            key={column.key}
                            scope="col"
                            className={column.key === 'date' ? styles.thDate : undefined}
                            aria-sort={
                              chieu === null
                                ? undefined
                                : chieu === 'tang'
                                  ? 'ascending'
                                  : 'descending'
                            }
                          >
                            {/*
                              Tên đọc được là tên ĐẦY ĐỦ ("Giá mở cửa"), như lưới popup: nó chứa
                              chữ đang hiện ở cả hai khổ. Tên ngắn không nằm trong nó ("KL") thì ghép
                              vào sau, để ai gọi nút bằng chữ đang thấy vẫn gọi trúng.
                            */}
                            <button
                              type="button"
                              className={
                                chieu === null
                                  ? styles.colHead
                                  : `${styles.colHead} ${styles.colHeadOn}`
                              }
                              aria-label={
                                full.toLowerCase().includes(short.toLowerCase())
                                  ? full
                                  : `${full} (${short})`
                              }
                              title={full === hien ? undefined : full}
                              onClick={() => {
                                bamSapXep(column.key);
                              }}
                            >
                              <span className={styles.colHeadText}>{hien}</span>
                              <SortIcon chieu={chieu} />
                            </button>
                          </th>
                        );
                      })}
                      <th scope="col">
                        <span className="visually-hidden">{t('series.removeRow')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {thuTuBay.map((index, position) => {
                      const row = rows[index];
                      if (row === undefined) return null;
                      return (
                        <SeriesRowFields
                          key={index}
                          row={row}
                          index={index}
                          displayNumber={position + 1}
                          stripe={position % 2 === 1}
                          fullDate={mayTinh}
                          bad={issueByIndex.has(index)}
                          onChange={setCell}
                          onRemove={dropRow}
                          onLeave={onLeave}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/*
              Cột "Kiểm tra dữ liệu" — bản vẽ 10/09/2026. Nó gom ba thứ trước đây nằm rải rác dưới
              bảng: dòng đếm phiên dùng được, câu nhắc 60 phiên, và danh sách dòng lỗi. Gom lại vì
              cả ba trả lời CÙNG một câu hỏi — "bảng này đã dùng được chưa" — mà trước đó người dùng
              phải cuộn qua 248 dòng mới đọc được câu trả lời.
            */}
            <aside className={styles.checkCard} aria-labelledby="khoi-kiem-tra">
              <h2 className={styles.cardTitle} id="khoi-kiem-tra">
                {t('series.checkTitle')}
              </h2>

              <p className={styles.count}>
                {/* `formatNumber` khai trả `string` nên `?? check.usableCount` từng đứng đây không
                    bao giờ chạy — một đường dự phòng giả, đọc vào tưởng có xử lý ca lỗi. */}
                <span className={styles.countBig}>{formatNumber(check.usableCount)}</span>
                <span className={styles.countRest}>
                  {' / '}
                  {formatNumber(check.total)} {t('series.usable')}
                </span>
              </p>

              {/*
                Thanh tiến độ chỉ là hình: con số đã nằm ngay trên, và `aria-hidden` giữ cho trình
                đọc màn hình khỏi đọc lại cùng một thông tin hai lần dưới hai hình thức.
              */}
              <div className={styles.gauge} aria-hidden="true">
                <div className={styles.gaugeTrack}>
                  <div className={styles.gaugeFill} style={{ width: `${String(phanTram)}%` }} />
                  <div className={styles.gaugeMark} style={{ left: `${String(mocToiThieu)}%` }} />
                </div>
                <div className={styles.gaugeScale}>
                  <span>0</span>
                  <span>
                    {String(MIN_USABLE_ROWS)} · {t('series.checkFloor')}
                  </span>
                  <span>
                    {formatNumber(MAX_SERIES_ROWS)} {t('series.checkCap')}
                  </span>
                </div>
              </div>

              {check.usableCount > 0 && check.usableCount < MIN_USABLE_ROWS && (
                <p className={styles.needMore}>{t('series.needMore')}</p>
              )}

              {/* Nêu TỪNG dòng sai kèm lý do, không gộp thành một câu "dữ liệu không hợp lệ" —
                  người dùng phải dò được đúng dòng nào để sửa (cùng cách nghĩ với WF-11).
                  Xếp theo vị trí BÀY RA, nên dòng nằm cao nhất trên bảng cũng đứng đầu ở đây. */}
              {check.rows.length === 0 ? (
                <p className={styles.allGood}>{t('series.allGood')}</p>
              ) : (
                <ul className={styles.issues}>
                  {[...check.rows]
                    .sort((a, b) => soDong(a.index) - soDong(b.index))
                    .map((row) => (
                      <li key={row.index} className={styles.issue}>
                        <span className={styles.issueFlag} aria-hidden="true">
                          !
                        </span>
                        <div className={styles.issueBody}>
                          <p className={styles.issueHead}>
                            {t('series.rowLabel')} {soDong(row.index)}
                            {rows[row.index]?.date === ''
                              ? ''
                              : ` · ${rows[row.index]?.date ?? ''}`}
                          </p>
                          <p className={styles.issueText}>
                            {row.issues.map((issue) => issue.message).join(' ')}
                          </p>
                          <button
                            type="button"
                            className={styles.issueJump}
                            onClick={() => {
                              goToRow(row.index);
                            }}
                          >
                            {t('series.goToRow')} {soDong(row.index)} →
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </aside>
          </div>
        </>
      )}

      {/* Hai sheet của gói 2.5. Sheet xuất file WF-12 KHÔNG có ở đây: nó xuất kết quả một công
          thức ra PDF/PNG, còn lối ra của bảng này là CSV — nút "Tải CSV" ngay trên. */}
      <PresetSheet
        open={sheet === 'preset'}
        onClose={() => {
          setSheet(null);
        }}
        onLoad={loadPreset}
        /*
          Không truyền `spec`: màn này mở sheet để lấy CHUỖI PHIÊN GIÁ vào bảng, không tính công
          thức nào. Không có công thức thì không xếp hạng được mã, nên sheet giữ đúng hình dạng
          cũ — xem docblock `PresetSheet`.
        */
        picks={defaultPresetPicks()}
      />

      <PasteImportSheet
        open={sheet === 'paste'}
        // Bảng đang có gì thì sheet mở ra thấy nấy — cùng lý do ở màn chi tiết.
        initialRows={rows.length > 0 ? rows : undefined}
        onClose={() => {
          setSheet(null);
        }}
        onImport={importPaste}
      />
    </div>
  );
}
