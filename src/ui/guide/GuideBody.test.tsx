// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { BaiHuongDan, HinhDangXem, KhoiBieuDoBai, KhoiLapBai } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { GuideMuc, khoiDangXem } from './GuideBody';

/*
 * Mục "Đọc biểu đồ" trong KHUNG "?" chỉ in hình đang hiện trên màn tính (13/10/2026).
 *
 * `FormulaDetail.test.tsx` đi cả luồng thật (bấm nút Cột, đổi ô chọn rồi mở khung). File này gác
 * riêng phép CHỌN khối — `khoiDangXem()` — ở những ca luồng thật khó dựng: khối Biểu đồ chưa kịp
 * báo, báo một khoá không có khối chữ, xin dạng Cột cho hình không có dạng ấy. Cả ba đều là chỗ
 * khung có thể lặng lẽ nói về một hình khác hoặc để trống.
 *
 * Khối dựng tay chứ không đọc kho chữ thật: phép chọn không phụ thuộc chữ, và kho chữ chỉ được đọc
 * lúc build.
 */

const doan = (chu: string) => ({ vi: chu, en: chu });

const THOI_GIAN: KhoiBieuDoBai = {
  khoa: '__time',
  ten: doan('SMA theo thời gian'),
  duong: doan('Đoạn đường của hình thời gian.'),
  nangCao: false,
  canChuoi: true,
};
const SO_PHIEN: KhoiBieuDoBai = {
  khoa: 'period',
  ten: doan('SMA theo Số phiên'),
  duong: doan('Đoạn đường của hình theo số phiên.'),
  cot: doan('Đoạn cột của hình theo số phiên.'),
  nangCao: false,
  canChuoi: true,
};
const GIA: KhoiBieuDoBai = {
  khoa: 'price',
  ten: doan('P/E theo Giá thị trường'),
  duong: doan('Đoạn đường của hình theo giá.'),
  cot: doan('Đoạn cột của hình theo giá.'),
  nangCao: false,
  canChuoi: false,
};
const BOC_TACH: KhoiBieuDoBai = {
  khoa: '__breakdown',
  ten: doan('EV — bóc tách'),
  thanh: doan('Đoạn của các thanh bóc tách.'),
  nangCao: false,
  canChuoi: false,
};

function hinh(khoa: string | null, dang: HinhDangXem['dang'] = 'duong', daVe = true): HinhDangXem {
  return { khoa, dang, daVe };
}

afterEach(cleanup);

describe('khoiDangXem — khung "?" chọn khối của hình đang hiện', () => {
  it('tra đúng khối theo khoá của mục đang chọn ở ô chọn trục', () => {
    const xem = khoiDangXem([GIA, THOI_GIAN, BOC_TACH], hinh('__time'));

    expect(xem?.khoi).toBe(THOI_GIAN);
    expect(xem?.dang).toBe('duong');
  });

  it('khối Biểu đồ chưa kịp báo thì rơi về khối đầu, tức hình màn mở ra', () => {
    const xem = khoiDangXem([THOI_GIAN, SO_PHIEN], null);

    expect(xem?.khoi).toBe(THOI_GIAN);
    // Chưa biết hình đã vẽ hay chưa thì coi là chưa: thà in dòng điều kiện còn hơn hứa một hình
    // chưa có trên màn.
    expect(xem?.chuaVe).toBe(true);
  });

  it('màn chưa vẽ gì và chưa ai chọn mục nào (khoá null) cũng rơi về khối đầu', () => {
    const xem = khoiDangXem([THOI_GIAN, SO_PHIEN], hinh(null, 'duong', false));

    expect(xem?.khoi).toBe(THOI_GIAN);
    expect(xem?.chuaVe).toBe(true);
  });

  it('một khoá không có khối chữ thì rơi về khối đầu chứ không để khung trống', () => {
    expect(khoiDangXem([GIA, THOI_GIAN], hinh('khong-co'))?.khoi).toBe(GIA);
  });

  it('xin dạng Cột cho hình không có dạng ấy thì in dạng Đường', () => {
    expect(khoiDangXem([THOI_GIAN, SO_PHIEN], hinh('__time', 'cot'))?.dang).toBe('duong');
    expect(khoiDangXem([THOI_GIAN, SO_PHIEN], hinh('period', 'cot'))?.dang).toBe('cot');
  });

  it('không có khối nào thì không có gì để in', () => {
    expect(khoiDangXem([], hinh('price'))).toBeUndefined();
  });

  /*
   * Ô do người dùng THÊM (đợt mua thứ tư trở đi) không có khối riêng, chỉ có khối mẫu mang `{n}`.
   * Thiếu bước dò mẫu thì chọn "Giá mua đợt 4" là khung rơi về khối đầu, tức nói về hình của một ô
   * khác ngay cạnh hình đang vẽ — đúng lỗi "chữ nói khác hình".
   */
  describe('hình của một ô do người dùng thêm', () => {
    const MAU: KhoiLapBai = {
      tienTo: 'price',
      ten: doan('Giá vốn theo Giá mua đợt {n}'),
      duong: doan('Đường theo ô Giá mua đợt {n}.'),
      cot: doan('Cột của đợt mua thứ {n}.'),
      nangCao: false,
    };
    const GIA_DOT_3: KhoiBieuDoBai = {
      ...GIA,
      khoa: 'price3',
      ten: doan('Giá vốn theo Giá mua đợt 3'),
    };

    it('lấy khối mẫu và điền đúng số thứ tự vào tên lẫn đoạn chữ', () => {
      const xem = khoiDangXem([GIA_DOT_3], hinh('price4', 'cot'), [MAU]);
      expect(xem?.khoi.khoa).toBe('price4');
      expect(xem?.khoi.ten.vi).toBe('Giá vốn theo Giá mua đợt 4');
      expect(xem?.khoi.duong?.vi).toBe('Đường theo ô Giá mua đợt 4.');
      expect(xem?.khoi.cot?.en).toBe('Cột của đợt mua thứ 4.');
      expect(xem?.dang).toBe('cot');
      expect(xem?.khoi.canChuoi).toBe(false);
      // Số có hai chữ số cũng điền trọn, không cắt còn "1".
      expect(khoiDangXem([GIA_DOT_3], hinh('price12'), [MAU])?.khoi.ten.vi).toContain('đợt 12');
    });

    it('ô khai sẵn vẫn dùng khối viết riêng của nó, không dùng mẫu', () => {
      expect(khoiDangXem([GIA_DOT_3], hinh('price3'), [MAU])?.khoi).toBe(GIA_DOT_3);
    });

    it('khoá không phải tiền tố cộng một số thì không khớp mẫu', () => {
      for (const khoa of ['price', 'priceX', 'price04', 'amount4']) {
        expect(khoiDangXem([GIA_DOT_3], hinh(khoa), [MAU])?.khoi, khoa).toBe(GIA_DOT_3);
      }
    });
  });
});

/*
 * ── Câu minh hoạ của mục "Lấy số liệu ở đâu" đi theo số trong ô (14/10/2026) ─────────────────
 *
 * Chủ dự án chụp thanh trượt ở 55 phiên ngay dưới khung "?" ghi "60 phiên là khoảng ba tháng": câu
 * viết quanh số MẶC ĐỊNH, ô thì đã đổi. Khung nay điền số đang có trong ô; trang đầy đủ không có ô
 * nào nên điền bằng mặc định. Phép điền gác riêng ở `cho-trong.test.ts`; ở đây gác đường đi: số
 * vào được tới câu, và câu không có chỗ trống thì ra y nguyên.
 */
describe('mục "Lấy số liệu ở đâu": câu minh hoạ đi theo số đang có trong ô', () => {
  const bai = {
    id: 'thu',
    ten: doan('Thử'),
    moTaNgan: doan('Thử'),
    nhomId: 'risk',
    muc: 'basic',
    ketQuaTrong: [],
    rieng: {
      deLamGi: doan('Thử.'),
      docKetQua: doan('Thử.'),
      deSai: doan('Thử.'),
      oNhap: [
        {
          key: 'sessions',
          nhan: doan('Số phiên trong kỳ'),
          layODau: doan('Độ dài kỳ quan sát tính bằng phiên.'),
          luuY: { vi: '{sessions} phiên là khoảng {sessions|thoiGian}.', en: '' },
          nangCao: false,
        },
      ],
    },
    thongSo: { sessions: { macDinh: 60, min: 12, max: 500 } },
    mucCo: ['nhap-so'],
    lienQuan: [],
  } satisfies BaiHuongDan;

  function dung(giaTri?: Record<string, number>) {
    return render(
      <PreferencesProvider>
        {giaTri === undefined ? (
          <GuideMuc bai={bai} muc="nhap-so" />
        ) : (
          <GuideMuc bai={bai} muc="nhap-so" idPrefix="goi-y-" giaTri={giaTri} />
        )}
      </PreferencesProvider>,
    );
  }

  it('trang đầy đủ, không có ô nào để đọc: điền bằng số mặc định', () => {
    dung();
    expect(screen.getByText('60 phiên là khoảng 3 tháng.')).toBeTruthy();
  });

  it('khung "?" điền đúng số đang có trong ô, không phải số mặc định', () => {
    dung({ sessions: 55 });
    expect(screen.getByText('55 phiên là khoảng 2,5 tháng.')).toBeTruthy();
    expect(screen.queryByText(/60 phiên/)).toBeNull();
  });

  it('câu không có chỗ trống thì in y nguyên', () => {
    dung({ sessions: 55 });
    expect(screen.getByText('Độ dài kỳ quan sát tính bằng phiên.')).toBeTruthy();
  });

  it('không có chỗ trống nào còn sót dấu ngoặc lên màn', () => {
    const { container } = dung({ sessions: 55 });
    expect(container.textContent).not.toMatch(/[{}]/);
  });
});

describe('mục "Đọc biểu đồ" trong khung chỉ in đúng một hình, đúng một dạng', () => {
  function dung(khoi: ReadonlyArray<KhoiBieuDoBai>, dangXem: HinhDangXem | null | undefined) {
    const bai = {
      id: 'thu',
      ten: doan('Thử'),
      moTaNgan: doan('Thử'),
      nhomId: 'fundamentals',
      muc: 'basic',
      bieuDo: { khoi },
      ketQuaTrong: [],
      thongSo: {},
      mucCo: ['doc-bieu-do'],
      lienQuan: [],
    } satisfies BaiHuongDan;

    return render(
      <PreferencesProvider>
        {dangXem === undefined ? (
          <GuideMuc bai={bai} muc="doc-bieu-do" />
        ) : (
          <GuideMuc bai={bai} muc="doc-bieu-do" idPrefix="goi-y-" hinh={dangXem} />
        )}
      </PreferencesProvider>,
    );
  }

  it('dạng Cột đang chọn thì chỉ in đoạn của dạng Cột', () => {
    dung([GIA, THOI_GIAN], hinh('price', 'cot'));

    expect(screen.getByRole('heading', { level: 3, name: 'P/E theo Giá thị trường' })).toBeTruthy();
    expect(screen.getByText('Đoạn cột của hình theo giá.')).toBeTruthy();
    expect(screen.queryByText('Đoạn đường của hình theo giá.')).toBeNull();
    expect(screen.queryByText('SMA theo thời gian')).toBeNull();
    // Không có mục gập nào trong khung: ở đây chỉ có một hình, không có gì để gập.
    expect(document.querySelector('details')).toBeNull();
  });

  it('hình bóc tách in đoạn của các thanh, không in nhãn Đường hay Cột', () => {
    dung([BOC_TACH, GIA], hinh('__breakdown'));

    expect(screen.getByText('Đoạn của các thanh bóc tách.')).toBeTruthy();
    expect(screen.queryByText('Dạng Đường')).toBeNull();
    expect(screen.queryByText('Dạng Cột')).toBeNull();
  });

  /*
   * Dòng "Chỉ vẽ sau khi đã nạp…" chỉ đúng khi hình đang được tả CHƯA có trên màn. Hình cần chuỗi giá
   * mà đã vẽ rồi thì in dòng ấy là nói một điều người đọc đang thấy là sai.
   */
  it('dòng điều kiện chỉ in khi hình cần chuỗi giá mà chưa vẽ', () => {
    dung([THOI_GIAN, SO_PHIEN], hinh(null, 'duong', false));
    expect(screen.getByText('Chỉ vẽ sau khi đã nạp mã cổ phiếu hoặc chuỗi giá.')).toBeTruthy();
    cleanup();

    dung([THOI_GIAN, SO_PHIEN], hinh('__time', 'duong', true));
    expect(screen.queryByText('Chỉ vẽ sau khi đã nạp mã cổ phiếu hoặc chuỗi giá.')).toBeNull();
    cleanup();

    // Hình vẽ được ngay thì không bao giờ có dòng ấy, kể cả khi khối Biểu đồ chưa kịp báo.
    dung([GIA, THOI_GIAN], null);
    expect(screen.queryByText('Chỉ vẽ sau khi đã nạp mã cổ phiếu hoặc chuỗi giá.')).toBeNull();
  });

  /*
   * Trang đầy đủ không truyền `hinh` — ở đó không có biểu đồ nào đang hiện — nên mọi hình đều có
   * mặt, mỗi hình một mục gập, và chỉ hình đầu (hình màn mở ra) mở sẵn.
   */
  it('không có hình đang hiện (trang đầy đủ) thì mọi hình có mặt, hình đầu mở sẵn', () => {
    dung([GIA, THOI_GIAN, BOC_TACH], undefined);

    const muc = [...document.querySelectorAll('details')];
    expect(muc.map((mot) => mot.querySelector('summary h3')?.textContent)).toEqual([
      'P/E theo Giá thị trường',
      'SMA theo thời gian',
      'EV — bóc tách',
    ]);
    expect(muc.map((mot) => mot.open)).toEqual([true, false, false]);
    // Trang in cả hai dạng của mỗi hình đường.
    expect(screen.getByText('Đoạn đường của hình theo giá.')).toBeTruthy();
    expect(screen.getByText('Đoạn cột của hình theo giá.')).toBeTruthy();
  });
});
