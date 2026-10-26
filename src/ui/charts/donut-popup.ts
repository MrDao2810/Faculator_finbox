/**
 * Chỗ đặt popup số liệu của một múi vành khuyên (`DonutChart`) — hàm thuần, đơn vị px, gốc ở góc trái
 * trên của khung hình.
 *
 * Cách cũ (22/10/2026) chỉ có MỘT chỗ: mép ngoài vòng giữa cung, bung ra ngoài theo hướng của cung, rồi
 * kẹp vào khung. Múi nhỏ nằm sát mép trên khung thì phía ngoài không còn chỗ, cú kẹp đẩy popup ngược vào
 * trong, đè đúng lên múi đang trỏ và lên con trỏ. Chủ dự án chụp đúng cảnh ấy ở "Cơ cấu số tiền chấp
 * nhận mất" (múi 10 % ở góc trên trái) ngày 26/10/2026: _"khi phần biểu hiện thông số đang quá nhỏ mà
 * hover chuột vào thì phần popup bật lên bị đè lên chuột gây lỗi như ảnh. sửa lỗi"_.
 *
 * Nay xét nhiều chỗ và chấm điểm phạt từng chỗ, lấy chỗ phạt ít nhất (bằng nhau thì chỗ đứng trước):
 *
 * 1. Chỗ cũ ở mép ngoài cung — vẫn đứng đầu, nên mọi múi vốn đặt đẹp thì không đổi gì.
 * 2. Bốn phía của múi (ngoài hộp bao múi một khe), phía cùng hướng cung trước.
 * 3. Bốn góc quanh con trỏ (hay chỗ ngón tay chạm), cách một khe.
 * 4. Ngay trên và ngay dưới khối chữ giữa vòng (lối cũ cho múi bên trái trên điện thoại).
 *
 * Phạt: che con trỏ là 1000 (không bao giờ được chọn nếu còn chỗ khác); che thứ đang được trỏ — múi
 * (tính theo phần điểm mẫu của múi bị che) hay dòng chú giải (theo phần diện tích) — nặng 300; che khối
 * chữ giữa vòng, nặng 30; thêm 0,1 mỗi px bị kẹp, để chỗ tự nhiên thắng khi hai chỗ cùng sạch.
 */

export interface Diem {
  x: number;
  y: number;
}

export interface Hop {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DatPopupVao {
  khung: { w: number; h: number };
  popup: { w: number; h: number };
  /** Mép ngoài vòng ở giữa cung, kèm hướng của cung (`dx`, `dy`: cos và sin của góc giữa cung). */
  neo: Diem & { dx: number; dy: number };
  /** Điểm mẫu phủ múi đang chọn (mép trong, giữa vành, mép ngoài, dọc theo cung). */
  mauMui: ReadonlyArray<Diem>;
  /** Khối chữ giữa vòng: tên tổng và số tổng. */
  chuGiua: Hop;
  /** Dòng chú giải đang trỏ — chỉ khi người dùng trỏ vào chú giải chứ không vào múi. */
  dongChuGiai: Hop | null;
  /** Chỗ con trỏ hay ngón tay vừa đặt, nếu biết. */
  tro: Diem | null;
}

/** Khoảng hở giữa popup với múi hay con trỏ. */
export const KHE_POPUP = 12;

/** Lề quanh con trỏ: popup đứng sát mũi tên chuột cũng là che. */
const LE_TRO = 6;

function kep(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), Math.max(lo, hi));
}

function trong(d: Diem, h: Hop, le = 0): boolean {
  return d.x >= h.x - le && d.x <= h.x + h.w + le && d.y >= h.y - le && d.y <= h.y + h.h + le;
}

/** Phần của `b` bị `a` che, từ 0 tới 1. */
function phanBiChe(a: Hop, b: Hop): number {
  const rong = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const cao = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  if (rong <= 0 || cao <= 0 || b.w <= 0 || b.h <= 0) return 0;
  return (rong * cao) / (b.w * b.h);
}

function hopBao(diem: ReadonlyArray<Diem>): Hop | null {
  if (diem.length === 0) return null;
  const xs = diem.map((d) => d.x);
  const ys = diem.map((d) => d.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** Popup ở `hop` có che con trỏ ở `tro` không (tính cả lề quanh mũi tên chuột). */
export function cheConTro(hop: Hop, tro: Diem): boolean {
  return trong(tro, hop, LE_TRO);
}

/** Điểm phạt của một chỗ đã kẹp vào khung; `keo` là số px cú kẹp đã dời nó. */
export function diemPhatPopup(hop: Hop, keo: number, v: DatPopupVao): number {
  const cheTro = v.tro !== null && cheConTro(hop, v.tro) ? 1000 : 0;
  const cheMui =
    v.mauMui.length === 0 ? 0 : v.mauMui.filter((d) => trong(d, hop)).length / v.mauMui.length;
  const cheDong = v.dongChuGiai === null ? 0 : phanBiChe(hop, v.dongChuGiai);
  const cheChu = phanBiChe(hop, v.chuGiua);
  return cheTro + 300 * cheMui + 300 * cheDong + 30 * cheChu + 0.1 * keo;
}

export function datPopup(v: DatPopupVao): { left: number; top: number } {
  const { khung, popup: p, neo, tro } = v;
  const ungVien: Diem[] = [
    { x: neo.x - (p.w / 2) * (1 - neo.dx), y: neo.y - (p.h / 2) * (1 - neo.dy) },
  ];

  /* Bốn phía của múi, canh theo con trỏ trên trục kia (không có thì theo điểm neo). */
  const bao = hopBao(v.mauMui);
  if (bao !== null) {
    const giuaX = (tro ?? neo).x - p.w / 2;
    const giuaY = (tro ?? neo).y - p.h / 2;
    const phia = [
      { hx: 1, hy: 0, d: { x: bao.x + bao.w + KHE_POPUP, y: giuaY } },
      { hx: -1, hy: 0, d: { x: bao.x - KHE_POPUP - p.w, y: giuaY } },
      { hx: 0, hy: 1, d: { x: giuaX, y: bao.y + bao.h + KHE_POPUP } },
      { hx: 0, hy: -1, d: { x: giuaX, y: bao.y - KHE_POPUP - p.h } },
    ];
    phia.sort((a, b) => b.hx * neo.dx + b.hy * neo.dy - (a.hx * neo.dx + a.hy * neo.dy));
    ungVien.push(...phia.map((mot) => mot.d));
  }

  if (tro !== null) {
    ungVien.push(
      { x: tro.x + KHE_POPUP, y: tro.y + KHE_POPUP },
      { x: tro.x - KHE_POPUP - p.w, y: tro.y + KHE_POPUP },
      { x: tro.x + KHE_POPUP, y: tro.y - KHE_POPUP - p.h },
      { x: tro.x - KHE_POPUP - p.w, y: tro.y - KHE_POPUP - p.h },
    );
  }

  ungVien.push(
    { x: neo.x - p.w / 2, y: v.chuGiua.y - KHE_POPUP - p.h },
    { x: neo.x - p.w / 2, y: v.chuGiua.y + v.chuGiua.h + KHE_POPUP },
  );

  let tot = { left: 0, top: 0 };
  let phatTot = Infinity;
  for (const u of ungVien) {
    const left = kep(u.x, 0, khung.w - p.w);
    const top = kep(u.y, 0, khung.h - p.h);
    const phat = diemPhatPopup(
      { x: left, y: top, w: p.w, h: p.h },
      Math.hypot(left - u.x, top - u.y),
      v,
    );
    if (phat < phatTot) {
      phatTot = phat;
      tot = { left, top };
    }
  }
  return tot;
}

/**
 * Điểm mẫu phủ một múi, đơn vị của hình: ba bán kính (mép trong, giữa vành, mép ngoài) dọc theo cung,
 * mỗi bước không quá 4°. Múi 10 % ra 30 điểm, múi 90 % ra 246 — đủ mịn để một popup không lọt giữa hai
 * điểm mà vẫn đè lên múi.
 */
export function mauCuaMui(
  cx: number,
  cy: number,
  R: number,
  r: number,
  a0: number,
  a1: number,
): Diem[] {
  const buoc = Math.max(2, Math.ceil(Math.abs(a1 - a0) / ((4 * Math.PI) / 180)));
  const diem: Diem[] = [];
  for (let k = 0; k <= buoc; k += 1) {
    const goc = a0 + ((a1 - a0) * k) / buoc;
    for (const ban of [r, (r + R) / 2, R]) {
      diem.push({ x: cx + ban * Math.cos(goc), y: cy + ban * Math.sin(goc) });
    }
  }
  return diem;
}
