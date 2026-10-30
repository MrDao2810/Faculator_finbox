'use client';

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties } from 'react';

import {
  MAX_SERIES_ROWS,
  SERIES_COLUMNS,
  displaySeriesDate,
  detectNumberStyle,
  fitToSeriesColumns,
  formatNumber,
  mergeRowsByDate,
  parseCellNumber,
  parseCells,
  splitPasteTable,
  summarizeSkipped,
} from '@/application';
import type {
  ColumnKind,
  MessageKey,
  NumberStyle,
  PasteResult,
  SeriesColumnKind,
} from '@/application';
import { useT } from '@/application/preferences-context';
import { useKhoMayTinh } from '@/ui/layout/use-kho-may-tinh';
import { BottomSheet, Button } from '@/ui/primitives';

import styles from './PasteImportSheet.module.css';
import { beNgangTenCot } from './ten-cot';

/**
 * Nhãn HIỂN THỊ của từng vai trò cột, tra theo locale. Bản gốc tiếng Việt là `COLUMN_LABELS`
 * ở Domain — ca kiểm trong i18n.test.ts giữ khoá vi khớp từng chữ với nó.
 * Từ vựng ĐOÁN cột từ header dán vào (`HEADER_WORDS`) vẫn ở Domain, không dính gì tới locale.
 *
 * Sáu nhãn cho sáu vai trò. Cột thừa (`'ignore'`) KHÔNG có nhãn ở đây: nó hiện dưới tên của chính
 * nó — xem `labels` trong component.
 */
const COLUMN_LABEL_KEYS: Readonly<Record<SeriesColumnKind, MessageKey>> = {
  date: 'paste.col.date',
  open: 'paste.col.open',
  high: 'paste.col.high',
  low: 'paste.col.low',
  close: 'paste.col.close',
  volume: 'paste.col.volume',
};

/**
 * Tên NGẮN in trên đầu cột: "Mở", "Cao", "KL"… (20/10/2026, bản vẽ của chủ dự án). Tên đầy đủ ở
 * `COLUMN_LABEL_KEYS` vẫn là tên đọc được của nút sắp xếp và của từng ô — "Mở" nghe một mình thì
 * trình đọc màn hình không nói được là mở cái gì.
 *
 * CHỈ ở khổ điện thoại (21/10/2026). Bản vẽ là ảnh chụp điện thoại, và chủ dự án: _"bản web mobile
 * nhỏ thì có thể thu gọn tiêu đề lại được như ảnh chứ web pc thì không cần tiết kiệm chữ … ghi rõ
 * lại tiêu đề 'Mở' 'Cao' 'Thấp',... là mở cái gì, cao cái gì, thấp cái gì"_. Từ 1024px đầu cột in
 * tên đầy đủ (`useKhoMayTinh`); giao diện còn lại của lưới giữ nguyên ở mọi khổ.
 */
const COLUMN_SHORT_KEYS: Readonly<Record<SeriesColumnKind, MessageKey>> = {
  date: 'paste.short.date',
  open: 'paste.short.open',
  high: 'paste.short.high',
  low: 'paste.short.low',
  close: 'paste.short.close',
  volume: 'paste.short.volume',
};

/** Chữ mờ ví dụ theo vai trò cột, chỉ đặt ở dòng đầu của một lưới còn trắng. */
const HINT_KEYS: Readonly<Partial<Record<ColumnKind, MessageKey>>> = {
  date: 'paste.egDate',
  open: 'paste.egPrice',
  high: 'paste.egPrice',
  low: 'paste.egPrice',
  close: 'paste.egPrice',
  volume: 'paste.egVolume',
};

export interface PasteImportSheetProps {
  open: boolean;
  onClose: () => void;
  /** Gọi khi người dùng bấm Nạp. Nhận nguyên kết quả đã đọc, kể cả danh sách dòng bỏ qua. */
  onImport: (result: PasteResult) => void;
  /** Trần số phiên nơi gọi giữ được. Quá trần thì sheet cắt phần CŨ NHẤT và nói ra. */
  maxRows?: number;
  /**
   * Chuỗi màn gọi ĐANG dùng. Mở sheet ra là lưới đã có sẵn nó, không phải một tấm trắng.
   *
   * Thiếu chỗ này thì màn ngoài đang chạy trên 64 phiên mà mở sheet (tên "Bảng dữ liệu" từ
   * 14/10/2026, trước là "Dán dữ liệu") lại thấy lưới rỗng:
   * người dùng không có cách nào soi lại chuỗi mình đang tính, không sửa được một ô sai, và dễ
   * đọc thành "chuỗi bay mất rồi". Sheet cũng là bảng dữ liệu của màn, không riêng cửa nhập.
   */
  initialRows?: ReadonlyArray<{
    date: string;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    volume: number | null;
  }>;
}

/**
 * Lưới mở ra với ĐỦ sáu cột, đúng hình dạng một bảng giá lịch sử.
 *
 * Bản trước chỉ mở hai cột (Ngày · Giá đóng cửa) kèm một nút "Thêm cột", lấy lý do bề ngang
 * điện thoại. Chủ dự án chốt ngược lại: mở sẵn đủ cột, và vì đã đủ nên không cần nút thêm nữa.
 * Đó cũng là hình dạng mọi nguồn (CafeF, Vietstock, investing.com) xuất ra, nên khối dán vào
 * khớp thẳng không phải sửa gì; cột nào không có dữ liệu thì để trống.
 *
 * ── 13/10/2026: sáu cột là CỐ ĐỊNH, không còn lựa chọn "Không dùng" ────────────────────────────
 *
 * Ô chọn vai trò cột từng có lựa chọn thứ bảy "Không dùng", và cột nào máy không đoán ra thì
 * cũng đội nhãn ấy. Chủ dự án khoanh nó lại: *"tạo ô không dùng là cái gì … tạo đủ dữ liệu của 6
 * cột là thôi không cần tạo gì nữa và cũng không thể tạo được thêm nữa. nếu khách nạp thừa thêm 1
 * cột dữ liệu chưa rõ tên thì cứ tạo thêm 1 cột thừa ra đó"*. Ba luật rút ra, giữ ở file này:
 *
 *   1. Lưới LUÔN có đủ sáu vai trò, mỗi vai trò ở đúng một cột. Không thao tác nào gỡ được một vai
 *      trò khỏi lưới, nên không cột số liệu nào bị bỏ lại lúc bấm Nạp.
 *   2. Từ 20/10/2026 không còn ô chọn loại cột nào (chủ dự án gạch chéo nút "Cột 6/6" và bảng của
 *      nó: _"bỏ tính năng mở cột này đi"_). Cột đứng đúng thứ tự `SERIES_COLUMNS`, nên cột Ngày luôn
 *      là cột đầu — CSS dựa vào đó để giữ nó đứng yên khi cuộn ngang.
 *   3. Dữ liệu đưa vào có thừa cột thì cột ấy đứng thêm ở cuối lưới, dưới tên của chính nó trong
 *      dòng tiêu đề đã dán (`fitToSeriesColumns()` ở Domain). Nó không được nạp đi đâu: một phiên
 *      giá chỉ có sáu trường.
 *
 * Cái giá của luật 2, đã nói với chủ dự án trước khi bỏ: máy đoán sai vai trò một cột của file
 * (ba cột số không tiêu đề, hay cột "KLGD") thì không còn chỗ sửa trên lưới — phải sửa file rồi dán lại.
 */
const DEFAULT_COLUMNS: ReadonlyArray<ColumnKind> = SERIES_COLUMNS;

/** Số dòng trống mở sẵn: đủ để nhìn ra đây là bảng gõ được, chưa dài tới mức phải cuộn. */
const BLANK_ROWS = 4;

/**
 * Chiều cao một dòng lưới, tính bằng px, ở MỌI khổ màn.
 *
 * Con số này là thứ duy nhất cho phép chỉ vẽ phần dòng đang nhìn thấy: biết chiều cao một dòng
 * thì biết dòng thứ mấy đang ở mép trên, và hai ô đệm trên dưới lo phần còn lại. CSS không tự khai
 * chiều cao dòng: nó đọc `--paste-row-h`, biến mà component đặt lên `<table>` từ chính hằng này,
 * nên hai bên không thể lệch nhau — lệch là thanh cuộn trượt khỏi dữ liệu.
 *
 * 32px ở cả điện thoại từ 20/10/2026 (bản vẽ của chủ dự án: dòng sọc, chữ 14px). Trước đó dưới 1024px
 * là 44px để chạm, và một `matchMedia` chọn giữa hai con số; nay một con số thì không cần nó nữa.
 */
const ROW_H = 32;

/** Vẽ dư vài dòng ngoài tầm nhìn, để cuộn nhanh không thấy khoảng trắng. */
const OVERSCAN = 4;

/**
 * Số dòng ít nhất luôn được vẽ, kể cả khi chưa đo được chiều cao khung.
 *
 * Trong jsdom mọi kích thước đọc ra đều là 0, nên không có mức sàn này thì lưới vẽ ra rỗng và
 * mọi ca kiểm giao diện đều mù. Trong trình duyệt thật nó không bao giờ có tác dụng.
 */
const MIN_RENDERED = 12;

/* ── Lưới ô ────────────────────────────────────────────────────────────────── */

function blankRow(width: number): string[] {
  return Array.from({ length: width }, () => '');
}

function blankGrid(width: number, height: number): string[][] {
  return Array.from({ length: height }, () => blankRow(width));
}

function isBlank(grid: ReadonlyArray<ReadonlyArray<string>>): boolean {
  return grid.every((row) => row.every((cell) => cell.trim() === ''));
}

/** Mã của một ô trong lưới, để phím Enter nhảy xuống đúng ô dưới. */
function cellId(base: string, row: number, column: number): string {
  return `${base}-${row}-${column}`;
}

/* ── Ngày trong ô ──────────────────────────────────────────────────────────── */

const NGAY_DU = /^\s*(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\s*$/;
const NGAY_ISO = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})(?:$|[T\s])/;
const NGAY_THIEU_NAM = /^\s*(\d{1,2})[/.-](\d{1,2})\s*$/;

/** Ngày, tháng, năm của một ô ngày ghi đủ năm (kiểu Việt hay ISO); `null` nếu ô không như thế. */
function tachNgay(text: string): { ngay: number; thang: number; nam: number } | null {
  const viet = NGAY_DU.exec(text);
  if (viet !== null) return { ngay: Number(viet[1]), thang: Number(viet[2]), nam: Number(viet[3]) };
  const iso = NGAY_ISO.exec(text);
  if (iso !== null) return { ngay: Number(iso[3]), thang: Number(iso[2]), nam: Number(iso[1]) };
  return null;
}

/**
 * Chữ in trong ô ngày khi ô KHÔNG đang được sửa.
 *
 * Điện thoại: chỉ ngày/tháng (20/10/2026). Chủ dự án: _"bên trên ghi năm rồi thì bên dưới trong bảng
 * chỉ cần ghi ngày tháng là tự biết → tiết kiệm không gian bảng"_. Từ 1024px (`duNam`): đủ
 * ngày/tháng/năm (21/10/2026) — chủ dự án: _"dữ liệu xuất hiện ở trong bảng ở web pc thì cần hiển thị
 * đầy đủ, ví dụ như ngày: cần hiện rõ ngày tháng năm"_. Cả hai cùng một lối viết dd/mm, nên ngày dán
 * kiểu ISO cũng in thành '08/09/2026' trên máy tính.
 *
 * Chỉ là cách IN: giá trị của ô vẫn đủ năm, nên bấm vào ô là thấy lại cả ngày để sửa, và thứ được nạp
 * không đổi. Ô không mang đủ năm ('15/07', chữ gõ dở) in đúng như đang gõ.
 */
function ngayIn(text: string, duNam: boolean): string {
  const ngay = tachNgay(text);
  if (ngay === null) return text;
  const ngayThang = `${String(ngay.ngay).padStart(2, '0')}/${String(ngay.thang).padStart(2, '0')}`;
  return duNam ? `${ngayThang}/${String(ngay.nam)}` : ngayThang;
}

/**
 * Khoá sắp xếp của một ô ngày: năm·tháng·ngày ghép thành một số; ngày thiếu năm chỉ còn tháng·ngày.
 *
 * Tháng ngoài 1–12 hay ngày ngoài 1–31 là ô hỏng, xếp CUỐI như ô trống: không chặn thì '28/13/2026'
 * thành khoá lớn nhất và đứng đầu bảng như phiên mới nhất.
 */
function khoaNgay(text: string): number | null {
  const ngay = tachNgay(text);
  const tach =
    ngay ??
    ((thieu) =>
      thieu === null ? null : { ngay: Number(thieu[1]), thang: Number(thieu[2]), nam: 0 })(
      NGAY_THIEU_NAM.exec(text),
    );
  if (tach === null || tach.thang < 1 || tach.thang > 12 || tach.ngay < 1 || tach.ngay > 31)
    return null;
  return tach.nam * 10_000 + tach.thang * 100 + tach.ngay;
}

/* ── Sắp xếp ───────────────────────────────────────────────────────────────── */

type ChieuSapXep = 'giam' | 'tang';

/**
 * Bảng đang xếp theo cột nào, chiều nào, và THỨ TỰ DÒNG chốt lúc bấm.
 *
 * Thứ tự chốt một lần chứ không tính lại mỗi lần lưới đổi: đang xếp theo Giá đóng cửa mà gõ sửa một
 * ô giá đóng cửa thì dòng ấy không được nhảy đi chỗ khác dưới ngón tay. Bấm lại tên cột thì xếp lại.
 */
interface SapXep {
  cot: number;
  chieu: ChieuSapXep;
  thuTu: ReadonlyArray<number>;
}

/**
 * Thứ tự dòng của lưới khi xếp theo một cột (20/10/2026 — dấu ˅ cạnh tên cột trong bản vẽ của chủ
 * dự án là nút sắp xếp: _"dấu v đó là icon sắp xếp bảng. cần thêm vào cho tôi"_).
 *
 * Chỉ đổi thứ tự BÀY RA. Lưới và thứ được nạp giữ nguyên thứ tự gốc — bộ đọc vẫn tự xếp phiên theo
 * ngày như trước, nên xếp bảng không làm đổi một con số nào. Số thứ tự in ở cột đầu thì đếm theo màn
 * (`GridRow.number`), xem `soTrenMan`.
 *
 * Ô trống hay không đọc được đứng CUỐI ở cả hai chiều, cùng luật với bảng Mã của Danh mục: coi nó là 0
 * thì nó chen vào giữa như một con số có thật (FR-06). Hai ô bằng nhau giữ thứ tự gốc.
 */
function thuTuSapXep(
  grid: ReadonlyArray<ReadonlyArray<string>>,
  cot: number,
  laNgay: boolean,
  chieu: ChieuSapXep,
  style: NumberStyle,
): number[] {
  const khoa = grid.map((row) => {
    const cell = row[cot] ?? '';
    return laNgay ? khoaNgay(cell) : parseCellNumber(cell, style);
  });
  return grid
    .map((_, index) => index)
    .sort((a, b) => {
      const ka = khoa[a] ?? null;
      const kb = khoa[b] ?? null;
      if (ka === null || kb === null) return ka === kb ? a - b : ka === null ? 1 : -1;
      if (ka === kb) return a - b;
      return chieu === 'tang' ? ka - kb : kb - ka;
    });
}

/**
 * Thứ tự MẶC ĐỊNH của lưới: phiên mới nhất lên đầu (20/10/2026). Chủ dự án nhìn ba dòng đầu là
 * tháng 9/2025 trong khi chuỗi chạy tới tháng 9/2026: _"thời gian gần nhất thì cần xếp lên đầu thay vì
 * để xuống cuối bảng"_. Chuỗi trong lưới (và thứ được nạp) vẫn xếp cũ trước như bộ đọc cần — chỉ thứ tự
 * BÀY RA đổi, cùng cơ chế với nút sắp xếp, và cột Ngày mang dấu đang xếp ngay từ đầu.
 *
 * Tính lại mỗi lần lưới được THAY (mở sheet, dán, tải file, Xoá hết); trong lúc gõ thì chốt, như mọi
 * thứ tự khác. Không có cột ngày thì giữ thứ tự gốc.
 */
function sapMacDinh(
  grid: ReadonlyArray<ReadonlyArray<string>>,
  columns: ReadonlyArray<ColumnKind>,
): SapXep | null {
  const cot = columns.indexOf('date');
  if (cot < 0) return null;
  // Cột ngày không cần quy ước số — 'vi' chỉ để đủ tham số.
  return { cot, chieu: 'giam', thuTu: thuTuSapXep(grid, cot, true, 'giam', 'vi') };
}

/** Dấu ˅ cạnh tên cột. Đang xếp tăng dần thì lật lên thành ˄. */
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

/**
 * Viết một chuỗi đang dùng ra thành các ô của lưới.
 *
 * Số ra dạng người Việt đọc (`formatNumber`: chấm ngăn nghìn, phẩy thập phân) chứ không phải
 * `String(n)` — lưới là chỗ người dùng ĐỌC và SỬA, nên nó phải giống hệt thứ họ tự gõ vào.
 * Vì chính chỗ này viết ra, quy ước số là điều CHẮC CHẮN, không phải điều phải đoán: nơi gọi
 * chốt luôn `style = 'vi'` để sheet khỏi hỏi lại người dùng về số của chính nó.
 *
 * Ngày cũng vậy (13/10/2026): chuỗi của bộ mẫu mang ISO ('2026-09-08'), còn người dùng gõ và mọi
 * chỗ khác của sản phẩm in ngày/tháng/năm. `displaySeriesDate()` đưa ngày đủ năm về lối ấy và để
 * nguyên thứ không phải ngày.
 */
function cellsFromRows(
  rows: NonNullable<PasteImportSheetProps['initialRows']>,
): ReadonlyArray<string[]> {
  const text = (value: number | null): string => (value === null ? '' : formatNumber(value));
  return rows.map((row) => [
    displaySeriesDate(row.date),
    text(row.open),
    text(row.high),
    text(row.low),
    text(row.close),
    text(row.volume),
  ]);
}

/**
 * Dấu báo lỗi đứng trước nội dung ô hỏng.
 *
 * Hình vẽ chứ không phải màu: NFR-USA-06 đòi mọi trạng thái đọc được khi không phân biệt màu,
 * mà một ô tô đỏ thì chỉ có màu để nói.
 */
function BadMark() {
  return (
    <svg
      className={styles.badMark}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6" />
      <path d="M12 16.5v.5" />
    </svg>
  );
}

/**
 * Một dòng của lưới.
 *
 * `memo` ở đây không phải tối ưu sớm: lưới vẽ dòng theo cửa sổ đang nhìn, nhưng trong cửa sổ ấy
 * mỗi phím gõ vẫn có thể vẽ lại mọi dòng nếu không chặn. `setCell` chỉ chép lại ĐÚNG dòng vừa
 * đổi nên các dòng khác giữ nguyên tham chiếu mảng — vì vậy hai hàm truyền xuống đây bắt buộc
 * phải ổn định (`useCallback`).
 */
const GridRow = memo(function GridRow({
  base,
  line,
  number,
  below,
  stripe,
  cells,
  labels,
  numeric,
  cellClasses,
  dateColumn,
  fullDate,
  closeColumn,
  closeTrend,
  rowWord,
  hints,
  badColumn,
  emptyMark,
  onCell,
  onBlock,
}: {
  base: string;
  /** Chỉ số dòng trong LƯỚI (đếm từ 0) — mã của ô và chỗ `onCell` ghi vào. */
  line: number;
  /**
   * Số thứ tự IN RA ở cột đầu và trong tên đọc được của ô ("Giá đóng cửa, Dòng 3"): vị trí trên màn,
   * đếm từ 1 ở dòng trên cùng — xem `soTrenMan`.
   */
  number: number;
  /**
   * Dòng lưới đang bày NGAY DƯỚI dòng này, để Enter nhảy xuống đúng ô bên dưới trên màn — khi bảng
   * đang sắp xếp, đó không còn là `line + 1`.
   */
  below: number | undefined;
  /** Dòng sọc của bản vẽ: tính theo vị trí BÀY RA, nên sọc vẫn xen kẽ khi bảng đang sắp xếp. */
  stripe: boolean;
  cells: ReadonlyArray<string>;
  labels: ReadonlyArray<string>;
  /** Cột nào là số — bật bàn phím số trên điện thoại. Cột ngày thì không, vì còn gõ dấu gạch. */
  numeric: ReadonlyArray<boolean>;
  /** Lớp của từng ô theo vai trò cột (ngày, khối lượng…), dựng một lần cho cả lưới. */
  cellClasses: ReadonlyArray<string | undefined>;
  /** Cột Ngày — ô này in theo `ngayIn` khi không đang sửa. `-1` nếu không có. */
  dateColumn: number;
  /** Từ 1024px: ô ngày in đủ ngày/tháng/năm thay vì ngày/tháng — xem `ngayIn`. */
  fullDate: boolean;
  closeColumn: number;
  /** Giá đóng cửa so với giá mở cửa của chính phiên này; `undefined` khi thiếu một trong hai. */
  closeTrend: ChieuSapXep | undefined;
  /** Chữ "Dòng" theo locale, để tên đọc được của ô là 'Giá đóng cửa, Dòng 3'. */
  rowWord: string;
  /** Chữ mờ ví dụ; mảng rỗng với mọi dòng trừ dòng đầu của một lưới còn trắng. */
  hints: ReadonlyArray<string>;
  /** Cột đang hỏng của chính dòng này, hoặc `-1` nếu dòng không hỏng. */
  badColumn: number;
  /** Chữ mờ cho ô còn trống giữa một dòng đã có dữ liệu. */
  emptyMark: string;
  onCell: (row: number, column: number, value: string) => void;
  onBlock: (text: string, row: number, column: number) => boolean;
}) {
  const bad = badColumn >= 0;
  /** Ô đang được sửa của dòng này — ô ngày ấy in đủ năm để sửa được. */
  const [editing, setEditing] = useState(-1);

  const rowClass = [stripe ? styles.rowStripe : '', bad ? styles.rowBad : '']
    .filter((name) => name !== '')
    .join(' ');

  return (
    <tr className={rowClass === '' ? undefined : rowClass} style={{ height: `${ROW_H}px` }}>
      <th scope="row" className={bad ? `${styles.lineNo} ${styles.lineNoBad}` : styles.lineNo}>
        {number}
      </th>
      {cells.map((value, column) => {
        const here = column === badColumn;
        const shown = column === dateColumn && editing !== column ? ngayIn(value, fullDate) : value;
        const tdClass = [cellClasses[column] ?? '', here ? styles.cellBad : '']
          .filter((name) => name !== '')
          .join(' ');
        return (
          <td
            key={column}
            className={tdClass === '' ? undefined : tdClass}
            data-xu-huong={column === closeColumn ? closeTrend : undefined}
          >
            {here && <BadMark />}
            <input
              id={cellId(base, line, column)}
              className={styles.cell}
              type="text"
              inputMode={numeric[column] === true ? 'decimal' : undefined}
              autoComplete="off"
              spellCheck={false}
              aria-label={`${labels[column] ?? ''}, ${rowWord} ${String(number)}`}
              aria-invalid={here ? true : undefined}
              placeholder={hints[column] ?? emptyMark}
              value={shown}
              onFocus={() => {
                setEditing(column);
              }}
              onBlur={() => {
                setEditing(-1);
              }}
              onChange={(event) => {
                onCell(line, column, event.target.value);
              }}
              onPaste={(event) => {
                const text = event.clipboardData.getData('text/plain');
                if (text !== '' && onBlock(text, line, column)) event.preventDefault();
              }}
              onKeyDown={(event) => {
                // Enter đi xuống ô dưới như bảng tính; Tab sang ngang là sẵn của trình duyệt.
                if (event.key !== 'Enter' || below === undefined) return;
                event.preventDefault();
                const next = document.getElementById(cellId(base, below, column));
                if (next instanceof HTMLInputElement) next.focus();
              }}
            />
          </td>
        );
      })}
    </tr>
  );
});

/**
 * Sheet dán dữ liệu từ Excel / CSV — gói WBS 2.5.2, màn WF-11.
 *
 * FR-11 · SW-03. Đây là cơ chế giữ được Beta, Sharpe, Sortino, MaxDD và VaR trong bản đầu
 * dù chưa có nguồn giá thời gian thực (FR-12).
 *
 * ── Đợt 22/09/2026: ba lượt trong một ngày ────────────────────────────────────────────
 *
 * Lượt một sửa phân luồng cột và chặn bốn chỗ cho ra số sai. Lượt hai bỏ ô văn bản tự do —
 * nó bắt người dùng tự gõ dấu ngăn cột, và hai dòng chỉ dẫn đắp lên để bù thì "quá quê mùa,
 * lạc hậu". Lượt ba là bản thiết kế chủ dự án vẽ ra, và nó đổi bốn thứ:
 *
 *   1. **Popup nổi giữa màn ở khổ PC** thay vì tấm dán đáy. Lưới sáu cột cần bề ngang, mà tấm
 *      dán đáy thì càng rộng càng xa tầm mắt đang nhìn giữa màn.
 *   2. **Chỉ vẽ phần dòng đang nhìn thấy.** Dán 251 phiên sáu cột là 1.506 ô `<input>` — vẽ hết
 *      thì máy yếu đứng hình. Thanh cuộn vẫn dài đúng bằng cả chuỗi, nhờ hai dòng đệm.
 *   3. **Lỗi chỉ đúng Ô, không chỉ đúng dòng.** Ô hỏng tô đỏ kèm dấu báo, dòng hỏng đổi nền, và
 *      nút "Xem" nhảy thẳng tới dòng hỏng đầu tiên. Nói "dòng 7 hỏng" thì còn phải dò sáu ô.
 *   4. **Bỏ dòng lỗi là một quyết định có ý thức**: ô đánh dấu ở chân sheet, chưa tích thì chưa
 *      nạp được. Lặng lẽ vứt ba dòng rồi báo "✓ 248 phiên" đúng là thứ FR-06 tồn tại để chặn.
 *
 * Phần đọc dữ liệu vẫn nằm trọn ở Domain (`parseCells`), nên bốn cơ chế chặn số sai của lượt
 * một không đổi một dòng nào mà vẫn chạy cho cả lối gõ tay lẫn lối dán.
 */
export function PasteImportSheet({
  open,
  onClose,
  onImport,
  maxRows = MAX_SERIES_ROWS,
  initialRows,
}: PasteImportSheetProps) {
  const base = useId();
  const t = useT();

  const [columns, setColumns] = useState<ColumnKind[]>([...DEFAULT_COLUMNS]);
  /**
   * Tên từng cột trong dữ liệu đã dán, song song với `columns`; rỗng khi cột không có tiêu đề.
   * Chỉ cột thừa mới in tên này lên màn — sáu cột kia mang nhãn của sản phẩm.
   */
  const [names, setNames] = useState<string[]>(() => blankRow(DEFAULT_COLUMNS.length));
  const [grid, setGrid] = useState<string[][]>(() => blankGrid(DEFAULT_COLUMNS.length, BLANK_ROWS));
  /** Người dùng chốt cách đọc số khi máy phải đoán. `null` nghĩa là theo máy. */
  const [style, setStyle] = useState<NumberStyle | null>(null);
  /** Phần bị bỏ ngay lúc dán: dòng ghi chú đầu file, và phần vượt trần. */
  const [dropped, setDropped] = useState({ preamble: 0, truncated: 0 });
  /** Người dùng đã đồng ý bỏ các dòng lỗi chưa. */
  const [skipBad, setSkipBad] = useState(false);
  /** Cửa sổ dòng đang nhìn thấy, đo bằng px trên khung cuộn. */
  const [view, setView] = useState({ top: 0, height: ROW_H * 10 });
  /** Cột đang sắp xếp — mặc định Ngày giảm dần (`sapMacDinh`); `null` là thứ tự gốc. */
  const [sapXep, setSapXep] = useState<SapXep | null>(() =>
    sapMacDinh(blankGrid(DEFAULT_COLUMNS.length, BLANK_ROWS), DEFAULT_COLUMNS),
  );
  /** Bề ngang trong của khung lưới, và mức sàn bề ngang của bảng đọc ra px — xem `widths`. */
  const [frameWidth, setFrameWidth] = useState(0);
  const [floorWidth, setFloorWidth] = useState(0);
  const table = useRef<HTMLTableElement>(null);
  /** Từ 1024px đầu cột in tên đầy đủ thay cho tên ngắn — xem `COLUMN_SHORT_KEYS`. */
  const mayTinh = useKhoMayTinh();

  const scroller = useRef<HTMLDivElement>(null);

  /*
   * Hai hàm truyền xuống `GridRow` phải ổn định để `memo` có tác dụng, nhưng chúng lại cần
   * trạng thái mới nhất. Giữ trạng thái trong một ref là cách rẻ nhất có cả hai.
   */
  const latest = useRef<{
    grid: string[][];
    columns: ColumnKind[];
    names: string[];
    order: ReadonlyArray<number> | null;
    style: NumberStyle | null;
  }>({ grid, columns, names, order: null, style: null });

  const parsed = useMemo(
    () => parseCells(grid, columns, style ?? undefined),
    [grid, columns, style],
  );

  /*
   * Trần số phiên nơi gọi giữ được. Khối dán đã bị cắt ngay lúc dán, nên chỗ này chỉ còn là
   * lưới chắn cho trường hợp gõ tay vượt trần — vẫn cắt phần CŨ NHẤT và vẫn phải nói ra.
   */
  const result = useMemo<PasteResult>(() => {
    const extra = Math.max(0, parsed.rows.length - maxRows);
    return {
      ...parsed,
      rows: extra > 0 ? parsed.rows.slice(-maxRows) : parsed.rows,
      preamble: dropped.preamble,
      truncated: dropped.truncated + extra,
    };
  }, [parsed, dropped, maxRows]);

  /** Dòng lưới nào hỏng, và hỏng ở cột nào. Khoá là chỉ số dòng đếm từ 0. */
  const badRows = useMemo(() => {
    const map = new Map<number, number>();
    for (const row of result.skipped) {
      const column = row.column === undefined ? -1 : columns.indexOf(row.column);
      map.set(row.line - 1, column);
    }
    return map;
  }, [result.skipped, columns]);

  /** Chỉ số dòng hỏng đầu tiên, để nút "Xem" nhảy tới. */
  const firstBad = useMemo(() => {
    let found = -1;
    for (const line of badRows.keys()) if (found === -1 || line < found) found = line;
    return found;
  }, [badRows]);

  /**
   * Nhãn ngắn cho thanh trạng thái: '3 dòng sai ngày'.
   * Nhiều loại lỗi khác nhau thì không gộp thành một câu sai — nói chung chung là 'dòng lỗi'.
   */
  const badLabel = useMemo(() => {
    const kinds = new Set(result.skipped.map((row) => row.short));
    return kinds.size === 1 ? [...kinds][0] : undefined;
  }, [result.skipped]);

  const hasInput = !isBlank(grid);
  const badCount = result.skipped.length;
  const canImport = result.rows.length > 0 && (badCount === 0 || skipBad);
  /** Quy ước số đang dùng để đọc ô: người dùng chốt, hoặc bộ đọc tự đoán. */
  const numberStyle = style ?? parsed.numberStyle;

  /**
   * Năm của chuỗi, in trên lưới thay cho phần năm của từng ô ngày (20/10/2026, bản vẽ của chủ dự án:
   * "Năm 2025"). Đọc từ các phiên ĐÃ ĐỌC ĐƯỢC, nên một ô gõ nhầm năm 2062 không kéo dãn khoảng năm.
   * Chuỗi trải hai năm trở lên thì in khoảng; không phiên nào ghi đủ năm thì không in gì.
   */
  const yearNote = useMemo(() => {
    let tu = Number.POSITIVE_INFINITY;
    let den = Number.NEGATIVE_INFINITY;
    for (const row of result.rows) {
      const ngay = tachNgay(row.date);
      if (ngay === null) continue;
      tu = Math.min(tu, ngay.nam);
      den = Math.max(den, ngay.nam);
    }
    if (!Number.isFinite(tu)) return null;
    return tu === den
      ? t('paste.yearOne').replace('{nam}', String(tu))
      : t('paste.yearRange').replace('{tu}', String(tu)).replace('{den}', String(den));
  }, [result.rows, t]);

  /** Ô số đầu tiên đọc được, để bày hai cách đọc khi quy ước số còn mập mờ. */
  const styleSample = useMemo(() => {
    for (const row of grid) {
      for (const cell of row) {
        if (/^\s*-?\d+[.,]\d+\s*$/.test(cell)) return cell.trim();
      }
    }
    return null;
  }, [grid]);

  const rowWord = t('paste.rowNo');
  const emptyMark = t('paste.emptyCell');
  const columnWord = t('paste.column');
  /*
   * Tên đứng trên đầu từng cột. Sáu cột của chuỗi giá mang nhãn của sản phẩm; cột thừa mang tên
   * của chính nó trong dòng tiêu đề đã dán, và khi dữ liệu không có tiêu đề thì chỉ còn số thứ
   * tự ('Cột 7'). Không có nhãn chung nào kiểu "Không dùng" — xem docblock `DEFAULT_COLUMNS`.
   */
  const labels = useMemo(
    () =>
      columns.map((kind, index) => {
        if (kind !== 'ignore') return t(COLUMN_LABEL_KEYS[kind]);
        const own = names[index] ?? '';
        return own === '' ? `${columnWord} ${index + 1}` : own;
      }),
    [columns, names, columnWord, t],
  );
  // Cột thừa có thể là chữ (ghi chú, tên sàn), nên không ép bàn phím số cho nó.
  const numeric = useMemo(
    () => columns.map((kind) => kind !== 'date' && kind !== 'ignore'),
    [columns],
  );
  const hints = useMemo(
    () =>
      columns.map((kind) => {
        const key = HINT_KEYS[kind];
        return key === undefined ? '' : t(key);
      }),
    [columns, t],
  );

  const dateColumn = columns.indexOf('date');
  const openColumn = columns.indexOf('open');
  const closeColumn = columns.indexOf('close');
  /*
   * Màu chữ theo vai trò cột, đo trên bản vẽ 20/10/2026: số giá đậm nhất, ngày và khối lượng nhạt một
   * bậc. Dựng một lần cho cả lưới để `GridRow` (memo) không vẽ lại vì một mảng mới mỗi lần gõ.
   */
  const cellClasses = useMemo(
    () =>
      columns.map((kind) =>
        kind === 'date'
          ? styles.tdDate
          : kind === 'volume' || kind === 'ignore'
            ? styles.tdSoft
            : undefined,
      ),
    [columns],
  );

  /**
   * Bề ngang từng cột, tính bằng `ch` theo chữ DÀI NHẤT cột ấy đang in — cả lưới, không riêng phần
   * dòng đang vẽ, nên cuộn dọc không làm cột nhảy (`table-layout: fixed`).
   *
   * Chủ dự án (20/10/2026): _"nếu width không đủ để hiển thị số liệu thì có thể scroll ngang"_. Khung
   * rộng hơn tổng này thì bảng giãn ra lấp khung; hẹp hơn thì khung cuộn ngang, trang không tràn. Cột
   * ngày tính theo chữ `ngayIn` in ra (ngày/tháng ở điện thoại, đủ năm từ 1024px), vì đó là thứ đứng
   * trong ô lúc không sửa. Mức sàn là tên cột cộng dấu ˅ (hai `ch`), để tên không bị cắt.
   */
  const widths = useMemo(
    () =>
      columns.map((kind, column) => {
        const head =
          kind === 'ignore' || mayTinh ? (labels[column] ?? '') : t(COLUMN_SHORT_KEYS[kind]);
        // Tên cột in đậm 12px không rộng đúng một `ch` mỗi ký tự — xem `beNgangTenCot`.
        let longest = beNgangTenCot(head);
        for (const row of grid) {
          const cell = row[column] ?? '';
          const text = column === dateColumn ? ngayIn(cell, mayTinh) : cell.trim();
          longest = Math.max(longest, text.length);
        }
        if (!hasInput) longest = Math.max(longest, (hints[column] ?? '').length);
        return Math.min(longest, 16);
      }),
    [columns, labels, grid, dateColumn, hasInput, hints, mayTinh, t],
  );
  const widthSum = widths.reduce((sum, width) => sum + width, 0);

  /*
   * Mức sàn của bảng (`min-width`, tính bằng `ch`) đọc ra px sau khi vẽ, để chia phần bề ngang DƯ.
   *
   * Khung rộng hơn mức sàn thì bảng phải giãn lấp khung, nhưng `table-layout: fixed` tự chia phần dư
   * theo tỷ lệ cho MỌI cột — đo ở 1440px: cột số dòng 32 → 68px, ô số đứng xa hẳn ngày của nó. Nên
   * phần dư được chia ở đây, chỉ cho các cột số liệu, theo tỷ lệ bề ngang của chúng. Khung hẹp hơn mức
   * sàn thì không có gì để chia, và khung cuộn ngang.
   *
   * Đo lại mỗi khi bảng đổi cỡ và khi phông chữ tải xong, không chỉ khi số cột hay chữ dài nhất đổi:
   * `ch` là bề ngang chữ "0" của phông ĐANG DÙNG. Đo một lần lúc mở thì đo trên phông thay thế — lần
   * đo đầu ở 1440px ra 430px trong khi mức sàn thật là 460px, và bảng tràn khung đúng 30px ấy.
   */
  useLayoutEffect(() => {
    const node = table.current;
    if (node === null) return undefined;
    const doSan = (): void => {
      const floor = Number.parseFloat(getComputedStyle(node).minWidth);
      setFloorWidth(Number.isFinite(floor) ? floor : 0);
    };
    doSan();
    let conHieuLuc = true;
    // jsdom không có `document.fonts`.
    if ('fonts' in document) {
      void document.fonts.ready.then(() => {
        if (conHieuLuc) doSan();
      });
    }
    if (typeof ResizeObserver !== 'function') {
      return () => {
        conHieuLuc = false;
      };
    }
    const observer = new ResizeObserver(doSan);
    observer.observe(node);
    return () => {
      conHieuLuc = false;
      observer.disconnect();
    };
  }, [open, widthSum, columns.length]);
  const spare = floorWidth > 0 && frameWidth > floorWidth ? frameWidth - floorWidth : 0;
  /** Bề ngang một cột: chữ dài nhất + đệm hai bên + phần dư chia cho nó (làm tròn xuống, khỏi tràn 1px). */
  const colWidth = (width: number): string => {
    const share = widthSum > 0 ? Math.floor((spare * width) / widthSum) : 0;
    return share > 0
      ? `calc(${String(width)}ch + 1rem + ${String(share)}px)`
      : `calc(${String(width)}ch + 1rem)`;
  };

  /** Thứ tự BÀY RA: vị trí trên màn → chỉ số dòng trong lưới. `null` là thứ tự gốc. */
  const order = useMemo(() => {
    if (sapXep === null) return null;
    const list = sapXep.thuTu.filter((index) => index < grid.length);
    // Dòng sinh ra sau lúc bấm (gõ vào dòng cuối mở thêm dòng) đứng cuối, theo thứ tự sinh.
    for (let index = sapXep.thuTu.length; index < grid.length; index += 1) list.push(index);
    return list;
  }, [sapXep, grid.length]);
  const lineAt = (position: number): number =>
    order === null ? position : (order[position] ?? position);
  latest.current = { grid, columns, names, order, style };

  /**
   * Số thứ tự TRÊN MÀN (đếm từ 1) của một dòng lưới. Chủ dự án (20/10/2026, lượt ba): _"sao số thứ tự 1
   * mà lại là ngày 12/09/2025 ? mà không phải là 15/09/2026"_ — bảng đã bày mới nhất lên đầu mà cột số
   * thứ tự vẫn đếm theo thứ tự gốc, nên dòng trên cùng mang số 250. Nay số đi theo màn: 1 ở trên cùng,
   * với mọi kiểu sắp xếp. Câu báo dòng lỗi ("dòng 3") dùng cùng số này, nên nó chỉ đúng dòng đang thấy.
   */
  const soTrenMan = useMemo(() => {
    if (order === null) return (line: number): number => line + 1;
    const viTri = new Map(order.map((line, position) => [line, position]));
    return (line: number): number => (viTri.get(line) ?? line) + 1;
  }, [order]);

  /** Danh sách dòng bỏ qua kèm số dòng TRÊN MÀN, đúng khuôn WF-11 — đọc được mà không phải cuộn lưới. */
  const problems = useMemo(
    () =>
      summarizeSkipped(
        result.skipped
          .map((row) => ({ ...row, line: soTrenMan(row.line - 1) }))
          .sort((a, b) => a.line - b.line),
      ),
    [result.skipped, soTrenMan],
  );
  /**
   * Giá đóng cửa so với giá mở cửa của CHÍNH phiên ấy — màu chữ cột Đóng trong bản vẽ 20/10/2026: xanh
   * khi đóng ≥ mở, cam khi đóng < mở. Luật đọc ra từ số trong bản vẽ: phiên 19/09 mở 101,7 đóng 102,1
   * được tô xanh dù thấp hơn phiên trước, nên mốc so là giá mở, không phải phiên trước.
   *
   * Màu chỉ là dấu phụ: con số đã nói đủ (NFR-USA-06). Thiếu một trong hai giá thì không tô.
   */
  const trendOf = (row: ReadonlyArray<string>): ChieuSapXep | undefined => {
    const mo = parseCellNumber(row[openColumn] ?? '', numberStyle);
    const dong = parseCellNumber(row[closeColumn] ?? '', numberStyle);
    if (mo === null || dong === null) return undefined;
    return dong >= mo ? 'tang' : 'giam';
  };

  /**
   * Bấm tên cột: lần đầu xếp GIẢM dần (số lớn nhất lên trên — như bảng Mã của Danh mục), lần hai đảo
   * chiều, lần ba về MẶC ĐỊNH, tức ngày mới nhất lên đầu (`sapMacDinh`). Cột Ngày đã giảm dần sẵn nên
   * bấm nó chỉ đảo qua lại giữa cũ trước và mới trước — như cột Ngày lưu của bảng Công thức ở Danh mục.
   * Cột thừa không xếp: nó không phải số liệu được nạp.
   */
  function bamSapXep(column: number) {
    const kind = columns[column];
    if (kind === undefined || kind === 'ignore') return;
    const dangXep = sapXep?.cot === column ? sapXep.chieu : null;
    const chieu: ChieuSapXep | null =
      kind === 'date'
        ? dangXep === 'giam'
          ? 'tang'
          : 'giam'
        : dangXep === null
          ? 'giam'
          : dangXep === 'giam'
            ? 'tang'
            : null;
    setSapXep(
      chieu === null
        ? sapMacDinh(grid, columns)
        : {
            cot: column,
            chieu,
            thuTu: thuTuSapXep(grid, column, kind === 'date', chieu, numberStyle),
          },
    );
    if (scroller.current !== null) scroller.current.scrollTop = 0;
    setView((current) => ({ ...current, top: 0 }));
  }

  /* ── Cửa sổ dòng đang vẽ ─────────────────────────────────────────────── */

  const total = grid.length;
  const rendered = Math.max(MIN_RENDERED, Math.ceil(view.height / ROW_H) + OVERSCAN * 2);
  const from = Math.max(0, Math.floor(view.top / ROW_H) - OVERSCAN);
  const to = Math.min(total, from + rendered);

  const measure = useCallback((node: HTMLDivElement | null) => {
    scroller.current = node;
    if (node !== null && node.clientHeight > 0) {
      setView((current) =>
        current.height === node.clientHeight ? current : { ...current, height: node.clientHeight },
      );
    }
  }, []);

  /*
   * Đổ chuỗi màn ngoài đang dùng vào lưới, một lần mỗi lần mở.
   *
   * `primed` chứ không phải chỉ dựa vào `open`: sau lần đổ đầu, người dùng sửa ô nào thì sửa —
   * hiệu ứng này không được chạy lại và xoá công của họ. Đóng sheet thì `reset()` dọn lưới và
   * cờ này hạ xuống, nên lần mở sau lại thấy đúng chuỗi đang dùng lúc ấy.
   */
  const [primed, setPrimed] = useState(false);
  useEffect(() => {
    if (!open) {
      setPrimed(false);
      return;
    }
    if (primed) return;
    setPrimed(true);
    if (initialRows === undefined || initialRows.length === 0) return;

    const cells = cellsFromRows(initialRows.slice(-maxRows));
    const filled = [...cells.map((row) => [...row]), blankRow(DEFAULT_COLUMNS.length)];
    setColumns([...DEFAULT_COLUMNS]);
    setNames(blankRow(DEFAULT_COLUMNS.length));
    setGrid(filled);
    setStyle('vi');
    setSapXep(sapMacDinh(filled, DEFAULT_COLUMNS));
  }, [open, primed, initialRows, maxRows]);

  /*
   * Đo lại ngay sau khi tấm mở ra, và mỗi lần khung lưới đổi chiều cao trong lúc mở.
   *
   * Lúc ref gắn vào thì `<dialog>` còn đóng, chiều cao đọc ra bằng 0 — nên không có lần đo này
   * thì cửa sổ dòng chạy bằng con số ước lượng.
   *
   * Từ 14/10/2026 khung lưới CO theo chỗ còn lại của tấm (xem "Một thanh cuộn, không hai" trong file
   * CSS): đổi cỡ cửa sổ, hay mở/đóng bảng chọn cột, là khung cao thấp khác đi mà không có cú cuộn nào
   * báo. Thiếu lần đo ấy thì khung cao lên mà số dòng vẽ vẫn theo chiều cao cũ, để lộ một dải trống
   * dưới đáy cho tới lần cuộn sau. Không có `ResizeObserver` (jsdom) thì chỉ đo một lần như trước.
   */
  useEffect(() => {
    if (!open) return undefined;
    const node = scroller.current;
    if (node === null) return undefined;
    const doLai = (): void => {
      if (node.clientHeight === 0) return;
      setFrameWidth(node.clientWidth);
      setView((current) =>
        current.height === node.clientHeight ? current : { ...current, height: node.clientHeight },
      );
    };
    doLai();
    if (typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(doLai);
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [open]);

  /* ── Sửa lưới ────────────────────────────────────────────────────────── */

  const reset = useCallback(() => {
    setColumns([...DEFAULT_COLUMNS]);
    setNames(blankRow(DEFAULT_COLUMNS.length));
    const blank = blankGrid(DEFAULT_COLUMNS.length, BLANK_ROWS);
    setGrid(blank);
    setStyle(null);
    setDropped({ preamble: 0, truncated: 0 });
    setSkipBad(false);
    setSapXep(sapMacDinh(blank, DEFAULT_COLUMNS));
    // KHÔNG hạ `primed` ở đây: "Xoá hết" cũng gọi hàm này, mà hạ cờ thì hiệu ứng đổ lại chuỗi
    // cũ ngay lập tức và nút ấy thành vô dụng. Cờ chỉ hạ khi sheet thật sự đóng.
    setView({ top: 0, height: ROW_H * 10 });
  }, []);

  const setCell = useCallback((row: number, column: number, value: string) => {
    setGrid((current) => {
      const line = current[row];
      if (line === undefined) return current;

      const next = current.slice();
      const copy = line.slice();
      copy[column] = value;
      next[row] = copy;

      // Gõ vào dòng cuối thì mở sẵn dòng mới — không phải đi tìm nút "thêm dòng".
      if (row === next.length - 1 && value.trim() !== '') next.push(blankRow(copy.length));
      return next;
    });
  }, []);

  /**
   * Đổ một khối vừa dán vào lưới. Trả `true` nếu đã nhận, để nơi gọi chặn hành vi dán mặc định.
   *
   * Dán một ô lẻ ('25,4') thì trả `false` — đó là dán vào một ô, cứ để trình duyệt làm.
   *
   * `replace` là của hai lối đưa vào CẢ MỘT BỘ dữ liệu — "Tải file CSV" và "Dữ liệu mẫu": bộ mới
   * THAY lưới chứ không đè lên lưới. Trước 13/10/2026 file cũng đi đường "đè tại ô (0, 0)", mà từ
   * khi sheet mở ra là thấy sẵn chuỗi đang dùng thì lưới gần như không bao giờ trống: tải một file
   * hai cột Ngày · Đóng lên lưới đang có 57 phiên là giá đóng cửa rơi vào cột "Giá mở cửa" (dòng
   * tiêu đề của file bị bỏ qua), cột Giá đóng cửa vẫn mang số của chuỗi CŨ, các dòng cũ phía dưới
   * còn nguyên — và nút vẫn mời "Nạp 57 dòng". Hai bộ số trộn vào nhau mà không có gì báo (FR-06).
   *
   * Cùng lý do, một khối dán CÓ DÒNG TIÊU ĐỀ cũng thay lưới dù dán vào ô nào: mang theo tiêu đề
   * nghĩa là người dùng chép cả một bảng, và tên cột của bảng ấy phải được dùng để xếp cột. Đè nó
   * lên lưới là vứt dòng tiêu đề đi rồi rải số theo vị trí. Khối KHÔNG có tiêu đề thì vẫn là dán
   * một mẩu vào chỗ con trỏ, như bảng tính — trừ dòng MANG NGÀY, là một phiên mới chứ không phải
   * mấy ô để đè (28/10/2026, xem nhánh dưới).
   */
  const applyBlock = useCallback(
    (text: string, atRow: number, atColumn: number, replace = false): boolean => {
      const table = splitPasteTable(text);
      const blockWidth = table.cells.reduce((most, row) => Math.max(most, row.length), 0);
      if (table.cells.length === 0) return false;
      if (!replace && table.cells.length === 1 && blockWidth <= 1) return false;

      const {
        grid: current,
        columns: kinds,
        names: titles,
        order: shown,
        style: gridStyle,
      } = latest.current;

      /*
       * Lưới đã được viết theo kiểu Việt (tấm tự đổ chuỗi đang dùng vào, `setStyle('vi')`) thì dán thêm
       * KHÔNG được đoán lại quy ước cho cả lưới (29/10/2026): một dòng chép từ trang tiếng Anh
       * (`73,500`) kéo `detectNumberStyle` sang `en` và 5 phiên cũ `72.700` bị đọc thành 72,7, nút Nạp
       * vẫn mở. Mẩu dán được đoán riêng rồi viết lại theo kiểu Việt; lưới giữ `vi`.
       */
      let giuKieuViet = false;
      let nextColumns: ColumnKind[];
      let nextNames: string[];
      let rows: string[][];

      if (replace || table.hasHeader || isBlank(current)) {
        /*
         * Lưới trống (hoặc bộ mới thay lưới): nhận phỏng đoán vai trò cột của bộ đọc, rồi xếp vào
         * khuôn sáu cột. Vai trò nào dữ liệu không có thì cột ấy vẫn đứng đó, trống; cột dữ liệu
         * có thừa thì về cuối lưới dưới tên của chính nó — xem `fitToSeriesColumns()`.
         */
        const fitted = fitToSeriesColumns(table);
        nextColumns = fitted.columns;
        nextNames = fitted.names;
        rows = fitted.cells;
      } else {
        /*
         * Lưới đang có dữ liệu: đây là dán thêm một mẩu vào chỗ con trỏ. Giữ nguyên vai trò các
         * cột đang có — không tự ý đổi cột của người dùng chỉ vì họ vừa dán thêm. Mẩu dán tràn
         * quá bề ngang lưới thì phần tràn thành cột thừa.
         *
         * Mẩu dán đi XUỐNG theo thứ tự trên màn, không theo thứ tự trong lưới: từ khi bảng mặc định
         * bày phiên mới nhất lên đầu (20/10/2026), dòng ngay dưới trên màn là phiên CŨ hơn, tức dòng
         * lưới đứng TRƯỚC. Rải theo chỉ số lưới thì cột số dán vào chạy ngược lên trên. Quá dòng cuối
         * trên màn thì mẩu dán mở thêm dòng mới ở cuối lưới.
         */
        if (gridStyle === 'vi') {
          giuKieuViet = true;
          const cotNgay = kinds.indexOf('date') - atColumn;
          const soCuaMau = table.cells.flatMap((row) =>
            row.filter((_, column) => column !== cotNgay),
          );
          const kieuMau = detectNumberStyle(soCuaMau).style;
          table.cells = table.cells.map((row) =>
            row.map((cell, column) => {
              if (column === cotNgay) return cell;
              const so = parseCellNumber(cell, kieuMau);
              // Số viết lại không có dấu nghìn: trong kiểu Việt "73900" và "0,5" đọc không mơ hồ.
              return so === null || !Number.isFinite(so) || /e/i.test(String(so))
                ? cell
                : String(so).replace('.', ',');
            }),
          );
        }
        const width = Math.max(kinds.length, atColumn + blockWidth);
        const start = shown === null ? atRow : Math.max(0, shown.indexOf(atRow));
        const targets = table.cells.map((_, offset) => {
          const position = start + offset;
          if (shown === null) return position;
          return position < shown.length
            ? (shown[position] ?? position)
            : current.length + position - shown.length;
        });

        /*
         * Dòng dán MANG NGÀY là một phiên MỚI, không đè lên phiên nằm dưới con trỏ (28/10/2026).
         *
         * Tester báo, chủ dự án giao sửa: "Dán dữ liệu chuỗi OHLC không check ngày đã tồn tại (không
         * đồng nhất với thao tác Thêm dòng)". Trước ngày này mọi dòng của mẩu dán đè theo vị trí, nên
         * ngày dưới con trỏ bị thay mà không ai hỏi: dán một dòng 15/09 vào dòng 1 là số của 15/09
         * đổi im lặng, dán một dòng 16/09 vào đó là phiên 15/09 biến mất. Nay dòng ấy được chèn vào
         * đúng ngày của nó (`mergeRowsByDate()`), và nếu ngày ấy đã có thì bộ đọc báo trùng ngày
         * như cột kiểm tra của bảng WF-05 báo khi "Thêm dòng" gõ một ngày đã có.
         *
         * Ba trường hợp vẫn đè tại chỗ, như bảng tính:
         *   · mẩu dán không phủ cột Ngày — dán một cột giá vào các phiên đang có là sửa ô, ngày
         *     của từng dòng không đổi nên không phiên nào mất;
         *   · dòng dán để trống ô ngày;
         *   · dòng nằm dưới con trỏ có số mà CHƯA có ngày (chuỗi chỉ có giá đóng cửa): dán ngày vào
         *     là gắn ngày cho phiên ấy, không có phiên nào bị đè.
         */
        const dateAt = kinds.indexOf('date');
        const dateInBlock = dateAt - atColumn;
        const mangNgay = dateAt !== -1 && dateInBlock >= 0 && dateInBlock < blockWidth;
        const laPhienMoi = (offset: number): boolean => {
          if (!mangNgay || (table.cells[offset]?.[dateInBlock] ?? '').trim() === '') return false;
          const target = current[targets[offset] ?? -1];
          if (target === undefined || isBlank([target])) return true;
          return (target[dateAt] ?? '').trim() !== '';
        };
        const phienMoi: number[] = [];
        const taiCho: Array<[number, number]> = [];
        targets.forEach((line, offset) => {
          if (laPhienMoi(offset)) phienMoi.push(offset);
          else taiCho.push([line, offset]);
        });

        const height = Math.max(current.length, ...taiCho.map(([line]) => line + 1));
        const blockRow = new Map(taiCho);
        nextColumns = Array.from(
          { length: width },
          (_, index): ColumnKind => kinds[index] ?? 'ignore',
        );
        nextNames = Array.from({ length: width }, (_, index) => titles[index] ?? '');
        rows = Array.from({ length: height }, (_, row) => {
          const offset = blockRow.get(row);
          return Array.from(
            { length: width },
            (_, column) =>
              (offset === undefined ? undefined : table.cells[offset]?.[column - atColumn]) ??
              current[row]?.[column] ??
              '',
          );
        });
        if (phienMoi.length > 0) {
          rows = mergeRowsByDate(
            rows,
            phienMoi.map((offset) =>
              Array.from(
                { length: width },
                (_, column) => table.cells[offset]?.[column - atColumn] ?? '',
              ),
            ),
            dateAt,
          );
        }
      }

      /*
       * Quá trần thì cắt NGAY lúc dán, và cắt phần CŨ. Phần nào là cũ thì hỏi chính bộ đọc —
       * chuỗi xếp mới trước thì phần cũ nằm ở CUỐI, ngược lại thì ở đầu. Không đoán bằng vị trí.
       */
      // Dòng trống ở đuôi lưới (`current` luôn có một) không phải phiên: để lại thì mỗi lần dán sửa
      // đẻ thêm một dòng trống, và lưới gần trần cắt mất phiên cũ nhất vì đếm cả chúng (29/10/2026).
      while (rows.length > 0 && isBlank([rows[rows.length - 1] ?? []])) rows = rows.slice(0, -1);
      let truncated = table.truncated;
      if (rows.length > maxRows) {
        const probe = parseCells(rows, nextColumns);
        const kept = probe.order === 'newest-first' ? rows.slice(0, maxRows) : rows.slice(-maxRows);
        truncated += rows.length - kept.length;
        rows = kept;
      }

      const nextGrid = [...rows, blankRow(nextColumns.length)];
      setColumns(nextColumns);
      setNames(nextNames);
      setGrid(nextGrid);
      // Bộ dữ liệu khác thì quy ước số và lời đồng ý bỏ dòng lỗi lần trước không còn đúng nữa.
      setStyle(giuKieuViet ? 'vi' : null);
      setSkipBad(false);
      setDropped({ preamble: table.preamble, truncated });
      // Bộ số mới thì thứ tự đã chốt của bộ cũ không còn nghĩa gì: về mặc định, mới nhất lên đầu.
      setSapXep(sapMacDinh(nextGrid, nextColumns));
      setView({ top: 0, height: view.height });
      if (scroller.current !== null) scroller.current.scrollTop = 0;
      return true;
    },
    [maxRows, view.height],
  );

  /*
   * `setColumnKind` — đổi vai trò một cột bằng cách đổi chỗ với cột đang giữ vai trò ấy — đã BỎ cùng
   * bảng chọn cột (20/10/2026, xem docblock `DEFAULT_COLUMNS`). Lý do nó đổi CHỖ chứ không gán đè vẫn
   * đáng nhớ nếu có ai dựng lại: bộ đọc lấy cột ĐẦU mang một vai trò (`indexOf`), nên hai cột cùng là
   * "Giá đóng cửa" thì cột sau thành ô chết và số liệu của nó không được nạp.
   */

  /**
   * Nhảy tới dòng hỏng đầu tiên TRÊN MÀN và đặt nó ngay dưới hàng tiêu đề. Bảng đang sắp xếp thì đó
   * không còn là dòng hỏng có số nhỏ nhất, nên tìm theo vị trí bày ra.
   */
  function jumpToBad() {
    if (firstBad < 0 || scroller.current === null) return;
    const position = order === null ? firstBad : order.findIndex((line) => badRows.has(line));
    if (position < 0) return;
    const top = position * ROW_H;
    scroller.current.scrollTop = top;
    setView((current) => ({ ...current, top }));
  }

  async function loadFile(file: File) {
    const text = await file.text();
    // Một file là cả một bộ dữ liệu: nó THAY lưới, không đè lên chuỗi đang có — xem `applyBlock`.
    applyBlock(text, 0, 0, true);
  }

  /**
   * Nạp bộ dữ liệu mẫu.
   *
   * `import()` trần chứ không phải import tĩnh, cùng lối với `draw-card` và `chart-snapshot` và
   * cùng một lý do: `FormulaDetail` nạp sheet này TĨNH, nên 64 phiên số liệu thật (~3 KB) sẽ đi
   * theo gói đầu tiên của cả 111 trang chi tiết dù gần như không ai bấm nút này.
   */
  async function loadSample() {
    const { PASTE_SAMPLE } = await import('./paste-sample');
    applyBlock(PASTE_SAMPLE, 0, 0, true);
  }

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      placement="center"
      className={styles.wide}
      // Không phụ đề: "Gõ vào lưới, hoặc dán từ Excel bằng Ctrl + V" đã bỏ — mộ chí `paste.subtitle` ở vi.ts.
      title={t('paste.title')}
      footer={
        <>
          {/*
            Bỏ dòng lỗi là một quyết định, không phải một hệ quả. Lặng lẽ vứt ba dòng rồi báo
            "248 phiên sẵn sàng" đúng là thứ FR-06 tồn tại để chặn, nên nút Nạp khoá cho tới
            khi người dùng nói rõ là biết mình đang bỏ cái gì.
          */}
          {badCount > 0 && (
            <label className={styles.skipBad}>
              <input
                type="checkbox"
                checked={skipBad}
                onChange={(event) => {
                  setSkipBad(event.target.checked);
                }}
              />
              {t('paste.skipBad')} {formatNumber(badCount)} {t('paste.badRows')}
            </label>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            {t('paste.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!canImport}
            onClick={() => {
              onImport(result);
              reset();
              onClose();
            }}
          >
            {result.rows.length > 0
              ? `${t('paste.import')} ${formatNumber(result.rows.length)} ${t('paste.rows')}`
              : t('paste.import')}
          </Button>
        </>
      }
    >
      {/*
        Thanh công cụ: năm của chuỗi bên trái, hai lối đưa dữ liệu vào bên phải. Nút "Cột 6/6" và
        bảng chọn vai trò cột từng đứng ở chỗ dòng năm — bỏ 20/10/2026, xem docblock `DEFAULT_COLUMNS`.
      */}
      <div className={styles.toolbar}>
        {yearNote !== null && <p className={styles.yearNote}>{yearNote}</p>}

        <div className={styles.toolRight}>
          {/*
            Ô chọn file thật nằm dưới cái nhãn này: `<input type="file">` không tạo kiểu được,
            mà một `<button>` giả thì mất luôn phần bàn phím và trình đọc màn hình của nó.
          */}
          <label className={styles.fileButton}>
            {t('paste.loadCsv')}
            <input
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              className="visually-hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file !== undefined) void loadFile(file);
              }}
            />
          </label>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => {
              if (hasInput) reset();
              else void loadSample();
            }}
          >
            {hasInput ? t('paste.clear') : t('paste.sample')}
          </button>
        </div>
      </div>

      <div
        className={styles.gridScroll}
        ref={measure}
        onScroll={(event) => {
          const node = event.currentTarget;
          const top = node.scrollTop;
          const height = node.clientHeight;
          /*
           * Chỉ đổi state khi cửa sổ dòng THẬT SỰ đổi (28/10/2026): `view.top` chỉ dùng để tính dòng
           * đầu (`from`), nên cuộn trong cùng một dòng 32px — hay cuộn NGANG — mà vẫn đặt state mới là
           * dựng lại cả hộp ở mỗi sự kiện cuộn. Đo trên bản build (CPU 4×): cuộn lưới làm luồng chính
           * bận 100%, khung hình p95 112–137 ms. Trả lại đúng object cũ thì React bỏ qua lượt dựng.
           */
          setView((current) =>
            Math.floor(current.top / ROW_H) === Math.floor(top / ROW_H) && current.height === height
              ? current
              : { top, height },
          );
        }}
      >
        {/*
          `--paste-row-h`: chiều cao dòng, nguồn DUY NHẤT cho cả CSS lẫn phần vẽ theo cửa sổ (xem
          `ROW_H`). `minWidth`: tổng bề ngang các cột (`widths`) — khung rộng hơn thì bảng giãn lấp
          khung, hẹp hơn thì khung cuộn ngang. Mỗi cột cộng 1rem là đệm hai bên của ô.
        */}
        <table
          ref={table}
          className={styles.grid}
          style={
            {
              '--paste-row-h': `${String(ROW_H)}px`,
              minWidth: `calc(2rem + ${String(widthSum)}ch + ${String(columns.length)}rem)`,
            } as CSSProperties
          }
        >
          <caption className="visually-hidden">{t('paste.gridCaption')}</caption>
          <colgroup>
            <col className={styles.colLine} />
            {widths.map((width, index) => (
              <col key={index} style={{ width: colWidth(width) }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={styles.lineHead}>
                <span className="visually-hidden">{t('paste.rowNo')}</span>
              </th>
              {columns.map((kind, index) => {
                const label = labels[index] ?? '';
                const thClass = index === dateColumn ? styles.thDate : undefined;
                if (kind === 'ignore') {
                  // Cột thừa không xếp được. Tên dài thì cắt bằng dấu ba chấm; rê chuột vào là đọc đủ.
                  return (
                    <th key={index} scope="col" className={thClass}>
                      <span className={`${styles.head} ${styles.headExtra}`} title={label}>
                        {label}
                      </span>
                    </th>
                  );
                }
                const short = t(COLUMN_SHORT_KEYS[kind]);
                // Chữ in trên đầu cột: tên ngắn ở điện thoại, tên đầy đủ từ 1024px (xem `COLUMN_SHORT_KEYS`).
                const hien = mayTinh ? label : short;
                const chieu = sapXep?.cot === index ? sapXep.chieu : null;
                return (
                  <th
                    key={index}
                    scope="col"
                    className={thClass}
                    aria-sort={
                      chieu === null ? undefined : chieu === 'tang' ? 'ascending' : 'descending'
                    }
                  >
                    {/*
                      Tên đọc được là tên ĐẦY ĐỦ ("Giá mở cửa"): "Mở" nghe một mình không nói được là
                      mở cái gì. Tên ngắn không nằm trong tên đầy đủ ("KL") thì ghép vào sau, để ai gọi
                      nút bằng chữ đang thấy trên màn vẫn gọi trúng.
                    */}
                    <button
                      type="button"
                      className={chieu === null ? styles.head : `${styles.head} ${styles.headOn}`}
                      aria-label={
                        label.toLowerCase().includes(short.toLowerCase())
                          ? label
                          : `${label} (${short})`
                      }
                      title={label === hien ? undefined : label}
                      onClick={() => {
                        bamSapXep(index);
                      }}
                    >
                      <span className={styles.headText}>{hien}</span>
                      <SortIcon chieu={chieu} />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/*
              Hai ô đệm giữ đúng chiều cao của phần KHÔNG vẽ, nên thanh cuộn dài đúng bằng cả
              chuỗi dù chỉ có vài chục dòng thật sự nằm trong DOM.
            */}
            {from > 0 && (
              <tr aria-hidden="true" style={{ height: `${String(from * ROW_H)}px` }}>
                <td className={styles.spacer} colSpan={columns.length + 1} />
              </tr>
            )}

            {Array.from({ length: to - from }, (_, offset) => {
              const position = from + offset;
              const line = lineAt(position);
              const row = grid[line] ?? [];
              return (
                <GridRow
                  key={line}
                  base={base}
                  line={line}
                  number={position + 1}
                  below={position + 1 < total ? lineAt(position + 1) : undefined}
                  stripe={position % 2 === 1}
                  cells={row}
                  labels={labels}
                  numeric={numeric}
                  cellClasses={cellClasses}
                  dateColumn={dateColumn}
                  fullDate={mayTinh}
                  closeColumn={closeColumn}
                  closeTrend={trendOf(row)}
                  rowWord={rowWord}
                  hints={position === 0 && !hasInput ? hints : []}
                  badColumn={badRows.get(line) ?? -1}
                  emptyMark={hasInput ? emptyMark : ''}
                  onCell={setCell}
                  onBlock={applyBlock}
                />
              );
            })}

            {to < total && (
              <tr aria-hidden="true" style={{ height: `${String((total - to) * ROW_H)}px` }}>
                <td className={styles.spacer} colSpan={columns.length + 1} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/*
        Câu "Đang xem dòng 1 – 8 trong 249" từng mở đầu thanh này; chủ dự án bảo xoá (14/10/2026:
        _"xóa text thừa này đi"_). Thanh cuộn của lưới đã nói đang ở đâu. Mộ chí của hai khoá ở
        `vi.ts` (`paste.viewing`).

        Câu xác nhận bên phải ("250 phiên đọc được, từ 12/09/2025 tới 15/09/2026") cũng đã bỏ, ngày
        20/10/2026 — chủ dự án: _"xóa đoạn text … đi"_. Số phiên còn trên nút "Nạp 250 dòng", khoảng năm
        còn ở dòng năm trên lưới. Thanh này nay chỉ còn phần báo dòng lỗi.
      */}
      <div className={styles.status} aria-live="polite">
        {badCount > 0 && (
          <>
            <span className={styles.statusBad}>
              <BadMark />
              {formatNumber(badCount)} {t('paste.rows')} {badLabel ?? t('paste.badRows')}
            </span>
            <button type="button" className={styles.linkButton} onClick={jumpToBad}>
              {t('paste.seeBad')}
            </button>
          </>
        )}
      </div>

      {/*
        Dải cảnh báo của lượt một. Nó không có trong bản vẽ vì bản vẽ đang ở cảnh không có cảnh
        báo nào — nhưng bốn thứ dưới đây đều là chỗ dữ liệu ĐỔI NGHĨA mà không đổi hình dạng,
        nên không được bỏ: đảo chiều thời gian, không đọc được thứ tự, quy ước số mập mờ, và
        phần đã bị cắt bỏ.
      */}
      {(result.reordered ||
        result.numberStyleGuessed ||
        result.preamble > 0 ||
        result.truncated > 0 ||
        problems.length > 0 ||
        (result.rows.length > 0 && result.order === 'unknown')) && (
        <div className={styles.notes}>
          {result.numberStyleGuessed && styleSample !== null && (
            <div className={styles.styleAsk}>
              <span className={styles.note}>
                {t('paste.styleAsk')} <code>{styleSample}</code>
              </span>
              <div className={styles.styleButtons}>
                {(['vi', 'en'] as const).map((option) => {
                  const value = parseCellNumber(styleSample, option);
                  return (
                    <Button
                      key={option}
                      variant={result.numberStyle === option ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        setStyle(option);
                      }}
                    >
                      {value === null ? styleSample : formatNumber(value)}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {problems.map((line) => (
            <p key={line} className={styles.note}>
              {formatNumber(result.skipped.length)} {t('paste.skippedRows')}: {line}
            </p>
          ))}

          {result.reordered && <p className={styles.note}>{t('paste.reordered')}</p>}

          {result.rows.length > 0 && result.order === 'unknown' && (
            <p className={styles.note}>{t('paste.orderUnknown')}</p>
          )}

          {result.preamble > 0 && (
            <p className={styles.note}>
              {t('paste.preamble')} {formatNumber(result.preamble)} {t('paste.rows')}
            </p>
          )}

          {result.truncated > 0 && (
            <p className={styles.note}>
              {t('paste.truncated')} {formatNumber(result.truncated)} {t('paste.rows')}
            </p>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
