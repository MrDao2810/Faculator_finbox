import { describe, expect, it } from 'vitest';

import { datPopup, diemPhatPopup, mauCuaMui } from './donut-popup';
import type { DatPopupVao, Diem, Hop } from './donut-popup';

/*
 * Hình dựng lại cảnh chủ dự án chụp ngày 26/10/2026 ("Cơ cấu số tiền chấp nhận mất", PC): vòng sát mép
 * trên và mép dưới khung, chú giải bên phải; múi 90 % đi từ 12 giờ theo chiều kim đồng hồ, múi 10 % là
 * phần còn lại, ở góc trên trái. Popup cỡ thật đo trên Chrome (hai dòng chữ, đệm 8 / 12px).
 */
const KHUNG = { w: 420, h: 250 };
const POPUP = { w: 190, h: 46 };
const TAM = { x: 130, y: 125 };
const R = 115;
const r = 69;
const DAU = -Math.PI / 2;
const MUI_LON = { a0: DAU, a1: DAU + 0.9 * 2 * Math.PI };
const MUI_NHO = { a0: DAU + 0.9 * 2 * Math.PI, a1: DAU + 2 * Math.PI };
const CHU_GIUA: Hop = { x: TAM.x - 0.86 * r, y: TAM.y - 0.55 * r, w: 1.72 * r, h: 1.1 * r };

function diemTren(goc: number, ban: number): Diem {
  return { x: TAM.x + ban * Math.cos(goc), y: TAM.y + ban * Math.sin(goc) };
}

function vao(mui: { a0: number; a1: number }, tro: Diem | null, khung = KHUNG): DatPopupVao {
  const giua = (mui.a0 + mui.a1) / 2;
  const dx = Math.cos(giua);
  const dy = Math.sin(giua);
  return {
    khung,
    popup: POPUP,
    neo: { x: TAM.x + (R + 4) * dx, y: TAM.y + (R + 4) * dy, dx, dy },
    mauMui: mauCuaMui(TAM.x, TAM.y, R, r, mui.a0, mui.a1),
    chuGiua: CHU_GIUA,
    dongChuGiai: null,
    tro,
  };
}

function hopCua(viTri: { left: number; top: number }): Hop {
  return { x: viTri.left, y: viTri.top, w: POPUP.w, h: POPUP.h };
}

function cheDiem(h: Hop, d: Diem, le = 0): boolean {
  return d.x >= h.x - le && d.x <= h.x + h.w + le && d.y >= h.y - le && d.y <= h.y + h.h + le;
}

describe('popup vành khuyên không đè lên con trỏ hay múi đang trỏ', () => {
  it('múi nhỏ sát mép trên: chỗ cũ (mép ngoài, kẹp vào khung) đè lên múi; chỗ mới thì không', () => {
    const giua = (MUI_NHO.a0 + MUI_NHO.a1) / 2;
    const tro = diemTren(giua, (R + r) / 2);
    const v = vao(MUI_NHO, tro);

    // Chỗ cũ, tính đúng như bản trước: bung ra ngoài theo hướng cung rồi kẹp vào khung.
    const cuLeft = Math.max(0, v.neo.x - (POPUP.w / 2) * (1 - v.neo.dx));
    const cuTop = Math.max(0, v.neo.y - (POPUP.h / 2) * (1 - v.neo.dy));
    const cu = hopCua({ left: cuLeft, top: cuTop });
    expect(v.mauMui.some((d) => cheDiem(cu, d))).toBe(true);

    const moi = hopCua(datPopup(v));
    expect(cheDiem(moi, tro, 6)).toBe(false);
    expect(v.mauMui.filter((d) => cheDiem(moi, d))).toEqual([]);
    expect(diemPhatPopup(moi, 0, v)).toBeLessThan(1);
  });

  it('rê chuột tới đâu trên múi lớn thì popup cũng không đè lên con trỏ', () => {
    for (let k = 1; k < 40; k += 1) {
      const goc = MUI_LON.a0 + ((MUI_LON.a1 - MUI_LON.a0) * k) / 40;
      for (const ban of [r + 4, (R + r) / 2, R - 4]) {
        const tro = diemTren(goc, ban);
        const moi = hopCua(datPopup(vao(MUI_LON, tro)));
        expect(cheDiem(moi, tro, 6), `góc ${goc.toFixed(2)}, bán kính ${String(ban)}`).toBe(false);
      }
    }
  });

  it('múi nhỏ: con trỏ ở bất cứ đâu trên múi, popup không che điểm nào của múi', () => {
    for (let k = 0; k <= 8; k += 1) {
      const goc = MUI_NHO.a0 + ((MUI_NHO.a1 - MUI_NHO.a0) * k) / 8;
      const tro = diemTren(goc, (R + r) / 2);
      const v = vao(MUI_NHO, tro);
      const moi = hopCua(datPopup(v));
      expect(cheDiem(moi, tro, 6)).toBe(false);
      expect(v.mauMui.some((d) => cheDiem(moi, d))).toBe(false);
    }
  });

  it('phía ngoài còn chỗ thì popup đứng đúng chỗ cũ, không dời đi đâu', () => {
    // Khung rộng, vòng ở giữa: múi bên phải có cả khoảng trống bên phải nó.
    const khung = { w: 800, h: 400 };
    const v: DatPopupVao = {
      ...vao({ a0: -0.3 * Math.PI, a1: 0.3 * Math.PI }, null, khung),
    };
    const tro = { x: TAM.x + (R + r) / 2, y: TAM.y };
    const viTri = datPopup({ ...v, tro });
    expect(viTri.left).toBeCloseTo(v.neo.x, 6);
    expect(viTri.top).toBeCloseTo(v.neo.y - POPUP.h / 2, 6);
  });

  it('trỏ vào dòng chú giải: popup không che dòng ấy', () => {
    // Dòng chú giải của múi lớn, ở cột bên phải vòng.
    const dong: Hop = { x: 262, y: 40, w: 150, h: 44 };
    const tro = { x: 300, y: 55 };
    const v = { ...vao(MUI_LON, tro), dongChuGiai: dong };
    const moi = hopCua(datPopup(v));
    expect(cheDiem(moi, tro, 6)).toBe(false);
    const rong = Math.min(moi.x + moi.w, dong.x + dong.w) - Math.max(moi.x, dong.x);
    const cao = Math.min(moi.y + moi.h, dong.y + dong.h) - Math.max(moi.y, dong.y);
    expect(rong > 0 && cao > 0).toBe(false);
  });

  it('popup luôn nằm trọn trong khung', () => {
    for (const mui of [MUI_LON, MUI_NHO]) {
      const tro = diemTren((mui.a0 + mui.a1) / 2, (R + r) / 2);
      const { left, top } = datPopup(vao(mui, tro));
      expect(left).toBeGreaterThanOrEqual(0);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(left + POPUP.w).toBeLessThanOrEqual(KHUNG.w);
      expect(top + POPUP.h).toBeLessThanOrEqual(KHUNG.h);
    }
  });
});

describe('điểm mẫu của một múi', () => {
  it('nằm trọn trong vành và trong cung, bước không quá 4°', () => {
    const diem = mauCuaMui(TAM.x, TAM.y, R, r, MUI_NHO.a0, MUI_NHO.a1);
    expect(diem).toHaveLength(30);
    for (const d of diem) {
      const ban = Math.hypot(d.x - TAM.x, d.y - TAM.y);
      expect(ban).toBeGreaterThanOrEqual(r - 1e-9);
      expect(ban).toBeLessThanOrEqual(R + 1e-9);
    }
    expect(mauCuaMui(TAM.x, TAM.y, R, r, MUI_LON.a0, MUI_LON.a1)).toHaveLength(246);
  });
});
