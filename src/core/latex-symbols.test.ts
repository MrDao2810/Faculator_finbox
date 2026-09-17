import { describe, expect, it } from 'vitest';

import { latexSymbolTokens } from './latex-symbols';

/*
 * Mỗi ca là một chuỗi `latex` THẬT của Registry, chọn vì nó chạm một luật khó của bộ tách. Tập token
 * là thứ cửa gác bảng ký hiệu so sánh, nên ca ở đây ghim đúng những gì cửa gác sẽ đòi tác giả viết.
 */
describe('latexSymbolTokens — tách ký hiệu có nghĩa khỏi hình công thức', () => {
  it('tên đơn, phân số, nhân: mỗi chữ một token', () => {
    expect(latexSymbolTokens('P/E = \\frac{P}{EPS}')).toEqual(['E', 'EPS', 'P']);
  });

  it('chỉ số dưới là TỪ thì cả cụm là một ký hiệu; là chỉ số chạy thì tách chữ cái ra', () => {
    expect(latexSymbolTokens('F_{mua} = Q \\times P_{mua} \\times r_{mua}')).toEqual([
      'F_{mua}',
      'P_{mua}',
      'Q',
      'r_{mua}',
    ]);
    expect(latexSymbolTokens('SMA_{n} = \\frac{1}{n}\\sum_{i=0}^{n-1} P_{t-i}')).toEqual([
      'P',
      'SMA',
      'i',
      'n',
      't',
    ]);
    expect(latexSymbolTokens('L = \\max\\{k : r_{t+1} < 0, \\ldots, r_{t+k} < 0\\}')).toEqual([
      'L',
      'k',
      'r',
      't',
    ]);
  });

  it('chữ Hy Lạp là ký hiệu, lệnh trình bày thì không', () => {
    expect(latexSymbolTokens('r_e = r_f + \\beta \\times ERP')).toEqual([
      'ERP',
      '\\beta',
      'r_{e}',
      'r_{f}',
    ]);
    expect(latexSymbolTokens('FCFF = EBIT \\, (1 - t) + Dep - CapEx - \\Delta NWC')).toEqual([
      'CapEx',
      'Dep',
      'EBIT',
      'FCFF',
      'NWC',
      '\\Delta',
      't',
    ]);
    expect(latexSymbolTokens('\\sigma_{nam} = s_{phien} \\times \\sqrt{D}')).toEqual([
      'D',
      '\\sigma_{nam}',
      's_{phien}',
    ]);
  });

  it('trung bình \\bar{r} là ký hiệu riêng, kèm chữ bên trong', () => {
    // `p` và `f` là NHÃN (danh mục, phi rủi ro), không phải chỉ số chạy: cả cụm là một ký hiệu.
    expect(latexSymbolTokens('S = \\frac{\\bar{r}_p - r_f}{\\sigma_p} \\times \\sqrt{m}')).toEqual([
      'S',
      '\\bar{r}_p',
      '\\sigma_{p}',
      'm',
      'r',
      'r_{f}',
    ]);
    expect(
      latexSymbolTokens('W/L = \\frac{\\overline{r^{+}}}{\\left| \\overline{r^{-}} \\right|}'),
    ).toEqual(['L', 'W', '\\overline{r^{+}}', '\\overline{r^{-}}', 'r']);
  });

  it('\\text: chữ Việt tự giải thích thì bỏ, viết tắt thì giữ', () => {
    expect(
      latexSymbolTokens(
        'EPS = \\frac{\\text{LNST} - \\text{Cổ tức ưu đãi}}{\\text{Số CP lưu hành}}',
      ),
    ).toEqual(['EPS', 'LNST']);
    // `i` là chỉ số chạy (cổ phiếu thứ i), `m` là nhãn (thị trường) → `R_{m}` là ký hiệu riêng.
    expect(latexSymbolTokens('\\beta_i = \\frac{\\text{Cov}(R_i, R_m)}{\\text{Var}(R_m)}')).toEqual(
      ['Cov', 'R', 'R_{m}', 'Var', '\\beta', 'i'],
    );
    expect(latexSymbolTokens('P_{\\text{mục tiêu}} = P/E_{\\text{mục tiêu}} \\times EPS')).toEqual([
      'E',
      'EPS',
      'P',
    ]);
  });

  it('số: 0, 1, 2 không bị đòi; 100, 365, 12, 72, 22,5 thì có', () => {
    expect(
      latexSymbolTokens('r_{nam} = \\left(\\frac{P_{ban}}{P_{mua}}\\right)^{365/d} - 1'),
    ).toEqual(['365', 'P_{ban}', 'P_{mua}', 'd', 'r_{nam}']);
    expect(latexSymbolTokens('\\text{Graham} = \\sqrt{22{,}5 \\times EPS \\times BVPS}')).toEqual([
      '22,5',
      'BVPS',
      'EPS',
      'Graham',
    ]);
    expect(latexSymbolTokens('I = P \\times \\frac{r}{100 \\times 12} \\times T')).toEqual([
      '100',
      '12',
      'I',
      'P',
      'T',
      'r',
    ]);
    expect(latexSymbolTokens('t = \\frac{\\ln 2}{\\ln(1 + r)} \\approx \\frac{72}{r}')).toEqual([
      '72',
      'r',
      't',
    ]);
  });

  it('luỹ thừa và tổng mang chỉ số chạy: chữ trong đó cũng là token', () => {
    expect(latexSymbolTokens('P = C \\cdot \\frac{1 - (1 + IRR)^{-n}}{IRR}')).toEqual([
      'C',
      'IRR',
      'P',
      'n',
    ]);
    expect(latexSymbolTokens('\\sum_{i} \\frac{CF_i}{(1+XIRR)^{d_i / 365}} = 0')).toEqual([
      '365',
      'CF',
      'XIRR',
      'd',
      'i',
    ]);
    expect(
      latexSymbolTokens('MDD = \\max_{t} \\frac{\\max_{s \\le t} P_s - P_t}{\\max_{s \\le t} P_s}'),
    ).toEqual(['MDD', 'P', 's', 't']);
    expect(latexSymbolTokens('VaR_{\\alpha} = -Q_{1-\\alpha}(r)')).toEqual([
      'Q',
      'VaR',
      '\\alpha',
      'r',
    ]);
  });

  it('một mục của bảng đi qua cùng hàm: chép nguyên văn thì token nằm trong tập của hình', () => {
    const hinh = latexSymbolTokens(
      'EMA_t = P_t \\cdot k + EMA_{t-1} \\cdot (1 - k), \\quad k = \\frac{2}{n+1}',
    );
    for (const muc of ['EMA_t', 'P_t', 'k', 'n', 't', 'EMA_{t-1}']) {
      for (const token of latexSymbolTokens(muc)) expect(hinh).toContain(token);
    }
  });
});
