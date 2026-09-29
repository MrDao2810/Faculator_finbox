import type { ViDuGiai } from './types';

/**
 * Nội dung lời giải của 111 ví dụ. Soạn ngày 29/09/2026 — xem docblock `ViDuGiai` và ca kiểm
 * `vi-du.test.ts` (dòng "Áp vào công thức" tính lại phải ra đúng `calc`, ký hiệu có thật trong hình,
 * con số có trong ví dụ, link là https).
 */
export const VI_DU_MUC: Readonly<Record<string, ViDuGiai>> = {
  pe: {
    tinh: {
      vi: 'hệ số P/E của FPT phiên 11/09/2026',
      en: "FPT's P/E ratio on the 2026-09-11 session",
    },
    gan: [
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫',
          en: "is FPT's close on the 2026-09-11 session: 72700 ₫",
        },
      },
      {
        kyHieu: 'EPS',
        moTa: {
          vi: 'là lợi nhuận bốn quý gần nhất trên một cổ phiếu FPT, theo báo cáo tài chính quý 2/2026: 5.867 ₫',
          en: "is FPT's trailing four-quarter earnings per share, per the Q2/2026 financial statements: 5867 ₫",
        },
      },
    ],
    thaySo: {
      vi: '72.700 ÷ 5.867',
      en: '72700 ÷ 5867',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
    ],
  },
  pb: {
    tinh: {
      vi: 'hệ số P/B của FPT phiên 11/09/2026',
      en: "FPT's P/B ratio on the 2026-09-11 session",
    },
    gan: [
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫',
          en: "is FPT's close on the 2026-09-11 session: 72700 ₫",
        },
      },
      {
        kyHieu: 'BVPS',
        moTa: {
          vi: 'là vốn chủ của cổ đông công ty mẹ FPT cuối quý 2/2026 chia cho số cổ phiếu lưu hành: 23.246 ₫',
          en: "is FPT's equity attributable to parent shareholders at the end of Q2/2026 divided by shares outstanding: 23246 ₫",
        },
      },
    ],
    thaySo: {
      vi: '72.700 ÷ 23.246',
      en: '72700 ÷ 23246',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/balance-sheet/?p=quarterly',
        nhan: {
          vi: 'Vốn chủ của cổ đông công ty mẹ FPT ngày 30/06/2026 (dòng Total Common Equity, triệu ₫)',
          en: 'FPT equity attributable to parent shareholders at 30 June 2026 (Total Common Equity row, million ₫)',
        },
      },
      {
        url: 'https://vneconomy.vn/fpt-thu-hon-108-ty-tu-phat-hanh-hon-11-trieu-co-phieu-esop.htm',
        nhan: {
          vi: 'Số cổ phiếu FPT lưu hành sau hai đợt ESOP, tin ngày 01/07/2026',
          en: 'FPT shares outstanding after the two ESOP rounds, report dated 2026-07-01',
        },
      },
    ],
  },
  'eps-co-ban': {
    tinh: {
      vi: 'EPS cơ bản của FPT trong 6 tháng đầu 2026',
      en: "FPT's basic EPS for H1 2026",
    },
    gan: [
      {
        kyHieu: '\\text{LNST}',
        moTa: {
          vi: 'là lợi nhuận sau thuế của cổ đông công ty mẹ FPT trong 6 tháng đầu 2026: 5.055,1 tỷ ₫',
          en: "is FPT's net income attributable to parent shareholders in H1 2026: 5055.1 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Cổ tức ưu đãi}',
        moTa: {
          vi: 'bằng 0 tỷ ₫, vì FPT không có cổ phiếu ưu đãi',
          en: 'is the preferred dividend: 0 billion ₫, since FPT has no preferred shares',
        },
      },
      {
        kyHieu: '\\text{Số CP lưu hành}',
        moTa: {
          vi: 'của FPT ở cuối kỳ 6 tháng đầu 2026: 1.714.326.422 cổ phiếu',
          en: "is FPT's shares outstanding at the end of H1 2026: 1714326422 shares",
        },
      },
    ],
    thaySo: {
      vi: '(5.055,1 − 0) ÷ 1.714.326.422 × 10^9',
      en: '(5055.1 − 0) ÷ 1714326422 × 10^9',
    },
    nguon: [
      {
        url: 'https://cafef.vn/6-thang-dau-nam-2026-loi-nhuan-truoc-thue-cua-fpt-tang-truong-181-188260716134057667.chn',
        nhan: {
          vi: 'Bản tin kết quả kinh doanh 6 tháng đầu 2026 của FPT (LNST công ty mẹ, EPS FPT công bố)',
          en: 'FPT H1 2026 business results release (parent net income, EPS reported by FPT)',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/incsta/2026/2/0/0/ket-qua-hoat-dong-kinh-doanh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'LNST công ty mẹ FPT quý 1 và quý 2/2026',
          en: 'FPT parent net income, Q1 and Q2/2026',
        },
      },
      {
        url: 'https://vneconomy.vn/fpt-thu-hon-108-ty-tu-phat-hanh-hon-11-trieu-co-phieu-esop.htm',
        nhan: {
          vi: 'Số cổ phiếu FPT lưu hành sau hai đợt ESOP, tin ngày 01/07/2026',
          en: 'FPT shares outstanding after the two ESOP rounds, report dated 2026-07-01',
        },
      },
    ],
  },
  bvps: {
    tinh: {
      vi: 'giá trị sổ sách mỗi cổ phiếu FPT ngày 30/06/2026',
      en: "FPT's book value per share at 30 June 2026",
    },
    gan: [
      {
        kyHieu: '\\text{Vốn chủ sở hữu}',
        moTa: {
          vi: 'của cổ đông công ty mẹ FPT ngày 30/06/2026, tức tổng vốn chủ trừ phần lợi ích cổ đông không kiểm soát: 39.851,5 tỷ ₫',
          en: "is FPT's equity attributable to parent shareholders at 30 June 2026, total equity less non-controlling interests: 39851.5 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Số CP lưu hành}',
        moTa: {
          vi: 'của FPT ngày 30/06/2026: 1.714.326.422 cổ phiếu',
          en: "is FPT's shares outstanding at 30 June 2026: 1714326422 shares",
        },
      },
    ],
    thaySo: {
      vi: '39.851,5 ÷ 1.714.326.422 × 10^9',
      en: '39851.5 ÷ 1714326422 × 10^9',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/bsheet/2026/2/0/0/bao-cao-tai-chinh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Bảng cân đối kế toán FPT quý 2/2026: tổng vốn chủ và lợi ích cổ đông không kiểm soát',
          en: 'FPT balance sheet, Q2/2026: total equity and non-controlling interests',
        },
      },
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/balance-sheet/?p=quarterly',
        nhan: {
          vi: 'Vốn chủ của cổ đông công ty mẹ FPT ngày 30/06/2026 (dòng Total Common Equity, triệu ₫)',
          en: 'FPT equity attributable to parent shareholders at 30 June 2026 (Total Common Equity row, million ₫)',
        },
      },
      {
        url: 'https://vneconomy.vn/fpt-thu-hon-108-ty-tu-phat-hanh-hon-11-trieu-co-phieu-esop.htm',
        nhan: {
          vi: 'Số cổ phiếu FPT lưu hành sau hai đợt ESOP, tin ngày 01/07/2026',
          en: 'FPT shares outstanding after the two ESOP rounds, report dated 2026-07-01',
        },
      },
    ],
  },
  roe: {
    tinh: {
      vi: 'ROE của FPT trong 6 tháng đầu 2026',
      en: "FPT's ROE for H1 2026",
    },
    gan: [
      {
        kyHieu: '\\text{LNST}',
        moTa: {
          vi: 'là lợi nhuận sau thuế của cổ đông công ty mẹ FPT trong 6 tháng đầu 2026: 5.055,1 tỷ ₫',
          en: "is FPT's net income attributable to parent shareholders in H1 2026: 5055.1 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Vốn chủ sở hữu}',
        moTa: {
          vi: 'của cổ đông công ty mẹ FPT ngày 30/06/2026: 39.851,5 tỷ ₫',
          en: "is FPT's equity attributable to parent shareholders at 30 June 2026: 39851.5 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '5.055,1 ÷ 39.851,5 × 100',
      en: '5055.1 ÷ 39851.5 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/6-thang-dau-nam-2026-loi-nhuan-truoc-thue-cua-fpt-tang-truong-181-188260716134057667.chn',
        nhan: {
          vi: 'Bản tin kết quả kinh doanh 6 tháng đầu 2026 của FPT (LNST công ty mẹ)',
          en: 'FPT H1 2026 business results release (parent net income)',
        },
      },
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/balance-sheet/?p=quarterly',
        nhan: {
          vi: 'Vốn chủ của cổ đông công ty mẹ FPT ngày 30/06/2026 (dòng Total Common Equity, triệu ₫)',
          en: 'FPT equity attributable to parent shareholders at 30 June 2026 (Total Common Equity row, million ₫)',
        },
      },
    ],
  },
  roa: {
    tinh: {
      vi: 'ROA của FPT trong 6 tháng đầu 2026',
      en: "FPT's ROA for H1 2026",
    },
    gan: [
      {
        kyHieu: '\\text{LNST}',
        moTa: {
          vi: 'là lợi nhuận sau thuế của cổ đông công ty mẹ FPT trong 6 tháng đầu 2026: 5.055,1 tỷ ₫',
          en: "is FPT's net income attributable to parent shareholders in H1 2026: 5055.1 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Tổng tài sản}',
        moTa: {
          vi: 'của FPT ngày 30/06/2026: 73.734,2 tỷ ₫',
          en: "is FPT's total assets at 30 June 2026: 73734.2 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '5.055,1 ÷ 73.734,2 × 100',
      en: '5055.1 ÷ 73734.2 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/6-thang-dau-nam-2026-loi-nhuan-truoc-thue-cua-fpt-tang-truong-181-188260716134057667.chn',
        nhan: {
          vi: 'Bản tin kết quả kinh doanh 6 tháng đầu 2026 của FPT (LNST công ty mẹ)',
          en: 'FPT H1 2026 business results release (parent net income)',
        },
      },
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/balance-sheet/?p=quarterly',
        nhan: {
          vi: 'Tổng tài sản FPT ngày 30/06/2026 (dòng Total Assets, triệu ₫)',
          en: 'FPT total assets at 30 June 2026 (Total Assets row, million ₫)',
        },
      },
    ],
  },
  'bien-loi-nhuan-rong': {
    tinh: {
      vi: 'biên lợi nhuận ròng của FPT trong 6 tháng đầu 2026',
      en: "FPT's net profit margin for H1 2026",
    },
    gan: [
      {
        kyHieu: '\\text{LNST}',
        moTa: {
          vi: 'là lợi nhuận sau thuế của cổ đông công ty mẹ FPT trong 6 tháng đầu 2026: 5.055,1 tỷ ₫',
          en: "is FPT's net income attributable to parent shareholders in H1 2026: 5055.1 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Doanh thu thuần}',
        moTa: {
          vi: 'của FPT trong 6 tháng đầu 2026: 26.268,5 tỷ ₫',
          en: "is FPT's net revenue in H1 2026: 26268.5 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '5.055,1 ÷ 26.268,5 × 100',
      en: '5055.1 ÷ 26268.5 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/incsta/2026/2/0/0/ket-qua-hoat-dong-kinh-doanh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Kết quả kinh doanh FPT quý 1 và quý 2/2026: doanh thu thuần, LNST công ty mẹ',
          en: 'FPT income statement, Q1 and Q2/2026: net revenue, parent net income',
        },
      },
      {
        url: 'https://cafef.vn/6-thang-dau-nam-2026-loi-nhuan-truoc-thue-cua-fpt-tang-truong-181-188260716134057667.chn',
        nhan: {
          vi: 'Bản tin kết quả kinh doanh 6 tháng đầu 2026 của FPT (doanh thu, LNST công ty mẹ cả kỳ)',
          en: 'FPT H1 2026 business results release (revenue and parent net income for the half)',
        },
      },
    ],
  },
  'bien-loi-nhuan-gop': {
    tinh: {
      vi: 'biên lợi nhuận gộp của FPT trong 6 tháng đầu 2026',
      en: "FPT's gross profit margin for H1 2026",
    },
    gan: [
      {
        kyHieu: '\\text{Doanh thu}',
        moTa: {
          vi: 'thuần của FPT trong 6 tháng đầu 2026: 26.268,5 tỷ ₫',
          en: "is FPT's net revenue in H1 2026: 26268.5 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Giá vốn}',
        moTa: {
          vi: 'hàng bán của FPT trong 6 tháng đầu 2026: 17.745 tỷ ₫',
          en: "is FPT's cost of goods sold in H1 2026: 17745 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '(26.268,5 − 17.745) ÷ 26.268,5 × 100',
      en: '(26268.5 − 17745) ÷ 26268.5 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/incsta/2026/2/0/0/ket-qua-hoat-dong-kinh-doanh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Kết quả kinh doanh FPT quý 1 và quý 2/2026: doanh thu thuần, giá vốn, lợi nhuận gộp',
          en: 'FPT income statement, Q1 and Q2/2026: net revenue, cost of goods sold, gross profit',
        },
      },
    ],
  },
  'no-tren-von-chu': {
    tinh: {
      vi: 'hệ số nợ trên vốn chủ của FPT ngày 30/06/2026',
      en: "FPT's debt-to-equity ratio at 30 June 2026",
    },
    gan: [
      {
        kyHieu: '\\text{Tổng nợ phải trả}',
        moTa: {
          vi: 'của FPT ngày 30/06/2026: 32.738,4 tỷ ₫',
          en: "is FPT's total liabilities at 30 June 2026: 32738.4 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Vốn chủ sở hữu}',
        moTa: {
          vi: 'của FPT ngày 30/06/2026, tính cả lợi ích cổ đông không kiểm soát: 40.995,7 tỷ ₫',
          en: "is FPT's total equity at 30 June 2026, non-controlling interests included: 40995.7 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '32.738,4 ÷ 40.995,7',
      en: '32738.4 ÷ 40995.7',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/bsheet/2026/2/0/0/bao-cao-tai-chinh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Bảng cân đối kế toán FPT quý 2/2026: nợ phải trả, vốn chủ sở hữu',
          en: 'FPT balance sheet, Q2/2026: liabilities, equity',
        },
      },
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/balance-sheet/?p=quarterly',
        nhan: {
          vi: 'Nợ vay, tiền và đầu tư ngắn hạn của FPT ngày 30/06/2026 (triệu ₫)',
          en: 'FPT borrowings, cash and short-term investments at 30 June 2026 (million ₫)',
        },
      },
    ],
  },
  'thanh-toan-hien-hanh': {
    tinh: {
      vi: 'hệ số thanh toán hiện hành của FPT ngày 30/06/2026',
      en: "FPT's current ratio at 30 June 2026",
    },
    gan: [
      {
        kyHieu: '\\text{Tài sản ngắn hạn}',
        moTa: {
          vi: 'của FPT ngày 30/06/2026: 45.702 tỷ ₫',
          en: "is FPT's current assets at 30 June 2026: 45702 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Nợ ngắn hạn}',
        moTa: {
          vi: 'của FPT ngày 30/06/2026: 29.365,3 tỷ ₫',
          en: "is FPT's current liabilities at 30 June 2026: 29365.3 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '45.702 ÷ 29.365,3',
      en: '45702 ÷ 29365.3',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/bsheet/2026/2/0/0/bao-cao-tai-chinh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Bảng cân đối kế toán FPT quý 2/2026: tài sản ngắn hạn, nợ ngắn hạn',
          en: 'FPT balance sheet, Q2/2026: current assets, current liabilities',
        },
      },
    ],
  },
  'thanh-toan-nhanh': {
    tinh: {
      vi: 'hệ số thanh toán nhanh của FPT tại 30/06/2026',
      en: "FPT's quick ratio at 30 June 2026",
    },
    gan: [
      {
        kyHieu: '\\text{Tài sản ngắn hạn}',
        moTa: {
          vi: 'của FPT trên bảng cân đối kế toán hợp nhất 30/06/2026: 45.702 tỷ ₫',
          en: "is FPT's current assets on the consolidated balance sheet at 30 June 2026: 45702 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Hàng tồn kho}',
        moTa: {
          vi: 'của FPT cùng ngày: 1.183,1 tỷ ₫',
          en: "is FPT's inventory on the same date: 1183.1 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Nợ ngắn hạn}',
        moTa: {
          vi: 'của FPT cùng ngày: 29.365,3 tỷ ₫',
          en: "is FPT's current liabilities on the same date: 29365.3 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '(45.702 − 1.183,1) ÷ 29.365,3',
      en: '(45702 − 1183.1) ÷ 29365.3',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/bsheet/2026/2/0/0/bao-cao-tai-chinh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Bảng cân đối kế toán FPT, cột Quý 2- 2026; hàng tồn kho đọc ở dòng IV (đã trừ dự phòng)',
          en: 'FPT balance sheet, Quý 2- 2026 column; inventory is the IV line (net of provisions)',
        },
      },
    ],
  },
  'vong-quay-tong-tai-san': {
    tinh: {
      vi: 'vòng quay tổng tài sản của FPT trong 6 tháng đầu 2026',
      en: "FPT's total asset turnover for H1 2026",
    },
    gan: [
      {
        kyHieu: '\\text{Doanh thu thuần}',
        moTa: {
          vi: 'của FPT 6 tháng đầu 2026, cộng hai quý đầu năm: 26.268,5 tỷ ₫',
          en: "is FPT's net revenue for H1 2026, the first two quarters added together: 26268.5 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Tổng tài sản}',
        moTa: {
          vi: 'của FPT tại 30/06/2026: 73.734,2 tỷ ₫',
          en: "is FPT's total assets at 30 June 2026: 73734.2 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '26.268,5 ÷ 73.734,2',
      en: '26268.5 ÷ 73734.2',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/incsta/2026/2/0/0/ket-qua-hoat-dong-kinh-doanh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Doanh thu thuần FPT, cột Quý 1- 2026 và Quý 2- 2026',
          en: 'FPT net revenue, Quý 1- 2026 and Quý 2- 2026 columns',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/bsheet/2026/2/0/0/bao-cao-tai-chinh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Tổng tài sản FPT 30/06/2026: đọc dòng Tổng cộng nguồn vốn, vì dòng Tổng cộng tài sản của trang đang ghi sai',
          en: "FPT total assets at 30 June 2026: read the TỔNG CỘNG NGUỒN VỐN line, because the page's TỔNG CỘNG TÀI SẢN line is misprinted",
        },
      },
    ],
  },
  'ty-le-chi-tra-co-tuc': {
    tinh: {
      vi: 'hệ số chi trả cổ tức của FPT',
      en: "FPT's dividend payout ratio",
    },
    gan: [
      {
        kyHieu: 'DPS',
        moTa: {
          vi: 'là cổ tức tiền mặt FPT trả trong một năm, bằng 20% mệnh giá: 2.000 ₫ mỗi cổ phiếu',
          en: 'is the cash dividend FPT pays in a year, 20% of par: 2000 ₫ per share',
        },
      },
      {
        kyHieu: 'EPS',
        moTa: {
          vi: 'là lợi nhuận bốn quý gần nhất trên một cổ phiếu FPT, theo CafeF: 5.867 ₫',
          en: "is FPT's trailing four-quarter earnings per share, per CafeF: 5867 ₫",
        },
      },
    ],
    thaySo: {
      vi: '2.000 ÷ 5.867 × 100',
      en: '2000 ÷ 5867 × 100',
    },
    nguon: [
      {
        url: 'https://cotuc.vn/co-phieu/fpt',
        nhan: {
          vi: 'Lịch sử cổ tức tiền mặt FPT, mỗi năm hai đợt 1.000 ₫/CP',
          en: 'FPT cash dividend history, two payments of 1000 ₫/share a year',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/hose/fpt/chi-tiet-tinh-eps.chn',
        nhan: {
          vi: 'EPS bốn quý đến 30/06/2026, CafeF in 5,87 nghìn ₫',
          en: 'Four-quarter EPS to 30 June 2026, shown by CafeF as 5.87 thousand ₫',
        },
      },
    ],
  },
  ps: {
    tinh: {
      vi: 'hệ số P/S của FPT phiên 11/09/2026',
      en: "FPT's P/S ratio on the 2026-09-11 session",
    },
    gan: [
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫',
          en: "is FPT's close on the 2026-09-11 session: 72700 ₫",
        },
      },
      {
        kyHieu: 'S_{ps}',
        moTa: {
          vi: 'là doanh thu bốn quý gần nhất của FPT chia cho số cổ phiếu lưu hành: 37.157 ₫',
          en: "is FPT's revenue over the last four quarters divided by its shares outstanding: 37157 ₫",
        },
      },
    ],
    thaySo: {
      vi: '72.700 ÷ 37.157',
      en: '72700 ÷ 37157',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/income-statement/',
        nhan: {
          vi: 'Doanh thu bốn quý gần nhất của FPT, cột TTM, triệu ₫',
          en: 'FPT revenue over the last four quarters, TTM column, millions of ₫',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/hose/fpt/chi-tiet-tinh-eps.chn',
        nhan: {
          vi: 'Số cổ phiếu FPT lưu hành cuối kỳ 30/06/2026',
          en: 'FPT shares outstanding at 30 June 2026',
        },
      },
    ],
  },
  ev: {
    tinh: {
      vi: 'giá trị doanh nghiệp FPT theo vốn hoá phiên 11/09/2026',
      en: "FPT's enterprise value at the 2026-09-11 market cap",
    },
    gan: [
      {
        kyHieu: '\\text{Vốn hoá}',
        moTa: {
          vi: 'của FPT theo giá đóng cửa phiên 11/09/2026: 124.631,5 tỷ ₫',
          en: "is FPT's market cap at the 2026-09-11 close: 124631.5 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Nợ vay}',
        moTa: {
          vi: 'là vay ngắn hạn cộng vay dài hạn của FPT tại 30/06/2026: 17.444 tỷ ₫',
          en: "is FPT's short-term plus long-term borrowing at 2026-06-30: 17444 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Tiền mặt}',
        moTa: {
          vi: 'là tiền, tương đương tiền và đầu tư tài chính ngắn hạn của FPT cùng ngày: 28.971,6 tỷ ₫',
          en: "is FPT's cash, cash equivalents and short-term investments on the same date: 28971.6 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '124.631,5 + 17.444 − 28.971,6',
      en: '124631.5 + 17444 − 28971.6',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026, nhân số cổ phiếu ra vốn hoá',
          en: 'FPT price, 2026-09-11 session, times shares gives market cap',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/hose/fpt/chi-tiet-tinh-eps.chn',
        nhan: {
          vi: 'Số cổ phiếu FPT lưu hành cuối kỳ 30/06/2026',
          en: 'FPT shares outstanding at 30 June 2026',
        },
      },
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/balance-sheet/?p=quarterly',
        nhan: {
          vi: 'Nợ vay FPT 30/06/2026: dòng Short-Term Debt cộng dòng Long-Term Debt, triệu ₫',
          en: 'FPT debt at 2026-06-30: the Short-Term Debt line plus the Long-Term Debt line, millions of ₫',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/bsheet/2026/2/0/0/bao-cao-tai-chinh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Tiền FPT 30/06/2026: dòng Tiền và các khoản tương đương tiền cộng dòng Các khoản đầu tư tài chính ngắn hạn, cột Quý 2- 2026',
          en: 'FPT cash at 2026-06-30: the cash and cash equivalents line plus the short-term investments line, Quý 2- 2026 column',
        },
      },
    ],
  },
  'ev-ebitda': {
    tinh: {
      vi: 'bội số EV/EBITDA của FPT',
      en: "FPT's EV/EBITDA multiple",
    },
    gan: [
      {
        kyHieu: 'EV',
        moTa: {
          vi: 'là giá trị doanh nghiệp FPT tính ở ví dụ của công thức EV: 113.103,9 tỷ ₫',
          en: "is FPT's enterprise value from the EV formula's example: 113103.9 billion ₫",
        },
      },
      {
        kyHieu: 'EBITDA',
        moTa: {
          vi: 'là lợi nhuận trước thuế cộng lãi vay và khấu hao của FPT 6 tháng đầu 2026, nhân đôi để quy năm: 13.901,9 tỷ ₫',
          en: "is FPT's pre-tax profit plus interest and depreciation for H1 2026, doubled to a full year: 13901.9 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '113.103,9 ÷ 13.901,9',
      en: '113103.9 ÷ 13901.9',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/cashflow/2026/2/0/0/luu-chuyen-tien-te-gian-tiep-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Lưu chuyển tiền tệ FPT, cột Quý 2- 2026 cộng dồn 6 tháng: lợi nhuận trước thuế, khấu hao, chi phí lãi vay',
          en: 'FPT cash flow statement, the Quý 2- 2026 column is six months to date: pre-tax profit, depreciation, interest expense',
        },
      },
    ],
  },
  'ev-sales': {
    tinh: {
      vi: 'bội số EV/Sales của FPT theo doanh thu quy năm',
      en: "FPT's EV/Sales multiple on annualized revenue",
    },
    gan: [
      {
        kyHieu: 'EV',
        moTa: {
          vi: 'là giá trị doanh nghiệp FPT tính ở ví dụ của công thức EV: 113.103,9 tỷ ₫',
          en: "is FPT's enterprise value from the EV formula's example: 113103.9 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Doanh thu}',
        moTa: {
          vi: 'là doanh thu thuần nửa đầu 2026 của FPT nhân đôi để quy năm, theo nền hợp nhất đã bỏ FPT Telecom: 52.537 tỷ ₫',
          en: "is FPT's first-half 2026 net revenue doubled to a full year, on the consolidation basis that excludes FPT Telecom: 52537 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '113.103,9 ÷ 52.537',
      en: '113103.9 ÷ 52537',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/incsta/2026/2/0/0/ket-qua-hoat-dong-kinh-doanh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Doanh thu thuần FPT, cột Quý 1- 2026 và Quý 2- 2026',
          en: 'FPT net revenue, Quý 1- 2026 and Quý 2- 2026 columns',
        },
      },
    ],
  },
  peg: {
    tinh: {
      vi: 'hệ số PEG của FPT theo giá phiên 11/09/2026',
      en: "FPT's PEG ratio at the 2026-09-11 close",
    },
    gan: [
      {
        kyHieu: 'P/E',
        moTa: {
          vi: 'là P/E của FPT theo giá phiên 11/09/2026: 12,39 lần',
          en: "is FPT's P/E at the 2026-09-11 close: 12.39x",
        },
      },
      {
        kyHieu: 'g',
        moTa: {
          vi: 'là mức tăng lợi nhuận sau thuế thuộc cổ đông công ty mẹ của FPT 6 tháng đầu 2026 so với cùng kỳ: 14,1%',
          en: "is the year-on-year growth in FPT's H1 2026 profit attributable to parent shareholders: 14.1%",
        },
      },
    ],
    thaySo: {
      vi: '12,39 ÷ 14,1',
      en: '12.39 ÷ 14.1',
    },
    nguon: [
      {
        url: 'https://cafef.vn/6-thang-dau-nam-2026-loi-nhuan-truoc-thue-cua-fpt-tang-truong-181-188260716134057667.chn',
        nhan: {
          vi: 'Kết quả kinh doanh 6 tháng đầu 2026 của FPT, lợi nhuận tăng 14,1%',
          en: 'FPT H1 2026 results, profit up 14.1%',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026, tử số của P/E',
          en: 'FPT price, 2026-09-11 session, the numerator of P/E',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/hose/fpt/chi-tiet-tinh-eps.chn',
        nhan: {
          vi: 'EPS bốn quý đến 30/06/2026, mẫu số của P/E (CafeF in 5,87 nghìn ₫)',
          en: 'Four-quarter EPS to 30 June 2026, the denominator of P/E (shown by CafeF as 5.87 thousand ₫)',
        },
      },
    ],
  },
  'von-hoa-thi-truong': {
    tinh: {
      vi: 'vốn hoá thị trường của FPT phiên 11/09/2026',
      en: "FPT's market cap on the 2026-09-11 session",
    },
    gan: [
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫',
          en: "is FPT's close on the 2026-09-11 session: 72700 ₫",
        },
      },
      {
        kyHieu: 'N',
        moTa: {
          vi: 'là số cổ phiếu FPT lưu hành tại phiên 11/09/2026: 1.714,33 triệu CP',
          en: "is FPT's shares outstanding on the 2026-09-11 session: 1714.33 million shares",
        },
      },
    ],
    thaySo: {
      vi: '72.700 × 1.714,33 ÷ 1.000',
      en: '72700 × 1714.33 ÷ 1000',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/hose/fpt/chi-tiet-tinh-eps.chn',
        nhan: {
          vi: 'Số cổ phiếu FPT lưu hành cuối kỳ 30/06/2026',
          en: 'FPT shares outstanding at 30 June 2026',
        },
      },
    ],
  },
  'so-graham': {
    tinh: {
      vi: 'số Graham của FPT',
      en: "FPT's Graham number",
    },
    gan: [
      {
        kyHieu: 'EPS',
        moTa: {
          vi: 'là lợi nhuận bốn quý gần nhất trên một cổ phiếu FPT: 5.867 ₫',
          en: "is FPT's trailing four-quarter earnings per share: 5867 ₫",
        },
      },
      {
        kyHieu: 'BVPS',
        moTa: {
          vi: 'là vốn chủ sở hữu của cổ đông công ty mẹ FPT chia cho số cổ phiếu lưu hành, tại 30/06/2026: 23.246 ₫',
          en: "is FPT's parent shareholders' equity divided by its shares outstanding, as of 2026-06-30: 23246 ₫",
        },
      },
    ],
    thaySo: {
      vi: '√(22,5 × 5.867 × 23.246)',
      en: '√(22.5 × 5867 × 23246)',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/hose/fpt/chi-tiet-tinh-eps.chn',
        nhan: {
          vi: 'EPS bốn quý đến 30/06/2026 (CafeF in 5,87 nghìn ₫) và số cổ phiếu lưu hành cuối kỳ',
          en: 'Four-quarter EPS to 30 June 2026 (shown by CafeF as 5.87 thousand ₫) and shares outstanding at period end',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/bsheet/2026/2/0/0/bao-cao-tai-chinh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Vốn chủ sở hữu FPT 30/06/2026, trừ dòng Lợi ích cổ đông không kiểm soát',
          en: 'FPT equity at 30 June 2026, less the Lợi ích cổ đông không kiểm soát (non-controlling interest) line',
        },
      },
    ],
  },
  'ncav-tren-co-phieu': {
    tinh: {
      vi: 'NCAV trên mỗi cổ phiếu FPT ngày 30/06/2026',
      en: "FPT's NCAV per share at 2026-06-30",
    },
    gan: [
      {
        kyHieu: '\\text{TSNH}',
        moTa: {
          vi: 'là tài sản ngắn hạn trên bảng cân đối kế toán hợp nhất của FPT ngày 30/06/2026: 45.702 tỷ ₫',
          en: "is the current assets on FPT's consolidated balance sheet at 2026-06-30: 45702 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Tổng nợ}',
        moTa: {
          vi: 'là toàn bộ nợ phải trả của FPT cùng ngày, cả ngắn hạn lẫn dài hạn: 32.738,4 tỷ ₫',
          en: "is all of FPT's liabilities on the same date, short-term and long-term: 32738.4 billion ₫",
        },
      },
      {
        kyHieu: 'N',
        moTa: {
          vi: 'là số cổ phiếu FPT đang lưu hành cùng ngày: 1.714,33 triệu CP',
          en: 'is the number of FPT shares outstanding on the same date: 1714.33 million shares',
        },
      },
    ],
    thaySo: {
      vi: '(45.702 − 32.738,4) ÷ 1.714,33 × 1.000',
      en: '(45702 − 32738.4) ÷ 1714.33 × 1000',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/bsheet/2026/2/0/0/bao-cao-tai-chinh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Tài sản ngắn hạn và nợ phải trả của FPT, cột Quý 2- 2026',
          en: "FPT's current assets and liabilities, Q2 2026 column",
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/hose/fpt/chi-tiet-tinh-eps.chn',
        nhan: {
          vi: 'Số cổ phiếu FPT lưu hành ngày 30/06/2026',
          en: 'FPT shares outstanding at 2026-06-30',
        },
      },
    ],
  },
  'ty-suat-loi-nhuan-tren-gia': {
    tinh: {
      vi: 'tỷ suất lợi nhuận trên giá của FPT phiên 11/09/2026',
      en: "FPT's earnings yield on the 2026-09-11 session",
    },
    gan: [
      {
        kyHieu: 'EPS',
        moTa: {
          vi: 'là lợi nhuận bốn quý gần nhất trên một cổ phiếu FPT: 5.867 ₫',
          en: "is FPT's trailing four-quarter earnings per share: 5867 ₫",
        },
      },
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫',
          en: "is FPT's close on the 2026-09-11 session: 72700 ₫",
        },
      },
    ],
    thaySo: {
      vi: '5.867 ÷ 72.700 × 100',
      en: '5867 ÷ 72700 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
    ],
  },
  'gia-muc-tieu': {
    tinh: {
      vi: 'giá mục tiêu của FPT nếu P/E quay về mức trung bình lịch sử',
      en: "FPT's target price if its P/E returns to the historical average",
    },
    gan: [
      {
        kyHieu: 'P/E_{\\text{mục tiêu}}',
        moTa: {
          vi: 'là bội số P/E chọn theo mức trung bình lịch sử của chính FPT: 15 lần',
          en: "is the P/E multiple taken from FPT's own historical average: 15x",
        },
      },
      {
        kyHieu: 'EPS',
        moTa: {
          vi: 'là lợi nhuận bốn quý gần nhất trên một cổ phiếu FPT: 5.867 ₫',
          en: "is FPT's trailing four-quarter earnings per share: 5867 ₫",
        },
      },
    ],
    thaySo: {
      vi: '15 × 5.867',
      en: '15 × 5867',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026, mốc so sánh',
          en: 'FPT price, 2026-09-11 session, the comparison point',
        },
      },
    ],
  },
  'mo-hinh-gordon': {
    tinh: {
      vi: 'giá trị một cổ phiếu FPT theo dòng cổ tức tăng đều mãi mãi',
      en: 'the value of one FPT share from a dividend stream growing steadily forever',
    },
    gan: [
      {
        kyHieu: 'D_0',
        moTa: {
          vi: 'là cổ tức tiền mặt FPT trả trong một năm: 2.000 ₫ mỗi cổ phiếu',
          en: 'is the cash dividend FPT pays in a year: 2000 ₫ per share',
        },
      },
      {
        kyHieu: 'g',
        moTa: {
          vi: 'là mức tăng cổ tức dài hạn giả định cho FPT: 5%/năm',
          en: 'is the long-term dividend growth assumed for FPT: 5%/year',
        },
      },
      {
        kyHieu: 'r',
        moTa: {
          vi: 'là suất sinh lợi yêu cầu, lấy bằng chi phí vốn chủ của FPT tính từ CAPM: 11,92%/năm',
          en: "is the required return, set to FPT's cost of equity from CAPM: 11.92%/year",
        },
      },
    ],
    thaySo: {
      vi: '2.000 × (1 + 5 ÷ 100) ÷ ((11,92 − 5) ÷ 100)',
      en: '2000 × (1 + 5 ÷ 100) ÷ ((11.92 − 5) ÷ 100)',
    },
    nguon: [
      {
        url: 'https://cotuc.vn/co-phieu/fpt',
        nhan: {
          vi: 'Lịch sử cổ tức tiền mặt FPT, mỗi năm hai đợt',
          en: "FPT's cash dividend history, two payments a year",
        },
      },
    ],
  },
  'ddm-hai-giai-doan': {
    tinh: {
      vi: 'giá trị một cổ phiếu FPT khi cổ tức tăng nhanh 5 năm rồi tăng chậm mãi mãi',
      en: 'the value of one FPT share when dividends grow fast for 5 years and slowly forever after',
    },
    gan: [
      {
        kyHieu: 'D_0',
        moTa: {
          vi: 'là cổ tức tiền mặt FPT trả trong một năm: 2.000 ₫ mỗi cổ phiếu',
          en: 'is the cash dividend FPT pays in a year: 2000 ₫ per share',
        },
      },
      {
        kyHieu: 'g_1',
        moTa: {
          vi: 'là mức tăng cổ tức trong giai đoạn đầu, lấy theo mức tăng lợi nhuận sau thuế nửa đầu 2026 của FPT: 14%/năm',
          en: "is the dividend growth in the first stage, taken from FPT's net-profit growth in the first half of 2026: 14%/year",
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là số năm cổ tức giữ được mức tăng nhanh ấy: 5 năm',
          en: 'is the number of years dividends keep that fast growth: 5 years',
        },
      },
      {
        kyHieu: 't',
        moTa: {
          vi: 'chạy từ năm 1 tới năm 5 của giai đoạn tăng nhanh, mỗi năm cho một khoản cổ tức quy về hôm nay',
          en: 'runs from year 1 to year 5 of the fast-growth stage, each year giving one dividend brought back to today',
        },
      },
      {
        kyHieu: 'g_2',
        moTa: {
          vi: 'là mức tăng cổ tức giả định từ năm thứ sáu trở đi, giữ mãi mãi: 5%/năm',
          en: 'is the dividend growth assumed from the sixth year on, held forever: 5%/year',
        },
      },
      {
        kyHieu: 'r',
        moTa: {
          vi: 'là suất sinh lợi yêu cầu, lấy bằng chi phí vốn chủ của FPT tính từ CAPM: 11,92%/năm',
          en: "is the required return, set to FPT's cost of equity from CAPM: 11.92%/year",
        },
      },
    ],
    thaySo: {
      vi: '2.000 × (1 + 14 ÷ 100) ÷ (1 + 11,92 ÷ 100) + 2.000 × (1 + 14 ÷ 100)^2 ÷ (1 + 11,92 ÷ 100)^2 + 2.000 × (1 + 14 ÷ 100)^3 ÷ (1 + 11,92 ÷ 100)^3 + 2.000 × (1 + 14 ÷ 100)^4 ÷ (1 + 11,92 ÷ 100)^4 + 2.000 × (1 + 14 ÷ 100)^5 ÷ (1 + 11,92 ÷ 100)^5 + 2.000 × (1 + 14 ÷ 100)^5 × (1 + 5 ÷ 100) ÷ ((11,92 − 5) ÷ 100 × (1 + 11,92 ÷ 100)^5)',
      en: '2000 × (1 + 14 ÷ 100) ÷ (1 + 11.92 ÷ 100) + 2000 × (1 + 14 ÷ 100)^2 ÷ (1 + 11.92 ÷ 100)^2 + 2000 × (1 + 14 ÷ 100)^3 ÷ (1 + 11.92 ÷ 100)^3 + 2000 × (1 + 14 ÷ 100)^4 ÷ (1 + 11.92 ÷ 100)^4 + 2000 × (1 + 14 ÷ 100)^5 ÷ (1 + 11.92 ÷ 100)^5 + 2000 × (1 + 14 ÷ 100)^5 × (1 + 5 ÷ 100) ÷ ((11.92 − 5) ÷ 100 × (1 + 11.92 ÷ 100)^5)',
    },
    nguon: [
      {
        url: 'https://cafef.vn/6-thang-dau-nam-2026-loi-nhuan-truoc-thue-cua-fpt-tang-truong-181-188260716134057667.chn',
        nhan: {
          vi: 'Lợi nhuận sau thuế nửa đầu 2026 của FPT tăng 14,1%',
          en: "FPT's first-half 2026 net profit, up 14.1%",
        },
      },
      {
        url: 'https://cotuc.vn/co-phieu/fpt',
        nhan: {
          vi: 'Lịch sử cổ tức tiền mặt FPT, mỗi năm hai đợt',
          en: "FPT's cash dividend history, two payments a year",
        },
      },
    ],
  },
  capm: {
    tinh: {
      vi: 'chi phí vốn chủ sở hữu của FPT',
      en: "FPT's cost of equity",
    },
    gan: [
      {
        kyHieu: 'r_f',
        moTa: {
          vi: 'là lợi suất trái phiếu chính phủ Việt Nam kỳ hạn 10 năm: 4,57%/năm',
          en: "is the yield on Vietnam's 10-year government bond: 4.57%/year",
        },
      },
      {
        kyHieu: '\\beta',
        moTa: {
          vi: 'là hệ số beta của FPT so với VN-Index, hồi quy trên 55 phiên: 0,9043',
          en: "is FPT's beta against the VN-Index, regressed over 55 sessions: 0.9043",
        },
      },
      {
        kyHieu: 'ERP',
        moTa: {
          vi: 'là phần bù rủi ro vốn chủ của Việt Nam theo bảng của Damodaran: 8,13%/năm',
          en: "is Vietnam's equity risk premium in Damodaran's table: 8.13%/year",
        },
      },
    ],
    thaySo: {
      vi: '4,57 + 0,9043 × 8,13',
      en: '4.57 + 0.9043 × 8.13',
    },
    nguon: [
      {
        url: 'https://tradingeconomics.com/vietnam/government-bond-yield',
        nhan: {
          vi: 'Lợi suất trái phiếu chính phủ Việt Nam kỳ hạn 10 năm',
          en: 'Vietnam 10-year government bond yield',
        },
      },
      {
        url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html',
        nhan: {
          vi: 'Phần bù rủi ro vốn chủ của Việt Nam, dòng Vietnam',
          en: "Vietnam's equity risk premium, Vietnam row",
        },
      },
    ],
  },
  wacc: {
    tinh: {
      vi: 'chi phí vốn bình quân của FPT theo cơ cấu vốn ngày 30/06/2026',
      en: "FPT's weighted average cost of capital on its 2026-06-30 capital structure",
    },
    gan: [
      {
        kyHieu: 'E',
        moTa: {
          vi: 'là vốn chủ sở hữu FPT theo sổ sách ngày 30/06/2026: 40.995,7 tỷ ₫',
          en: "is FPT's book equity at 2026-06-30: 40995.7 billion ₫",
        },
      },
      {
        kyHieu: 'D',
        moTa: {
          vi: 'là nợ vay ngắn hạn cộng dài hạn của FPT cùng ngày: 17.444 tỷ ₫',
          en: "is FPT's short-term plus long-term borrowings on the same date: 17444 billion ₫",
        },
      },
      {
        kyHieu: 'r_e',
        moTa: {
          vi: 'là chi phí vốn chủ của FPT tính từ CAPM: 11,92%/năm',
          en: "is FPT's cost of equity from CAPM: 11.92%/year",
        },
      },
      {
        kyHieu: 'r_d',
        moTa: {
          vi: 'là lãi suất vay bình quân của FPT, trước thuế: 4,2%/năm',
          en: "is FPT's average borrowing rate, before tax: 4.2%/year",
        },
      },
      {
        kyHieu: 't',
        moTa: {
          vi: 'là thuế suất thuế thu nhập doanh nghiệp: 20%',
          en: 'is the corporate income tax rate: 20%',
        },
      },
    ],
    thaySo: {
      vi: '40.995,7 ÷ (40.995,7 + 17.444) × 11,92 + 17.444 ÷ (40.995,7 + 17.444) × 4,2 × (1 − 20 ÷ 100)',
      en: '40995.7 ÷ (40995.7 + 17444) × 11.92 + 17444 ÷ (40995.7 + 17444) × 4.2 × (1 − 20 ÷ 100)',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/bsheet/2026/2/0/0/bao-cao-tai-chinh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Vốn chủ sở hữu FPT, cột Quý 2- 2026',
          en: "FPT's equity, Q2 2026 column",
        },
      },
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/balance-sheet/?p=quarterly',
        nhan: {
          vi: 'Nợ vay FPT quý 2/2026: cộng hai dòng Short-Term Debt và Long-Term Debt',
          en: "FPT's borrowings in Q2 2026: add the Short-Term Debt and Long-Term Debt rows",
        },
      },
    ],
  },
  fcff: {
    tinh: {
      vi: 'dòng tiền tự do của doanh nghiệp FPT năm 2025',
      en: "FPT's free cash flow to the firm in 2025",
    },
    gan: [
      {
        kyHieu: 'EBIT',
        moTa: {
          vi: 'là lợi nhuận trước lãi vay và thuế của FPT năm 2025: 13.848,8 tỷ ₫',
          en: "is FPT's earnings before interest and tax in 2025: 13848.8 billion ₫",
        },
      },
      {
        kyHieu: 't',
        moTa: {
          vi: 'là thuế suất thuế thu nhập doanh nghiệp: 20%',
          en: 'is the corporate income tax rate: 20%',
        },
      },
      {
        kyHieu: 'Dep',
        moTa: {
          vi: 'là khấu hao FPT ghi nhận trong năm 2025: 2.795,9 tỷ ₫',
          en: 'is the depreciation FPT booked in 2025: 2795.9 billion ₫',
        },
      },
      {
        kyHieu: 'CapEx',
        moTa: {
          vi: 'là tiền FPT chi mua sắm, xây dựng tài sản cố định trong năm 2025: 5.097,9 tỷ ₫',
          en: 'is the cash FPT spent buying and building fixed assets in 2025: 5097.9 billion ₫',
        },
      },
      {
        kyHieu: '\\Delta NWC',
        moTa: {
          vi: 'là phần vốn lưu động ròng FPT tăng thêm trong năm 2025: 3.608,7 tỷ ₫',
          en: "is the increase in FPT's net working capital during 2025: 3608.7 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '13.848,8 × (1 − 20 ÷ 100) + 2.795,9 − 5.097,9 − 3.608,7',
      en: '13848.8 × (1 − 20 ÷ 100) + 2795.9 − 5097.9 − 3608.7',
    },
    nguon: [
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/cash-flow-statement/',
        nhan: {
          vi: 'Khấu hao và chi đầu tư của FPT, cột FY 2025',
          en: "FPT's depreciation and capital expenditures, FY 2025 column",
        },
      },
    ],
  },
  fcfe: {
    tinh: {
      vi: 'dòng tiền tự do dành cho cổ đông FPT năm 2025',
      en: "FPT's free cash flow to equity in 2025",
    },
    gan: [
      {
        kyHieu: 'FCFF',
        moTa: {
          vi: 'là dòng tiền tự do của doanh nghiệp FPT năm 2025, lấy từ công thức FCFF: 5.168,3 tỷ ₫',
          en: "is FPT's free cash flow to the firm in 2025, taken from the FCFF formula: 5168.3 billion ₫",
        },
      },
      {
        kyHieu: 'I',
        moTa: {
          vi: 'là chi phí lãi vay FPT ghi nhận trong năm 2025: 809,8 tỷ ₫',
          en: 'is the interest expense FPT booked in 2025: 809.8 billion ₫',
        },
      },
      {
        kyHieu: 't',
        moTa: {
          vi: 'là thuế suất thuế thu nhập doanh nghiệp: 20%',
          en: 'is the corporate income tax rate: 20%',
        },
      },
      {
        kyHieu: '\\Delta B',
        moTa: {
          vi: 'là số tiền FPT vay thêm sau khi đã trừ nợ gốc trả trong năm 2025: 6.256,7 tỷ ₫',
          en: 'is what FPT borrowed in 2025 after subtracting the principal it repaid: 6256.7 billion ₫',
        },
      },
    ],
    thaySo: {
      vi: '5.168,3 − 809,8 × (1 − 20 ÷ 100) + 6.256,7',
      en: '5168.3 − 809.8 × (1 − 20 ÷ 100) + 6256.7',
    },
    nguon: [
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/income-statement/',
        nhan: {
          vi: 'Chi phí lãi vay của FPT, dòng Interest Expense cột FY 2025',
          en: "FPT's interest expense, Interest Expense row, FY 2025 column",
        },
      },
    ],
  },
  'gia-tri-noi-tai-fcff': {
    tinh: {
      vi: 'giá trị nội tại một cổ phiếu FPT từ dòng tiền tự do của doanh nghiệp',
      en: 'the intrinsic value of one FPT share from free cash flow to the firm',
    },
    gan: [
      {
        kyHieu: 'FCFF',
        moTa: {
          vi: 'là dòng tiền tự do của doanh nghiệp FPT, lấy từ công thức FCFF: 5.168,3 tỷ ₫',
          en: "is FPT's free cash flow to the firm, taken from the FCFF formula: 5168.3 billion ₫",
        },
      },
      {
        kyHieu: 'g',
        moTa: {
          vi: 'là mức tăng dòng tiền dài hạn giả định cho FPT: 5%/năm',
          en: 'is the long-term cash-flow growth assumed for FPT: 5%/year',
        },
      },
      {
        kyHieu: 'WACC',
        moTa: {
          vi: 'là chi phí vốn bình quân của FPT, lấy từ công thức WACC: 9,37%/năm',
          en: "is FPT's weighted average cost of capital, taken from the WACC formula: 9.37%/year",
        },
      },
      {
        kyHieu: 'D_{\\text{ròng}}',
        moTa: {
          vi: 'là nợ vay của FPT trừ tiền và đầu tư tài chính ngắn hạn ngày 30/06/2026, âm vì tiền nhiều hơn nợ: −11.527,6 tỷ ₫',
          en: "is FPT's borrowings minus cash and short-term investments at 2026-06-30, negative because cash exceeds debt: −11527.6 billion ₫",
        },
      },
      {
        kyHieu: '\\text{Số CP}',
        moTa: {
          vi: 'là số cổ phiếu FPT đang lưu hành: 1.714,33 triệu CP',
          en: 'is the number of FPT shares outstanding: 1714.33 million shares',
        },
      },
    ],
    thaySo: {
      vi: '(5.168,3 × (1 + 5 ÷ 100) ÷ ((9,37 − 5) ÷ 100) − (−11.527,6)) ÷ 1.714,33 × 1.000',
      en: '(5168.3 × (1 + 5 ÷ 100) ÷ ((9.37 − 5) ÷ 100) − (−11527.6)) ÷ 1714.33 × 1000',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/bsheet/2026/2/0/0/bao-cao-tai-chinh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Tiền và đầu tư tài chính ngắn hạn của FPT, cột Quý 2- 2026',
          en: "FPT's cash and short-term investments, Q2 2026 column",
        },
      },
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/balance-sheet/?p=quarterly',
        nhan: {
          vi: 'Nợ vay ròng của FPT quý 2/2026: lấy Short-Term Debt cộng Long-Term Debt, rồi trừ Cash & Short-Term Investments',
          en: "FPT's net debt in Q2 2026: Short-Term Debt plus Long-Term Debt, minus Cash & Short-Term Investments",
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/hose/fpt/chi-tiet-tinh-eps.chn',
        nhan: {
          vi: 'Số cổ phiếu FPT lưu hành ngày 30/06/2026',
          en: 'FPT shares outstanding at 2026-06-30',
        },
      },
    ],
  },
  'gia-tri-hien-tai': {
    tinh: {
      vi: 'số tiền cần có hôm nay để nhận 1 tỷ ₫ sau 10 năm',
      en: 'the amount needed today to receive 1 billion ₫ in 10 years',
    },
    gan: [
      {
        kyHieu: 'FV',
        moTa: {
          vi: 'là số tiền muốn có sau mười năm: 1.000.000.000 ₫',
          en: 'is the sum wanted in ten years: 1000000000 ₫',
        },
      },
      {
        kyHieu: 'r',
        moTa: {
          vi: 'là lãi suất tiết kiệm trực tuyến kỳ hạn 12 tháng của Agribank, BIDV, Vietcombank và VietinBank, tháng 9/2026: 6,8%/năm',
          en: 'is the 12-month online deposit rate at Agribank, BIDV, Vietcombank and VietinBank, September 2026: 6.8%/year',
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là số năm từ hôm nay tới lúc cần tiền: 10 năm',
          en: 'is the number of years from today until the money is needed: 10 years',
        },
      },
    ],
    thaySo: {
      vi: '1.000.000.000 ÷ (1 + 6,8 ÷ 100)^10',
      en: '1000000000 ÷ (1 + 6.8 ÷ 100)^10',
    },
    nguon: [
      {
        url: 'https://vietnamnet.vn/lai-suat-ngan-hang-hom-nay-9-9-2026-lai-suat-ngan-hang-big4-len-den-8-nam-2553329.html',
        nhan: {
          vi: 'Lãi suất tiết kiệm nhóm Big4, VietNamNet 09/09/2026',
          en: 'Big 4 deposit rates, VietNamNet, 2026-09-09',
        },
      },
    ],
  },
  'gia-tri-tuong-lai': {
    tinh: {
      vi: 'số tiền có được sau 10 năm khi gửi 100 triệu ₫ kỳ hạn 12 tháng',
      en: 'the amount held after 10 years from depositing 100 million ₫ on a 12-month term',
    },
    gan: [
      {
        kyHieu: 'PV',
        moTa: {
          vi: 'là số tiền gửi ban đầu: 100.000.000 ₫',
          en: 'is the initial deposit: 100000000 ₫',
        },
      },
      {
        kyHieu: 'r',
        moTa: {
          vi: 'là lãi suất tiết kiệm trực tuyến kỳ hạn 12 tháng của nhóm Big4, tháng 9/2026: 6,8%/năm',
          en: 'is the 12-month online deposit rate across the Big 4 banks, September 2026: 6.8%/year',
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là số năm giữ khoản gửi, lãi nhập gốc sau mỗi kỳ: 10 năm',
          en: 'is the number of years the deposit is kept, interest added to principal each term: 10 years',
        },
      },
    ],
    thaySo: {
      vi: '100.000.000 × (1 + 6,8 ÷ 100)^10',
      en: '100000000 × (1 + 6.8 ÷ 100)^10',
    },
    nguon: [
      {
        url: 'https://vietnamnet.vn/lai-suat-ngan-hang-hom-nay-9-9-2026-lai-suat-ngan-hang-big4-len-den-8-nam-2553329.html',
        nhan: {
          vi: 'Lãi suất tiết kiệm nhóm Big4, VietNamNet 09/09/2026',
          en: 'Big 4 deposit rates, VietNamNet, 2026-09-09',
        },
      },
    ],
  },
  'bien-an-toan': {
    tinh: {
      vi: 'biên an toàn của FPT phiên 11/09/2026',
      en: "FPT's margin of safety on the 2026-09-11 session",
    },
    gan: [
      {
        kyHieu: 'V',
        moTa: {
          vi: 'là giá trị nội tại một cổ phiếu FPT ước tính bằng mô hình DCF: 79.161 ₫',
          en: 'is the intrinsic value of one FPT share estimated with the DCF model: 79161 ₫',
        },
      },
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫',
          en: "is FPT's close on the 2026-09-11 session: 72700 ₫",
        },
      },
    ],
    thaySo: {
      vi: '(79.161 − 72.700) ÷ 79.161 × 100',
      en: '(79161 − 72700) ÷ 79161 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
    ],
  },
  'phi-giao-dich-mua': {
    tinh: {
      vi: 'phí môi giới của lệnh mua 1.000 cổ phiếu FPT phiên 24/07/2026',
      en: 'the brokerage fee on buying 1000 FPT shares in the 2026-07-24 session',
    },
    gan: [
      {
        kyHieu: 'Q',
        moTa: {
          vi: 'là số cổ phiếu FPT mua: 1.000 CP',
          en: 'is the number of FPT shares bought: 1000 shares',
        },
      },
      {
        kyHieu: 'P_{mua}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 24/07/2026, lấy làm giá mua: 62.900 ₫',
          en: "is FPT's close on the 2026-07-24 session, taken as the buy price: 62900 ₫",
        },
      },
      {
        kyHieu: 'r_{mua}',
        moTa: {
          vi: 'là phí đặt lệnh qua kênh trực tuyến theo biểu phí SSI, tính trên giá trị lệnh: 0,15%',
          en: "is the online order fee in SSI's schedule, charged on the order value: 0.15%",
        },
      },
    ],
    thaySo: {
      vi: '1.000 × 62.900 × 0,15 ÷ 100',
      en: '1000 × 62900 × 0.15 ÷ 100',
    },
    nguon: [
      {
        url: 'https://www.ssi.com.vn/khach-hang-ca-nhan/bieu-phi/bieu-gia-dich-vu-giao-dich-chu-dong',
        nhan: {
          vi: 'Biểu phí giao dịch trực tuyến SSI, mức 0,15%',
          en: 'SSI online trading fee schedule, 0.15% rate',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=07/24/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 24/07/2026',
          en: 'FPT price, 2026-07-24 session',
        },
      },
    ],
  },
  'phi-giao-dich-ban': {
    tinh: {
      vi: 'phí môi giới của lệnh bán 1.000 cổ phiếu FPT phiên 11/09/2026',
      en: 'the brokerage fee on selling 1000 FPT shares in the 2026-09-11 session',
    },
    gan: [
      {
        kyHieu: 'Q',
        moTa: {
          vi: 'là số cổ phiếu FPT bán: 1.000 CP',
          en: 'is the number of FPT shares sold: 1000 shares',
        },
      },
      {
        kyHieu: 'P_{ban}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 11/09/2026, lấy làm giá bán: 72.700 ₫',
          en: "is FPT's close on the 2026-09-11 session, taken as the sell price: 72700 ₫",
        },
      },
      {
        kyHieu: 'r_{ban}',
        moTa: {
          vi: 'là phí đặt lệnh qua kênh trực tuyến theo biểu phí SSI, cùng mức với lệnh mua, tính trên giá trị lệnh: 0,15%',
          en: "is the online order fee in SSI's schedule, the same rate as a buy order, charged on the order value: 0.15%",
        },
      },
    ],
    thaySo: {
      vi: '1.000 × 72.700 × 0,15 ÷ 100',
      en: '1000 × 72700 × 0.15 ÷ 100',
    },
    nguon: [
      {
        url: 'https://www.ssi.com.vn/khach-hang-ca-nhan/bieu-phi/bieu-gia-dich-vu-giao-dich-chu-dong',
        nhan: {
          vi: 'Biểu phí giao dịch trực tuyến SSI, mức 0,15%',
          en: 'SSI online trading fee schedule, 0.15% rate',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
    ],
  },
  'thue-chuyen-nhuong': {
    tinh: {
      vi: 'thuế chuyển nhượng trên lệnh bán 1.000 cổ phiếu FPT phiên 11/09/2026',
      en: 'the transfer tax on selling 1000 FPT shares in the 2026-09-11 session',
    },
    gan: [
      {
        kyHieu: 'Q',
        moTa: {
          vi: 'là số cổ phiếu FPT bán: 1.000 CP',
          en: 'is the number of FPT shares sold: 1000 shares',
        },
      },
      {
        kyHieu: 'P_{ban}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 11/09/2026, lấy làm giá bán: 72.700 ₫',
          en: "is FPT's close on the 2026-09-11 session, taken as the sell price: 72700 ₫",
        },
      },
      {
        kyHieu: 'r_{thue}',
        moTa: {
          vi: 'là thuế suất chuyển nhượng chứng khoán theo Điều 13 khoản 2 Luật Thuế thu nhập cá nhân 109/2025/QH15, tính trên giá trị bán: 0,1%',
          en: 'is the securities transfer tax rate under Article 13 clause 2 of Personal Income Tax Law 109/2025/QH15, charged on the sale value: 0.1%',
        },
      },
    ],
    thaySo: {
      vi: '1.000 × 72.700 × 0,1 ÷ 100',
      en: '1000 × 72700 × 0.1 ÷ 100',
    },
    nguon: [
      {
        url: 'https://congbao.chinhphu.vn/van-ban/luat-so-109-2025-qh15-468671.htm',
        nhan: {
          vi: 'Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 13 khoản 2, thuế suất chuyển nhượng 0,1%',
          en: 'Personal Income Tax Law 109/2025/QH15, Article 13 clause 2, 0.1% transfer tax rate',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
    ],
  },
  'thue-co-tuc': {
    tinh: {
      vi: 'thuế trên cổ tức tiền mặt FPT đợt chốt quyền 02/12/2025 của 1.000 cổ phiếu',
      en: "the tax on FPT's cash dividend with the 2025-12-02 record date, on 1000 shares",
    },
    gan: [
      {
        kyHieu: 'Q',
        moTa: {
          vi: 'là số cổ phiếu FPT nắm giữ vào ngày chốt quyền: 1.000 CP',
          en: 'is the number of FPT shares held on the record date: 1000 shares',
        },
      },
      {
        kyHieu: 'D',
        moTa: {
          vi: 'là cổ tức tiền mặt FPT trả cho mỗi cổ phiếu, đợt chốt quyền 02/12/2025: 1.000 ₫',
          en: "is FPT's cash dividend per share, 2025-12-02 record date: 1000 ₫",
        },
      },
      {
        kyHieu: 'r_{ct}',
        moTa: {
          vi: 'là thuế suất thu nhập từ đầu tư vốn theo Điều 12 Luật Thuế thu nhập cá nhân 109/2025/QH15: 5%',
          en: 'is the tax rate on investment income under Article 12 of Personal Income Tax Law 109/2025/QH15: 5%',
        },
      },
    ],
    thaySo: {
      vi: '1.000 × 1.000 × 5 ÷ 100',
      en: '1000 × 1000 × 5 ÷ 100',
    },
    nguon: [
      {
        url: 'https://cotuc.vn/co-phieu/fpt',
        nhan: {
          vi: 'Lịch sử cổ tức FPT, đợt chốt quyền 02/12/2025',
          en: 'FPT dividend history, 2025-12-02 record date',
        },
      },
      {
        url: 'https://congbao.chinhphu.vn/van-ban/luat-so-109-2025-qh15-468671.htm',
        nhan: {
          vi: 'Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 12, thuế suất 5%',
          en: 'Personal Income Tax Law 109/2025/QH15, Article 12, 5% rate',
        },
      },
    ],
  },
  'phi-luu-ky': {
    tinh: {
      vi: 'phí lưu ký của 1.000 cổ phiếu FPT giữ từ 24/07 đến 11/09/2026',
      en: 'the custody fee on 1000 FPT shares held from 2026-07-24 to 2026-09-11',
    },
    gan: [
      {
        kyHieu: 'Q',
        moTa: {
          vi: 'là số cổ phiếu FPT nằm trong tài khoản: 1.000 CP',
          en: 'is the number of FPT shares sitting in the account: 1000 shares',
        },
      },
      {
        kyHieu: 'M',
        moTa: {
          vi: 'là thời gian nắm giữ từ 24/07 đến 11/09/2026: 2 tháng',
          en: 'is the holding period from 2026-07-24 to 2026-09-11: 2 months',
        },
      },
      {
        kyHieu: 'c',
        moTa: {
          vi: 'là phí lưu ký hằng tháng theo Quyết định 1541/QĐ-BTC: 0,27 ₫ mỗi cổ phiếu',
          en: 'is the monthly custody fee under Decision 1541/QĐ-BTC: 0.27 ₫ per share',
        },
      },
    ],
    thaySo: {
      vi: '1.000 × 2 × 0,27',
      en: '1000 × 2 × 0.27',
    },
    nguon: [
      {
        url: 'https://cafef.vn/bo-tai-chinh-ban-hanh-muc-gia-dich-vu-moi-trong-linh-vuc-chung-khoan-188250508111929712.chn',
        nhan: {
          vi: 'Quyết định 1541/QĐ-BTC, phí lưu ký 0,27 ₫ mỗi cổ phiếu mỗi tháng',
          en: 'Decision 1541/QĐ-BTC, custody fee of 0.27 ₫ per share per month',
        },
      },
    ],
  },
  'gia-hoa-von': {
    tinh: {
      vi: 'giá hoà vốn thực của 1.000 cổ phiếu FPT mua phiên 24/07/2026, giữ 2 tháng',
      en: 'the true break-even price of 1000 FPT shares bought in the 2026-07-24 session and held for 2 months',
    },
    gan: [
      {
        kyHieu: 'Q',
        moTa: {
          vi: 'là số cổ phiếu FPT mua rồi bán lại: 1.000 CP',
          en: 'is the number of FPT shares bought and later sold: 1000 shares',
        },
      },
      {
        kyHieu: 'P_{mua}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 24/07/2026, lấy làm giá mua: 62.900 ₫',
          en: "is FPT's close on the 2026-07-24 session, taken as the buy price: 62900 ₫",
        },
      },
      {
        kyHieu: 'F_{mua}',
        moTa: {
          vi: 'là phí môi giới 0,15% theo biểu phí trực tuyến SSI, tính trên tiền mua 1.000 cổ phiếu: 94.350 ₫',
          en: "is the 0.15% brokerage fee in SSI's online schedule, charged on the purchase of 1000 shares: 94350 ₫",
        },
      },
      {
        kyHieu: 'F_{lk}',
        moTa: {
          vi: 'là phí lưu ký của 1.000 cổ phiếu trong 2 tháng nắm giữ: 540 ₫',
          en: 'is the custody fee on 1000 shares over the 2 months held: 540 ₫',
        },
      },
      {
        kyHieu: 'r_{ban}',
        moTa: {
          vi: 'là phí môi giới lệnh bán theo biểu phí trực tuyến SSI, tính trên giá trị bán: 0,15%',
          en: "is the sell order brokerage fee in SSI's online schedule, charged on the sale value: 0.15%",
        },
      },
      {
        kyHieu: 'r_{thue}',
        moTa: {
          vi: 'là thuế suất chuyển nhượng chứng khoán, tính trên giá trị bán: 0,1%',
          en: 'is the securities transfer tax rate, charged on the sale value: 0.1%',
        },
      },
    ],
    thaySo: {
      vi: '(1.000 × 62.900 + 94.350 + 540) ÷ (1.000 × (1 − 0,15 ÷ 100 − 0,1 ÷ 100))',
      en: '(1000 × 62900 + 94350 + 540) ÷ (1000 × (1 − 0.15 ÷ 100 − 0.1 ÷ 100))',
    },
    nguon: [
      {
        url: 'https://www.ssi.com.vn/khach-hang-ca-nhan/bieu-phi/bieu-gia-dich-vu-giao-dich-chu-dong',
        nhan: {
          vi: 'Biểu phí giao dịch trực tuyến SSI, mức 0,15%',
          en: 'SSI online trading fee schedule, 0.15% rate',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=07/24/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 24/07/2026',
          en: 'FPT price, 2026-07-24 session',
        },
      },
      {
        url: 'https://congbao.chinhphu.vn/van-ban/luat-so-109-2025-qh15-468671.htm',
        nhan: {
          vi: 'Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 13 khoản 2, thuế suất chuyển nhượng 0,1%',
          en: 'Personal Income Tax Law 109/2025/QH15, Article 13 clause 2, 0.1% transfer tax rate',
        },
      },
      {
        url: 'https://cafef.vn/bo-tai-chinh-ban-hanh-muc-gia-dich-vu-moi-trong-linh-vuc-chung-khoan-188250508111929712.chn',
        nhan: {
          vi: 'Quyết định 1541/QĐ-BTC, phí lưu ký 0,27 ₫ mỗi cổ phiếu mỗi tháng',
          en: 'Decision 1541/QĐ-BTC, custody fee of 0.27 ₫ per share per month',
        },
      },
    ],
  },
  'loi-nhuan-rong': {
    tinh: {
      vi: 'lợi nhuận ròng của 1.000 cổ phiếu FPT mua phiên 24/07/2026, bán phiên 11/09/2026',
      en: 'the net profit on 1000 FPT shares bought in the 2026-07-24 session and sold in the 2026-09-11 session',
    },
    gan: [
      {
        kyHieu: 'Q',
        moTa: {
          vi: 'là số cổ phiếu FPT mua rồi bán lại: 1.000 CP',
          en: 'is the number of FPT shares bought and later sold: 1000 shares',
        },
      },
      {
        kyHieu: 'P_{ban}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 11/09/2026, lấy làm giá bán: 72.700 ₫',
          en: "is FPT's close on the 2026-09-11 session, taken as the sell price: 72700 ₫",
        },
      },
      {
        kyHieu: 'P_{mua}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 24/07/2026, lấy làm giá mua: 62.900 ₫',
          en: "is FPT's close on the 2026-07-24 session, taken as the buy price: 62900 ₫",
        },
      },
      {
        kyHieu: 'F_{mua}',
        moTa: {
          vi: 'là phí môi giới của lệnh mua theo biểu phí trực tuyến SSI: 94.350 ₫',
          en: "is the brokerage fee on the buy order in SSI's online schedule: 94350 ₫",
        },
      },
      {
        kyHieu: 'F_{ban}',
        moTa: {
          vi: 'là phí môi giới của lệnh bán theo biểu phí trực tuyến SSI: 109.050 ₫',
          en: "is the brokerage fee on the sell order in SSI's online schedule: 109050 ₫",
        },
      },
      {
        kyHieu: 'T',
        moTa: {
          vi: 'là thuế chuyển nhượng khấu trừ khi bán, tính trên tiền bán cả lô 1.000 cổ phiếu: 72.700 ₫',
          en: 'is the transfer tax withheld on the sale, charged on the proceeds of the whole 1000-share lot: 72700 ₫',
        },
      },
      {
        kyHieu: 'F_{lk}',
        moTa: {
          vi: 'là phí lưu ký của 1.000 cổ phiếu trong 2 tháng nắm giữ: 540 ₫',
          en: 'is the custody fee on 1000 shares over the 2 months held: 540 ₫',
        },
      },
    ],
    thaySo: {
      vi: '1.000 × (72.700 − 62.900) − (94.350 + 109.050 + 72.700 + 540)',
      en: '1000 × (72700 − 62900) − (94350 + 109050 + 72700 + 540)',
    },
    nguon: [
      {
        url: 'https://www.ssi.com.vn/khach-hang-ca-nhan/bieu-phi/bieu-gia-dich-vu-giao-dich-chu-dong',
        nhan: {
          vi: 'Biểu phí giao dịch trực tuyến SSI, mức 0,15%',
          en: 'SSI online trading fee schedule, 0.15% rate',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=07/24/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 24/07/2026',
          en: 'FPT price, 2026-07-24 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
      {
        url: 'https://congbao.chinhphu.vn/van-ban/luat-so-109-2025-qh15-468671.htm',
        nhan: {
          vi: 'Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 13 khoản 2, thuế suất chuyển nhượng 0,1%',
          en: 'Personal Income Tax Law 109/2025/QH15, Article 13 clause 2, 0.1% transfer tax rate',
        },
      },
      {
        url: 'https://cafef.vn/bo-tai-chinh-ban-hanh-muc-gia-dich-vu-moi-trong-linh-vuc-chung-khoan-188250508111929712.chn',
        nhan: {
          vi: 'Quyết định 1541/QĐ-BTC, phí lưu ký 0,27 ₫ mỗi cổ phiếu mỗi tháng',
          en: 'Decision 1541/QĐ-BTC, custody fee of 0.27 ₫ per share per month',
        },
      },
    ],
  },
  'roi-rong': {
    tinh: {
      vi: 'ROI ròng sau phí và thuế của vòng mua bán 1.000 CP FPT từ 24/07 đến 11/09/2026',
      en: 'net ROI after fees and taxes on the 1000-share FPT round trip from 2026-07-24 to 2026-09-11',
    },
    gan: [
      {
        kyHieu: 'L_{rong}',
        moTa: {
          vi: 'là lãi sau khi bán ở 72.700 ₫ rồi trừ phí mua, phí bán, thuế bán và phí lưu ký: 9.523.360 ₫',
          en: 'is the profit from selling at 72700 ₫ less the buy fee, sell fee, sales tax and custody fee: 9523360 ₫',
        },
      },
      {
        kyHieu: 'Q',
        moTa: {
          vi: 'là số cổ phiếu FPT mua ngày 24/07/2026 rồi bán hết ngày 11/09/2026: 1.000 CP',
          en: 'is the number of FPT shares bought on 2026-07-24 and all sold on 2026-09-11: 1000 shares',
        },
      },
      {
        kyHieu: 'P_{mua}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 24/07/2026: 62.900 ₫',
          en: "is FPT's close on the 2026-07-24 session: 62900 ₫",
        },
      },
      {
        kyHieu: 'F_{mua}',
        moTa: {
          vi: 'là phí mua 1.000 CP theo biểu phí giao dịch trực tuyến SSI: 94.350 ₫',
          en: "is the buy fee on 1000 shares under SSI's online trading fee schedule: 94350 ₫",
        },
      },
      {
        kyHieu: 'F_{lk}',
        moTa: {
          vi: 'là phí lưu ký 1.000 CP trong 2 tháng nắm giữ: 540 ₫',
          en: 'is the custody fee on 1000 shares over the 2 months held: 540 ₫',
        },
      },
    ],
    thaySo: {
      vi: '9.523.360 ÷ (1.000 × 62.900 + 94.350 + 540) × 100',
      en: '9523360 ÷ (1000 × 62900 + 94350 + 540) × 100',
    },
    nguon: [
      {
        url: 'https://www.ssi.com.vn/khach-hang-ca-nhan/bieu-phi/bieu-gia-dich-vu-giao-dich-chu-dong',
        nhan: {
          vi: 'Biểu phí giao dịch trực tuyến SSI, mức 0,15%',
          en: 'SSI online trading fee schedule, 0.15% rate',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=07/24/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 24/07/2026',
          en: 'FPT price, 2026-07-24 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
      {
        url: 'https://www.ssi.com.vn/khach-hang-ca-nhan/bieu-phi/bieu-gia-dich-vu-luu-ky',
        nhan: {
          vi: 'Phí lưu ký SSI, 0,27 ₫ mỗi cổ phiếu mỗi tháng',
          en: 'SSI custody fee, 0.27 ₫ per share per month',
        },
      },
      {
        url: 'https://congbaocdn.chinhphu.vn/180507251028987904/2026/1/24/109signed-17692403594311667615452.pdf',
        nhan: {
          vi: 'Thuế bán chứng khoán 0,1%, Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 13',
          en: '0.1% tax on share sales, Personal Income Tax Law 109/2025/QH15, Article 13',
        },
      },
    ],
  },
  roi: {
    tinh: {
      vi: 'ROI của khoản FPT mua ngày 24/07/2026, tính tới 11/09/2026',
      en: 'ROI on the FPT holding bought on 2026-07-24, measured on 2026-09-11',
    },
    gan: [
      {
        kyHieu: 'V_{cuoi}',
        moTa: {
          vi: 'là giá trị khoản FPT theo giá đóng cửa phiên 11/09/2026: 72.700.000 ₫',
          en: "is the FPT holding's value at the 2026-09-11 close: 72700000 ₫",
        },
      },
      {
        kyHieu: 'V_{dau}',
        moTa: {
          vi: 'là tiền bỏ ra mua FPT theo giá đóng cửa phiên 24/07/2026: 62.900.000 ₫',
          en: 'is the money put into FPT at the 2026-07-24 close: 62900000 ₫',
        },
      },
    ],
    thaySo: {
      vi: '(72.700.000 − 62.900.000) ÷ 62.900.000 × 100',
      en: '(72700000 − 62900000) ÷ 62900000 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=07/24/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 24/07/2026',
          en: 'FPT price, 2026-07-24 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
    ],
  },
  hpr: {
    tinh: {
      vi: 'HPR của một cổ phiếu FPT giữ từ 24/07 đến 11/09/2026',
      en: 'HPR on one FPT share held from 2026-07-24 to 2026-09-11',
    },
    gan: [
      {
        kyHieu: 'P_{cuoi}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫',
          en: "is FPT's close on the 2026-09-11 session: 72700 ₫",
        },
      },
      {
        kyHieu: 'P_{dau}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 24/07/2026: 62.900 ₫',
          en: "is FPT's close on the 2026-07-24 session: 62900 ₫",
        },
      },
      {
        kyHieu: 'D',
        moTa: {
          vi: 'là cổ tức nhận được trong kỳ: 0 ₫, vì từ 24/07 đến 11/09/2026 FPT không có đợt chốt quyền nào',
          en: 'is the dividend collected in the period: 0 ₫, since FPT had no record date between 2026-07-24 and 2026-09-11',
        },
      },
    ],
    thaySo: {
      vi: '(72.700 − 62.900 + 0) ÷ 62.900 × 100',
      en: '(72700 − 62900 + 0) ÷ 62900 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=07/24/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 24/07/2026',
          en: 'FPT price, 2026-07-24 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
      {
        url: 'https://cotuc.vn/co-phieu/fpt',
        nhan: {
          vi: 'Lịch sử cổ tức FPT, đợt chốt quyền 02/12/2025',
          en: 'FPT dividend history, 2025-12-02 record date',
        },
      },
    ],
  },
  cagr: {
    tinh: {
      vi: 'CAGR của NAV mỗi chứng chỉ quỹ VESAF từ ngày thành lập 18/04/2017 tới 31/05/2026',
      en: "CAGR of the VESAF fund's NAV per unit from its launch on 2017-04-18 to 2026-05-31",
    },
    gan: [
      {
        kyHieu: 'V_{cuoi}',
        moTa: {
          vi: 'là NAV mỗi chứng chỉ quỹ VESAF ngày 31/05/2026: 33.913 ₫',
          en: "is the VESAF fund's NAV per unit on 2026-05-31: 33913 ₫",
        },
      },
      {
        kyHieu: 'V_{dau}',
        moTa: {
          vi: 'là NAV mỗi chứng chỉ quỹ lúc VESAF thành lập ngày 18/04/2017: 10.000 ₫',
          en: 'is the NAV per unit when VESAF launched on 2017-04-18: 10000 ₫',
        },
      },
      {
        kyHieu: 't',
        moTa: {
          vi: 'là số năm từ 18/04/2017 tới 31/05/2026: 9,12 năm',
          en: 'is the number of years from 2017-04-18 to 2026-05-31: 9.12 years',
        },
      },
    ],
    thaySo: {
      vi: '((33.913 ÷ 10.000)^(1 ÷ 9,12) − 1) × 100',
      en: '((33913 ÷ 10000)^(1 ÷ 9.12) − 1) × 100',
    },
    nguon: [
      {
        url: 'https://vinacapital.com/wp-content/uploads/2026/06/20260615-VINACAPITAL-VESAF_Monthly-Factsheet_May-2026-VN.pdf',
        nhan: {
          vi: 'Báo cáo tháng 5/2026 quỹ VESAF, NAV mỗi chứng chỉ quỹ 33.913,0 ₫',
          en: 'VESAF fund May 2026 report, NAV per unit 33913.0 ₫',
        },
      },
    ],
  },
  'ty-suat-co-tuc': {
    tinh: {
      vi: 'tỷ suất cổ tức của FPT tại giá đóng cửa phiên 11/09/2026',
      en: "FPT's dividend yield at the 2026-09-11 close",
    },
    gan: [
      {
        kyHieu: 'D',
        moTa: {
          vi: 'là cổ tức tiền mặt FPT trả mỗi năm, mức 20% mệnh giá giữ từ 2018: 2.000 ₫ mỗi cổ phiếu',
          en: 'is the cash dividend FPT pays each year, 20% of par since 2018: 2000 ₫ per share',
        },
      },
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫',
          en: "is FPT's close on the 2026-09-11 session: 72700 ₫",
        },
      },
    ],
    thaySo: {
      vi: '2.000 ÷ 72.700 × 100',
      en: '2000 ÷ 72700 × 100',
    },
    nguon: [
      {
        url: 'https://cotuc.vn/co-phieu/fpt',
        nhan: {
          vi: 'Lịch sử cổ tức tiền mặt FPT, hai đợt 1.000 ₫ mỗi năm',
          en: 'FPT cash dividend history, two 1000 ₫ payouts a year',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
    ],
  },
  xirr: {
    tinh: {
      vi: 'XIRR của ba lần mua FPT trong tháng 7 và 8/2026, bán hết ngày 11/09/2026',
      en: 'XIRR of three FPT purchases in July and August 2026, all sold on 2026-09-11',
    },
    gan: [
      {
        kyHieu: 'CF_i',
        moTa: {
          vi: 'là tiền của từng lần giao dịch FPT, chi ra mang dấu âm: mua ngày 15/07/2026 hết 6.680.000 ₫, ngày 24/07 hết 6.290.000 ₫, ngày 21/08 hết 7.200.000 ₫, rồi bán cả 300 CP ngày 11/09/2026 thu về 21.810.000 ₫',
          en: 'is the money in each FPT trade, outflows negative: 6680000 ₫ spent on 2026-07-15, 6290000 ₫ on 2026-07-24, 7200000 ₫ on 2026-08-21, then 21810000 ₫ received for all 300 shares on 2026-09-11',
        },
      },
      {
        kyHieu: 'd_i',
        moTa: {
          vi: 'là số ngày tính từ lần mua đầu tiên ngày 15/07/2026, lần lượt cho bốn dòng tiền: 0, 9, 37 và 58 ngày',
          en: 'is the day count from the first purchase on 2026-07-15, for the four cash flows in turn: 0, 9, 37 and 58 days',
        },
      },
      {
        kyHieu: 'XIRR',
        moTa: {
          vi: 'là suất sinh lợi năm làm tổng bằng 0, viết dạng tỷ lệ: 0,9655',
          en: 'is the annual rate that brings the sum to 0, written as a ratio: 0.9655',
        },
      },
    ],
    thaySo: {
      vi: '−6.680.000 ÷ (1 + 0,9655)^(0 ÷ 365) − 6.290.000 ÷ (1 + 0,9655)^(9 ÷ 365) − 7.200.000 ÷ (1 + 0,9655)^(37 ÷ 365) + 21.810.000 ÷ (1 + 0,9655)^(58 ÷ 365)',
      en: '−6680000 ÷ (1 + 0.9655)^(0 ÷ 365) − 6290000 ÷ (1 + 0.9655)^(9 ÷ 365) − 7200000 ÷ (1 + 0.9655)^(37 ÷ 365) + 21810000 ÷ (1 + 0.9655)^(58 ÷ 365)',
    },
    thaySoRa: {
      giaTri: 0,
      donVi: '₫',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/15/2026&EndDate=07/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 15/07/2026',
          en: 'FPT price, 2026-07-15 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=07/24/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 24/07/2026',
          en: 'FPT price, 2026-07-24 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/21/2026&EndDate=08/21/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 21/08/2026',
          en: 'FPT price, 2026-08-21 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
    ],
  },
  'loi-suat-nam-hoa': {
    tinh: {
      vi: 'lợi suất năm hoá từ mức tăng của VN-Index riêng tháng 8/2026',
      en: "the annualized return implied by the VN-Index's gain in August 2026 alone",
    },
    gan: [
      {
        kyHieu: 'r_{ky}',
        moTa: {
          vi: 'là mức tăng của VN-Index trong tháng 8/2026, từ 1.735,78 điểm cuối tháng 7 lên 1.832,12 điểm: 5,55%',
          en: 'is the VN-Index gain over August 2026, from 1,735.78 points at the end of July to 1,832.12 points: 5.55%',
        },
      },
      {
        kyHieu: 'm',
        moTa: {
          vi: 'là số tháng trong một năm, vì mỗi kỳ ở đây là một tháng: 12',
          en: 'is the number of months in a year, since each period here is one month: 12',
        },
      },
    ],
    thaySo: {
      vi: '((1 + 5,55 ÷ 100)^12 − 1) × 100',
      en: '((1 + 5.55 ÷ 100)^12 − 1) × 100',
    },
    nguon: [
      {
        url: 'https://tapchikinhtetaichinh.vn/von-hoa-san-hose-thang-8-2026-vuot-8-84-trieu-ty-dong-vn-index-tang-5-55-166368.html',
        nhan: {
          vi: 'VN-Index chốt tháng 8/2026 tại 1.832,12 điểm, tăng 5,55%',
          en: 'VN-Index closes August 2026 at 1832.12 points, up 5.55%',
        },
      },
      {
        url: 'https://api-finfo.vndirect.com.vn/v4/vnmarket_prices?q=code:VNINDEX~date:2026-07-31',
        nhan: {
          vi: 'VN-Index phiên 31/07/2026: 1.735,78 điểm',
          en: 'VN-Index on the 2026-07-31 session: 1735.78 points',
        },
      },
    ],
  },
  'loi-suat-thuc': {
    tinh: {
      vi: 'lợi suất thực của tiền gửi 12 tháng nhóm Big4 sau lạm phát 8 tháng đầu 2026',
      en: 'the real return on a twelve-month Big4 deposit after inflation over the first eight months of 2026',
    },
    gan: [
      {
        kyHieu: 'r_{danh\\,nghia}',
        moTa: {
          vi: 'là lãi suất tiết kiệm trực tuyến kỳ hạn 12 tháng nhóm Big4, tháng 9/2026: 6,8%/năm',
          en: "is the Big4 banks' online twelve-month savings rate in September 2026: 6.8%/year",
        },
      },
      {
        kyHieu: '\\pi',
        moTa: {
          vi: 'là mức tăng CPI bình quân 8 tháng đầu 2026 so với cùng kỳ năm trước: 4,45%',
          en: 'is the rise in average CPI over the first eight months of 2026 against the same period a year earlier: 4.45%',
        },
      },
    ],
    thaySo: {
      vi: '((1 + 6,8 ÷ 100) ÷ (1 + 4,45 ÷ 100) − 1) × 100',
      en: '((1 + 6.8 ÷ 100) ÷ (1 + 4.45 ÷ 100) − 1) × 100',
    },
    nguon: [
      {
        url: 'https://vietnamnet.vn/lai-suat-ngan-hang-hom-nay-9-9-2026-lai-suat-ngan-hang-big4-len-den-8-nam-2553329.html',
        nhan: {
          vi: 'Lãi suất tiết kiệm 12 tháng nhóm Big4 ngày 09/09/2026: 6,8%/năm',
          en: 'Big4 twelve-month savings rate on 2026-09-09: 6.8%/year',
        },
      },
      {
        url: 'https://thitruongtaichinhtiente.vn/8-thang-dau-nam-2026-cpi-tang-4-45-lam-phat-co-ban-tang-4-24-85287.html',
        nhan: {
          vi: 'CPI bình quân 8 tháng đầu 2026 tăng 4,45%',
          en: 'Average CPI for the first eight months of 2026 up 4.45%',
        },
      },
    ],
  },
  'lai-suat-hieu-dung': {
    tinh: {
      vi: 'EAR của tiền gửi kỳ hạn 6 tháng nhóm Big4 khi tái tục thêm một kỳ',
      en: 'EAR of a six-month Big4 deposit rolled over for one more term',
    },
    gan: [
      {
        kyHieu: 'r',
        moTa: {
          vi: 'là lãi suất tiết kiệm trực tuyến kỳ hạn 6 tháng nhóm Big4, tháng 9/2026: 6,6%/năm',
          en: "is the Big4 banks' online six-month savings rate in September 2026: 6.6%/year",
        },
      },
      {
        kyHieu: 'm',
        moTa: {
          vi: 'là số kỳ 6 tháng trong một năm, mỗi kỳ lãi được nhập vào gốc: 2 lần',
          en: 'is the number of six-month terms in a year, each adding its interest to the principal: 2 times',
        },
      },
    ],
    thaySo: {
      vi: '((1 + 6,6 ÷ 100 ÷ 2)^2 − 1) × 100',
      en: '((1 + 6.6 ÷ 100 ÷ 2)^2 − 1) × 100',
    },
    nguon: [
      {
        url: 'https://vietnamnet.vn/lai-suat-ngan-hang-hom-nay-9-9-2026-lai-suat-ngan-hang-big4-len-den-8-nam-2553329.html',
        nhan: {
          vi: 'Lãi suất tiết kiệm 6 tháng nhóm Big4 ngày 09/09/2026: 6,6%/năm',
          en: 'Big4 six-month savings rate on 2026-09-09: 6.6%/year',
        },
      },
    ],
  },
  'tong-loi-suat-tai-dau-tu': {
    tinh: {
      vi: 'tổng lợi suất sau 5 năm khi cổ tức được đem mua thêm cổ phiếu',
      en: 'the five-year total return when dividends are used to buy more shares',
    },
    gan: [
      {
        kyHieu: 'g',
        moTa: {
          vi: 'là mức tăng bình quân mỗi năm của VN-Index giai đoạn 9/2024 đến 8/2026: 19,29%',
          en: "is the VN-Index's average yearly gain over 9/2024 to 8/2026: 19.29%",
        },
      },
      {
        kyHieu: 'y',
        moTa: {
          vi: 'là tỷ suất cổ tức của FPT tại giá đóng cửa phiên 11/09/2026: 2,75% một năm',
          en: "is FPT's dividend yield at the 2026-09-11 close: 2.75% a year",
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là số năm giữ cổ phiếu: 5 năm',
          en: 'is the number of years the shares are held: 5 years',
        },
      },
    ],
    thaySo: {
      vi: '(((1 + 19,29 ÷ 100) × (1 + 2,75 ÷ 100))^5 − 1) × 100',
      en: '(((1 + 19.29 ÷ 100) × (1 + 2.75 ÷ 100))^5 − 1) × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=VNINDEX&StartDate=09/30/2024&EndDate=09/30/2024&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'VN-Index phiên 30/09/2024: 1.287,94 điểm',
          en: 'VN-Index on the 2024-09-30 session: 1287.94 points',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=VNINDEX&StartDate=08/28/2026&EndDate=08/28/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'VN-Index phiên 28/08/2026: 1.832,12 điểm',
          en: 'VN-Index on the 2026-08-28 session: 1832.12 points',
        },
      },
      {
        url: 'https://cotuc.vn/co-phieu/fpt',
        nhan: {
          vi: 'Cổ tức tiền mặt FPT, hai đợt 1.000 ₫ mỗi năm',
          en: 'FPT cash dividend, two 1000 ₫ payouts a year',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
    ],
  },
  'loi-suat-trung-binh-hinh-hoc': {
    tinh: {
      vi: 'lợi suất trung bình hình học mỗi kỳ của VN-Index qua ba kỳ từ đầu năm 2024 tới hết tháng 8/2026',
      en: "the VN-Index's geometric mean return per period over three periods from the start of 2024 to the end of August 2026",
    },
    gan: [
      {
        kyHieu: 'r_k',
        moTa: {
          vi: 'là lợi suất của VN-Index từng kỳ: năm 2024 tăng 12,1%, năm 2025 tăng 40,87%, tám tháng đầu 2026 tăng 2,67%',
          en: 'is the VN-Index return for each period: up 12.1% in 2024, up 40.87% in 2025, up 2.67% in the first eight months of 2026',
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là 3 kỳ: hai năm trọn và tám tháng đầu 2026',
          en: 'is 3 periods: two full years and the first eight months of 2026',
        },
      },
    ],
    thaySo: {
      vi: '(((1 + 12,1 ÷ 100) × (1 + 40,87 ÷ 100) × (1 + 2,67 ÷ 100))^(1 ÷ 3) − 1) × 100',
      en: '(((1 + 12.1 ÷ 100) × (1 + 40.87 ÷ 100) × (1 + 2.67 ÷ 100))^(1 ÷ 3) − 1) × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=VNINDEX&StartDate=12/29/2023&EndDate=12/29/2023&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'VN-Index cuối năm 2023, phiên 29/12/2023',
          en: 'VN-Index at the end of 2023, 2023-12-29 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=VNINDEX&StartDate=12/31/2024&EndDate=12/31/2024&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'VN-Index cuối năm 2024, phiên 31/12/2024',
          en: 'VN-Index at the end of 2024, 2024-12-31 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=VNINDEX&StartDate=12/31/2025&EndDate=12/31/2025&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'VN-Index cuối năm 2025, phiên 31/12/2025',
          en: 'VN-Index at the end of 2025, 2025-12-31 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=VNINDEX&StartDate=08/28/2026&EndDate=08/28/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'VN-Index cuối tháng 8/2026, phiên 28/08/2026',
          en: 'VN-Index at the end of August 2026, 2026-08-28 session',
        },
      },
    ],
  },
  'irr-nien-kim': {
    tinh: {
      vi: 'lãi suất thực trả mỗi tháng của khoản vay mua nhà 3 tỷ ₫ kỳ hạn 20 năm',
      en: 'the monthly rate actually paid on a 3 billion ₫ home loan over 20 years',
    },
    gan: [
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là số tiền vay nhận về lúc đầu: 3 tỷ ₫',
          en: 'is the loan received up front: 3 billion ₫',
        },
      },
      {
        kyHieu: 'C',
        moTa: {
          vi: 'là khoản người vay báo trả mỗi tháng: 28 triệu ₫',
          en: 'is what the borrower reports paying each month: 28 million ₫',
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là 240 tháng của kỳ hạn 20 năm',
          en: 'is the 240 months of the 20-year term',
        },
      },
      {
        kyHieu: 'IRR',
        moTa: {
          vi: 'là lãi suất mỗi tháng làm 240 khoản 28 triệu ₫, quy về hôm nay, cộng lại vừa đủ 3 tỷ ₫, phải dò dần mới ra: 0,7932%',
          en: 'is the monthly rate at which 240 payments of 28 million ₫, brought back to today, add up to exactly 3 billion ₫; it has to be found by trial: 0.7932%',
        },
      },
    ],
    thaySo: {
      vi: '28.000.000 × (1 − (1 + 0,7932 ÷ 100)^(−240)) ÷ (0,7932 ÷ 100)',
      en: '28000000 × (1 − (1 + 0.7932 ÷ 100)^(−240)) ÷ (0.7932 ÷ 100)',
    },
    thaySoRa: {
      giaTri: 3000000000,
      donVi: '₫',
    },
    nguon: [
      {
        url: 'https://vietnamfinance.vn/moi-thang-tra-them-chuc-trieu-nguoi-vay-mua-nha-chat-vat-xoay-xo-d142201.html',
        nhan: {
          vi: 'Khoản vay 3 tỷ đồng, trả khoảng 28 triệu đồng mỗi tháng',
          en: 'A 3 billion đồng loan repaid at about 28 million đồng a month',
        },
      },
    ],
  },
  'thoi-gian-nhan-doi': {
    tinh: {
      vi: 'số năm để khoản gửi tiết kiệm 12 tháng nhóm Big4 tăng gấp đôi',
      en: 'the years a twelve-month Big4 savings deposit takes to double',
    },
    gan: [
      {
        kyHieu: 'r',
        moTa: {
          vi: 'là lãi suất gửi trực tuyến kỳ hạn 12 tháng nhóm Big4 tháng 9/2026: 6,8% một năm',
          en: "is the Big4 banks' online twelve-month deposit rate in September 2026: 6.8% a year",
        },
      },
    ],
    thaySo: {
      vi: 'ln(2) ÷ ln(1 + 6,8 ÷ 100)',
      en: 'ln(2) ÷ ln(1 + 6.8 ÷ 100)',
    },
    nguon: [
      {
        url: 'https://vietnamnet.vn/lai-suat-ngan-hang-hom-nay-9-9-2026-lai-suat-ngan-hang-big4-len-den-8-nam-2553329.html',
        nhan: {
          vi: 'Lãi suất tiết kiệm nhóm Big4 ngày 9/9/2026',
          en: 'Big4 savings rates on 2026-09-09',
        },
      },
    ],
  },
  'loi-suat-quy-nam-theo-ngay': {
    tinh: {
      vi: 'lợi suất quy năm của vòng mua bán FPT từ 24/07 tới 11/09/2026',
      en: 'the annualized return of the FPT round trip from 2026-07-24 to 2026-09-11',
    },
    gan: [
      {
        kyHieu: 'P_{ban}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 11/09/2026, ngày bán: 72.700 ₫',
          en: "is FPT's close on the 2026-09-11 session, the sell date: 72700 ₫",
        },
      },
      {
        kyHieu: 'P_{mua}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 24/07/2026, ngày mua: 62.900 ₫',
          en: "is FPT's close on the 2026-07-24 session, the buy date: 62900 ₫",
        },
      },
      {
        kyHieu: 'd',
        moTa: {
          vi: 'là 49 ngày lịch từ 24/07 tới 11/09/2026',
          en: 'is the 49 calendar days from 2026-07-24 to 2026-09-11',
        },
      },
    ],
    thaySo: {
      vi: '((72.700 ÷ 62.900)^(365 ÷ 49) − 1) × 100',
      en: '((72700 ÷ 62900)^(365 ÷ 49) − 1) × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=07/24/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 24/07/2026',
          en: 'FPT price, 2026-07-24 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
    ],
  },
  'loi-suat-vuot-chuan': {
    tinh: {
      vi: 'phần lợi suất FPT vượt VN-Index từ 24/07 tới 11/09/2026',
      en: "how far FPT's return beat the VN-Index from 2026-07-24 to 2026-09-11",
    },
    gan: [
      {
        kyHieu: 'r_{p}',
        moTa: {
          vi: 'là mức tăng giá đóng cửa FPT từ phiên 24/07 tới phiên 11/09/2026: 15,58%',
          en: "is the gain in FPT's close from the 2026-07-24 session to the 2026-09-11 session: 15.58%",
        },
      },
      {
        kyHieu: 'r_{b}',
        moTa: {
          vi: 'là mức tăng của VN-Index cùng kỳ, từ 1.686,11 lên 1.795,21 điểm: 6,47%',
          en: 'is the VN-Index gain over the same span, from 1,686.11 to 1,795.21 points: 6.47%',
        },
      },
    ],
    thaySo: {
      vi: '15,58 − 6,47',
      en: '15.58 − 6.47',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=07/24/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 24/07/2026',
          en: 'FPT price, 2026-07-24 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=VNINDEX&StartDate=07/24/2026&EndDate=07/24/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'VN-Index phiên 24/07/2026',
          en: 'VN-Index, 2026-07-24 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=VNINDEX&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'VN-Index phiên 11/09/2026',
          en: 'VN-Index, 2026-09-11 session',
        },
      },
    ],
  },
  'co-lenh-rui-ro': {
    tinh: {
      vi: 'số cổ phiếu FPT tối đa được mua ở lệnh vào phiên 11/09/2026',
      en: 'the most FPT shares allowed on the trade entered on the 2026-09-11 session',
    },
    gan: [
      {
        kyHieu: 'V',
        moTa: {
          vi: 'là vốn tài khoản: 500 triệu ₫',
          en: 'is the account capital: 500 million ₫',
        },
      },
      {
        kyHieu: 'r',
        moTa: {
          vi: 'là phần vốn chấp nhận mất nếu lệnh chạm cắt lỗ: 2%',
          en: 'is the share of capital you accept losing if the stop is hit: 2%',
        },
      },
      {
        kyHieu: 'P_{vao}',
        moTa: {
          vi: 'là giá mua vào, lấy giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫',
          en: "is the entry price, taken as FPT's close on the 2026-09-11 session: 72700 ₫",
        },
      },
      {
        kyHieu: 'P_{cat}',
        moTa: {
          vi: 'là giá cắt lỗ, đặt ở giá đóng cửa FPT phiên 14/08/2026, mức đóng cửa thấp nhất của tháng 8/2026: 68.300 ₫',
          en: "is the stop price, set at FPT's close on the 2026-08-14 session, the lowest close of August 2026: 68300 ₫",
        },
      },
    ],
    thaySo: {
      vi: '500.000.000 × 2 ÷ 100 ÷ (72.700 − 68.300)',
      en: '500000000 × 2 ÷ 100 ÷ (72700 − 68300)',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/14/2026&EndDate=08/14/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 14/08/2026',
          en: 'FPT price, 2026-08-14 session',
        },
      },
    ],
  },
  'sut-giam-sau-nhat': {
    tinh: {
      vi: 'mức sụt giảm sâu nhất của FPT trong 55 phiên tính tới 15/09/2026',
      en: "FPT's maximum drawdown over the 55 sessions through 2026-09-15",
    },
    gan: [
      {
        kyHieu: 'N',
        moTa: {
          vi: 'là 55 phiên gần nhất tính tới 15/09/2026, bắt đầu từ phiên 26/06/2026',
          en: 'is the 55 most recent sessions through 2026-09-15, starting from the 2026-06-26 session',
        },
      },
      {
        kyHieu: '\\max_{s \\le t} P_s',
        moTa: {
          vi: 'là giá đóng cửa cao nhất của FPT từ phiên 26/06 tới phiên 27/07/2026, lập ở phiên 07/07/2026: 73.200 ₫',
          en: "is FPT's highest close from the 2026-06-26 session to the 2026-07-27 session, set on the 2026-07-07 session: 73200 ₫",
        },
      },
      {
        kyHieu: 'P_t',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 27/07/2026, đáy của khoảng rơi sâu nhất: 62.200 ₫',
          en: "is FPT's close on the 2026-07-27 session, the bottom of the deepest fall: 62200 ₫",
        },
      },
    ],
    thaySo: {
      vi: '(73.200 − 62.200) ÷ 73.200 × 100',
      en: '(73200 − 62200) ÷ 73200 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/24/2026&EndDate=07/21/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ phiên 24/06 tới phiên 21/07/2026',
          en: 'FPT prices, 2026-06-24 to 2026-07-21 sessions',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/22/2026&EndDate=08/18/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ phiên 22/07 tới phiên 18/08/2026',
          en: 'FPT prices, 2026-07-22 to 2026-08-18 sessions',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/19/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ phiên 19/08 tới phiên 15/09/2026',
          en: 'FPT prices, 2026-08-19 to 2026-09-15 sessions',
        },
      },
    ],
  },
  'sut-giam-hien-tai': {
    tinh: {
      vi: 'khoảng FPT đang nằm dưới đỉnh của 55 phiên gần nhất, tính tới phiên 15/09/2026',
      en: 'how far FPT sits below the peak of its 55 most recent sessions, as of the 2026-09-15 session',
    },
    gan: [
      {
        kyHieu: 'P_{max}',
        moTa: {
          vi: 'là giá đóng cửa cao nhất của FPT trong 55 phiên từ 26/06 tới 15/09/2026, lập ở phiên 10/09/2026: 74.500 ₫',
          en: "is FPT's highest close in the 55 sessions from 2026-06-26 to 2026-09-15, set on the 2026-09-10 session: 74500 ₫",
        },
      },
      {
        kyHieu: 'P_{t}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 15/09/2026: 72.700 ₫',
          en: "is FPT's close on the 2026-09-15 session: 72700 ₫",
        },
      },
    ],
    thaySo: {
      vi: '(74.500 − 72.700) ÷ 74.500 × 100',
      en: '(74500 − 72700) ÷ 74500 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/24/2026&EndDate=07/21/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ phiên 24/06 tới phiên 21/07/2026',
          en: 'FPT prices, 2026-06-24 to 2026-07-21 sessions',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/22/2026&EndDate=08/18/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ phiên 22/07 tới phiên 18/08/2026',
          en: 'FPT prices, 2026-07-22 to 2026-08-18 sessions',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/19/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ phiên 19/08 tới phiên 15/09/2026',
          en: 'FPT prices, 2026-08-19 to 2026-09-15 sessions',
        },
      },
    ],
  },
  'var-lich-su': {
    tinh: {
      vi: 'ngưỡng lỗ một phiên ở độ tin cậy 95% của danh mục bám VN-Index, trên 71 phiên tính tới 15/09/2026',
      en: 'the one-session loss threshold at 95% confidence for a VN-Index-tracking portfolio, over 71 sessions through 2026-09-15',
    },
    gan: [
      {
        kyHieu: '\\alpha',
        moTa: {
          vi: 'là độ tin cậy 95%',
          en: 'is the 95% confidence level',
        },
      },
      {
        kyHieu: 'N',
        moTa: {
          vi: 'là 71 phiên VN-Index, từ 04/06 tới 15/09/2026',
          en: 'is 71 VN-Index sessions, from 2026-06-04 to 2026-09-15',
        },
      },
      {
        kyHieu: 'Q_{1-\\alpha}(r_N)',
        moTa: {
          vi: 'là ngưỡng lợi suất phiên của chuỗi, nằm giữa lợi suất thấp thứ tư, −0,020701 ở phiên 14/08/2026, và lợi suất thấp thứ năm, −0,018598 ở phiên 11/09/2026: từ số thứ tư đi thêm 0,45 khoảng cách tới số thứ năm',
          en: "is the series' session-return threshold, lying between the fourth-lowest return, −0.020701 on 2026-08-14, and the fifth-lowest, −0.018598 on 2026-09-11: from the fourth, go 0.45 of the way to the fifth",
        },
      },
    ],
    thaySo: {
      vi: '−(−0,020701 + 0,45 × (−0,018598 − (−0,020701))) × 100',
      en: '−(−0.020701 + 0.45 × (−0.018598 − (−0.020701))) × 100',
    },
    nguon: [
      {
        url: 'https://api-finfo.vndirect.com.vn/v4/vnmarket_prices?sort=date&q=code:VNINDEX~date:gte:2026-06-04~date:lte:2026-09-15&size=100',
        nhan: {
          vi: 'Giá đóng cửa VN-Index 71 phiên, từ 04/06 tới 15/09/2026',
          en: 'VN-Index closes for 71 sessions, 2026-06-04 to 2026-09-15',
        },
      },
    ],
  },
  'cvar-lich-su': {
    tinh: {
      vi: 'mức lỗ bình quân của nhóm phiên tệ nhất trên VN-Index ở độ tin cậy 95%, trên 71 phiên tính tới 15/09/2026',
      en: 'the average loss of the worst VN-Index sessions at 95% confidence, over 71 sessions through 2026-09-15',
    },
    gan: [
      {
        kyHieu: '\\alpha',
        moTa: {
          vi: 'là độ tin cậy 95%',
          en: 'is the 95% confidence level',
        },
      },
      {
        kyHieu: 'N',
        moTa: {
          vi: 'là 71 phiên VN-Index, từ 04/06 tới 15/09/2026',
          en: 'is 71 VN-Index sessions, from 2026-06-04 to 2026-09-15',
        },
      },
      {
        kyHieu: 'Q_{1-\\alpha}(r_N)',
        moTa: {
          vi: 'là ngưỡng VaR 95% của cùng chuỗi, trước khi đổi dấu; chỉ bốn phiên có lợi suất không cao hơn ngưỡng này',
          en: 'is the 95% VaR threshold of the same series, before its sign is flipped; only four sessions returned no more than it',
        },
      },
      {
        kyHieu: 'r',
        moTa: {
          vi: 'của bốn phiên ấy là −0,026304 ở phiên 08/06, −0,024583 ở phiên 20/07, −0,035844 ở phiên 22/07 và −0,020701 ở phiên 14/08/2026',
          en: 'of those four sessions is −0.026304 on 2026-06-08, −0.024583 on 2026-07-20, −0.035844 on 2026-07-22 and −0.020701 on 2026-08-14',
        },
      },
      {
        kyHieu: 'E',
        moTa: {
          vi: 'là trung bình cộng của bốn lợi suất ấy: cộng lại rồi chia 4',
          en: 'is the average of those four returns: add them up and divide by 4',
        },
      },
    ],
    thaySo: {
      vi: '−(−0,026304 − 0,024583 − 0,035844 − 0,020701) ÷ 4 × 100',
      en: '−(−0.026304 − 0.024583 − 0.035844 − 0.020701) ÷ 4 × 100',
    },
    nguon: [
      {
        url: 'https://api-finfo.vndirect.com.vn/v4/vnmarket_prices?sort=date&q=code:VNINDEX~date:gte:2026-06-04~date:lte:2026-09-15&size=100',
        nhan: {
          vi: 'Giá đóng cửa VN-Index 71 phiên, từ 04/06 tới 15/09/2026',
          en: 'VN-Index closes for 71 sessions, 2026-06-04 to 2026-09-15',
        },
      },
    ],
  },
  'do-lech-chuan-loi-suat-phien': {
    tinh: {
      vi: 'độ lệch chuẩn lợi suất theo phiên của FPT, 55 phiên tính tới 15/09/2026',
      en: "FPT's daily return standard deviation over the 55 sessions through 2026-09-15",
    },
    gan: [
      {
        kyHieu: 'r_t',
        moTa: {
          vi: 'là lợi suất từng phiên của FPT so với giá đóng cửa phiên liền trước, lấy trên giá đóng cửa 55 phiên từ 26/06 đến 15/09/2026',
          en: "is FPT's return in each session against the previous session's close, taken from the closes of the 55 sessions from 2026-06-26 to 2026-09-15",
        },
      },
      {
        kyHieu: '\\bar{r}',
        moTa: {
          vi: 'là lợi suất bình quân của các phiên ấy; bình phương chênh lệch giữa lợi suất từng phiên và mức bình quân này rồi cộng lại được 196,41 (%²)',
          en: "is the average of those returns; squaring each session's gap from this average and adding them up gives 196.41 (%²)",
        },
      },
      {
        kyHieu: 'n',
        giaTri: {
          vi: '54',
          en: '54',
        },
      },
    ],
    thaySo: {
      vi: '√(196,41 ÷ (54 − 1))',
      en: '√(196.41 ÷ (54 − 1))',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/26/2026&EndDate=07/23/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 26/06 đến 23/07/2026',
          en: 'FPT closes, 2026-06-26 to 2026-07-23',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=08/20/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 24/07 đến 20/08/2026',
          en: 'FPT closes, 2026-07-24 to 2026-08-20',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/21/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 21/08 đến 15/09/2026',
          en: 'FPT closes, 2026-08-21 to 2026-09-15',
        },
      },
    ],
  },
  'do-bien-dong-nam-hoa': {
    tinh: {
      vi: 'độ biến động năm hoá của FPT, 55 phiên tính tới 15/09/2026',
      en: "FPT's annualized volatility over the 55 sessions through 2026-09-15",
    },
    gan: [
      {
        kyHieu: 's_{phien}',
        moTa: {
          vi: 'là độ lệch chuẩn lợi suất phiên của FPT, tính trên giá đóng cửa 55 phiên từ 26/06 đến 15/09/2026: 1,925%',
          en: "is the standard deviation of FPT's session returns, from the closes of the 55 sessions from 2026-06-26 to 2026-09-15: 1.925%",
        },
      },
      {
        kyHieu: 'D',
        giaTri: {
          vi: '250',
          en: '250',
        },
      },
    ],
    thaySo: {
      vi: '1,925 × √250',
      en: '1.925 × √250',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/26/2026&EndDate=07/23/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 26/06 đến 23/07/2026',
          en: 'FPT closes, 2026-06-26 to 2026-07-23',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=08/20/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 24/07 đến 20/08/2026',
          en: 'FPT closes, 2026-07-24 to 2026-08-20',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/21/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 21/08 đến 15/09/2026',
          en: 'FPT closes, 2026-08-21 to 2026-09-15',
        },
      },
    ],
  },
  'do-lech-chuan-ban-phan': {
    tinh: {
      vi: 'độ lệch chuẩn bán phần của FPT với ngưỡng 0% mỗi phiên, 55 phiên tính tới 15/09/2026',
      en: "FPT's downside deviation at a 0% per-session threshold over the 55 sessions through 2026-09-15",
    },
    gan: [
      {
        kyHieu: 'r_t',
        moTa: {
          vi: 'là lợi suất của từng phiên giảm của FPT trong 55 phiên từ 26/06 đến 15/09/2026; bình phương rồi cộng lại được 76,18 (%²), còn phiên tăng và phiên đứng giá không vào tổng',
          en: "is the return of each of FPT's down sessions across the 55 sessions from 2026-06-26 to 2026-09-15; squared and added up they give 76.18 (%²), while up and unchanged sessions stay out of the sum",
        },
      },
      {
        kyHieu: 'B',
        giaTri: {
          vi: '0',
          en: '0',
        },
      },
      {
        kyHieu: 'n',
        giaTri: {
          vi: '54',
          en: '54',
        },
      },
    ],
    thaySo: {
      vi: '√(76,18 ÷ (54 − 1))',
      en: '√(76.18 ÷ (54 − 1))',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/26/2026&EndDate=07/23/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 26/06 đến 23/07/2026',
          en: 'FPT closes, 2026-06-26 to 2026-07-23',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=08/20/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 24/07 đến 20/08/2026',
          en: 'FPT closes, 2026-07-24 to 2026-08-20',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/21/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 21/08 đến 15/09/2026',
          en: 'FPT closes, 2026-08-21 to 2026-09-15',
        },
      },
    ],
  },
  'he-so-bien-thien': {
    tinh: {
      vi: 'hệ số biến thiên lợi suất của FPT, 55 phiên tính tới 15/09/2026',
      en: "FPT's coefficient of variation over the 55 sessions through 2026-09-15",
    },
    gan: [
      {
        kyHieu: 's',
        moTa: {
          vi: 'là độ lệch chuẩn lợi suất phiên của FPT, tính trên giá đóng cửa 55 phiên từ 26/06 đến 15/09/2026: 1,92504%',
          en: "is the standard deviation of FPT's session returns, from the closes of the 55 sessions from 2026-06-26 to 2026-09-15: 1.92504%",
        },
      },
      {
        kyHieu: '\\bar{r}',
        moTa: {
          vi: 'là lợi suất bình quân mỗi phiên của FPT trong cùng 55 phiên ấy: 0,067086%',
          en: "is FPT's average return per session over those same 55 sessions: 0.067086%",
        },
      },
    ],
    thaySo: {
      vi: '1,92504 ÷ 0,067086',
      en: '1.92504 ÷ 0.067086',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/26/2026&EndDate=07/23/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 26/06 đến 23/07/2026',
          en: 'FPT closes, 2026-06-26 to 2026-07-23',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=08/20/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 24/07 đến 20/08/2026',
          en: 'FPT closes, 2026-07-24 to 2026-08-20',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/21/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 21/08 đến 15/09/2026',
          en: 'FPT closes, 2026-08-21 to 2026-09-15',
        },
      },
    ],
  },
  'bien-do-dao-dong-lon-nhat': {
    tinh: {
      vi: 'biên độ từ đáy lên đỉnh của giá FPT, 55 phiên tính tới 15/09/2026',
      en: "the trough-to-peak range of FPT's price over the 55 sessions through 2026-09-15",
    },
    gan: [
      {
        kyHieu: 'P_{max}',
        moTa: {
          vi: 'là giá đóng cửa cao nhất của FPT trong 55 phiên từ 26/06 đến 15/09/2026, ở phiên 10/09/2026: 74.500 ₫',
          en: "is FPT's highest close across the 55 sessions from 2026-06-26 to 2026-09-15, on the 2026-09-10 session: 74500 ₫",
        },
      },
      {
        kyHieu: 'P_{min}',
        moTa: {
          vi: 'là giá đóng cửa thấp nhất trong cùng kỳ, ở phiên 27/07/2026: 62.200 ₫',
          en: 'is the lowest close in the same period, on the 2026-07-27 session: 62200 ₫',
        },
      },
    ],
    thaySo: {
      vi: '(74.500 − 62.200) ÷ 62.200 × 100',
      en: '(74500 − 62200) ÷ 62200 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/26/2026&EndDate=07/23/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 26/06 đến 23/07/2026',
          en: 'FPT closes, 2026-06-26 to 2026-07-23',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=08/20/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 24/07 đến 20/08/2026, có đáy 62.200 ₫ phiên 27/07',
          en: 'FPT closes, 2026-07-24 to 2026-08-20, with the 62200 ₫ low on 2026-07-27',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/21/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 21/08 đến 15/09/2026, có đỉnh 74.500 ₫ phiên 10/09',
          en: 'FPT closes, 2026-08-21 to 2026-09-15, with the 74500 ₫ high on 2026-09-10',
        },
      },
    ],
  },
  'chuoi-phien-giam-dai-nhat': {
    tinh: {
      vi: 'chuỗi phiên giảm liên tiếp dài nhất của FPT, 55 phiên tính tới 15/09/2026',
      en: "FPT's longest run of consecutive down sessions over the 55 sessions through 2026-09-15",
    },
    gan: [
      {
        kyHieu: 'r_{t+1}',
        moTa: {
          vi: 'là lợi suất phiên mở đầu chuỗi giảm, âm ở cả hai chuỗi: phiên 10/07/2026 giá đóng cửa từ 72.100 xuống 70.600 ₫, phiên 11/08/2026 từ 71.800 xuống 71.200 ₫',
          en: 'is the return of the session that opens the losing run, negative in both runs: on 2026-07-10 the close fell from 72100 to 70600 ₫, on 2026-08-11 from 71800 to 71200 ₫',
        },
      },
      {
        kyHieu: 'r_{t+k}',
        moTa: {
          vi: 'là lợi suất phiên khép lại chuỗi, cũng âm: phiên 15/07/2026 từ 70.300 xuống 66.800 ₫, phiên 14/08/2026 từ 69.200 xuống 68.300 ₫',
          en: 'is the return of the session that closes the run, also negative: on 2026-07-15 from 70300 to 66800 ₫, on 2026-08-14 from 69200 to 68300 ₫',
        },
      },
      {
        kyHieu: 'k',
        moTa: {
          vi: 'là số phiên giảm liên tiếp; hai chuỗi trên dài bằng nhau, cùng 4 phiên, và trong 55 phiên từ 26/06 đến 15/09/2026 không có chuỗi nào dài hơn',
          en: 'is the number of consecutive down sessions; the two runs above are equally long, 4 sessions each, and no run in the 55 sessions from 2026-06-26 to 2026-09-15 is longer',
        },
      },
    ],
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/26/2026&EndDate=07/23/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 26/06 đến 23/07/2026, có chuỗi giảm 10/07 đến 15/07',
          en: 'FPT closes, 2026-06-26 to 2026-07-23, with the 2026-07-10 to 2026-07-15 run',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=08/20/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 24/07 đến 20/08/2026, có chuỗi giảm 11/08 đến 14/08',
          en: 'FPT closes, 2026-07-24 to 2026-08-20, with the 2026-08-11 to 2026-08-14 run',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/21/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá đóng cửa FPT từ 21/08 đến 15/09/2026',
          en: 'FPT closes, 2026-08-21 to 2026-09-15',
        },
      },
    ],
  },
  beta: {
    tinh: {
      vi: 'beta của VN-Index hồi quy theo chính nó, 71 phiên tới 15/09/2026',
      en: 'the beta of the VN-Index regressed on itself, 71 sessions through 2026-09-15',
    },
    gan: [
      {
        kyHieu: 'R_i',
        moTa: {
          vi: 'là lợi suất từng phiên của VN-Index, tính trên giá đóng cửa 71 phiên từ 04/06 đến 15/09/2026; ví dụ này đặt chính chỉ số vào chỗ của cổ phiếu',
          en: "is the VN-Index's return in each session, from the closes of the 71 sessions from 2026-06-04 to 2026-09-15; this example puts the index itself where the stock would go",
        },
      },
      {
        kyHieu: 'R_m',
        moTa: {
          vi: 'cũng là lợi suất từng phiên của VN-Index trên cùng 71 phiên ấy',
          en: "is again the VN-Index's return in each session, over the same 71 sessions",
        },
      },
      {
        kyHieu: '\\text{Cov}',
        moTa: {
          vi: 'là hiệp phương sai của hai chuỗi lợi suất; hai chuỗi trùng nhau nên nó bằng đúng phương sai: 1,2791 (%²)',
          en: 'is the covariance of the two return series; the two series are the same, so it equals the variance exactly: 1.2791 (%²)',
        },
      },
      {
        kyHieu: '\\text{Var}',
        moTa: {
          vi: 'là phương sai lợi suất phiên của VN-Index trên cùng chuỗi: 1,2791 (%²)',
          en: "is the variance of the VN-Index's session returns over the same series: 1.2791 (%²)",
        },
      },
    ],
    thaySo: {
      vi: '1,2791 ÷ 1,2791',
      en: '1.2791 ÷ 1.2791',
    },
    nguon: [
      {
        url: 'https://api-finfo.vndirect.com.vn/v4/vnmarket_prices?sort=date&q=code:VNINDEX~date:gte:2026-06-04~date:lte:2026-09-15&size=100',
        nhan: {
          vi: 'Giá đóng cửa VN-Index 71 phiên từ 04/06 đến 15/09/2026',
          en: 'VN-Index closes, 71 sessions from 2026-06-04 to 2026-09-15',
        },
      },
    ],
  },
  'ty-so-sharpe': {
    tinh: {
      vi: 'tỷ số Sharpe quy năm của VN-Index, 71 phiên tới 15/09/2026',
      en: "the VN-Index's annualized Sharpe ratio over the 71 sessions through 2026-09-15",
    },
    gan: [
      {
        kyHieu: '\\bar{r}_p',
        moTa: {
          vi: 'là lợi suất bình quân một phiên của VN-Index, tính trên giá đóng cửa 71 phiên từ 04/06 đến 15/09/2026: −0,009668%',
          en: "is the VN-Index's average return per session, from the closes of the 71 sessions from 2026-06-04 to 2026-09-15: −0.009668%",
        },
      },
      {
        kyHieu: 'r_f',
        moTa: {
          vi: 'là lợi suất trái phiếu chính phủ kỳ hạn 10 năm, 4,57%/năm, quy về một phiên theo lãi kép với 250 phiên một năm: 0,017876%',
          en: 'is the 10-year government bond yield, 4.57% a year, converted to one session by compounding over 250 sessions a year: 0.017876%',
        },
      },
      {
        kyHieu: '\\sigma_p',
        moTa: {
          vi: 'là độ lệch chuẩn lợi suất phiên của VN-Index trên cùng chuỗi: 1,131%',
          en: "is the standard deviation of the VN-Index's session returns over the same series: 1.131%",
        },
      },
      {
        kyHieu: 'm',
        giaTri: {
          vi: '250',
          en: '250',
        },
      },
    ],
    thaySo: {
      vi: '(−0,009668 − 0,017876) ÷ 1,131 × √250',
      en: '(−0.009668 − 0.017876) ÷ 1.131 × √250',
    },
    nguon: [
      {
        url: 'https://api-finfo.vndirect.com.vn/v4/vnmarket_prices?sort=date&q=code:VNINDEX~date:gte:2026-06-04~date:lte:2026-09-15&size=100',
        nhan: {
          vi: 'Giá đóng cửa VN-Index 71 phiên từ 04/06 đến 15/09/2026',
          en: 'VN-Index closes, 71 sessions from 2026-06-04 to 2026-09-15',
        },
      },
      {
        url: 'https://thoibaotaichinhvietnam.vn/luc-cau-trai-phieu-chinh-phu-tap-trung-ky-han-5-10-nam-203812.html',
        nhan: {
          vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm 4,57%, bản tin ngày 14/09/2026',
          en: '10-year government bond yield of 4.57%, report dated 2026-09-14',
        },
      },
    ],
  },
  'ty-so-sortino': {
    tinh: {
      vi: 'tỷ số Sortino quy năm của VN-Index, 71 phiên tới 15/09/2026',
      en: "the VN-Index's annualized Sortino ratio over the 71 sessions through 2026-09-15",
    },
    gan: [
      {
        kyHieu: '\\bar{r}_p',
        moTa: {
          vi: 'là lợi suất bình quân một phiên của VN-Index, tính trên giá đóng cửa 71 phiên từ 04/06 đến 15/09/2026: −0,009668%',
          en: "is the VN-Index's average return per session, from the closes of the 71 sessions from 2026-06-04 to 2026-09-15: −0.009668%",
        },
      },
      {
        kyHieu: 'r_f',
        moTa: {
          vi: 'là lợi suất trái phiếu chính phủ kỳ hạn 10 năm, 4,57%/năm, quy về một phiên theo lãi kép với 250 phiên một năm: 0,017876%, dùng làm ngưỡng',
          en: 'is the 10-year government bond yield, 4.57% a year, converted to one session by compounding over 250 sessions a year: 0.017876%, used as the threshold',
        },
      },
      {
        kyHieu: '\\min(0, r_t - r_f)',
        moTa: {
          vi: 'là phần lợi suất từng phiên hụt dưới ngưỡng 0,017876%; bình phương rồi cộng cho cả chuỗi được 51,96 (%²)',
          en: "is how far each session's return falls short of the 0.017876% threshold; squared and added up over the whole series it gives 51.96 (%²)",
        },
      },
      {
        kyHieu: 'n',
        giaTri: {
          vi: '70',
          en: '70',
        },
      },
      {
        kyHieu: 'm',
        giaTri: {
          vi: '250',
          en: '250',
        },
      },
    ],
    thaySo: {
      vi: '(−0,009668 − 0,017876) ÷ √(1 ÷ 70 × 51,96) × √250',
      en: '(−0.009668 − 0.017876) ÷ √(1 ÷ 70 × 51.96) × √250',
    },
    nguon: [
      {
        url: 'https://api-finfo.vndirect.com.vn/v4/vnmarket_prices?sort=date&q=code:VNINDEX~date:gte:2026-06-04~date:lte:2026-09-15&size=100',
        nhan: {
          vi: 'Giá đóng cửa VN-Index 71 phiên từ 04/06 đến 15/09/2026',
          en: 'VN-Index closes, 71 sessions from 2026-06-04 to 2026-09-15',
        },
      },
      {
        url: 'https://thoibaotaichinhvietnam.vn/luc-cau-trai-phieu-chinh-phu-tap-trung-ky-han-5-10-nam-203812.html',
        nhan: {
          vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm 4,57%, bản tin ngày 14/09/2026',
          en: '10-year government bond yield of 4.57%, report dated 2026-09-14',
        },
      },
    ],
  },
  'ty-so-treynor': {
    tinh: {
      vi: 'tỷ số Treynor của VN-Index, 71 phiên tới 15/09/2026, với beta của FPT',
      en: "the VN-Index's Treynor ratio over the 71 sessions through 2026-09-15, using FPT's beta",
    },
    gan: [
      {
        kyHieu: '\\bar{r}_p',
        moTa: {
          vi: 'là lợi suất bình quân một phiên của VN-Index, tính trên giá đóng cửa 71 phiên từ 04/06 đến 15/09/2026: −0,009668%',
          en: "is the VN-Index's average return per session, from the closes of the 71 sessions from 2026-06-04 to 2026-09-15: −0.009668%",
        },
      },
      {
        kyHieu: 'r_f',
        moTa: {
          vi: 'là lợi suất trái phiếu chính phủ kỳ hạn 10 năm, 4,57%/năm, quy về một phiên theo lãi kép với 250 phiên một năm: 0,017876%',
          en: 'is the 10-year government bond yield, 4.57% a year, converted to one session by compounding over 250 sessions a year: 0.017876%',
        },
      },
      {
        kyHieu: 'm',
        giaTri: {
          vi: '250',
          en: '250',
        },
      },
      {
        kyHieu: '\\beta_p',
        moTa: {
          vi: 'là beta của FPT theo VN-Index, hồi quy trên 55 phiên từ 24/06 đến 11/09/2026: 0,9043',
          en: "is FPT's beta against the VN-Index, regressed over the 55 sessions from 2026-06-24 to 2026-09-11: 0.9043",
        },
      },
    ],
    thaySo: {
      vi: '(−0,009668 − 0,017876) × 250 ÷ 0,9043',
      en: '(−0.009668 − 0.017876) × 250 ÷ 0.9043',
    },
    nguon: [
      {
        url: 'https://api-finfo.vndirect.com.vn/v4/vnmarket_prices?sort=date&q=code:VNINDEX~date:gte:2026-06-04~date:lte:2026-09-15&size=100',
        nhan: {
          vi: 'Giá đóng cửa VN-Index 71 phiên từ 04/06 đến 15/09/2026',
          en: 'VN-Index closes, 71 sessions from 2026-06-04 to 2026-09-15',
        },
      },
      {
        url: 'https://thoibaotaichinhvietnam.vn/luc-cau-trai-phieu-chinh-phu-tap-trung-ky-han-5-10-nam-203812.html',
        nhan: {
          vi: 'Lợi suất trái phiếu chính phủ kỳ hạn 10 năm 4,57%, bản tin ngày 14/09/2026',
          en: '10-year government bond yield of 4.57%, report dated 2026-09-14',
        },
      },
      {
        url: 'https://api-finfo.vndirect.com.vn/v4/stock_prices?sort=date&q=code:FPT~date:gte:2026-06-24~date:lte:2026-09-11&size=100',
        nhan: {
          vi: 'Giá đóng cửa FPT 55 phiên từ 24/06 đến 11/09/2026, dữ liệu để hồi quy beta 0,9043',
          en: 'FPT closes, 55 sessions from 2026-06-24 to 2026-09-11, the data behind the 0.9043 beta',
        },
      },
    ],
  },
  'ty-so-thong-tin': {
    tinh: {
      vi: 'tỷ số thông tin của VN-Index 71 phiên tới 15/09/2026, so với chuẩn gửi tiết kiệm 6,8%/năm',
      en: 'the VN-Index information ratio over 71 sessions to 2026-09-15, against a 6.8%/year savings benchmark',
    },
    gan: [
      {
        kyHieu: '\\bar{r}_p',
        moTa: {
          vi: 'là lợi suất bình quân một phiên của VN-Index trên chuỗi 71 phiên từ 04/06 đến 15/09/2026: −0,009668%',
          en: "is the VN-Index's average return per session over the 71-session series from 2026-06-04 to 2026-09-15: −0.009668%",
        },
      },
      {
        kyHieu: '\\bar{r}_b',
        moTa: {
          vi: 'là lãi tiết kiệm trực tuyến 12 tháng của nhóm Big4, 6,8%/năm, quy về một phiên theo lãi kép: 0,02632%',
          en: "is the Big4 banks' 12-month online savings rate, 6.8%/year, compounded down to one session: 0.02632%",
        },
      },
      {
        kyHieu: '\\sigma_{p-b}',
        moTa: {
          vi: 'là độ lệch chuẩn lợi suất từng phiên của VN-Index trên cùng chuỗi 71 phiên: 1,131%',
          en: "is the standard deviation of the VN-Index's per-session returns over the same 71-session series: 1.131%",
        },
      },
      {
        kyHieu: 'm',
        moTa: {
          vi: 'là số phiên giao dịch tính cho một năm: 250 phiên',
          en: 'is the number of trading sessions counted per year: 250 sessions',
        },
      },
    ],
    thaySo: {
      vi: '(−0,009668 − 0,02632) ÷ 1,131 × √250',
      en: '(−0.009668 − 0.02632) ÷ 1.131 × √250',
    },
    nguon: [
      {
        url: 'https://api-finfo.vndirect.com.vn/v4/vnmarket_prices?sort=date&q=code:VNINDEX~date:gte:2026-06-04~date:lte:2026-09-15&size=100',
        nhan: {
          vi: 'Chuỗi VN-Index 71 phiên từ 04/06 đến 15/09/2026',
          en: 'VN-Index series, 71 sessions from 2026-06-04 to 2026-09-15',
        },
      },
      {
        url: 'https://vietnamnet.vn/lai-suat-ngan-hang-hom-nay-9-9-2026-lai-suat-ngan-hang-big4-len-den-8-nam-2553329.html',
        nhan: {
          vi: 'Lãi suất tiết kiệm 12 tháng nhóm Big4 ngày 09/09/2026',
          en: "Big4 banks' 12-month savings rate, 2026-09-09",
        },
      },
    ],
  },
  'ty-so-calmar': {
    tinh: {
      vi: 'tỷ số Calmar của VN-Index 71 phiên tới 15/09/2026',
      en: 'the VN-Index Calmar ratio over 71 sessions to 2026-09-15',
    },
    gan: [
      {
        kyHieu: 'r_{nam}',
        moTa: {
          vi: 'là lợi suất năm hoá của VN-Index khi đi từ 1.831,55 điểm phiên 04/06 xuống 1.811,15 điểm phiên 15/09/2026, quy theo 250 phiên một năm: −0,039213',
          en: "is the VN-Index's annualized return going from 1831.55 points on 2026-06-04 down to 1811.15 points on 2026-09-15, scaled to 250 sessions a year: −0.039213",
        },
      },
      {
        kyHieu: 'MDD',
        moTa: {
          vi: 'là mức sụt sâu nhất của VN-Index trong chuỗi, từ đỉnh 1.878,02 điểm phiên 24/06 xuống đáy 1.668,53 điểm phiên 22/07/2026: 0,11155',
          en: "is the VN-Index's deepest drop in the series, from the 1878.02-point peak on 2026-06-24 to the 1668.53-point trough on 2026-07-22: 0.11155",
        },
      },
    ],
    thaySo: {
      vi: '−0,039213 ÷ 0,11155',
      en: '−0.039213 ÷ 0.11155',
    },
    nguon: [
      {
        url: 'https://api-finfo.vndirect.com.vn/v4/vnmarket_prices?sort=date&q=code:VNINDEX~date:gte:2026-06-04~date:lte:2026-09-15&size=100',
        nhan: {
          vi: 'Chuỗi VN-Index 71 phiên từ 04/06 đến 15/09/2026',
          en: 'VN-Index series, 71 sessions from 2026-06-04 to 2026-09-15',
        },
      },
    ],
  },
  'ty-so-thang-thua': {
    tinh: {
      vi: 'tỷ số thắng/thua của VN-Index 71 phiên tới 15/09/2026',
      en: 'the VN-Index win/loss ratio over 71 sessions to 2026-09-15',
    },
    gan: [
      {
        kyHieu: '\\overline{r^{+}}_h',
        moTa: {
          vi: 'là mức tăng bình quân của mọi phiên tăng của VN-Index trong chuỗi 71 phiên từ 04/06 đến 15/09/2026: 0,79871% mỗi phiên',
          en: 'is the average gain of every rising VN-Index session in the 71-session series from 2026-06-04 to 2026-09-15: 0.79871% per session',
        },
      },
      {
        kyHieu: '\\overline{r^{-}}_h',
        moTa: {
          vi: 'là mức giảm bình quân của mọi phiên giảm trong cùng chuỗi: −0,91603% mỗi phiên',
          en: 'is the average loss of every falling session in the same series: −0.91603% per session',
        },
      },
    ],
    thaySo: {
      vi: '0,79871 ÷ |−0,91603|',
      en: '0.79871 ÷ |−0.91603|',
    },
    nguon: [
      {
        url: 'https://api-finfo.vndirect.com.vn/v4/vnmarket_prices?sort=date&q=code:VNINDEX~date:gte:2026-06-04~date:lte:2026-09-15&size=100',
        nhan: {
          vi: 'Chuỗi VN-Index 71 phiên từ 04/06 đến 15/09/2026',
          en: 'VN-Index series, 71 sessions from 2026-06-04 to 2026-09-15',
        },
      },
    ],
  },
  'sma-n-phien': {
    tinh: {
      vi: 'đường SMA 20 phiên của FPT tại phiên 15/09/2026',
      en: "FPT's 20-session SMA at the 2026-09-15 session",
    },
    gan: [
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là số phiên của đường trung bình: 20 phiên',
          en: 'is the number of sessions in the average: 20 sessions',
        },
      },
      {
        kyHieu: 'P_{t-i}',
        moTa: {
          vi: 'là giá đóng cửa FPT của 20 phiên từ 14/08 đến 15/09/2026, cộng lại được 1.431.200 ₫',
          en: "is FPT's close over the 20 sessions from 2026-08-14 to 2026-09-15, which add up to 1431200 ₫",
        },
      },
    ],
    thaySo: {
      vi: '1 ÷ 20 × 1.431.200',
      en: '1 ÷ 20 × 1431200',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/14/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT 20 phiên từ 14/08 đến 15/09/2026',
          en: 'FPT prices, 20 sessions from 2026-08-14 to 2026-09-15',
        },
      },
    ],
  },
  'ema-n-phien': {
    tinh: {
      vi: 'đường EMA 12 phiên của FPT tại phiên 15/09/2026',
      en: "FPT's 12-session EMA at the 2026-09-15 session",
    },
    gan: [
      {
        kyHieu: 'P_t',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 15/09/2026: 72.700 ₫',
          en: "is FPT's close on the 2026-09-15 session: 72700 ₫",
        },
      },
      {
        kyHieu: 'k',
        moTa: {
          vi: 'là hệ số làm mượt của đường 12 phiên: 2 ÷ (12 + 1), khoảng 0,1538',
          en: 'is the smoothing factor of the 12-session line: 2 ÷ (12 + 1), about 0.1538',
        },
      },
      {
        kyHieu: 'EMA_{t-1}',
        moTa: {
          vi: 'là EMA 12 phiên của FPT tại phiên 14/09/2026, tính nối tiếp từ đầu chuỗi 24/06/2026: 72.332,26 ₫',
          en: "is FPT's 12-session EMA at the 2026-09-14 session, carried forward from the start of the series on 2026-06-24: 72332.26 ₫",
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là số phiên của đường EMA: 12 phiên',
          en: 'is the number of sessions in the EMA: 12 sessions',
        },
      },
    ],
    thaySo: {
      vi: '72.700 × 2 ÷ (12 + 1) + 72.332,26 × (1 − 2 ÷ (12 + 1))',
      en: '72700 × 2 ÷ (12 + 1) + 72332.26 × (1 − 2 ÷ (12 + 1))',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/24/2026&EndDate=07/21/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 24/06 đến 21/07/2026',
          en: 'FPT prices, 2026-06-24 to 2026-07-21',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/22/2026&EndDate=08/18/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 22/07 đến 18/08/2026',
          en: 'FPT prices, 2026-07-22 to 2026-08-18',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/19/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 19/08 đến 15/09/2026',
          en: 'FPT prices, 2026-08-19 to 2026-09-15',
        },
      },
    ],
  },
  'macd-duong-chinh': {
    tinh: {
      vi: 'đường MACD 12/26 của FPT tại phiên 15/09/2026',
      en: "FPT's 12/26 MACD line at the 2026-09-15 session",
    },
    gan: [
      {
        kyHieu: 'EMA_{nhanh}',
        moTa: {
          vi: 'là EMA 12 phiên của giá đóng cửa FPT tại phiên 15/09/2026, tính trên chuỗi từ 24/06/2026: 72.388,84 ₫',
          en: "is the 12-session EMA of FPT's close at the 2026-09-15 session, computed over the series from 2026-06-24: 72388.84 ₫",
        },
      },
      {
        kyHieu: 'EMA_{cham}',
        moTa: {
          vi: 'là EMA 26 phiên của giá đóng cửa FPT tại cùng phiên, trên cùng chuỗi: 71.580,63 ₫',
          en: "is the 26-session EMA of FPT's close at the same session, over the same series: 71580.63 ₫",
        },
      },
    ],
    thaySo: {
      vi: '72.388,84 − 71.580,63',
      en: '72388.84 − 71580.63',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/24/2026&EndDate=07/21/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 24/06 đến 21/07/2026',
          en: 'FPT prices, 2026-06-24 to 2026-07-21',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/22/2026&EndDate=08/18/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 22/07 đến 18/08/2026',
          en: 'FPT prices, 2026-07-22 to 2026-08-18',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/19/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 19/08 đến 15/09/2026',
          en: 'FPT prices, 2026-08-19 to 2026-09-15',
        },
      },
    ],
  },
  'macd-duong-tin-hieu': {
    tinh: {
      vi: 'đường tín hiệu MACD 12/26/9 của FPT tại phiên 15/09/2026',
      en: "FPT's 12/26/9 MACD signal line at the 2026-09-15 session",
    },
    gan: [
      {
        kyHieu: 'MACD',
        moTa: {
          vi: 'là đường MACD 12/26 của FPT phiên 15/09/2026, tính trên chuỗi từ 24/06/2026: 808,21 ₫',
          en: "is FPT's 12/26 MACD line on the 2026-09-15 session, computed over the series from 2026-06-24: 808.21 ₫",
        },
      },
      {
        kyHieu: 'EMA_{tin hieu}',
        moTa: {
          vi: 'là EMA 9 phiên tính trên chuỗi MACD từng phiên: MACD phiên 15/09/2026 nhận tỷ trọng 2 ÷ (9 + 1), phần tỷ trọng còn lại dành cho đường tín hiệu phiên 14/09/2026 là 737,93 ₫',
          en: 'is the 9-session EMA taken over the per-session MACD series: the 2026-09-15 MACD gets a weight of 2 ÷ (9 + 1), and the remaining weight goes to the 2026-09-14 signal value of 737.93 ₫',
        },
      },
    ],
    thaySo: {
      vi: '808,21 × 2 ÷ (9 + 1) + 737,93 × (1 − 2 ÷ (9 + 1))',
      en: '808.21 × 2 ÷ (9 + 1) + 737.93 × (1 − 2 ÷ (9 + 1))',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/24/2026&EndDate=07/21/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 24/06 đến 21/07/2026',
          en: 'FPT prices, 2026-06-24 to 2026-07-21',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/22/2026&EndDate=08/18/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 22/07 đến 18/08/2026',
          en: 'FPT prices, 2026-07-22 to 2026-08-18',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/19/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 19/08 đến 15/09/2026',
          en: 'FPT prices, 2026-08-19 to 2026-09-15',
        },
      },
    ],
  },
  'rsi-wilder': {
    tinh: {
      vi: 'RSI 14 phiên của FPT tại phiên 15/09/2026',
      en: "FPT's 14-session RSI at the 2026-09-15 session",
    },
    gan: [
      {
        kyHieu: '\\overline{Gain}_n',
        moTa: {
          vi: 'là trung bình mức tăng mỗi phiên của FPT, làm mượt Wilder 14 phiên trên chuỗi từ 24/06 đến 15/09/2026: 478,00 ₫',
          en: "is FPT's average gain per session, Wilder-smoothed over 14 sessions on the series from 2026-06-24 to 2026-09-15: 478.00 ₫",
        },
      },
      {
        kyHieu: '\\overline{Loss}_n',
        moTa: {
          vi: 'là trung bình mức giảm mỗi phiên của FPT, làm mượt cùng cách trên cùng chuỗi: 377,51 ₫',
          en: "is FPT's average loss per session, smoothed the same way over the same series: 377.51 ₫",
        },
      },
    ],
    thaySo: {
      vi: '100 − 100 ÷ (1 + 478,00 ÷ 377,51)',
      en: '100 − 100 ÷ (1 + 478.00 ÷ 377.51)',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/24/2026&EndDate=07/21/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 24/06 đến 21/07/2026',
          en: 'FPT prices, 2026-06-24 to 2026-07-21',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/22/2026&EndDate=08/18/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 22/07 đến 18/08/2026',
          en: 'FPT prices, 2026-07-22 to 2026-08-18',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/19/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 19/08 đến 15/09/2026',
          en: 'FPT prices, 2026-08-19 to 2026-09-15',
        },
      },
    ],
  },
  'roc-toc-do-thay-doi': {
    tinh: {
      vi: 'ROC 12 phiên của FPT tại phiên 15/09/2026',
      en: "FPT's 12-session ROC at the 2026-09-15 session",
    },
    gan: [
      {
        kyHieu: 'P_t',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 15/09/2026: 72.700 ₫',
          en: "is FPT's close on the 2026-09-15 session: 72700 ₫",
        },
      },
      {
        kyHieu: 'P_{t-n}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 25/08/2026, lùi 12 phiên từ 15/09: 70.700 ₫',
          en: "is FPT's close on the 2026-08-25 session, 12 sessions back from 2026-09-15: 70700 ₫",
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là số phiên nhìn lại: 12 phiên',
          en: 'is the number of lookback sessions: 12 sessions',
        },
      },
    ],
    thaySo: {
      vi: '(72.700 ÷ 70.700 − 1) × 100',
      en: '(72700 ÷ 70700 − 1) × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/25/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 25/08 đến 15/09/2026',
          en: 'FPT prices, 2026-08-25 to 2026-09-15',
        },
      },
    ],
  },
  'dong-luong-momentum': {
    tinh: {
      vi: 'động lượng 10 phiên của FPT tại phiên 15/09/2026',
      en: "FPT's 10-session momentum at the 2026-09-15 session",
    },
    gan: [
      {
        kyHieu: 'P_t',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 15/09/2026: 72.700 ₫',
          en: "is FPT's close on the 2026-09-15 session: 72700 ₫",
        },
      },
      {
        kyHieu: 'P_{t-n}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 27/08/2026, lùi 10 phiên từ 15/09: 72.200 ₫',
          en: "is FPT's close on the 2026-08-27 session, 10 sessions back from 2026-09-15: 72200 ₫",
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là số phiên nhìn lại: 10 phiên',
          en: 'is the number of lookback sessions: 10 sessions',
        },
      },
    ],
    thaySo: {
      vi: '72.700 − 72.200',
      en: '72700 − 72200',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/27/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ 27/08 đến 15/09/2026',
          en: 'FPT prices, 2026-08-27 to 2026-09-15',
        },
      },
    ],
  },
  'khoang-cach-gia-so-sma': {
    tinh: {
      vi: 'khoảng cách giữa giá FPT và đường SMA 20 phiên, chốt phiên 15/09/2026',
      en: 'the gap between FPT’s price and its 20-session SMA as of the 2026-09-15 session',
    },
    gan: [
      {
        kyHieu: 'P_t',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 15/09/2026, phiên cuối của chuỗi: 72.700 ₫',
          en: 'is FPT’s close on the 2026-09-15 session, the last in the series: 72700 ₫',
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là chu kỳ 20 phiên',
          en: 'is the 20-session period',
        },
      },
      {
        kyHieu: 'SMA_n',
        moTa: {
          vi: 'là trung bình giá đóng cửa FPT từ phiên 14/08 đến phiên 15/09/2026: 71.560 ₫',
          en: 'is the average of FPT’s closes from the 2026-08-14 session to the 2026-09-15 session: 71560 ₫',
        },
      },
    ],
    thaySo: {
      vi: '(72.700 ÷ 71.560 − 1) × 100',
      en: '(72700 ÷ 71560 − 1) × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/14/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT 20 phiên từ 14/08 đến 15/09/2026',
          en: 'FPT prices, 20 sessions from 2026-08-14 to 2026-09-15',
        },
      },
    ],
  },
  'giao-cat-hai-duong-ma': {
    tinh: {
      vi: 'chênh lệch giữa đường SMA 10 phiên và SMA 20 phiên của FPT, chốt phiên 15/09/2026',
      en: 'the gap between FPT’s 10-session and 20-session SMAs as of the 2026-09-15 session',
    },
    gan: [
      {
        kyHieu: 'SMA_{ngan}',
        moTa: {
          vi: 'là trung bình giá đóng cửa FPT 10 phiên từ 28/08 đến 15/09/2026: 72.750 ₫',
          en: 'is the average of FPT’s closes over the 10 sessions from 2026-08-28 to 2026-09-15: 72750 ₫',
        },
      },
      {
        kyHieu: 'SMA_{dai}',
        moTa: {
          vi: 'là trung bình giá đóng cửa FPT 20 phiên từ 14/08 đến 15/09/2026: 71.560 ₫',
          en: 'is the average of FPT’s closes over the 20 sessions from 2026-08-14 to 2026-09-15: 71560 ₫',
        },
      },
    ],
    thaySo: {
      vi: '72.750 − 71.560',
      en: '72750 − 71560',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/14/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT 20 phiên từ 14/08 đến 15/09/2026',
          en: 'FPT prices, 20 sessions from 2026-08-14 to 2026-09-15',
        },
      },
    ],
  },
  'dai-bollinger-tren': {
    tinh: {
      vi: 'dải Bollinger trên của FPT phiên 15/09/2026, chu kỳ 20 phiên, k = 2',
      en: 'FPT’s upper Bollinger band on the 2026-09-15 session, 20-session period, k = 2',
    },
    gan: [
      {
        kyHieu: 'n',
        giaTri: {
          vi: '20',
          en: '20',
        },
      },
      {
        kyHieu: 'SMA_{n}',
        moTa: {
          vi: 'là đường giữa, trung bình giá đóng cửa FPT từ phiên 14/08 đến phiên 15/09/2026: 71.560 ₫',
          en: 'is the middle band, the average of FPT’s closes from the 2026-08-14 session to the 2026-09-15 session: 71560 ₫',
        },
      },
      {
        kyHieu: 'k',
        giaTri: {
          vi: '2',
          en: '2',
        },
      },
      {
        kyHieu: '\\sigma_{n}',
        moTa: {
          vi: 'là độ lệch chuẩn mẫu của các giá đóng cửa ấy: 1.714,15 ₫',
          en: 'is the sample standard deviation of those closes: 1714.15 ₫',
        },
      },
    ],
    thaySo: {
      vi: '71.560 + 2 × 1.714,15',
      en: '71560 + 2 × 1714.15',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/14/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT 20 phiên từ 14/08 đến 15/09/2026',
          en: 'FPT prices, 20 sessions from 2026-08-14 to 2026-09-15',
        },
      },
    ],
  },
  'dai-bollinger-duoi': {
    tinh: {
      vi: 'dải Bollinger dưới của FPT phiên 15/09/2026, chu kỳ 20 phiên, k = 2',
      en: 'FPT’s lower Bollinger band on the 2026-09-15 session, 20-session period, k = 2',
    },
    gan: [
      {
        kyHieu: 'n',
        giaTri: {
          vi: '20',
          en: '20',
        },
      },
      {
        kyHieu: 'SMA_{n}',
        moTa: {
          vi: 'là đường giữa, trung bình giá đóng cửa FPT từ phiên 14/08 đến phiên 15/09/2026: 71.560 ₫',
          en: 'is the middle band, the average of FPT’s closes from the 2026-08-14 session to the 2026-09-15 session: 71560 ₫',
        },
      },
      {
        kyHieu: 'k',
        giaTri: {
          vi: '2',
          en: '2',
        },
      },
      {
        kyHieu: '\\sigma_{n}',
        moTa: {
          vi: 'là độ lệch chuẩn mẫu của các giá đóng cửa ấy: 1.714,15 ₫',
          en: 'is the sample standard deviation of those closes: 1714.15 ₫',
        },
      },
    ],
    thaySo: {
      vi: '71.560 − 2 × 1.714,15',
      en: '71560 − 2 × 1714.15',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/14/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT 20 phiên từ 14/08 đến 15/09/2026',
          en: 'FPT prices, 20 sessions from 2026-08-14 to 2026-09-15',
        },
      },
    ],
  },
  'do-rong-dai-bollinger': {
    tinh: {
      vi: 'độ rộng dải Bollinger của FPT phiên 15/09/2026, chu kỳ 20 phiên, k = 2',
      en: 'FPT’s Bollinger bandwidth on the 2026-09-15 session, 20-session period, k = 2',
    },
    gan: [
      {
        kyHieu: 'BB_{tren}',
        moTa: {
          vi: 'là dải trên của FPT phiên 15/09/2026 với k = 2: 74.988,3 ₫',
          en: 'is FPT’s upper band on the 2026-09-15 session with k = 2: 74988.3 ₫',
        },
      },
      {
        kyHieu: 'BB_{duoi}',
        moTa: {
          vi: 'là dải dưới cùng phiên, cũng với k = 2: 68.131,7 ₫',
          en: 'is the lower band on the same session, also with k = 2: 68131.7 ₫',
        },
      },
      {
        kyHieu: 'SMA_{n}',
        moTa: {
          vi: 'là đường giữa, trung bình giá đóng cửa FPT từ phiên 14/08 đến phiên 15/09/2026: 71.560 ₫',
          en: 'is the middle band, the average of FPT’s closes from the 2026-08-14 session to the 2026-09-15 session: 71560 ₫',
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là chu kỳ 20 phiên',
          en: 'is the 20-session period',
        },
      },
    ],
    thaySo: {
      vi: '(74.988,3 − 68.131,7) ÷ 71.560 × 100',
      en: '(74988.3 − 68131.7) ÷ 71560 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/14/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT 20 phiên từ 14/08 đến 15/09/2026',
          en: 'FPT prices, 20 sessions from 2026-08-14 to 2026-09-15',
        },
      },
    ],
  },
  'atr-dao-dong-thuc': {
    tinh: {
      vi: 'ATR 14 phiên của FPT phiên 15/09/2026, làm mượt theo Wilder',
      en: 'FPT’s 14-session ATR on the 2026-09-15 session, with Wilder smoothing',
    },
    gan: [
      {
        kyHieu: 'TR_t',
        moTa: {
          vi: 'là dao động thực phiên 15/09/2026, lấy khoảng lớn nhất trong ba: giá cao nhất trừ giá đóng cửa phiên 14/09',
          en: 'is the true range of the 2026-09-15 session, the largest of the three gaps: the high minus the 2026-09-14 close',
        },
      },
      {
        kyHieu: 'H_t',
        moTa: {
          vi: 'là giá cao nhất của FPT phiên 15/09/2026: 73.400 ₫',
          en: 'is FPT’s high on the 2026-09-15 session: 73400 ₫',
        },
      },
      {
        kyHieu: 'L_t',
        moTa: {
          vi: 'là giá thấp nhất của FPT phiên 15/09/2026: 72.500 ₫',
          en: 'is FPT’s low on the 2026-09-15 session: 72500 ₫',
        },
      },
      {
        kyHieu: 'C_{t-1}',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 14/09/2026: 72.400 ₫',
          en: 'is FPT’s close on the 2026-09-14 session: 72400 ₫',
        },
      },
      {
        kyHieu: 'ATR_{t-1}',
        moTa: {
          vi: 'là ATR của FPT phiên 14/09/2026, làm mượt Wilder 14 phiên trên chuỗi từ 24/06 đến 14/09/2026: 1.536,27 ₫',
          en: 'is FPT’s ATR on the 2026-09-14 session, Wilder-smoothed over 14 sessions across the series from 2026-06-24 to 2026-09-14: 1536.27 ₫',
        },
      },
      {
        kyHieu: 'n',
        giaTri: {
          vi: '14',
          en: '14',
        },
      },
    ],
    thaySo: {
      vi: '((14 − 1) × 1.536,27 + |73.400 − 72.400|) ÷ 14',
      en: '((14 − 1) × 1536.27 + |73400 − 72400|) ÷ 14',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/24/2026&EndDate=07/21/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ phiên 24/06 đến phiên 21/07/2026',
          en: 'FPT prices from the 2026-06-24 session to the 2026-07-21 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/22/2026&EndDate=08/18/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ phiên 22/07 đến phiên 18/08/2026',
          en: 'FPT prices from the 2026-07-22 session to the 2026-08-18 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/19/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ phiên 19/08 đến phiên 15/09/2026',
          en: 'FPT prices from the 2026-08-19 session to the 2026-09-15 session',
        },
      },
    ],
  },
  'phan-tram-b-bollinger': {
    tinh: {
      vi: 'vị trí giá FPT trong dải Bollinger phiên 15/09/2026, chu kỳ 20 phiên, k = 2',
      en: 'where FPT’s price sits within its Bollinger bands on the 2026-09-15 session, 20-session period, k = 2',
    },
    gan: [
      {
        kyHieu: 'C',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 15/09/2026: 72.700 ₫',
          en: 'is FPT’s close on the 2026-09-15 session: 72700 ₫',
        },
      },
      {
        kyHieu: 'BB_{duoi}',
        moTa: {
          vi: 'là dải dưới của FPT cùng phiên, tính trên 20 phiên từ 14/08 với k = 2: 68.131,7 ₫',
          en: 'is FPT’s lower band on the same session, computed over the 20 sessions from 2026-08-14 with k = 2: 68131.7 ₫',
        },
      },
      {
        kyHieu: 'BB_{tren}',
        moTa: {
          vi: 'là dải trên, cùng 20 phiên và cùng k = 2: 74.988,3 ₫',
          en: 'is the upper band, over the same 20 sessions and the same k = 2: 74988.3 ₫',
        },
      },
    ],
    thaySo: {
      vi: '(72.700 − 68.131,7) ÷ (74.988,3 − 68.131,7) × 100',
      en: '(72700 − 68131.7) ÷ (74988.3 − 68131.7) × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/14/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT 20 phiên từ 14/08 đến 15/09/2026',
          en: 'FPT prices, 20 sessions from 2026-08-14 to 2026-09-15',
        },
      },
    ],
  },
  'stochastic-k': {
    tinh: {
      vi: 'stochastic %K 14 phiên của FPT, chốt phiên 15/09/2026',
      en: 'FPT’s 14-session stochastic %K as of the 2026-09-15 session',
    },
    gan: [
      {
        kyHieu: 'C',
        moTa: {
          vi: 'là giá đóng cửa FPT phiên 15/09/2026: 72.700 ₫',
          en: 'is FPT’s close on the 2026-09-15 session: 72700 ₫',
        },
      },
      {
        kyHieu: 'n',
        giaTri: {
          vi: '14',
          en: '14',
        },
      },
      {
        kyHieu: 'L_{n}',
        moTa: {
          vi: 'là giá thấp nhất của FPT từ phiên 24/08 đến phiên 15/09/2026, chạm ở phiên 25/08 và 26/08: 70.700 ₫',
          en: 'is FPT’s lowest price from the 2026-08-24 session to the 2026-09-15 session, hit on 2026-08-25 and 2026-08-26: 70700 ₫',
        },
      },
      {
        kyHieu: 'H_{n}',
        moTa: {
          vi: 'là giá cao nhất của FPT trong cùng các phiên ấy, chạm ở phiên 10/09/2026: 74.800 ₫',
          en: 'is FPT’s highest price over those same sessions, hit on 2026-09-10: 74800 ₫',
        },
      },
    ],
    thaySo: {
      vi: '(72.700 − 70.700) ÷ (74.800 − 70.700) × 100',
      en: '(72700 − 70700) ÷ (74800 − 70700) × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/24/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT 14 phiên từ 24/08 đến 15/09/2026',
          en: 'FPT prices, 14 sessions from 2026-08-24 to 2026-09-15',
        },
      },
    ],
  },
  vwap: {
    tinh: {
      vi: 'giá bình quân theo khối lượng của FPT, gộp 20 phiên đến 15/09/2026',
      en: 'FPT’s volume weighted average price over the 20 sessions to 2026-09-15',
    },
    gan: [
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là 20 phiên gần nhất, từ 14/08 đến 15/09/2026',
          en: 'is the latest 20 sessions, from 2026-08-14 to 2026-09-15',
        },
      },
      {
        kyHieu: 'C_i',
        moTa: {
          vi: 'là giá đóng cửa FPT từng phiên; nhân mỗi giá với khối lượng cùng phiên rồi cộng cả 20 phiên được 10.059.768.944.600 ₫',
          en: 'is FPT’s close in each session; each close times that session’s volume, summed over all 20 sessions, gives 10059768944600 ₫',
        },
      },
      {
        kyHieu: 'V_i',
        moTa: {
          vi: 'là khối lượng của từng phiên ấy; cộng cả 20 phiên được 140.253.086 cổ phiếu',
          en: 'is the volume of each of those sessions; summed over all 20 sessions it comes to 140253086 shares',
        },
      },
    ],
    thaySo: {
      vi: '10.059.768.944.600 ÷ 140.253.086',
      en: '10059768944600 ÷ 140253086',
    },
    nguon: [],
  },
  'do-bien-dong-lich-su': {
    tinh: {
      vi: 'độ biến động lịch sử năm hoá của FPT, lấy mẫu 55 phiên đến 15/09/2026',
      en: 'FPT’s annualized historical volatility, sampling the 55 sessions to 2026-09-15',
    },
    gan: [
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là 55 phiên giá lấy mẫu, từ 26/06 đến 15/09/2026',
          en: 'is the 55 sampled price sessions, from 2026-06-26 to 2026-09-15',
        },
      },
      {
        kyHieu: '\\ln \\frac{P_t}{P_{t-1}}',
        moTa: {
          vi: 'là lợi suất log của FPT giữa từng cặp phiên liền nhau trong mẫu ấy',
          en: 'is FPT’s log return between each pair of consecutive sessions in that sample',
        },
      },
      {
        kyHieu: '\\sigma',
        moTa: {
          vi: 'là độ lệch chuẩn mẫu của các lợi suất log ấy: 0,0191283',
          en: 'is the sample standard deviation of those log returns: 0.0191283',
        },
      },
      {
        kyHieu: 'N',
        giaTri: {
          vi: '252',
          en: '252',
        },
      },
    ],
    thaySo: {
      vi: '0,0191283 × √252 × 100',
      en: '0.0191283 × √252 × 100',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=06/26/2026&EndDate=07/23/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ phiên 26/06 đến phiên 23/07/2026',
          en: 'FPT prices from the 2026-06-26 session to the 2026-07-23 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=08/20/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ phiên 24/07 đến phiên 20/08/2026',
          en: 'FPT prices from the 2026-07-24 session to the 2026-08-20 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/21/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT từ phiên 21/08 đến phiên 15/09/2026',
          en: 'FPT prices from the 2026-08-21 session to the 2026-09-15 session',
        },
      },
    ],
  },
  'ty-le-khoi-luong': {
    tinh: {
      vi: 'tỷ lệ khối lượng của FPT phiên 15/09/2026 so với trung bình 20 phiên liền trước',
      en: "FPT's relative volume on the 2026-09-15 session against the average of the preceding 20 sessions",
    },
    gan: [
      {
        kyHieu: 'V_t',
        moTa: {
          vi: 'là khối lượng khớp của FPT phiên 15/09/2026: 3.977.500 cổ phiếu',
          en: "is FPT's matched volume on the 2026-09-15 session: 3977500 shares",
        },
      },
      {
        kyHieu: '\\frac{1}{n}\\sum_{i=1}^{n} V_{t-i}',
        moTa: {
          vi: 'là khối lượng bình quân của FPT trong 20 phiên liền trước, từ 13/08 đến 14/09/2026: 7.231.307,65 cổ phiếu',
          en: "is FPT's average volume over the 20 sessions before it, from 2026-08-13 to 2026-09-14: 7231307.65 shares",
        },
      },
    ],
    thaySo: {
      vi: '3.977.500 ÷ 7.231.307,65',
      en: '3977500 ÷ 7231307.65',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/15/2026&EndDate=09/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Khối lượng khớp FPT phiên 15/09/2026 (CafeF)',
          en: 'FPT matched volume, 2026-09-15 session (CafeF)',
        },
      },
    ],
  },
  'gia-ly-thuyet-vn30f': {
    tinh: {
      vi: 'giá lý thuyết của hợp đồng VN30F1M phiên 14/09/2026',
      en: 'the theoretical VN30F1M price on the 2026-09-14 session',
    },
    gan: [
      {
        kyHieu: 'S',
        moTa: {
          vi: 'là chỉ số VN30 đóng cửa phiên 14/09/2026: 1.928,57 điểm',
          en: 'is the VN30 close of the 2026-09-14 session: 1928.57 points',
        },
      },
      {
        kyHieu: 'r',
        moTa: {
          vi: 'là lợi suất trái phiếu chính phủ kỳ hạn mười năm, lấy làm lãi suất phi rủi ro: 4,57%/năm',
          en: 'is the ten-year government bond yield, taken as the risk-free rate: 4.57% a year',
        },
      },
      {
        kyHieu: 'q',
        moTa: {
          vi: 'là tỷ suất cổ tức ước lượng của rổ VN30: 1,8%/năm',
          en: 'is the estimated dividend yield of the VN30 basket: 1.8% a year',
        },
      },
      {
        kyHieu: 'd',
        moTa: {
          vi: 'là số ngày còn lại tới khi hợp đồng tháng 9 đáo hạn, tính từ phiên 14/09/2026: 3 ngày',
          en: 'is the days left until the September contract expires, counted from the 2026-09-14 session: 3 days',
        },
      },
    ],
    thaySo: {
      vi: '1.928,57 × (1 + (4,57 − 1,8) ÷ 100 × 3 ÷ 365)',
      en: '1928.57 × (1 + (4.57 − 1.8) ÷ 100 × 3 ÷ 365)',
    },
    nguon: [
      {
        url: 'https://vietstock.vn/2026/09/chung-khoan-phai-sinh-ngay-15092026-tinh-hinh-tiep-tuc-chuyen-bien-xau-1636-1492026.htm',
        nhan: {
          vi: 'Chỉ số VN30 đóng cửa phiên 14/09/2026 (Vietstock)',
          en: 'VN30 close, 2026-09-14 session (Vietstock)',
        },
      },
      {
        url: 'https://tradingeconomics.com/vietnam/government-bond-yield/news/580736',
        nhan: {
          vi: 'Lợi suất trái phiếu chính phủ 10 năm 4,57% (Trading Economics, 03/09/2026)',
          en: '10-year government bond yield at 4.57% (Trading Economics, 2026-09-03)',
        },
      },
    ],
  },
  'basis-vn30f': {
    tinh: {
      vi: 'basis của VN30F1M so với chỉ số VN30 phiên 14/09/2026',
      en: 'the VN30F1M basis against the VN30 index on the 2026-09-14 session',
    },
    gan: [
      {
        kyHieu: 'F',
        moTa: {
          vi: 'là giá đóng cửa VN30F1M phiên 14/09/2026: 1.930,9 điểm',
          en: 'is the VN30F1M close of the 2026-09-14 session: 1930.9 points',
        },
      },
      {
        kyHieu: 'S',
        moTa: {
          vi: 'là chỉ số VN30 đóng cửa cùng phiên: 1.928,57 điểm',
          en: 'is the VN30 close of the same session: 1928.57 points',
        },
      },
    ],
    thaySo: {
      vi: '1.930,9 − 1.928,57',
      en: '1930.9 − 1928.57',
    },
    nguon: [
      {
        url: 'https://blog.entrade.com.vn/ban-tin-phai-sinh-15-09-2026-vn30f1m-uu-the-short-cho-nhip-hoi-len-1-935-1-940/',
        nhan: {
          vi: 'Giá VN30F1M 1.930,9 điểm và basis 2,33 điểm (Entrade)',
          en: 'VN30F1M at 1930.9 points and the 2.33-point basis (Entrade)',
        },
      },
      {
        url: 'https://vietstock.vn/2026/09/chung-khoan-phai-sinh-ngay-15092026-tinh-hinh-tiep-tuc-chuyen-bien-xau-1636-1492026.htm',
        nhan: {
          vi: 'Chỉ số VN30 đóng cửa phiên 14/09/2026 (Vietstock)',
          en: 'VN30 close, 2026-09-14 session (Vietstock)',
        },
      },
    ],
  },
  'lai-lo-vi-the-long': {
    tinh: {
      vi: 'lãi lỗ của một hợp đồng VN30F2005 mua trong đợt ATC phiên đáo hạn 21/05/2020',
      en: 'the P&L of one VN30F2005 long bought in the ATC auction of the 2020-05-21 expiry session',
    },
    gan: [
      {
        kyHieu: 'P_{dong}',
        moTa: {
          vi: 'là giá thanh toán cuối cùng của VN30F2005, bằng chỉ số VN30 đóng cửa phiên 21/05/2020: 815,55 điểm',
          en: 'is the final settlement price of VN30F2005, equal to the VN30 close of the 2020-05-21 session: 815.55 points',
        },
      },
      {
        kyHieu: 'P_{mo}',
        moTa: {
          vi: 'là giá khớp đợt ATC cùng phiên, mức giá vị thế Long được mở: 864 điểm',
          en: 'is the ATC auction price of the same session, the price the long was opened at: 864 points',
        },
      },
      {
        kyHieu: 'm',
        moTa: {
          vi: 'là hệ số nhân của hợp đồng VN30F: 100.000 ₫ mỗi điểm',
          en: 'is the VN30F contract multiplier: 100000 ₫ per point',
        },
      },
      {
        kyHieu: 'N',
        moTa: {
          vi: 'là số hợp đồng đang giữ: 1 hợp đồng',
          en: 'is the number of contracts held: 1 contract',
        },
      },
    ],
    thaySo: {
      vi: '(815,55 − 864) × 100.000 × 1',
      en: '(815.55 − 864) × 100000 × 1',
    },
    nguon: [
      {
        url: 'https://vnexpress.net/phien-giao-dich-bat-thuong-cua-chung-khoan-phai-sinh-4103230.html',
        nhan: {
          vi: 'Giá khớp 864 điểm và giá thanh toán 815,55 điểm của VN30F2005 (VnExpress)',
          en: 'VN30F2005 traded at 864 points and settled at 815.55 points (VnExpress)',
        },
      },
    ],
  },
  'lai-lo-vi-the-short': {
    tinh: {
      vi: 'lãi lỗ của một hợp đồng VN30F2005 bán trong đợt ATC phiên đáo hạn 21/05/2020',
      en: 'the P&L of one VN30F2005 short sold in the ATC auction of the 2020-05-21 expiry session',
    },
    gan: [
      {
        kyHieu: 'P_{mo}',
        moTa: {
          vi: 'là giá khớp đợt ATC phiên 21/05/2020, mức giá bên Short bán ra: 864 điểm',
          en: 'is the ATC auction price of the 2020-05-21 session, the price the short side sold at: 864 points',
        },
      },
      {
        kyHieu: 'P_{dong}',
        moTa: {
          vi: 'là giá thanh toán cuối cùng của VN30F2005, bằng chỉ số VN30 đóng cửa cùng phiên: 815,55 điểm',
          en: 'is the final settlement price of VN30F2005, equal to the VN30 close of the same session: 815.55 points',
        },
      },
      {
        kyHieu: 'm',
        moTa: {
          vi: 'là hệ số nhân của hợp đồng VN30F: 100.000 ₫ mỗi điểm',
          en: 'is the VN30F contract multiplier: 100000 ₫ per point',
        },
      },
      {
        kyHieu: 'N',
        moTa: {
          vi: 'là số hợp đồng đang giữ: 1 hợp đồng',
          en: 'is the number of contracts held: 1 contract',
        },
      },
    ],
    thaySo: {
      vi: '(864 − 815,55) × 100.000 × 1',
      en: '(864 − 815.55) × 100000 × 1',
    },
    nguon: [
      {
        url: 'https://vnexpress.net/phien-giao-dich-bat-thuong-cua-chung-khoan-phai-sinh-4103230.html',
        nhan: {
          vi: 'Giá khớp 864 điểm và giá thanh toán 815,55 điểm của VN30F2005 (VnExpress)',
          en: 'VN30F2005 traded at 864 points and settled at 815.55 points (VnExpress)',
        },
      },
      {
        url: 'https://www.tinnhanhchungkhoan.vn/chay-tai-khoan-trong-phien-dao-han-chung-khoan-phai-sinh-post240896.html',
        nhan: {
          vi: 'Giá đóng cửa 864 điểm so với VN30 815,55 điểm (Tin nhanh Chứng khoán)',
          en: 'Close of 864 points against the VN30 at 815.55 points (Tin nhanh Chung khoan)',
        },
      },
    ],
  },
  'so-hop-dong-toi-da': {
    tinh: {
      vi: 'số hợp đồng VN30F1M tối đa mà tài khoản 200 triệu ₫ mở được theo giá phiên 14/09/2026',
      en: 'the most VN30F1M contracts a 200 million ₫ account can open at the 2026-09-14 price',
    },
    gan: [
      {
        kyHieu: 'V',
        moTa: {
          vi: 'là vốn ký quỹ đã nộp vào tài khoản phái sinh: 200.000.000 ₫',
          en: 'is the margin capital deposited in the derivatives account: 200000000 ₫',
        },
      },
      {
        kyHieu: 'F',
        moTa: {
          vi: 'là giá đóng cửa VN30F1M phiên 14/09/2026: 1.930,9 điểm',
          en: 'is the VN30F1M close of the 2026-09-14 session: 1930.9 points',
        },
      },
      {
        kyHieu: 'm',
        moTa: {
          vi: 'là hệ số nhân của hợp đồng VN30F: 100.000 ₫ mỗi điểm',
          en: 'is the VN30F contract multiplier: 100000 ₫ per point',
        },
      },
      {
        kyHieu: 'k',
        moTa: {
          vi: 'là tỷ lệ ký quỹ ban đầu VSDC áp cho hợp đồng VN30 đang giao dịch ở phiên 14/09/2026: 17%',
          en: 'is the initial margin ratio VSDC applies to the VN30 contract trading on the 2026-09-14 session: 17%',
        },
      },
    ],
    thaySo: {
      vi: '⌊200.000.000 ÷ (1.930,9 × 100.000 × 17 ÷ 100)⌋',
      en: '⌊200000000 ÷ (1930.9 × 100000 × 17 ÷ 100)⌋',
    },
    nguon: [
      {
        url: 'https://vsdc.vn/vi/ad/199445',
        nhan: {
          vi: 'Tỷ lệ ký quỹ ban đầu 17%, thông báo của VSDC hiệu lực 21/08/2026 (con số nằm trong file đính kèm)',
          en: 'The 17% initial margin ratio, VSDC notice effective 2026-08-21 (the figure is in the attached file)',
        },
      },
      {
        url: 'https://vietstock.vn/2026/09/chung-khoan-phai-sinh-ngay-15092026-tinh-hinh-tiep-tuc-chuyen-bien-xau-1636-1492026.htm',
        nhan: {
          vi: 'Giá VN30F1M đóng cửa phiên 14/09/2026 (Vietstock)',
          en: 'VN30F1M close, 2026-09-14 session (Vietstock)',
        },
      },
    ],
  },
  'co-vi-the-phai-sinh': {
    tinh: {
      vi: 'số hợp đồng VN30F1M được mở cho một lệnh khi tài khoản 500 triệu ₫ chỉ chấp nhận mất 2% vốn',
      en: 'how many VN30F1M contracts one trade may open when a 500 million ₫ account risks only 2% of its capital',
    },
    gan: [
      {
        kyHieu: 'V',
        moTa: {
          vi: 'là vốn tài khoản phái sinh: 500.000.000 ₫',
          en: 'is the derivatives account capital: 500000000 ₫',
        },
      },
      {
        kyHieu: 'r',
        moTa: {
          vi: 'là phần vốn chấp nhận mất nếu lệnh chạm cắt lỗ: 2%',
          en: 'is the share of capital accepted as the loss if the stop is hit: 2%',
        },
      },
      {
        kyHieu: '\\Delta P',
        moTa: {
          vi: 'là khoảng cắt lỗ đặt cho lệnh, chọn theo biên độ dao động ngày của VN30 tháng 9/2026: 15 điểm',
          en: 'is the stop distance set for the trade, chosen from the VN30 daily trading range in September 2026: 15 points',
        },
      },
      {
        kyHieu: 'm',
        moTa: {
          vi: 'là hệ số nhân của hợp đồng VN30F: 100.000 ₫ mỗi điểm',
          en: 'is the VN30F contract multiplier: 100000 ₫ per point',
        },
      },
    ],
    thaySo: {
      vi: '⌊500.000.000 × 2 ÷ 100 ÷ (15 × 100.000)⌋',
      en: '⌊500000000 × 2 ÷ 100 ÷ (15 × 100000)⌋',
    },
    nguon: [
      {
        url: 'https://www.mbs.com.vn/media/dybnmrbc/quy-dinh-giao-dich-hdtl-csvn30.pdf',
        nhan: {
          vi: 'Hệ số nhân hợp đồng 100.000 ₫ mỗi điểm (quy định giao dịch HĐTL VN30 của MBS)',
          en: "The 100000 ₫ per point contract multiplier (MBS's VN30 futures trading rules)",
        },
      },
    ],
  },
  'don-bay-hieu-dung': {
    tinh: {
      vi: 'đòn bẩy hiệu dụng của sáu hợp đồng VN30F1M giá phiên 14/09/2026 trên vốn thực có 200 triệu ₫',
      en: 'the effective leverage of six VN30F1M contracts at the 2026-09-14 price against 200 million ₫ of equity',
    },
    gan: [
      {
        kyHieu: 'F',
        moTa: {
          vi: 'là giá đóng cửa VN30F1M phiên 14/09/2026: 1.930,9 điểm',
          en: 'is the VN30F1M close of the 2026-09-14 session: 1930.9 points',
        },
      },
      {
        kyHieu: 'm',
        moTa: {
          vi: 'là hệ số nhân của hợp đồng VN30F: 100.000 ₫ mỗi điểm',
          en: 'is the VN30F contract multiplier: 100000 ₫ per point',
        },
      },
      {
        kyHieu: 'N',
        moTa: {
          vi: 'là số hợp đồng đang giữ: 6 hợp đồng',
          en: 'is the number of contracts held: 6 contracts',
        },
      },
      {
        kyHieu: 'E',
        moTa: {
          vi: 'là vốn thực có trong tài khoản: 200.000.000 ₫',
          en: 'is the equity actually in the account: 200000000 ₫',
        },
      },
    ],
    thaySo: {
      vi: '1.930,9 × 100.000 × 6 ÷ 200.000.000',
      en: '1930.9 × 100000 × 6 ÷ 200000000',
    },
    nguon: [
      {
        url: 'https://www.mbs.com.vn/media/dybnmrbc/quy-dinh-giao-dich-hdtl-csvn30.pdf',
        nhan: {
          vi: 'Hệ số nhân hợp đồng 100.000 ₫ mỗi điểm (quy định giao dịch HĐTL VN30 của MBS)',
          en: "The 100000 ₫ per point contract multiplier (MBS's VN30 futures trading rules)",
        },
      },
      {
        url: 'https://vietstock.vn/2026/09/chung-khoan-phai-sinh-ngay-15092026-tinh-hinh-tiep-tuc-chuyen-bien-xau-1636-1492026.htm',
        nhan: {
          vi: 'Giá VN30F1M đóng cửa phiên 14/09/2026 (Vietstock)',
          en: 'VN30F1M close, 2026-09-14 session (Vietstock)',
        },
      },
    ],
  },
  'tra-gop-nien-kim': {
    tinh: {
      vi: 'khoản trả mỗi tháng của khoản vay mua nhà 3 tỷ ₫ theo niên kim',
      en: 'the monthly annuity payment on the 3 billion ₫ home loan',
    },
    gan: [
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là số tiền vay mua nhà: 3.000.000.000 ₫',
          en: 'is the home loan amount: 3000000000 ₫',
        },
      },
      {
        kyHieu: 'i',
        moTa: {
          vi: 'là lãi suất mỗi tháng, bằng 8%/năm chia cho 12 tháng',
          en: 'is the monthly rate, the 8% annual rate divided by 12 months',
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là số kỳ trả hằng tháng trong 20 năm: 240 kỳ',
          en: 'is the number of monthly payments over 20 years: 240 payments',
        },
      },
    ],
    thaySo: {
      vi: '3.000.000.000 × 8 ÷ 100 ÷ 12 × (1 + 8 ÷ 100 ÷ 12)^240 ÷ ((1 + 8 ÷ 100 ÷ 12)^240 − 1)',
      en: '3000000000 × 8 ÷ 100 ÷ 12 × (1 + 8 ÷ 100 ÷ 12)^240 ÷ ((1 + 8 ÷ 100 ÷ 12)^240 − 1)',
    },
    nguon: [
      {
        url: 'https://vietnamfinance.vn/moi-thang-tra-them-chuc-trieu-nguoi-vay-mua-nha-chat-vat-xoay-xo-d142201.html',
        nhan: {
          vi: 'Khoản vay 3 tỷ đồng, 20 năm, lãi cố định 8%/năm trong 24 tháng đầu, trả khoảng 28 triệu đồng mỗi tháng (VietnamFinance)',
          en: 'A 3 billion VND loan over 20 years, fixed at 8% a year for the first 24 months, about 28 million VND a month (VietnamFinance)',
        },
      },
    ],
  },
  'tra-gop-goc-deu': {
    tinh: {
      vi: 'khoản trả kỳ đầu của khoản vay mua nhà 3 tỷ ₫ khi trả gốc đều',
      en: 'the first payment on the 3 billion ₫ home loan repaid in equal principal',
    },
    gan: [
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là số tiền vay mua nhà: 3.000.000.000 ₫',
          en: 'is the home loan amount: 3000000000 ₫',
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là số kỳ trả hằng tháng trong 20 năm: 240 kỳ',
          en: 'is the number of monthly payments over 20 years: 240 payments',
        },
      },
      {
        kyHieu: 'i',
        moTa: {
          vi: 'là lãi suất mỗi tháng, bằng 8%/năm chia cho 12 tháng',
          en: 'is the monthly rate, the 8% annual rate divided by 12 months',
        },
      },
    ],
    thaySo: {
      vi: '3.000.000.000 ÷ 240 + 3.000.000.000 × 8 ÷ 100 ÷ 12',
      en: '3000000000 ÷ 240 + 3000000000 × 8 ÷ 100 ÷ 12',
    },
    nguon: [
      {
        url: 'https://vietnamfinance.vn/moi-thang-tra-them-chuc-trieu-nguoi-vay-mua-nha-chat-vat-xoay-xo-d142201.html',
        nhan: {
          vi: 'Khoản vay 3 tỷ đồng, 20 năm, lãi cố định 8%/năm trong 24 tháng đầu (VietnamFinance)',
          en: 'A 3 billion VND loan over 20 years, fixed at 8% a year for the first 24 months (VietnamFinance)',
        },
      },
    ],
  },
  'lich-tra-no': {
    tinh: {
      vi: 'tổng tiền lãi cả 20 năm của khoản vay mua nhà 3 tỷ ₫, lãi 8%/năm, trả niên kim',
      en: 'the total interest over 20 years on a 3 billion ₫ home loan at 8% a year, repaid as an annuity',
    },
    gan: [
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là 240 tháng trả của kỳ hạn 20 năm',
          en: 'is the 240 monthly payments of the 20-year term',
        },
      },
      {
        kyHieu: 'L_k',
        moTa: {
          vi: 'là tiền lãi của tháng thứ k, tức phần không đi vào gốc của khoản trả đều 25.093.202,07 ₫ mỗi tháng tính theo lãi 8%/năm; cộng lãi cả 240 tháng thì bằng tổng tiền đã trả trừ 3.000.000.000 ₫ tiền gốc đã vay',
          en: 'is the interest in month k, the part of the level 25093202.07 ₫ monthly payment, priced at 8% a year, that does not go to principal; over all 240 months it adds up to the total repaid minus the 3000000000 ₫ borrowed',
        },
      },
    ],
    thaySo: {
      vi: '240 × 25.093.202,07 − 3.000.000.000',
      en: '240 × 25093202.07 − 3000000000',
    },
    nguon: [
      {
        url: 'https://vietnamfinance.vn/moi-thang-tra-them-chuc-trieu-nguoi-vay-mua-nha-chat-vat-xoay-xo-d142201.html',
        nhan: {
          vi: 'Khoản vay 3 tỷ đồng trong 20 năm, lãi cố định 8%/năm trong 24 tháng đầu',
          en: 'A 3 billion đồng loan over 20 years, fixed at 8% a year for the first 24 months',
        },
      },
    ],
  },
  'lai-kep': {
    tinh: {
      vi: 'số tiền cuối năm khi gửi 1 tỷ ₫ kỳ hạn 6 tháng lãi 8,1%/năm rồi tái tục thêm một kỳ',
      en: 'the balance after one year from depositing 1 billion ₫ on a 6-month term at 8.1% a year and rolling it over once',
    },
    gan: [
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là số tiền gửi tiết kiệm tại Cake by VPBank: 1.000.000.000 ₫',
          en: 'is the savings deposit placed with Cake by VPBank: 1000000000 ₫',
        },
      },
      {
        kyHieu: 'r',
        moTa: {
          vi: 'là lãi suất kỳ hạn 6 tháng của sổ ấy: 8,1%/năm',
          en: "is that deposit's 6-month term rate: 8.1% a year",
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là 2 lần nhập lãi mỗi năm, vì mỗi kỳ hạn dài 6 tháng',
          en: 'is 2 compounding events a year, since each term lasts 6 months',
        },
      },
      {
        kyHieu: 't',
        moTa: {
          vi: 'là 1 năm gửi, gồm kỳ đầu và kỳ tái tục',
          en: 'is 1 year on deposit, the first term plus the rollover',
        },
      },
    ],
    thaySo: {
      vi: '1.000.000.000 × (1 + 8,1 ÷ 100 ÷ 2)^(2 × 1)',
      en: '1000000000 × (1 + 8.1 ÷ 100 ÷ 2)^(2 × 1)',
    },
    nguon: [
      {
        url: 'https://voz.vn/t/cap-nhat-lai-suat-tiet-kiem-cac-ngan-hang-nam-2026.1193202/',
        nhan: {
          vi: 'Gửi 1 tỉ kỳ hạn 6 tháng lãi 8.1% tại Cake by VPBank, VOZ',
          en: '1 billion deposited for 6 months at 8.1% with Cake by VPBank, VOZ',
        },
      },
    ],
  },
  'lai-tien-gui': {
    tinh: {
      vi: 'tiền lãi khi hết kỳ hạn của sổ tiết kiệm 1 tỷ ₫ kỳ hạn 6 tháng, lãi 8,1%/năm',
      en: 'the interest at maturity on a 1 billion ₫ 6-month term deposit at 8.1% a year',
    },
    gan: [
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là số tiền gửi tại Cake by VPBank: 1.000.000.000 ₫',
          en: 'is the amount deposited with Cake by VPBank: 1000000000 ₫',
        },
      },
      {
        kyHieu: 'r',
        moTa: {
          vi: 'là lãi suất kỳ hạn 6 tháng tại Cake by VPBank năm 2026: 8,1%/năm',
          en: "is Cake by VPBank's 6-month term rate in 2026: 8.1% a year",
        },
      },
      {
        kyHieu: 'T',
        moTa: {
          vi: 'là kỳ hạn của sổ: 6 tháng',
          en: "is the deposit's term: 6 months",
        },
      },
    ],
    thaySo: {
      vi: '1.000.000.000 × 8,1 ÷ 100 ÷ 12 × 6',
      en: '1000000000 × 8.1 ÷ 100 ÷ 12 × 6',
    },
    nguon: [
      {
        url: 'https://voz.vn/t/cap-nhat-lai-suat-tiet-kiem-cac-ngan-hang-nam-2026.1193202/',
        nhan: {
          vi: 'Gửi 1 tỉ kỳ hạn 6 tháng lãi 8.1% tại Cake by VPBank, VOZ',
          en: '1 billion deposited for 6 months at 8.1% with Cake by VPBank, VOZ',
        },
      },
    ],
  },
  'tiet-kiem-muc-tieu': {
    tinh: {
      vi: 'khoản gửi đều mỗi tháng để có 1 tỷ ₫ sau 48 tháng với lãi 6,8%/năm',
      en: 'the level monthly deposit needed to reach 1 billion ₫ in 48 months at 6.8% a year',
    },
    gan: [
      {
        kyHieu: 'FV',
        moTa: {
          vi: 'là số tiền vợ chồng trẻ muốn có khi hết 48 tháng: 1.000.000.000 ₫',
          en: 'is what the young couple want to have after 48 months: 1000000000 ₫',
        },
      },
      {
        kyHieu: 'i',
        moTa: {
          vi: 'là lãi suất một tháng: lãi suất tiết kiệm trực tuyến kỳ hạn 12 tháng nhóm Big4 tháng 9/2026 là 6,8%/năm, chia cho 12 tháng',
          en: "is the monthly rate: the Big4 banks' online 12-month deposit rate in September 2026, 6.8% a year, divided by 12 months",
        },
      },
      {
        kyHieu: 'n',
        moTa: {
          vi: 'là 48 tháng, mỗi tháng gửi vào một khoản',
          en: 'is 48 months, with one deposit each month',
        },
      },
    ],
    thaySo: {
      vi: '1.000.000.000 × (6,8 ÷ 100 ÷ 12) ÷ ((1 + 6,8 ÷ 100 ÷ 12)^48 − 1)',
      en: '1000000000 × (6.8 ÷ 100 ÷ 12) ÷ ((1 + 6.8 ÷ 100 ÷ 12)^48 − 1)',
    },
    nguon: [
      {
        url: 'https://vietnamnet.vn/lai-suat-ngan-hang-hom-nay-9-9-2026-lai-suat-ngan-hang-big4-len-den-8-nam-2553329.html',
        nhan: {
          vi: 'Lãi suất tiết kiệm nhóm Big4 ngày 9/9/2026, VietNamNet',
          en: 'Big4 deposit rates on 2026-09-09, VietNamNet',
        },
      },
    ],
  },
  'rut-truoc-han': {
    tinh: {
      vi: 'tiền lãi thực nhận khi rút sổ 1 tỷ ₫ kỳ hạn 6 tháng sau 3 tháng',
      en: 'the interest actually received when a 1 billion ₫ 6-month deposit is withdrawn after 3 months',
    },
    gan: [
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là số tiền trên sổ kỳ hạn 6 tháng lãi 8,1%/năm: 1.000.000.000 ₫',
          en: 'is the balance of the 6-month deposit at 8.1% a year: 1000000000 ₫',
        },
      },
      {
        kyHieu: 'r_{kkh}',
        moTa: {
          vi: 'là lãi suất không kỳ hạn niêm yết năm 2026, áp cho cả sổ vì rút toàn bộ trước hạn: 0,1%/năm',
          en: 'is the demand deposit rate listed in 2026, applied to the whole deposit because all of it is withdrawn early: 0.1% a year',
        },
      },
      {
        kyHieu: 't',
        moTa: {
          vi: 'là 3 tháng đã gửi tính tới ngày rút',
          en: 'is the 3 months on deposit up to the withdrawal date',
        },
      },
    ],
    thaySo: {
      vi: '1.000.000.000 × 0,1 ÷ 100 × 3 ÷ 12',
      en: '1000000000 × 0.1 ÷ 100 × 3 ÷ 12',
    },
    nguon: [
      {
        url: 'https://baochinhphu.vn/quy-dinh-moi-ve-lai-suat-rut-truoc-han-tien-gui-10222062114522068.htm',
        nhan: {
          vi: 'Thông tư 04/2022/TT-NHNN: rút trước hạn toàn bộ thì áp lãi suất không kỳ hạn thấp nhất',
          en: 'Circular 04/2022/TT-NHNN: a full early withdrawal earns at most the lowest demand deposit rate',
        },
      },
      {
        url: 'https://cafef.vn/lai-suat-ngan-hang-vietcombank-moi-nhat-thang-5-2026-ky-han-nao-co-lai-suat-cao-nhat-188260503085728523.chn',
        nhan: {
          vi: 'Lãi suất không kỳ hạn 0,1%/năm niêm yết tại Vietcombank, CafeF 03/05/2026',
          en: 'The 0.1% a year demand deposit rate listed at Vietcombank, CafeF, 2026-05-03',
        },
      },
    ],
  },
  'gui-quay-vong': {
    tinh: {
      vi: 'chênh lệch tiền cuối kỳ giữa quay vòng hai sổ 6 tháng và gửi một sổ 12 tháng cho 1 tỷ ₫',
      en: 'the end-of-period gap between rolling two 6-month deposits and one 12-month deposit on 1 billion ₫',
    },
    gan: [
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là số tiền gửi ban đầu, như nhau ở cả hai cách: 1.000.000.000 ₫',
          en: 'is the initial deposit, the same under both choices: 1000000000 ₫',
        },
      },
      {
        kyHieu: 'r_n',
        moTa: {
          vi: 'là lãi suất kỳ hạn 6 tháng nhóm Big4 tháng 9/2026: 6,6%/năm',
          en: "is the Big4 banks' 6-month rate in September 2026: 6.6% a year",
        },
      },
      {
        kyHieu: 'm',
        moTa: {
          vi: 'là kỳ hạn của sổ ngắn: 6 tháng',
          en: "is the short deposit's term: 6 months",
        },
      },
      {
        kyHieu: 'k',
        moTa: {
          vi: 'là 2 vòng sổ 6 tháng trong 12 tháng, gốc lẫn lãi vòng đầu gửi tiếp sang vòng sau',
          en: "is the 2 rounds of 6-month deposits in 12 months, the first round's principal and interest rolled into the second",
        },
      },
      {
        kyHieu: 'r_d',
        moTa: {
          vi: 'là lãi suất kỳ hạn 12 tháng nhóm Big4 tháng 9/2026: 6,8%/năm',
          en: "is the Big4 banks' 12-month rate in September 2026: 6.8% a year",
        },
      },
      {
        kyHieu: 'T',
        moTa: {
          vi: 'là kỳ hạn của sổ dài, cũng là cả thời gian so sánh: 12 tháng',
          en: "is the long deposit's term, which is also the whole comparison period: 12 months",
        },
      },
    ],
    thaySo: {
      vi: '1.000.000.000 × (1 + 6,6 ÷ 100 × 6 ÷ 12)^2 − 1.000.000.000 × (1 + 6,8 ÷ 100 × 12 ÷ 12)',
      en: '1000000000 × (1 + 6.6 ÷ 100 × 6 ÷ 12)^2 − 1000000000 × (1 + 6.8 ÷ 100 × 12 ÷ 12)',
    },
    nguon: [
      {
        url: 'https://vietnamnet.vn/lai-suat-ngan-hang-hom-nay-9-9-2026-lai-suat-ngan-hang-big4-len-den-8-nam-2553329.html',
        nhan: {
          vi: 'Lãi suất tiết kiệm nhóm Big4 ngày 9/9/2026, VietNamNet',
          en: 'Big4 deposit rates on 2026-09-09, VietNamNet',
        },
      },
    ],
  },
  'gia-von-trung-binh-dca': {
    tinh: {
      vi: 'giá vốn trung bình một cổ phiếu FPT sau ba đợt mua 10 triệu ₫ từ 15/07 đến 21/08/2026',
      en: 'the average cost per FPT share after three 10 million ₫ purchases from 2026-07-15 to 2026-08-21',
    },
    gan: [
      {
        kyHieu: 'C_i',
        moTa: {
          vi: 'là số tiền bỏ ra mỗi đợt: cả ba đợt đều là 10.000.000 ₫',
          en: 'is the money spent in each round: 10000000 ₫ in all three',
        },
      },
      {
        kyHieu: 'P_i',
        moTa: {
          vi: 'là giá đóng cửa FPT ở phiên mua của từng đợt: 66.800 ₫ phiên 15/07/2026, 62.900 ₫ phiên 24/07/2026 và 72.000 ₫ phiên 21/08/2026',
          en: "is FPT's close on each round's purchase session: 66800 ₫ on 2026-07-15, 62900 ₫ on 2026-07-24 and 72000 ₫ on 2026-08-21",
        },
      },
    ],
    thaySo: {
      vi: '(10.000.000 + 10.000.000 + 10.000.000) ÷ (10.000.000 ÷ 66.800 + 10.000.000 ÷ 62.900 + 10.000.000 ÷ 72.000)',
      en: '(10000000 + 10000000 + 10000000) ÷ (10000000 ÷ 66800 + 10000000 ÷ 62900 + 10000000 ÷ 72000)',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/15/2026&EndDate=07/15/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 15/07/2026',
          en: 'FPT price, 2026-07-15 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=07/24/2026&EndDate=07/24/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 24/07/2026',
          en: 'FPT price, 2026-07-24 session',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=08/21/2026&EndDate=08/21/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 21/08/2026',
          en: 'FPT price, 2026-08-21 session',
        },
      },
    ],
  },
  'so-ky-dca': {
    tinh: {
      vi: 'số tháng góp 10 triệu ₫ vào quỹ mở để có 500 triệu ₫ với lợi suất kỳ vọng 6,8%/năm',
      en: 'the months of 10 million ₫ contributions to an open-end fund needed to reach 500 million ₫ at an expected 6.8% a year',
    },
    gan: [
      {
        kyHieu: 'FV',
        moTa: {
          vi: 'là số tiền muốn có trong quỹ mở: 500.000.000 ₫',
          en: 'is the amount wanted in the open-end fund: 500000000 ₫',
        },
      },
      {
        kyHieu: 'i',
        moTa: {
          vi: 'là lợi suất một tháng: lấy lãi suất tiết kiệm 12 tháng nhóm Big4 tháng 9/2026 là 6,8%/năm làm mức kỳ vọng thận trọng, rồi chia cho 12 tháng',
          en: "is the monthly return: the Big4 banks' 12-month deposit rate in September 2026, 6.8% a year, taken as a cautious expectation and divided by 12 months",
        },
      },
      {
        kyHieu: 'C',
        moTa: {
          vi: 'là khoản góp vào cuối mỗi tháng: 10.000.000 ₫',
          en: 'is the contribution made at the end of each month: 10000000 ₫',
        },
      },
    ],
    thaySo: {
      vi: '⌈ln(1 + 500.000.000 × (6,8 ÷ 100 ÷ 12) ÷ 10.000.000) ÷ ln(1 + 6,8 ÷ 100 ÷ 12)⌉',
      en: '⌈ln(1 + 500000000 × (6.8 ÷ 100 ÷ 12) ÷ 10000000) ÷ ln(1 + 6.8 ÷ 100 ÷ 12)⌉',
    },
    nguon: [
      {
        url: 'https://vietnamnet.vn/lai-suat-ngan-hang-hom-nay-9-9-2026-lai-suat-ngan-hang-big4-len-den-8-nam-2553329.html',
        nhan: {
          vi: 'Lãi suất tiết kiệm nhóm Big4 ngày 9/9/2026, VietNamNet',
          en: 'Big4 deposit rates on 2026-09-09, VietNamNet',
        },
      },
    ],
  },
  'thue-tncn-dau-tu': {
    tinh: {
      vi: 'tổng thuế thu nhập cá nhân trên 1.000 cổ phiếu FPT nhận cổ tức đợt 02/12/2025 rồi bán ở giá 72.700 ₫',
      en: 'the total personal income tax on 1000 FPT shares that collect the 2025-12-02 dividend and are then sold at 72700 ₫',
    },
    gan: [
      {
        kyHieu: 'Q',
        moTa: {
          vi: 'là số cổ phiếu FPT đã nhận cổ tức rồi bán ra: 1.000 CP',
          en: 'is the number of FPT shares that collected the dividend and were then sold: 1000 shares',
        },
      },
      {
        kyHieu: 'P_{ban}',
        moTa: {
          vi: 'là giá bán, lấy giá đóng cửa FPT phiên 11/09/2026: 72.700 ₫',
          en: "is the sell price, taken as FPT's close on the 2026-09-11 session: 72700 ₫",
        },
      },
      {
        kyHieu: 'r_{cn}',
        moTa: {
          vi: 'là thuế suất chuyển nhượng chứng khoán theo Luật Thuế TNCN 109/2025/QH15, hiệu lực 01/07/2026: 0,1% trên giá bán',
          en: 'is the securities transfer tax rate under Personal Income Tax Law 109/2025/QH15, in force from 2026-07-01: 0.1% of the sale price',
        },
      },
      {
        kyHieu: 'D',
        moTa: {
          vi: 'là cổ tức tiền mặt FPT đợt chốt quyền 02/12/2025: 1.000 ₫ một cổ phiếu',
          en: "is FPT's cash dividend with the 2025-12-02 record date: 1000 ₫ a share",
        },
      },
      {
        kyHieu: 'r_{ct}',
        moTa: {
          vi: 'là thuế suất trên cổ tức tiền mặt: 5%',
          en: 'is the tax rate on cash dividends: 5%',
        },
      },
    ],
    thaySo: {
      vi: '1.000 × 72.700 × 0,1 ÷ 100 + 1.000 × 1.000 × 5 ÷ 100',
      en: '1000 × 72700 × 0.1 ÷ 100 + 1000 × 1000 × 5 ÷ 100',
    },
    nguon: [
      {
        url: 'https://congbaocdn.chinhphu.vn/180507251028987904/2026/1/24/109signed-17692403594311667615452.pdf',
        nhan: {
          vi: 'Luật Thuế thu nhập cá nhân 109/2025/QH15, bản đăng Công báo: Điều 12 thuế suất 5%, Điều 13 khoản 2 thuế suất 0,1%, hiệu lực 01/07/2026',
          en: 'Personal Income Tax Law 109/2025/QH15, Official Gazette copy: Article 12 at 5%, Article 13 clause 2 at 0.1%, in force from 2026-07-01',
        },
      },
      {
        url: 'https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=FPT&StartDate=09/11/2026&EndDate=09/11/2026&PageIndex=1&PageSize=20',
        nhan: {
          vi: 'Giá FPT phiên 11/09/2026',
          en: 'FPT price, 2026-09-11 session',
        },
      },
      {
        url: 'https://cotuc.vn/co-phieu/fpt',
        nhan: {
          vi: 'Cổ tức tiền mặt FPT đợt 02/12/2025, cotuc.vn',
          en: 'FPT cash dividend of 2025-12-02, cotuc.vn',
        },
      },
    ],
  },
  'diem-hoa-von': {
    tinh: {
      vi: 'sản lượng hoà vốn quý 2/2026 của FPT, mỗi sản phẩm là 1 triệu ₫ doanh thu',
      en: "FPT's Q2/2026 break-even volume, one product being 1 million ₫ of revenue",
    },
    gan: [
      {
        kyHieu: 'FC',
        moTa: {
          vi: 'là định phí của FPT quý 2/2026, tức chi phí bán hàng cộng chi phí quản lý doanh nghiệp: 2.431.800.000.000 ₫',
          en: "is FPT's fixed cost for Q2/2026, its selling expenses plus general and administrative expenses: 2431800000000 ₫",
        },
      },
      {
        kyHieu: 'P',
        moTa: {
          vi: 'là giá bán một sản phẩm, theo quy ước một sản phẩm là 1.000.000 ₫ doanh thu',
          en: 'is the price of one product, one product being 1000000 ₫ of revenue by convention',
        },
      },
      {
        kyHieu: 'VC',
        moTa: {
          vi: 'là biến phí một sản phẩm: giá vốn hàng bán quý 2/2026 tính trên mỗi 1.000.000 ₫ doanh thu thuần, bằng 689.600 ₫',
          en: 'is the variable cost of one product: Q2/2026 cost of goods sold per 1000000 ₫ of net revenue, which is 689600 ₫',
        },
      },
    ],
    thaySo: {
      vi: '2.431.800.000.000 ÷ (1.000.000 − 689.600)',
      en: '2431800000000 ÷ (1000000 − 689600)',
    },
    nguon: [
      {
        url: 'https://cafef.vn/du-lieu/bao-cao-tai-chinh/fpt/incsta/2026/2/0/0/ket-qua-hoat-dong-kinh-doanh-cong-ty-co-phan-fpt.chn',
        nhan: {
          vi: 'Kết quả kinh doanh FPT quý 2/2026: doanh thu thuần, giá vốn, chi phí bán hàng và quản lý, CafeF',
          en: 'FPT Q2/2026 income statement: net revenue, cost of goods sold, selling and administrative expenses, CafeF',
        },
      },
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/income-statement/?p=quarterly',
        nhan: {
          vi: 'Doanh thu, giá vốn và tổng chi phí bán hàng cộng quản lý (SG&A) FPT theo quý, đơn vị triệu ₫, stockanalysis',
          en: 'FPT revenue, cost of revenue and SG&A by quarter, in millions of ₫, stockanalysis',
        },
      },
    ],
  },
  'don-bay-tong-hop': {
    tinh: {
      vi: 'đòn bẩy tổng hợp của FPT quý 2/2026',
      en: "FPT's degree of total leverage for Q2/2026",
    },
    gan: [
      {
        kyHieu: 'DT',
        moTa: {
          vi: 'là doanh thu thuần quý 2/2026 của FPT: 13.788,5 tỷ ₫',
          en: "is FPT's net revenue for Q2/2026: 13788.5 billion ₫",
        },
      },
      {
        kyHieu: 'BP',
        moTa: {
          vi: 'là giá vốn hàng bán quý 2/2026 của FPT, dùng làm tổng biến phí: 9.508,8 tỷ ₫',
          en: "is FPT's cost of goods sold for Q2/2026, taken as total variable cost: 9508.8 billion ₫",
        },
      },
      {
        kyHieu: 'EBIT',
        moTa: {
          vi: 'là lợi nhuận trước lãi vay và thuế quý 2/2026 của FPT, bằng doanh thu trừ biến phí rồi trừ định phí hoạt động 2.431,8 tỷ ₫, tức chi phí bán hàng cộng chi phí quản lý doanh nghiệp',
          en: "is FPT's earnings before interest and tax for Q2/2026: revenue minus variable cost, then minus 2431.8 billion ₫ of operating fixed cost, which is selling plus general and administrative expenses",
        },
      },
      {
        kyHieu: 'I',
        moTa: {
          vi: 'là chi phí lãi vay quý 2/2026 của FPT: 212,6 tỷ ₫',
          en: "is FPT's interest expense for Q2/2026: 212.6 billion ₫",
        },
      },
    ],
    thaySo: {
      vi: '(13.788,5 − 9.508,8) ÷ (13.788,5 − 9.508,8 − 2.431,8 − 212,6)',
      en: '(13788.5 − 9508.8) ÷ (13788.5 − 9508.8 − 2431.8 − 212.6)',
    },
    nguon: [
      {
        url: 'https://stockanalysis.com/quote/hose/FPT/financials/income-statement/?p=quarterly',
        nhan: {
          vi: 'Doanh thu thuần và chi phí lãi vay của FPT, cột Q2 2026, đơn vị triệu ₫',
          en: 'FPT revenue and interest expense, Q2 2026 column, in million ₫',
        },
      },
    ],
  },
};
