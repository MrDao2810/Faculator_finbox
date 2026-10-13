'use client';

import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import {
  MAX_SERIES_ROWS,
  SERIES_COLUMNS,
  displaySeriesDate,
  fitToSeriesColumns,
  formatNumber,
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
import { BottomSheet, Button } from '@/ui/primitives';

import styles from './PasteImportSheet.module.css';

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
   * Thiếu chỗ này thì màn ngoài đang chạy trên 64 phiên mà mở "Dán dữ liệu" lại thấy lưới rỗng:
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
 *   2. Ô chọn chỉ có sáu lựa chọn, và chọn là ĐỔI CHỖ hai cột cho nhau (`setColumnKind`).
 *   3. Dữ liệu đưa vào có thừa cột thì cột ấy đứng thêm ở cuối lưới, dưới tên của chính nó trong
 *      dòng tiêu đề đã dán (`fitToSeriesColumns()` ở Domain). Nó không được nạp đi đâu: một phiên
 *      giá chỉ có sáu trường.
 */
const DEFAULT_COLUMNS: ReadonlyArray<ColumnKind> = SERIES_COLUMNS;

/** Số dòng trống mở sẵn: đủ để nhìn ra đây là bảng gõ được, chưa dài tới mức phải cuộn. */
const BLANK_ROWS = 4;

/**
 * Chiều cao một dòng lưới, tính bằng px — PHẢI khớp `--paste-row-h` trong file CSS kèm theo.
 *
 * Con số này là thứ duy nhất cho phép chỉ vẽ phần dòng đang nhìn thấy: biết chiều cao một dòng
 * thì biết dòng thứ mấy đang ở mép trên, và hai ô đệm trên dưới lo phần còn lại. Đổi bên nào
 * thì phải đổi bên kia, nếu không thanh cuộn sẽ trượt khỏi dữ liệu.
 */
const ROW_H = 44;

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

/** Mảng mới thiếu phần tử ở vị trí `at` — bỏ một cột khỏi dòng lưới, khỏi `columns`, khỏi `names`. */
function dropAt<T>(list: ReadonlyArray<T>, at: number): T[] {
  return list.filter((_, index) => index !== at);
}

/** Mã của một ô trong lưới, để phím Enter nhảy xuống đúng ô dưới. */
function cellId(base: string, row: number, column: number): string {
  return `${base}-${row}-${column}`;
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
  cells,
  labels,
  numeric,
  rowWord,
  hints,
  badColumn,
  emptyMark,
  onCell,
  onBlock,
}: {
  base: string;
  line: number;
  cells: ReadonlyArray<string>;
  labels: ReadonlyArray<string>;
  /** Cột nào là số — bật bàn phím số trên điện thoại. Cột ngày thì không, vì còn gõ dấu gạch. */
  numeric: ReadonlyArray<boolean>;
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

  return (
    <tr className={bad ? styles.rowBad : undefined} style={{ height: `${ROW_H}px` }}>
      <th scope="row" className={bad ? `${styles.lineNo} ${styles.lineNoBad}` : styles.lineNo}>
        {line + 1}
      </th>
      {cells.map((value, column) => {
        const here = column === badColumn;
        return (
          <td key={column} className={here ? styles.cellBad : undefined}>
            {here && <BadMark />}
            <input
              id={cellId(base, line, column)}
              className={styles.cell}
              type="text"
              inputMode={numeric[column] === true ? 'decimal' : undefined}
              autoComplete="off"
              spellCheck={false}
              aria-label={`${labels[column] ?? ''}, ${rowWord} ${line + 1}`}
              aria-invalid={here ? true : undefined}
              placeholder={hints[column] ?? emptyMark}
              value={value}
              onChange={(event) => {
                onCell(line, column, event.target.value);
              }}
              onPaste={(event) => {
                const text = event.clipboardData.getData('text/plain');
                if (text !== '' && onBlock(text, line, column)) event.preventDefault();
              }}
              onKeyDown={(event) => {
                // Enter đi xuống ô dưới như bảng tính; Tab sang ngang là sẵn của trình duyệt.
                if (event.key !== 'Enter') return;
                event.preventDefault();
                const below = document.getElementById(cellId(base, line + 1, column));
                if (below instanceof HTMLInputElement) below.focus();
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
 *      thì máy yếu đứng hình. Thanh trạng thái nói thẳng đang xem dòng nào trong bao nhiêu.
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
  /** Bảng chọn vai trò cột đang mở hay không. */
  const [picking, setPicking] = useState(false);
  /** Người dùng đã đồng ý bỏ các dòng lỗi chưa. */
  const [skipBad, setSkipBad] = useState(false);
  /** Cửa sổ dòng đang nhìn thấy, đo bằng px trên khung cuộn. */
  const [view, setView] = useState({ top: 0, height: ROW_H * 10 });

  const scroller = useRef<HTMLDivElement>(null);

  /*
   * Hai hàm truyền xuống `GridRow` phải ổn định để `memo` có tác dụng, nhưng chúng lại cần
   * trạng thái mới nhất. Giữ trạng thái trong một ref là cách rẻ nhất có cả hai.
   */
  const latest = useRef({ grid, columns, names });
  latest.current = { grid, columns, names };

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

  /** Danh sách dòng bỏ qua kèm số dòng, đúng khuôn WF-11 — đọc được mà không phải cuộn lưới. */
  const problems = useMemo(() => summarizeSkipped(result.skipped), [result.skipped]);

  const hasInput = !isBlank(grid);
  const badCount = result.skipped.length;
  const first = result.rows[0];
  const last = result.rows[result.rows.length - 1];
  const canImport = result.rows.length > 0 && (badCount === 0 || skipBad);
  const assigned = columns.filter((kind) => kind !== 'ignore').length;

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

  /* ── Cửa sổ dòng đang vẽ ─────────────────────────────────────────────── */

  const total = grid.length;
  const rendered = Math.max(MIN_RENDERED, Math.ceil(view.height / ROW_H) + OVERSCAN * 2);
  const from = Math.max(0, Math.floor(view.top / ROW_H) - OVERSCAN);
  const to = Math.min(total, from + rendered);
  /** Khoảng dòng người dùng THẬT SỰ nhìn thấy, đếm từ 1 — khác khoảng đang vẽ vì có dòng dư. */
  const seenFrom = Math.min(total, Math.floor(view.top / ROW_H) + 1);
  const seenTo = Math.min(total, Math.max(seenFrom, Math.ceil((view.top + view.height) / ROW_H)));

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
    setColumns([...DEFAULT_COLUMNS]);
    setNames(blankRow(DEFAULT_COLUMNS.length));
    setGrid([...cells.map((row) => [...row]), blankRow(DEFAULT_COLUMNS.length)]);
    setStyle('vi');
  }, [open, primed, initialRows, maxRows]);

  /*
   * Đo lại ngay sau khi tấm mở ra.
   *
   * Lúc ref gắn vào thì `<dialog>` còn đóng, chiều cao đọc ra bằng 0 — nên không có lần đo này
   * thì cửa sổ dòng chạy bằng con số ước lượng, và ở màn thấp (`max-height: 52vh`) thanh trạng
   * thái sẽ khai nhiều dòng hơn số dòng thật sự nhìn thấy.
   */
  useEffect(() => {
    if (!open) return;
    const node = scroller.current;
    if (node === null || node.clientHeight === 0) return;
    setView((current) =>
      current.height === node.clientHeight ? current : { ...current, height: node.clientHeight },
    );
  }, [open]);

  /* ── Sửa lưới ────────────────────────────────────────────────────────── */

  const reset = useCallback(() => {
    setColumns([...DEFAULT_COLUMNS]);
    setNames(blankRow(DEFAULT_COLUMNS.length));
    setGrid(blankGrid(DEFAULT_COLUMNS.length, BLANK_ROWS));
    setStyle(null);
    setDropped({ preamble: 0, truncated: 0 });
    setSkipBad(false);
    setPicking(false);
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
   * một mẩu vào chỗ con trỏ, như bảng tính.
   */
  const applyBlock = useCallback(
    (text: string, atRow: number, atColumn: number, replace = false): boolean => {
      const table = splitPasteTable(text);
      const blockWidth = table.cells.reduce((most, row) => Math.max(most, row.length), 0);
      if (table.cells.length === 0) return false;
      if (!replace && table.cells.length === 1 && blockWidth <= 1) return false;

      const { grid: current, columns: kinds, names: titles } = latest.current;

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
         */
        const width = Math.max(kinds.length, atColumn + blockWidth);
        const height = Math.max(current.length, atRow + table.cells.length);
        nextColumns = Array.from(
          { length: width },
          (_, index): ColumnKind => kinds[index] ?? 'ignore',
        );
        nextNames = Array.from({ length: width }, (_, index) => titles[index] ?? '');
        rows = Array.from({ length: height }, (_, row) =>
          Array.from(
            { length: width },
            (_, column) =>
              table.cells[row - atRow]?.[column - atColumn] ?? current[row]?.[column] ?? '',
          ),
        );
      }

      /*
       * Quá trần thì cắt NGAY lúc dán, và cắt phần CŨ. Phần nào là cũ thì hỏi chính bộ đọc —
       * chuỗi xếp mới trước thì phần cũ nằm ở CUỐI, ngược lại thì ở đầu. Không đoán bằng vị trí.
       */
      let truncated = table.truncated;
      if (rows.length > maxRows) {
        const probe = parseCells(rows, nextColumns);
        const kept = probe.order === 'newest-first' ? rows.slice(0, maxRows) : rows.slice(-maxRows);
        truncated += rows.length - kept.length;
        rows = kept;
      }

      setColumns(nextColumns);
      setNames(nextNames);
      setGrid([...rows, blankRow(nextColumns.length)]);
      // Bộ dữ liệu khác thì quy ước số và lời đồng ý bỏ dòng lỗi lần trước không còn đúng nữa.
      setStyle(null);
      setSkipBad(false);
      setDropped({ preamble: table.preamble, truncated });
      setView({ top: 0, height: view.height });
      if (scroller.current !== null) scroller.current.scrollTop = 0;
      return true;
    },
    [maxRows, view.height],
  );

  /**
   * Đặt vai trò cho một cột — tức ĐỔI CHỖ nó với cột đang giữ vai trò ấy.
   *
   * Một vai trò chỉ được ở đúng MỘT cột: bộ đọc lấy cột đầu tiên mang vai trò ấy (`indexOf`), nên
   * hai cột cùng là "Giá đóng cửa" thì cột sau thành ô chết. Trước 13/10/2026 cột cũ bị đẩy sang
   * "Không dùng", tức mỗi lần gán lại là lưới mất một vai trò và số liệu của cột ấy không được nạp.
   * Nay hai cột đổi vai cho nhau, nên sáu vai trò luôn còn đủ.
   *
   * Cột được chọn là cột thừa thì cột kia thành cột thừa thay nó. Nếu cột vừa nhả vai ấy trống
   * trơn và không có tên thì bỏ hẳn: đó là cột dựng sẵn cho một vai trò mà dữ liệu không có (bảng
   * dán ghi 'KLGD', máy không nhận ra là khối lượng), giữ lại chỉ là một cột rỗng đứng thừa.
   */
  function setColumnKind(index: number, next: SeriesColumnKind) {
    const previous = columns[index];
    const from = columns.indexOf(next);
    if (previous === undefined || from === index) return;

    const kinds = columns.slice();
    kinds[index] = next;
    if (from !== -1) kinds[from] = previous;

    const leftover =
      from !== -1 &&
      previous === 'ignore' &&
      (names[from] ?? '') === '' &&
      grid.every((row) => (row[from] ?? '').trim() === '');

    if (!leftover) {
      setColumns(kinds);
      return;
    }

    setColumns(dropAt(kinds, from));
    setNames(dropAt(names, from));
    setGrid(grid.map((row) => dropAt(row, from)));
  }

  /** Nhảy tới dòng hỏng đầu tiên và đặt nó ngay dưới hàng tiêu đề. */
  function jumpToBad() {
    if (firstBad < 0 || scroller.current === null) return;
    const top = firstBad * ROW_H;
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
      title={t('paste.title')}
      subtitle={t('paste.subtitle')}
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
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toolButton}
          aria-expanded={picking}
          onClick={() => {
            setPicking((current) => !current);
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          {t('paste.columnsBtn')}{' '}
          <span className={styles.toolCount}>
            {formatNumber(assigned)}/{formatNumber(columns.length)}
          </span>
        </button>

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

      {/*
        Bảng chọn vai trò cột, mở ra từ nút "Cột".
        Trước đây mỗi đầu cột đội một ô chọn; sáu ô chọn xếp ngang nuốt mất chỗ của chính dữ
        liệu và làm hàng tiêu đề cao gấp đôi. Giờ đầu cột chỉ còn TÊN vai trò — vẫn đứng đúng
        trên cột nó nói về, nên phần đối chiếu không mất gì — và bấm vào tên ấy thì mở bảng này.
      */}
      {picking && (
        <div className={styles.pickPanel}>
          {columns.map((kind, index) => (
            <ColumnPicker
              key={index}
              index={index}
              kind={kind}
              label={labels[index] ?? ''}
              onChange={(next) => {
                setColumnKind(index, next);
              }}
            />
          ))}
        </div>
      )}

      <div
        className={styles.gridScroll}
        ref={measure}
        onScroll={(event) => {
          const node = event.currentTarget;
          setView({ top: node.scrollTop, height: node.clientHeight });
        }}
      >
        {/*
          `--paste-cols`: số cột của lưới, để CSS tính mức sàn bề ngang — sáu cột thì vừa khung, có
          cột thừa thì bảng rộng ra đúng một cột. Xem `.grid` trong file CSS kèm theo.
        */}
        <table className={styles.grid} style={{ '--paste-cols': columns.length } as CSSProperties}>
          <caption className="visually-hidden">{t('paste.gridCaption')}</caption>
          <colgroup>
            <col className={styles.colLine} />
            {columns.map((kind, index) => (
              <col key={index} className={kind === 'date' ? styles.colDate : styles.colNumber} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={styles.lineHead}>
                <span className="visually-hidden">{t('paste.rowNo')}</span>
              </th>
              {columns.map((kind, index) => (
                <th key={index} scope="col">
                  <button
                    type="button"
                    className={kind === 'ignore' ? styles.head : `${styles.head} ${styles.headOn}`}
                    // Tên cột thừa dài thì bị cắt bằng dấu ba chấm; rê chuột vào là đọc được đủ.
                    title={kind === 'ignore' ? labels[index] : undefined}
                    onClick={() => {
                      setPicking(true);
                    }}
                  >
                    {labels[index]}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/*
              Hai ô đệm giữ đúng chiều cao của phần KHÔNG vẽ, nên thanh cuộn dài đúng bằng cả
              chuỗi dù chỉ có vài chục dòng thật sự nằm trong DOM.
            */}
            {from > 0 && (
              <tr aria-hidden="true" style={{ height: `${from * ROW_H}px` }}>
                <td colSpan={columns.length + 1} />
              </tr>
            )}

            {grid.slice(from, to).map((row, offset) => (
              <GridRow
                key={from + offset}
                base={base}
                line={from + offset}
                cells={row}
                labels={labels}
                numeric={numeric}
                rowWord={rowWord}
                hints={from + offset === 0 && !hasInput ? hints : []}
                badColumn={badRows.get(from + offset) ?? -1}
                emptyMark={hasInput ? emptyMark : ''}
                onCell={setCell}
                onBlock={applyBlock}
              />
            ))}

            {to < total && (
              <tr aria-hidden="true" style={{ height: `${(total - to) * ROW_H}px` }}>
                <td colSpan={columns.length + 1} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.status} aria-live="polite">
        <span className={styles.statusRange}>
          {t('paste.viewing')} {formatNumber(seenFrom)} – {formatNumber(seenTo)}{' '}
          {t('paste.inTotal')} {formatNumber(total)}
        </span>

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

        {/*
          Câu xác nhận đọc được cái gì. Khoảng ngày là chỗ duy nhất bắt được một cú dán nhầm
          bảng khác: số phiên có thể vẫn đúng, nhưng năm thì lệch hẳn và mắt thấy ngay.
        */}
        {result.rows.length > 0 && (
          <span className={styles.statusOk}>
            {formatNumber(result.rows.length)} {t('paste.validRows')}
            {first !== undefined && last !== undefined && first.date !== '' && last.date !== ''
              ? `, ${t('paste.rangeFrom')} ${displaySeriesDate(first.date)} ${t('paste.rangeTo')} ${displaySeriesDate(last.date)}`
              : ''}
          </span>
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

/**
 * Một dòng của bảng chọn vai trò cột: số thứ tự cột + ô chọn.
 *
 * Vẫn là `<select>` gốc chứ không phải menu tự dựng: trên điện thoại nó mở bánh xe chọn quen
 * thuộc, bàn phím và trình đọc màn hình xử đúng sẵn, và không tốn thêm dung lượng gói.
 *
 * ĐÚNG SÁU lựa chọn, là sáu cột của chuỗi giá. Lựa chọn thứ bảy "Không dùng" đã bỏ ngày
 * 13/10/2026 (xem docblock `DEFAULT_COLUMNS`) — đừng thêm lại một lựa chọn "bỏ cột" dưới tên nào
 * khác: bỏ được một cột là có lại đường để số liệu của nó lặng lẽ không được nạp.
 *
 * Cột thừa thì ô chọn đang hiện TÊN của chính cột ấy, là một dòng không chọn được: nó chỉ nói
 * cột này đang là gì. Chọn một trong sáu vai trò là đổi chỗ cột thừa với cột đang giữ vai trò đó.
 */
function ColumnPicker({
  index,
  kind,
  label,
  onChange,
}: {
  index: number;
  kind: ColumnKind;
  /** Tên đang đứng trên đầu cột này trong lưới. Chỉ dùng tới khi cột là cột thừa. */
  label: string;
  onChange: (kind: SeriesColumnKind) => void;
}) {
  const id = useId();
  const t = useT();

  return (
    <div className={styles.pickRow}>
      <label className={styles.pickLabel} htmlFor={id}>
        {t('paste.column')} {index + 1}
      </label>
      <select
        id={id}
        className={kind === 'ignore' ? styles.pick : `${styles.pick} ${styles.pickOn}`}
        value={kind === 'ignore' ? '' : kind}
        onChange={(event) => {
          const next = SERIES_COLUMNS.find((option) => option === event.target.value);
          if (next !== undefined) onChange(next);
        }}
      >
        {kind === 'ignore' && (
          <option value="" disabled>
            {label}
          </option>
        )}
        {SERIES_COLUMNS.map((option) => (
          <option key={option} value={option}>
            {t(COLUMN_LABEL_KEYS[option])}
          </option>
        ))}
      </select>
    </div>
  );
}
