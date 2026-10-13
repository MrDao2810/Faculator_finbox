import { describe, expect, it } from 'vitest';

import { dateTextOf, isIsoDay, parseDateText, settledDateValue, typedDateValue } from './date-text';
import { formatIsoDate } from './format';

/*
 * Ngày 3 tháng 10 năm 2026 — đúng ngày chủ dự án chụp (13/10/2026): cột "Ngày mua" in
 * `03/10/2026`, ô sửa in `10/03/2026`. Chọn nó cho mọi ca vì đây là loại ngày mà hai thứ tự
 * ngày/tháng và tháng/ngày đọc ra HAI NGÀY CÓ THẬT khác nhau; với ngày 25 tháng 10 thì thứ tự sai
 * tự lộ ra là tháng 25, không cần ca kiểm nào bắt.
 */
const ISO = '2026-10-03';
const CHU = '03/10/2026';

describe('parseDateText — đọc ngày gõ tay theo lối Việt Nam', () => {
  it('ngày/tháng/năm: 03/10 là ngày 3 tháng 10, không phải 10 tháng 3', () => {
    expect(parseDateText(CHU)).toBe(ISO);
    expect(parseDateText(CHU)).not.toBe('2026-03-10');
  });

  it('nhận đúng các lối viết mà cột Ngày của bảng dữ liệu nhận', () => {
    for (const cach of ['3/10/2026', '03-10-2026', '03.10.2026', '2026-10-03', ' 03/10/2026 ']) {
      expect(parseDateText(cach), cach).toBe(ISO);
    }
  });

  /* Bàn phím số của điện thoại không có phím '/'. */
  it('tám chữ số liền đọc theo ngày-tháng-năm', () => {
    expect(parseDateText('03102026')).toBe(ISO);
  });

  it('thiếu năm thì chưa phải một ngày — không tự suy ra năm', () => {
    expect(parseDateText('03/10')).toBeNull();
    expect(parseDateText('0310')).toBeNull();
  });

  it('chuỗi gõ dở, chữ tự do và ô trống đều là null chứ không phải một ngày nào đó', () => {
    for (const rac of ['', '03/1', '03/10/20', '03/10/202', 'hôm qua', '1', '2026']) {
      expect(parseDateText(rac), `'${rac}'`).toBeNull();
    }
  });

  /*
   * Vế đắt nhất. V8 đọc '2026-02-31' thành ngày 3 tháng 3 chứ không báo lỗi, nên một ngày gõ nhầm
   * lọt qua đây sẽ thành một ngày KHÁC ở `xirr()`. Ô `type="date"` cũ không cho gõ ra ngày như vậy.
   */
  it('ngày không có trên lịch bị từ chối', () => {
    for (const sai of ['31/02/2026', '30/02/2024', '31/04/2026', '32/01/2026', '00/01/2026']) {
      expect(parseDateText(sai), sai).toBeNull();
    }
    expect(parseDateText('15/13/2026')).toBeNull();
    expect(parseDateText('15/00/2026')).toBeNull();
  });

  it('29 tháng 2 chỉ có ở năm nhuận, kể cả luật trăm năm', () => {
    expect(parseDateText('29/02/2024')).toBe('2024-02-29');
    expect(parseDateText('29/02/2026')).toBeNull();
    expect(parseDateText('29/02/2000')).toBe('2000-02-29');
    expect(parseDateText('29/02/1900')).toBeNull();
  });
});

describe('isIsoDay — cửa của nơi tính', () => {
  it('đúng dạng VÀ có trên lịch', () => {
    expect(isIsoDay(ISO)).toBe(true);
    expect(isIsoDay('2026-02-31')).toBe(false);
  });

  it('chuỗi kiểu Việt, chuỗi thiếu số 0 và ô trống đều không qua', () => {
    for (const khong of [CHU, '2026-10-3', '2026-1-03', '', ' 2026-10-03']) {
      expect(isIsoDay(khong), `'${khong}'`).toBe(false);
    }
  });
});

describe('dateTextOf — chữ in trong ô', () => {
  it('ngày ISO in ra đúng chuỗi mà formatIsoDate in ở cột của bảng', () => {
    expect(dateTextOf(ISO)).toBe(CHU);
    expect(dateTextOf(ISO)).toBe(formatIsoDate(ISO));
  });

  /* Chuỗi hỏng đọc lên từ kho phải HIỆN ra để người dùng sửa, không được thành ô trống. */
  it('thứ không phải ngày ISO thì in nguyên xi', () => {
    for (const nguyen of ['', '03/1', 'hôm qua', '03102026']) {
      expect(dateTextOf(nguyen)).toBe(nguyen);
    }
  });
});

describe('typedDateValue — giá trị trong lúc gõ', () => {
  it('chữ đã đúng y dạng ngày/tháng/năm thì thành ISO', () => {
    expect(typedDateValue(CHU)).toBe(ISO);
  });

  /*
   * Gõ dở thì giữ chữ. Đổi sang ISO sớm hơn là chữ in ra khác chữ vừa gõ, React ghi đè nội dung ô
   * và con trỏ văng về cuối.
   */
  it('mọi lối viết khác giữ nguyên chữ, chờ tới lúc rời ô', () => {
    for (const dangGo of ['0', '03/1', '03/10/202', '3/10/2026', '03-10-2026', '03102026']) {
      expect(typedDateValue(dangGo), dangGo).toBe(dangGo);
    }
  });

  it('chữ in ra của giá trị vừa nhận luôn bằng đúng chữ vừa gõ', () => {
    for (const go of ['0', '03/', '03/10/2026', '3/10/2026', '31/02/2026', '03102026']) {
      expect(dateTextOf(typedDateValue(go)), go).toBe(go);
    }
  });
});

describe('settledDateValue — giá trị lúc rời ô', () => {
  it('mọi lối viết đọc được đều về ISO', () => {
    for (const cach of ['3/10/2026', '03-10-2026', '03102026', '2026-10-03', CHU, ' 03/10/2026 ']) {
      expect(settledDateValue(cach), cach).toBe(ISO);
    }
  });

  it('không đọc được thì giữ chữ đã gõ, không xoá trắng và không đoán', () => {
    expect(settledDateValue('03/1')).toBe('03/1');
    expect(settledDateValue('31/02/2026')).toBe('31/02/2026');
    expect(settledDateValue('')).toBe('');
  });

  it('giá trị đã là ISO thì đứng yên', () => {
    expect(settledDateValue(ISO)).toBe(ISO);
  });
});
