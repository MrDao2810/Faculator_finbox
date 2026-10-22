'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';

import { vanhKhuyen } from '@/application';
import type { PhanVanhKhuyen, SeriesTone, WaterfallChart as WaterfallModel } from '@/application';
import { usePick, useT } from '@/application/preferences-context';
import { useLabelText } from '@/ui/i18n/units';

import styles from './chart.module.css';
import { textWidth } from './ticks';
import { useChartSize } from './use-chart-size';
import type { ChartSize } from './use-chart-size';

/**
 * Hình bóc tách dạng VÀNH KHUYÊN — mỗi phần chiếm bao nhiêu trong tổng (21/10/2026).
 *
 * Là một DẠNG VẼ khác của cùng mô hình thác nước, không phải một biểu đồ khác: cùng các phần, cùng
 * giá trị, cùng bảng số dưới `<details>` của `ChartFrame`. Thanh ngang nói "phần này lớn bao nhiêu";
 * vành khuyên nói "phần này chiếm mấy phần của tổng" — câu mà người định giá DDM hai giai đoạn hỏi
 * đầu tiên (giá trị cuối kỳ chiếm bao nhiêu của giá cổ phiếu). Chỉ mời khi mọi phần đều cộng vào
 * tổng, xem `dangVeCuaHinh()`.
 *
 * Cùng luật với `LineChart` và `WaterfallChart`: không tính gì (phần trăm đã làm tròn sẵn ở Domain,
 * `vanhKhuyen()`), `viewBox` cố định theo khổ, không đo DOM, không `useId()`.
 *
 * Chú giải nằm TRONG `<svg>`, không phải một danh sách HTML bên cạnh: đường xuất PDF / PNG chép đúng
 * thẻ `<svg>` này (`data-chart-svg`), và một vành khuyên xuất ra mà không có tên phần thì chỉ còn
 * hai mảng màu. Trình đọc màn hình nhận phần trăm qua đoạn ẩn ngay dưới hình, vì `<svg>` bị
 * `aria-hidden` như mọi hình khác.
 */

/*
 * Khung theo khổ. Không ghim tỉ lệ như `.svg`: dùng `.svgStack` của thác nước, chiều cao suy từ
 * `viewBox`. Một vành khuyên cao 400 đơn vị như khung đường sẽ cao gần 600px trên PC cho hai múi.
 *
 * Hai khổ bày chú giải hai kiểu khác nhau (22/10/2026, chủ dự án chụp hình cơ cấu của D/E ở cả hai
 * khổ):
 *
 * - **`compact` (dưới 768px)**: _"giảm size text xuống, padding phải cũng cần giảm xuống để tiết kiệm
 *   không gian hiển thị chart"_. Chữ nhỏ một bậc (`.donutGon` trong CSS), chú giải rộng ĐÚNG bằng chữ
 *   của nó và đặt sát mép phải, vòng lấy hết phần còn lại (bán kính từ `rMin` tới `rMax`). Trước đó
 *   vòng cố định 72 đơn vị và chú giải chiếm cả phần bên phải dù chữ chỉ dùng một nửa.
 * - **`wide` (từ 768px)**: _"màn web pc đang thừa quá nhiều không gian bên phải, đưa text chú thích
 *   giàn trải hiển thị ra nhiều hơn"_. Lượt đầu trải chú giải thành một bảng một-dòng-một-múi tới mép
 *   phải, chữ giữ cỡ 10–11: bề ngang thì kín nhưng hai hàng mảnh nằm giữa một khoảng trống cao 240 đơn
 *   vị, còn vòng thì vẫn bán kính 104. Chủ dự án: _"không gian hiển thị thừa thừa 1 đống ra, không gian
 *   hiển thị của biểu đồ tròn thì có 1 mẩu"_. Lượt hai cho vòng bán kính 136 và chữ 12/16 — lần này
 *   _"lớn quá … không cần quá to"_. Lượt ba giữ vòng 116 (cao kín khung) nhưng chú giải vẫn trải tới
 *   mép phải, "chiếm …" một đầu, tên một đầu, vòng dạt sát mép trái. Chủ dự án khoanh ảnh: _"đưa biểu
 *   đồ tròn dịch sang bên phải như tôi chỉ. còn phần chú thích co lại và dịch tiếp sang bên phải"_.
 *   Lượt bốn làm cột chú giải rộng ĐÚNG bằng chữ, ba dòng một múi — với tên ngắn ("Tiền lãi") cột chỉ
 *   còn một mẩu giữa vùng trống; chủ dự án khoanh cả vùng ấy: _"giàn trải chú thích ra, thừa nhiều không
 *   gian mà. máy móc thế"_. Nay chú giải là một cột CỐ ĐỊNH `chuGiai` đơn vị, lấp từ sát vòng (`gap`) tới
 *   mép phải; mỗi múi hai dòng — ô màu và tên ở đầu trái, "chiếm …" ở mép phải cột; giá trị đậm dòng
 *   dưới — kẻ mảnh suốt bề ngang cột. Vòng giữ cỡ R 116 và đứng ngay trái cột, hở mép trái 140 đơn vị.
 */
const KHO = {
  compact: { W: 320, H: 170, gap: 12, phai: 2, rMin: 64, rMax: 96 },
  wide: { W: 640, H: 240, R: 116, gap: 32, phai: 6, chuGiai: 230 },
} as const;

/** Bán kính lỗ giữa so với bán kính vòng — 64/104 như vòng PC trước nay. */
const TI_LE_LO = 0.615;

/** Lề trái của vòng. */
const LEFT = 8;

/** Lề trên và dưới của khung, khi chú giải cao hơn vòng. */
const LE = 10;

/**
 * Nhịp dọc của chú giải điện thoại, đơn vị viewBox. Mỗi múi ba dòng: tên (một hoặc hai dòng), giá
 * trị, rồi "chiếm …". Giá trị và phần trăm KHÔNG chung một dòng ở khổ này: chỗ quá hẹp để làm hai cột,
 * và với WACC cả hai đều là phần trăm — "7,86 % · 73,2 %" bắt người đọc đoán số nào là phần của tổng.
 * Ở PC phần trăm đứng ở MÉP PHẢI dòng tên, giá trị nằm dòng dưới — hai số vẫn không chung một dòng.
 *
 * `phan` là 13 chứ không 12: dấu chồng của "chiếm" chạm chân dòng giá trị đậm ngay trên nó (đo bằng
 * hộp chữ trên Chrome ở 390px).
 */
const NHIP = { ten: 11, giaTri: 13, phan: 13, giuaHang: 14 } as const;

/**
 * Nhịp dọc của một múi ở chú giải PC: đệm trên tới chân dòng tên đầu, mỗi dòng tên thêm, từ chân
 * dòng tên cuối tới chân dòng giá trị, và đệm dưới. Thoáng hơn bản hai dòng trước (19/20/10) để cột
 * lấp gần hết chiều cao của vòng thay vì một dải mảnh giữa khung.
 */
const MUI_PC = { tren: 22, ten: 14, giaTri: 22, duoi: 14 } as const;

/** Khoảng cách tối thiểu giữa tên và "chiếm …" trên cùng một dòng ở chú giải PC. */
const GIUA_COT = 16;

/**
 * Cỡ chữ (đơn vị viewBox) — khớp `.donutLabel` / `.donutValue` / `.donutTotalLabel` (và `.donutGon …`)
 * trong CSS. `total` là trần của số giữa vòng; nó co lại cho vừa lỗ.
 */
const FONT = {
  compact: { label: 9, value: 10, total: 13 },
  wide: { label: 11, value: 13, total: 18 },
} as const;

/**
 * Chân chữ ở giữa vòng, tính từ tâm: tên của tổng (phía trên), con số tổng khi có tên ở trên nó, và
 * con số tổng khi tên không vừa lỗ nên đứng một mình.
 */
const GIUA_VONG = {
  compact: { ten: -6, tong: 11, tongMotMinh: 5 },
  wide: { ten: -8, tong: 14, tongMotMinh: 6 },
} as const;

/**
 * Hệ số an toàn trên ước lượng `textWidth()` (0,49 em một ký tự) khi xếp chú giải. Đo trên Chrome
 * Windows ngày 22/10/2026, sáu vành khuyên ở 360–1440px (`getComputedTextLength`): chữ thường rộng
 * tới 1,06 lần ước lượng ("Thuế chuyển nhượng"), chữ đậm 0,93–1,07 lần ("7,86 %"). Thiếu hệ số này,
 * chú giải điện thoại — rộng đúng bằng chữ, sát mép phải — cắt mất đuôi tên 3 đơn vị.
 */
const AN_TOAN = { thuong: 1.08, dam: 1.1 } as const;

/** Bề ngang ước của một chuỗi chữ thường. */
function rongThuong(text: string, size: number): number {
  return textWidth(text, size) * AN_TOAN.thuong;
}

/** Bề ngang ước của một chuỗi in đậm. */
function rongDam(text: string, size: number): number {
  return textWidth(text, size) * AN_TOAN.dam;
}

const TONE_CLASS: Readonly<Record<SeriesTone, string>> = {
  primary: styles.tonePrimary ?? '',
  teal: styles.toneSeriesTeal ?? '',
  violet: styles.toneSeriesViolet ?? '',
  muted: styles.toneSeriesMuted ?? '',
};

function f(value: number): string {
  return String(Number(value.toFixed(2)));
}

/** Chuỗi `d` của một múi vành khuyên, từ góc `a0` tới `a1` (radian, theo chiều kim đồng hồ). */
function cungVanh(cx: number, cy: number, R: number, r: number, a0: number, a1: number): string {
  const diem = (ban: number, goc: number) =>
    `${f(cx + ban * Math.cos(goc))},${f(cy + ban * Math.sin(goc))}`;
  /*
   * Múi trọn vòng (một phần chiếm 100 %, các phần kia bằng 0 — hình cơ cấu của doanh nghiệp không nợ,
   * 22/10/2026). Một cung SVG có điểm đầu trùng điểm cuối thì không vẽ gì, nên vòng ngoài và vòng
   * trong mỗi vòng đi hai nửa; vòng trong đi NGƯỢC chiều để luật tô `nonzero` khoét lỗ giữa.
   */
  if (a1 - a0 >= 2 * Math.PI - 1e-9) {
    const nua = a0 + Math.PI;
    return [
      `M${diem(R, a0)}`,
      `A${f(R)},${f(R)} 0 1 1 ${diem(R, nua)}`,
      `A${f(R)},${f(R)} 0 1 1 ${diem(R, a0)}`,
      'Z',
      `M${diem(r, a0)}`,
      `A${f(r)},${f(r)} 0 1 0 ${diem(r, nua)}`,
      `A${f(r)},${f(r)} 0 1 0 ${diem(r, a0)}`,
      'Z',
    ].join(' ');
  }
  const lon = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M${diem(R, a0)}`,
    `A${f(R)},${f(R)} 0 ${String(lon)} 1 ${diem(R, a1)}`,
    `L${diem(r, a1)}`,
    `A${f(r)},${f(r)} 0 ${String(lon)} 0 ${diem(r, a0)}`,
    'Z',
  ].join(' ');
}

/** Ngắt một nhãn thành tối đa hai dòng vừa bề ngang `rong` (đơn vị viewBox). */
function haiDong(text: string, rong: number, size: number): [string, string?] {
  if (rongThuong(text, size) <= rong) return [text];
  const words = text.split(' ');
  for (let cut = words.length - 1; cut > 0; cut--) {
    const head = words.slice(0, cut).join(' ');
    if (rongThuong(head, size) <= rong) return [head, words.slice(cut).join(' ')];
  }
  return [text];
}

export interface DonutChartProps {
  model: WaterfallModel;
  /** Gốc của `data-chart-svg` — cùng lý do với `LineChart`. */
  idBase: string;
  /** Ép một khổ khung, như `LineChart.size`. */
  size?: ChartSize;
}

/** Một hàng chú giải đã xếp toạ độ — chung cho hai khổ, chỉ khác chỗ đặt. */
interface HangChuGiai {
  part: PhanVanhKhuyen;
  /** Tên, một hoặc hai dòng. */
  dong: [string, string?];
  giaTri: string;
  phan: string;
  /** Toạ độ ô màu. */
  o: { x: number; y: number; size: number };
  /** Toạ độ dòng tên đầu; dòng thứ hai (nếu có) cách `dyTen`. */
  ten: { x: number; y: number; dyTen: number };
  giaTriAt: { x: number; y: number; anchor: 'start' | 'end' };
  phanAt: { x: number; y: number; anchor: 'start' | 'end' };
}

interface BoCuc {
  H: number;
  cx: number;
  R: number;
  r: number;
  hang: HangChuGiai[];
  /** Vạch kẻ giữa các hàng của bảng PC — `y` của từng vạch, từ `x1` tới `x2`. */
  vach: { x1: number; x2: number; ys: number[] };
}

/** Chữ của một múi: tên, giá trị ở bậc của trục, và "chiếm …". */
interface ChuMui {
  part: PhanVanhKhuyen;
  ten: string;
  giaTri: string;
  phan: string;
}

/**
 * Điện thoại: vòng bên trái, chú giải ba dòng một múi SÁT MÉP PHẢI, rộng đúng bằng chữ dài nhất của
 * nó. Vòng lấy phần còn lại, kẹp trong `[rMin, rMax]`.
 */
function boCucDienThoai(chu: ReadonlyArray<ChuMui>): BoCuc {
  const { W, H: hToiThieu, gap, phai, rMin, rMax } = KHO.compact;
  const fo = FONT.compact;
  /* Tên dài hơn chừng này thì xuống dòng — giữ cho vòng không bao giờ teo dưới `rMin`. */
  const tenToiDa = W - phai - LEFT - 2 * rMin - gap - 16;

  const tho = chu.map((mot) => {
    const dong = haiDong(mot.ten, tenToiDa, fo.label);
    const rong = Math.max(
      ...dong.map((line) => rongThuong(line ?? '', fo.label)),
      rongDam(mot.giaTri, fo.value),
      rongThuong(mot.phan, fo.label),
    );
    const themDong = dong[1] === undefined ? 0 : NHIP.ten;
    return { ...mot, dong, rong, themDong, cao: themDong + NHIP.giaTri + NHIP.phan };
  });

  const legendW = 16 + Math.max(...tho.map((row) => row.rong));
  const legendX = W - phai - legendW;
  const R = Math.min(rMax, Math.max(rMin, (legendX - gap - LEFT) / 2));
  const cx = LEFT + R;

  /* Dòng đầu của một múi là đường chân chữ cỡ 9: cộng 8 để mép trên của chữ chạm `top`. */
  const caoChuGiai =
    tho.reduce((sum, row) => sum + row.cao, 0) + NHIP.giuaHang * (tho.length - 1) + 8;
  const H = Math.max(hToiThieu, 2 * R + 2 * LE, caoChuGiai + 2 * LE);
  const cy = H / 2;

  let top = cy - caoChuGiai / 2 + 8;
  const hang = tho.map((row) => {
    const xChu = legendX + 16;
    const yGiaTri = top + row.themDong + NHIP.giaTri;
    const mot: HangChuGiai = {
      part: row.part,
      dong: row.dong,
      giaTri: row.giaTri,
      phan: row.phan,
      o: { x: legendX, y: top - 8, size: 10 },
      ten: { x: xChu, y: top, dyTen: NHIP.ten },
      giaTriAt: { x: xChu, y: yGiaTri, anchor: 'start' },
      phanAt: { x: xChu, y: yGiaTri + NHIP.phan, anchor: 'start' },
    };
    top += row.cao + NHIP.giuaHang;
    return mot;
  });

  return { H, cx, R, r: R * TI_LE_LO, hang, vach: { x1: 0, x2: 0, ys: [] } };
}

/**
 * PC: chú giải là một cột CỐ ĐỊNH lấp từ sát vòng tới mép phải — bề ngang không đổi theo độ dài tên, để
 * tên ngắn không để lại một mảng trống. Mỗi múi hai dòng: ô màu và tên ở đầu trái, "chiếm …" ở mép phải
 * cột; giá trị đậm dòng dưới. Vạch mảnh suốt bề ngang cột giữa các múi, cả cột đứng giữa theo chiều dọc.
 * Vòng bán kính cố định, đứng ngay trái cột.
 */
function boCucPC(chu: ReadonlyArray<ChuMui>): BoCuc {
  const { W, H: hToiThieu, R, gap, phai, chuGiai } = KHO.wide;
  const fo = FONT.wide;
  const mepPhai = W - phai;
  const legendX = mepPhai - chuGiai;
  const cx = legendX - gap - R;
  const o = 11;
  const xChu = legendX + o + 8;

  /* Tên dài hơn phần cột còn lại sau "chiếm …" thì xuống dòng. */
  const rongPhan = Math.max(...chu.map((mot) => rongThuong(mot.phan, fo.label)));
  const tenToiDa = mepPhai - rongPhan - GIUA_COT - xChu;

  const tho = chu.map((mot) => {
    const dong = haiDong(mot.ten, tenToiDa, fo.label);
    const themDong = dong[1] === undefined ? 0 : MUI_PC.ten;
    return { ...mot, dong, themDong, cao: MUI_PC.tren + themDong + MUI_PC.giaTri + MUI_PC.duoi };
  });

  const caoBang = tho.reduce((sum, row) => sum + row.cao, 0);
  const H = Math.max(hToiThieu, 2 * R + 2 * LE, caoBang + 2 * LE);
  const cy = H / 2;

  let top = cy - caoBang / 2;
  const vachYs: number[] = [];
  const hang = tho.map((row, index) => {
    if (index > 0) vachYs.push(top);
    const chanTen = top + MUI_PC.tren;
    const mot: HangChuGiai = {
      part: row.part,
      dong: row.dong,
      giaTri: row.giaTri,
      phan: row.phan,
      /* Ô màu đứng ngang chữ cỡ 11: đáy ô ở chân dòng tên. */
      o: { x: legendX, y: chanTen - o + 1, size: o },
      ten: { x: xChu, y: chanTen, dyTen: MUI_PC.ten },
      giaTriAt: { x: xChu, y: chanTen + row.themDong + MUI_PC.giaTri, anchor: 'start' },
      phanAt: { x: mepPhai, y: chanTen, anchor: 'end' },
    };
    top += row.cao;
    return mot;
  });

  return {
    H,
    cx,
    R,
    r: R * TI_LE_LO,
    hang,
    vach: { x1: legendX, x2: mepPhai, ys: vachYs },
  };
}

export function DonutChart({ model, idBase, size: sizeProp }: DonutChartProps) {
  const t = useT();
  const pick = usePick();
  const labelText = useLabelText();
  const sizeTuDo = useChartSize();
  const size = sizeProp ?? sizeTuDo;
  const { W } = KHO[size];
  const fo = FONT[size];

  const vanh = useMemo(() => vanhKhuyen(model), [model]);

  /*
   * Múi đang chọn — popup số liệu của múi ấy (22/10/2026, chủ dự án: "khi hover chuột hoặc bấm vào
   * phần nào thì phần đó hiển thị popup hiển thị số liệu phần đó"). Hai nguồn, hai cách đóng:
   *
   * - `chuot`: con trỏ chuột đang ở trên múi (hoặc dòng chú giải của nó); rời ra là đóng.
   * - `cham`: đã bấm hay chạm — trên điện thoại không có "rê chuột", nên chạm phải giữ popup lại; đóng
   *   khi chạm lại đúng múi ấy, chạm ra ngoài, hoặc Esc.
   *
   * Mang theo `model` để popup của một hình không sống sang hình khác khi ô "Xem theo" đổi mục mà
   * component vẫn được giữ lại — so ngay lúc vẽ, không cần effect nào đặt lại state.
   */
  const [chonTho, setChon] = useState<{
    i: number;
    nguon: 'chuot' | 'cham';
    model: WaterfallModel;
  } | null>(null);
  const chon = chonTho !== null && chonTho.model === model ? chonTho : null;
  const khungRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  /*
   * Điểm neo của popup trên từng múi, đơn vị viewBox, kèm hướng của cung (`dx`, `dy`: cos và sin của góc
   * giữa cung), tâm dọc và bán kính lỗ của vòng — ghi lúc vẽ, đọc lúc đặt popup.
   */
  const neoRef = useRef<
    ReadonlyArray<{ x: number; y: number; dx: number; dy: number; cy: number; r: number }>
  >([]);
  const [viTri, setViTri] = useState<{ left: number; top: number } | null>(null);

  /*
   * Đặt popup ở mép ngoài của múi, bung ra phía ngoài vòng theo hướng của cung (múi ở trên thì popup ở
   * trên, múi bên phải thì popup bên phải…), kẹp trong khung. Phải ĐO (bề ngang khung, cỡ popup): hình co
   * giãn theo bề ngang cột nên một đơn vị viewBox không có số px cố định. Đo trong layout effect, trước
   * khi trình duyệt vẽ, nên popup không nháy ở góc trái trên — và nó chỉ có sau một thao tác của người
   * dùng, nên không đụng tới HTML tĩnh hay lượt hydrate.
   */
  const chiSo = chon?.i ?? null;
  useLayoutEffect(() => {
    const khung = khungRef.current;
    const popup = popupRef.current;
    const neo = chiSo === null ? undefined : neoRef.current[chiSo];
    const svg = khung?.querySelector('svg');
    if (
      khung === null ||
      popup === null ||
      neo === undefined ||
      svg === null ||
      svg === undefined
    ) {
      setViTri(null);
      return;
    }
    const oKhung = khung.getBoundingClientRect();
    const oHinh = svg.getBoundingClientRect();
    const tiLe = oHinh.width / W;
    const x = oHinh.left - oKhung.left + neo.x * tiLe;
    const y = oHinh.top - oKhung.top + neo.y * tiLe;
    const rong = popup.offsetWidth;
    const cao = popup.offsetHeight;
    /* Bung theo hướng của cung: hướng (0, −1) là ngay trên neo, (1, 0) là ngay bên phải neo. */
    const left = x - (rong / 2) * (1 - neo.dx);
    let top = y - (cao / 2) * (1 - neo.dy);
    const leftKep = Math.min(Math.max(left, 0), Math.max(0, oKhung.width - rong));
    /*
     * Phía ngoài không đủ chỗ (múi bên trái, vòng sát mép trái thẻ ở điện thoại): popup bị kẹp ngược
     * vào trong và trùm lên chữ giữa vòng. Khi bị kẹp quá một phần tư bề ngang của nó, dời popup lên
     * trên hoặc xuống dưới phần chữ ấy, theo phía của cung.
     */
    if (Math.abs(leftKep - left) > rong / 4) {
      const tamY = oHinh.top - oKhung.top + neo.cy * tiLe;
      const tranh = neo.r * tiLe * 0.55;
      top = neo.dy >= 0 ? tamY + tranh : tamY - tranh - cao;
    }
    setViTri({
      left: leftKep,
      top: Math.min(Math.max(top, 0), Math.max(0, oKhung.height - cao)),
    });
  }, [chiSo, W]);

  /* Popup đang giữ bằng bấm/chạm: chạm ra ngoài khung hoặc Esc thì đóng. */
  const giuBangCham = chon?.nguon === 'cham';
  useEffect(() => {
    if (!giuBangCham) return undefined;
    const ngoai = (event: PointerEvent) => {
      if (event.target instanceof Node && khungRef.current?.contains(event.target) === true) return;
      setChon(null);
    };
    const esc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setChon(null);
    };
    document.addEventListener('pointerdown', ngoai);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', ngoai);
      document.removeEventListener('keydown', esc);
    };
  }, [giuBangCham]);

  if (vanh === null) return null;

  /* Chuột vào một múi (hoặc dòng chú giải của nó) thì hiện; chạm thì để `bam` lo. */
  const vao = (i: number) => (event: ReactPointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    setChon({ i, nguon: 'chuot', model });
  };
  const roi = (event: ReactPointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    setChon((cu) => (cu?.nguon === 'chuot' ? null : cu));
  };
  const bam = (i: number) => (event: ReactMouseEvent) => {
    /* Không để cú bấm lan lên `<svg>`, nơi bấm vào chỗ trống là đóng popup. */
    event.stopPropagation();
    setChon((cu) =>
      cu !== null && cu.model === model && cu.i === i && cu.nguon === 'cham'
        ? null
        : { i, nguon: 'cham', model },
    );
  };

  const chu: ChuMui[] = vanh.parts.map((part) => ({
    part,
    ten: pick(part.label),
    giaTri: labelText(part.shortValueLabel ?? part.valueLabel),
    phan: t('chart.donutShare').replace('{p}', part.shareLabel),
  }));
  const { H, cx, R, r, hang, vach } = size === 'compact' ? boCucDienThoai(chu) : boCucPC(chu);
  const cy = H / 2;

  let goc = -Math.PI / 2;
  const mui = vanh.parts.map((part, i) => {
    const a0 = goc;
    const a1 = goc + part.share * 2 * Math.PI;
    goc = a1;
    /*
     * Neo popup ở MÉP NGOÀI của vòng, ngay giữa cung, kèm hướng của cung: popup bung ra phía ngoài theo
     * hướng ấy. Neo giữa bề dày vành thì với một múi lớn (WACC 73,2 %) popup trùm lên chính con số tổng
     * giữa vòng — đo trên Chrome 22/10/2026.
     */
    const giua = (a0 + a1) / 2;
    const huong = { dx: Math.cos(giua), dy: Math.sin(giua) };
    const neo = { x: cx + (R + 4) * huong.dx, y: cy + (R + 4) * huong.dy, ...huong, cy, r };
    return { part, i, neo, d: cungVanh(cx, cy, R, r, a0, a1) };
  });
  neoRef.current = mui.map((mot) => mot.neo);
  const dangChon = chon === null ? undefined : chu[chon.i];

  const totalValue = labelText(vanh.totalValueLabel);
  const totalLabel = pick(vanh.totalLabel);
  const lot = 2 * r * 0.86;
  const coTen = rongThuong(totalLabel, fo.label) <= lot;
  const coTong = Math.min(fo.total, (fo.total * lot) / Math.max(1, rongDam(totalValue, fo.total)));

  return (
    <div ref={khungRef} className={`${String(styles.plot)} ${String(styles.donutKhung)}`}>
      <svg
        className={`${String(styles.svgStack)}${size === 'compact' ? ` ${String(styles.donutGon)}` : ''}`}
        data-chart-svg={idBase}
        data-donut=""
        viewBox={`0 0 ${String(W)} ${f(H)}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
        onClick={() => {
          setChon(null);
        }}
      >
        {/*
          Phần bằng 0 không có múi — một múi góc 0 vẫn vẽ nét viền thành một vạch lạ trên vòng — nhưng
          vẫn có dòng chú giải "chiếm 0,0 %" bên phải: phần ấy có thật, chỉ là không chiếm gì.
        */}
        {mui
          .filter(({ part }) => part.share > 0)
          .map(({ part, i, d }) => (
            <path
              key={`mui-${part.label.vi}`}
              className={`${String(styles.donutSlice)} ${TONE_CLASS[part.tone]}${
                chon !== null && chon.i !== i ? ` ${String(styles.donutSliceMo)}` : ''
              }`}
              d={d}
              data-mui={i}
              onPointerEnter={vao(i)}
              onPointerLeave={roi}
              onClick={bam(i)}
            />
          ))}

        {coTen && (
          <text
            className={styles.donutTotalLabel}
            x={f(cx)}
            y={f(cy + GIUA_VONG[size].ten)}
            textAnchor="middle"
          >
            {totalLabel}
          </text>
        )}
        <text
          className={styles.donutTotal}
          x={f(cx)}
          y={f(cy + (coTen ? GIUA_VONG[size].tong : GIUA_VONG[size].tongMotMinh))}
          textAnchor="middle"
          fontSize={f(coTong)}
        >
          {totalValue}
        </text>

        {vach.ys.map((y) => (
          <line
            key={`vach-${f(y)}`}
            className={styles.donutRule}
            x1={f(vach.x1)}
            x2={f(vach.x2)}
            y1={f(y)}
            y2={f(y)}
          />
        ))}

        {hang.map(({ part, dong, giaTri, phan, o, ten, giaTriAt, phanAt }, i) => (
          <g
            key={`ghi-${part.label.vi}`}
            className={`${TONE_CLASS[part.tone]} ${String(styles.donutMuc)}`}
            onPointerEnter={vao(i)}
            onPointerLeave={roi}
            onClick={bam(i)}
          >
            <rect
              className={styles.donutSwatch}
              x={f(o.x)}
              y={f(o.y)}
              width={f(o.size)}
              height={f(o.size)}
              rx="2"
            />
            <text className={styles.donutLabel} x={f(ten.x)} y={f(ten.y)}>
              {dong[0]}
              {dong[1] !== undefined && (
                <tspan x={f(ten.x)} dy={f(ten.dyTen)}>
                  {dong[1]}
                </tspan>
              )}
            </text>
            <text
              className={styles.donutValue}
              x={f(giaTriAt.x)}
              y={f(giaTriAt.y)}
              textAnchor={giaTriAt.anchor}
            >
              {giaTri}
            </text>
            <text
              className={styles.donutLabel}
              x={f(phanAt.x)}
              y={f(phanAt.y)}
              textAnchor={phanAt.anchor}
            >
              {phan}
            </text>
          </g>
        ))}
      </svg>
      {/*
        Popup số liệu của múi đang chọn. Nằm NGOÀI `<svg>`: đường xuất PDF / PNG chép đúng thẻ `<svg>`,
        nên một popup đang mở không bao giờ lọt vào file. `aria-hidden` vì trình đọc màn hình đã có đủ
        ba con số ở đoạn ẩn ngay dưới và ở bảng số — popup chỉ là lối của con trỏ và ngón tay.
      */}
      {dangChon !== undefined && (
        <div
          ref={popupRef}
          className={styles.donutPopup}
          data-donut-popup=""
          aria-hidden="true"
          style={viTri === null ? { visibility: 'hidden' } : { left: viTri.left, top: viTri.top }}
        >
          <span className={`${String(styles.donutPopupTen)} ${TONE_CLASS[dangChon.part.tone]}`}>
            <span className={styles.donutPopupO} />
            {dangChon.ten}
          </span>
          <strong className={styles.donutPopupGiaTri}>{dangChon.giaTri}</strong>
          <span>{dangChon.phan}</span>
        </div>
      )}
      <p className="visually-hidden">
        {hang.map((row) => `${pick(row.part.label)}: ${row.giaTri}, ${row.phan}`).join('; ')}
      </p>
    </div>
  );
}
