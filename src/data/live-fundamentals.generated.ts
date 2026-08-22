/**
 * SINH TỰ ĐỘNG TỪ API FINBOX_V2 (`dcs.finbox.vn`) — ĐỪNG SỬA TAY.
 * Sinh lại bằng: npm run gen:live-fundamentals
 *
 * `eps`/`bookValuePerShare`/`sharesOutstanding`/`dividendPerShare`/`period` đọc thẳng từ
 * báo cáo thật (chỉ đổi đơn vị nghìn ₫ → ₫). `netIncome` là lợi nhuận ròng **12 tháng gần
 * nhất** (cộng 4 quý gần nhất, không phải luỹ kế từ đầu năm — xem docblock script sinh).
 * `equity` vẫn SUY RA (`bookValuePerShare × sharesOutstanding`) — Finbox_v2 không có field
 * vốn chủ sở hữu tuyệt đối.
 *
 * Lấy lúc: 2026-08-21T08:04:16.261Z
 */

import type { Fundamentals } from './types';

export const LIVE_FUNDAMENTALS_FETCHED_AT = '2026-08-21T08:04:16.261Z';

export const LIVE_FUNDAMENTALS: Readonly<Record<string, Fundamentals>> = {
  FPT: {
    eps: 5867,
    bookValuePerShare: 23246,
    sharesOutstanding: 1714326422,
    dividendPerShare: 2000,
    netIncome: 9999.4,
    equity: 39851.2,
    period: 'BCTC Q2/2026',
  },
  HPG: {
    eps: 2750,
    bookValuePerShare: 16683,
    sharesOutstanding: 8442964520,
    dividendPerShare: 500,
    netIncome: 23217.4,
    equity: 140854,
    period: 'BCTC Q2/2026',
  },
  VNM: {
    eps: 5246,
    bookValuePerShare: 15248,
    sharesOutstanding: 2089955445,
    dividendPerShare: 4350,
    netIncome: 10962.9,
    equity: 31867.6,
    period: 'BCTC Q2/2026',
  },
  MWG: {
    eps: 6667,
    bookValuePerShare: 24177,
    sharesOutstanding: 1475765646,
    dividendPerShare: 1000,
    netIncome: 9856.5,
    equity: 35679.6,
    period: 'BCTC Q2/2026',
  },
};
