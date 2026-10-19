import { describe, expect, it } from 'vitest';

import { ALL_FORMULAS } from './index';

/**
 * Ô nhập mang KÝ HIỆU của hình công thức ở cuối nhãn (19/10/2026).
 *
 * Chủ dự án liệt kê một loạt công thức (Gordon, P/E, WACC, HPR, ROI, Cỡ lệnh…) và ghi: _"Các ký hiệu ở
 * công thức cũng cần được biểu thị ở ô nhập liệu"_, lấy Biên an toàn làm mẫu ('Giá trị nội tại ước tính
 * (V)'). Đo ngày ấy: khoảng 95 công thức có ô mà ký hiệu của nó có trong hình nhưng không có trên nhãn.
 * Chủ dự án chọn làm cả sản phẩm, và viết ký hiệu LIỀN như trong hình: `P_{mua}` thành 'Pmua', `r_e` thành
 * 're' (bản cũ 'Re', 'Rd', 'Rf', 'S' sửa theo), cùng kiểu '(D0)', '(g1)' đã có.
 *
 * Luật chọn ô: gắn ký hiệu khi ký hiệu trong hình CHÍNH LÀ số người dùng gõ vào ô. Ký hiệu tính ra từ ô
 * thì không: `r_f` của Sharpe là lãi năm đã quy về một phiên, `i` của trả góp là lãi năm chia 12, `n` của
 * độ lệch chuẩn là số phiên trừ 1. Gắn vào những ô ấy là nói sai. Ô có nhãn tự là ký hiệu ('EBITDA',
 * 'P/E hiện tại') hay hình viết bằng chữ tiếng Việt đã có trong nhãn ('Vốn chủ sở hữu') thì không cần.
 *
 * Bảng ghim chứ không phải luật tự suy: ô nào ứng với ký hiệu nào cần đọc `calc`, máy không tự biết. Thêm
 * một công thức mới là bảng đỏ, có chủ ý, để người thêm phải quyết định ô nào mang ký hiệu gì.
 */
const KY_HIEU_O_NHAP: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  pe: { price: 'P', eps: 'EPS' },
  pb: { price: 'P', bookValuePerShare: 'BVPS' },
  'eps-co-ban': { netIncome: 'LNST' },
  bvps: {},
  roe: { netIncome: 'LNST' },
  roa: { netIncome: 'LNST' },
  'bien-loi-nhuan-rong': { netIncome: 'LNST' },
  'bien-loi-nhuan-gop': {},
  'no-tren-von-chu': { totalLiabilities: 'D', equity: 'E' },
  'thanh-toan-hien-hanh': {},
  'thanh-toan-nhanh': {},
  'vong-quay-tong-tai-san': {},
  'ty-le-chi-tra-co-tuc': { dividendPerShare: 'DPS', eps: 'EPS' },
  ps: { price: 'P', salesPerShare: 'Sps' },
  ev: {},
  'ev-ebitda': { ev: 'EV' },
  'ev-sales': { ev: 'EV' },
  peg: { growth: 'g' },
  'von-hoa-thi-truong': { price: 'P', shares: 'N' },
  'so-graham': { eps: 'EPS', bvps: 'BVPS' },
  'ncav-tren-co-phieu': { currentAssets: 'TSNH', shares: 'N' },
  'ty-suat-loi-nhuan-tren-gia': { eps: 'EPS', price: 'P' },
  'gia-muc-tieu': { eps: 'EPS' },
  'mo-hinh-gordon': { dividend: 'D0', growth: 'g', requiredReturn: 'r' },
  'ddm-hai-giai-doan': {
    dividend: 'D0',
    growthStage1: 'g1',
    years: 'n',
    growthTerminal: 'g2',
    requiredReturn: 'r',
  },
  capm: { riskFree: 'rf', beta: 'β', erp: 'ERP' },
  wacc: { equity: 'E', debt: 'D', costEquity: 're', costDebt: 'rd', taxRate: 't' },
  fcff: { ebit: 'EBIT', taxRate: 't', depreciation: 'Dep', capex: 'CapEx', nwcChange: 'ΔNWC' },
  fcfe: { fcff: 'FCFF', interest: 'I', taxRate: 't', netBorrowing: 'ΔB' },
  'gia-tri-noi-tai-fcff': { fcff: 'FCFF', growth: 'g', wacc: 'WACC', netDebt: 'Dròng' },
  'gia-tri-hien-tai': { futureValue: 'FV', rate: 'r', years: 'n' },
  'gia-tri-tuong-lai': { presentValue: 'PV', rate: 'r', years: 'n' },
  'bien-an-toan': { intrinsic: 'V', price: 'P' },
  'phi-giao-dich-mua': { quantity: 'Q', buyPrice: 'Pmua' },
  'phi-giao-dich-ban': { quantity: 'Q', sellPrice: 'Pban' },
  'thue-chuyen-nhuong': { quantity: 'Q', sellPrice: 'Pban' },
  'thue-co-tuc': { quantity: 'Q', dividendPerShare: 'D' },
  'phi-luu-ky': { quantity: 'Q', months: 'M' },
  'gia-hoa-von': { quantity: 'Q', buyPrice: 'Pmua' },
  'loi-nhuan-rong': { quantity: 'Q', buyPrice: 'Pmua', sellPrice: 'Pban' },
  'roi-rong': { quantity: 'Q', buyPrice: 'Pmua' },
  roi: { cost: 'Vdau', current: 'Vcuoi' },
  hpr: { startPrice: 'Pdau', endPrice: 'Pcuoi', dividend: 'D' },
  cagr: { start: 'Vdau', end: 'Vcuoi', years: 't' },
  'ty-suat-co-tuc': { price: 'P', dividendPerShare: 'D' },
  xirr: {},
  'loi-suat-nam-hoa': { periodReturn: 'rky', periodsPerYear: 'm' },
  'loi-suat-thuc': { nominal: 'rdanh nghia', inflation: 'π' },
  'lai-suat-hieu-dung': { rate: 'r', perYear: 'm' },
  'tong-loi-suat-tai-dau-tu': { priceGrowth: 'g', dividendYield: 'y', years: 'n' },
  'loi-suat-trung-binh-hinh-hoc': { periods: 'n', r1: 'r1', r2: 'r2', r3: 'r3' },
  'irr-nien-kim': { investment: 'P', payment: 'C', periods: 'n' },
  'thoi-gian-nhan-doi': { rate: 'r' },
  'loi-suat-quy-nam-theo-ngay': { buyPrice: 'Pmua', sellPrice: 'Pban', days: 'd' },
  'loi-suat-vuot-chuan': { portfolioReturn: 'rp', benchmarkReturn: 'rb' },
  'co-lenh-rui-ro': { capital: 'V', riskPercent: 'r', entryPrice: 'Pvao', stopPrice: 'Pcat' },
  'sut-giam-sau-nhat': { lookback: 'N' },
  'sut-giam-hien-tai': {},
  'var-lich-su': { confidence: 'α', lookback: 'N' },
  'cvar-lich-su': { confidence: 'α', lookback: 'N' },
  'do-lech-chuan-loi-suat-phien': {},
  'do-bien-dong-nam-hoa': { tradingDays: 'D' },
  'do-lech-chuan-ban-phan': { threshold: 'B' },
  'he-so-bien-thien': {},
  'bien-do-dao-dong-lon-nhat': {},
  'chuoi-phien-giam-dai-nhat': {},
  beta: {},
  'ty-so-sharpe': { sessionsPerYear: 'm' },
  'ty-so-sortino': { sessionsPerYear: 'm' },
  'ty-so-treynor': { sessionsPerYear: 'm', beta: 'βp' },
  'ty-so-thong-tin': { sessionsPerYear: 'm' },
  'ty-so-calmar': {},
  'ty-so-thang-thua': { threshold: 'h' },
  'sma-n-phien': { period: 'n' },
  'ema-n-phien': { period: 'n' },
  'macd-duong-chinh': {},
  'macd-duong-tin-hieu': {},
  'rsi-wilder': { period: 'n' },
  'roc-toc-do-thay-doi': { period: 'n' },
  'dong-luong-momentum': { period: 'n' },
  'khoang-cach-gia-so-sma': { period: 'n' },
  'giao-cat-hai-duong-ma': {},
  'dai-bollinger-tren': { period: 'n', k: 'k' },
  'dai-bollinger-duoi': { period: 'n', k: 'k' },
  'do-rong-dai-bollinger': { period: 'n' },
  'atr-dao-dong-thuc': { period: 'n' },
  'phan-tram-b-bollinger': {},
  'stochastic-k': { period: 'n' },
  vwap: { period: 'n' },
  'do-bien-dong-lich-su': { sample: 'n', tradingDays: 'N' },
  'ty-le-khoi-luong': { period: 'n' },
  'gia-ly-thuyet-vn30f': { indexValue: 'S', riskFreeRate: 'r', dividendYield: 'q', days: 'd' },
  'basis-vn30f': { futuresPoints: 'F', indexValue: 'S' },
  'lai-lo-vi-the-long': { entryPoints: 'Pmo', exitPoints: 'Pdong', contracts: 'N' },
  'lai-lo-vi-the-short': { entryPoints: 'Pmo', exitPoints: 'Pdong', contracts: 'N' },
  'so-hop-dong-toi-da': { capital: 'V', futuresPoints: 'F', marginRatio: 'k' },
  'co-vi-the-phai-sinh': { capital: 'V', riskPercent: 'r', stopPoints: 'ΔP' },
  'don-bay-hieu-dung': { futuresPoints: 'F', contracts: 'N', equity: 'E' },
  'tra-gop-nien-kim': { amount: 'P' },
  'tra-gop-goc-deu': { amount: 'P' },
  'lich-tra-no': {},
  'lai-kep': { principal: 'P', rate: 'r', years: 't', perYear: 'n' },
  'lai-tien-gui': { principal: 'P', rate: 'r', months: 'T' },
  'tiet-kiem-muc-tieu': { target: 'FV', months: 'n' },
  'rut-truoc-han': { principal: 'P', monthsHeld: 't', demandRate: 'rkkh' },
  'gui-quay-vong': {
    principal: 'P',
    shortRate: 'rn',
    shortMonths: 'm',
    longRate: 'rd',
    totalMonths: 'T',
  },
  'gia-von-trung-binh-dca': {
    amount1: 'C1',
    price1: 'P1',
    amount2: 'C2',
    price2: 'P2',
    amount3: 'C3',
    price3: 'P3',
  },
  'so-ky-dca': { target: 'FV', contribution: 'C' },
  'thue-tncn-dau-tu': { quantity: 'Q', sellPrice: 'Pban', dividendPerShare: 'D' },
  'diem-hoa-von': { fixedCost: 'FC', unitPrice: 'P', variableCost: 'VC' },
  'don-bay-tong-hop': { revenue: 'DT', variableCost: 'BP', interest: 'I' },
};

const HY_LAP: Readonly<Record<string, string>> = {
  Delta: 'Δ',
  alpha: 'α',
  beta: 'β',
  pi: 'π',
  sigma: 'σ',
};

/** Hình công thức viết thành chữ phẳng, để dò ký hiệu: `P_{mua}` thành 'Pmua', `\Delta B` thành 'ΔB'. */
function chuPhang(latex: string): string {
  return latex
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\(Delta|alpha|beta|pi|sigma)\s*/g, (_, ten: string) => HY_LAP[ten] ?? ten)
    .replace(/\\,/g, ' ')
    .replace(/[_{}^]/g, '');
}

/** Nhãn mang ký hiệu ở cuối '… (X)', hoặc mở đầu bằng nó 'X — …'. */
function kyHieuCuaNhan(nhan: string): string | null {
  return (/ \(([^()]+)\)$/.exec(nhan) ?? /^(\S+) — /.exec(nhan))?.[1] ?? null;
}

describe('ô nhập mang ký hiệu của hình công thức', () => {
  it('mọi công thức có mặt trong bảng, không thừa id nào', () => {
    expect(Object.keys(KY_HIEU_O_NHAP).sort()).toEqual(ALL_FORMULAS.map((s) => s.id).sort());
  });

  it.each(ALL_FORMULAS.map((s) => [s.id, s] as const))(
    '%s: nhãn khớp bảng ở cả hai thứ tiếng, và không ô nào mang ký hiệu ngoài bảng',
    (_id, spec) => {
      const bang = KY_HIEU_O_NHAP[spec.id] ?? {};
      for (const v of spec.variables) {
        const kyHieu = bang[v.key] ?? null;
        expect(kyHieuCuaNhan(v.label.vi), `${spec.id}.${v.key} [vi] "${v.label.vi}"`).toBe(kyHieu);
        expect(kyHieuCuaNhan(v.label.en), `${spec.id}.${v.key} [en] "${v.label.en}"`).toBe(kyHieu);
      }
      for (const key of Object.keys(bang)) {
        expect(
          spec.variables.some((v) => v.key === key),
          `${spec.id}.${key} có trong bảng mà không phải ô`,
        ).toBe(true);
      }
    },
  );

  it.each(ALL_FORMULAS.map((s) => [s.id, s] as const))(
    '%s: ký hiệu trong bảng có mặt trong hình',
    (_id, spec) => {
      const hinh = chuPhang(spec.latex);
      for (const [key, kyHieu] of Object.entries(KY_HIEU_O_NHAP[spec.id] ?? {})) {
        // Ô của nhóm lặp mang số thứ tự ('C1', 'r2'); hình vẽ chỉ số chạy (`C_i`, `r_k`).
        const goc = spec.repeat === undefined ? kyHieu : kyHieu.replace(/\d+$/, '');
        expect(hinh, `${spec.id}.${key}: "${kyHieu}" không thấy trong "${hinh}"`).toContain(goc);
      }
    },
  );

  it('nhãn mẫu của nhóm lặp mang cùng ký hiệu với nhóm một, theo số thứ tự', () => {
    for (const spec of ALL_FORMULAS) {
      for (const mau of spec.repeat?.fields ?? []) {
        const nhomMot = KY_HIEU_O_NHAP[spec.id]?.[`${mau.key}1`];
        if (nhomMot === undefined) continue;
        const duoi = ` (${nhomMot.replace(/1$/, '{n}')})`;
        expect(mau.label.vi.endsWith(duoi), `${spec.id}.${mau.key}{n} [vi]`).toBe(true);
        expect(mau.label.en.endsWith(duoi), `${spec.id}.${mau.key}{n} [en]`).toBe(true);
      }
    }
  });
});
