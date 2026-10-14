'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';

import { formatNumber, isCalculated } from '@/application';
import type { CalcOutput } from '@/application';
import { usePick, useT } from '@/application/preferences-context';
import { HiddenByLevelNote } from '@/ui/browse';
import { useCalcText } from '@/ui/i18n/units';
import { coChoNgat } from '@/ui/result';

import { ExpandToggle } from './ExpandToggle';
import { KhungCho } from './KhungCho';
import styles from './PortfolioSummary.module.css';

/**
 * Thẻ tóm tắt ở cột trái màn Danh mục — thay sáu ô `StatTile` đầu màn (12/10/2026, thiết kế hai cột).
 *
 * Mọi con số ở đây vẫn là KẾT QUẢ TÍNH nên đi qua `CalcOutput`: thiếu dữ liệu thì in `_ _` kèm lý do,
 * không bao giờ in 0 (FR-06). Đó là điều `StatTile` đã giữ và thẻ này phải giữ y nguyên — một danh mục
 * mới toanh có tổng giá trị CHƯA XÁC ĐỊNH, không phải 0 ₫.
 *
 * ── Ba điều mang sang từ `StatTile`, vì chúng là bài học chứ không phải kiểu dáng ────────────────
 *
 * 1. Số dài co chữ cho vừa thẻ (29/09/2026): `--ky-tu` là số ký tự của chuỗi, CSS chia bề ngang lòng
 *    thẻ cho nó; `coChoNgat()` chèn chỗ ngắt sau mỗi dấu chấm phân nhóm làm lưới an toàn cuối.
 * 2. Beta và XIRR in `_ _` mà không kèm câu lý do (29/09/2026): với người mới chúng gần như luôn thiếu,
 *    câu lý do thành một đoạn cố định kể lại danh sách mã.
 * 3. Nhãn và giá trị là hai `<span>` ANH EM trong cùng một phần tử cha. `PortfolioScreen.test.tsx`
 *    dò con số bằng `findByText(nhãn).parentElement`; bọc nhãn vào một khối riêng là mười bốn ca đỏ
 *    mà không ca nào nói được lý do thật.
 *
 * Số mã (`summary.count`) KHÔNG còn ở đây: nó nằm ở số đếm trên tab.
 *
 * ── Khổ dưới 1024px: thu gọn còn MỘT hàng (bản vẽ 14/10/2026) ─────────────────────────────────
 *
 * Bản vẽ khổ điện thoại của chủ dự án đặt cả thẻ vào một hàng: "Tổng giá trị 170.245.000 đ ↑ +3,88%"
 * và một mũi tên. Bấm mũi tên thì phần còn lại mở ra ngay dưới. Thẻ cũ cao ~310px ở 390px, tức gần nửa
 * màn đầu tiên trước khi tới dòng mã nào.
 *
 * Phần đóng lại được ẨN BẰNG CSS, không gỡ khỏi DOM: dải giá phiên mang `role="status"` mà màn chỉ có
 * đúng một, và từ 1024px thẻ luôn mở (nút mũi tên `display: none`) — gỡ khỏi DOM thì khổ PC phải đợi
 * một cú bấm không có nút để bấm. Trạng thái mở/đóng nằm trong thẻ, nên đổi tab là đóng lại.
 */

/** Chuỗi cỡ chữ co theo độ dài — xem `.heroValue` trong CSS. */
function charCount(text: string): CSSProperties {
  return { '--ky-tu': text.length } as CSSProperties;
}

interface RowProps {
  label: string;
  output: CalcOutput;
  decimals?: number;
  /** In câu lý do dưới `_ _` khi không tính được. Mặc định có; Beta và XIRR tắt. */
  showReason?: boolean;
  /**
   * Số TRẦN, kèm đúng hậu tố này thay vì đơn vị của `CalcOutput` ('lần', '%/năm', '₫').
   *
   * Bản thiết kế 12/10/2026 in `1,04` cho Beta, `14,2 %` cho XIRR và `195.750.000` cho vốn: nhãn bên
   * trái đã nói đại lượng, còn đơn vị tiền nằm ở số lớn phía trên. Chưa tính được thì vẫn `_ _` trơn
   * (FR-06) — không có số nào để gắn hậu tố vào.
   */
  suffix?: string;
}

/** Một dòng "nhãn … giá trị" của thẻ. */
function Row({ label, output, decimals = 0, showReason = true, suffix }: RowProps) {
  const pick = usePick();
  const calcText = useCalcText();
  const empty = !isCalculated(output);
  const text =
    !isCalculated(output) || suffix === undefined
      ? calcText(output, { maxDecimals: decimals })
      : `${formatNumber(output.value, { maxDecimals: decimals }) ?? '_ _'}${suffix}`;

  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={empty ? `${styles.rowValue} ${styles.muted}` : styles.rowValue}>
        {coChoNgat(text)}
      </span>
      {output.warning !== undefined && showReason && (
        <span className={styles.reason}>{pick(output.warning.message)}</span>
      )}
    </div>
  );
}

/**
 * Dòng lãi/lỗ dưới số lớn: `+3.950.000 ₫ ↑ +2,02%`.
 *
 * Dấu +/− nằm TRONG chữ chứ không chỉ ở màu và mũi tên (NFR-USA-06): đây là chỗ màu xanh và màu đỏ nói
 * ngược nhau nên nó phải đọc được cả khi không phân biệt màu. Mũi tên chỉ là trang trí (`aria-hidden`).
 *
 * Không tính được thì dòng này KHÔNG dựng: lý do đã nằm ngay dưới số lớn, và một dòng `_ _` không nhãn
 * đứng riêng thì không ai biết nó là con số nào. Nhãn "Lãi/lỗ" có mặt cho trình đọc màn hình
 * (`visually-hidden`) vì ảnh thiết kế không vẽ nó — con số xanh đứng một mình chỉ người nhìn đoán ra.
 */
function GainLine({
  gain,
  gainPercent,
  loading,
}: {
  gain: CalcOutput;
  gainPercent: CalcOutput;
  loading: boolean;
}) {
  const t = useT();
  if (!isCalculated(gain)) return null;

  const up = gain.value >= 0;
  const sign = up ? '+' : '−';
  const amount = formatNumber(Math.abs(gain.value), { maxDecimals: 0 });
  const percent = isCalculated(gainPercent)
    ? formatNumber(Math.abs(gainPercent.value), { minDecimals: 2, maxDecimals: 2 })
    : null;

  return (
    <div className={`${styles.gain} ${up ? styles.up : styles.down}`}>
      <span className="visually-hidden">{t('portfolio.gain')}</span>{' '}
      <span className={styles.gainAmount}>
        <KhungCho cho={loading}>
          {sign}
          {amount ?? '_ _'} ₫
        </KhungCho>
      </span>
      {percent !== null && (
        <span className={styles.gainPercent}>
          <KhungCho cho={loading}>
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
            {sign}
            {percent}%
          </KhungCho>
        </span>
      )}
    </div>
  );
}

export interface HoldingsSummaryProps {
  totalValue: CalcOutput;
  totalCost: CalcOutput;
  gain: CalcOutput;
  gainPercent: CalcOutput;
  beta: CalcOutput;
  xirr: CalcOutput;
  /** Chế độ Nâng cao mở thêm dòng Beta và XIRR — FR-09. */
  advanced: boolean;
  /** Số dòng chế độ Cơ bản giấu, để câu "N ô nâng cao đang ẩn" nói đúng. */
  hiddenCount: number;
  /**
   * Chân thẻ — dải thị giá (ngày phiên, trạng thái, nút Làm mới).
   *
   * Do màn dựng rồi truyền vào, không phải thẻ tự dựng: dải ấy sống bằng state tra giá của cả màn
   * (đang tải, hỏng, giá cũ) và có `role="status"`/`"alert"` mà ca kiểm đòi đúng MỘT phần tử.
   */
  footer: ReactNode;
  /**
   * Chân thẻ phải hiện cả khi thẻ đang thu gọn ở khổ điện thoại — đúng khi thị giá là giá CŨ hoặc tra
   * hỏng. Giá cũ chỉ được phép đứng trên màn khi màn nêu tên phiên của nó (`price-cache-store.ts`), mà
   * ngày phiên nằm ở chân thẻ; thu nó vào sau một mũi tên là để giá cũ đứng một mình.
   */
  footerUrgent?: boolean;
  /**
   * Thị giá đang được tra (lần đầu, hoặc người dùng bấm Làm mới). Tổng giá trị và dòng lãi/lỗ tính từ
   * thị giá nên thành vệt chờ (`KhungCho`), cùng lúc với các ô sống theo giá của bảng; câu lý do dưới
   * số lớn tạm ẩn — "thiếu thị giá" lúc giá đang về là nói sai. "Vốn đã bỏ ra" không phụ thuộc giá nên
   * đứng yên.
   */
  loading?: boolean;
}

/** Thẻ tóm tắt của tab Mã. */
export function HoldingsSummary({
  totalValue,
  totalCost,
  gain,
  gainPercent,
  beta,
  xirr,
  advanced,
  hiddenCount,
  footer,
  footerUrgent = false,
  loading = false,
}: HoldingsSummaryProps) {
  const t = useT();
  const pick = usePick();
  const calcText = useCalcText();
  const valueText = calcText(totalValue, { maxDecimals: 0 });
  const valueEmpty = !isCalculated(totalValue);
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.card} data-mo={open ? '' : undefined}>
      <div className={styles.hero}>
        <span className={styles.heroLabel}>{t('portfolio.totalValue')}</span>
        {/*
          `--ky-tu` đếm trên CHUỖI lúc dựng, không đo lúc chạy: đo thì lượt dựng đầu ở máy khách lệch
          HTML tĩnh (cùng lý do ở `StatTile.tsx`).
        */}
        <span
          className={valueEmpty ? `${styles.heroValue} ${styles.muted}` : styles.heroValue}
          style={charCount(valueText)}
        >
          <KhungCho cho={loading}>{coChoNgat(valueText)}</KhungCho>
        </span>
        {totalValue.warning !== undefined && !loading && (
          <span className={styles.reason}>{pick(totalValue.warning.message)}</span>
        )}
        {/*
          Dòng lãi/lỗ nằm TRONG khối số lớn (14/10/2026), không còn là anh em của nó: ở hàng thu gọn
          của khổ điện thoại, phần trăm phải đứng ngay sau con số như bản vẽ. Khổ PC không đổi gì nhìn
          thấy được — `.hero > .gain` bù lại khoảng cách cũ.
        */}
        <GainLine gain={gain} gainPercent={gainPercent} loading={loading} />
        <ExpandToggle
          open={open}
          controls={`${SUMMARY_MORE_ID} ${SUMMARY_FOOT_ID}`}
          label={t('portfolio.details')}
          onToggle={() => {
            setOpen((now) => !now);
          }}
        />
      </div>

      <div className={styles.more} id={SUMMARY_MORE_ID}>
        <div className={styles.rows}>
          <Row label={t('portfolio.totalCost')} output={totalCost} suffix="" />
          {advanced && (
            <>
              <Row
                label={t('portfolio.beta')}
                output={beta}
                decimals={2}
                showReason={false}
                suffix=""
              />
              <Row
                label={t('portfolio.xirr')}
                output={xirr}
                decimals={1}
                showReason={false}
                suffix=" %"
              />
            </>
          )}
        </div>

        {/*
        Dòng "2 ô nâng cao đang ẩn · Bật chế độ Nâng cao" nằm NGAY dưới các dòng số, đúng chỗ câu hỏi
        "còn gì nữa không" nảy ra — trình đọc màn hình gặp nó ngay sau các dòng ấy.
      */}
        {!advanced && <HiddenByLevelNote count={hiddenCount} labelKey="portfolio.hiddenByLevel" />}
      </div>

      <div
        className={`${styles.footer} ${styles.footPrice}`}
        id={SUMMARY_FOOT_ID}
        data-luon-hien={footerUrgent ? '' : undefined}
      >
        {footer}
      </div>
    </div>
  );
}

/*
 * id tĩnh chứ không `useId()`: mỗi lúc chỉ một thẻ tóm tắt nằm trong DOM (thẻ đổi theo tab), và id
 * tĩnh thì HTML tĩnh với lượt dựng đầu ở máy khách khớp nhau mà không phải nghĩ.
 */
const SUMMARY_MORE_ID = 'portfolio-summary-more';
const SUMMARY_FOOT_ID = 'portfolio-summary-foot';

export interface SavedSummaryProps {
  /** Tổng số phép tính đang lưu. */
  count: number;
  /** Số mã khác nhau mà các phép tính gắn vào. */
  tickers: number;
  /** Số công thức khác nhau. */
  formulas: number;
  /** Số phép tính đang cần nạp lại chuỗi giá. */
  reload: number;
  /** Ngày lưu gần nhất, ĐÃ định dạng. `null` khi kho rỗng. */
  lastSaved: string | null;
  /** Đang tải lại kho phép tính (bấm Làm mới) — số đếm lớn thành vệt chờ, như Tổng giá trị ở tab Mã. */
  loading?: boolean;
}

/**
 * Thẻ tóm tắt của tab Công thức.
 *
 * Dưới 1024px chỉ còn MỘT hàng "Đã lưu N phép tính", KHÔNG có mũi tên mở ra (14/10/2026). Bản đầu của
 * khổ điện thoại chép khuôn thu gọn của thẻ tab Mã: mũi tên "Chi tiết" mở ba dòng đếm (Trên số mã, Công
 * thức khác nhau, Cần nạp lại chuỗi) và ngày lưu gần nhất. Chủ dự án chụp đúng ba dòng ấy: _"bỏ poup như
 * ảnh sau ở màn công thức đi"_. Thẻ không bao giờ mang `data-mo`, nên luật CSS sẵn có
 * (`.card:not([data-mo]) .more`) giữ phần ấy ẩn ở khổ này. Từ 1024px `.more` là `display: contents`
 * và các dòng vẫn đứng trong thẻ như trước: khổ PC không đổi. Thẻ tab Mã giữ mũi tên của nó.
 */
export function SavedSummary({
  count,
  tickers,
  formulas,
  reload,
  lastSaved,
  loading = false,
}: SavedSummaryProps) {
  const t = useT();

  return (
    <div className={styles.card}>
      <div className={styles.hero}>
        <span className={styles.heroLabel}>{t('portfolio.savedStatTitle')}</span>
        <span className={styles.savedCount}>
          <span className={styles.heroValue}>
            <KhungCho cho={loading} vua>
              {formatNumber(count) ?? count}
            </KhungCho>
          </span>{' '}
          <span className={styles.unit}>{t('portfolio.savedStatUnit')}</span>
        </span>
      </div>

      <div className={styles.more}>
        <div className={styles.rows}>
          <PlainRow label={t('portfolio.savedStatTickers')} value={tickers} />
          <PlainRow label={t('portfolio.savedStatFormulas')} value={formulas} />
          {/* Màu cảnh báo chỉ khi CÓ phép tính cần nạp: số 0 màu cam là một cảnh báo không có gì để báo. */}
          <PlainRow label={t('portfolio.savedStatReload')} value={reload} warning={reload > 0} />
        </div>

        {lastSaved !== null && (
          <div className={styles.footer}>
            <p className={styles.footLine}>
              <span>{t('portfolio.savedStatLast')}</span> <span>{lastSaved}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Dòng "nhãn … số nguyên" — các số đếm của thẻ Phép tính đã lưu, không phải `CalcOutput`. */
function PlainRow({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={warning ? `${styles.rowValue} ${styles.warn}` : styles.rowValue}>
        {formatNumber(value) ?? value}
      </span>
    </div>
  );
}
