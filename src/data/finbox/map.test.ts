import { describe, expect, it } from 'vitest';

import { LIVE_FUNDAMENTALS } from '../live-fundamentals.generated';
import { parseSnapshots, parseTickerList, toFundamentals, toIsoDate, toSnapshot } from './map';

/**
 * Đây là bản CẮT GỌN của phản hồi thật `POST https://dcs.finbox.vn/data/symbols`, lấy ngày
 * 24/08/2026. Bản đầy đủ có 346 field mỗi mã; giữ lại đúng những field `map.ts` đọc, cộng
 * `ln_y2026` — field bẫy, xem dưới.
 *
 * Vì sao dán số vào file test thay vì để test tự gọi mạng: `npm test` phải chạy được khi rớt
 * mạng và phải cho cùng kết quả mọi lúc, cùng lý do `check:chrome` và `gen:live-fundamentals`
 * nằm ngoài CI.
 *
 * Hai mã này không chọn ngẫu nhiên. **MWG là ca bẫy**: `ln_y2026 = 6017` là luỹ kế từ đầu năm,
 * còn lợi nhuận 12 tháng gần nhất là 9.856,5 — lệch 63%. Bản kế hoạch đầu tiên của script sinh
 * số đã mắc đúng bẫy này.
 */
const FPT_ROW = {
  ticker: 'FPT',
  company: 'FPT Corp',
  floor: 'HOSE',
  category: 'Cổ phiếu',
  industry: 'Phần mềm & DV máy tính',
  priceFlat: 71.4,
  pe: 12.17,
  pb: 3.072,
  eps_pha_loang: 5.867,
  gia_tri_so_sach: 23.246,
  slcp: 1714326422,
  bctc: 'Q2/2026',
  'ln_q2/2026': 2567.7,
  'ln_q1/2026': 2487.4,
  'ln_q4/2025': 2509.5,
  'ln_q3/2025': 2434.8,
  'ln_q2/2025': 2257.5,
  'ln_q1/2025': 2174.3,
  // API tự công bố hai quý gần nhất — đây là thứ `latestQuartersAgree()` đối chiếu.
  ln_quygannhat: 2567.7,
  ln_quygannhi: 2487.4,
  ln_y2026: 5055,
  ct_ct_tm_2025: 2,
  ct_ct_tm_2024: 2,
};

const MWG_ROW = {
  ticker: 'MWG',
  company: 'Thế giới Di động',
  floor: 'HOSE',
  category: 'Cổ phiếu',
  industry: 'Bán lẻ',
  priceFlat: 75.1,
  pe: 11.264,
  pb: 3.106,
  eps_pha_loang: 6.667,
  gia_tri_so_sach: 24.177,
  slcp: 1475765646,
  bctc: 'Q2/2026',
  'ln_q2/2026': 3302.5,
  'ln_q1/2026': 2714.4,
  'ln_q4/2025': 2068.7,
  'ln_q3/2025': 1770.9,
  'ln_q2/2025': 1648.1,
  'ln_q1/2025': 1545.9,
  ln_quygannhat: 3302.5,
  ln_quygannhi: 2714.4,
  ln_y2026: 6017,
  // Không có ct_ct_tm_2025 trong phản hồi thật — năm gần nhất có số là 2024.
  ct_ct_tm_2024: 1,
  ct_ct_tm_2023: 0.5,
};

/**
 * **Ca chống hồi quy của lỗi "nạp mã nhưng không có số liệu nào vào ô".**
 *
 * Số thật của SSI, cùng ngày 25/08/2026. Trước gói này bản ghi bị BỎ, vì phép đối chiếu cũ đòi
 * `netIncome_TTM ÷ slcp` phải bằng `eps_pha_loang` trong 1%: 4.801,6 tỷ ÷ 2,501 tỷ CP = 1.920 ₫
 * trong khi EPS công bố là 2.143 ₫ — lệch 10,4%, vì SSI phát hành thêm cổ phiếu trong 12 tháng
 * nên EPS tính trên số CP bình quân gia quyền, ít hơn số CP đang lưu hành.
 *
 * Số liệu KHÔNG sai chỗ nào: P/E và P/B do Finbox tự tính đều khớp tới 0,02%.
 */
const SSI_ROW = {
  ticker: 'SSI',
  company: 'Chứng khoán SSI',
  floor: 'HOSE',
  priceFlat: 21.25,
  pe: 9.916,
  pb: 1.309,
  eps_pha_loang: 2.143,
  gia_tri_so_sach: 16.23,
  slcp: 2501097752,
  bctc: 'Q2/2026',
  'ln_q2/2026': 1231.1,
  'ln_q1/2026': 1277.9,
  'ln_q4/2025': 817.5,
  'ln_q3/2025': 1475.1,
  ln_quygannhat: 1231.1,
  ln_quygannhi: 1277.9,
  ct_ct_tm_2024: 1,
};

describe('mã có phát hành thêm cổ phiếu vẫn nạp được số liệu', () => {
  it('SSI: nhận bản ghi, không bỏ vì EPS lệch số CP bình quân gia quyền', () => {
    const ssi = toFundamentals(SSI_ROW);

    expect(ssi).not.toBeNull();
    expect(ssi?.eps).toBe(2143);
    expect(ssi?.bookValuePerShare).toBe(16230);
    // 1.231,1 + 1.277,9 + 817,5 + 1.475,1 — bốn quý gần nhất.
    expect(ssi?.netIncome).toBe(4801.6);
  });

  /*
   * Ghim luôn khoảng lệch, để nếu sau này ai định dựng lại phép đối chiếu cũ thì thấy ngay con số
   * mà nó sẽ vấp phải. 10,4% không phải sai số làm tròn — đó là hai đại lượng khác nhau.
   */
  it('độ lệch giữa TTM ÷ số CP và EPS công bố là 10,4% — quá xa mọi ngưỡng làm tròn', () => {
    const ssi = toFundamentals(SSI_ROW);
    const epsTuTtm = ((ssi?.netIncome ?? 0) * 1e9) / (ssi?.sharesOutstanding ?? 1);

    expect(Math.round(epsTuTtm)).toBe(1920);
    expect(Math.abs(epsTuTtm - 2143) / 2143).toBeGreaterThan(0.1);
  });
});

describe('đọc số liệu cơ bản từ phản hồi Finbox_v2', () => {
  /*
   * Ca quan trọng nhất của cả file: `map.ts` (chạy lúc người dùng mở trang) và
   * `scripts/gen-live-fundamentals.mjs` (chạy tay lúc build) là hai bản cài đặt riêng của cùng
   * một phép tính, vì script Node trần không import được TypeScript. Ca này là thứ giữ hai bản
   * không trôi khỏi nhau: cùng đầu vào thật thì phải ra cùng con số mà script đã ghi vào
   * `live-fundamentals.generated.ts`.
   */
  it('cho ra đúng con số mà script sinh lúc build đã ghi', () => {
    expect(toFundamentals(FPT_ROW)).toEqual(LIVE_FUNDAMENTALS.FPT);
    expect(toFundamentals(MWG_ROW)).toEqual(LIVE_FUNDAMENTALS.MWG);
  });

  it('lấy lợi nhuận 12 tháng gần nhất, không lấy luỹ kế từ đầu năm', () => {
    const mwg = toFundamentals(MWG_ROW);

    // 3302,5 + 2714,4 + 2068,7 + 1770,9 — bốn quý gần nhất.
    expect(mwg?.netIncome).toBe(9856.5);
    // Không được là `ln_y2026`, con số lệch 63% từng làm ROE của MWG sai gần 2/3.
    expect(mwg?.netIncome).not.toBe(6017);
  });

  it('đổi nghìn ₫ sang ₫ cho EPS, giá trị sổ sách và cổ tức', () => {
    const fpt = toFundamentals(FPT_ROW);

    expect(fpt?.eps).toBe(5867);
    expect(fpt?.bookValuePerShare).toBe(23246);
    expect(fpt?.dividendPerShare).toBe(2000);
  });

  it('lấy cổ tức của năm gần nhất CÓ số, bỏ qua năm không có', () => {
    // MWG không có ct_ct_tm_2025, nên phải rơi về 2024 → 1 nghìn ₫ → 1.000 ₫.
    expect(toFundamentals(MWG_ROW)?.dividendPerShare).toBe(1000);
  });

  it('bỏ bản ghi khi đơn vị không khớp P/E mà Finbox tự tính', () => {
    // EPS ghi bằng ₫ thay vì nghìn ₫ — đúng loại lỗi nhân thiếu/thừa 1000.
    expect(toFundamentals({ ...FPT_ROW, eps_pha_loang: 5867 })).toBeNull();
  });

  it('bỏ bản ghi khi quý gần nhất tự chọn không khớp con số API công bố', () => {
    // Một ô `ln_q*` mang giá trị hỏng (sai đơn vị 10 lần). P/E và P/B vẫn khớp vì chúng đọc field
    // khác; chỉ phép đối chiếu với `ln_quygannhat` bắt được.
    expect(toFundamentals({ ...FPT_ROW, 'ln_q2/2026': 25677 })).toBeNull();
    // Sắp nhầm thứ tự hai quý mới nhất cũng bị bắt — đó là lỗi kỳ báo cáo, không phải lỗi giá trị.
    expect(toFundamentals({ ...FPT_ROW, ln_quygannhat: 2487.4, ln_quygannhi: 2567.7 })).toBeNull();
  });

  /*
   * API không trả hai trường đối chiếu thì vẫn nhận — cùng luật `withinTolerance()` đang dùng cho
   * P/E và P/B: không có số để so thì không có cơ sở để bác. Đo ngày 25/08/2026: 27 trên 1.005
   * bản ghi rơi vào ca này, chặn hết là bỏ oan 27 mã vì một thiếu sót của nguồn.
   */
  it('không có trường đối chiếu thì vẫn nhận bản ghi', () => {
    const { ln_quygannhat: _nhat, ln_quygannhi: _nhi, ...thieuDoiChieu } = FPT_ROW;
    expect(toFundamentals(thieuDoiChieu)?.netIncome).toBe(9999.4);
  });

  it('bỏ bản ghi khi chuỗi quý THỦNG một kỳ — tổng khi ấy trải hơn 12 tháng', () => {
    // Vẫn còn 5 quý sau khi bỏ, tức vẫn "đủ bốn cái"; cái sai là bốn cái ấy không liền nhau.
    const { 'ln_q3/2025': _thung, ...thieuQuy } = FPT_ROW;
    expect(toFundamentals(thieuQuy)).toBeNull();
  });

  it('bỏ bản ghi khi không đủ bốn quý', () => {
    const { 'ln_q3/2025': _q3, 'ln_q2/2025': _q2, 'ln_q1/2025': _q1, ...chiConBaQuy } = FPT_ROW;
    expect(toFundamentals(chiConBaQuy)).toBeNull();
  });

  it('đọc được cả hình dạng lồng trong `dynamic` của getTickerDetail', () => {
    const { 'ln_q2/2026': q2, 'ln_q1/2026': q1, 'ln_q4/2025': q4, 'ln_q3/2025': q3 } = FPT_ROW;
    const { ct_ct_tm_2025: ct, ...phang } = FPT_ROW;
    const long = {
      ...phang,
      'ln_q2/2026': undefined,
      dynamic: {
        'ln_q2/2026': q2,
        'ln_q1/2026': q1,
        'ln_q4/2025': q4,
        'ln_q3/2025': q3,
        ct_ct_tm_2025: ct,
      },
    };

    expect(toFundamentals(long)?.netIncome).toBe(9999.4);
    expect(toFundamentals(long)?.dividendPerShare).toBe(2000);
  });
});

describe('ảnh chụp một mã', () => {
  it('đổi thị giá nghìn ₫ sang ₫', () => {
    expect(toSnapshot(FPT_ROW)?.priceVnd).toBe(71_400);
  });

  it('giữ được thị giá kể cả khi số liệu cơ bản không qua đối chiếu', () => {
    // Đây là lý do `priceVnd` và `fundamentals` tách rời nhau: màn Danh mục chỉ cần giá.
    const hong = toSnapshot({ ...FPT_ROW, eps_pha_loang: 5867 });

    expect(hong?.priceVnd).toBe(71_400);
    expect(hong?.fundamentals).toBeNull();
  });

  it('không nhận giá 0 hay giá âm', () => {
    expect(toSnapshot({ ...FPT_ROW, priceFlat: 0 })?.priceVnd).toBeNull();
    expect(toSnapshot({ ...FPT_ROW, priceFlat: -1 })?.priceVnd).toBeNull();
  });

  it('bỏ bản ghi không có mã', () => {
    expect(toSnapshot({ company: 'Không mã' })).toBeNull();
    expect(toSnapshot(null)).toBeNull();
  });

  it('dựng bảng tra theo mã từ thân phản hồi', () => {
    const map = parseSnapshots({ symbols: [FPT_ROW, MWG_ROW, { company: 'rác' }] });

    expect([...map.keys()].sort()).toEqual(['FPT', 'MWG']);
    expect(map.get('MWG')?.name).toBe('Thế giới Di động');
  });

  it('thân phản hồi lạ thì ra bảng rỗng, không ném', () => {
    expect(parseSnapshots(null).size).toBe(0);
    expect(parseSnapshots({ khac: 1 }).size).toBe(0);
  });
});

/*
 * Ngày phiên.
 *
 * API trả `date: 20260825`. Đã đối chiếu với `GET /v1/getMarketDates`, endpoint đó liệt kê
 * 20260825, 20260824, 20260821, 20260820… — bỏ đúng thứ Bảy và Chủ nhật, nên `date` là ngày
 * PHIÊN thật chứ không phải hôm nay lặp lại. Đây là mảnh cho phép màn Danh mục nói rõ giá thuộc
 * phiên nào, và nhờ đó mới được phép giữ lại giá cũ dùng lúc mất mạng.
 */
describe('ngày phiên của ảnh chụp', () => {
  it('đổi số 8 chữ số thành ngày ISO', () => {
    expect(toIsoDate(20260825)).toBe('2026-08-25');
    expect(toSnapshot({ ...FPT_ROW, date: 20260821 })?.asOfDate).toBe('2026-08-21');
  });

  it('nguồn không trả ngày thì về null, ảnh chụp vẫn dùng được', () => {
    const snapshot = toSnapshot(FPT_ROW);

    expect(snapshot?.asOfDate).toBeNull();
    expect(snapshot?.priceVnd).toBe(71_400);
  });

  it('số rác không thành ngày', () => {
    // Sai độ dài, tháng 13, ngày 0, số thực, chuỗi — không cái nào được lọt thành ngày hợp lệ.
    for (const raw of [2026, 202608251, 20261325, 20260800, 2026.5, '20260825', null]) {
      expect(toIsoDate(raw)).toBeNull();
    }
  });
});

describe('lọc danh sách mã khỏi chỉ số và tên ngành', () => {
  /*
   * Luật là `code !== name`. Ca này ghim đúng ba loại mục mà `/bp/codes` trộn lẫn, và ghim luôn
   * hai ca mà luật "ba ký tự viết hoa" làm sai: HNX lọt vào, E1VFVN30 bị loại oan.
   */
  const raw = [
    { code: 'FPT', name: 'FPT Corp' },
    { code: 'VNINDEX', name: 'VNINDEX' },
    { code: 'HNX', name: 'HNX' },
    { code: 'Bánh kẹo', name: 'Bánh kẹo' },
    { code: 'E1VFVN30', name: 'ETF VFMVN30' },
    { code: 'fpt', name: 'FPT Corp' },
    { code: '', name: 'Không mã' },
    null,
  ];

  it('giữ mã cổ phiếu và chứng chỉ quỹ, bỏ chỉ số và ngành', () => {
    expect(parseTickerList(raw).map((item) => item.code)).toEqual(['FPT', 'E1VFVN30']);
  });

  it('viết hoa mã và bỏ bản trùng', () => {
    const list = parseTickerList(raw);
    expect(list.filter((item) => item.code === 'FPT')).toHaveLength(1);
  });

  it('thân phản hồi không phải mảng thì ra danh sách rỗng', () => {
    expect(parseTickerList({ codes: [] })).toEqual([]);
    expect(parseTickerList(null)).toEqual([]);
  });
});
