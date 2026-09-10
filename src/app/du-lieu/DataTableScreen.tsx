'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import {
  MAX_SERIES_ROWS,
  PRICE_SERIES_KEY,
  appendRow,
  checkSeries,
  defaultPresetPicks,
  emptyRow,
  formatNumber,
  parseStoredSeries,
  removeRow,
  serializeStoredSeries,
  sortRowsByDate,
  toCsv,
  updateRow,
} from '@/application';
import type { CandleRange, PasteResult, Preset, SeriesRow } from '@/application';
import { useT } from '@/application/preferences-context';
import { NumberCell } from '@/ui/inputs';
import { Button } from '@/ui/primitives';
import { CandleChart } from '@/ui/series';
import { PasteImportSheet, PresetSheet } from '@/ui/sheets';

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
 * Nên phép lật nằm ở đúng một chỗ: `hienThi` ngay dưới. Mọi thứ khác — lưu, kiểm, xuất CSV, vẽ
 * biểu đồ — vẫn làm việc trên mảng thời gian thật.
 */

/** Sáu cột của bảng, đúng thứ tự wireframe. */
const COLUMNS = [
  { key: 'date', label: 'series.colDate' },
  { key: 'open', label: 'series.colOpen' },
  { key: 'high', label: 'series.colHigh' },
  { key: 'low', label: 'series.colLow' },
  { key: 'close', label: 'series.colClose' },
  { key: 'volume', label: 'series.colVolume' },
] as const;

/** Số phiên tối thiểu để Beta và Sharpe có ý nghĩa thống kê — cùng ngưỡng với cảnh báo WF-15. */
const MIN_USABLE_ROWS = 60;

/** id của ô ngày trên một dòng — chỗ mà nút "Tới dòng N" nhảy tới. */
function oNgayId(index: number): string {
  return `o-ngay-${String(index)}`;
}

interface SeriesRowFieldsProps {
  row: SeriesRow;
  /** Vị trí trong mảng `rows` — dùng cho mọi lời gọi ngược lên màn. */
  index: number;
  /** Số dòng NGƯỜI DÙNG ĐẾM BẰNG MẮT, đếm từ 1 ở dòng trên cùng. Khác `index` vì bảng lật. */
  displayNumber: number;
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
  bad,
  onChange,
  onRemove,
  onLeave,
}: SeriesRowFieldsProps) {
  const t = useT();
  return (
    <tr
      className={bad ? styles.badRow : undefined}
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
      <td className={styles.flagCol}>
        {bad && (
          <span className={styles.flag} aria-hidden="true">
            !
          </span>
        )}
      </td>

      {COLUMNS.map((column) => (
        <td key={column.key}>
          {column.key === 'date' ? (
            <input
              id={oNgayId(index)}
              className={`${styles.cell} ${styles.dateCell}`}
              inputMode="text"
              aria-label={`${t('series.rowLabel')} ${displayNumber} · ${t(column.label)}`}
              value={row.date}
              onChange={(event) => {
                onChange(index, { date: event.target.value });
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

      <td className={styles.flagCol}>
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

  /*
   * Đọc localStorage trong effect, KHÔNG đọc lúc khởi tạo state: bản build là HTML tĩnh nên
   * lần render đầu ở máy khách phải giống hệt lúc build, nếu không lệch hydration (bài học đợt 2).
   */
  useEffect(() => {
    try {
      const stored = parseStoredSeries(window.localStorage.getItem(PRICE_SERIES_KEY));
      setCode(stored.code);
      /* Sắp một lần lúc nạp: bảng cũ trong máy có thể đã lộn thứ tự từ một lần dán ngược. */
      setRows(sortRowsByDate(stored.rows));
    } catch {
      // localStorage bị chặn (chế độ riêng tư của Safari) — màn vẫn dùng được, chỉ không nhớ.
    }
    setLoaded(true);
  }, []);

  // Ghi lại sau mỗi lần sửa. Chỉ ghi sau khi đã đọc xong, nếu không lần render đầu sẽ
  // đè bảng rỗng lên dữ liệu người dùng đã có.
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(PRICE_SERIES_KEY, serializeStoredSeries({ code, rows }));
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
   * Thứ tự BÀY RA MÀN: ngày mới nhất trước.
   *
   * Chỉ đảo chiều, không sắp lại — `rows` vốn đã theo ngày (xem `onLeave` và lúc nạp). Nhờ vậy
   * vị trí bày ra suy được bằng một phép trừ, và nút "Tới dòng N" ở cột kiểm tra dịch qua lại
   * giữa hai hệ mà không phải dò.
   */
  const hienThi = useMemo(() => rows.map((row, index) => ({ row, index })).reverse(), [rows]);

  /** Vị trí bày ra của một dòng, đếm từ 1 — con số mà mọi nhãn và mọi câu báo lỗi phải dùng. */
  const soDong = useCallback((index: number) => rows.length - index, [rows.length]);

  // Ba callback này phải ổn định qua các lần render, nếu không memo của từng dòng vô tác dụng.
  const setCell = useCallback((index: number, patch: Partial<SeriesRow>) => {
    setRows((current) => updateRow(current, index, patch));
  }, []);

  const dropRow = useCallback((index: number) => {
    setRows((current) => removeRow(current, index));
  }, []);

  /**
   * Tiêu điểm vừa rời khỏi một dòng — lúc này mới xếp lại theo ngày.
   *
   * Đây là vế thứ hai của yêu cầu chủ dự án: dòng mới hiện ngay trên đầu, *"sau khi nhập liệu
   * xong rồi mới check ngày rồi sort"*. Dòng chưa có ngày đọc được thì `sortRowsByDate()` để
   * nguyên tại chỗ, nên dòng vừa thêm ở lại đầu bảng cho tới khi ô ngày có nội dung thật.
   */
  const onLeave = useCallback(() => {
    setRows((current) => sortRowsByDate(current));
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
    setRows(
      sortRowsByDate(
        preset.bars.slice(-MAX_SERIES_ROWS).map((bar) => ({
          date: bar.date,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume,
        })),
      ),
    );
  }, []);

  /** Nhận kết quả từ sheet WF-11. Dán ĐÈ bảng cũ chứ không nối thêm — nối thì sinh ngày trùng. */
  const importPaste = useCallback((result: PasteResult) => {
    setFromDraft(false);
    setRows(
      sortRowsByDate(
        result.rows.slice(0, MAX_SERIES_ROWS).map((bar) => ({
          date: bar.date,
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
  }, [t]);

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
                <p className={styles.cardHint}>{t('series.tableHint')}</p>
              </div>

              {/* Khung cuộn ngang riêng — bảng 6 cột không thể vừa 360px, và cả trang thì
                  KHÔNG được tràn ngang (bài học đợt 7 với bảng lịch trả nợ WF-14). */}
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.flagCol}>
                        <span className="visually-hidden">{t('series.rowLabel')}</span>
                      </th>
                      {COLUMNS.map((column) => (
                        <th key={column.key} scope="col">
                          {t(column.label)}
                        </th>
                      ))}
                      <th className={styles.flagCol}>
                        <span className="visually-hidden">{t('series.removeRow')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {hienThi.map((entry) => (
                      <SeriesRowFields
                        key={entry.index}
                        row={entry.row}
                        index={entry.index}
                        displayNumber={soDong(entry.index)}
                        bad={issueByIndex.has(entry.index)}
                        onChange={setCell}
                        onRemove={dropRow}
                        onLeave={onLeave}
                      />
                    ))}
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
        onClose={() => {
          setSheet(null);
        }}
        onImport={importPaste}
      />
    </div>
  );
}
