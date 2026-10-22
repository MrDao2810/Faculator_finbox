/**
 * Tầng DOMAIN — những DẠNG VẼ mà một hình đang mời (21/10/2026).
 *
 * Trước ngày này mỗi hình đường chỉ có hai nút Đường / Cột, và hình bóc tách không có nút nào. Chủ
 * dự án: _"biểu đồ tôi đang muốn hướng đến nhiều dạng vẽ khác nhau … hiện tại đang chỉ là 2 dạng
 * nên quá eo hẹp"_, rồi chốt bốn nhóm dạng mới và một luật: **mỗi dạng chỉ hiện ở hình hợp với
 * nó**. Hàm dưới là luật ấy. Ô chọn "Loại biểu đồ" (`ChartKindSelect`) chỉ liệt kê đúng những gì nó
 * trả về, nên một dạng vẽ ra sẽ đọc sai thì không bao giờ có mặt để bấm.
 *
 * Mọi dạng ở đây vẽ CÙNG một bộ điểm của mô hình, không đổi dữ liệu, không đổi trục; khác nhau ở
 * cách chiếu lên hình. Vì thế chúng là một ô chọn cạnh ô "Xem theo", không phải mục của ô ấy.
 *
 * Không có dạng "đường mượt": nối hai mức đã tính bằng một đường cong là vẽ ra những giá trị không
 * ai tính, đúng thứ `linePath()` sinh ra để cấm (FR-06).
 */

import { formatNumber } from '../format';
import type { FormulaSpec } from '../registry/types';
import type { Bilingual } from '../types';

import { COMPOSITION_KEY } from './composition';
import { HISTORY_KEY } from './history';
import { DRAWDOWN_KEY } from './series-view';
import type { ChartPoint, DrawableChart, LineChart, SeriesTone, WaterfallChart } from './types';

/**
 * Một dạng vẽ.
 *
 * - `line` — đường nối các mức, tô dải dưới đường (dạng mặc định, như trước).
 * - `candle` — nến của từng phiên dưới đường kết quả. Chỉ trên trục thời gian của công thức có kết
 *   quả là một mức giá, khi mọi phiên đủ bốn giá (`LineChart.candles`).
 * - `bar` — cột đứng trên mốc 0.
 * - `dots` — một chấm ở mỗi mức đã tính, không nối. Thấy được từng điểm rời mà dạng đường bỏ sót.
 * - `step` — bậc thang: mỗi mức giữ nguyên tới mức kế tiếp. Chỉ ở trục RỜI RẠC.
 * - `signArea` — tô phần trên 0 một màu, phần dưới 0 màu khác. Chỉ khi kết quả đổi dấu.
 * - `waterfall` — các thanh bóc tách nằm ngang (dạng mặc định của hình bóc tách).
 *   (Histogram "Phân phối lợi suất" dùng lại `bar` và chỉ có dạng ấy.)
 * - `donut` — vành khuyên: mỗi phần chiếm bao nhiêu trong tổng. Chỉ khi mọi phần đều cộng vào.
 */
export type DangVe =
  | 'line'
  | 'candle'
  | 'bar'
  | 'dots'
  | 'step'
  | 'signArea'
  | 'waterfall'
  | 'donut';

/** Vành khuyên có tối đa bấy nhiêu phần — đúng số tông màu đã có kiểm tương phản ở hai bảng màu. */
const VANH_KHUYEN_TOI_DA = 4;

/** Thứ tự tông của các phần vành khuyên. Muốn phần thứ năm thì mở tông mới, xem `SeriesTone`. */
const TONG_VANH_KHUYEN: ReadonlyArray<SeriesTone> = ['primary', 'teal', 'violet', 'muted'];

/** Điểm tính được. */
function giaTri(points: ReadonlyArray<ChartPoint>): number[] {
  return points.flatMap((point) => (point.y !== null && Number.isFinite(point.y) ? [point.y] : []));
}

/** Kết quả có cả phần dương lẫn phần âm — đổi dấu trong dải đang vẽ. */
export function coDoiDau(points: ReadonlyArray<ChartPoint>): boolean {
  const ys = giaTri(points);
  return ys.some((y) => y > 0) && ys.some((y) => y < 0);
}

/**
 * Đơn vị của một ô ĐẾM kỳ: trục theo những ô này chỉ có các mức nguyên, không có gì nằm giữa.
 *
 * Không hỏi "các mức có phải số nguyên không": trục Giá thị trường 46.000 → 138.000 ₫ cũng toàn số
 * nguyên mà vẫn liên tục, và bản đầu hỏi đúng câu ấy nên mời bậc thang cho cả P/E theo giá.
 */
const DON_VI_DEM: ReadonlySet<string> = new Set(['năm', 'tháng', 'kỳ', 'phiên', 'ngày']);

/**
 * Trục ngang có RỜI RẠC hay không — điều kiện để mời dạng bậc thang.
 *
 * Bậc thang nói "giá trị giữ nguyên cho tới mức kế tiếp", nên chỉ đúng khi giữa hai mức thật sự
 * không có gì để tính. Ba trường hợp:
 *
 * - trục thời gian: từng phiên một;
 * - trục theo một ô ĐẾM kỳ (năm, tháng, kỳ, phiên, ngày) mà các mức quét phủ KÍN lưới bước của ô
 *   ấy (5, 6, 7 … năm). Phủ thưa (cứ 17 phiên một mức) thì giữa hai mức còn những số phiên khác cho
 *   kết quả khác, và một bậc bằng phẳng ở đó là nói dối;
 * - kết quả tự làm tròn thành bậc (số hợp đồng tối đa, cỡ vị thế, số kỳ DCA): số mức khác nhau
 *   không quá nửa số điểm. Ở đó chính dạng Đường mới vẽ sai, bằng những đoạn xiên giữa hai bậc.
 *
 * Trên một trục liên tục như giá thị trường, bậc thang vẽ ra những đoạn bằng phẳng không có thật.
 *
 * @param spec công thức đang vẽ — để biết đơn vị và bước của ô nằm trên trục ngang.
 */
export function laTrucRoiRac(model: LineChart, spec: FormulaSpec): boolean {
  /* Trục thời gian và đường sụt giảm: từng phiên một. */
  if (model.sweepKey === HISTORY_KEY || model.sweepKey === DRAWDOWN_KEY) return true;

  const bien = spec.variables.find((variable) => variable.key === model.sweepKey);
  if (bien !== undefined && DON_VI_DEM.has(bien.unit)) {
    const buoc = bien.step ?? 1;
    const xs = model.points.map((point) => point.x);
    const kinLuoi =
      xs.length >= 2 &&
      xs.every((x) => Math.abs(x - Math.round(x)) < 1e-9) &&
      xs.every((x, index) => index === 0 || Math.abs(x - (xs[index - 1] ?? x) - buoc) < 1e-9);
    if (kinLuoi) return true;
  }

  /*
   * Kết quả tự đi thành bậc: số mức khác nhau không quá nửa số điểm tính được. Đường phẳng (một
   * mức duy nhất) không tính — vẽ nó thành bậc thang vẫn là chính đường phẳng ấy.
   */
  const ys = giaTri(model.points);
  const soMuc = new Set(ys.map((y) => Number(y.toPrecision(10)))).size;
  return ys.length > 4 && soMuc >= 2 && soMuc <= ys.length / 2;
}

/**
 * Các phần (không kể cột tổng) của hình bóc tách vẽ được thành vành khuyên, hoặc `null`.
 *
 * Một phần BẰNG 0 vẫn được (22/10/2026, cùng đợt hình cơ cấu): doanh nghiệp không nợ đồng nào là
 * 100 % vốn chủ, gửi với lãi suất 0 là 100 % tiền gốc — múi rỗng, chú giải ghi "chiếm 0,0 %". Phần
 * ÂM thì không, và phải có ít nhất một phần dương để có gì mà chia.
 */
function phanCong(model: WaterfallChart) {
  const parts = model.bars.filter((bar) => bar.isTotal !== true);
  const hopLe =
    parts.length >= 2 &&
    parts.length <= VANH_KHUYEN_TOI_DA &&
    parts.every((bar) => Number.isFinite(bar.delta) && bar.delta >= 0) &&
    parts.some((bar) => bar.delta > 0);
  return hopLe ? parts : null;
}

/**
 * Các dạng vẽ của một hình, theo thứ tự in trong ô chọn. Phần tử đầu là dạng MẶC ĐỊNH.
 *
 * - Cột và vùng âm/dương chỉ khi hình có MỘT chuỗi: cột hay mảng tô của chuỗi chính che mất đường
 *   phụ (giá đóng cửa dưới SMA), mà đường phụ là bối cảnh để đọc chuỗi chính.
 * - Điểm và bậc thang đổi riêng chuỗi CHÍNH, chuỗi phụ vẫn là đường, nên hình nhiều chuỗi vẫn mời.
 * - Nến ngay sau Đường, khi mô hình mang `candles`: Domain đã hỏi đủ ba điều (trục thời gian, kết quả
 *   là một mức giá, mọi phiên đủ bốn giá), ở đây chỉ đọc kết quả. Nến không đổi chuỗi chính — đường
 *   kết quả vẫn là đường — nên nó không vướng luật một chuỗi của Cột.
 * - Vành khuyên chỉ khi mọi phần đều dương và cộng vào tổng: một phần TRỪ (tiền mặt của EV, chi đầu
 *   tư của FCFF) không có chỗ nào trên một vòng tròn, vẽ nó thành một múi là nói nó cộng vào.
 */
export function dangVeCuaHinh(model: DrawableChart, spec: FormulaSpec): ReadonlyArray<DangVe> {
  /* Histogram chỉ có một dạng — cột — nên ô "Loại biểu đồ" không hiện với nó. */
  if (model.kind === 'histogram') return ['bar'];
  if (model.kind === 'waterfall') {
    if (phanCong(model) === null) return ['waterfall'];
    /*
     * Hình CƠ CẤU (mục "Cơ cấu …" của ô "Xem theo", 22/10/2026) sinh ra để vẽ vành khuyên, nên mở
     * bằng vành khuyên; thanh ngang là dạng thứ hai. Hình bóc tách giữ thanh ngang đứng đầu như cũ.
     */
    return model.sweepKey === COMPOSITION_KEY ? ['donut', 'waterfall'] : ['waterfall', 'donut'];
  }

  const motChuoi = model.overlays === undefined || model.overlays.length === 0;
  return [
    'line',
    ...(model.candles === undefined ? [] : (['candle'] as const)),
    ...(motChuoi ? (['bar'] as const) : []),
    'dots',
    ...(laTrucRoiRac(model, spec) ? (['step'] as const) : []),
    ...(motChuoi && coDoiDau(model.points) ? (['signArea'] as const) : []),
  ];
}

/** Dạng THẬT SỰ vẽ: dạng người dùng chọn nếu hình còn mời nó, không thì dạng mặc định. */
export function dangVeHieuLuc(model: DrawableChart, chon: DangVe, spec: FormulaSpec): DangVe {
  const dang = dangVeCuaHinh(model, spec);
  return dang.includes(chon) ? chon : (dang[0] ?? 'line');
}

/** Một múi của vành khuyên. */
export interface PhanVanhKhuyen {
  label: Bilingual;
  /** Giá trị đầy đủ kèm đơn vị, như ô của bảng số. */
  valueLabel: string;
  /** Giá trị ở bậc của trục giá trị, như nhãn trên thanh bóc tách. */
  shortValueLabel?: string;
  /** Phần trong tổng, từ 0 tới 1 — dùng để chia góc. */
  share: number;
  /** Phần trong tổng đã viết sẵn, một chữ số thập phân: '64,3 %'. Các phần cộng lại đúng 100,0 %. */
  shareLabel: string;
  tone: SeriesTone;
}

export interface VanhKhuyen {
  parts: ReadonlyArray<PhanVanhKhuyen>;
  /** Tên và giá trị in ở giữa vòng: chính cột tổng của hình bóc tách. */
  totalLabel: Bilingual;
  totalValueLabel: string;
}

/**
 * Chia các phần của hình bóc tách thành vành khuyên, hoặc `null` khi hình không mời dạng này.
 *
 * Phần trăm làm tròn theo lối "dư lớn nhất" chứ không làm tròn từng phần: 64,35 % và 35,65 % làm
 * tròn riêng ra 64,4 và 35,7, cộng lại 100,1 % — một tổng sai in ngay trên hình nói về tổng.
 */
export function vanhKhuyen(model: WaterfallChart): VanhKhuyen | null {
  const parts = phanCong(model);
  if (parts === null) return null;

  const tong = parts.reduce((sum, bar) => sum + bar.delta, 0);
  if (!(tong > 0)) return null;

  const phanMuoi = parts.map((bar) => (bar.delta / tong) * 1000);
  const tron = phanMuoi.map((value) => Math.floor(value));
  let thieu = 1000 - tron.reduce((sum, value) => sum + value, 0);
  const theoDu = phanMuoi
    .map((value, index) => ({ index, du: value - Math.floor(value) }))
    .sort((a, b) => b.du - a.du || a.index - b.index);
  for (const { index } of theoDu) {
    if (thieu <= 0) break;
    tron[index] = (tron[index] ?? 0) + 1;
    thieu -= 1;
  }

  const total = model.bars.find((bar) => bar.isTotal === true);

  return {
    parts: parts.map((bar, index) => ({
      label: bar.label,
      valueLabel: bar.valueLabel,
      ...(bar.shortValueLabel === undefined ? {} : { shortValueLabel: bar.shortValueLabel }),
      share: bar.delta / tong,
      shareLabel: `${formatNumber((tron[index] ?? 0) / 10, { minDecimals: 1, maxDecimals: 1 })} %`,
      tone: TONG_VANH_KHUYEN[index] ?? 'muted',
    })),
    totalLabel: total?.label ?? model.title,
    totalValueLabel: total?.shortValueLabel ?? total?.valueLabel ?? '',
  };
}
