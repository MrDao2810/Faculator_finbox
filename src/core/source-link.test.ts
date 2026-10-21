import { describe, expect, it } from 'vitest';

import { laKhoangCafefQuaDai, laLinkDuLieuTho } from './source-link';

const CAFEF = 'https://cafef.vn/du-lieu/lich-su-giao-dich-fpt-1.chn';

describe('laKhoangCafefQuaDai() — trang CafeF từ chối khoảng quá một năm', () => {
  it('đúng một năm thì qua, thêm một ngày thì bị bắt', () => {
    expect(laKhoangCafefQuaDai(`${CAFEF}?start%44ate=15/09/2025&end%44ate=15/09/2026`)).toBe(false);
    expect(laKhoangCafefQuaDai(`${CAFEF}?start%44ate=14/09/2025&end%44ate=15/09/2026`)).toBe(true);
    expect(laKhoangCafefQuaDai(`${CAFEF}?start%44ate=12/09/2025&end%44ate=15/09/2026`)).toBe(true);
  });

  it('một phiên và ngày cuối trước ngày đầu', () => {
    expect(laKhoangCafefQuaDai(`${CAFEF}?start%44ate=11/09/2026&end%44ate=11/09/2026`)).toBe(false);
    expect(laKhoangCafefQuaDai(`${CAFEF}?start%44ate=12/09/2026&end%44ate=11/09/2026`)).toBe(true);
  });

  it('link không phải lịch sử giá CafeF thì không xét', () => {
    expect(laKhoangCafefQuaDai('https://cotuc.vn/co-phieu/fpt')).toBe(false);
  });
});

describe('laLinkDuLieuTho() — link nguồn phải mở ra trang đọc được', () => {
  it('bắt đúng ba dạng API từng nằm trong ví dụ và câu hỏi', () => {
    expect(
      laLinkDuLieuTho(
        'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
      ),
    ).toBe(true);
    expect(
      laLinkDuLieuTho(
        'https://api-finfo.vndirect.com.vn/v4/stock_prices?sort=date&q=code:FPT~date:gte:2025-09-12',
      ),
    ).toBe(true);
    expect(
      laLinkDuLieuTho('https://dchart-api.vndirect.com.vn/dchart/history?symbol=VNINDEX'),
    ).toBe(true);
  });

  it('không bắt trang đọc được, kể cả trang lịch sử giá điền sẵn ngày', () => {
    expect(
      laLinkDuLieuTho(
        'https://cafef.vn/du-lieu/lich-su-giao-dich-fpt-1.chn?start%44ate=11/09/2026&end%44ate=11/09/2026',
      ),
    ).toBe(false);
    expect(
      laLinkDuLieuTho('https://stockanalysis.com/quote/hose/FPT/financials/balance-sheet/'),
    ).toBe(false);
    expect(
      laLinkDuLieuTho(
        'https://congbaocdn.chinhphu.vn/180507251028987904/2026/1/24/109signed-17692403594311667615452.pdf',
      ),
    ).toBe(false);
  });
});
