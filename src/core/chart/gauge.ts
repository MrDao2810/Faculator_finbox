/**
 * Tầng DOMAIN — THANG ĐO, mục "Thang đo" của ô "Xem theo" (23/10/2026).
 *
 * Kiểu hình mới thứ tư chủ dự án chọn: nửa vòng cung chia vùng theo đúng các mốc công thức đã khai
 * (`spec.gauge`, ranh giới trùng `spec.referenceLines`), kim chỉ con số ở khối Kết quả. Chỉ có khi
 * kết quả đã tính được — với RSI, Stochastic, %B nghĩa là chuỗi giá đã nạp đủ phiên.
 */

import { formatNumber, formatValueWithUnit, labelInEnglish } from '../format';
import type { FormulaSpec } from '../registry/types';
import type { Bilingual, CalcOutput } from '../types';
import type { ChartModel, GaugeZone, SeriesTone, SweepOption } from './types';

/** Khoá của mục trong ô "Xem theo". Hai gạch dưới đầu, cùng nếp `BREAKDOWN_KEY`. */
export const GAUGE_KEY = '__gauge';

/** Chữ của mục trong ô chọn. */
export const GAUGE_LABEL: Bilingual = { vi: 'Thang đo', en: 'Gauge' };

/**
 * Tông của các vùng: hai đầu thang khác màu nhau, vùng giữa xám. Không xanh / đỏ: thang đo nói
 * VỊ TRÍ của con số, không nói tốt xấu hay mua bán (luật chữ của sản phẩm cấm lời khuyên ấy).
 */
const TONG_VUNG: Readonly<Record<number, ReadonlyArray<SeriesTone>>> = {
  2: ['teal', 'violet'],
  3: ['teal', 'muted', 'violet'],
};

/** Kết quả có trên thang đo không: công thức khai `gauge` và kết quả là một số hữu hạn. */
export function gaugeReady(spec: FormulaSpec, output: CalcOutput): boolean {
  return spec.gauge !== undefined && output.value !== null && Number.isFinite(output.value);
}

/** Một số trên thang, viết gọn kèm đơn vị ('30 điểm'). */
function soThang(value: number, unit: string): string {
  return formatValueWithUnit(value, unit, { maxDecimals: 2 });
}

/**
 * Mô hình thang đo. Gọi khi `gaugeReady()` đúng; ngược lại trả `unavailable` cho chắc, không bao giờ ném.
 */
export function buildGaugeModel(
  spec: FormulaSpec,
  output: CalcOutput,
  name: Bilingual,
  options: ReadonlyArray<SweepOption>,
): ChartModel {
  const thang = spec.gauge;
  const value = output.value;
  if (thang === undefined || value === null || !Number.isFinite(value)) {
    return {
      kind: 'unavailable',
      title: name,
      warning: output.warning ?? {
        code: 'MISSING_SERIES',
        message: {
          vi: 'Chưa có số để đặt lên thang đo.',
          en: 'No figure to place on the gauge yet.',
        },
      },
      options,
      sweepKey: GAUGE_KEY,
    };
  }

  const unit = spec.resultUnit;
  const tong = TONG_VUNG[thang.zones.length] ?? TONG_VUNG[3] ?? [];
  const zones: GaugeZone[] = thang.zones.map((zone, index) => {
    const from = index === 0 ? thang.min : (thang.zones[index - 1]?.to ?? thang.min);
    const dau = index === 0;
    const cuoi = index === thang.zones.length - 1;
    const rangeLabel = dau
      ? `< ${soThang(zone.to, unit)}`
      : cuoi
        ? `> ${soThang(from, unit)}`
        : `${formatNumber(from, { maxDecimals: 2 })} – ${soThang(zone.to, unit)}`;
    return {
      from,
      to: zone.to,
      label: zone.label,
      tone: tong[index] ?? 'muted',
      rangeLabel,
      toLabel: formatNumber(zone.to, { maxDecimals: 2 }),
    };
  });

  const kep = Math.min(Math.max(value, thang.min), thang.max);
  const viTri = zones.findIndex((zone, index) => kep < zone.to || index === zones.length - 1);
  const activeZone = Math.max(0, viTri);
  const vung = zones[activeZone];
  const valueLabel = formatValueWithUnit(value, unit);
  const title = { vi: `${name.vi} — thang đo`, en: `${name.en} — gauge` };

  const keVung = (lang: 'vi' | 'en'): string =>
    zones
      .map(
        (zone) =>
          `${zone.label[lang]} ${lang === 'vi' ? zone.rangeLabel : labelInEnglish(zone.rangeLabel)}`,
      )
      .join(', ');

  return {
    kind: 'gauge',
    title,
    summary: {
      vi: `${name.vi} đang ở ${valueLabel}, trong vùng ${vung?.label.vi ?? ''}. Các vùng: ${keVung('vi')}.`,
      en: `${name.en} is at ${labelInEnglish(valueLabel)}, in the ${vung?.label.en ?? ''} zone. Zones: ${keVung('en')}.`,
    },
    min: thang.min,
    max: thang.max,
    minLabel: formatNumber(thang.min, { maxDecimals: 2 }),
    maxLabel: formatNumber(thang.max, { maxDecimals: 2 }),
    value,
    valueLabel,
    zones,
    activeZone,
    table: {
      columns: [
        { vi: 'Vùng', en: 'Zone' },
        { vi: 'Khoảng', en: 'Range' },
      ],
      rows: [
        ...zones.map((zone) => [zone.label, zone.rangeLabel] as const),
        [{ vi: 'Giá trị hiện tại', en: 'Current value' }, valueLabel] as const,
      ],
    },
    options,
    sweepKey: GAUGE_KEY,
  };
}
